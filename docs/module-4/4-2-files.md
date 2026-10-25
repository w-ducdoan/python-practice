---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 4.2 Reading and writing files

[Module 4](index.md) · about 40 minutes

## The idea

Real data lives in files. To read one, **open** it inside a `with` block. The file closes itself when the block ends, even if an error happens:

```python
with open("trades.csv") as f:
    for line in f:
        print(line.strip())      # each line ends in a newline; strip removes it
```

The name `"trades.csv"` is a **path**. A bare file name means "in the current folder." On this site the practice files are already in place. On your laptop (4.3) the file needs to be in the same folder as your notebook.

A CSV is just text with commas, but splitting on commas yourself breaks on values like `"1,000"`. Use the built-in **`csv` module**, which handles quoting correctly:

| You want | Python |
| :-- | :-- |
| Rows as lists | `csv.reader(f)` gives `["T0002", "2025-04-25", "CNDL", ...]` per row |
| The header row on its own | `header = next(reader)`. `next` takes the next row and moves past it |
| Rows as dicts keyed by the header | `csv.DictReader(f)` gives `{"trade_id": "T0002", "ticker": "CNDL", ...}` per row, the list-of-dicts shape from 3.4 |
| Write a file | `open(path, "w", newline="")`, then `csv.writer(f).writerow([...])` |

**Everything read from a CSV is text.** `"780"` is a string until you convert it with `int()` or `float()`, which is where 4.1's error handling earns its keep.

Start a program that uses the module with `import csv` at the top. **Importing** loads one of Python's built-in toolkits. You'll import `pandas` the same way in Module 5.

## Try it

```exercise
kind: example
id: ex-4-2
title: Read the trade blotter
files: trades.csv
--- starter
import csv

with open("trades.csv") as f:
    lines = f.readlines()
print("Lines in the file:", len(lines))
print("First three lines:")
for line in lines[:3]:
    print("  ", line.strip())

with open("trades.csv") as f:
    reader = csv.DictReader(f)
    first = next(reader)
print("First row as a dict:", first)
print("quantity is text:", repr(first["quantity"]))
```

## Practice

**1.** Write `count_rows(path)`. It returns the number of data rows in a CSV, which is every line except the header. Count them by looping over the file.

```exercise
id: m4-count-rows
title: Count the rows
files: trades.csv
--- starter
def count_rows(path):

--- tests
check(count_rows("trades.csv") == 120, f"trades.csv has 120 data rows (yours: {count_rows('trades.csv')})")
with open("mini.csv", "w") as f:
    f.write("a,b\n1,2\n3,4\n")
check(count_rows("mini.csv") == 2, "a file with a header and 2 rows should give 2")
check("open(" in code, "open the file with open(path)")
--- hint
Inside with open(path) as f: count every line, then subtract 1 for the header.
--- solution
def count_rows(path):
    count = 0
    with open(path) as f:
        for line in f:
            count += 1
    return count - 1
```

**2.** Write `read_header(path)`. It returns the column names as a list, using `csv.reader` and `next`.

```exercise
id: m4-header
title: Read the header
files: trades.csv, loan_tape.csv
--- starter
import csv

def read_header(path):

--- tests
check(read_header("trades.csv") == ["trade_id", "date", "ticker", "side", "quantity", "price"], f"trades.csv header is off. Yours: {read_header('trades.csv')}")
check(read_header("loan_tape.csv")[:3] == ["loan_id", "borrower", "sector"] and len(read_header("loan_tape.csv")) == 10, "loan_tape.csv has 10 columns, starting loan_id, borrower, sector")
check("csv.reader" in code and "next(" in code, "use csv.reader and next(...)")
--- hint
with open(path) as f: reader = csv.reader(f), then return next(reader)
--- solution
import csv

def read_header(path):
    with open(path) as f:
        reader = csv.reader(f)
        return next(reader)
```

**3.** Write `load_rows(path)`. It returns every row of a CSV as a list of dicts, using `csv.DictReader`.

```exercise
id: m4-load-rows
title: Load a CSV as a list of dicts
files: loan_tape.csv
--- starter
import csv

def load_rows(path):

--- tests
rows = load_rows("loan_tape.csv")
check(len(rows) == 202, f"loan_tape.csv has 202 rows (yours: {len(rows)})")
check(rows[0]["loan_id"] == "L001" and rows[0]["balance"] == "8900000", f"row 1 should be L001 with balance '8900000' (yours: {rows[0] if rows else None})")
check(isinstance(rows[0]["spread_bps"], str), "values come back as text, so spread_bps should still be a string")
--- hint
Start an empty list, loop over csv.DictReader(f), and append each row.
--- hint
Shorter: return list(csv.DictReader(f)). list() turns any loopable thing into a list.
--- solution
import csv

def load_rows(path):
    with open(path) as f:
        return list(csv.DictReader(f))
```

**4.** Write `loans_by_sector(path)`. It returns a dict of how many loans are in each sector of the loan tape. Combine `DictReader` with the counting pattern from 3.3.

```exercise
id: m4-sector-counts
title: Count by a column
files: loan_tape.csv
--- starter
import csv

def loans_by_sector(path):

--- tests
c = loans_by_sector("loan_tape.csv")
expected = {"Industrials": 32, "Healthcare": 28, "Consumer": 33, "Energy": 34, "Technology": 40, "Financials": 35}
check(c == expected, f"sector counts are off. Yours: {c}")
check(sum(c.values()) == 202, "the counts should add up to all 202 rows")
--- hint
counts[row["sector"]] = counts.get(row["sector"], 0) + 1, for each row from csv.DictReader.
--- solution
import csv

def loans_by_sector(path):
    counts = {}
    with open(path) as f:
        for row in csv.DictReader(f):
            counts[row["sector"]] = counts.get(row["sector"], 0) + 1
    return counts
```

**5.** Write `write_summary(path, totals)`. It takes a dict like `{"Energy": 120.5, "Healthcare": 80.0}` and writes a CSV with the header `sector,total`, then one row per sector.

```exercise
id: m4-write-csv
title: Write a CSV
--- starter
import csv

def write_summary(path, totals):

--- tests
write_summary("summary.csv", {"Energy": 120.5, "Healthcare": 80.0})
with open("summary.csv") as f:
    lines = [line.strip() for line in f if line.strip()]
check(lines == ["sector,total", "Energy,120.5", "Healthcare,80.0"], f"summary.csv should read sector,total / Energy,120.5 / Healthcare,80.0 (yours: {lines})")
write_summary("empty.csv", {})
with open("empty.csv") as f:
    check(f.read().strip() == "sector,total", "an empty dict should still write the header")
--- hint
with open(path, "w", newline="") as f: writer = csv.writer(f)
--- hint
writer.writerow(["sector", "total"]), then loop over totals.items() and write each pair.
--- solution
import csv

def write_summary(path, totals):
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["sector", "total"])
        for sector, total in totals.items():
            writer.writerow([sector, total])
```

## Explain it back

`csv.DictReader` gives you `{"quantity": "780", ...}`. Why can't you add up quantities straight away, and what could go wrong when you convert them?

??? note "Model answer"
    Every value from a CSV is text, so `"780"` has to go through `int()` before you can do math with it, and adding two strings just glues them together. The conversion fails on bad values like `"N/A"`, blanks, or `"1,000"` (int can't read the comma), so each conversion needs cleaning and a `try` / `except` to deal with the rows that won't parse.

**Next:** [4.3 Python on your laptop](4-3-setup.md)
