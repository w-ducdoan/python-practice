---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 1.3 Text and formatting

[Module 1](index.md) · about 35 minutes

## The idea

A **string** is text in quotes. You'll use strings constantly for labels, tickers and report lines.

**f-strings** are the easiest way to put numbers inside text. Put `f` before the opening quote and put variables in curly braces:

```python
company = "Cedar Corp"
ev = 1834.5
print(f"{company} EV: ${ev}m")      # Cedar Corp EV: $1834.5m
```

Add a **format code** after a colon inside the braces to control how a number looks. These work like Excel's number formats:

| Format code | Means | `{x:...}` with x = 1234567.891 | Excel equivalent |
| :-- | :-- | :-- | :-- |
| `,.2f` | Comma separators, 2 decimals | `1,234,567.89` | `#,##0.00` |
| `,.0f` | Comma separators, no decimals | `1,234,568` | `#,##0` |
| `.1%` | Percent, 1 decimal (multiplies by 100) | use x = 0.2537 to get `25.4%` | `0.0%` |

**Useful string tools:**

- `.upper()` and `.lower()` change case: `"acme".upper()` gives `"ACME"`.
- `.strip()` removes spaces from both ends: `"  ACME ".strip()` gives `"ACME"`. Messy data is full of stray spaces.
- `len("ACME")` gives `4`, the number of characters.

**Converting types** fixes the `TypeError` from 0.2. Data often arrives as text, even when it looks like a number.

- `float("173.25")` turns text into a number you can do math with.
- `str(5.2)` turns a number into text.

## Try it

```exercise
kind: example
id: ex-1-3
title: f-strings and formats
--- starter
company = "Cedar Corp"
ev = 1834.5
margin = 0.2537
print(f"{company} EV: ${ev:,.2f}m")
print(f"EBITDA margin: {margin:.1%}")
print(f"{1234567.891:,.0f}")

raw_ticker = "  acme "
print("[" + raw_ticker.strip().upper() + "]")

price_text = "173.25"          # text, as it might arrive from a file
print(float(price_text) * 40)
```

## Practice

**1.** Create `summary` so it equals exactly `Cedar Corp: EV $1,834.50m`. Build it from the variables with an f-string.

```exercise
id: m1-fstring
title: Build a summary line
--- starter
company = "Cedar Corp"
ev = 1834.5

summary =
--- tests
check(summary == "Cedar Corp: EV $1,834.50m", f"summary should be 'Cedar Corp: EV $1,834.50m' (yours: '{summary}')")
check("{" in code, "use an f-string with {company} and {ev:...}")
--- hint
Start with f" and put {company} where the name goes.
--- hint
For the number, use {ev:,.2f}.
--- solution
company = "Cedar Corp"
ev = 1834.5

summary = f"{company}: EV ${ev:,.2f}m"
```

**2.** Print `EBITDA margin: 25.4%` using the `margin` variable and a percent format.

```exercise
id: m1-pct
title: Percent formatting
--- starter
margin = 0.2537
--- tests
check(output.strip() == "EBITDA margin: 25.4%", f"should print 'EBITDA margin: 25.4%' (yours: '{output.strip()}')")
check("25.4" not in code, "let the format code produce 25.4%; don't type it")
--- hint
The format code for percent with one decimal is .1%
--- solution
margin = 0.2537
print(f"EBITDA margin: {margin:.1%}")
```

**3.** A price arrived as text. Create `position_value`: the price times 40 shares, as a number.

```exercise
id: m1-convert
title: Text to number
--- starter
price_text = "173.25"
shares = 40

position_value =
--- tests
check(isinstance(position_value, float), f"position_value should be a number (float); yours is a {type(position_value).__name__}")
check(approx(position_value, 6930.0), f"position_value should be 6930.0 (yours: {position_value})")
--- hint
Multiplying text by a number does something unexpected in Python (try it with Run). Convert first with float(...).
--- solution
price_text = "173.25"
shares = 40

position_value = float(price_text) * shares
```

**4.** A ticker came out of a spreadsheet as `"  acme "`. Create `ticker`, cleaned to `"ACME"`.

```exercise
id: m1-ticker-clean
title: Clean a ticker
--- starter
raw = "  acme "

ticker =
--- tests
check(ticker == "ACME", f"ticker should be 'ACME' (yours: '{ticker}')")
check("raw" in code.split("ticker")[-1], "build ticker from raw using string methods")
--- hint
Chain two methods: raw.strip().upper()
--- solution
raw = "  acme "

ticker = raw.strip().upper()
```

**5.** Print the fund's NAV as `NAV: $1,234,568`, with commas and no decimals.

```exercise
id: m1-big-number
title: Format a large number
--- starter
nav = 1234567.891
--- tests
check(output.strip() == "NAV: $1,234,568", f"should print 'NAV: $1,234,568' (yours: '{output.strip()}')")
--- hint
The format code is ,.0f
--- solution
nav = 1234567.891
print(f"NAV: ${nav:,.0f}")
```

## Explain it back

Why does `"173.25" * 40` not give 6930, and how do you fix it?

??? note "Model answer"
    `"173.25"` is text, not a number, because of the quotes. Multiplying text by 40 repeats the text 40 times. Convert it first with `float("173.25")`, then multiply.

**Next:** [1.4 True and False](1-4-booleans.md)
