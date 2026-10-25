---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 5.2 DataFrames

[Module 5](index.md) · about 55 minutes

## The idea

A pandas **DataFrame** is a table: named columns, numbered rows, and a type for each column. It replaces the list-of-dicts from 3.4 and the `csv` loops from 4.2:

```python
import pandas as pd

df = pd.read_csv("holdings.csv")       # the whole file, already typed
```

| You want | pandas | What comes back |
| :-- | :-- | :-- |
| First rows | `df.head()` (or `df.head(10)`) | A smaller DataFrame |
| Rows and columns | `df.shape` | `(20, 6)` |
| Column names | `df.columns.tolist()` | A list |
| Column types | `df.dtypes` | `int64`, `float64`, or `object` (text) |
| One column | `df["price"]` | A **Series**: one column with the row labels |
| Several columns | `df[["ticker", "price"]]` | A DataFrame. Note the double brackets: a list inside `[]` |
| A new column | `df["market_value"] = df["shares"] * df["price"]` | Computed for every row at once, like NumPy |
| Column math | `df["price"].sum()`, `.mean()`, `.max()`, `.min()` | One number |
| Quick stats | `df.describe()` | Count, mean, std and quartiles per numeric column |
| A Series to a list | `df["ticker"].tolist()` | A Python list |

A **Series** is a single column, and most column methods return one. Think of a DataFrame as a dict of Series that share the same row labels.

You can also build a DataFrame from a dict of lists, with keys as column names:

```python
pd.DataFrame({"ticker": ["ACME", "BRKN"], "weight": [0.6, 0.4]})
```

`print(df)` shows the table as text. In a notebook, a bare `df` on the last line of a cell shows a formatted table.

## Try it

```exercise
kind: example
id: ex-5-2
title: Meet the holdings file
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

df = pd.read_csv("holdings.csv")
print(df.head())
print("\nshape:", df.shape)
print("\ntypes:\n", df.dtypes)

df["market_value"] = df["shares"] * df["price"]
print("\nTotal market value: $", round(df["market_value"].sum(), 2))
print(df[["ticker", "market_value"]].head(3))
print(df[["shares", "price"]].describe().round(2))
```

## Practice

**1.** Write `load_holdings(path)`, which returns the CSV as a DataFrame.

```exercise
id: m5-load
title: Load a CSV with pandas
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def load_holdings(path):

--- tests
import pandas as pd
df = load_holdings("holdings.csv")
check(isinstance(df, pd.DataFrame), f"should return a DataFrame (yours: {type(df).__name__})")
check(df.shape == (20, 6), f"holdings.csv is 20 rows x 6 columns (yours: {df.shape})")
check(df.columns.tolist() == ["ticker", "name", "sector", "shares", "price", "cost_basis"], f"columns are off: {df.columns.tolist()}")
--- hint
return pd.read_csv(path)
--- solution
import pandas as pd

def load_holdings(path):
    return pd.read_csv(path)
```

**2.** Write `add_values(df)`. It adds a `market_value` column (shares × price) and a `cost_value` column (shares × cost_basis), then returns the DataFrame.

```exercise
id: m5-new-columns
title: Add computed columns
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def add_values(df):

--- tests
import pandas as pd
df = add_values(pd.read_csv("holdings.csv"))
check("market_value" in df.columns and "cost_value" in df.columns, f"add market_value and cost_value (columns now: {df.columns.tolist()})")
check(approx(df["market_value"].sum(), 9812880.0), f"total market_value should be 9,812,880 (yours: {df['market_value'].sum():,.2f})" if "market_value" in df.columns else "no market_value column")
check(approx(df["market_value"].sum() - df["cost_value"].sum(), 1048790.0), "market value minus cost should be 1,048,790")
check("for " not in code, "no loop: column math works on every row at once")
--- hint
df["market_value"] = df["shares"] * df["price"]
--- solution
import pandas as pd

def add_values(df):
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    return df
```

**3.** Write `quick_facts(df)`. It returns a dict with `rows` (the number of rows), `total_shares` and `avg_price` (rounded to 2 decimals).

```exercise
id: m5-quick-facts
title: Column summaries
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def quick_facts(df):

--- tests
import pandas as pd
f = quick_facts(pd.read_csv("holdings.csv"))
check(f.get("rows") == 20, f"rows should be 20 (yours: {f.get('rows')})")
check(f.get("total_shares") == 56550, f"total_shares should be 56,550 (yours: {f.get('total_shares')})")
check(f.get("avg_price") == 167.34, f"avg_price should be 167.34 (yours: {f.get('avg_price')})")
--- hint
len(df) gives the number of rows. df["shares"].sum() and df["price"].mean() do the rest.
--- solution
import pandas as pd

def quick_facts(df):
    return {"rows": len(df), "total_shares": df["shares"].sum(), "avg_price": round(df["price"].mean(), 2)}
```

**4.** Write `make_weights_table(tickers, values)`. It takes two lists and returns a DataFrame with columns `ticker`, `value` and `weight`, where weight is each value over the total.

```exercise
id: m5-from-lists
title: Build a DataFrame
packages: pandas
--- starter
import pandas as pd

def make_weights_table(tickers, values):

--- tests
import pandas as pd
t = make_weights_table(["ACME", "BRKN", "CNDL"], [300, 100, 600])
check(isinstance(t, pd.DataFrame) and t.columns.tolist() == ["ticker", "value", "weight"], f"columns should be ticker, value, weight (yours: {t.columns.tolist() if isinstance(t, pd.DataFrame) else type(t).__name__})")
check(t["weight"].round(6).tolist() == [0.3, 0.1, 0.6], f"weights should be [0.3, 0.1, 0.6] (yours: {t['weight'].tolist()})")
check(t["ticker"].tolist() == ["ACME", "BRKN", "CNDL"], "rows should keep the input order")
--- hint
df = pd.DataFrame({"ticker": tickers, "value": values})
--- hint
Then df["weight"] = df["value"] / df["value"].sum()
--- solution
import pandas as pd

def make_weights_table(tickers, values):
    df = pd.DataFrame({"ticker": tickers, "value": values})
    df["weight"] = df["value"] / df["value"].sum()
    return df
```

**5.** Look at the loan tape's column types. Write `text_columns(path)`, which returns a list of the columns pandas read as text (dtype `object`). One of them should surprise you.

```exercise
id: m5-dtypes
title: Spot a number stored as text
packages: pandas
files: loan_tape.csv
--- starter
import pandas as pd

def text_columns(path):

--- tests
cols = text_columns("loan_tape.csv")
check(sorted(cols) == sorted(["loan_id", "borrower", "sector", "origination_date", "maturity_date", "balance", "rating", "status"]), f"text columns are off. Yours: {cols}")
check("balance" in cols, "balance should be in the list: pandas couldn't read it as numbers")
--- hint
df.dtypes is a Series mapping each column to its type. Filter it with == "object".
--- hint
return df.columns[df.dtypes == "object"].tolist()
--- solution
import pandas as pd

def text_columns(path):
    df = pd.read_csv(path)
    return df.columns[df.dtypes == "object"].tolist()
```

## Explain it back

Why did pandas read `balance` as text, and why does that matter before you sum it?

??? note "Model answer"
    Some rows hold `$12,400,000`, and a few are blank, so not every value parses as a number. When pandas finds anything non-numeric in a column, it falls back to text (`object`) for the whole column. Summing it would glue strings together or fail. You'd clean it first, stripping `$` and commas and converting with `pd.to_numeric`, which is Module 6's job and exactly what you did by hand in Checkpoint 4.

**Next:** [5.3 Selecting and filtering](5-3-filtering.md)
