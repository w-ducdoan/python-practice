---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 2.2 Functions

[Module 2](index.md) · about 40 minutes

## The idea

So far, to price a second bond you'd copy the whole calculation and change the numbers. A **function** lets you write the calculation once and reuse it with any inputs, like a custom Excel formula (or Excel's `LAMBDA`).

```python
def leverage(debt, ebitda):
    return debt / ebitda

print(leverage(450, 90))     # 5.0
print(leverage(350, 90))     # 3.888...
```

- `def` starts a function definition. Next come its **name**, its **parameters** (the inputs) in parentheses, and a colon.
- The indented body does the work. `return` hands the answer back to whoever **called** the function.
- **Calling** it, as in `leverage(450, 90)`, runs the body with `debt = 450` and `ebitda = 90`. The values you pass in are the **arguments**.
- Defining a function doesn't run it. Nothing happens until you call it.

**`return` is not `print`.** `print` shows a value on screen and then it's gone. `return` gives the value back so you can store it, compare it, or feed it into another calculation. A function with no `return` gives back `None`, Python's word for "nothing." It's the most common beginner bug, and exercise 3 below is about exactly that.

From here on, tests call **your function** with several different inputs, the way a model gets reused across deals.

## Try it

```exercise
kind: example
id: ex-2-2
title: Define once, call many times
--- starter
def leverage(debt, ebitda):
    return debt / ebitda

def show_leverage(debt, ebitda):
    print(debt / ebitda)          # prints, but returns nothing

a = leverage(450, 90)
b = show_leverage(450, 90)
print("a holds:", a)
print("b holds:", b)              # None: show_leverage never returned anything
print("Paydown case:", round(leverage(350, 90), 2))
```

## Practice

**1.** Write `fv(principal, rate, years)`. It should return the future value, principal × (1 + rate)^years.

```exercise
id: m2-fv-func
title: Future value function
--- starter
def fv(principal, rate, years):
    # your code here

--- tests
check(approx(fv(10000, 0.06, 8), 15938.48), f"fv(10000, 0.06, 8) should be about 15938.48 (yours: {fv(10000, 0.06, 8)})")
check(approx(fv(1000, 0.05, 10), 1628.89), "fv(1000, 0.05, 10) should be about 1628.89")
check(fv(500, 0, 3) == 500, "at a 0% rate, the money shouldn't grow: fv(500, 0, 3) should be 500")
--- hint
One line: return principal * (1 + rate) ** years. Indent it inside the def.
--- solution
def fv(principal, rate, years):
    return principal * (1 + rate) ** years
```

**2.** Write `pv(cash_flow, rate, years)`. It should return the present value, cash_flow / (1 + rate)^years.

```exercise
id: m2-pv-func
title: Present value function
--- starter
def pv(cash_flow, rate, years):

--- tests
check(approx(pv(1_000_000, 0.08, 5), 680583.20), "pv(1_000_000, 0.08, 5) should be about 680583.20")
check(approx(pv(100, 0.10, 1), 90.909, 0.001), "pv(100, 0.10, 1) should be about 90.909")
--- hint
return cash_flow / (1 + rate) ** years
--- solution
def pv(cash_flow, rate, years):
    return cash_flow / (1 + rate) ** years
```

**3.** `margin` prints the right number, but `ebitda_margin` ends up as `None`. Fix the function.

```exercise
id: m2-return-bug
title: print is not return
--- starter
def margin(ebitda, revenue):
    print(ebitda / revenue)

ebitda_margin = margin(312.5, 1250)
--- tests
check(ebitda_margin == 0.25, f"ebitda_margin should be 0.25 (yours: {ebitda_margin})")
check(approx(margin(30, 200), 0.15, 1e-9), "margin(30, 200) should return 0.15")
--- hint
Replace print with return.
--- solution
def margin(ebitda, revenue):
    return ebitda / revenue

ebitda_margin = margin(312.5, 1250)
```

**4.** Write `ear(nominal, periods_per_year)`: the effective annual rate for a nominal rate compounded `periods_per_year` times a year: (1 + nominal / periods_per_year)^periods_per_year - 1.

```exercise
id: m2-ear-func
title: Effective annual rate function
--- starter
def ear(nominal, periods_per_year):

--- tests
check(approx(ear(0.12, 12), 0.126825, 1e-6), f"ear(0.12, 12) should be about 0.126825 (yours: {ear(0.12, 12)})")
check(approx(ear(0.10, 1), 0.10, 1e-9), "compounding once a year: ear(0.10, 1) should be 0.10")
check(approx(ear(0.06, 4), 0.061364, 1e-6), "ear(0.06, 4) should be about 0.061364")
--- hint
Module 1 version: (1 + 0.12 / 12) ** 12 - 1. Swap the numbers for the parameters.
--- solution
def ear(nominal, periods_per_year):
    return (1 + nominal / periods_per_year) ** periods_per_year - 1
```

**5.** Write `fmt_money(amount)`, which returns the amount as text with a dollar sign, commas and 2 decimals. You'll reuse it in reports later.

```exercise
id: m2-fmt-money
title: A money formatter
--- starter
def fmt_money(amount):

--- tests
check(fmt_money(1580.1700587) == "$1,580.17", f"fmt_money(1580.1700587) should be '$1,580.17' (yours: {fmt_money(1580.1700587)!r})")
check(fmt_money(0) == "$0.00", "fmt_money(0) should be '$0.00'")
check(fmt_money(1234567.891) == "$1,234,567.89", "fmt_money(1234567.891) should be '$1,234,567.89'")
--- hint
Return an f-string. The format code from Module 1 is ,.2f
--- solution
def fmt_money(amount):
    return f"${amount:,.2f}"
```

## Explain it back

What's the difference between a function that ends with `print(x)` and one that ends with `return x`? When does it matter?

??? note "Model answer"
    `print(x)` only shows x on screen. The function still gives back `None`, so you can't store or reuse the result. `return x` hands x back to the caller, so you can save it in a variable, compare it, or pass it into another function. It matters any time the result feeds a later calculation, which in real work is almost always.

**Next:** [2.3 Decisions inside functions](2-3-decision-functions.md)
