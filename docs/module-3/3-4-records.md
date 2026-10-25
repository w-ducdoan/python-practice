---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.4 Tables as lists of dicts

[Module 3](index.md) · about 40 minutes

## The idea

A spreadsheet table is rows and columns. In plain Python, the natural shape is a **list of dicts**: one dict per row, with the column names as keys. Here's a small loan tape:

```python
loans = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
]
```

`loans[1]["balance"]` reads row 2's balance. Looping over the list gives you one row at a time:

```python
for loan in loans:
    print(loan["id"], loan["balance"])
```

Almost every question about a table is one of four loop patterns, all of which you've seen:

| Question | Pattern | Excel cousin |
| :-- | :-- | :-- |
| Total balance? | Running total | `SUM` |
| Which loans are on watch? | Loop + `if` + append | Filter |
| Weighted average spread? | Two running totals, divided | `SUMPRODUCT / SUM` |
| Exposure by sector? | Dict of running totals | Pivot table / `SUMIF` |

Module 5 introduces pandas, which does each of these in one line. Writing them by hand first is how you'll understand what pandas is doing, and how you'll catch it when the result looks wrong.

## Try it

```exercise
kind: example
id: ex-3-4
title: Loop over a loan tape
--- starter
loans = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
]

print("Row 2 balance:", loans[1]["balance"])
for loan in loans:
    flag = "" if loan["status"] == "Performing" else "  <-- check"
    print(f'{loan["id"]}  {loan["sector"]:<12} ${loan["balance"]:>5.1f}m  {loan["spread"]} bps{flag}')
```

## Practice

Every exercise uses this tape (balances in $m). The tests also try your functions on other tapes.

```text
id    sector       balance  spread  status
L001  Industrials      8.9     650  Performing
L002  Healthcare      22.6     475  Watchlist
L003  Industrials     15.0     525  Performing
L004  Technology      31.2     575  Default
L005  Healthcare      12.3     500  Performing
```

**1.** Write `total_balance(loans)`.

```exercise
id: m3-tape-total
title: Total balance
--- starter
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def total_balance(loans):

--- tests
check(approx(total_balance(LOANS), 90.0, 1e-9), f"total_balance(LOANS) should be 90.0 (yours: {total_balance(LOANS)})")
check(total_balance([]) == 0, "an empty tape should total 0")
check(total_balance([{"balance": 5}]) == 5, "a one-loan tape should total that loan's balance")
--- hint
total = 0, then for loan in loans: total += loan["balance"]
--- solution
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def total_balance(loans):
    total = 0
    for loan in loans:
        total += loan["balance"]
    return total
```

**2.** Write `non_performing_ids(loans)`, which returns a list of the ids of every loan whose status isn't `"Performing"`.

```exercise
id: m3-tape-filter
title: Filter rows
--- starter
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def non_performing_ids(loans):

--- tests
check(non_performing_ids(LOANS) == ["L002", "L004"], f"should be ['L002', 'L004'] (yours: {non_performing_ids(LOANS)})")
check(non_performing_ids([{"id": "X", "status": "Performing"}]) == [], "an all-performing tape should give []")
--- hint
Start with ids = []. In the loop: if loan["status"] != "Performing": ids.append(loan["id"])
--- solution
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def non_performing_ids(loans):
    ids = []
    for loan in loans:
        if loan["status"] != "Performing":
            ids.append(loan["id"])
    return ids
```

**3.** Write `wavg_spread(loans)`: the balance-weighted average spread, sum(balance × spread) / sum(balance). Return `None` for an empty tape.

