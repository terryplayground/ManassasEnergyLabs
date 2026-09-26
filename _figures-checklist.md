# Figures refresh checklist

Every number on the site is dated. Review this list quarterly (next: **December 2026**), update any figure whose source has changed, then update the "as of" date everywhere it appears.

The leading underscore in this file's name keeps GitHub Pages from publishing it.

## 1. "As of" date (update last, in all three places)

| Where | File | Text to change |
|---|---|---|
| Hero stats, under the four numbers | `index.html` (`.metrics-asof`) | "Figures current as of September 2026" |
| Load Estimator, last assumption bullet | `index.html` (`.sim-assumptions`) | "Prices and figures current as of September 2026" |
| Footer | `index.html` (`.footer-bottom`) | "Figures current as of September 2026" |

## 2. Time-sensitive items to check first

| Item | Where | Why |
|---|---|---|
| Texas 4CP transmission cost reform | `script.js` (`MARKETS.ERCOT`), estimator assumptions in `index.html` | Texas regulators must revise 4CP by the end of 2026 under SB 6 (Project 58484). Once a new method is adopted, rewrite the ERCOT "Timing matters" text. |
| FERC large-load show-cause orders (June 2026) | `script.js` (`frontierData['ai-datacenters']`, `['grid-queues']`) | RTO responses and FERC follow-up orders will change the status described. |
| PJM co-location services (FERC, Dec 2025) | `script.js` (`frontierData['nuclear-smr']`, `MARKETS.PJM`) | Describe the approved PJM tariff once it's in place. |

## 3. Figures and when their sources update

### Hero stats (`index.html`)

| Figure | Source | Updates |
|---|---|---|
| 438 GW large-load requests in ERCOT's queue (~90% data centers; 63 GW at end-2024) | ERCOT large-load reports / Utility Dive | Monthly |
| $325/MW-day PJM capacity price (2028/29, third auction at the cap) | PJM Base Residual Auction results | After each auction |
| ~2.5 yrs power transformer lead time (~128 wks; ~144 wks for GSUs) | Wood Mackenzie supply-chain survey | About annually |
| 5+ yrs median request-to-operation time | LBNL *Queued Up* | Annually (mid-year) |

### Focus Areas (`script.js`, `frontierData`)

| Topic | Figures | Source | Updates |
|---|---|---|---|
| AI & Data Center Load | Transformer lead times; 438 GW; PUE 1.54; hyperscale PUE ~1.1 | Wood Mackenzie; ERCOT; Uptime Institute survey; Google | Annual / monthly |
| Interconnection & Transmission | ~2,060 GW active queue (1,312 GW generation, ~749 GW storage); 5+ yrs median | LBNL *Queued Up* | Annually |
| Electrification & Winter Peaks | Winter Storm Elliott: 90.5 GW outages, 5.4 GW shed, 55% freezing/fuel | FERC–NERC report | Historical (no update needed) |
| Advanced Nuclear & SMRs | Nuclear >90% capacity factor, solar ~25%, wind ~35%; OPG BWRX-300 end-2030 target; Part 53 status | EIA; OPG; NRC | Annually |
| Long-Duration Storage | ≤ $20/kWh and ≤ $1/kWh thresholds | Sepulveda et al., 2021 | Historical (no update needed) |
| Prices & Market Design | $325/MW-day (~$119k/MW-year); congestion $12B+ (2024) | PJM; Grid Strategies | After each auction; annually |

### Projects: Battery State-of-Charge Forecasting (`index.html`, `.research-facts`)

| Figure | Source | Updates |
|---|---|---|
| ~52 GW U.S. utility-scale battery capacity (mid-2026; ~70%/yr growth) | EIA | Monthly |
| 5-minute SOC-aware dispatch in ERCOT (RTC+B, Dec 2025) | ERCOT | Historical |
| $28M bid cost recovery to CAISO batteries (2023, ~10% of total) | CAISO DMM battery report | Annually (mid-year); switch to the latest year |

### Load Estimator (`script.js` `MARKETS`, constants; `index.html` assumptions)

| Figure | Where | Source | Updates |
|---|---|---|---|
| PJM $325/MW-day | `MARKETS.PJM.capacityPrice`, assumptions list | PJM Base Residual Auction | After each auction |
| MISO $126.19/MW-day (annualized North/Central); summer $424.30 | `MARKETS.MISO`, assumptions list | MISO Planning Resource Auction | Each April |
| 10,380 kWh per household per year | `HOUSEHOLD_MWH_PER_YEAR`, assumptions list | EIA | Annually |
| Global average PUE 1.54 | Assumptions list | Uptime Institute survey | Annually |
| 76 / 98 / 126 GW at 0.25 / 0.5 / 1.0% curtailment | `DUKE_HEADROOM_GW` | Duke Nicholas Institute (2025) | Historical |
| ERCOT 438 GW; SB 6 details | `MARKETS.ERCOT` | ERCOT; PUCT | Monthly / as rules change |

## 4. If the site moves to a custom domain

Update the absolute URLs in the `<head>` of `index.html`: `og:url`, `og:image`, and `<link rel="canonical">`. Then refresh cached link previews with LinkedIn's Post Inspector.
