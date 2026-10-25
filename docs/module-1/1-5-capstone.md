---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# 1.5 Capstone - loan payment

[Module 1](index.md) · about 35 minutes

## The idea

Nothing new in this lesson. You'll combine numbers, variables, formatting and comparisons into two small models. This is the habit to build: **inputs at the top, calculations in the middle, output at the bottom**, the same layout as a clean Excel model.

The level payment on an amortizing loan is the annuity formula:

```text
payment = P * r / (1 - (1 + r) ** -n)
```

Here `P` is the principal, `r` is the rate **per period**, and `n` is the **number of periods**. For monthly payments, r = annual rate / 12 and n = years × 12. In Python, (1 + r)^(-n) is `(1 + r) ** -n`.

## Practice

**1. Mortgage.** Fill in the calculations. All the variables named in the starter must exist when you're done.

```exercise
id: m1-cap-mortgage
title: Mortgage payment
--- starter
# Inputs
principal = 250000
annual_rate = 0.065
years = 30

# Calculations
monthly_rate =
n_payments =
payment =
total_paid =
total_interest =

# Output
summary =      # exactly: Monthly payment: $1,580.17
print(summary)
--- tests
check(approx(monthly_rate, 0.065 / 12, 1e-9), "monthly_rate should be annual_rate / 12")
check(n_payments == 360, f"n_payments should be 360 (yours: {n_payments})")
check(approx(payment, 1580.17), f"payment should be about 1580.17 (yours: {payment})")
check(approx(total_paid, 568861.22, 0.5), f"total_paid should be about 568,861 (yours: {total_paid})")
check(approx(total_interest, 318861.22, 0.5), f"total_interest should be about 318,861 (yours: {total_interest})")
check(summary == "Monthly payment: $1,580.17", f"summary should be 'Monthly payment: $1,580.17' (yours: '{summary}')")
--- hint
monthly_rate = annual_rate / 12 and n_payments = years * 12
--- hint
payment = principal * monthly_rate / (1 - (1 + monthly_rate) ** -n_payments)
--- hint
total_paid is payment times the number of payments. Interest is what you paid above the principal.
--- solution
# Inputs
principal = 250000
annual_rate = 0.065
years = 30

# Calculations
monthly_rate = annual_rate / 12
n_payments = years * 12
payment = principal * monthly_rate / (1 - (1 + monthly_rate) ** -n_payments)
total_paid = payment * n_payments
total_interest = total_paid - principal

# Output
summary = f"Monthly payment: ${payment:,.2f}"
print(summary)
```

**2. Term loan.** A $50m, 5-year term loan priced at the base rate plus a spread, with **quarterly** level payments. Also test whether EBITDA covers a year of interest at least 2.0x. For simplicity, use the full $50m balance for the interest coverage.

```exercise
id: m1-cap-termloan
title: Term loan and interest coverage
--- starter
# Inputs ($m)
principal = 50
base_rate = 0.043
spread_bps = 525
years = 5
ebitda = 18.0
min_icr = 2.0

# Calculations
annual_rate =        # base rate plus the spread (525 bps = 0.0525)
quarterly_rate =
n_payments =
payment =            # per quarter, $m
annual_interest =    # principal times annual_rate
icr =                # ebitda / annual_interest
passes_icr =

# Output
print(f"All-in rate: {annual_rate:.2%}")
print(f"Quarterly payment: ${payment:,.2f}m")
print(f"ICR: {icr:.2f}x  Passes: {passes_icr}")
--- tests
check(approx(annual_rate, 0.0955, 1e-9), f"annual_rate should be 0.0955 (yours: {annual_rate})")
check(n_payments == 20, f"n_payments should be 20 quarters (yours: {n_payments})")
check(approx(payment, 3.1734, 0.001), f"payment should be about 3.1734 per quarter (yours: {payment})")
check(approx(icr, 3.77, 0.01), f"icr should be about 3.77 (yours: {icr})")
check(passes_icr is True, f"passes_icr should be True (yours: {passes_icr})")
check("spread_bps" in code.split("annual_rate")[1], "build annual_rate from base_rate and spread_bps")
--- hint
Basis points to a decimal: divide by 10,000. So annual_rate = base_rate + spread_bps / 10000.
--- hint
Quarterly: divide the annual rate by 4 and multiply years by 4. The payment formula is the same one you used for the mortgage.
--- hint
passes_icr = icr >= min_icr
--- solution
# Inputs ($m)
principal = 50
base_rate = 0.043
spread_bps = 525
years = 5
ebitda = 18.0
min_icr = 2.0

# Calculations
annual_rate = base_rate + spread_bps / 10000
quarterly_rate = annual_rate / 4
n_payments = years * 4
payment = principal * quarterly_rate / (1 - (1 + quarterly_rate) ** -n_payments)
annual_interest = principal * annual_rate
icr = ebitda / annual_interest
passes_icr = icr >= min_icr

# Output
print(f"All-in rate: {annual_rate:.2%}")
print(f"Quarterly payment: ${payment:,.2f}m")
print(f"ICR: {icr:.2f}x  Passes: {passes_icr}")
```

Once both pass, change an input (raise `spread_bps` to 900, or cut `ebitda` to 8) and run the code again. Watch `passes_icr` flip. That's a sensitivity case run in three seconds.

## Explain it back

Why do you divide the annual rate by 12 **and** multiply the years by 12 for monthly payments? What goes wrong if you only do one?

??? note "Model answer"
    The rate and the number of periods have to use the same unit of time. If you divide only the rate, you're pretending the loan lasts 30 months. If you multiply only the years, you're charging a full year's interest every month. Either way the payment comes out badly wrong.

**Next:** [Checkpoint 1](checkpoint.md)
