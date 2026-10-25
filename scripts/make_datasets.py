"""Generate the practice datasets used across the site.

Run from the project folder:

    python scripts/make_datasets.py

Everything is simulated (no real market data, no licensing issues) and seeded,
so every run produces exactly the same files. Output goes to docs/data/.

Files:
    prices.csv      Daily closes for 5 tickers, 2023-2025 (clean).
    holdings.csv    A 20-name equity portfolio (clean).
    dcf_inputs.csv  Operating and valuation inputs for 6 companies (clean).
    trades.csv      A trade blotter with some malformed rows (messy on purpose).
    loan_tape.csv   A 200-loan private credit tape with planted errors (messy on purpose).

Only the standard library is used, so this runs before you have installed pandas.
"""

import csv
import math
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
OUT = Path(__file__).resolve().parent.parent / "docs" / "data"

TICKERS = {
    # ticker: (start price, annual drift, annual volatility)
    "ACME": (120.0, 0.08, 0.22),
    "BRKN": (45.0, 0.03, 0.35),
    "CNDL": (310.0, 0.12, 0.28),
    "DLTA": (78.0, 0.05, 0.18),
    "ESTR": (22.0, -0.02, 0.45),
}

SECTORS = ["Technology", "Healthcare", "Industrials", "Financials", "Consumer", "Energy"]


def business_days(start, end):
    day = start
    while day <= end:
        if day.weekday() < 5:
            yield day
        day += timedelta(days=1)


def write_csv(name, header, rows):
    path = OUT / name
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
    print(f"wrote {path.relative_to(OUT.parent.parent)} ({len(rows)} rows)")


def make_prices(rng):
    days = list(business_days(date(2023, 1, 2), date(2025, 12, 31)))
    rows = []
    dt = 1 / 252
    for ticker, (price, mu, sigma) in TICKERS.items():
        for day in days:
            rows.append([day.isoformat(), ticker, f"{price:.2f}"])
            shock = rng.gauss(0, 1)
            price *= math.exp((mu - 0.5 * sigma ** 2) * dt + sigma * math.sqrt(dt) * shock)
    write_csv("prices.csv", ["date", "ticker", "close"], rows)


def make_holdings(rng):
    rows = []
    for i in range(20):
        ticker = "".join(rng.choice("ABCDEFGHIJKLMNOPRSTUVW") for _ in range(4))
        sector = SECTORS[i % len(SECTORS)]
        shares = rng.randrange(100, 5000, 50)
        price = round(rng.uniform(15, 400), 2)
        cost = round(price * rng.uniform(0.6, 1.3), 2)
        rows.append([ticker, f"{ticker} Holdings Inc", sector, shares, price, cost])
    write_csv("holdings.csv", ["ticker", "name", "sector", "shares", "price", "cost_basis"], rows)


def make_dcf_inputs(rng):
    rows = []
    for name in ["Alder", "Birch", "Cedar", "Dogwood", "Elm", "Fir"]:
        rows.append([
            name,
            round(rng.uniform(200, 5000), 1),     # revenue, $m
            round(rng.uniform(0.10, 0.35), 3),    # EBITDA margin
            round(rng.uniform(0.02, 0.08), 3),    # capex as % of revenue
            round(rng.uniform(0.01, 0.12), 3),    # revenue growth
            round(rng.uniform(0.07, 0.11), 3),    # WACC
            round(rng.uniform(0.015, 0.03), 3),   # terminal growth
            round(rng.uniform(-200, 2000), 1),    # net debt, $m
            round(rng.uniform(50, 500), 1),       # diluted shares, m
        ])
    write_csv("dcf_inputs.csv", ["company", "revenue", "ebitda_margin", "capex_pct", "growth",
                                 "wacc", "terminal_growth", "net_debt", "shares"], rows)


def make_trades(rng):
    tickers = list(TICKERS)
    rows = []
    for i in range(1, 121):
        day = date(2025, 1, 2) + timedelta(days=rng.randrange(0, 360))
        row = [f"T{i:04d}", day.isoformat(), rng.choice(tickers), rng.choice(["BUY", "SELL"]),
               rng.randrange(10, 1000, 10), f"{rng.uniform(20, 350):.2f}"]
        problem = rng.random()
        if problem < 0.04:
            row[5] = "N/A"                     # missing price
        elif problem < 0.07:
            row = row[:4]                      # truncated row
        elif problem < 0.10:
            row[3] = row[3].lower() + " "      # inconsistent side
        elif problem < 0.12:
            row[4] = "1,000"                   # number stored as text with a comma
        rows.append(row)
    write_csv("trades.csv", ["trade_id", "date", "ticker", "side", "quantity", "price"], rows)


def make_loan_tape(rng):
    ratings = ["B+", "B", "B-", "CCC+", "BB-"]
    rows = []
    for i in range(1, 201):
        orig = date(2021, 1, 1) + timedelta(days=rng.randrange(0, 1400))
        maturity = orig + timedelta(days=365 * rng.choice([5, 6, 7]))
        balance = round(rng.uniform(5, 60), 1) * 1_000_000
        spread = rng.choice([475, 500, 525, 550, 575, 600, 650, 700])
        row = [f"L{i:03d}", f"Borrower {i:03d}", rng.choice(SECTORS), orig.isoformat(),
               maturity.isoformat(), f"{balance:.0f}", spread, rng.choice(ratings),
               rng.choices(["Performing", "Watchlist", "Default"], [0.85, 0.11, 0.04])[0],
               round(rng.uniform(0.30, 0.65), 3)]
        problem = rng.random()
        if problem < 0.04:
            row[5] = ""                                    # missing balance
        elif problem < 0.08:
            row[5] = f"${balance:,.0f}"                    # balance with $ and commas
        elif problem < 0.11:
            row[3] = orig.strftime("%m/%d/%Y")             # different date format
        elif problem < 0.14:
            row[7] = " " + row[7].lower()                  # messy rating text
        elif problem < 0.16:
            row[8] = "performing"                          # inconsistent status case
        elif problem < 0.17:
            row[5] = f"-{balance:.0f}"                     # impossible negative balance
        elif problem < 0.19:
            row[9] = round(row[9] * 100, 1)                # LTV entered as a percent
        rows.append(row)
    # Two exact duplicate rows, a common data-entry problem.
    rows.insert(50, list(rows[10]))
    rows.insert(120, list(rows[99]))
    write_csv("loan_tape.csv", ["loan_id", "borrower", "sector", "origination_date", "maturity_date",
                                "balance", "spread_bps", "rating", "status", "ltv"], rows)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = random.Random(SEED)
    make_prices(rng)
    make_holdings(rng)
    make_dcf_inputs(rng)
    make_trades(rng)
    make_loan_tape(rng)


if __name__ == "__main__":
    main()
