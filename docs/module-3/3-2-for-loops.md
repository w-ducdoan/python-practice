---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.2 For loops

[Module 3](index.md) · about 40 minutes

## The idea

A **for loop** runs the same block once for every item in a list. It's the equivalent of dragging a formula down a column.

```python
for cf in cash_flows:
    print(cf)
```

Read it as "for each `cf` in `cash_flows`, do the indented block." On each pass, `cf` holds the next item. The loop name (`cf`) is yours to choose. Pick one that reads well.

**The running total** is the pattern you'll use most. Start at zero before the loop, then add to it inside the loop:

```python
total = 0
for cf in cash_flows:
    if cf > 0:
        total += cf        # += is shorthand for total = total + cf
```

**Building a new list.** Start with an empty list `[]` and `.append` inside the loop.

**`range` for counting.** `range(5)` gives 0, 1, 2, 3, 4, and `range(1, 5)` gives 1, 2, 3, 4. The end is excluded, like slices. Use it when you need the position, for example to compare each price with the one before it:

```python
for i in range(1, len(prices)):
    daily_return = prices[i] / prices[i - 1] - 1
```

**`enumerate` gives both the position and the item**, which is exactly what discounting needs:

```python
for t, cf in enumerate(cash_flows):     # t = 0, 1, 2, ...
    pv_total += cf / (1 + rate) ** t
```

## Try it

```exercise
kind: example
id: ex-3-2
title: Loops in action
--- starter
cash_flows = [-1000, 300, 400, 500, 200]

total_in = 0
for cf in cash_flows:
    if cf > 0:
        total_in += cf
print("Total inflows:", total_in)

for t, cf in enumerate(cash_flows):
    print(f"Year {t}: {cf:>6}  PV at 10%: {cf / 1.1 ** t:>8.2f}")

for i in range(3):
    print("Pass number", i)
```

## Practice

**1.** Add up the inflows (the positive cash flows) with a loop. Don't use `sum()` here: the point is to practice the running-total pattern.

```exercise
id: m3-total-inflows
title: Running total
--- starter
cash_flows = [-1000, 300, 400, 500, 200]

total_inflows = 0
--- tests
check(total_inflows == 1400, f"total_inflows should be 1400 (yours: {total_inflows})")
ns = rerun("cash_flows = [-1000, 300, 400, 500, 200]", "cash_flows = [-50, 10, -5, 30]")
check(ns["total_inflows"] == 40, f"with [-50, 10, -5, 30], total_inflows should be 40 (yours: {ns['total_inflows']})")
check("for " in code and "sum(" not in code, "use a for loop rather than sum()")
--- hint
for cf in cash_flows: then, indented, an if that adds cf when it's positive.
--- solution
cash_flows = [-1000, 300, 400, 500, 200]

total_inflows = 0
for cf in cash_flows:
    if cf > 0:
        total_inflows += cf
```

**2.** Count the borrowers in breach: leverage above `max_lev`.

```exercise
id: m3-count-breaches
title: Count with a loop
--- starter
leverages = [4.2, 5.6, 3.1, 6.3, 5.25, 5.3]
max_lev = 5.25

breaches = 0
--- tests
check(breaches == 3, f"breaches should be 3 (yours: {breaches})")
ns = rerun("leverages = [4.2, 5.6, 3.1, 6.3, 5.25, 5.3]", "leverages = [6.0, 1.0]")
check(ns["breaches"] == 1, "with [6.0, 1.0], breaches should be 1")
--- hint
Same pattern as a running total, but add 1 each time instead of the value.
--- solution
leverages = [4.2, 5.6, 3.1, 6.3, 5.25, 5.3]
max_lev = 5.25

breaches = 0
for lev in leverages:
    if lev > max_lev:
        breaches += 1
```

**3.** Write `daily_returns(prices)`, which returns a list of each day's return versus the day before: today's price / yesterday's price - 1. A list of 4 prices gives 3 returns.

```exercise
id: m3-returns
title: Price series to returns
--- starter
def daily_returns(prices):
    returns = []

    return returns
--- tests
r = daily_returns([100, 102, 99.96, 101.9592])
check(len(r) == 3, f"4 prices should give 3 returns (yours: {len(r)})")
check(all(approx(a, b, 1e-9) for a, b in zip(r, [0.02, -0.02, 0.02])), f"returns should be [0.02, -0.02, 0.02] (yours: {r})")
r2 = daily_returns([50, 55])
check(len(r2) == 1 and approx(r2[0], 0.1, 1e-9), f"[50, 55] should give one return of 0.1 (yours: {r2})")
--- hint
Loop with for i in range(1, len(prices)): so that i - 1 always exists.
--- hint
Inside the loop: returns.append(prices[i] / prices[i - 1] - 1)
--- solution
def daily_returns(prices):
    returns = []
    for i in range(1, len(prices)):
        returns.append(prices[i] / prices[i - 1] - 1)
    return returns
```

**4.** Write `npv(rate, cash_flows)`: the sum of each cash flow / (1 + rate)^t, where t is its year. The first cash flow is year 0, so it isn't discounted. Use `enumerate`.

```exercise
id: m3-npv
title: NPV with enumerate
--- starter
def npv(rate, cash_flows):

--- tests
check(approx(npv(0.10, [-1000, 300, 400, 500, 200]), 115.57), f"npv(0.10, [-1000, 300, 400, 500, 200]) should be about 115.57 (yours: {npv(0.10, [-1000, 300, 400, 500, 200])})")
check(npv(0, [-1000, 300, 400, 500, 200]) == 400, "at a 0% rate, NPV is just the sum: 400")
check(approx(npv(0.05, [100]), 100), "a single year-0 cash flow isn't discounted")
--- hint
Start total = 0, then for t, cf in enumerate(cash_flows): add cf / (1 + rate) ** t
--- solution
def npv(rate, cash_flows):
    total = 0
    for t, cf in enumerate(cash_flows):
        total += cf / (1 + rate) ** t
    return total
```

**5.** Write `growth_path(start, rate, years)`, which returns the year-end balance for each year. Each year, balance = balance × (1 + rate). `growth_path(1000, 0.05, 3)` gives `[1050.0, 1102.5, 1157.625]`.

```exercise
id: m3-growth-path
title: Build a projection
--- starter
def growth_path(start, rate, years):

--- tests
path = growth_path(1000, 0.05, 3)
check(len(path) == 3 and all(approx(a, b, 1e-6) for a, b in zip(path, [1050.0, 1102.5, 1157.625])), f"growth_path(1000, 0.05, 3) should be [1050.0, 1102.5, 1157.625] (yours: {path})")
check(approx(growth_path(1000, 0.05, 5)[-1], 1276.28), "the year-5 balance should be about 1276.28")
check(growth_path(500, 0.1, 0) == [], "zero years should give an empty list")
--- hint
Keep a balance variable that starts at start. Each year: grow it, then append it.
--- hint
for year in range(years): balance = balance * (1 + rate), then path.append(balance)
--- solution
def growth_path(start, rate, years):
    path = []
    balance = start
    for year in range(years):
        balance = balance * (1 + rate)
        path.append(balance)
    return path
```

## Explain it back

In `daily_returns`, why does the loop use `range(1, len(prices))` instead of `range(len(prices))`?

??? note "Model answer"
    Each return compares `prices[i]` with `prices[i - 1]`. Starting at 0 would make the first comparison `prices[0]` vs `prices[-1]`, which is the last price, giving a garbage return. Starting at 1 means the day before always exists, so n prices give n - 1 returns.

**Next:** [3.3 Dictionaries](3-3-dicts.md)
