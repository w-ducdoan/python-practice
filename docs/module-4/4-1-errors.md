---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 4.1 Handling errors

[Module 4](index.md) · about 35 minutes

## The idea

So far an error has meant "fix your code." But some errors come from the **data**, not the code. A price of `"N/A"`, a blank balance, a zero EBITDA. You can't fix the file, so you tell Python what to do when it happens. That's `try` / `except`, the cousin of Excel's `IFERROR`:

```python
try:
    price = float(text)
except ValueError:
    price = None
```

Python runs the `try` block. If a `ValueError` happens anywhere inside it, Python jumps to the `except` block instead of crashing. If nothing goes wrong, the `except` block is skipped.

**Catch specific errors.** Name the error you expect, so you only swallow the problem you've planned for. The ones you'll catch most:

| Error | When it happens |
| :-- | :-- |
| `ValueError` | `float("N/A")`, `int("1,000")`: text that isn't a valid number |
| `ZeroDivisionError` | Dividing by zero |
| `KeyError` | A dict lookup for a key that isn't there |
| `TypeError` | Math on `None`, or text plus a number |

You can list several: `except (ZeroDivisionError, TypeError):`. A bare `except:` with no error named catches everything, including your own typos, so avoid it.

**`raise` your own errors.** When a caller passes nonsense, like a loan with -5 years, stop with a clear message instead of returning a garbage number:

```python
if years <= 0:
    raise ValueError("years must be positive")
```

It's a judgment call which to use. Return `None` when missing data is expected and the caller can carry on, like a blank row in a loan tape. Raise an error when the input means someone made a mistake that must be fixed.

## Try it

```exercise
kind: example
id: ex-4-1
title: try / except
--- starter
for text in ["173.25", "N/A", "", " 42 "]:
    try:
        value = float(text)
        print(repr(text), "->", value)
    except ValueError:
        print(repr(text), "-> not a number, skipped")

try:
    leverage = 450 / 0
except ZeroDivisionError:
    leverage = None
print("leverage:", leverage)

def tenor_months(years):
    if years <= 0:
        raise ValueError("years must be positive")
    return years * 12

print(tenor_months(5))
print(tenor_months(-1))     # this one stops the program with your message
```

## Practice

**1.** Write `to_number(text)`. It returns the text as a float, or `None` if it isn't a valid number. Use `try` / `except ValueError`.

```exercise
id: m4-to-number
title: Text to number, safely
--- starter
def to_number(text):

--- tests
check(to_number("173.25") == 173.25, "to_number('173.25') should be 173.25")
check(to_number(" 42 ") == 42.0, "float() ignores surrounding spaces: ' 42 ' gives 42.0")
check(to_number("N/A") is None, f"to_number('N/A') should be None (yours: {to_number('N/A')})")
check(to_number("") is None, "an empty string should give None")
check("try" in code and "except ValueError" in code, "use try / except ValueError")
--- hint
Inside try: return float(text). Inside except ValueError: return None.
--- solution
def to_number(text):
    try:
        return float(text)
    except ValueError:
        return None
```

**2.** Write `parse_money(text)` for amounts as they appear in real files: `"$1,250,000"`, `"1,000"`, `"  500 "`, and accounting negatives in parentheses like `"(500)"`, which means -500. Return `None` for blanks or anything that isn't a number.

```exercise
id: m4-parse-money
title: Parse money strings
--- starter
def parse_money(text):

--- tests
check(parse_money("$1,250,000") == 1250000.0, f"'$1,250,000' should be 1250000.0 (yours: {parse_money('$1,250,000')})")
check(parse_money("1,000") == 1000.0, "'1,000' should be 1000.0")
check(parse_money("  500 ") == 500.0, "'  500 ' should be 500.0")
check(parse_money("(500)") == -500.0, f"'(500)' is an accounting negative: -500.0 (yours: {parse_money('(500)')})")
check(parse_money("($2,000.50)") == -2000.5, "'($2,000.50)' should be -2000.5")
check(parse_money("") is None and parse_money("abc") is None, "blanks and non-numbers should give None")
--- hint
Clean first: text.strip(), then .replace("$", "") and .replace(",", "").
--- hint
If the cleaned text starts with "(" and ends with ")", remember it's negative and remove the brackets with [1:-1].
--- hint
Wrap the float() call in try / except ValueError.
--- solution
def parse_money(text):
    cleaned = text.strip().replace("$", "").replace(",", "")
    negative = False
    if cleaned.startswith("(") and cleaned.endswith(")"):
        negative = True
        cleaned = cleaned[1:-1]
    try:
        value = float(cleaned)
    except ValueError:
        return None
    if negative:
        return -value
    return value
```

