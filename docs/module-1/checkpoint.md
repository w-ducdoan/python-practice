---
type: lesson
workstation: Academia HQ
last_updated: 2026-10-24
---

# Checkpoint 1

[Module 1](index.md) · about 20 minutes

No hints, and the solution unlocks only after you pass. Inputs at the top, calculations in the middle, output at the bottom.

**1. Bond price.** A 4-year bond with $1,000 face value pays a 4.5% annual coupon. The yield to maturity is 5.2%. Create:

- `price`: the present value of all four years of cash flows. Each year pays a coupon of face × coupon rate, and year 4 also repays the face value. Divide each year's cash flow by (1 + ytm)^year and add them up.
- `is_discount`: `True` if the bond trades below face value
- `label`: exactly `Price: $975.29 (discount)`. Build it with an f-string from `price`. You may type the word "discount."

```exercise
id: m1-cp-bond
title: Bond price, discount flag, label
checkpoint: yes
--- starter
face = 1000
coupon_rate = 0.045
years = 4
ytm = 0.052

--- tests
check(approx(price, 975.29), f"price should be about 975.29 (yours: {price})")
check(is_discount is True, f"is_discount should be True (yours: {is_discount})")
check("<" in code or ">" in code, "calculate is_discount with a comparison")
check(label == "Price: $975.29 (discount)", f"label should be 'Price: $975.29 (discount)' (yours: '{label}')")
check("975" not in code, "let Python calculate the price; don't type it")
--- solution
face = 1000
coupon_rate = 0.045
years = 4
ytm = 0.052

coupon = face * coupon_rate
price = (coupon / (1 + ytm)
         + coupon / (1 + ytm) ** 2
         + coupon / (1 + ytm) ** 3
         + (coupon + face) / (1 + ytm) ** 4)
is_discount = price < face
label = f"Price: ${price:,.2f} (discount)"
```

**2. Terminal value.** Next year's free cash flow is $120m, the WACC is 9%, and the perpetual growth rate is 2.5%. Create `terminal_value` with the Gordon growth formula, FCF / (WACC - g). Also create `sane`, which is `True` only if WACC is greater than g **and** the terminal value is positive.

```exercise
id: m1-cp-tv
title: Terminal value with a sanity check
checkpoint: yes
--- starter
fcf_next = 120
wacc = 0.09
g = 0.025

--- tests
check(approx(terminal_value, 1846.15), f"terminal_value should be about 1846.15 (yours: {terminal_value})")
check(sane is True, f"sane should be True (yours: {sane})")
check("and" in code, "combine both conditions in sane with and")
--- solution
fcf_next = 120
wacc = 0.09
g = 0.025

terminal_value = fcf_next / (wacc - g)
sane = wacc > g and terminal_value > 0
```

Pass both and Module 1 is done. The Home page should show it as **Mastered**. Module 2 (functions and conditionals) is next. It turns these calculations into reusable tools, such as a `covenant_test()` you can run on any borrower.

**Next:** [Module 2 - Functions and conditionals](../module-2/index.md)