```exercise
id: m3-tape-wavg
title: Weighted average spread
--- starter
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def wavg_spread(loans):

--- tests
check(approx(wavg_spread(LOANS), 538.72), f"wavg_spread(LOANS) should be about 538.72 bps (yours: {wavg_spread(LOANS)})")
check(wavg_spread([]) is None, "an empty tape should give None")
check(wavg_spread([{"balance": 10, "spread": 400}, {"balance": 30, "spread": 600}]) == 550, "10 at 400 and 30 at 600 should average 550")
--- hint
Keep two running totals in one loop: weighted (balance * spread) and total balance.
--- hint
After the loop, if total is 0, return None. Otherwise return weighted / total.
--- solution
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def wavg_spread(loans):
    weighted = 0
    total = 0
    for loan in loans:
        weighted += loan["balance"] * loan["spread"]
        total += loan["balance"]
    if total == 0:
        return None
    return weighted / total
```

**4.** Write `exposure_by_sector(loans)`, which returns a dict of total balance per sector. It's a pivot table in five lines.

```exercise
id: m3-tape-group
title: Group by sector
--- starter
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def exposure_by_sector(loans):

--- tests
e = exposure_by_sector(LOANS)
check(set(e) == {"Industrials", "Healthcare", "Technology"}, f"there should be one key per sector (yours: {sorted(e)})")
check(approx(e.get("Industrials", 0), 23.9, 1e-9) and approx(e.get("Healthcare", 0), 34.9, 1e-9) and approx(e.get("Technology", 0), 31.2, 1e-9),
      f"totals should be Industrials 23.9, Healthcare 34.9, Technology 31.2 (yours: {e})")
check(exposure_by_sector([]) == {}, "an empty tape should give {}")
--- hint
Same as counting with .get, but add the balance instead of 1.
--- hint
by_sector[loan["sector"]] = by_sector.get(loan["sector"], 0) + loan["balance"]
--- solution
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def exposure_by_sector(loans):
    by_sector = {}
    for loan in loans:
        sector = loan["sector"]
        by_sector[sector] = by_sector.get(sector, 0) + loan["balance"]
    return by_sector
```

**5.** Write `largest_loan(loans)`, which returns the **id** of the loan with the largest balance, using a loop that remembers the best so far. Return `None` for an empty tape.

```exercise
id: m3-tape-largest
title: Find the largest row
--- starter
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def largest_loan(loans):

--- tests
check(largest_loan(LOANS) == "L004", f"largest_loan(LOANS) should be 'L004' (yours: {largest_loan(LOANS)!r})")
check(largest_loan([]) is None, "an empty tape should give None")
check(largest_loan([{"id": "A", "balance": 1}, {"id": "B", "balance": 9}, {"id": "C", "balance": 3}]) == "B", "A=1, B=9, C=3 should give 'B'")
--- hint
Start with best = None. In the loop, replace best when best is None or this loan's balance is bigger.
--- hint
Return best["id"] at the end, or None if best is still None.
--- solution
LOANS = [
    {"id": "L001", "sector": "Industrials", "balance": 8.9,  "spread": 650, "status": "Performing"},
    {"id": "L002", "sector": "Healthcare",  "balance": 22.6, "spread": 475, "status": "Watchlist"},
    {"id": "L003", "sector": "Industrials", "balance": 15.0, "spread": 525, "status": "Performing"},
    {"id": "L004", "sector": "Technology",  "balance": 31.2, "spread": 575, "status": "Default"},
    {"id": "L005", "sector": "Healthcare",  "balance": 12.3, "spread": 500, "status": "Performing"},
]

def largest_loan(loans):
    best = None
    for loan in loans:
        if best is None or loan["balance"] > best["balance"]:
            best = loan
    if best is None:
        return None
    return best["id"]
```

## Explain it back

The weighted average spread (538.72 bps) is different from the simple average of the five spreads (545 bps). Which one belongs in a portfolio report, and why?

??? note "Model answer"
    The weighted one. It reflects what the portfolio actually earns per dollar lent: the $31.2m loan at 575 bps should count far more than the $8.9m loan at 650 bps. The simple average treats every loan as the same size, which overstates the portfolio's spread here because the small loans happen to carry higher spreads.

**Next:** [3.5 While loops and loop control](3-5-while.md)
