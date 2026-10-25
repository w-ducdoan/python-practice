---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 2.4 Building with functions

[Module 2](index.md) · about 35 minutes

## The idea

Real tools are built from small functions that call each other, the way a model's summary tab pulls from the operating build, which pulls from the assumptions.

```python
def ebitda(revenue, margin):
    return revenue * margin

def leverage(debt, revenue, margin):
    return debt / ebitda(revenue, margin)     # reuses ebitda()
```

Build and test each small piece on its own, then combine them. When something breaks, you'll know which piece to look at.

**Scope.** Variables created inside a function exist only inside it. They're its scratch work. Once the function returns, they're gone, and code outside can't see them. The only thing that leaves a function is what it returns. (If you try to use one of those variables outside, you'll get a `NameError`. Exercise 2 is exactly that bug.)

**Returning two values.** Separate them with a comma, then "unpack" them into two names when you call the function:

```python
def mid_and_spread(bid, ask):
    mid = (bid + ask) / 2
    return mid, ask - bid

mid, width = mid_and_spread(99.5, 100.5)    # mid = 100.0, width = 1.0
```

**Docstrings.** A string on the first line of a function says what it does. Python ignores it, but your future self won't:

```python
def leverage(debt, revenue, margin):
    """Total debt / EBITDA, in turns (x)."""
```

## Try it

```exercise
kind: example
id: ex-2-4
title: Functions calling functions
--- starter
def ebitda(revenue, margin):
    """EBITDA from revenue and margin."""
    return revenue * margin

def leverage(debt, revenue, margin):
    """Total debt / EBITDA, in turns."""
    return debt / ebitda(revenue, margin)

def mid_and_spread(bid, ask):
    mid = (bid + ask) / 2
    return mid, ask - bid

print(round(leverage(900, 1250, 0.25), 2))
mid, width = mid_and_spread(99.5, 100.5)
print(mid, width)
```

## Practice

**1.** Write `ebitda(revenue, margin)`, then `leverage(debt, revenue, margin)`. EBITDA = revenue × margin, and leverage = debt / EBITDA. `leverage` must call `ebitda` rather than repeat the math.

```exercise
id: m2-compose
title: One function calls another
--- starter
def ebitda(revenue, margin):


def leverage(debt, revenue, margin):

--- tests
check(ebitda(1250, 0.25) == 312.5, "ebitda(1250, 0.25) should be 312.5")
check(approx(leverage(900, 1250, 0.25), 2.88), f"leverage(900, 1250, 0.25) should be 2.88 (yours: {leverage(900, 1250, 0.25)})")
check("ebitda(" in code.split("def leverage")[-1], "inside leverage, call ebitda(...) instead of repeating revenue * margin")
--- hint
leverage's body is one line: return debt / ebitda(revenue, margin)
--- solution
def ebitda(revenue, margin):
    return revenue * margin


def leverage(debt, revenue, margin):
    return debt / ebitda(revenue, margin)
```

**2.** Run this and read the error. `total` exists only inside the function. Fix it so the function returns the total and the last line prints `1020.0`.

```exercise
id: m2-scope-bug
title: Fix the scope bug
--- starter
def add_fee(amount):
    fee = amount * 0.02
    total = amount + fee

add_fee(1000)
print(total)
--- tests
check(add_fee(1000) == 1020, f"add_fee(1000) should return 1020 (yours: {add_fee(1000)})")
check(add_fee(500) == 510, "add_fee(500) should return 510")
check(output.strip() == "1020.0", f"the program should print 1020.0 (yours: {output.strip()!r})")
--- hint
Add return total at the end of the function.
--- hint
Then store the result where you call it: total = add_fee(1000)
--- solution
def add_fee(amount):
    fee = amount * 0.02
    total = amount + fee
    return total

total = add_fee(1000)
print(total)
```

**3.** Write `mid_and_spread_bps(bid, ask)`, which returns two values: the mid price, (bid + ask) / 2, and the bid-ask spread in bps of the mid, (ask - bid) / mid × 10,000.

```exercise
id: m2-two-values
title: Return two values
--- starter
def mid_and_spread_bps(bid, ask):

--- tests
mid, bps = mid_and_spread_bps(99.5, 100.5)
check(approx(mid, 100.0), f"the mid of 99.5 / 100.5 should be 100.0 (yours: {mid})")
check(approx(bps, 100.0), f"the spread should be 100.0 bps (yours: {bps})")
mid, bps = mid_and_spread_bps(98, 99)
check(approx(mid, 98.5) and approx(bps, 101.52), f"98 / 99 should give 98.5 and about 101.52 bps (yours: {mid}, {bps})")
--- hint
Calculate mid first, then spread_bps from it, then return mid, spread_bps
--- solution
def mid_and_spread_bps(bid, ask):
    mid = (bid + ask) / 2
    spread_bps = (ask - bid) / mid * 10000
    return mid, spread_bps
```

**4.** Write `terminal_value(fcf_next, wacc, g)` with the Gordon growth formula, fcf_next / (wacc - g). Return `None` when WACC is not greater than g, because the formula breaks there.

```exercise
id: m2-tv-func
title: Terminal value with a guard
--- starter
def terminal_value(fcf_next, wacc, g):

--- tests
check(approx(terminal_value(120, 0.09, 0.025), 1846.15), "terminal_value(120, 0.09, 0.025) should be about 1846.15")
check(terminal_value(100, 0.05, 0.05) is None, "WACC equal to g should return None")
check(terminal_value(100, 0.04, 0.05) is None, "WACC below g should return None")
--- hint
if wacc <= g: return None
--- solution
def terminal_value(fcf_next, wacc, g):
    if wacc <= g:
        return None
    return fcf_next / (wacc - g)
```

**5.** Bridge from EV to price per share. Write `equity_value(ev, net_debt)`, then `price_per_share(ev, net_debt, shares)`, which calls `equity_value`. Equity value = EV - net debt, and price per share = equity value / shares. If equity value isn't positive, the equity is out of the money: return `0.0`.

```exercise
id: m2-ev-bridge
title: EV to price per share
--- starter
def equity_value(ev, net_debt):


def price_per_share(ev, net_debt, shares):

--- tests
check(approx(equity_value(1846.15, 900), 946.15), "equity_value(1846.15, 900) should be 946.15")
check(approx(price_per_share(1846.15, 900, 50), 18.92), f"price_per_share(1846.15, 900, 50) should be about 18.92 (yours: {price_per_share(1846.15, 900, 50)})")
check(price_per_share(500, 900, 50) == 0.0, "when net debt exceeds EV, price_per_share should be 0.0")
check("equity_value(" in code.split("def price_per_share")[-1], "price_per_share should call equity_value(...)")
--- hint
equity = equity_value(ev, net_debt). If equity <= 0, return 0.0. Otherwise return equity / shares.
--- solution
def equity_value(ev, net_debt):
    return ev - net_debt


def price_per_share(ev, net_debt, shares):
    equity = equity_value(ev, net_debt)
    if equity <= 0:
        return 0.0
    return equity / shares
```

## Explain it back

In exercise 2, why couldn't the last line see `total`, even though the function created it?

??? note "Model answer"
    Variables made inside a function are local: they exist only while the function runs, and code outside can't see them. The only way a result gets out is through `return`, and the caller has to store it, as in `total = add_fee(1000)`.

**Next:** [2.5 Capstone - covenant tool](2-5-capstone.md)
