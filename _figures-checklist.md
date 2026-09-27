# Figures refresh checklist

Every number on the site is dated. Review this list quarterly (next: **December 2026**), update any figure whose source has changed, then update the "as of" date everywhere it appears.

**Sourcing policy:** cite primary sources only (government agencies, grid operators and their independent market monitors, regulators, national labs, and peer-reviewed or university research). Avoid trade press, law-firm alerts, consultancies, vendors, and company blogs.

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
| Texas 4CP transmission cost reform | `script.js` (`MARKETS.ERCOT`), estimator assumptions in `index.html` | SB 6 requires the Texas PUC to evaluate 4CP and amend its transmission-cost rules by December 31, 2026. Once a new method is adopted, rewrite the ERCOT "Timing matters" text. |
| FERC large-load show-cause orders (June 2026) | `script.js` (`frontierData['ai-datacenters']`, `['grid-queues']`) | RTO responses and FERC follow-up orders will change the status described. |
| PJM co-location services (FERC, Dec 2025) | `script.js` (`frontierData['nuclear-smr']`, `MARKETS.PJM`) | Describe the approved PJM tariff once it's in place. |

## 3. Figures and when their sources update

### Hero stats (`index.html`)

| Figure | Source | Updates |
|---|---|---|
| ~410 GW large-load requests in ERCOT's queue (~87% data centers, Apr 2026) | ERCOT large-load updates (legislative briefings, TAC reports) | Monthly |
| $325/MW-day PJM capacity price (2028/29, third auction at the cap) | PJM Base Residual Auction report | After each auction |
| ~120 wks average power transformer lead time (2024; 80–210 wks for large units) | National Infrastructure Advisory Council (NIAC) report; check DOE/NREL for newer federal data | Irregular |
| 5+ yrs median request-to-operation time | LBNL *Queued Up* | Annually (mid-year) |

### Focus Areas (`script.js`, `frontierData`)

| Topic | Figures | Source | Updates |
|---|---|---|---|
| AI & Data Center Load | Transformer lead times; ~410 GW; 176 TWh (2023) and 325–580 TWh (2028); PUE 1.6 → 1.4 | NIAC; ERCOT; LBNL *U.S. Data Center Energy Usage Report* | Irregular / monthly / every few years |
| Interconnection & Transmission | ~2,060 GW active queue (1,312 GW generation, ~749 GW storage); 5+ yrs median; reconductoring doubles capacity at < half the cost | LBNL *Queued Up*; Chojkiewicz et al., PNAS (2024) | Annually / historical |
| Electrification & Winter Peaks | Winter Storm Elliott: 90.5 GW outages, 5.4 GW shed, 55% freezing/fuel | FERC–NERC report | Historical (no update needed) |
| Advanced Nuclear & SMRs | Nuclear >90% capacity factor, solar ~25%, wind ~35%; Darlington BWRX-300 licensing (construction Apr 2025, operating-licence application Mar 2026); Part 53 status | EIA; Canadian Nuclear Safety Commission; NRC | Annually / as licensing advances |
| Long-Duration Storage | 10+ hour definition; ≤ $20/kWh and ≤ $1/kWh thresholds | DOE Storage Innovations 2030; Sepulveda et al., 2021 | Historical (no update needed) |
| Prices & Market Design | $325/MW-day (~$119k/MW-year); PJM congestion $3.2B (2025); MISO real-time congestion $2.2B (2025) | PJM auction report; PJM and MISO independent market monitors' State of the Market reports | After each auction; annually (spring/summer) |

### Projects: Battery State-of-Charge Forecasting (`index.html`, `.research-facts`)

| Figure | Source | Updates |
|---|---|---|
| ~52 GW U.S. utility-scale battery capacity (mid-2026; ~70%/yr growth) | EIA | Monthly |
| 5-minute SOC-aware dispatch in ERCOT (RTC+B, Dec 2025); day-ahead market clears without SOC | ERCOT RTC+B overview and go-live release | Historical |
| $28M bid cost recovery to CAISO batteries (2023, ~10% of total) | CAISO DMM battery report | Annually (mid-year); switch to the latest year |

### Load Estimator (`script.js` `MARKETS`, constants; `index.html` assumptions)

| Figure | Where | Source | Updates |
|---|---|---|---|
| PJM $325/MW-day | `MARKETS.PJM.capacityPrice`, assumptions list | PJM Base Residual Auction | After each auction |
| MISO $126.19/MW-day (annualized North/Central); summer $424.30 | `MARKETS.MISO`, assumptions list | MISO Planning Resource Auction | Each April |
| 10,380 kWh per household per year | `HOUSEHOLD_MWH_PER_YEAR`, assumptions list | EIA | Annually |
| U.S. average PUE ~1.4 (2023), 1.15–1.35 projected (2028) | Assumptions list | LBNL *U.S. Data Center Energy Usage Report* | Every few years |
| 5CP method for PJM capacity obligations | `MARKETS.PJM.peakTiming`, assumptions list | PJM Manual 19 | As the manual is revised |
| 76 / 98 / 126 GW at 0.25 / 0.5 / 1.0% curtailment | `DUKE_HEADROOM_GW` | Norris et al., Duke Nicholas Institute (2025) | Historical |
| ERCOT ~410 GW; SB 6 details (75 MW threshold, backup generation, 4CP deadline) | `MARKETS.ERCOT` | ERCOT; SB 6 enrolled text | Monthly / as rules change |

## 4. If the site moves to a custom domain

Update the absolute URLs in the `<head>` of `index.html`: `og:url`, `og:image`, and `<link rel="canonical">`. Then refresh cached link previews with LinkedIn's Post Inspector.
