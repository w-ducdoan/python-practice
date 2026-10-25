---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.1 Lists

[Module 3](index.md) · about 35 minutes

## The idea

A **list** holds many values in order, like a row of cash flows or a column of prices. Use square brackets with commas between the items:

```python
cash_flows = [-1000, 300, 400, 500, 200]
```

**Positions start at 0, not 1.** `cash_flows[0]` is the first item (-1000), and `cash_flows[1]` is the second. Think of the position as "how many steps from the start": year 0 is the investment, year 1 is the first inflow. Negative positions count from the end, so `cash_flows[-1]` is the last item (200).

| You want | Python | Result |
| :-- | :-- | :-- |
| Number of items | `len(cash_flows)` | `5` |
| Total, smallest, largest | `sum(...)`, `min(...)`, `max(...)` | `400`, `-1000`, `500` |
| A slice: positions 1 up to (not including) 3 | `cash_flows[1:3]` | `[300, 400]` |
| Everything from position 1 on | `cash_flows[1:]` | `[300, 400, 500, 200]` |
| The last 2 | `cash_flows[-2:]` | `[500, 200]` |
| Add to the end | `cash_flows.append(150)` | the list grows by one |
| Is it in there? | `500 in cash_flows` | `True` |

Slices stop **before** the second number. `[1:3]` means positions 1 and 2. It feels odd at first, but it means `[:3]` is "the first 3" and `[3:]` is "everything after them," with no overlap.

Ask for a position that doesn't exist, like `cash_flows[5]` on a 5-item list, and you'll get a new error: `IndexError`.

## Try it

```exercise
kind: example
id: ex-3-1
title: Lists in action
--- starter
cash_flows = [-1000, 300, 400, 500, 200]
print(cash_flows[0], cash_flows[1], cash_flows[-1])
print(len(cash_flows), sum(cash_flows), max(cash_flows))
print(cash_flows[1:3], cash_flows[1:], cash_flows[-2:])

watchlist = ["ACME", "BRKN"]
watchlist.append("CNDL")
print(watchlist, "BRKN" in watchlist, "ZZZZ" in watchlist)
```

## Practice

Keep the input line exactly as given. The tests swap in other lists.

**1.** From `cash_flows`, create `initial` (the first item), `final` (the last item, using a negative position), `n_years` (the number of years after year 0), and `inflows` (everything after the first item).

```exercise
id: m3-list-basics
title: Positions and slices
--- starter
cash_flows = [-1000, 300, 400, 500, 200]

--- tests
check(initial == -1000 and final == 200, f"initial should be -1000 and final 200 (yours: {initial}, {final})")
check(n_years == 4, f"n_years should be 4 (yours: {n_years})")
check(inflows == [300, 400, 500, 200], f"inflows should be [300, 400, 500, 200] (yours: {inflows})")
ns = rerun("cash_flows = [-1000, 300, 400, 500, 200]", "cash_flows = [-50, 10, 20, 30]")
check(ns["initial"] == -50 and ns["final"] == 30 and ns["n_years"] == 3 and ns["inflows"] == [10, 20, 30],
      "with [-50, 10, 20, 30] you should get -50, 30, 3 and [10, 20, 30]. Use positions and len, not typed numbers")
--- hint
The last item is cash_flows[-1]. The number of years after year 0 is len(cash_flows) - 1.
--- hint
Everything after the first item is the slice cash_flows[1:].
--- solution
cash_flows = [-1000, 300, 400, 500, 200]

initial = cash_flows[0]
final = cash_flows[-1]
n_years = len(cash_flows) - 1
inflows = cash_flows[1:]
```

**2.** From a week of closing prices, create `high`, `low`, `average`, and `range_pct`: the high-to-low range as a fraction of the low.

```exercise
id: m3-price-stats
title: Price statistics
--- starter
prices = [101.2, 99.8, 103.5, 98.1, 104.0]

--- tests
check(high == 104.0 and low == 98.1, f"high should be 104.0 and low 98.1 (yours: {high}, {low})")
check(approx(average, 101.32), f"average should be about 101.32 (yours: {average})")
check(approx(range_pct, 0.0601, 0.0001), f"range_pct should be about 0.0601 (yours: {range_pct})")
ns = rerun("prices = [101.2, 99.8, 103.5, 98.1, 104.0]", "prices = [10, 20, 30]")
check(ns["average"] == 20 and approx(ns["range_pct"], 2.0), "with [10, 20, 30], average should be 20 and range_pct 2.0")
--- hint
average = sum(prices) / len(prices)
--- hint
range_pct = (high - low) / low
--- solution
prices = [101.2, 99.8, 103.5, 98.1, 104.0]

high = max(prices)
low = min(prices)
average = sum(prices) / len(prices)
range_pct = (high - low) / low
```

