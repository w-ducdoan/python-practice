---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 2.3 Decisions inside functions

[Module 2](index.md) · about 40 minutes

## The idea

Put `if` inside a function and the function can give different answers for different inputs, the way a pricing grid or a covenant does. A few patterns come up constantly.

**Return a comparison directly.** No `if` needed when the answer is just True/False:

```python
def is_breach(leverage, max_leverage):
    return leverage > max_leverage
```

**Return from inside each branch.** `return` ends the function immediately, so the first branch that returns wins:

```python
def spread_for(leverage):
    if leverage > 5.0:
        return 650
    elif leverage > 4.0:
        return 575
    return 500          # reached only if neither branch returned
```

**Default values.** `def ear(nominal, periods_per_year=12)` makes the second input optional. `ear(0.12)` uses 12, and `ear(0.12, 4)` overrides it. Parameters with defaults go last.

**`None` for "no meaningful answer."** Leverage with zero EBITDA, or a terminal value where WACC ≤ g, shouldn't produce a number or a crash. Return `None` and check for it with `is None`:

```python
def safe_divide(a, b):
    if b == 0:
        return None
    return a / b
```

Good functions handle the **edge cases** an analyst would flag: zero, negative, exactly on the boundary, data in the wrong units. The tests below check those.

## Try it

```exercise
kind: example
id: ex-2-3
title: Early returns and defaults
--- starter
def ear(nominal, periods_per_year=12):
    return (1 + nominal / periods_per_year) ** periods_per_year - 1

def safe_divide(a, b):
    if b == 0:
        return None
    return a / b

print(round(ear(0.12), 6))        # uses the default, 12
print(round(ear(0.12, 4), 6))     # overrides it
print(safe_divide(450, 90))
result = safe_divide(450, 0)
print(result, result is None)
```

## Practice

**1.** Write `is_breach(leverage, max_leverage=5.0)`. It returns `True` if leverage is above the maximum. The maximum defaults to 5.0x.

```exercise
id: m2-is-breach
title: Default parameter
--- starter
def is_breach(leverage, max_leverage=5.0):

--- tests
check(is_breach(5.6) is True, "is_breach(5.6) uses the 5.0x default, so it should be True")
check(is_breach(4.9) is False, "is_breach(4.9) should be False")
check(is_breach(5.0) is False, "exactly at the maximum is not a breach")
check(is_breach(5.6, 6.0) is False, "is_breach(5.6, 6.0) should be False: the 6.0x max overrides the default")
--- hint
One line: return leverage > max_leverage
--- solution
def is_breach(leverage, max_leverage=5.0):
    return leverage > max_leverage
```

**2.** Write `safe_divide(a, b)`. It returns `a / b`, or `None` when `b` is zero. Then use it to set `lev = safe_divide(450, 0)`.

```exercise
id: m2-safe-div
title: None for no answer
--- starter
def safe_divide(a, b):


lev = safe_divide(450, 0)
--- tests
check(safe_divide(10, 2) == 5, "safe_divide(10, 2) should be 5")
check(safe_divide(10, 0) is None, f"safe_divide(10, 0) should be None (yours: {safe_divide(10, 0)})")
check(lev is None, "lev should be None")
--- hint
Check for zero first and return None. Otherwise return the division.
--- solution
def safe_divide(a, b):
    if b == 0:
        return None
    return a / b

lev = safe_divide(450, 0)
```

**3.** Write the margin grid for a term loan as `spread_for(leverage)`, returning the spread in bps:

| Total leverage | Spread (bps) |
| :-- | :-- |
| Above 5.0x | 650 |
| Above 4.0x, up to 5.0x | 575 |
| Above 3.0x, up to 4.0x | 500 |
| 3.0x or below | 450 |

```exercise
id: m2-pricing-grid
title: Margin grid
--- starter
def spread_for(leverage):

--- tests
for lev, bps in [(5.5, 650), (5.0, 575), (4.5, 575), (4.0, 500), (3.2, 500), (3.0, 450), (2.0, 450)]:
    check(spread_for(lev) == bps, f"spread_for({lev}) should be {bps} (yours: {spread_for(lev)})")
--- hint
Start with the highest tier: if leverage > 5.0: return 650
--- hint
"Up to 5.0x" includes 5.0, so the first test is > 5.0, not >= 5.0.
--- solution
def spread_for(leverage):
    if leverage > 5.0:
        return 650
    elif leverage > 4.0:
        return 575
    elif leverage > 3.0:
        return 500
    return 450
```

**4.** The loan tape you'll clean in Module 6 has LTVs entered two ways: `0.55` and `55`. Write `normalize_ltv(ltv)`, which returns the decimal form. Anything above 1.5 must be a percent, so divide it by 100. Values at or below 1.5 are already decimals. (An LTV above 100%, like 1.2, is real in distressed credit.)

```exercise
id: m2-normalize-ltv
title: Fix units in messy data
--- starter
def normalize_ltv(ltv):

--- tests
for raw, clean in [(55, 0.55), (0.55, 0.55), (1.2, 1.2), (120, 1.2), (1.0, 1.0)]:
    check(approx(normalize_ltv(raw), clean, 1e-9), f"normalize_ltv({raw}) should be {clean} (yours: {normalize_ltv(raw)})")
--- hint
if ltv > 1.5: return ltv / 100. Otherwise return ltv unchanged.
--- solution
def normalize_ltv(ltv):
    if ltv > 1.5:
        return ltv / 100
    return ltv
```

**5.** Turn the Module 1 annuity formula into `payment(principal, annual_rate, years, periods_per_year=12)`. The formula is payment = principal × r / (1 - (1 + r)^-n), where r = annual_rate / periods_per_year and n = years × periods_per_year. Handle the edge case: at a 0% rate the formula divides by zero, so return principal divided by the number of payments instead.

```exercise
id: m2-payment-func
title: Loan payment with an edge case
--- starter
def payment(principal, annual_rate, years, periods_per_year=12):

--- tests
check(approx(payment(250000, 0.065, 30), 1580.17), f"payment(250000, 0.065, 30) should be about 1580.17 (yours: {payment(250000, 0.065, 30)})")
check(approx(payment(50, 0.0955, 5, 4), 3.1734, 0.001), "quarterly: payment(50, 0.0955, 5, 4) should be about 3.1734")
check(payment(1200, 0, 1) == 100, "at a 0% rate, payment(1200, 0, 1) should be 100 (1200 over 12 months)")
--- hint
Work out r = annual_rate / periods_per_year and n = years * periods_per_year first.
--- hint
Check annual_rate == 0 before using the formula, and return principal / n in that case.
--- solution
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)
```

## Explain it back

Why return `None` instead of `0` when EBITDA is zero and someone asks for leverage?

??? note "Model answer"
    Zero would be a wrong answer that looks like a great one: 0.0x leverage reads as no debt. `None` says "this has no meaningful value," and the code that uses it can check `is None` and flag it as N/M, the way a credit memo would, instead of quietly treating the credit as unlevered.

**Next:** [2.4 Building with functions](2-4-building.md)
