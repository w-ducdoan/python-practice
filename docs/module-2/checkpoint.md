---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 2

[Module 2](index.md) · about 25 minutes

No hints, and the solution unlocks only after you pass. Write both from a blank editor.

**1. DSCR test.** Write `dscr_status(cfads, debt_service)`. It returns:

- `"N/M"` if debt service is zero or negative
- `"DEFAULT"` if DSCR (cfads / debt_service) is below 1.00x
- `"LOCK-UP"` if DSCR is at least 1.00x but below 1.15x (distributions blocked)
- `"OK"` if DSCR is 1.15x or above

```exercise
id: m2-cp-dscr
title: DSCR status
checkpoint: yes
--- starter

--- tests
for args, expected in [((120, 100), "OK"), ((115, 100), "OK"), ((110, 100), "LOCK-UP"),
                       ((100, 100), "LOCK-UP"), ((90, 100), "DEFAULT"), ((100, 0), "N/M"), ((100, -5), "N/M")]:
    check(dscr_status(*args) == expected, f"dscr_status{args} should be {expected!r} (yours: {dscr_status(*args)!r})")
--- solution
def dscr_status(cfads, debt_service):
    if debt_service <= 0:
        return "N/M"
    dscr = cfads / debt_service
    if dscr < 1.0:
        return "DEFAULT"
    elif dscr < 1.15:
        return "LOCK-UP"
    return "OK"
```

**2. Rate-shock report.** Write `price_after_shock(price, duration, shock_bps)`, which uses the duration approximation: new price = price × (1 - duration × shock_bps / 10,000). Then write `shock_report(price, duration)`. It must call `price_after_shock` and return exactly this format (shown for price 100, duration 6.5):

```text
+100bp: $93.50 | -100bp: $106.50
```

```exercise
id: m2-cp-shock
title: Rate-shock report
checkpoint: yes
--- starter

--- tests
check(approx(price_after_shock(100, 6.5, 100), 93.5), "price_after_shock(100, 6.5, 100) should be 93.5")
check(approx(price_after_shock(100, 6.5, -100), 106.5), "price_after_shock(100, 6.5, -100) should be 106.5")
check(approx(price_after_shock(97.33, 2.8, 50), 95.97), "price_after_shock(97.33, 2.8, 50) should be about 95.97")
check(shock_report(100, 6.5) == "+100bp: $93.50 | -100bp: $106.50", f"shock_report(100, 6.5) is off. Yours: {shock_report(100, 6.5)!r}")
check(shock_report(97.33, 2.8) == "+100bp: $94.60 | -100bp: $100.06", f"shock_report(97.33, 2.8) is off. Yours: {shock_report(97.33, 2.8)!r}")
check("price_after_shock(" in code.split("def shock_report")[-1], "shock_report should call price_after_shock(...)")
--- solution
def price_after_shock(price, duration, shock_bps):
    return price * (1 - duration * shock_bps / 10000)


def shock_report(price, duration):
    up = price_after_shock(price, duration, 100)
    down = price_after_shock(price, duration, -100)
    return f"+100bp: ${up:,.2f} | -100bp: ${down:,.2f}"
```

Pass both and Module 2 is done. Check the Home page for **Mastered**. Module 3 (loops, lists and dictionaries) is next: it runs these functions over a whole portfolio and builds a full amortization schedule.

**Next:** [Module 3 - Loops, lists and dictionaries](../module-3/index.md)
