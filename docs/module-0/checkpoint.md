---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 0

[Module 0](index.md) · about 15 minutes

No hints, and the solution unlocks only after you pass. Do it without scrolling back to the lessons. If you get stuck for more than 10 minutes, go back and redo the matching lesson exercise, then come back here.

**1.** Print this mini tear sheet. Python must calculate EBITDA as revenue times a 25% margin, and Python must calculate net debt as 900 minus 150 of cash. Don't type the results yourself.

```text
Company: Cedar Corp
Revenue ($m): 1250
EBITDA ($m): 312.5
Net debt ($m): 750
```

```exercise
id: m0-cp-tearsheet
title: Mini tear sheet
checkpoint: yes
--- starter
# Your code here
--- tests
lines = output.strip().splitlines()
expected = ["Company: Cedar Corp", "Revenue ($m): 1250", "EBITDA ($m): 312.5", "Net debt ($m): 750"]
check(lines == expected, "the four lines should match the tear sheet exactly")
check("312.5" not in code and "750" not in code, "Python should calculate 312.5 and 750; don't type them")
--- solution
print("Company: Cedar Corp")
print("Revenue ($m):", 1250)
print("EBITDA ($m):", 1250 * 0.25)
print("Net debt ($m):", 900 - 150)
```

**2.** Fix every bug so the program prints the three lines its author intended.

```exercise
id: m0-cp-debug
title: Debug a broken summary
checkpoint: yes
--- starter
print("Loan: Unitranche)
prnt("Spread (bps):", 575)
print("All-in rate (%):" + 4.3 + 5.75)
--- tests
lines = output.strip().splitlines()
check(len(lines) == 3, "print three lines")
check(len(lines) > 0 and lines[0] == "Loan: Unitranche", "line 1 should be 'Loan: Unitranche'")
check(len(lines) > 1 and lines[1] == "Spread (bps): 575", "line 2 should be 'Spread (bps): 575'")
check(len(lines) > 2 and lines[2] == "All-in rate (%): 10.05", "line 3 should be 'All-in rate (%): 10.05' (the rate is 4.3 + 5.75)")
--- solution
print("Loan: Unitranche")
print("Spread (bps):", 575)
print("All-in rate (%):", 4.3 + 5.75)
```

Pass both and Module 0 is done. Check the Home page: it should show Module 0 as **Mastered**.

**Next:** [Module 1 - Values and variables](../module-1/index.md)
