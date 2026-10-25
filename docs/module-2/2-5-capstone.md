---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 2.5 Capstone - covenant tool

[Module 2](index.md) · about 40 minutes

## The idea

Nothing new here. You'll build a small covenant compliance tool out of three functions, each building on the last:

1. `covenant_test` says PASS or BREACH, and gives headroom in turns.
2. `ebitda_cushion` gives how far EBITDA can fall before a breach.
3. `covenant_line` produces the one-line summary you'd paste into a portfolio monitoring report.

**Definitions used here:**

- Leverage = debt / EBITDA.
- Headroom (x) = max leverage - actual leverage. Negative means the borrower is already in breach.
- EBITDA cushion = 1 - (debt / max leverage) / EBITDA. That's the share of EBITDA that can disappear before leverage hits the maximum, since debt / max leverage is the lowest EBITDA that still complies. Negative means EBITDA would have to grow to cure the breach.
- If EBITDA is zero or negative, leverage isn't meaningful. Report it as N/M (not meaningful), as a credit memo would.

Each exercise below copies in the finished functions from the earlier steps, so every editor runs on its own.

## Practice

**1.** Write `covenant_test(debt, ebitda, max_lev)`. It returns two values, `status` and `headroom`:

- EBITDA ≤ 0 gives `("N/M", None)`.
- Leverage at or below the maximum gives `"PASS"`, and above it gives `"BREACH"`.
- `headroom` is `max_lev - leverage`, where leverage = debt / EBITDA.

```exercise
id: m2-cap-covenant
title: covenant_test
--- starter
def covenant_test(debt, ebitda, max_lev):
    """Return (status, headroom in turns) for a max leverage covenant."""

--- tests
status, headroom = covenant_test(450, 90, 5.25)
check(status == "PASS" and approx(headroom, 0.25), f"(450, 90, 5.25) should give ('PASS', 0.25) (yours: {status!r}, {headroom})")
status, headroom = covenant_test(500, 90, 5.25)
check(status == "BREACH" and approx(headroom, -0.3056, 0.001), f"(500, 90, 5.25) should give ('BREACH', about -0.31) (yours: {status!r}, {headroom})")
status, headroom = covenant_test(472.5, 90, 5.25)
check(status == "PASS", "exactly at 5.25x is a PASS")
check(covenant_test(100, 0, 5.0) == ("N/M", None), "zero EBITDA should give ('N/M', None)")
check(covenant_test(100, -5, 5.0) == ("N/M", None), "negative EBITDA should give ('N/M', None)")
--- hint
Handle the N/M case first: if ebitda <= 0: return "N/M", None
--- hint
Then leverage = debt / ebitda, headroom = max_lev - leverage, and an if/else for the status.
--- solution
def covenant_test(debt, ebitda, max_lev):
    """Return (status, headroom in turns) for a max leverage covenant."""
    if ebitda <= 0:
        return "N/M", None
    leverage = debt / ebitda
    headroom = max_lev - leverage
    if leverage <= max_lev:
        return "PASS", headroom
    return "BREACH", headroom
```

**2.** Write `ebitda_cushion(debt, ebitda, max_lev)`: return the EBITDA cushion as a decimal, or `None` when EBITDA ≤ 0. The cushion is how far EBITDA can fall before the covenant breaks: minimum EBITDA = debt / max_lev, and cushion = 1 - minimum EBITDA / EBITDA.

```exercise
id: m2-cap-cushion
title: ebitda_cushion
--- starter
def ebitda_cushion(debt, ebitda, max_lev):
    """Share of EBITDA that can be lost before breaching max leverage."""

--- tests
check(approx(ebitda_cushion(450, 90, 5.25), 0.0476, 0.0001), f"(450, 90, 5.25) should be about 0.0476 (yours: {ebitda_cushion(450, 90, 5.25)})")
check(approx(ebitda_cushion(500, 90, 5.25), -0.0582, 0.0001), "(500, 90, 5.25) should be about -0.0582: already in breach")
check(approx(ebitda_cushion(0, 90, 5.25), 1.0, 1e-9), "with no debt, all of EBITDA can go: the cushion is 1.0")
check(ebitda_cushion(100, 0, 5.0) is None, "zero EBITDA should give None")
--- hint
Handle EBITDA ≤ 0 first and return None. Then work out the minimum EBITDA, then the cushion.
--- solution
def ebitda_cushion(debt, ebitda, max_lev):
    """Share of EBITDA that can be lost before breaching max leverage."""
    if ebitda <= 0:
        return None
    min_ebitda = debt / max_lev
    return 1 - min_ebitda / ebitda
```

