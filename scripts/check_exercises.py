"""Check every exercise on the site before publishing.

Run from the project folder:

    python scripts/check_exercises.py

For each graded exercise it confirms two things:
    1. The solution passes all of its tests.
    2. The starter code does NOT pass (otherwise the exercise is free).

The test helpers (check, approx, output, code) mirror the ones the browser
provides in docs/assets/py-worker.js. Keep the two in sync.
"""

import contextlib
import io
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
DATA = DOCS / "data"
BLOCK = re.compile(r"^```exercise\n(.*?)^```", re.MULTILINE | re.DOTALL)
SECTION = re.compile(r"^--- *(\w+) *$", re.MULTILINE)


def parse(block):
    parts = SECTION.split(block)
    spec = {"hints": []}
    for line in parts[0].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            spec[key.strip()] = value.strip()
    for name, body in zip(parts[1::2], parts[2::2]):
        body = body.lstrip("\n").rstrip()
        if name == "hint":
            spec["hints"].append(body)
        else:
            spec[name] = body
    return spec


@contextlib.contextmanager
def sandbox(files):
    """Run inside a fresh temp folder holding copies of the practice files, like the browser does."""
    home = os.getcwd()
    with tempfile.TemporaryDirectory() as folder:
        for name in files:
            shutil.copy(DATA / name, folder)
        os.chdir(folder)
        try:
            yield
        finally:
            os.chdir(home)


def grade(code, tests, files=()):
    """Return (all_passed, messages) the same way the browser does."""
    with sandbox(files):
        return _grade(code, tests)


def _grade(code, tests):
    out = io.StringIO()
    ns = {"__name__": "__main__"}
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, "<your code>", "exec"), ns)
    except Exception as exc:
        return False, [f"code error: {type(exc).__name__}: {exc}"]
    results = []

    def check(condition, message):
        results.append((bool(condition), message))

    def approx(a, b, tol=0.01):
        try:
            return abs(a - b) <= tol
        except TypeError:
            return False

    def rerun(old, new):
        if old not in code:
            raise ValueError(f"keep the line '{old}' exactly as given, so the tests can try other inputs")
        ns2 = {"__name__": "__main__"}
        exec(compile(code.replace(old, new, 1), "<your code>", "exec"), ns2)
        return ns2

    env = dict(ns)
    env.update(check=check, approx=approx, output=out.getvalue(), code=code, rerun=rerun)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(tests, env)
    except Exception as exc:
        results.append((False, f"test error: {type(exc).__name__}: {exc}"))
    passed = bool(results) and all(ok for ok, _ in results)
    return passed, [msg for ok, msg in results if not ok]


def main():
    problems = 0
    count = 0
    for path in sorted(DOCS.rglob("*.md")):
        for block in BLOCK.findall(path.read_text(encoding="utf-8")):
            spec = parse(block)
            if spec.get("kind") == "example":
                continue
            count += 1
            where = f"{path.relative_to(DOCS)} :: {spec['id']}"
            files = [f.strip() for f in spec.get("files", "").split(",") if f.strip()]
            ok, failures = grade(spec.get("solution", ""), spec.get("tests", ""), files)
            if not ok:
                problems += 1
                print(f"FAIL  {where}: solution does not pass -> {failures}")
            starter_ok, _ = grade(spec.get("starter", ""), spec.get("tests", ""), files)
            if starter_ok:
                problems += 1
                print(f"FAIL  {where}: starter code already passes")
    print(f"{count} exercises checked, {problems} problems")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
