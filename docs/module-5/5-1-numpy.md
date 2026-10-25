---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 5.1 NumPy arrays

[Module 5](index.md) · about 55 minutes

## The idea

A NumPy **array** is a list of numbers that does math on every item at once, with no loop. That's how Excel treats a whole column when you write one formula and fill it down:

```python
import numpy as np

cash_flows = np.array([-1000, 300, 400, 500, 200])
years = np.arange(len(cash_flows))           # array([0, 1, 2, 3, 4])
factors = 1 / (1 + 0.10) ** years             # one discount factor per year
npv = (cash_flows * factors).sum()            # 115.57
```

- `import numpy as np` loads NumPy under the short name `np`. Everyone uses that name.
- Math between an array and a number applies to every item: `prices * 2`, `1 / (1 + r) ** years`.
- Math between two arrays of the same length works item by item: `cash_flows * factors`.
- Arrays have methods: `.sum()`, `.mean()`, `.max()`, `.min()`, `.std()`.
- Slices work like lists: `prices[1:]` drops the first item and `prices[:-1]` drops the last. So `prices[1:] / prices[:-1] - 1` gives every daily return at once.

**Sample vs. population standard deviation.** `arr.std()` divides by n by default (population). For volatility from a sample of returns, you want n - 1, the version you used in econometrics: `arr.std(ddof=1)`. Annualize daily volatility by multiplying by √252, written `np.sqrt(252)`.

**Masks** are arrays of True/False, and they're how you filter:

```python
lev = np.array([4.2, 5.6, 3.1, 6.3])
over = lev > 5.25          # array([False, True, False, True])
lev[over]                   # array([5.6, 6.3])
over.sum()                  # 2. True counts as 1
np.where(over, "BREACH", "PASS")   # an IF() applied to the whole array
```

## Try it

```exercise
kind: example
id: ex-5-1
title: Vectorized math
packages: numpy
--- starter
import numpy as np

cash_flows = np.array([-1000, 300, 400, 500, 200])
years = np.arange(len(cash_flows))
factors = 1 / 1.10 ** years
print("factors:", factors.round(4))
print("NPV:", round((cash_flows * factors).sum(), 2))

prices = np.array([100, 102, 99.96, 101.9592])
returns = prices[1:] / prices[:-1] - 1
print("returns:", returns.round(4))

lev = np.array([4.2, 5.6, 3.1, 6.3])
print(lev > 5.25, lev[lev > 5.25], (lev > 5.25).sum())
print(np.where(lev > 5.25, "BREACH", "PASS"))
```

## Practice

No `for` loops on this page: the point is to let NumPy do the looping.

**1.** Write `npv_np(rate, cash_flows)` without a loop: the sum of each cash flow / (1 + rate)^t, with t = 0, 1, 2 and so on. `cash_flows` arrives as an ordinary list, so convert it to an array first.

```exercise
id: m5-npv-np
title: NPV without a loop
packages: numpy
--- starter
import numpy as np

def npv_np(rate, cash_flows):

--- tests
check(approx(npv_np(0.10, [-1000, 300, 400, 500, 200]), 115.57), f"npv_np(0.10, [-1000, 300, 400, 500, 200]) should be about 115.57 (yours: {npv_np(0.10, [-1000, 300, 400, 500, 200])})")
check(approx(npv_np(0, [-1000, 300, 400, 500, 200]), 400), "at a 0% rate, NPV is the plain sum: 400")
check("for " not in code, "no for loop: use np.arange for the years and multiply the arrays")
--- hint
cf = np.array(cash_flows), then years = np.arange(len(cf)).
--- hint
return (cf / (1 + rate) ** years).sum()
--- solution
import numpy as np

def npv_np(rate, cash_flows):
    cf = np.array(cash_flows)
    years = np.arange(len(cf))
    return (cf / (1 + rate) ** years).sum()
```

**2.** Write `returns_np(prices)`, which returns an array of simple returns (today's price / yesterday's price - 1), one shorter than the prices. Use slicing, not a loop.

