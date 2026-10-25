// Runs Python (Pyodide) in a background Web Worker, separate from the page.
//
// exercise.js sends code here and waits for the answer. Because Python runs off
// the page, a loop that never ends can't freeze the tab: exercise.js stops this
// worker after a time limit and starts a fresh one.
//
// Messages in:  {type: "load", indexURL, dataURL}  then  {type: "call", id, fn, args, files, packages}
// Messages out: {type: "ready"} | {type: "load-error", message} | {type: "started", id} | {type: "result", id, json}

const HARNESS = `
import builtins, sys, io, json, traceback

def _no_input(*args):
    raise RuntimeError("input() isn't available in exercises. Store the value in a variable instead.")

builtins.input = _no_input

def _where(exc):
    if isinstance(exc, SyntaxError):
        return exc.lineno
    line = None
    for frame, lineno in traceback.walk_tb(exc.__traceback__):
        if frame.f_code.co_filename == "<your code>":
            line = lineno
    return line

def _friendly(exc):
    line = _where(exc)
    text = "".join(traceback.format_exception_only(type(exc), exc)).strip()
    if isinstance(exc, SyntaxError):
        text = f"{type(exc).__name__}: {exc.msg}"
    return (f"Line {line}: " if line else "") + text

def _run_user(code):
    buf = io.StringIO()
    ns = {"__name__": "__main__"}
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        exec(compile(code, "<your code>", "exec"), ns)
    except Exception as exc:
        err = _friendly(exc)
    finally:
        sys.stdout = old
    return ns, buf.getvalue(), err

def _run(code):
    ns, out, err = _run_user(code)
    return json.dumps({"output": out, "error": err})

def _check(code, tests):
    ns, out, err = _run_user(code)
    if err:
        return json.dumps({"output": out, "error": err, "results": [
            [False, "Your code stopped with an error, so the tests could not run. Fix the error first."]]})
    results = []
    def check(condition, message):
        results.append([bool(condition), message])
    def approx(a, b, tol=0.01):
        try:
            return abs(a - b) <= tol
        except TypeError:
            return False
    def rerun(old, new):
        # Run the learner's code again with one input line swapped, e.g.
        # rerun("leverage = 5.6", "leverage = 3.0"), and return its variables.
        if old not in code:
            raise ValueError(f"keep the line '{old}' exactly as given, so the tests can try other inputs")
        ns2 = {"__name__": "__main__"}
        exec(compile(code.replace(old, new, 1), "<your code>", "exec"), ns2)
        return ns2
    env = dict(ns)
    env.update(check=check, approx=approx, output=out, code=code, rerun=rerun)
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf  # keep prints from functions the tests call out of the way
    try:
        exec(tests, env)
    except NameError as exc:
        results.append([False, f"The tests looked for '{exc.name}', but your code never creates it. Check the spelling."])
    except ValueError as exc:
        results.append([False, str(exc)])
    except Exception as exc:
        results.append([False, f"A test could not run: {_friendly(exc)}"])
    finally:
        sys.stdout = old
    return json.dumps({"output": out, "error": None, "results": results})
`;

let pyodide = null;
let dataURL = null;
const fileCache = {};   // file name -> text, downloaded once per worker

// Put the practice CSVs an exercise asks for into Python's in-browser file system.
// They're rewritten before every run, so an exercise that overwrites or deletes a
// file can't break the next run.
async function provideFiles(names) {
  for (const name of names) {
    if (!(name in fileCache)) {
      const response = await fetch(dataURL + name);
      if (!response.ok) throw new Error("Could not load the practice file " + name);
      fileCache[name] = await response.text();
    }
    pyodide.FS.writeFile(name, fileCache[name]);
  }
}

self.onmessage = async function (e) {
  const msg = e.data;
  if (msg.type === "load") {
    try {
      importScripts(msg.indexURL + "pyodide.js");
      pyodide = await loadPyodide({ indexURL: msg.indexURL });
      dataURL = msg.dataURL;
      pyodide.runPython(HARNESS);
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "load-error", message: "Could not load Python. Check your connection and try again." });
    }
  } else if (msg.type === "call") {
    try {
      await provideFiles(msg.files || []);
      if (msg.packages && msg.packages.length) {
        await pyodide.loadPackage(msg.packages);   // already-loaded packages return immediately
      }
    } catch (err) {
      self.postMessage({ type: "result", id: msg.id, json: JSON.stringify({
        output: "", error: err.message, results: [[false, err.message]] }) });
      return;
    }
    self.postMessage({ type: "started", id: msg.id });   // the run timer starts now
    const fn = pyodide.globals.get(msg.fn);
    try {
      self.postMessage({ type: "result", id: msg.id, json: fn(...msg.args) });
    } catch (err) {
      self.postMessage({ type: "result", id: msg.id, json: JSON.stringify({
        output: "", error: "Internal error: " + err.message, results: [[false, "The checker itself failed. Try again."]] }) });
    } finally {
      fn.destroy();
    }
  }
};
