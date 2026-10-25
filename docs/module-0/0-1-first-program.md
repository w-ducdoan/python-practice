---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 0.1 Your first program

[Module 0](index.md) · about 25 minutes

## The idea

A **program** is a list of instructions that Python carries out one line at a time, top to bottom. Think of a model where every cell is computed in a fixed order: line 1, then line 2, then line 3. Nothing runs out of order, and nothing runs twice unless you tell it to.

`print(...)` is the instruction that shows something on screen. Whatever goes inside the parentheses gets displayed.

- **Text** goes inside quotes: `print("Hello")`. Text in quotes is called a **string**.
- **Numbers** go without quotes, and Python does the math first: `print(2 + 3)` shows `5`.
- **Several items** can go in one `print`, separated by commas. Python puts a space between them: `print("Price:", 120.5)` shows `Price: 120.5`.
- A **comment** starts with `#`. Python ignores everything after the `#` on that line. Use comments to leave notes, or to switch a line off without deleting it.

One trap to watch for: `print("2 + 3")` shows the text `2 + 3`, because the quotes make it a string. Quotes mean "show this exactly as written."

## Try it

Press **Run**. Then change the numbers or the text and run it again.

```exercise
kind: example
id: ex-0-1
title: print in action
--- starter
# Lines starting with # are comments. Python skips them.
print("Hello from Python")
print(2 + 3)
print("2 + 3")
print("Revenue ($m):", 1250)
print("Next year at 8% growth:", 1250 * 1.08)
```

## Practice

**1.** Make the program print exactly `Hello, Python`, with a capital H, a comma, and a capital P.

```exercise
id: m0-hello
title: Hello, Python
--- starter
print("")
--- tests
lines = output.strip().splitlines()
check(len(lines) == 1, "print exactly one line")
check(lines and lines[0] == "Hello, Python", f"the line should read 'Hello, Python' (yours: {lines[0] if lines else 'nothing'})")
--- hint
Put the text between the two quote marks.
--- hint
Capitals, the comma and the space all count. The text must match exactly.
--- solution
print("Hello, Python")
```

**2.** Print two lines. The first is `Ticker: ACME`. The second is `Price: 120.5`, where `120.5` is a number, not text.

```exercise
id: m0-two-lines
title: Two lines
--- starter
# Line 1: the ticker


# Line 2: the price, using a comma and a number

--- tests
lines = output.strip().splitlines()
check(len(lines) == 2, f"print exactly two lines (you printed {len(lines)})")
check(len(lines) > 0 and lines[0] == "Ticker: ACME", "line 1 should be 'Ticker: ACME'")
check(len(lines) > 1 and lines[1] == "Price: 120.5", "line 2 should be 'Price: 120.5'")
check("120.5)" in code.replace(" ", ""), "pass 120.5 as a number after a comma, like print(\"Price:\", 120.5)")
--- hint
Each print makes one line, so you need two prints.
--- hint
For line 2, put the label in quotes, then a comma, then the number without quotes.
--- solution
print("Ticker: ACME")
print("Price:", 120.5)
```

**3.** A $1,000 deposit earns 5% for one year. Have Python calculate the ending balance, deposit × (1 + rate), and print it. Don't type the answer yourself.

```exercise
id: m0-math-print
title: Let Python do the math
--- starter
print()
--- tests
check(output.strip() == "1050.0", f"Python should print 1050.0 (yours: {output.strip() or 'nothing'})")
check("*" in code, "use * for multiplication, so Python does the calculation")
--- hint
Multiplication in Python is `*`. Growing by 5% means multiplying by 1.05.
--- solution
print(1000 * 1.05)
```

**4.** These deal steps print in the wrong order. Rearrange the lines so they print 1, 2, 3, 4. Copy and paste is fine.

```exercise
id: m0-order
title: Deal steps in order
--- starter
print("3. Submit IOI")
print("1. Sign NDA")
print("4. Management meeting")
print("2. Receive CIM")
--- tests
lines = output.strip().splitlines()
check(lines == ["1. Sign NDA", "2. Receive CIM", "3. Submit IOI", "4. Management meeting"],
      "the four steps should print in order 1, 2, 3, 4")
--- hint
Python runs lines top to bottom, so the top line prints first.
--- solution
print("1. Sign NDA")
print("2. Receive CIM")
print("3. Submit IOI")
print("4. Management meeting")
```

**5.** Switch off the middle line with a comment, so the program prints only the first and last lines. Don't delete it.

```exercise
id: m0-comment
title: Comment it out
--- starter
print("Base case: 12% IRR")
print("Draft number - do not show")
print("Downside case: 7% IRR")
--- tests
lines = output.strip().splitlines()
check(lines == ["Base case: 12% IRR", "Downside case: 7% IRR"], "only the base case and downside case lines should print")
check("Draft number" in code, "keep the middle line in your code; comment it out instead of deleting it")
--- hint
Put `#` at the very start of the line you want to switch off.
--- solution
print("Base case: 12% IRR")
# print("Draft number - do not show")
print("Downside case: 7% IRR")
```

## Explain it back

In your own words: what's the difference between `print(1000 * 1.05)` and `print("1000 * 1.05")`?

??? note "Model answer"
    The first has no quotes, so Python calculates the expression and prints `1050.0`. The second is a string because of the quotes, so Python prints the characters exactly as written: `1000 * 1.05`.

**Next:** [0.2 Reading error messages](0-2-errors.md)
