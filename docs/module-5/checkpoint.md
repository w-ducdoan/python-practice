---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 5

[Module 5](index.md) · about 30 minutes

No hints, and the solution unlocks only after you pass. Write both from a blank editor, with no loops: pandas only.

**1. Volatility by ticker.** Write `ann_vol_by_ticker(path)`. It reads the long `prices.csv` (columns `date`, `ticker`, `close`) and returns a Series of annualized volatility per ticker, highest first. Use daily simple returns, the sample standard deviation and √252. Two tools you haven't used yet: `wide.pct_change()` gives every column's daily returns, and the first row comes out empty, so drop it with `.dropna()`.

```exercise
id: m5-cp-vol
title: Annualized vol per ticker
checkpoint: yes
packages: pandas
files: prices.csv
--- starter

--- tests
import pandas as pd
v = ann_vol_by_ticker("prices.csv")
check(isinstance(v, pd.Series), f"return a Series (yours: {type(v).__name__})")
check(isinstance(v, pd.Series) and v.index.tolist() == ["ESTR", "BRKN", "CNDL", "ACME", "DLTA"], f"order should be highest vol first: ESTR, BRKN, CNDL, ACME, DLTA (yours: {v.index.tolist() if isinstance(v, pd.Series) else v})")
expected = {"ESTR": 0.442255, "BRKN": 0.349632, "CNDL": 0.295367, "ACME": 0.219713, "DLTA": 0.178803}
check(isinstance(v, pd.Series) and all(approx(v.get(k, 0), x, 1e-6) for k, x in expected.items()), f"vols are off. Yours: {v.round(6).to_dict() if isinstance(v, pd.Series) else v}")
check("for " not in code, "no loops")
--- solution
import numpy as np
import pandas as pd

def ann_vol_by_ticker(path):
    prices = pd.read_csv(path)
    wide = prices.pivot(index="date", columns="ticker", values="close")
    returns = wide.pct_change().dropna()
    vol = returns.std() * np.sqrt(252)
    return vol.sort_values(ascending=False)
```

**2. P&L by sector.** Write `pnl_by_sector(path)`. It reads `holdings.csv` and returns a Series of total unrealized P&L (shares × (price - cost_basis)) per sector, largest first.

```exercise
id: m5-cp-pnl
title: Unrealized P&L by sector
checkpoint: yes
packages: pandas
files: holdings.csv
--- starter

--- tests
import pandas as pd
p = pnl_by_sector("holdings.csv")
check(isinstance(p, pd.Series), f"return a Series (yours: {type(p).__name__})")
check(isinstance(p, pd.Series) and p.index.tolist() == ["Healthcare", "Technology", "Industrials", "Consumer", "Energy", "Financials"], f"order should be largest first (yours: {p.index.tolist() if isinstance(p, pd.Series) else p})")
check(isinstance(p, pd.Series) and approx(p.get("Healthcare", 0), 747472.5) and approx(p.get("Financials", 0), -116851.0), "Healthcare should be +747,472.50 and Financials -116,851.00")
check("for " not in code, "no loops")
--- solution
import pandas as pd

def pnl_by_sector(path):
    df = pd.read_csv(path)
    df["unrealized_pnl"] = df["shares"] * (df["price"] - df["cost_basis"])
    return df.groupby("sector")["unrealized_pnl"].sum().sort_values(ascending=False)
```

Pass both and Module 5 is done. Check the Home page for **Mastered**. Module 6 is next: cleaning and reshaping, where you'll fix every planted problem in the loan tape with pandas, including the duplicates, the `$` balances and the LTVs entered as percents.

[Back to Home](../index.md)
