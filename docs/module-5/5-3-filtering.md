---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 5.3 Selecting and filtering

[Module 5](index.md) · about 55 minutes

## The idea

Filtering in pandas uses the NumPy masks from 5.1. A comparison on a column gives a True/False Series, and putting that inside `df[...]` keeps the True rows. It's Excel's AutoFilter as code:

```python
expensive = df[df["price"] > 100]
```

**Combining conditions** uses `&` (and), `|` (or) and `~` (not), **not** the words `and` / `or`. Put **each condition in parentheses**, because `&` binds tighter than `>`:

```python
df[(df["sector"] == "Technology") & (df["price"] < 100)]
```

Forget the parentheses or use `and`, and you'll get a confusing `ValueError: The truth value of a Series is ambiguous`. That message almost always means one of those two mistakes.

| You want | pandas |
| :-- | :-- |
| Rows where a column is one of several values | `df[df["sector"].isin(["Technology", "Energy"])]` |
| Rows and specific columns together | `df.loc[df["price"] > 100, ["ticker", "price"]]` |
| One column of the filtered rows, as a list | `df.loc[mask, "ticker"].tolist()` |
| Sort | `df.sort_values("market_value", ascending=False)` |
| The top N by a column | `df.nlargest(10, "market_value")` |
| Count the rows that match | `mask.sum()` or `len(df[mask])` |

`.loc[rows, columns]` reads as "these rows, these columns." The rows can be a mask, and the columns a name or a list of names.

## Try it

```exercise
kind: example
id: ex-5-3
title: Filters and sorting
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

df = pd.read_csv("holdings.csv")
df["market_value"] = df["shares"] * df["price"]

print("Price above $100:", len(df[df["price"] > 100]), "holdings")
tech_cheap = df[(df["sector"] == "Technology") & (df["price"] < 100)]
print(tech_cheap[["ticker", "sector", "price"]])

print(df.loc[df["sector"].isin(["Energy", "Consumer"]), ["ticker", "sector"]])
print(df.sort_values("market_value", ascending=False).head(3)[["ticker", "market_value"]])
```

## Practice

**1.** Write `priced_above(df, min_price)`, which returns only the rows with a price above `min_price`.

```exercise
id: m5-filter
title: One condition
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def priced_above(df, min_price):

--- tests
import pandas as pd
df = pd.read_csv("holdings.csv")
r = priced_above(df, 100)
check(isinstance(r, pd.DataFrame) and len(r) == 13, f"13 holdings are priced above $100 (yours: {len(r) if isinstance(r, pd.DataFrame) else r})")
check(len(priced_above(df, 1000)) == 0, "nothing is above $1,000")
check(len(priced_above(df, 0)) == 20, "everything is above $0")
--- hint
return df[df["price"] > min_price]
--- solution
import pandas as pd

def priced_above(df, min_price):
    return df[df["price"] > min_price]
```

**2.** Write `cheap_in_sectors(df, sectors, max_price)`. It returns the **tickers** (as a list) of holdings in any of `sectors` **and** priced below `max_price`.

```exercise
id: m5-filter-and
title: Combine conditions
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def cheap_in_sectors(df, sectors, max_price):

--- tests
import pandas as pd
df = pd.read_csv("holdings.csv")
r = cheap_in_sectors(df, ["Technology", "Energy"], 100)
check(r == ["DPWP", "PFHN", "FUWR"], f"should be ['DPWP', 'PFHN', 'FUWR'] (yours: {r})")
check(cheap_in_sectors(df, ["Healthcare"], 0) == [], "nothing is priced below $0")
check(".isin(" in code and "&" in code, "use .isin(...) and & with each condition in parentheses")
--- hint
mask = (df["sector"].isin(sectors)) & (df["price"] < max_price)
--- hint
return df.loc[mask, "ticker"].tolist()
--- solution
import pandas as pd

def cheap_in_sectors(df, sectors, max_price):
    mask = (df["sector"].isin(sectors)) & (df["price"] < max_price)
    return df.loc[mask, "ticker"].tolist()
```

**3.** Write `losers(df)`, which returns the tickers of holdings trading below their cost basis, in file order.

```exercise
id: m5-losers
title: Compare two columns
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def losers(df):

--- tests
import pandas as pd
r = losers(pd.read_csv("holdings.csv"))
check(r == ["IMHR", "FRMU", "PFHN", "FUWR", "DFPU", "RDCP", "AWVN", "RNHP"], f"8 holdings are under water (yours: {r})")
--- hint
A comparison between two columns works row by row: df["price"] < df["cost_basis"]
--- solution
import pandas as pd

def losers(df):
    return df.loc[df["price"] < df["cost_basis"], "ticker"].tolist()
```

**4.** Write `top_n(df, n)`. It adds `market_value` (shares × price), then returns the `n` largest holdings by market value, largest first, with only the `ticker` and `market_value` columns.

```exercise
id: m5-top-n
title: Sort and take the top
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def top_n(df, n):

--- tests
import pandas as pd
t = top_n(pd.read_csv("holdings.csv"), 3)
check(isinstance(t, pd.DataFrame) and t.columns.tolist() == ["ticker", "market_value"], f"return just ticker and market_value (yours: {t.columns.tolist() if isinstance(t, pd.DataFrame) else type(t).__name__})")
check(t["ticker"].tolist() == ["VMLT", "PPUA", "FRMU"], f"the top 3 should be VMLT, PPUA, FRMU (yours: {t['ticker'].tolist()})")
check(len(top_n(pd.read_csv("holdings.csv"), 10)) == 10, "top_n(df, 10) should give 10 rows")
--- hint
Add the column, then df.sort_values("market_value", ascending=False).head(n), or use df.nlargest(n, "market_value").
--- hint
Finish with [["ticker", "market_value"]] to keep just those columns.
--- solution
import pandas as pd

def top_n(df, n):
    df["market_value"] = df["shares"] * df["price"]
    return df.nlargest(n, "market_value")[["ticker", "market_value"]]
```

**5.** On the loan tape: write `wide_energy_loans(path, min_spread)`, which returns the loan_ids of Energy loans with `spread_bps` at or above `min_spread`.

```exercise
id: m5-loan-filter
title: Filter the loan tape
packages: pandas
files: loan_tape.csv
--- starter
import pandas as pd

def wide_energy_loans(path, min_spread):

--- tests
r = wide_energy_loans("loan_tape.csv", 650)
check(len(r) == 11 and r[:5] == ["L020", "L023", "L030", "L040", "L075"], f"11 Energy loans are at 650+ bps, starting L020, L023, L030 (yours: {len(r)}, {r[:5]})")
check(wide_energy_loans("loan_tape.csv", 701) == [], "no loan is wider than 700 bps")
--- hint
Read the file, then build two conditions: sector == "Energy", and spread_bps >= min_spread.
--- solution
import pandas as pd

def wide_energy_loans(path, min_spread):
    df = pd.read_csv(path)
    mask = (df["sector"] == "Energy") & (df["spread_bps"] >= min_spread)
    return df.loc[mask, "loan_id"].tolist()
```

## Explain it back

`df[df["sector"] == "Energy" & df["price"] < 100]` raises an error. What two fixes might it need, and why?

??? note "Model answer"
    It needs parentheses around each condition. Without them, Python evaluates `"Energy" & df["price"]` first, because `&` binds tighter than `==` and `<`, which is nonsense. Also, `&` must be used rather than `and`: `and` asks for a single True/False, and a whole column of them is "ambiguous." The fixed version: `df[(df["sector"] == "Energy") & (df["price"] < 100)]`.

**Next:** [5.4 Grouping and reshaping](5-4-grouping.md)