**3.** Add `"CNDL"` and then `"DLTA"` to the watchlist with `.append`. Then create `on_list`, which is `True` if `"BRKN"` is on the watchlist.

```exercise
id: m3-append
title: Grow a list
--- starter
watchlist = ["ACME", "BRKN"]

--- tests
check(watchlist == ["ACME", "BRKN", "CNDL", "DLTA"], f"watchlist should end as ['ACME', 'BRKN', 'CNDL', 'DLTA'] (yours: {watchlist})")
check(code.count(".append(") >= 2, "use .append(...) for each new ticker")
check(on_list is True, "on_list should be True")
check(" in watchlist" in code, "use the in keyword to check membership")
--- hint
watchlist.append("CNDL") changes the list in place. There's no need to write watchlist = ...
--- solution
watchlist = ["ACME", "BRKN"]

watchlist.append("CNDL")
watchlist.append("DLTA")
on_list = "BRKN" in watchlist
```

**4.** Run this and read the new error. Then fix it so `last` is the final price, for a list of any length.

```exercise
id: m3-index-fix
title: Fix the IndexError
--- starter
prices = [101.2, 99.8, 103.5, 98.1, 104.0]
last = prices[len(prices)]
--- tests
check(last == 104.0, f"last should be 104.0 (yours: {last})")
ns = rerun("prices = [101.2, 99.8, 103.5, 98.1, 104.0]", "prices = [5, 6, 7]")
check(ns["last"] == 7, "with [5, 6, 7], last should be 7")
--- hint
A 5-item list has positions 0 to 4. len(prices) is 5, one past the end.
--- hint
Either prices[len(prices) - 1] or, more simply, prices[-1].
--- solution
prices = [101.2, 99.8, 103.5, 98.1, 104.0]
last = prices[-1]
```

**5.** From 12 monthly returns, create `q1` (the first 3 months), `q4` (the last 3), and `h2` (months 7 to 12).

```exercise
id: m3-slices
title: Slice a year of returns
--- starter
monthly = [0.012, -0.004, 0.021, 0.008, -0.015, 0.003, 0.017, 0.009, -0.022, 0.014, 0.006, 0.011]

--- tests
check(q1 == [0.012, -0.004, 0.021], f"q1 should be the first three months (yours: {q1})")
check(q4 == [0.014, 0.006, 0.011], f"q4 should be the last three months (yours: {q4})")
check(h2 == [0.017, 0.009, -0.022, 0.014, 0.006, 0.011], f"h2 should be months 7-12, six items (yours: {h2})")
ns = rerun("monthly = [0.012, -0.004, 0.021, 0.008, -0.015, 0.003, 0.017, 0.009, -0.022, 0.014, 0.006, 0.011]", "monthly = list(range(1, 13))")
check(ns["q1"] == [1, 2, 3] and ns["q4"] == [10, 11, 12] and ns["h2"] == [7, 8, 9, 10, 11, 12],
      "with months numbered 1-12, q1 should be [1, 2, 3], q4 [10, 11, 12] and h2 [7, ..., 12]. Use slices of monthly, not typed lists")
--- hint
Month 7 is at position 6, because positions start at 0.
--- hint
q1 = monthly[:3], q4 = monthly[-3:], h2 = monthly[6:]
--- solution
monthly = [0.012, -0.004, 0.021, 0.008, -0.015, 0.003, 0.017, 0.009, -0.022, 0.014, 0.006, 0.011]

q1 = monthly[:3]
q4 = monthly[-3:]
h2 = monthly[6:]
```

## Explain it back

Why is year 1's cash flow at `cash_flows[1]`, and why is that handy for finance?

??? note "Model answer"
    Positions start at 0, so the first item, the year-0 investment, is at position 0. Each year's cash flow then sits at the position equal to its year number, which means the position can serve directly as the discount exponent: `cash_flows[t] / (1 + r) ** t`.

**Next:** [3.2 For loops](3-2-for-loops.md)
