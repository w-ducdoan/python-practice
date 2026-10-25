---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 5.4 Grouping and reshaping

[Module 5](index.md) · about 60 minutes

## The idea

**`groupby` is a pivot table.** It splits the rows into groups, applies a calculation to each group, and combines the results. Read it left to right as "by sector, take market value, sum it":

```python
df.groupby("sector")["market_value"].sum()
```

The result is a Series with one row per sector, and the sector names become the row labels (the **index**). That's the `exposure_by_sector` loop from 3.4, in one line.

| You want | pandas |
| :-- | :-- |
| One statistic per group | `df.groupby("sector")["market_value"].sum()` (or `.mean()`, `.count()`, `.max()`) |
| Several statistics, named | `df.groupby("sector").agg(positions=("ticker", "count"), mv=("market_value", "sum"))` |
| Count rows per value | `df["sector"].value_counts()` |
| A Series to a dict | `.to_dict()` |
| Sort a result | `.sort_values(ascending=False)` |
| The group labels back as a normal column | `.reset_index()` |

**Weighted averages by group:** build the weighted column first, then divide the group sums: `sum(balance × spread) / sum(balance)`. It's the same formula as 3.4, but applied per group.

**Reshaping: long vs. wide.** `prices.csv` is **long**: one row per date and ticker. Analysis usually wants it **wide**: one row per date and one column per ticker, like a price sheet in Excel. `pivot` does that:

```python
wide = prices.pivot(index="date", columns="ticker", values="close")
```

Once it's wide, `wide["ACME"]` is a single ticker's price history, and `wide.pct_change()` gives every ticker's daily returns at once. That's Module 7's starting point.

## Try it

```exercise
kind: example
id: ex-5-4
title: groupby and pivot
packages: pandas
files: holdings.csv, prices.csv
--- starter
import pandas as pd

df = pd.read_csv("holdings.csv")
df["market_value"] = df["shares"] * df["price"]
print(df.groupby("sector")["market_value"].sum().sort_values(ascending=False))
print(df["sector"].value_counts())
print(df.groupby("sector").agg(positions=("ticker", "count"),
                               market_value=("market_value", "sum"),
                               avg_price=("price", "mean")).round(2))

prices = pd.read_csv("prices.csv")
print(prices.head(3))
wide = prices.pivot(index="date", columns="ticker", values="close")
print(wide.head(3))
print("shape:", wide.shape)
```

## Practice

**1.** Write `sector_market_value(df)`. It adds `market_value`, then returns the sum per sector as a Series.

```exercise
id: m5-group-sum
title: Sum by group
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def sector_market_value(df):

--- tests
import pandas as pd
s = sector_market_value(pd.read_csv("holdings.csv"))
check(isinstance(s, pd.Series), f"should return a Series (yours: {type(s).__name__})")
expected = {"Consumer": 1191774.0, "Energy": 1145106.5, "Financials": 2251007.0, "Healthcare": 2332431.5, "Industrials": 1222294.5, "Technology": 1670266.5}
check(isinstance(s, pd.Series) and s.round(2).to_dict() == expected, f"sector totals are off. Yours: {s.round(2).to_dict() if isinstance(s, pd.Series) else s}")
--- hint
df.groupby("sector")["market_value"].sum()
--- solution
import pandas as pd

def sector_market_value(df):
    df["market_value"] = df["shares"] * df["price"]
    return df.groupby("sector")["market_value"].sum()
```

**2.** Write `sector_counts(df)`, which returns a dict of the number of holdings per sector. Use `value_counts`.

```exercise
id: m5-value-counts
title: Count per group
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def sector_counts(df):

--- tests
import pandas as pd
c = sector_counts(pd.read_csv("holdings.csv"))
check(c == {"Technology": 4, "Healthcare": 4, "Industrials": 3, "Financials": 3, "Consumer": 3, "Energy": 3}, f"counts are off. Yours: {c}")
check("value_counts" in code, "use value_counts()")
--- hint
return df["sector"].value_counts().to_dict()
--- solution
import pandas as pd

def sector_counts(df):
    return df["sector"].value_counts().to_dict()
```

**3.** Write `sector_table(df)`. It returns one row per sector with three named columns: `positions` (the count of tickers), `market_value` (the sum) and `unrealized_pnl` (the sum of market value minus cost). Sort it by `market_value`, largest first.