```exercise
id: m5-returns-np
title: Returns in one line
packages: numpy
--- starter
import numpy as np

def returns_np(prices):

--- tests
import numpy as np
r = returns_np(np.array([100, 102, 99.96, 101.9592]))
check(len(r) == 3 and np.allclose(r, [0.02, -0.02, 0.02]), f"should be [0.02, -0.02, 0.02] (yours: {r})")
check(np.allclose(returns_np(np.array([50.0, 55.0])), [0.1]), "[50, 55] should give [0.1]")
check("for " not in code, "no for loop: use prices[1:] and prices[:-1]")
--- hint
Today's prices are prices[1:], and the matching previous days are prices[:-1].
--- solution
import numpy as np

def returns_np(prices):
    return prices[1:] / prices[:-1] - 1
```

**3.** Write `ann_vol(daily_returns)`: the annualized volatility, using the **sample** standard deviation times √252.

```exercise
id: m5-ann-vol
title: Annualized volatility
packages: numpy
--- starter
import numpy as np

def ann_vol(daily_returns):

--- tests
import numpy as np
v = ann_vol(np.array([0.01, -0.02, 0.015, 0.005]))
check(approx(v, 0.246779, 1e-6), f"should be about 0.246779 (yours: {v})")
check(not approx(v, 0.213717, 1e-6), "that's the population std. Use ddof=1 for a sample")
--- hint
np.std divides by n unless you pass ddof=1.
--- hint
return daily_returns.std(ddof=1) * np.sqrt(252)
--- solution
import numpy as np

def ann_vol(daily_returns):
    return daily_returns.std(ddof=1) * np.sqrt(252)
```

**4.** Write `breach_summary(leverages, max_lev)`. It returns two values: how many are above `max_lev` (an int), and an array of the breaching values. Use a mask.

```exercise
id: m5-mask
title: Filter with a mask
packages: numpy
--- starter
import numpy as np

def breach_summary(leverages, max_lev):

--- tests
import numpy as np
count, values = breach_summary(np.array([4.2, 5.6, 3.1, 6.3, 5.25, 5.3]), 5.25)
check(count == 3, f"3 values are above 5.25 (yours: {count})")
check(list(values) == [5.6, 6.3, 5.3], f"the breaching values should be [5.6, 6.3, 5.3] (yours: {list(values)})")
count0, values0 = breach_summary(np.array([1.0, 2.0]), 5.0)
check(count0 == 0 and len(values0) == 0, "no breaches should give 0 and an empty array")
check("for " not in code, "no for loop: build a mask with >")
--- hint
mask = leverages > max_lev
--- hint
return mask.sum(), leverages[mask]
--- solution
import numpy as np

def breach_summary(leverages, max_lev):
    mask = leverages > max_lev
    return int(mask.sum()), leverages[mask]
```

**5.** Write `covenant_labels(leverages, max_lev)`, which returns an array of `"BREACH"` or `"PASS"` for each value. Use `np.where`.

```exercise
id: m5-where
title: IF() for a whole array
packages: numpy
--- starter
import numpy as np

def covenant_labels(leverages, max_lev):

--- tests
import numpy as np
labels = covenant_labels(np.array([4.2, 5.6, 5.25]), 5.25)
check(list(labels) == ["PASS", "BREACH", "PASS"], f"should be PASS, BREACH, PASS: exactly 5.25 passes (yours: {list(labels)})")
check("np.where" in code, "use np.where(condition, value_if_true, value_if_false)")
--- hint
return np.where(leverages > max_lev, "BREACH", "PASS")
--- solution
import numpy as np

def covenant_labels(leverages, max_lev):
    return np.where(leverages > max_lev, "BREACH", "PASS")
```

## Explain it back

Why does annualized volatility use `ddof=1`, and what would change if you left it out?

??? note "Model answer"
    Daily returns are a sample, not the whole population, so the unbiased variance divides by n - 1. That's what `ddof=1` does ("delta degrees of freedom"). Without it NumPy divides by n, which slightly understates volatility. Over thousands of days the gap is tiny, but on short samples it matters, and the CFA material and Excel's `STDEV.S` both use the sample version.

**Next:** [5.2 DataFrames](5-2-dataframes.md)
