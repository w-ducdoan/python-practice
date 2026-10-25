---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 4

[Module 4](index.md) · about 25 minutes

No hints, and the solution unlocks only after you pass. Write both from a blank editor.

**1. Percent parser.** Write `parse_pct(text)` for rate columns typed in different ways:

- Text ending in `%` is a percent: `"12.5%"` gives 0.125, and `" -3.4% "` gives -0.034.
- Text without `%` is already a decimal: `"0.125"` gives 0.125.
- Blank or unreadable text gives `None`: `""`, `"n/a"`, `"%"`.

```exercise
id: m4-cp-pct
title: Percent parser
checkpoint: yes
--- starter

--- tests
for text, expected in [("12.5%", 0.125), (" -3.4% ", -0.034), ("0.125", 0.125), ("100%", 1.0), ("0%", 0.0)]:
    got = parse_pct(text)
    check(got is not None and approx(got, expected, 1e-9), f"parse_pct({text!r}) should be {expected} (yours: {got})")
for text in ["", "n/a", "%", "abc%"]:
    check(parse_pct(text) is None, f"parse_pct({text!r}) should be None (yours: {parse_pct(text)})")
--- solution
def parse_pct(text):
    cleaned = text.strip()
    is_percent = cleaned.endswith("%")
    if is_percent:
        cleaned = cleaned[:-1]
    try:
        value = float(cleaned)
    except ValueError:
        return None
    if is_percent:
        return value / 100
    return value
```

**2. Loan tape total.** Write `total_clean_balance(path)`. It reads `loan_tape.csv` and returns the sum of the `balance` column in dollars. Balances come three ways: plain (`8900000`), with a dollar sign and commas (`$12,400,000`), or blank. Skip blanks, and skip negative balances, which are impossible and so must be data errors. (The tape also has two duplicate rows. Leave them in for now: Module 6 removes duplicates with pandas.)

```exercise
id: m4-cp-tape-total
title: Total a messy loan tape
checkpoint: yes
files: loan_tape.csv
--- starter

--- tests
total = total_clean_balance("loan_tape.csv")
check(approx(total, 6_198_800_000, 1), f"the clean total should be $6,198,800,000 (yours: {total:,.0f})" if isinstance(total, (int, float)) else "return a number")
with open("mini_tape.csv", "w") as f:
    f.write('loan_id,balance\nA,100\nB,"$1,000"\nC,\nD,-50\nE, 25 \n')
check(approx(total_clean_balance("mini_tape.csv"), 1125, 1e-9), "a test file with 100, '$1,000', blank, -50 and ' 25 ' should total 1125")
check("open(" in code, "read the file with open(path)")
--- solution
import csv

def total_clean_balance(path):
    total = 0
    with open(path) as f:
        for row in csv.DictReader(f):
            text = row["balance"].strip().replace("$", "").replace(",", "")
            try:
                value = float(text)
            except ValueError:
                continue
            if value < 0:
                continue
            total += value
    return total
```

Pass both, and run the 4.3 notebook all the way through with Restart and Run All, and Module 4 is done. Module 5 is next: NumPy and pandas, where the loops you've written become one-liners.

**Next:** [Module 5 - NumPy and pandas](../module-5/index.md)
