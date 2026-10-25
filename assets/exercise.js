// Exercise widget, progress tracking and review queue.
//
// Lessons contain fenced blocks like:
//
//   ```exercise
//   id: m1-fv
//   title: Future value
//   --- starter
//   (code the editor starts with)
//   --- tests
//   check(fv == 110, "fv should be 110")
//   --- hint
//   (one hint per "--- hint" section, revealed in order)
//   --- solution
//   (model answer)
//   ```
//
// This script turns each block into an editor with Run / Check buttons.
// Python runs in the browser through Pyodide, inside py-worker.js. Progress lives in localStorage.

(function () {
  "use strict";

  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const STORAGE_KEY = "pp-progress-v1";
  // Days until an item comes back, by review box (box 1 = just learned).
  const INTERVALS = [2, 7, 21, 60, 120];

  // ---------- Progress storage ----------

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage blocked or corrupt: start fresh */ }
    return { exercises: {} };
  }

  function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch (e) { /* storage blocked: progress lasts for this page only */ }
  }

  // Dates are local calendar days as "YYYY-MM-DD", so reviews flip at your midnight, not UTC's.
  function isoLocal(d) {
    const pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function today() {
    return isoLocal(new Date());
  }

  function addDays(isoDate, days) {
    const parts = isoDate.split("-").map(Number);
    return isoLocal(new Date(parts[0], parts[1] - 1, parts[2] + days));
  }

  function isDue(entry) {
    return entry && entry.passed && entry.due <= today();
  }

  function entryFor(progress, id) {
    if (!progress.exercises[id]) {
      progress.exercises[id] = { passed: false, attempts: 0, box: 0, due: null };
    }
    return progress.exercises[id];
  }

  // Called after every Check. Moves the item between review boxes.
  function recordResult(id, passed) {
    const progress = loadProgress();
    const entry = entryFor(progress, id);
    entry.attempts += 1;
    if (passed) {
      if (!entry.passed) {
        entry.passed = true;
        entry.firstPassed = today();
        entry.box = 1;
      } else if (entry.due <= today()) {
        entry.box = entry.box === 0 ? 1 : Math.min(entry.box + 1, INTERVALS.length);
      } else {
        saveProgress(progress);
        return entry; // extra practice before it is due: no change to the schedule
      }
      entry.due = addDays(today(), INTERVALS[entry.box - 1]);
    } else if (isDue(entry)) {
      entry.box = 0; // missed a review: it starts over once you pass it again
    }
    saveProgress(progress);
    return entry;
  }

  function saveCode(id, code) {
    const progress = loadProgress();
    entryFor(progress, id).lastCode = code;
    saveProgress(progress);
  }

  // ---------- Python, in a background worker ----------
  // Python runs in py-worker.js, off the page, so a loop that never ends can't
  // freeze the tab. If a run takes longer than RUN_TIMEOUT_MS, the worker is
  // stopped and a fresh one loads on the next Run.

  const RUN_TIMEOUT_MS = 10000;
  // Must be read now: document.currentScript is only set while this file first runs.
  const WORKER_URL = new URL("py-worker.js", document.currentScript.src).href;
  // Practice CSVs (docs/data/) that exercises can open with a "files:" header line.
  const DATA_URL = new URL("../data/", document.currentScript.src).href;

  let worker = null;
  let workerReady = null;    // resolves once Python has loaded in the worker
  let pythonLoaded = false;
  let nextCallId = 1;
  const pendingCalls = {};

  function stopWorker(reason) {
    if (worker) worker.terminate();
    worker = null;
    workerReady = null;
    pythonLoaded = false;
    loadedPackages = new Set();
    Object.keys(pendingCalls).forEach(function (id) {
      pendingCalls[id].reject(new Error(reason));
      delete pendingCalls[id];
    });
  }

  function pythonReady() {
    if (!workerReady) {
      worker = new Worker(WORKER_URL);
      workerReady = new Promise(function (resolve, reject) {
        worker.onmessage = function (e) {
          const msg = e.data;
          if (msg.type === "ready") {
            pythonLoaded = true;
            resolve();
          } else if (msg.type === "load-error") {
            reject(new Error(msg.message));
          } else if (msg.type === "started" && pendingCalls[msg.id]) {
            pendingCalls[msg.id].started();
          } else if (msg.type === "result" && pendingCalls[msg.id]) {
            pendingCalls[msg.id].resolve(JSON.parse(msg.json));
            delete pendingCalls[msg.id];
          }
        };
        worker.onerror = function () { reject(new Error("Python could not start. Reload the page and try again.")); };
      });
      workerReady.catch(function () { stopWorker("Python could not start."); });
      worker.postMessage({ type: "load", indexURL: PYODIDE_URL, dataURL: DATA_URL });
    }
    return workerReady;
  }

  // Packages (pandas, numpy) the current worker has already loaded.
  let loadedPackages = new Set();
  // Downloading pandas can take a while on a slow connection; that wait doesn't count
  // toward RUN_TIMEOUT_MS, but give up if it takes longer than this.
  const PREPARE_TIMEOUT_MS = 120000;

  async function callPython(fnName, args, files, packages) {
    await pythonReady();
    const id = nextCallId++;
    return new Promise(function (resolve, reject) {
      let timer = setTimeout(function () {
        delete pendingCalls[id];
        stopWorker("Stopped.");
        reject(new Error("Loading Python packages took too long. Check your connection and try again."));
      }, PREPARE_TIMEOUT_MS);
      pendingCalls[id] = {
        // The worker says "started" once files and packages are ready and your code begins.
        started: function () {
          clearTimeout(timer);
          (packages || []).forEach(function (name) { loadedPackages.add(name); });
          timer = setTimeout(function () {
            delete pendingCalls[id]; // reject below with the clearer message, not stopWorker's
            stopWorker("Stopped.");
            reject(new Error("Your code ran for more than " + RUN_TIMEOUT_MS / 1000 + " seconds, so it was stopped. " +
              "Look for a loop that never ends. Python reloads on your next Run."));
          }, RUN_TIMEOUT_MS);
        },
        resolve: function (value) { clearTimeout(timer); resolve(value); },
        reject: function (err) { clearTimeout(timer); reject(err); },
      };
      worker.postMessage({ type: "call", id: id, fn: fnName, args: args, files: files || [], packages: packages || [] });
    });
  }

  // ---------- Parsing exercise blocks ----------

  function parseBlock(text) {
    const parts = text.split(/^--- *(\w+) *$/m);
    const spec = { hints: [], starter: "", tests: "", solution: "" };
    parts[0].split("\n").forEach(function (line) {
      const i = line.indexOf(":");
      if (i > 0) spec[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    for (let i = 1; i < parts.length; i += 2) {
      const body = parts[i + 1].replace(/^\n/, "").replace(/\s+$/, "");
      if (parts[i] === "hint") spec.hints.push(body);
      else spec[parts[i]] = body;
    }
    spec.checkpoint = spec.checkpoint === "yes";
    spec.files = spec.files ? spec.files.split(",").map(function (f) { return f.trim(); }).filter(Boolean) : [];
    spec.packages = spec.packages ? spec.packages.split(",").map(function (p) { return p.trim(); }).filter(Boolean) : [];
    return spec;
  }

  // ---------- Building the widget ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fitHeight(textarea) {
    const lines = textarea.value.split("\n").length;
    textarea.rows = Math.max(4, Math.min(lines + 1, 30));
  }

  function statusLabel(entry) {
    if (!entry || !entry.passed) return "Not passed yet";
    if (entry.box === 0) return "Missed on review: pass it again";
    if (isDue(entry)) return "Due for review";
    return "Passed - next review " + entry.due;
  }

  // CSS class that colors the status pill to match statusLabel.
  function statusClass(entry) {
    if (!entry || !entry.passed) return "pp-status";
    if (entry.box === 0) return "pp-status pp-st-miss";
    if (isDue(entry)) return "pp-status pp-st-due";
    return "pp-status pp-st-pass";
  }

  // ---------- Code editor ----------
  // CodeMirror (loaded from the CDN in mkdocs.yml) when it is available, otherwise a
  // plain textarea with the same keys. Both return { getValue, setValue }.

  function makeEditor(parent, value, on) {
    if (window.CodeMirror) return makeCodeMirror(parent, value, on);
    return makeTextarea(parent, value, on);
  }

  function makeCodeMirror(parent, value, on) {
    const cm = window.CodeMirror(parent, {
      value: value,
      mode: "python",
      theme: "pp",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      screenReaderLabel: "Code editor",
      extraKeys: {
        "Tab": function (cm) {
          if (cm.somethingSelected()) cm.indentSelection("add");
          else cm.replaceSelection("    ", "end");
        },
        "Shift-Tab": "indentLess",
        "Ctrl-Enter": on.run,
        "Cmd-Enter": on.run,
        "Shift-Ctrl-Enter": on.check,
        "Shift-Cmd-Enter": on.check,
        // Backspace in leading spaces removes one 4-space indent at a time.
        "Backspace": function (cm) {
          if (cm.somethingSelected()) return window.CodeMirror.Pass;
          const cur = cm.getCursor();
          const before = cm.getLine(cur.line).slice(0, cur.ch);
          if (cur.ch >= 4 && cur.ch % 4 === 0 && /^ +$/.test(before)) {
            cm.replaceRange("", { line: cur.line, ch: cur.ch - 4 }, cur);
          } else {
            return window.CodeMirror.Pass;
          }
        },
      },
    });
    cm.on("change", on.change);
    cm.on("focus", function once() { cm.off("focus", once); on.focus(); });
    // Web fonts can finish loading after the editor measures itself, which misplaces the cursor.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cm.refresh(); });
    return {
      getValue: function () { return cm.getValue(); },
      setValue: function (text) { cm.setValue(text); },
    };
  }

  function makeTextarea(parent, value, on) {
    const editor = el("textarea", "pp-editor");
    editor.spellcheck = false;
    editor.setAttribute("aria-label", "Code editor");
    editor.value = value;
    fitHeight(editor);
    parent.appendChild(editor);

    editor.addEventListener("focus", on.focus, { once: true });
    editor.addEventListener("input", function () {
      fitHeight(editor);
      on.change();
    });
    editor.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const start = editor.selectionStart;
        editor.setRangeText("    ", start, editor.selectionEnd, "end");
        on.change();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) on.check(); else on.run();
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Keep the current indentation, and add 4 spaces after a line ending in ":".
        e.preventDefault();
        const before = editor.value.slice(0, editor.selectionStart);
        const line = before.slice(before.lastIndexOf("\n") + 1);
        let indent = line.match(/^ */)[0];
        if (/:\s*$/.test(line)) indent += "    ";
        editor.setRangeText("\n" + indent, editor.selectionStart, editor.selectionEnd, "end");
        fitHeight(editor);
        on.change();
      } else if (e.key === "Backspace" && editor.selectionStart === editor.selectionEnd) {
        // Backspace in leading spaces removes one 4-space indent at a time.
        const pos = editor.selectionStart;
        const before = editor.value.slice(0, pos);
        const line = before.slice(before.lastIndexOf("\n") + 1);
        if (line.length >= 4 && /^ +$/.test(line) && line.length % 4 === 0) {
          e.preventDefault();
          editor.setRangeText("", pos - 4, pos, "end");
          on.change();
        }
      }
    });
    return {
      getValue: function () { return editor.value; },
      setValue: function (text) { editor.value = text; fitHeight(editor); },
    };
  }

  function buildWidget(container, spec) {
    const params = new URLSearchParams(window.location.search);
    const reviewMode = params.get("review") === spec.id;
    // "kind: example" blocks are ungraded: Run and Reset only, never tracked.
    const isExample = spec.kind === "example";
    const entry = isExample ? null : loadProgress().exercises[spec.id];

    const box = el("div", "pp-exercise" + (spec.checkpoint ? " pp-checkpoint" : "") + (isExample ? " pp-example" : ""));
    box.id = spec.id;

    const head = el("div", "pp-head");
    const titleWrap = el("div", "pp-title-wrap");
    titleWrap.appendChild(el("span", "pp-kind", isExample ? "Try it" : spec.checkpoint ? "Checkpoint" : "Exercise"));
    titleWrap.appendChild(el("span", "pp-title", spec.title || spec.id));
    head.appendChild(titleWrap);
    const status = el("span", isExample ? "pp-status" : statusClass(entry),
      isExample ? "Not graded" : statusLabel(entry));
    head.appendChild(status);
    box.appendChild(head);

    if (reviewMode) {
      box.appendChild(el("p", "pp-note", "Review: start from a blank slate and solve it again without looking back at the lesson."));
    }

    const editorHost = el("div", "pp-editor-host");
    box.appendChild(editorHost);
    const editor = makeEditor(editorHost,
      (!reviewMode && entry && entry.lastCode) ? entry.lastCode : spec.starter, {
        run: function () { runBtn.click(); },
        check: function () { if (!isExample) checkBtn.click(); },
        change: function () { if (!isExample) saveCode(spec.id, editor.getValue()); },
        focus: function () { pythonReady().catch(function () {}); },
      });

    const buttons = el("div", "pp-buttons");
    const runBtn = el("button", "pp-btn pp-run", "Run");
    const checkBtn = el("button", "pp-btn pp-primary", "Check");
    const hintBtn = el("button", "pp-btn", "Hint");
    const solBtn = el("button", "pp-btn", "Show solution");
    const resetBtn = el("button", "pp-btn pp-quiet", "Reset code");
    buttons.appendChild(runBtn);
    if (!isExample) buttons.appendChild(checkBtn);

    // Checkpoints prove you can do it alone: no hints, solution only after passing.
    if (!isExample && !spec.checkpoint && spec.hints.length) buttons.appendChild(hintBtn);
    if (!isExample && spec.solution) buttons.appendChild(solBtn);
    buttons.appendChild(resetBtn);
    const shortcut = el("span", "pp-shortcut");
    shortcut.innerHTML = "<kbd>Ctrl</kbd>+<kbd>Enter</kbd> run" +
      (isExample ? "" : " &middot; <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> check");
    buttons.appendChild(shortcut);
    box.appendChild(buttons);

    const hintsArea = el("div", "pp-hints");
    const output = el("pre", "pp-output");
    output.hidden = true;
    const results = el("ul", "pp-results");
    const solution = el("pre", "pp-solution cm-s-pp");
    solution.dataset.label = "Solution";
    solution.hidden = true;
    box.append(hintsArea, output, results, solution);

    let hintsShown = 0;
    let attempted = !!(entry && entry.attempts);

    function updateSolutionButton() {
      const current = loadProgress().exercises[spec.id];
      if (spec.checkpoint) {
        solBtn.disabled = !(current && current.passed);
        solBtn.title = solBtn.disabled ? "Unlocks after you pass the checkpoint" : "";
      } else {
        solBtn.disabled = !attempted;
        solBtn.title = solBtn.disabled ? "Unlocks after your first Check" : "";
      }
    }
    updateSolutionButton();

    function showOutput(text, isError) {
      output.hidden = false;
      output.className = "pp-output" + (isError ? " pp-error" : "");
      output.dataset.label = isError ? "Error" : "Output";
      output.textContent = text;
    }

    async function withPython(button, work) {
      const label = button.textContent;
      button.disabled = true;
      button.textContent = pythonLoaded ? "Running..." : "Loading Python...";
      const needsPackages = spec.packages.some(function (p) { return !loadedPackages.has(p); });
      if (!pythonLoaded) showOutput("Loading Python in your browser. The first time takes about 10 seconds" +
        (spec.packages.length ? ", plus a few more for " + spec.packages.join(" and ") + "." : "."), false);
      else if (needsPackages) showOutput("Loading " + spec.packages.join(" and ") + ". The first time takes a few seconds.", false);
      try {
        await work();
      } catch (e) {
        showOutput(String(e.message || e), true);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    }

    runBtn.addEventListener("click", function () {
      withPython(runBtn, async function () {
        const res = await callPython("_run", [editor.getValue()], spec.files, spec.packages);
        let text = (res.output || "").replace(/\n$/, "");
        if (res.error) text += (text ? "\n" : "") + res.error;
        showOutput(text || "(Your code ran but printed nothing.)", !!res.error);
      });
    });

    checkBtn.addEventListener("click", function () {
      withPython(checkBtn, async function () {
        const res = await callPython("_check", [editor.getValue(), spec.tests], spec.files, spec.packages);
        let text = (res.output || "").replace(/\n$/, "");
        if (res.error) text += (text ? "\n" : "") + res.error;
        if (text) showOutput(text, !!res.error); else output.hidden = true;

        results.innerHTML = "";
        res.results.forEach(function (r) {
          results.appendChild(el("li", r[0] ? "pp-pass" : "pp-fail", r[1]));
        });
        const allPassed = res.results.length > 0 && res.results.every(function (r) { return r[0]; });
        if (allPassed) results.appendChild(el("li", "pp-done", "All " + res.results.length + " tests passed."));

        attempted = true;
        const updated = recordResult(spec.id, allPassed);
        status.textContent = statusLabel(updated);
        status.className = statusClass(updated);
        updateSolutionButton();
        document.dispatchEvent(new CustomEvent("pp-progress"));
      });
    });

    hintBtn.addEventListener("click", function () {
      if (hintsShown >= spec.hints.length) return;
      const hint = el("div", "pp-hint");
      hint.appendChild(el("strong", null, "Hint " + (hintsShown + 1) + " of " + spec.hints.length + ": "));
      hint.appendChild(el("span", null, spec.hints[hintsShown]));
      hintsArea.appendChild(hint);
      hintsShown += 1;
      if (hintsShown >= spec.hints.length) hintBtn.disabled = true;
    });

    solBtn.addEventListener("click", function () {
      solution.hidden = !solution.hidden;
      if (window.CodeMirror && window.CodeMirror.runMode) window.CodeMirror.runMode(spec.solution, "python", solution);
      else solution.textContent = spec.solution;
      solBtn.textContent = solution.hidden ? "Show solution" : "Hide solution";
    });

    resetBtn.addEventListener("click", function () {
      if (!confirm("Replace your code with the starting code?")) return;
      editor.setValue(spec.starter);
      if (!isExample) saveCode(spec.id, editor.getValue());
    });

    container.replaceWith(box);
    if (reviewMode) box.scrollIntoView();
  }

  // ---------- Home page dashboard ----------

  function renderDashboard(root, catalog) {
    const progress = loadProgress();
    const ex = progress.exercises;
    root.innerHTML = "";

    const due = catalog.filter(function (item) { return isDue(ex[item.id]); });

    // Headline stats
    const passedAll = catalog.filter(function (item) { return ex[item.id] && ex[item.id].passed; });
    const pct = catalog.length ? Math.round(100 * passedAll.length / catalog.length) : 0;
    const stats = el("div", "pp-stats");
    [
      [passedAll.length + " / " + catalog.length, "Exercises passed"],
      [pct + "%", "Course complete"],
      [String(due.length), "Reviews due today"],
    ].forEach(function (s) {
      const tile = el("div", "pp-stat");
      tile.append(el("span", "pp-stat-value", s[0]), el("span", "pp-stat-label", s[1]));
      stats.appendChild(tile);
    });
    root.appendChild(stats);

    // Review queue
    const reviewCard = el("div", "pp-card");
    reviewCard.appendChild(el("h3", null, "Review queue (" + due.length + " due)"));
    if (due.length === 0) {
      reviewCard.appendChild(el("p", null, "Nothing due today. Go to the next lesson."));
    } else {
      reviewCard.appendChild(el("p", null, "Do these first, before any new material. Each opens with a fresh editor."));
      const list = el("ul");
      due.forEach(function (item) {
        const li = el("li");
        const a = el("a", null, item.title);
        a.href = item.page + "?review=" + encodeURIComponent(item.id) + "#" + item.id;
        li.append(a, document.createTextNode(" - " + item.page_title + (ex[item.id].box === 0 ? " (missed last time)" : "")));
        list.appendChild(li);
      });
      reviewCard.appendChild(list);
    }
    root.appendChild(reviewCard);

    // Next up
    const next = catalog.find(function (item) { return !(ex[item.id] && ex[item.id].passed); });
    const nextCard = el("div", "pp-card");
    nextCard.appendChild(el("h3", null, "Next up"));
    if (next) {
      const a = el("a", null, next.page_title + ": " + next.title);
      a.href = next.page + "#" + next.id;
      const p = el("p");
      p.appendChild(a);
      nextCard.appendChild(p);
    } else {
      nextCard.appendChild(el("p", null, "You have passed every exercise on the site so far."));
    }
    root.appendChild(nextCard);

    // Module progress
    const modules = [];
    catalog.forEach(function (item) {
      if (modules.indexOf(item.module) === -1) modules.push(item.module);
    });
    const table = el("table", "pp-table");
    const headRow = el("tr");
    ["Module", "Exercises passed", "Checkpoint", "Missed reviews", "Status"].forEach(function (h) {
      headRow.appendChild(el("th", null, h));
    });
    table.appendChild(headRow);
    modules.forEach(function (mod) {
      const items = catalog.filter(function (i) { return i.module === mod; });
      const passed = items.filter(function (i) { return ex[i.id] && ex[i.id].passed; });
      const checkpoints = items.filter(function (i) { return i.checkpoint; });
      const cpPassed = checkpoints.length > 0 && checkpoints.every(function (i) { return ex[i.id] && ex[i.id].passed; });
      const lapsed = items.filter(function (i) { return ex[i.id] && ex[i.id].passed && ex[i.id].box === 0; });
      const mastered = passed.length === items.length && cpPassed && lapsed.length === 0;
      const row = el("tr");
      row.appendChild(el("td", null, mod.replace("module-", "Module ")));
      const passedCell = el("td");
      const bar = el("span", "pp-bar");
      const fill = el("span");
      fill.style.width = Math.round(100 * passed.length / items.length) + "%";
      bar.appendChild(fill);
      passedCell.append(bar, document.createTextNode(passed.length + " / " + items.length));
      row.appendChild(passedCell);
      row.appendChild(el("td", null, cpPassed ? "Passed" : "Not yet"));
      row.appendChild(el("td", null, String(lapsed.length)));
      row.appendChild(el("td", mastered ? "pp-mastered" : null, mastered ? "Mastered" : "In progress"));
      table.appendChild(row);
    });
    const progCard = el("div", "pp-card");
    progCard.appendChild(el("h3", null, "Progress"));
    const tableScroll = el("div", "pp-table-scroll");
    tableScroll.appendChild(table);
    progCard.appendChild(tableScroll);
    progCard.appendChild(el("p", "pp-note",
      "Mastered = every exercise passed, checkpoint passed, and no missed reviews. Move on only when a module is mastered."));
    root.appendChild(progCard);

    // Backup
    const backup = el("div", "pp-card");
    backup.appendChild(el("h3", null, "Backup"));
    backup.appendChild(el("p", null, "Progress is saved in this browser only. Export it now and then, and import it on a new laptop."));
    const exportBtn = el("button", "pp-btn", "Export progress");
    const importBtn = el("button", "pp-btn", "Import progress");
    const fileInput = el("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.hidden = true;
    exportBtn.addEventListener("click", function () {
      const blob = new Blob([JSON.stringify(loadProgress(), null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "python-practice-progress-" + today() + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    importBtn.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      if (!file) return;
      file.text().then(function (text) {
        const data = JSON.parse(text);
        if (!data || typeof data.exercises !== "object") throw new Error("not a progress file");
        if (!confirm("Replace the progress in this browser with the imported file?")) return;
        saveProgress(data);
        renderDashboard(root, catalog);
      }).catch(function (e) { alert("Could not import that file: " + e.message); });
    });
    backup.append(exportBtn, importBtn, fileInput);
    root.appendChild(backup);
  }

  // ---------- Start ----------

  function init() {
    document.querySelectorAll("pre.exercise").forEach(function (container) {
      const code = container.querySelector("code") || container;
      try {
        buildWidget(container, parseBlock(code.textContent));
      } catch (e) {
        console.error("Could not build exercise", e);
      }
    });

    const dash = document.getElementById("pp-dashboard");
    if (dash) {
      fetch(dash.dataset.catalog)
        .then(function (r) { return r.json(); })
        .then(function (catalog) { renderDashboard(dash, catalog); })
        .catch(function () { dash.textContent = "Could not load the exercise list. Rebuild the site and reload."; });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