**3.** Write `leverage(debt, ebitda)`. It returns debt / EBITDA, or `None` if EBITDA is zero or either input is `None`. Use `try` / `except` with the two errors those cases raise.

```exercise
id: m4-safe-leverage
title: Catch two kinds of error
--- starter
def leverage(debt, ebitda):

--- tests
check(leverage(450, 90) == 5.0, "leverage(450, 90) should be 5.0")
check(leverage(450, 0) is None, f"zero EBITDA should give None (yours: {leverage(450, 0)})")
check(leverage(None, 90) is None and leverage(450, None) is None, "a missing input (None) should give None")
check("try" in code and "ZeroDivisionError" in code and "TypeError" in code, "catch ZeroDivisionError and TypeError")
--- hint
Run one of the bad cases with Run first and read which error each one raises.
--- hint
except (ZeroDivisionError, TypeError): return None
--- solution
def leverage(debt, ebitda):
    try:
        return debt / ebitda
    except (ZeroDivisionError, TypeError):
        return None
```

**4.** Write `annual_payment(principal, rate, years)`: a level annual payment, principal × rate / (1 - (1 + rate)^-years). It must `raise ValueError` if `years` isn't positive or `principal` is negative. At a 0% rate, return principal / years.

```exercise
id: m4-raise
title: Raise on bad input
--- starter
def annual_payment(principal, rate, years):

--- tests
check(approx(annual_payment(1000, 0.05, 10), 129.505, 0.001), "annual_payment(1000, 0.05, 10) should be about 129.505")
check(annual_payment(1000, 0, 4) == 250, "a 0% rate should give principal / years")
for bad in [(1000, 0.05, 0), (1000, 0.05, -3), (-1000, 0.05, 10)]:
    try:
        annual_payment(*bad)
        raised = False
    except ValueError:
        raised = True
    check(raised, f"annual_payment{bad} should raise ValueError")
--- hint
Put the checks first: if years <= 0: raise ValueError("years must be positive")
--- solution
def annual_payment(principal, rate, years):
    if years <= 0:
        raise ValueError("years must be positive")
    if principal < 0:
        raise ValueError("principal can't be negative")
    if rate == 0:
        return principal / years
    return principal * rate / (1 - (1 + rate) ** -years)
```

**5.** Write `lookup_prices(prices, tickers)`. It looks up each ticker with `prices[ticker]` inside a `try`, and returns two things: a dict of the tickers it found, and a list of the ones that were missing.

```exercise
id: m4-keyerror
title: Collect what's missing
--- starter
def lookup_prices(prices, tickers):

--- tests
prices = {"ACME": 120.5, "BRKN": 45.0, "CNDL": 312.0}
found, missing = lookup_prices(prices, ["ACME", "ZZZZ", "CNDL", "QQQQ"])
check(found == {"ACME": 120.5, "CNDL": 312.0}, f"found should be ACME and CNDL (yours: {found})")
check(missing == ["ZZZZ", "QQQQ"], f"missing should be ['ZZZZ', 'QQQQ'] in order (yours: {missing})")
check(lookup_prices(prices, []) == ({}, []), "no tickers should give ({}, [])")
check("except KeyError" in code, "catch the KeyError from prices[ticker]")
--- hint
Start found = {} and missing = []. Loop over tickers, and try found[ticker] = prices[ticker].
--- hint
except KeyError: missing.append(ticker). Then return found, missing.
--- solution
def lookup_prices(prices, tickers):
    found = {}
    missing = []
    for ticker in tickers:
        try:
            found[ticker] = prices[ticker]
        except KeyError:
            missing.append(ticker)
    return found, missing
```

## Explain it back

`parse_money` returns `None` for a blank balance, but `annual_payment` raises an error for negative years. Why treat them differently?

??? note "Model answer"
    A blank balance is a normal data problem. Real loan tapes have gaps, and the code reading them should flag the row and keep going. Negative years means whoever called the function made a mistake, so a number would be meaningless. Raising stops the program with a clear message, so the mistake gets fixed instead of a wrong payment flowing into a model.

**Next:** [4.2 Reading and writing files](4-2-files.md)
