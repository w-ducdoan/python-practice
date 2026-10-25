---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 1.4 True and False

[Module 1](index.md) · about 30 minutes

## The idea

A **comparison** asks a yes/no question and gets back `True` or `False`, like Excel's `=A1>5` returning TRUE. These two values are called **booleans** (type `bool`).

| Question | Python | Watch out |
| :-- | :-- | :-- |
| Greater / less than | `>` `<` | |
| At least / at most | `>=` `<=` | |
| Equal to | `==` | Two equals signs. A single `=` stores a value, it doesn't compare |
| Not equal to | `!=` | |

Combine questions with plain English words:

- `and`: both must be true (`dscr >= 1.25 and leverage <= 4.5`)
- `or`: at least one must be true (`leverage > 6 or dscr < 1.1`)
- `not`: flips the answer (`not in_default`)

You can store the answer in a variable, which is exactly how a covenant test works: `breach = leverage > max_leverage`. In Module 2 you'll use these answers to make the program take different paths with `if`.

Text comparisons are exact: `"acme" == "ACME"` is `False`. Clean text before you compare it, using last lesson's `.strip()` and `.upper()`.

## Try it

```exercise
kind: example
id: ex-1-4
title: Comparisons
--- starter
leverage = 5.6
max_leverage = 5.25
dscr = 1.15

print(leverage > max_leverage)
print(dscr >= 1.25)
print(leverage > max_leverage and dscr >= 1.25)
print(leverage > max_leverage or dscr >= 1.25)
print(not (leverage > max_leverage))
print("acme" == "ACME", "acme".upper() == "ACME")
```

## Practice

**1.** Create `breach`: `True` if leverage is above the covenant maximum. Calculate it with a comparison, not by typing `True`.

```exercise
id: m1-breach
title: Leverage covenant test
--- starter
leverage = 5.6
max_leverage = 5.25

breach =
--- tests
check(breach is True, f"breach should be True (yours: {breach})")
check(">" in code or "<" in code, "use a comparison like leverage > max_leverage")
--- hint
breach = leverage > max_leverage
--- solution
leverage = 5.6
max_leverage = 5.25

breach = leverage > max_leverage
```

**2.** A borrower is `healthy` only if DSCR is at least 1.25x **and** leverage is at most 4.5x.

```exercise
id: m1-healthy
title: Two conditions with and
--- starter
dscr = 1.15
leverage = 4.2

healthy =
--- tests
check(healthy is False, f"healthy should be False here (yours: {healthy})")
check("and" in code, "combine the two conditions with and")
check(">=" in code and "<=" in code, "use >= for 'at least' and <= for 'at most'")
--- hint
Write each condition on its own first: dscr >= 1.25 and leverage <= 4.5
--- solution
dscr = 1.15
leverage = 4.2

healthy = dscr >= 1.25 and leverage <= 4.5
```

**3.** A loan goes on the `watchlist` if leverage is above 6.0x **or** DSCR is below 1.1x.

```exercise
id: m1-watchlist
title: Two conditions with or
--- starter
leverage = 5.8
dscr = 1.05

watchlist =
--- tests
check(watchlist is True, f"watchlist should be True here (yours: {watchlist})")
check(" or " in code, "combine the two conditions with or")
--- hint
watchlist = leverage > 6.0 or dscr < 1.1
--- solution
leverage = 5.8
dscr = 1.05

watchlist = leverage > 6.0 or dscr < 1.1
```

**4.** Two systems spell the same ticker differently. Create `same`: compare them after cleaning both, so the result is `True`.

```exercise
id: m1-same-ticker
title: Compare cleaned text
--- starter
ticker_a = "ACME"
ticker_b = " acme"

same =
--- tests
check(same is True, f"same should be True (yours: {same})")
check("==" in code, "compare with ==")
check(".upper()" in code or ".lower()" in code, "clean the case with .upper() or .lower()")
check(".strip()" in code, "remove the stray space with .strip()")
--- hint
Clean ticker_b with .strip().upper(), then compare it to ticker_a with ==.
--- solution
ticker_a = "ACME"
ticker_b = " acme"

same = ticker_a == ticker_b.strip().upper()
```

**5.** Create `performing` as the opposite of `in_default` using `not`. Then create `ok_to_extend`: performing **and** fewer than 3 amendments.

```exercise
id: m1-not
title: not, and
--- starter
in_default = False
amendments = 2

performing =
ok_to_extend =
--- tests
check(performing is True, f"performing should be True (yours: {performing})")
check("not" in code, "use not in_default")
check(ok_to_extend is True, f"ok_to_extend should be True (yours: {ok_to_extend})")
check("performing" in code.split("ok_to_extend")[-1], "build ok_to_extend from performing")
--- hint
performing = not in_default
--- hint
ok_to_extend = performing and amendments < 3
--- solution
in_default = False
amendments = 2

performing = not in_default
ok_to_extend = performing and amendments < 3
```

## Explain it back

What's the difference between `max_leverage = 5.25` and `max_leverage == 5.25`?

??? note "Model answer"
    One `=` stores 5.25 under the name `max_leverage`. Two `==` asks whether `max_leverage` currently equals 5.25 and gives back `True` or `False`, without changing anything.

**Next:** [1.5 Capstone - loan payment](1-5-capstone.md)
