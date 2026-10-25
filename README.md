---
type: resource
course: Personal - Python and SQL
scope: Academia HQ
last_updated: 2026-10-24
---

# Python Practice Site

A personal Python practice site: short lessons, exercises that run and grade in the browser, and a spaced review queue. The plan behind it is in `coding-site-proposal.md`, which is kept outside this repo. The site's home page is [docs/index.md](docs/index.md).

**Live site:** https://w-ducdoan.github.io/python-practice/ (source: https://github.com/w-ducdoan/python-practice)

**Status (2026-10-24):** Modules 0-5 are written (132 graded exercises). Module 5 runs real pandas and NumPy in the browser (Pyodide 0.26.4 ships pandas 2.2.0 and NumPy 1.26.4). Python runs in a background worker with a 10-second limit per run. Module 6 (cleaning and reshaping) comes next.

## Run it on your laptop

From this folder, first time only:

```bash
python -m venv .venv
```

```bash
.venv/Scripts/python -m pip install -r requirements.txt
```

Then, every time:

```bash
.venv/Scripts/mkdocs serve
```

Open http://127.0.0.1:8000. The site reloads as you edit files.

## What's where

| Path | What it is |
| :-- | :-- |
| `docs/` | Every page of the site, as Markdown. Lessons live in `docs/module-N/` |
| `docs/assets/exercise.js` | The exercise widget: editor, Run/Check, hints, progress, review queue, home dashboard |
| `docs/assets/py-worker.js` | Runs Python (Pyodide) in a background worker, plus the test harness the exercises use |
| `docs/assets/exercise.css` | Styling for the widget: IDE-style panels, console, PASS/FAIL badges, dashboard tiles |
| `docs/assets/theme.css` | Site theme: dark by default, colors for both modes, header and headings |
| CodeMirror 5.65.16 (CDN, in `mkdocs.yml`) | The code editor: syntax coloring, line numbers, Python indenting. If it fails to load, the widget falls back to a plain text box |
| `docs/data/` | Practice datasets (CSV), made by the script below. Exercises can open them, and learners can download them |
| `docs/notebooks/` | Downloadable Jupyter notebooks for the local work, starting with Module 4 |
| `hooks/catalog.py` | Collects every exercise into `catalog.json` at build time, for the dashboard |
| `scripts/make_datasets.py` | Regenerates `docs/data/`. Seeded, so the output is always the same |
| `scripts/check_exercises.py` | Confirms every solution passes and every starter fails. Run it with `.venv-check/Scripts/python` (see below) before publishing |
| `mkdocs.yml` | Site settings and the navigation menu |

## Checking exercises

Modules 0-4 need only the standard library. Module 5 onward needs pandas, kept in a separate environment that mirrors the browser (pandas 2.x) so the site's build environment stays small. First time only:

```bash
py -3.13 -m venv .venv-check
```

```bash
.venv-check/Scripts/python -m pip install -r requirements-check.txt
```

Then, after writing or changing exercises:

```bash
.venv-check/Scripts/python scripts/check_exercises.py
```

The browser runs pandas 2.2.0 and NumPy 1.26.4. The checker runs pandas 2.2.3 and NumPy 2.x, which are close but not identical, so spot-check new pandas exercises in the browser too.

## Writing an exercise

Put a fenced block with the language `exercise` in any lesson:

````text
```exercise
id: m2-covenant
title: Covenant test function
--- starter
def covenant_test(debt, ebitda, max_lev):
    pass
--- tests
check(covenant_test(500, 100, 5.25) is True, "5.0x is within a 5.25x max")
--- hint
Leverage is debt / ebitda.
--- solution
def covenant_test(debt, ebitda, max_lev):
    return debt / ebitda <= max_lev
```
````

- `id` must be unique across the site. The build fails if two match.
- Header options: `checkpoint: yes` (no hints, solution locked until passed), `kind: example` (an ungraded "Try it" box), and `files: trades.csv, loan_tape.csv` (copies those files from `docs/data/` into Python's working folder before every run, fresh each time), and `packages: pandas` or `packages: numpy` (loads them into Pyodide before the run. Download time doesn't count toward the 10-second limit).
- Tests can use `check(condition, message)`, `approx(a, b, tol=0.01)`, `output` (everything printed) and `code` (the learner's code as text), plus any variable or function the learner's code created.
- `rerun("leverage = 5.6", "leverage = 3.0")` runs the learner's code again with that input line swapped and returns its variables as a dict. Use it so that answers that only work for one hard-coded input fail. Tell the learner to keep the input lines as given.
- The harness lives in `docs/assets/py-worker.js` and is mirrored in `scripts/check_exercises.py`. Change both together.
- Add new pages to `nav:` in `mkdocs.yml`.
- Run `python scripts/check_exercises.py` after writing exercises.

## Known limits (MVP)

- **10-second run limit.** Python runs in a Web Worker, so a `while True:` can't freeze the tab. After 10 seconds the worker is stopped, and Python reloads (about 10 seconds) on the next Run. Raise `RUN_TIMEOUT_MS` in `exercise.js` if a later module has legitimately slow work, such as a big Monte Carlo.
- **Review items reuse the same exercise.** Review mode opens a fresh editor, but the numbers are the same. Randomized variants are a later addition.
- **One missed Check during a review counts as a lapse,** even if it was a typo. That's the strict Leitner rule. Loosen it if it feels punishing in practice.
- **Progress lives in one browser.** Use Export/Import on the Home page.
- **Publishing.** The site is public on GitHub Pages. After changing anything, commit and `git push` the source, then run `.venv/Scripts/mkdocs gh-deploy --force --strict` to rebuild the live site (about a minute to go live). Commits use the GitHub no-reply email set in this repo's git config, because GitHub blocks pushes that expose the private address.
- **Material for MkDocs reaches end of life on May 5, 2027** (security fixes until then). Its successor, Zensical, reads the same `mkdocs.yml`, so migrating later should be small.
