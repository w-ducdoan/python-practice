---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 4.4 Capstone - trade blotter

[Module 4](index.md) · about 45 minutes

## The idea

A trade blotter, the list of trades a desk did, arrives as a CSV. Before you total anything, you need clean rows, and **a record of every row you threw out and why**. Silently dropping rows is how breaks go unexplained, and an operations or audit team will ask about each one.

`trades.csv` has 120 rows with three kinds of problems planted in it. Open it in Excel and look for them first:

- Rows cut short, with missing fields
- Prices of `N/A`
- Side labels with stray case and spaces, like `sell `

Your loader will check each row in this order. The first problem found becomes the row's reason:

| Check | If it fails, the reason is |
| :-- | :-- |
| The row has exactly 6 fields | `"missing fields"` |
| Side, after `.strip().upper()`, is BUY or SELL | `"bad side"` |
| Quantity, after removing commas, converts with `int()` | `"bad quantity"` |
| Price converts with `float()` | `"bad price"` |

Skip blank lines completely: they're not trades.

## Practice

**1.** Write `load_trades(path)`. It returns two lists:

- `clean`: dicts with keys `trade_id`, `date`, `ticker`, `side` (cleaned to BUY or SELL), `quantity` (an int) and `price` (a float)
- `bad`: dicts with keys `trade_id` and `reason`, in file order

Use `csv.reader`, not `DictReader`. Rows cut short need to be caught by counting their fields.

```exercise
id: m4-cap-load
title: Load and clean the blotter
files: trades.csv
--- starter
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []

    return clean, bad
--- tests
clean, bad = load_trades("trades.csv")
check(len(clean) == 110, f"trades.csv should give 110 clean trades (yours: {len(clean)})")
check([b.get("trade_id") for b in bad] == ["T0001", "T0003", "T0025", "T0036", "T0065", "T0068", "T0091", "T0093", "T0094", "T0106"], f"the 10 bad trade_ids are off. Yours: {[b.get('trade_id') for b in bad]}")
reasons = [b.get("reason") for b in bad]
check(reasons.count("missing fields") == 5 and reasons.count("bad price") == 5, f"there should be 5 'missing fields' and 5 'bad price' (yours: {reasons})")
check(clean[:1] == [{"trade_id": "T0002", "date": "2025-04-25", "ticker": "CNDL", "side": "BUY", "quantity": 780, "price": 32.46}], f"the first clean trade should be T0002 with quantity 780 (int) and price 32.46 (float). Yours: {clean[:1]}")
check(all(t["side"] in ("BUY", "SELL") for t in clean), "every clean side should be exactly BUY or SELL")
with open("mini.csv", "w") as f:
    f.write('trade_id,date,ticker,side,quantity,price\nX1,2025-01-02,ACME,buy ,"1,000",10.5\nX2,2025-01-03,ACME,HOLD,10,10\nX3,2025-01-03,ACME,SELL,ten,10\n\nX4,2025-01-04,ACME,SELL,5,11\nX5,2025-01-05\n')
c2, b2 = load_trades("mini.csv")
check([t["trade_id"] for t in c2] == ["X1", "X4"] and c2[0]["quantity"] == 1000 and c2[0]["side"] == "BUY", f"in the test file, X1 ('buy ', quantity '1,000') and X4 should be clean (yours: {c2})")
check(b2 == [{"trade_id": "X2", "reason": "bad side"}, {"trade_id": "X3", "reason": "bad quantity"}, {"trade_id": "X5", "reason": "missing fields"}], f"in the test file, X2 / X3 / X5 should be bad side / bad quantity / missing fields (yours: {b2})")
--- hint
with open(path) as f: reader = csv.reader(f), then next(reader) to skip the header, then for row in reader:
--- hint
Check each problem in table order. When one is found, append to bad and use continue to move on to the next row.
--- hint
Once len(row) == 6, unpack in one line: trade_id, date, ticker, side, quantity, price = row
--- hint
Each conversion gets its own try / except ValueError, so the reason says which field failed.
--- solution
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad
```

**2.** Write `notional_by_side(trades)`, which returns `{"BUY": total, "SELL": total}` where each total is the sum of quantity × price. The starter includes a finished `load_trades`.

```exercise
id: m4-cap-notional
title: Notional by side
files: trades.csv
--- starter
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def notional_by_side(trades):

--- tests
clean, bad = load_trades("trades.csv")
n = notional_by_side(clean)
check(approx(n.get("BUY", 0), 4659157.30, 0.01), f"BUY notional should be about 4,659,157.30 (yours: {n.get('BUY')})")
check(approx(n.get("SELL", 0), 5494652.20, 0.01), f"SELL notional should be about 5,494,652.20 (yours: {n.get('SELL')})")
check(notional_by_side([]) == {"BUY": 0, "SELL": 0}, "no trades should give BUY 0 and SELL 0")
--- hint
Start with totals = {"BUY": 0, "SELL": 0}, then add quantity * price to totals[t["side"]].
--- solution
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def notional_by_side(trades):
    """Total quantity x price for BUY and for SELL."""
    totals = {"BUY": 0, "SELL": 0}
    for t in trades:
        totals[t["side"]] += t["quantity"] * t["price"]
    return totals
```

