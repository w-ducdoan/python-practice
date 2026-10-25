---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.3 Dictionaries

[Module 3](index.md) · about 35 minutes

## The idea

A **dictionary** (`dict`) is a lookup table. It maps **keys** to **values**, like a two-column range you'd `VLOOKUP` against. Use curly braces, with a colon between each key and its value:

```python
prices = {"ACME": 120.5, "BRKN": 44.1, "CNDL": 312.0}
```

| You want | Python |
| :-- | :-- |
| Look up a value | `prices["ACME"]` gives `120.5` |
| Add or update an entry | `prices["DLTA"] = 78.25` (the same syntax does both) |
| Look up without crashing if it's missing | `prices.get("ZZZZ")` gives `None`, and `prices.get("ZZZZ", 0)` gives `0` |
| Check whether a key exists | `"ACME" in prices` |
| Loop over the pairs | `for ticker, price in prices.items():` |
| Number of entries | `len(prices)` |

Look up a key that isn't there with square brackets and you'll get `KeyError`, the dictionary version of `#N/A`. Keys are exact, so `"acme"` and `"ACME"` are different keys.

**Counting with `.get`** is a pattern worth memorizing:

```python
counts = {}
for rating in ratings:
    counts[rating] = counts.get(rating, 0) + 1
```

The first time a rating appears, `.get` returns 0, so its count becomes 1. After that, the count goes up by 1 each time.

## Try it

```exercise
kind: example
id: ex-3-3
title: Dictionaries in action
--- starter
prices = {"ACME": 120.5, "BRKN": 44.1, "CNDL": 312.0}
print(prices["ACME"])
prices["DLTA"] = 78.25          # add
prices["BRKN"] = 45.0           # update
print(prices)
print(prices.get("ZZZZ"), prices.get("ZZZZ", 0), "ACME" in prices)

for ticker, price in prices.items():
    print(f"{ticker}: ${price:,.2f}")

ratings = ["B", "B-", "B", "CCC+", "B"]
counts = {}
for r in ratings:
    counts[r] = counts.get(r, 0) + 1
print(counts)
```

## Practice

**1.** Look up ACME's price into `acme_price`. Add DLTA at 78.25 and update BRKN to 45.0.

```exercise
id: m3-dict-basics
title: Look up, add, update
--- starter
prices = {"ACME": 120.5, "BRKN": 44.1, "CNDL": 312.0}

--- tests
check(acme_price == 120.5, f"acme_price should be 120.5 (yours: {acme_price})")
check(prices.get("DLTA") == 78.25, "prices should now include DLTA at 78.25")
check(prices.get("BRKN") == 45.0, "BRKN should be updated to 45.0")
check(len(prices) == 4, f"prices should have 4 tickers (yours: {len(prices)})")
check('prices["ACME"]' in code or "prices['ACME']" in code, "look up the price with prices[\"ACME\"] rather than typing 120.5")
--- hint
prices["DLTA"] = 78.25 adds a new key. The same syntax with an existing key updates it.
--- solution
prices = {"ACME": 120.5, "BRKN": 44.1, "CNDL": 312.0}

acme_price = prices["ACME"]
prices["DLTA"] = 78.25
prices["BRKN"] = 45.0
```

**2.** Write `rating_score(rating)`. It looks up the rating in `SCORES` after cleaning it (strip the spaces, uppercase it), and returns `None` for ratings that aren't in the table.

```exercise
id: m3-rating-score
title: Lookup with a default
--- starter
SCORES = {"BB": 3, "B": 4, "CCC": 5}

def rating_score(rating):

--- tests
check(rating_score("BB") == 3, "rating_score('BB') should be 3")
check(rating_score(" b ") == 4, f"rating_score(' b ') should be 4 once cleaned (yours: {rating_score(' b ')})")
check(rating_score("AAA") is None, "a rating that isn't in the table should give None, not crash")
--- hint
Clean first: key = rating.strip().upper()
--- hint
Then return SCORES.get(key). .get returns None when the key isn't there.
--- solution
SCORES = {"BB": 3, "B": 4, "CCC": 5}

def rating_score(rating):
    key = rating.strip().upper()
    return SCORES.get(key)
```

**3.** Write `position_values(holdings, prices)`. `holdings` maps each ticker to its shares, and `prices` maps each ticker to its price. Return a new dict mapping each ticker to its market value (shares × price).

```exercise
id: m3-position-values
title: Combine two lookup tables
--- starter
def position_values(holdings, prices):
    values = {}

    return values
--- tests
h = {"ACME": 100, "BRKN": 250, "CNDL": 40}
p = {"ACME": 120.5, "BRKN": 45.0, "CNDL": 312.0, "DLTA": 78.25}
v = position_values(h, p)
check(v == {"ACME": 12050.0, "BRKN": 11250.0, "CNDL": 12480.0}, f"values are off. Yours: {v}")
check(position_values({}, p) == {}, "no holdings should give an empty dict")
--- hint
Loop over holdings.items(), giving you ticker and shares.
--- hint
Inside the loop: values[ticker] = shares * prices[ticker]
--- solution
def position_values(holdings, prices):
    values = {}
    for ticker, shares in holdings.items():
        values[ticker] = shares * prices[ticker]
    return values
```

**4.** Write `weights(values)`. It takes a ticker-to-value dict and returns a ticker-to-weight dict, where each weight is the value divided by the total value.

```exercise
id: m3-weights
title: Portfolio weights
--- starter
def weights(values):

--- tests
w = weights({"ACME": 300, "BRKN": 100, "CNDL": 600})
check(w == {"ACME": 0.3, "BRKN": 0.1, "CNDL": 0.6}, f"weights should be 0.3 / 0.1 / 0.6 (yours: {w})")
w2 = weights({"ACME": 12050.0, "BRKN": 11250.0, "CNDL": 12480.0})
check(approx(sum(w2.values()), 1.0, 1e-9), "weights should add up to 1")
--- hint
Work out total = sum(values.values()) once, before the loop.
--- solution
def weights(values):
    total = sum(values.values())
    result = {}
    for ticker, value in values.items():
        result[ticker] = value / total
    return result
```

**5.** Write `count_ratings(ratings)`. It takes a list of ratings and returns a dict of how many times each rating appears.

```exercise
id: m3-count-ratings
title: Count with .get
--- starter
def count_ratings(ratings):

--- tests
c = count_ratings(["B", "B-", "B", "CCC+", "B", "B-"])
check(c == {"B": 3, "B-": 2, "CCC+": 1}, f"counts should be B: 3, B-: 2, CCC+: 1 (yours: {c})")
check(count_ratings([]) == {}, "an empty list should give an empty dict")
check(".get(" in code, "use the counts.get(rating, 0) + 1 pattern")
--- hint
Start with counts = {}. For each rating: counts[rating] = counts.get(rating, 0) + 1
--- solution
def count_ratings(ratings):
    counts = {}
    for rating in ratings:
        counts[rating] = counts.get(rating, 0) + 1
    return counts
```

## Explain it back

When would you use `prices.get(ticker, 0)` instead of `prices[ticker]`?

??? note "Model answer"
    When a missing key is normal and has a sensible fallback, like counting (the first occurrence starts at 0) or a ticker with no position. Use `prices[ticker]` when the key must exist. Then a `KeyError` is useful: it tells you the data is incomplete instead of quietly using 0.

**Next:** [3.4 Tables as lists of dicts](3-4-records.md)
