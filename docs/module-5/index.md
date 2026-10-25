---
type: lesson-index
workstation: Academia HQ
last_updated: 2026-10-24
---

# Module 5 - NumPy and pandas

[Back to Home](../index.md)

**Objective:** load, select, filter, group and aggregate tables with pandas, and do array math with NumPy, the core toolkit the CFA module and analyst work are built on.

**Time:** about 6 hours, over seven or eight sessions.

| Lesson | What you learn |
| :-- | :-- |
| [5.1 NumPy arrays](5-1-numpy.md) | Math on whole arrays at once, discount vectors, returns, sample volatility, masks |
| [5.2 DataFrames](5-2-dataframes.md) | `read_csv`, columns, new columns, building a table, quick summaries |
| [5.3 Selecting and filtering](5-3-filtering.md) | Boolean filters, combining conditions (and / or / not), `.isin`, `.loc`, sorting, top N |
| [5.4 Grouping and reshaping](5-4-grouping.md) | `groupby`, named aggregations, `value_counts`, `pivot` from long to wide |
| [5.5 Capstone - portfolio holdings](5-5-capstone.md) | Weights, P&L, sector exposure, top-10 concentration, HHI, limit breaches |
| [Checkpoint 5](checkpoint.md) | Prove it: volatility by ticker and P&L by sector, no hints |

**Everything you built by hand in Modules 3-4 has a one-line pandas version.** That's the point: you now know what those one-liners do underneath. When a pandas result looks wrong, you can reason about it as a loop.

The exercises run real pandas and NumPy in your browser. The first exercise on each page takes a few extra seconds while pandas downloads. Your laptop setup from 4.3 has the same libraries, so you can run any of this in a notebook too.

**Optional reading:** *Python for Data Analysis* (McKinney), chapters 4-5 and 10, free at [wesmckinney.com/book](https://wesmckinney.com/book/).
