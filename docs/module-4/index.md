---
type: lesson-index
workstation: Academia HQ
last_updated: 2026-10-24
---

# Module 4 - Errors, files and Jupyter

[Back to Home](../index.md)

**Objective:** make code survive messy real-world input, read and write CSV files, and run Python on your own laptop in a Jupyter notebook, the setup the CFA module and analyst work both assume.

**Time:** about 2.5 hours, over three or four sessions. Lesson 4.3 is a one-time setup on your laptop (about 30 minutes).

| Lesson | What you learn |
| :-- | :-- |
| [4.1 Handling errors](4-1-errors.md) | `try` / `except`, catching specific errors, `raise` for bad inputs |
| [4.2 Reading and writing files](4-2-files.md) | `open` with `with`, the `csv` module, `DictReader`, writing a CSV |
| [4.3 Python on your laptop](4-3-setup.md) | Install Python and VS Code, create a project, run your first Jupyter notebook |
| [4.4 Capstone - trade blotter](4-4-capstone.md) | Clean a messy trade file: skip and log bad rows, then total and net the trades |
| [Checkpoint 4](checkpoint.md) | Prove it: a percent parser and a messy loan-tape total, no hints |

From here on, some exercises open the site's practice files: `trades.csv` and `loan_tape.csv`. They're simulated data with problems planted on purpose, the kind real files have. You can also [download trades.csv](../data/trades.csv) and [loan_tape.csv](../data/loan_tape.csv) to open them in Excel and see what you're dealing with.

**Optional reading:** CS50P Lectures 3 (exceptions) and 6 (file I/O) at [cs50.harvard.edu/python](https://cs50.harvard.edu/python/), and the files and CSV chapters of *Automate the Boring Stuff* at [automatetheboringstuff.com](https://automatetheboringstuff.com/).
