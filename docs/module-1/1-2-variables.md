---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 1.2 Variables

[Module 1](index.md) · about 30 minutes

## The idea

A **variable** is a name for a value, like a named cell in Excel. Instead of re-typing `0.06` everywhere, you write `rate = 0.06` once and use `rate` from then on.

```python
principal = 10000
rate = 0.06
fv = principal * (1 + rate) ** 8
```

Read `=` as "store the result in," not "equals." Python works out the right-hand side first, then stores it under the name on the left. That's why this line works:

```python
debt = debt - 100   # take the current debt, subtract 100, store it back as debt
```

**Naming rules:** use lowercase words joined by underscores (`net_debt`, `max_leverage`). No spaces, and a name can't start with a number. Names are case-sensitive, so `Debt` and `debt` are two different variables. Pick names a colleague could read without asking you.

A variable only updates when you assign to it. If you change `rate` after calculating `fv`, `fv` keeps its old value, unlike Excel, where formulas recalculate on their own. Code runs top to bottom, once.

## Try it

```exercise
kind: example
id: ex-1-2
title: Variables in action
--- starter
debt = 450
ebitda = 90
leverage = debt / ebitda
print("Leverage:", leverage)

debt = debt - 100        # $100m paydown
print("Debt after paydown:", debt)
print("Leverage variable still says:", leverage)   # not recalculated
leverage = debt / ebitda
print("Recalculated leverage:", round(leverage, 2))
```

## Practice

From here on, the tests check your **variables**, not just what you print. Use the exact names given.

**1.** Create `fv`: the future value of `principal` at `rate` for `years`. Use the variables, not the numbers.

```exercise
id: m1-fv
title: Future value with variables
--- starter
principal = 10000
rate = 0.06
years = 8

fv =
--- tests
check(approx(fv, 15938.48), f"fv should be about 15938.48 (yours: {fv})")
check("principal" in code.split("fv")[-1] and "rate" in code.split("fv")[-1], "build fv from the variables principal, rate and years")
--- hint
fv = principal * (1 + rate) ** years
--- solution
principal = 10000
rate = 0.06
years = 8

fv = principal * (1 + rate) ** years
```

**2.** Create `pv`: the present value of $1,000,000 received in 5 years, discounted at 8%. Create the variables `cash_flow`, `discount_rate` and `years` first.

```exercise
id: m1-pv
title: Present value
--- starter
# create cash_flow, discount_rate, years, then pv

--- tests
check(cash_flow == 1000000, "cash_flow should be 1000000")
check(discount_rate == 0.08, "discount_rate should be 0.08")
check(years == 5, "years should be 5")
check(approx(pv, 680583.20), f"pv should be about 680583.20 (yours: {pv})")
--- hint
PV = cash flow / (1 + rate) ** years
--- hint
You can write 1000000 or 1_000_000. Python ignores underscores inside numbers, which helps readability.
--- solution
cash_flow = 1_000_000
discount_rate = 0.08
years = 5
pv = cash_flow / (1 + discount_rate) ** years
```

**3.** A borrower has $450m of debt and $90m of EBITDA. Calculate `leverage`. Then the borrower repays $100m: update `debt` and calculate `new_leverage`.

```exercise
id: m1-leverage
title: Leverage before and after a paydown
--- starter
debt = 450
ebitda = 90
leverage =

# $100m paydown: update debt, then calculate new_leverage

--- tests
check(approx(leverage, 5.0), f"leverage should be 5.0 (yours: {leverage})")
check(debt == 350, f"debt should be 350 after the paydown (yours: {debt})")
check(approx(new_leverage, 3.89), f"new_leverage should be about 3.89 (yours: {new_leverage})")
check("debt=debt-100" in code.replace(" ", "") or "debt-=100" in code.replace(" ", ""), "update debt with debt = debt - 100 rather than typing 350")
--- hint
Leverage is debt divided by EBITDA.
--- hint
Update with debt = debt - 100, then new_leverage = debt / ebitda.
--- solution
debt = 450
ebitda = 90
leverage = debt / ebitda

debt = debt - 100
new_leverage = debt / ebitda
```

**4.** Track a cash balance. Start with $500. Buy a position for $120, then receive a $75 dividend. Update `cash` after each step.

```exercise
id: m1-cash
title: Running cash balance
--- starter
cash = 500
# buy a $120 position

# receive a $75 dividend

--- tests
check(cash == 455, f"cash should end at 455 (yours: {cash})")
check(code.count("cash =") + code.count("cash -=") + code.count("cash +=") >= 3, "update cash on its own line for each step")
--- hint
Each step is cash = cash - something or cash = cash + something.
--- solution
cash = 500
cash = cash - 120
cash = cash + 75
```

**5.** Rewrite last lesson's bond price using variables: `coupon`, `face`, `ytm`. Store the result in `price`.

```exercise
id: m1-bond-vars
title: Bond price with variables
--- starter
coupon = 5
face = 100
ytm = 0.06

price =
--- tests
check(approx(price, 97.327, 0.001), f"price should be about 97.327 (yours: {price})")
check("ytm" in code.split("price")[-1], "use ytm in the formula instead of typing 1.06")
--- hint
Year 3 pays coupon + face.
--- solution
coupon = 5
face = 100
ytm = 0.06

price = coupon / (1 + ytm) + coupon / (1 + ytm) ** 2 + (coupon + face) / (1 + ytm) ** 3
```

## Explain it back

You set `rate = 0.06`, calculate `fv`, then change `rate = 0.07`. What is `fv` now, and why is this different from Excel?

??? note "Model answer"
    `fv` still holds the value calculated at 6%. Python ran the `fv` line once, when it reached it, and doesn't recalculate it later. Excel recalculates formulas whenever an input changes. To get the 7% answer in Python, run the `fv` line again after changing `rate`.

**Next:** [1.3 Text and formatting](1-3-strings.md)
