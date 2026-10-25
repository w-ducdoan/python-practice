---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 3.6 Capstone - amortization schedule

[Module 3](index.md) · about 45 minutes

## The idea

This is the full schedule you'd build in Excel by dragging a row down 360 times. Each period:

```text
interest   = beginning balance * periodic rate
principal  = payment - interest
ending     = beginning balance - principal
next period's beginning balance = this period's ending balance
```

Each row is a dict, and the schedule is a list of those dicts, the same shape as the loan tape in 3.4:

```python
{"period": 1, "begin": 250000.0, "payment": 1580.17, "interest": 1354.17, "principal": 226.00, "end": 249774.00}
```

You'll build it in three steps: the schedule, a summary of it, then an early-paydown scenario that answers a question a borrower might ask: what does an extra $200 a month save?

Each starter includes the finished `payment()` function from Module 2.

## Practice

**1.** Write `amortization_schedule(principal, annual_rate, years, periods_per_year=12)`. It returns a list with one dict per period, with exactly these keys: `period` (counting from 1), `begin`, `payment`, `interest`, `principal`, `end`.

```exercise
id: m3-cap-schedule
title: Build the schedule
--- starter
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def amortization_schedule(principal, annual_rate, years, periods_per_year=12):
    """One dict per period: period, begin, payment, interest, principal, end."""
    schedule = []

    return schedule
--- tests
s = amortization_schedule(250000, 0.065, 30)
check(len(s) == 360, f"a 30-year monthly loan should have 360 rows (yours: {len(s)})")
first = s[0] if s else {}
check(set(first) == {"period", "begin", "payment", "interest", "principal", "end"}, f"each row needs exactly these keys: period, begin, payment, interest, principal, end (yours: {sorted(first)})")
check(first.get("period") == 1 and first.get("begin") == 250000, "row 1 should be period 1 and begin at 250000")
check(approx(first.get("interest", 0), 1354.17) and approx(first.get("principal", 0), 226.00), f"row 1 interest should be about 1354.17 and principal 226.00 (yours: {first.get('interest')}, {first.get('principal')})")
check(all(approx(s[i]["begin"], s[i - 1]["end"], 1e-6) for i in range(1, len(s))), "each row's begin should equal the previous row's end")
check(len(s) > 0 and abs(s[-1]["end"]) < 0.01, f"the final balance should be about 0 (yours: {s[-1]['end'] if s else None})")
q = amortization_schedule(50, 0.0955, 5, 4)
check(len(q) == 20 and abs(q[-1]["end"]) < 1e-6, "a 5-year quarterly loan should have 20 rows ending at 0")
--- hint
Before the loop: pmt = payment(...), r = annual_rate / periods_per_year, balance = principal.
--- hint
for period in range(1, years * periods_per_year + 1): work out interest, principal and end, append the dict, then set balance = end.
--- hint
Name the principal-paid variable something like principal_paid, so it doesn't overwrite the principal parameter.
--- solution
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def amortization_schedule(principal, annual_rate, years, periods_per_year=12):
    """One dict per period: period, begin, payment, interest, principal, end."""
    schedule = []
    pmt = payment(principal, annual_rate, years, periods_per_year)
    r = annual_rate / periods_per_year
    balance = principal
    for period in range(1, years * periods_per_year + 1):
        interest = balance * r
        principal_paid = pmt - interest
        end = balance - principal_paid
        schedule.append({"period": period, "begin": balance, "payment": pmt,
                         "interest": interest, "principal": principal_paid, "end": end})
        balance = end
    return schedule
```

**2.** Write `schedule_summary(schedule)`. It takes any schedule (a list of row dicts) and returns a dict with:

- `periods`: the number of rows
- `total_paid`: the sum of payments
- `total_interest`: the sum of interest
- `interest_share`: total interest / total paid

```exercise
id: m3-cap-summary
title: Summarize the schedule
--- starter
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def amortization_schedule(principal, annual_rate, years, periods_per_year=12):
    schedule = []
    pmt = payment(principal, annual_rate, years, periods_per_year)
    r = annual_rate / periods_per_year
    balance = principal
    for period in range(1, years * periods_per_year + 1):
        interest = balance * r
        principal_paid = pmt - interest
        end = balance - principal_paid
        schedule.append({"period": period, "begin": balance, "payment": pmt,
                         "interest": interest, "principal": principal_paid, "end": end})
        balance = end
    return schedule


def schedule_summary(schedule):

--- tests
summary = schedule_summary(amortization_schedule(250000, 0.065, 30))
check(summary.get("periods") == 360, f"periods should be 360 (yours: {summary.get('periods')})")
check(approx(summary.get("total_paid", 0), 568861.22, 0.5), f"total_paid should be about 568,861.22 (yours: {summary.get('total_paid')})")
check(approx(summary.get("total_interest", 0), 318861.22, 0.5), f"total_interest should be about 318,861.22 (yours: {summary.get('total_interest')})")
check(approx(summary.get("interest_share", 0), 0.5605, 0.0001), f"interest_share should be about 0.5605 (yours: {summary.get('interest_share')})")
tiny = [{"payment": 60, "interest": 10}, {"payment": 60, "interest": 5}]
t = schedule_summary(tiny)
check(t.get("periods") == 2 and t.get("total_paid") == 120 and t.get("total_interest") == 15, "a hand-made 2-row schedule should give 2 periods, 120 paid and 15 interest")
--- hint
Two running totals in one loop over the rows: row["payment"] and row["interest"].
--- hint
Return a dict: {"periods": len(schedule), "total_paid": ..., "total_interest": ..., "interest_share": ...}
--- solution
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def amortization_schedule(principal, annual_rate, years, periods_per_year=12):
    schedule = []
    pmt = payment(principal, annual_rate, years, periods_per_year)
    r = annual_rate / periods_per_year
    balance = principal
    for period in range(1, years * periods_per_year + 1):
        interest = balance * r
        principal_paid = pmt - interest
        end = balance - principal_paid
        schedule.append({"period": period, "begin": balance, "payment": pmt,
                         "interest": interest, "principal": principal_paid, "end": end})
        balance = end
    return schedule


def schedule_summary(schedule):
    total_paid = 0
    total_interest = 0
    for row in schedule:
        total_paid += row["payment"]
        total_interest += row["interest"]
    return {"periods": len(schedule), "total_paid": total_paid,
            "total_interest": total_interest, "interest_share": total_interest / total_paid}
```

