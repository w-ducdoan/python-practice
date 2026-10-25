---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 4.3 Python on your laptop

[Module 4](index.md) · about 30 minutes, once

## The idea

The browser has been a sandbox. Real work, the CFA module included, happens in a **Jupyter notebook** on your own machine. A notebook is a document of **cells**: code cells you run one at a time, with the result shown directly underneath, and text cells for notes. Think of it as a model where every step's output is visible as you build.

You'll install three things, once:

| Piece | What it is | Why you need it |
| :-- | :-- | :-- |
| **Python** | The language itself | Runs your code |
| **VS Code** | A free code editor from Microsoft | Opens notebooks, edits scripts, has a built-in terminal |
| **A virtual environment** (`.venv`) | A private folder of packages for one project | Keeps pandas and friends from clashing across projects |

These steps are for Windows. If something doesn't match what you see, check the troubleshooting table at the end.

## Setup

**1. Check for Python, and install it if it's missing.** Open the Start menu, type **Terminal**, and open it. Then run:

```bash
python --version
```

If it prints `Python 3.12` or newer, skip to step 2. Otherwise, download the Windows installer from [python.org/downloads](https://www.python.org/downloads/). On its first screen, **tick "Add python.exe to PATH"**, then choose Install Now. Close the terminal, open a new one, and run the version check again.

**2. Install VS Code** from [code.visualstudio.com](https://code.visualstudio.com/). Open it, click the Extensions icon in the left sidebar (four squares), and install **Python** and **Jupyter**. Both are published by Microsoft.

**3. Make a project folder.** Create a folder such as `Documents\python-practice`. In VS Code, choose **File > Open Folder** and pick it.

**4. Create the virtual environment and install packages.** In VS Code, open **Terminal > New Terminal** and run these two commands one at a time. The second takes a minute or two.

```bash
python -m venv .venv
```

```bash
.venv\Scripts\python -m pip install jupyter pandas matplotlib
```

The first creates a `.venv` folder inside your project. The second installs Jupyter, pandas and matplotlib into it, and nowhere else on your laptop.

**5. Download the starter files into the project folder:**

- [module-4-first-notebook.ipynb](../notebooks/module-4-first-notebook.ipynb)
- [trades.csv](../data/trades.csv)
- [loan_tape.csv](../data/loan_tape.csv)

If a file opens in the browser instead of downloading, right-click the link and choose **Save link as**.

**6. Open the notebook.** Click `module-4-first-notebook.ipynb` in VS Code's file list. At the top right, click **Select Kernel**, then **Python Environments**, and pick the one marked `.venv`. The **kernel** is the Python that runs your cells, and choosing `.venv` means it can see the packages you just installed.

**7. Work through the notebook.** Click into the first code cell and press **Shift+Enter** to run it and move to the next. Section 4 asks you to paste in your `parse_money` from lesson 4.1. When everything passes, do the honest test in section 7: **Restart**, then **Run All**.

## How notebooks behave

- **Order matters, not position.** A cell can use any variable from a cell that has already **run**, wherever that cell sits on the page. Run cells out of order and the notebook can work today but break tomorrow. Restart and Run All catches that.
- **The last line displays itself.** A bare `debt / ebitda` on the last line of a cell shows its value, with no `print` needed. pandas tables display nicely this way.
- **The number next to a cell**, like `[3]`, is the order cells ran in. Gaps or jumps in those numbers are a hint that the notebook was run out of order.
- **Scripts vs. notebooks.** A `.py` file runs top to bottom in one go: run it with `.venv\Scripts\python my_script.py`. Use notebooks to explore and present, and scripts for anything you'll rerun the same way every time.

## Troubleshooting

| What you see | Fix |
| :-- | :-- |
| `'python' is not recognized` | Python isn't on PATH. Rerun the installer, choose Modify, tick "Add Python to environment variables," then open a new terminal |
| Typing `python` opens the Microsoft Store | Use the python.org installer from step 1. Then, in Settings, search **App execution aliases** and switch off the two "python" entries |
| `ModuleNotFoundError: No module named 'pandas'` in the notebook | The notebook is on the wrong kernel. Click the kernel name at the top right and pick `.venv` |
| `FileNotFoundError: trades.csv` | The CSV isn't in the same folder as the notebook. Move it there |
| No `.venv` option under Select Kernel | Reload VS Code (Ctrl+Shift+P, then type "Reload Window"), or choose **Python Environments > Enter interpreter path** and pick `.venv\Scripts\python.exe` |

## Explain it back

Your notebook runs fine now, but fails after Restart and Run All with `NameError: name 'loans' is not defined`. What happened?

??? note "Model answer"
    Somewhere a cell uses `loans` before the cell that creates it, either because it sits higher on the page or because the creating cell was deleted or edited. It worked before because you'd run the cells in a different order, and the kernel still remembered `loans`. Move the cell that creates `loans` above the cells that use it, then Restart and Run All again.

**Next:** [4.4 Capstone - trade blotter](4-4-capstone.md)
