---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 1.1 Numbers and arithmetic

[Module 1](index.md) · about 30 minutes

## The idea

Python is a calculator that follows the same order of operations as Excel: parentheses first, then powers, then multiplication and division, then addition and subtraction.

| Operation | Python | Example | Result |
| :-- | :-- | :-- | :-- |
| Add, subtract | `+` `-` | `900 - 150` | `750` |
| Multiply, divide | `*` `/` | `1250 * 0.25` | `312.5` |
| Power | `**` | `1.05 ** 10` | `1.6288...` |
| Whole-number division | `//` | `25000 // 173` | `144` |
| Remainder | `%` | `25000 % 173` | `88` |
| Round | `round(x, 2)` | `round(1628.894, 2)` | `1628.89` |

**The Excel trap:** in Excel, `^` means power. In Python, power is `**`. `^` means something else entirely, and with decimal numbers it raises a `TypeError`.

Python has two kinds of numbers. **Integers** (`int`) are whole numbers, like `1250`. **Floats** (`float`) have a decimal point, like `0.25`. Dividing with `/` always gives a float, so `10 / 2` is `5.0`.

Floats are occasionally off in the last decimal place: `0.1 + 0.2` gives `0.30000000000000004`. Excel has the same quirk and hides it. In Python, use `round()` when you display results.

## Try it

```exercise
kind: example
id: ex-1-1
title: Python as a calculator
--- starter
print(1250 * 0.25)
print(1.05 ** 10)            # compound growth factor over 10 years
print(round(1.05 ** 10, 4))
print(25000 // 173, 25000 % 173)
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
```

## Practice

**1.** $1,000 compounds at 5% a year for 10 years. Print the ending value, starting amount × (1 + rate)^years, rounded to 2 decimals.

```exercise
id: m1-compound
title: Compound growth
--- starter
print()
--- tests
check(output.strip() == "1628.89", f"should print 1628.89 (yours: {output.strip() or 'nothing'})")
check("**" in code, "use ** for the power")
--- hint
Python's power operator is `**`, so 1.05 to the power 10 is `1.05 ** 10`.
--- hint
Wrap the whole calculation in round(..., 2).
--- solution
print(round(1000 * 1.05 ** 10, 2))
```

**2.** A loan quotes 12% compounded monthly. Print the effective annual rate, (1 + 0.12/12)^12 - 1, rounded to 4 decimals.

```exercise
id: m1-ear
title: Effective annual rate
--- starter
print()
--- tests
check(output.strip() == "0.1268", f"should print 0.1268 (yours: {output.strip() or 'nothing'})")
--- hint
Parentheses matter: (1 + 0.12 / 12) ** 12 - 1. Division happens before addition inside the parentheses, which is what you want.
--- solution
print(round((1 + 0.12 / 12) ** 12 - 1, 4))
```

**3.** You have $25,000 to buy a stock at $173 a share. Print, on one line, how many whole shares you can buy and how much cash is left over.

```exercise
id: m1-shares
title: Whole shares and leftover cash
--- starter
print()
--- tests
check(output.strip() == "144 88", f"should print '144 88' (yours: {output.strip() or 'nothing'})")
check("//" in code and "%" in code, "use // for whole shares and % for the remainder")
--- hint
`//` gives the whole number of times 173 fits into 25000. `%` gives what's left.
--- hint
Put both inside one print, separated by a comma.
--- solution
print(25000 // 173, 25000 % 173)
```

**4.** Someone pasted an Excel formula into Python. Fix it so it prints the 5-year growth factor at 8%, rounded to 4 decimals.

```exercise
id: m1-excel-trap
title: The Excel ^ trap
--- starter
print(round(1.08 ^ 5, 4))
--- tests
check(output.strip() == "1.4693", f"should print 1.4693 (yours: {output.strip() or 'nothing'})")
--- hint
Python's power operator is two asterisks.
--- solution
print(round(1.08 ** 5, 4))
```

**5.** A 3-year bond pays a $5 coupon each year and $100 face value at maturity. The yield is 6%. Print its price, rounded to 3 decimals: each cash flow divided by 1.06 to the power of its year, all added up.

```exercise
id: m1-bond-price
title: Price a bond by hand
--- starter
print()
--- tests
check(output.strip() == "97.327", f"should print 97.327 (yours: {output.strip() or 'nothing'})")
--- hint
Year 1: 5 / 1.06. Year 2: 5 / 1.06 ** 2. Year 3: (5 + 100) / 1.06 ** 3.
--- hint
Add the three pieces inside round(..., 3).
--- solution
print(round(5 / 1.06 + 5 / 1.06 ** 2 + 105 / 1.06 ** 3, 3))
```

## Explain it back

Why does `1.08 ^ 5` fail in Python, and what does `2 + 3 * 4` give?

??? note "Model answer"
    `^` isn't Python's power operator. Power is `**`, and `^` doesn't work on decimal numbers, so Python raises a `TypeError`. `2 + 3 * 4` is `14`, because multiplication happens before addition, the same as in Excel.

**Next:** [1.2 Variables](1-2-variables.md)