**3.** Write `schedule_with_extra(principal, annual_rate, years, extra, periods_per_year=12)`. The borrower pays the normal payment **plus** `extra` every period until the loan is gone, so you don't know the number of periods in advance. That calls for a `while` loop. Rules:

- Keep going while the balance is above 0.01 (a cent, to ignore round-off).
- Principal paid each period is `payment + extra - interest`, capped at the remaining balance so the last payment doesn't overpay: use `min(..., balance)`.
- The row's `payment` is what was actually paid: interest plus principal paid.

```exercise
id: m3-cap-extra
title: Pay it off early
--- starter
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def schedule_with_extra(principal, annual_rate, years, extra, periods_per_year=12):
    """Schedule rows when the borrower pays `extra` on top of each payment."""
    schedule = []

    return schedule
--- tests
s = schedule_with_extra(250000, 0.065, 30, 200)
check(len(s) == 265, f"with an extra $200/month the loan should be gone in 265 months (yours: {len(s)})")
interest = sum(row["interest"] for row in s) if s and "interest" in s[0] else 0
check(approx(interest, 221243.10, 1.0), f"total interest should be about 221,243 (yours: {interest:,.2f})")
check(len(s) > 0 and abs(s[-1]["end"]) < 0.01, "the last row should end at 0")
check(len(s) > 0 and s[-1]["payment"] < s[0]["payment"], "the final payment should be smaller than the others, since it only clears what's left")
check(len(schedule_with_extra(250000, 0.065, 30, 0)) == 360, "with no extra payment it should take the full 360 months")
check("while" in code, "use a while loop: the number of periods isn't known in advance")
--- hint
Before the loop: pmt = payment(...) + extra, r, balance = principal, period = 0.
--- hint
while balance > 0.01: period += 1, interest = balance * r, principal_paid = min(pmt - interest, balance), end = balance - principal_paid.
--- hint
Append the row with "payment": interest + principal_paid, then set balance = end.
--- solution
def payment(principal, annual_rate, years, periods_per_year=12):
    n = years * periods_per_year
    if annual_rate == 0:
        return principal / n
    r = annual_rate / periods_per_year
    return principal * r / (1 - (1 + r) ** -n)


def schedule_with_extra(principal, annual_rate, years, extra, periods_per_year=12):
    """Schedule rows when the borrower pays `extra` on top of each payment."""
    schedule = []
    pmt = payment(principal, annual_rate, years, periods_per_year) + extra
    r = annual_rate / periods_per_year
    balance = principal
    period = 0
    while balance > 0.01:
        period += 1
        interest = balance * r
        principal_paid = min(pmt - interest, balance)
        end = balance - principal_paid
        schedule.append({"period": period, "begin": balance, "payment": interest + principal_paid,
                         "interest": interest, "principal": principal_paid, "end": end})
        balance = end
    return schedule
```

## Try it: print the schedule

Once all three pass, run this finished version. It prints the schedule as a table, using f-string alignment: `>12` right-aligns in 12 characters. Change `extra` or the rate and compare the savings.

```exercise
kind: example
id: ex-3-6
title: Print a formatted schedule
--- starter
def schedule_with_extra(principal, annual_rate, years, extra, periods_per_year=12):
    r = annual_rate / periods_per_year
    n = years * periods_per_year
    pmt = principal * r / (1 - (1 + r) ** -n) + extra
    schedule, balance, period = [], principal, 0
    while balance > 0.01:
        period += 1
        interest = balance * r
        paid = min(pmt - interest, balance)
        schedule.append({"period": period, "begin": balance, "payment": interest + paid,
                         "interest": interest, "principal": paid, "end": balance - paid})
        balance -= paid
    return schedule

base = schedule_with_extra(250000, 0.065, 30, 0)
fast = schedule_with_extra(250000, 0.065, 30, extra=200)

print(f"{'Period':>6} {'Begin':>12} {'Interest':>10} {'Principal':>10} {'End':>12}")
for row in fast[:12]:
    print(f"{row['period']:>6} {row['begin']:>12,.2f} {row['interest']:>10,.2f} {row['principal']:>10,.2f} {row['end']:>12,.2f}")

saved = sum(r["interest"] for r in base) - sum(r["interest"] for r in fast)
print(f"\nPaid off {len(base) - len(fast)} months early, saving ${saved:,.0f} of interest.")
```

## Explain it back

Why does exercise 1 use a `for` loop but exercise 3 a `while` loop?

??? note "Model answer"
    The standard schedule always has exactly years × periods_per_year rows, a count you know up front, so `for` over a `range` fits. With extra payments, the loan ends whenever the balance hits zero, and you only find out by running it. "Repeat until a condition" is what `while` is for.

**Next:** [Checkpoint 3](checkpoint.md)
