---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 3

[Module 3](index.md) · about 25 minutes

No hints, and the solution unlocks only after you pass. Write both from a blank editor.

**1. Sector weights.** Write `sector_weights(holdings)`. `holdings` is a list of dicts with keys `ticker`, `sector`, `shares` and `price`. Return a dict of each sector's share of total market value (shares × price), as decimals that add up to 1.

For example, this input:

```python
[{"ticker": "ACME", "sector": "Tech",   "shares": 10, "price": 50},
 {"ticker": "BRKN", "sector": "Energy", "shares": 20, "price": 10},
 {"ticker": "CNDL", "sector": "Tech",   "shares": 5,  "price": 60}]
```

gives `{"Tech": 0.8, "Energy": 0.2}`. Tech is (500 + 300) / 1,000.

```exercise
id: m3-cp-sector-weights
title: Sector weights
checkpoint: yes
--- starter

--- tests
h = [{"ticker": "ACME", "sector": "Tech", "shares": 10, "price": 50},
     {"ticker": "BRKN", "sector": "Energy", "shares": 20, "price": 10},
     {"ticker": "CNDL", "sector": "Tech", "shares": 5, "price": 60}]
w = sector_weights(h)
check(set(w) == {"Tech", "Energy"} and approx(w["Tech"], 0.8, 1e-9) and approx(w["Energy"], 0.2, 1e-9), f"should be Tech 0.8, Energy 0.2 (yours: {w})")
h2 = [{"ticker": "A", "sector": "X", "shares": 3, "price": 100}]
check(sector_weights(h2) == {"X": 1.0}, "a single holding should be 100% of its sector")
h3 = [{"ticker": "A", "sector": "X", "shares": 1, "price": 25}, {"ticker": "B", "sector": "Y", "shares": 1, "price": 25},
      {"ticker": "C", "sector": "Z", "shares": 2, "price": 25}]
w3 = sector_weights(h3)
check(approx(sum(w3.values()), 1.0, 1e-9) and approx(w3.get("Z", 0), 0.5, 1e-9), "weights should add up to 1, with Z at 0.5")
--- solution
def sector_weights(holdings):
    by_sector = {}
    total = 0
    for h in holdings:
        value = h["shares"] * h["price"]
        by_sector[h["sector"]] = by_sector.get(h["sector"], 0) + value
        total += value
    weights = {}
    for sector, value in by_sector.items():
        weights[sector] = value / total
    return weights
```

**2. Payback period.** Write `payback_period(cash_flows)`. Year 0 is the first item. Return the first year in which the **cumulative** cash flow reaches zero or above. Return `None` if it never does.

For example, `[-1000, 300, 400, 500, 200]` has cumulative totals of -1000, -700, -300, +200, so the payback year is 3.

```exercise
id: m3-cp-payback
title: Payback period
checkpoint: yes
--- starter

--- tests
check(payback_period([-1000, 300, 400, 500, 200]) == 3, f"[-1000, 300, 400, 500, 200] should pay back in year 3 (yours: {payback_period([-1000, 300, 400, 500, 200])})")
check(payback_period([-100, 50, 50]) == 2, "reaching exactly 0 counts: [-100, 50, 50] gives 2")
check(payback_period([-100, 20, 20]) is None, "never paying back should give None")
check(payback_period([-100, 150, -200, 300]) == 1, "the first year the cumulative total reaches 0 counts, even if it dips again later")
--- solution
def payback_period(cash_flows):
    cumulative = 0
    for year, cf in enumerate(cash_flows):
        cumulative += cf
        if year > 0 and cumulative >= 0:
            return year
    return None
```

Pass both and Module 3 is done. Check the Home page for **Mastered**. Module 4 (errors, files and Jupyter) is next: you'll install Python on your laptop and read the practice CSVs from real files.

**Next:** [Module 4 - Errors, files and Jupyter](../module-4/index.md)