**3.** Write `net_positions(trades)`, which returns the net shares per ticker: buys add, sells subtract.

```exercise
id: m4-cap-positions
title: Net positions
files: trades.csv
--- starter
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def net_positions(trades):

--- tests
clean, bad = load_trades("trades.csv")
p = net_positions(clean)
check(p == {"CNDL": -910, "DLTA": 890, "BRKN": 340, "ESTR": -290, "ACME": -130}, f"net positions are off. Yours: {p}")
check(net_positions([{"ticker": "A", "side": "BUY", "quantity": 10}, {"ticker": "A", "side": "SELL", "quantity": 10}]) == {"A": 0}, "a buy and sell of the same size should net to 0")
--- hint
shares = t["quantity"] if it's a BUY, otherwise -t["quantity"]. Then the counting pattern with .get.
--- solution
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def net_positions(trades):
    """Net shares per ticker: buys add, sells subtract."""
    positions = {}
    for t in trades:
        shares = t["quantity"] if t["side"] == "BUY" else -t["quantity"]
        positions[t["ticker"]] = positions.get(t["ticker"], 0) + shares
    return positions
```

**4.** Write `write_exceptions(path, bad)`. It writes the bad rows to a CSV with the header `trade_id,reason`. This is the file you'd send to operations.

```exercise
id: m4-cap-exceptions
title: Exceptions report
files: trades.csv
--- starter
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def write_exceptions(path, bad):

--- tests
clean, bad = load_trades("trades.csv")
write_exceptions("exceptions.csv", bad)
with open("exceptions.csv") as f:
    lines = [line.strip() for line in f if line.strip()]
check(len(lines) == 11 and lines[0] == "trade_id,reason", f"exceptions.csv should have a header plus 10 rows (yours: {len(lines)} lines)")
check(lines[1:3] == ["T0001,missing fields", "T0003,missing fields"] and "T0065,bad price" in lines, f"rows should read like 'T0001,missing fields' and 'T0065,bad price' (yours: {lines[:3]})")
--- hint
Same as write_summary in 4.2: open with "w" and newline="", write the header, then one row per bad item.
--- solution
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def write_exceptions(path, bad):
    """Write the bad rows to a CSV with columns trade_id, reason."""
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["trade_id", "reason"])
        for item in bad:
            writer.writerow([item["trade_id"], item["reason"]])
```

## Try it: the whole pipeline

Once all four pass, this runs the finished pipeline end to end. Then try the same code in your notebook from 4.3: paste it into a new cell, and it will write `exceptions.csv` to your real project folder.

```exercise
kind: example
id: ex-4-4
title: Clean, summarize, report
files: trades.csv
--- starter
import csv


def load_trades(path):
    """Read a trade blotter. Return (clean trades, bad rows with a reason)."""
    clean = []
    bad = []
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                        # skip the header
        for row in reader:
            if not row:
                continue                    # blank line
            if len(row) != 6:
                bad.append({"trade_id": row[0], "reason": "missing fields"})
                continue
            trade_id, date, ticker, side, quantity, price = row
            side = side.strip().upper()
            if side not in ("BUY", "SELL"):
                bad.append({"trade_id": trade_id, "reason": "bad side"})
                continue
            try:
                quantity = int(quantity.replace(",", ""))
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad quantity"})
                continue
            try:
                price = float(price)
            except ValueError:
                bad.append({"trade_id": trade_id, "reason": "bad price"})
                continue
            clean.append({"trade_id": trade_id, "date": date, "ticker": ticker,
                          "side": side, "quantity": quantity, "price": price})
    return clean, bad


def notional_by_side(trades):
    """Total quantity x price for BUY and for SELL."""
    totals = {"BUY": 0, "SELL": 0}
    for t in trades:
        totals[t["side"]] += t["quantity"] * t["price"]
    return totals


def net_positions(trades):
    """Net shares per ticker: buys add, sells subtract."""
    positions = {}
    for t in trades:
        shares = t["quantity"] if t["side"] == "BUY" else -t["quantity"]
        positions[t["ticker"]] = positions.get(t["ticker"], 0) + shares
    return positions


def write_exceptions(path, bad):
    """Write the bad rows to a CSV with columns trade_id, reason."""
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["trade_id", "reason"])
        for item in bad:
            writer.writerow([item["trade_id"], item["reason"]])


clean, bad = load_trades("trades.csv")
print(f"{len(clean)} clean trades, {len(bad)} exceptions")
for side, total in notional_by_side(clean).items():
    print(f"  {side:<4} notional ${total:>14,.2f}")
print("Net positions:", net_positions(clean))
write_exceptions("exceptions.csv", bad)
with open("exceptions.csv") as f:
    print(f.read())
```

## Explain it back

Why does `load_trades` return the bad rows with a reason, instead of just skipping them?

??? note "Model answer"
    The totals are only trustworthy if you can account for every row: 110 clean plus 10 exceptions equals the 120 in the file. With a reason attached, operations can fix the source: chase the missing prices, rebook the truncated trades. Silent skipping makes notional quietly too low, and nobody can say why.

**Next:** [Checkpoint 4](checkpoint.md)
