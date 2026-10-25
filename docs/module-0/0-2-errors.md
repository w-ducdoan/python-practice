---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 0.2 Reading error messages

[Module 0](index.md) · about 25 minutes

## The idea

Errors are normal. Professional programmers hit them all day. An error message is Python telling you **what** went wrong and **where**, the same way Excel shows `#NAME?` or `#VALUE!` in the broken cell.

On this site an error looks like `Line 2: NameError: name 'prnt' is not defined`. Read it in three parts:

1. **Line 2** is where to look.
2. **NameError** is the kind of problem.
3. **name 'prnt' is not defined** is the detail.

These are the three errors you'll hit most:

| Error | Plain English | Excel cousin | Usual cause |
| :-- | :-- | :-- | :-- |
| `SyntaxError` | "I can't even read this line" | A formula with a missing bracket | Missing `)` or a missing quote mark |
| `NameError` | "I don't know that word" | `#NAME?` | A typo (`prnt`), or text missing its quotes |
| `TypeError` | "Those two things don't mix" | `#VALUE!` | Adding text to a number with `+` |

One habit to build now: when something breaks, read the error before you touch the code.

## Try it

Run this as is and read the error. Then fix the typo and run it again.

```exercise
kind: example
id: ex-0-2
title: A NameError
--- starter
print("EBITDA ($m):", 312.5)
prnt("Net debt ($m):", 900)
```

## Practice

Each program below is broken. Run it first, read the error, then fix it.

**1.** Missing piece.

```exercise
id: m0-fix-syntax
title: Fix the SyntaxError
--- starter
print("Revenue grew 12% this year"
--- tests
check(output.strip() == "Revenue grew 12% this year", "the program should print: Revenue grew 12% this year")
--- hint
Every opening bracket needs a closing one.
--- solution
print("Revenue grew 12% this year")
```

**2.** Python doesn't recognize a word.

```exercise
id: m0-fix-name
title: Fix the NameError (typo)
--- starter
print("Sponsor: Sycamore")
Print("Facility: First-lien term loan")
--- tests
lines = output.strip().splitlines()
check(lines == ["Sponsor: Sycamore", "Facility: First-lien term loan"], "both lines should print")
--- hint
Python is case-sensitive. `print` and `Print` are different words.
--- solution
print("Sponsor: Sycamore")
print("Facility: First-lien term loan")
```

**3.** This one should print the word `Covenant`, but Python thinks it's a name.

```exercise
id: m0-fix-quotes
title: Fix the NameError (missing quotes)
--- starter
print(Covenant)
--- tests
check(output.strip() == "Covenant", "the program should print: Covenant")
--- hint
Text needs quote marks around it. Without them, Python looks for something named Covenant.
--- solution
print("Covenant")
```

**4.** Text and a number don't mix with `+`. Make it print `Leverage: 5.2x` using commas inside `print`. Keep `5.2` as a number.

```exercise
id: m0-fix-type
title: Fix the TypeError
--- starter
print("Leverage: " + 5.2 + "x")
--- tests
check(output.strip() in ("Leverage: 5.2 x", "Leverage: 5.2x"), f"should print 'Leverage: 5.2 x' or 'Leverage: 5.2x' (yours: {output.strip()})")
check("5.2," in code.replace(" ", "") or "5.2)" in code.replace(" ", ""), "keep 5.2 as a number (no quotes), separated by commas")
--- hint
Replace each `+` with a comma. Commas let print mix text and numbers.
--- hint
Commas add a space, so you'll get `Leverage: 5.2 x`. That's fine for now. Module 1 shows how to remove the space.
--- solution
print("Leverage:", 5.2, "x")
```

**5.** Two bugs in one program. Fix both. Hint: after you fix the first one, run again and Python will point you to the second.

```exercise
id: m0-fix-two
title: Two bugs
--- starter
print("Deal: Project Arrow)
print("Size ($m):", 235)
print("Tenor (years):" 7)
--- tests
lines = output.strip().splitlines()
check(lines == ["Deal: Project Arrow", "Size ($m): 235", "Tenor (years): 7"], "all three lines should print correctly")
--- hint
Line 1 is missing something at the end of the text.
--- hint
Line 3 is missing the separator between the label and the number.
--- solution
print("Deal: Project Arrow")
print("Size ($m):", 235)
print("Tenor (years):", 7)
```

## Explain it back

You see `Line 3: NameError: name 'revnue' is not defined`. What's wrong, and where would you look?

??? note "Model answer"
    Look at line 3. Python found a word it doesn't recognize: `revnue`, almost certainly a typo for `revenue`. Either fix the spelling, or, if it was meant to be text, put it in quotes.

**Next:** [Checkpoint 0](checkpoint.md)
