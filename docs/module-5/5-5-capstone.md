---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 5.5 Capstone - portfolio holdings

[Module 5](index.md) · about 60 minutes

## The idea

This is the holdings page of a portfolio review, built in pandas: what you own, what it's worth, where the money sits, and whether any position breaks a concentration limit. Four functions:

1. `enrich(df)` adds market value, cost, unrealized P&L, P&L % and portfolio weight.
2. `sector_exposure(df)` gives each sector's weight, largest first.
3. `top_n_share(df, n)` and `hhi(df)` measure concentration.
4. `over_limit(df, limit)` lists the positions above a single-name limit.

**Two concentration measures:**

- **Top-N share:** the weight held in the N largest positions. "The top 10 are 79% of the book" is a sentence every PM and risk committee recognizes.
- **HHI (Herfindahl-Hirschman Index):** the sum of the squared weights. It ranges from 1/N (perfectly equal) to 1 (everything in one name). Its inverse, 1 / HHI, is the **effective number of positions**: how many equal-sized holdings would give the same concentration. Credit and antitrust analysts use the same measure.

Each starter after the first includes a finished `enrich`.

## Practice

**1.** Write `enrich(df)`. It adds these columns and returns the DataFrame:

| Column | Formula |
| :-- | :-- |
| `market_value` | shares × price |
| `cost_value` | shares × cost_basis |
| `unrealized_pnl` | market_value - cost_value |
| `pnl_pct` | unrealized_pnl / cost_value |
| `weight` | market_value / total market_value |

```exercise
id: m5-cap-enrich
title: Enrich the holdings
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""

    return df
--- tests
import pandas as pd
df = enrich(pd.read_csv("holdings.csv"))
needed = ["market_value", "cost_value", "unrealized_pnl", "pnl_pct", "weight"]
missing = [c for c in needed if c not in df.columns]
check(not missing, f"missing columns: {missing}")
if not missing:
    check(approx(df["market_value"].sum(), 9812880.0), f"total market value should be 9,812,880 (yours: {df['market_value'].sum():,.2f})")
    check(approx(df["unrealized_pnl"].sum(), 1048790.0), f"total unrealized P&L should be 1,048,790 (yours: {df['unrealized_pnl'].sum():,.2f})")
    check(approx(df["weight"].sum(), 1.0, 1e-9), "weights should add up to 1")
    first = df.iloc[0]
    check(approx(first["pnl_pct"], (224.57 - 162.07) / 162.07, 1e-9), "RVII's pnl_pct should be (224.57 - 162.07) / 162.07, about 38.6%")
--- hint
Each line is column math, like df["market_value"] = df["shares"] * df["price"]
--- hint
For weight, divide by df["market_value"].sum(), the total of the whole column.
--- solution
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df
```

**2.** Write `sector_exposure(df)`, which returns each sector's total weight as a Series, largest first.

```exercise
id: m5-cap-sector
title: Sector exposure
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def sector_exposure(df):

--- tests
import pandas as pd
s = sector_exposure(enrich(pd.read_csv("holdings.csv")))
check(isinstance(s, pd.Series), f"should return a Series (yours: {type(s).__name__})")
check(isinstance(s, pd.Series) and s.index.tolist() == ["Healthcare", "Financials", "Technology", "Industrials", "Consumer", "Energy"], f"sectors should be ordered largest first (yours: {s.index.tolist() if isinstance(s, pd.Series) else s})")
check(isinstance(s, pd.Series) and approx(s.iloc[0], 0.237691, 1e-6) and approx(s.sum(), 1.0, 1e-9), "Healthcare should be about 23.8%, and all sectors should add up to 100%")
--- hint
df.groupby("sector")["weight"].sum(), then .sort_values(ascending=False)
--- solution
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def sector_exposure(df):
    return df.groupby("sector")["weight"].sum().sort_values(ascending=False)
```

**3.** Write `top_n_share(df, n=10)`, the total weight of the `n` largest positions, and `hhi(df)`, the sum of squared weights.