```exercise
id: m5-agg
title: Named aggregations
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def sector_table(df):
    df["market_value"] = df["shares"] * df["price"]
    df["unrealized_pnl"] = df["market_value"] - df["shares"] * df["cost_basis"]

--- tests
import pandas as pd
t = sector_table(pd.read_csv("holdings.csv"))
check(isinstance(t, pd.DataFrame) and t.columns.tolist() == ["positions", "market_value", "unrealized_pnl"], f"columns should be positions, market_value, unrealized_pnl (yours: {t.columns.tolist() if isinstance(t, pd.DataFrame) else type(t).__name__})")
check(t.index.tolist() == ["Healthcare", "Financials", "Technology", "Industrials", "Consumer", "Energy"], f"sort by market_value, largest first (yours: {t.index.tolist()})")
check(t.loc["Healthcare", "positions"] == 4 and approx(t.loc["Energy", "unrealized_pnl"], -84223.0), "Healthcare should have 4 positions, and Energy's P&L should be -84,223")
--- hint
df.groupby("sector").agg(positions=("ticker", "count"), market_value=("market_value", "sum"), unrealized_pnl=("unrealized_pnl", "sum"))
--- hint
Then .sort_values("market_value", ascending=False)
--- solution
import pandas as pd

def sector_table(df):
    df["market_value"] = df["shares"] * df["price"]
    df["unrealized_pnl"] = df["market_value"] - df["shares"] * df["cost_basis"]
    table = df.groupby("sector").agg(positions=("ticker", "count"),
                                     market_value=("market_value", "sum"),
                                     unrealized_pnl=("unrealized_pnl", "sum"))
    return table.sort_values("market_value", ascending=False)
```

**4.** Write `avg_spread_by_sector(path)`. It returns a dict of the **simple** average `spread_bps` per sector of the loan tape, rounded to 1 decimal. (Balances are still text in this file, so a weighted version waits for Module 6's cleaning.)

```exercise
id: m5-loan-group
title: Average by group on the loan tape
packages: pandas
files: loan_tape.csv
--- starter
import pandas as pd

def avg_spread_by_sector(path):

--- tests
r = avg_spread_by_sector("loan_tape.csv")
expected = {"Consumer": 561.4, "Energy": 577.2, "Financials": 589.3, "Healthcare": 565.2, "Industrials": 564.8, "Technology": 551.2}
check(r == expected, f"averages are off. Yours: {r}")
--- hint
pd.read_csv(path).groupby("sector")["spread_bps"].mean()
--- hint
Then .round(1).to_dict()
--- solution
import pandas as pd

def avg_spread_by_sector(path):
    df = pd.read_csv(path)
    return df.groupby("sector")["spread_bps"].mean().round(1).to_dict()
```

**5.** Write `wide_prices(path)`. It reads the long `prices.csv` and returns it wide: dates as the index, one column per ticker.

```exercise
id: m5-pivot
title: Long to wide
packages: pandas
files: prices.csv
--- starter
import pandas as pd

def wide_prices(path):

--- tests
import pandas as pd
w = wide_prices("prices.csv")
check(isinstance(w, pd.DataFrame) and w.shape == (783, 5), f"should be 783 dates x 5 tickers (yours: {w.shape if isinstance(w, pd.DataFrame) else type(w).__name__})")
check(sorted(w.columns.tolist()) == ["ACME", "BRKN", "CNDL", "DLTA", "ESTR"], f"one column per ticker (yours: {w.columns.tolist()})")
check(w["ACME"].iloc[0] == 120.0 and w["ACME"].iloc[-1] == 153.93, "ACME should start at 120.00 and end at 153.93")
--- hint
prices.pivot(index="date", columns="ticker", values="close")
--- solution
import pandas as pd

def wide_prices(path):
    prices = pd.read_csv(path)
    return prices.pivot(index="date", columns="ticker", values="close")
```

## Explain it back

`df.groupby("sector")["market_value"].sum()` returns sectors as the index rather than a column. Why does that matter, and how do you change it?

??? note "Model answer"
    The index is the row label, so you look values up by sector (`result["Energy"]` or `.loc["Energy"]`), and joins and plots will treat sector as the key. To get a normal table with `sector` as an ordinary column, for example to write it to a CSV or merge it with something else, call `.reset_index()`.

**Next:** [5.5 Capstone - portfolio holdings](5-5-capstone.md)