**3.** Write `covenant_line(name, debt, ebitda, max_lev)`. It must call both functions above and return one of these formats:

```text
Cedar Corp: PASS | 5.00x vs 5.25x max | 0.25x headroom | EBITDA cushion 4.8%
Birch Inc: BREACH | 5.56x vs 5.25x max | -0.31x headroom | EBITDA cushion -5.8%
Fir LLC: N/M | EBITDA not positive
```

```exercise
id: m2-cap-line
title: covenant_line report
--- starter
def covenant_test(debt, ebitda, max_lev):
    if ebitda <= 0:
        return "N/M", None
    leverage = debt / ebitda
    headroom = max_lev - leverage
    if leverage <= max_lev:
        return "PASS", headroom
    return "BREACH", headroom


def ebitda_cushion(debt, ebitda, max_lev):
    if ebitda <= 0:
        return None
    return 1 - (debt / max_lev) / ebitda


def covenant_line(name, debt, ebitda, max_lev):
    """One-line covenant summary for a monitoring report."""

--- tests
line = covenant_line("Cedar Corp", 450, 90, 5.25)
check(line == "Cedar Corp: PASS | 5.00x vs 5.25x max | 0.25x headroom | EBITDA cushion 4.8%", f"Cedar Corp line is off. Yours: {line!r}")
line = covenant_line("Birch Inc", 500, 90, 5.25)
check(line == "Birch Inc: BREACH | 5.56x vs 5.25x max | -0.31x headroom | EBITDA cushion -5.8%", f"Birch Inc line is off. Yours: {line!r}")
line = covenant_line("Fir LLC", 100, 0, 5.0)
check(line == "Fir LLC: N/M | EBITDA not positive", f"Fir LLC line is off. Yours: {line!r}")
body = code.split("def covenant_line")[-1]
check("covenant_test(" in body and "ebitda_cushion(" in body, "covenant_line should call covenant_test(...) and ebitda_cushion(...)")
--- hint
Start with status, headroom = covenant_test(debt, ebitda, max_lev), and handle "N/M" first.
--- hint
Leverage for display is debt / ebitda with format .2f. Headroom uses .2f too, and the cushion uses .1%.
--- solution
def covenant_test(debt, ebitda, max_lev):
    if ebitda <= 0:
        return "N/M", None
    leverage = debt / ebitda
    headroom = max_lev - leverage
    if leverage <= max_lev:
        return "PASS", headroom
    return "BREACH", headroom


def ebitda_cushion(debt, ebitda, max_lev):
    if ebitda <= 0:
        return None
    return 1 - (debt / max_lev) / ebitda


def covenant_line(name, debt, ebitda, max_lev):
    """One-line covenant summary for a monitoring report."""
    status, headroom = covenant_test(debt, ebitda, max_lev)
    if status == "N/M":
        return f"{name}: N/M | EBITDA not positive"
    leverage = debt / ebitda
    cushion = ebitda_cushion(debt, ebitda, max_lev)
    return (f"{name}: {status} | {leverage:.2f}x vs {max_lev:.2f}x max | "
            f"{headroom:.2f}x headroom | EBITDA cushion {cushion:.1%}")
```

Once all three pass, add three more `print(covenant_line(...))` calls for borrowers you make up. In Module 3 you'll run this over a whole portfolio with a loop instead of one line per borrower.

## Explain it back

Why does `covenant_line` call `covenant_test` instead of working out PASS/BREACH again itself?

??? note "Model answer"
    The rule lives in one place. If the covenant definition changes, say a step-down to 4.75x or a different EBITDA definition, you fix `covenant_test` once and every report that uses it updates. Copying the logic into each function is how two numbers in the same report end up disagreeing.

**Next:** [Checkpoint 2](checkpoint.md)