```exercise
id: m5-cap-concentration
title: Concentration measures
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def top_n_share(df, n=10):


def hhi(df):

--- tests
import pandas as pd
df = enrich(pd.read_csv("holdings.csv"))
check(approx(top_n_share(df), 0.790180, 1e-6), f"the top 10 should be about 79.0% (yours: {top_n_share(df)})")
check(approx(top_n_share(df, 5), 0.540789, 1e-6), "the top 5 should be about 54.1%")
check(approx(top_n_share(df, 20), 1.0, 1e-9), "all 20 positions should be 100%")
check(approx(hhi(df), 0.081010, 1e-6), f"HHI should be about 0.0810 (yours: {hhi(df)})")
eq = pd.DataFrame({"weight": [0.25, 0.25, 0.25, 0.25], "market_value": [1, 1, 1, 1]})
check(approx(hhi(eq), 0.25, 1e-9), "four equal positions should give an HHI of 0.25 (= 1/4)")
--- hint
df.nlargest(n, "weight")["weight"].sum()
--- hint
HHI: (df["weight"] ** 2).sum()
--- solution
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def top_n_share(df, n=10):
    return df.nlargest(n, "weight")["weight"].sum()


def hhi(df):
    return (df["weight"] ** 2).sum()
```

**4.** Write `over_limit(df, limit=0.08)`. It returns a DataFrame of positions whose weight is above `limit`, with only the `ticker`, `sector` and `weight` columns, largest first.

```exercise
id: m5-cap-limits
title: Single-name limit breaches
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def over_limit(df, limit=0.08):

--- tests
import pandas as pd
df = enrich(pd.read_csv("holdings.csv"))
o = over_limit(df)
check(isinstance(o, pd.DataFrame) and o.columns.tolist() == ["ticker", "sector", "weight"], f"return ticker, sector, weight (yours: {o.columns.tolist() if isinstance(o, pd.DataFrame) else type(o).__name__})")
check(isinstance(o, pd.DataFrame) and o["ticker"].tolist() == ["VMLT", "PPUA", "FRMU", "RVII", "AGRR"], f"5 positions are above 8%, starting with VMLT (yours: {o['ticker'].tolist() if isinstance(o, pd.DataFrame) else o})")
check(len(over_limit(df, 0.20)) == 0, "nothing is above 20%")
--- hint
Filter with .loc[df["weight"] > limit, ["ticker", "sector", "weight"]]
--- hint
Then .sort_values("weight", ascending=False)
--- solution
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def over_limit(df, limit=0.08):
    result = df.loc[df["weight"] > limit, ["ticker", "sector", "weight"]]
    return result.sort_values("weight", ascending=False)
```

## Try it: the holdings page

Once all four pass, this prints a one-page holdings summary using the finished functions. Change the limit, or the `n` in the top-N line, and rerun.

```exercise
kind: example
id: ex-5-5
title: Holdings summary
packages: pandas
files: holdings.csv
--- starter
import pandas as pd

def enrich(df):
    """Add market_value, cost_value, unrealized_pnl, pnl_pct and weight."""
    df["market_value"] = df["shares"] * df["price"]
    df["cost_value"] = df["shares"] * df["cost_basis"]
    df["unrealized_pnl"] = df["market_value"] - df["cost_value"]
    df["pnl_pct"] = df["unrealized_pnl"] / df["cost_value"]
    df["weight"] = df["market_value"] / df["market_value"].sum()
    return df


def sector_exposure(df):
    return df.groupby("sector")["weight"].sum().sort_values(ascending=False)


def top_n_share(df, n=10):
    return df.nlargest(n, "weight")["weight"].sum()


def hhi(df):
    return (df["weight"] ** 2).sum()


def over_limit(df, limit=0.08):
    result = df.loc[df["weight"] > limit, ["ticker", "sector", "weight"]]
    return result.sort_values("weight", ascending=False)


df = enrich(pd.read_csv("holdings.csv"))
print(f"Market value ${df['market_value'].sum():,.0f} | unrealized P&L ${df['unrealized_pnl'].sum():,.0f} "
      f"({df['unrealized_pnl'].sum() / df['cost_value'].sum():.1%})")
print(f"Top 10 = {top_n_share(df):.1%} of the book | HHI {hhi(df):.3f} "
      f"(effective positions: {1 / hhi(df):.1f} of {len(df)})")
print("\nSector exposure:")
for sector, weight in sector_exposure(df).items():
    print(f"  {sector:<12} {weight:6.1%}")
print("\nAbove the 8% single-name limit:")
breaches = over_limit(df)
for _, row in breaches.iterrows():
    print(f"  {row['ticker']}  {row['sector']:<12} {row['weight']:6.1%}")
```

## Explain it back

The book has 20 positions, but 1 / HHI is about 12.3. What does that tell a PM?

??? note "Model answer"
    The portfolio behaves like 12 equal-sized positions, not 20. A handful of large names (VMLT alone is about 15.6%) carry most of the risk, and the small positions add little diversification. If the mandate assumes 20-name diversification, the real exposure is closer to 12, which is why the top-10 share (79%) and the five names above the 8% limit are worth raising.

**Next:** [Checkpoint 5](checkpoint.md)
