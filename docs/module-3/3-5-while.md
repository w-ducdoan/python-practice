---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.5 While loops and loop control

[Module 3](index.md) · about 35 minutes

## The idea

A `for` loop runs a known number of times: once per item. A **`while` loop** runs **until a condition stops being true**, which suits questions like "how many years until the debt is repaid?" where you don't know the count in advance.

```python
balance = 1.0
years = 0
while balance < 2.0:          # keep going while this is true
    balance *= 1.07
    years += 1
```

The danger: if nothing inside the loop ever makes the condition false, it runs forever. Some loans never amortize, for example, because the sweep doesn't even cover the interest. Guard against that before you loop. If you do write a runaway loop here, the site stops it after 10 seconds and tells you.

Two controls work in both kinds of loop:

- **`break`** exits the loop right away. Use it when you've found what you were looking for, like the first year a covenant breaks.
- **`continue`** skips the rest of this pass and moves to the next item. Use it to skip bad data, like a missing price.

Inside a function, `return` also exits the loop, since it ends the whole function. That's often the cleanest way to say "found it."

## Try it

```exercise
kind: example
id: ex-3-5
title: while, break, continue
--- starter
balance = 1.0
years = 0
while balance < 2.0:
    balance *= 1.07
    years += 1
print(f"Doubles in {years} years (balance {balance:.3f})")

leverage_path = [4.5, 4.9, 5.4, 5.0]
for year, lev in enumerate(leverage_path, start=1):     # start=1 counts years from 1
    if lev > 5.25:
        print("First breach in year", year)
        break

prices = [10, None, 5, -3, 7]
for p in prices:
    if p is None or p < 0:
        continue
    print("Using price", p)
```

## Practice

**1.** Write `years_to_double(rate)`. It returns how many whole years compounding at `rate` takes to reach at least twice the starting amount. Each year the balance grows to balance × (1 + rate). Return `None` if `rate` is zero or negative, since the loop would never end.

```exercise
id: m3-double
title: Years to double
--- starter
def years_to_double(rate):

--- tests
check(years_to_double(0.07) == 11, f"years_to_double(0.07) should be 11 (yours: {years_to_double(0.07)})")
check(years_to_double(0.10) == 8, "years_to_double(0.10) should be 8")
check(years_to_double(0.02) == 36, "years_to_double(0.02) should be 36")
check(years_to_double(0) is None and years_to_double(-0.05) is None, "a zero or negative rate should give None")
check("while" in code, "use a while loop")
--- hint
Guard first: if rate <= 0: return None
--- hint
Then the loop from the example, with rate instead of 0.07, and return years.
--- solution
def years_to_double(rate):
    if rate <= 0:
        return None
    balance = 1.0
    years = 0
    while balance < 2.0:
        balance *= 1 + rate
        years += 1
    return years
```

**2.** Write `first_breach_year(leverage_path, max_lev)`. It returns the first year (counting from 1) in which leverage is above `max_lev`, or `None` if it never is. Stop looking once you find it.

```exercise
id: m3-first-breach
title: Stop at the first match
--- starter
def first_breach_year(leverage_path, max_lev):

--- tests
check(first_breach_year([4.5, 4.9, 5.4, 5.0], 5.25) == 3, f"[4.5, 4.9, 5.4, 5.0] vs 5.25 should breach in year 3 (yours: {first_breach_year([4.5, 4.9, 5.4, 5.0], 5.25)})")
check(first_breach_year([6.0, 4.0], 5.25) == 1, "a breach in year 1 should give 1")
check(first_breach_year([4.0, 4.5, 5.25], 5.25) is None, "exactly at the max never breaches: None")
check(first_breach_year([], 5.0) is None, "an empty path should give None")
--- hint
for year, lev in enumerate(leverage_path, start=1):
--- hint
return year as soon as lev > max_lev. After the loop, return None.
--- solution
def first_breach_year(leverage_path, max_lev):
    for year, lev in enumerate(leverage_path, start=1):
        if lev > max_lev:
            return year
    return None
```

**3.** Write `clean_total(prices)`. It returns the sum of the prices, skipping `None` and negative values with `continue`.

```exercise
id: m3-skip-bad
title: Skip bad data
--- starter
def clean_total(prices):

--- tests
check(clean_total([10, None, 5, -3, 7]) == 22, f"clean_total([10, None, 5, -3, 7]) should be 22 (yours: {clean_total([10, None, 5, -3, 7])})")
check(clean_total([None, None]) == 0, "all-bad data should total 0")
check(clean_total([0, 4]) == 4, "zero is a valid price")
check("continue" in code, "use continue to skip the bad rows")
--- hint
Check None first: if p is None or p < 0: continue. Python stops evaluating "or" once the first part is true, so p < 0 never runs on None.
--- solution
def clean_total(prices):
    total = 0
    for p in prices:
        if p is None or p < 0:
            continue
        total += p
    return total
```

**4.** Write `years_to_repay(debt, annual_sweep, rate)`. Each year, debt grows by interest and then the sweep is paid: `debt = debt * (1 + rate) - annual_sweep`. Return how many years it takes for debt to reach zero or below. If the sweep doesn't even cover the first year's interest, the debt never shrinks, so return `None` before looping.

```exercise
id: m3-repay
title: Cash sweep paydown
--- starter
def years_to_repay(debt, annual_sweep, rate):

--- tests
check(years_to_repay(100, 30, 0.08) == 5, f"years_to_repay(100, 30, 0.08) should be 5 (yours: {years_to_repay(100, 30, 0.08)})")
check(years_to_repay(500, 60, 0.09) == 17, "years_to_repay(500, 60, 0.09) should be 17")
check(years_to_repay(100, 8, 0.08) is None, "a sweep equal to the interest never repays: None")
check(years_to_repay(100, 5, 0.08) is None, "a sweep below the interest never repays: None")
check(years_to_repay(0, 10, 0.08) == 0, "no debt takes 0 years")
--- hint
Guard: if debt > 0 and annual_sweep <= debt * rate: return None
--- hint
Then while debt > 0: update debt and add 1 to years.
--- solution
def years_to_repay(debt, annual_sweep, rate):
    if debt > 0 and annual_sweep <= debt * rate:
        return None
    years = 0
    while debt > 0:
        debt = debt * (1 + rate) - annual_sweep
        years += 1
    return years
```

## Explain it back

In `years_to_repay`, what would happen without the guard, if someone passed a sweep of 5 on $100 of debt at 8%?

??? note "Model answer"
    Interest adds $8 a year, but only $5 gets paid, so debt grows every year and `debt > 0` stays true forever. That's an infinite loop. The site would stop it after 10 seconds, but in a real script it would just hang. The guard spots the impossible case up front and returns `None`, the same "no meaningful answer" idea from Module 2.

**Next:** [3.6 Capstone - amortization schedule](3-6-capstone.md)
