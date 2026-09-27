/**
 * Manassas Energy Labs - Interactive Platform Engine
 * Dependency-free interactive features.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Each feature is isolated so one failure can't take down the rest of the page.
    [
        initThemeToggle,
        initMobileNav,
        initHeroCanvas,
        initScrollProgressAndSpy,
        initFrontierExplorer,
        initGridSimulator,
        initModals,
        initAdvisoryModal,
        initScrollAnimations,
        initBackToTop
    ].forEach(init => {
        try {
            init();
        } catch (err) {
            console.error(`[MEL] ${init.name} failed:`, err);
        }
    });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ==========================================================================
   Shared helpers
   ========================================================================== */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderList(listEl, items) {
    listEl.replaceChildren(...items.map(item => el('li', null, item)));
}

function renderSources(listEl, sources) {
    listEl.replaceChildren(...sources.map(src => {
        const li = el('li');
        const link = el('a', null, src.label);
        link.href = src.url;
        link.target = '_blank';
        link.rel = 'noopener';
        li.appendChild(link);
        return li;
    }));
}

/* ==========================================================================
   1. Theme Toggle (initial theme is applied inline in <head>)
   ========================================================================== */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    updateToggleLabel(document.documentElement.getAttribute('data-theme') || 'light');

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        try {
            localStorage.setItem('mel_theme', newTheme);
        } catch (e) { /* storage unavailable: theme still applies for this visit */ }
        updateToggleLabel(newTheme);
    });

    // Follow OS theme changes unless the visitor has picked a theme on this site
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try {
            saved = localStorage.getItem('mel_theme');
        } catch (err) { /* storage unavailable: treat as no saved choice */ }
        if (saved) return;
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateToggleLabel(theme);
    });

    function updateToggleLabel(theme) {
        const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
        themeToggleBtn.setAttribute('title', label);
        themeToggleBtn.setAttribute('aria-label', label);
    }
}

/* ==========================================================================
   2. Mobile Navigation Menu
   ========================================================================== */
function initMobileNav() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('nav-menu-btn');
    const links = document.querySelectorAll('.nav-links a, .nav-links button');
    if (!navbar || !menuBtn) return;

    function setOpen(open) {
        navbar.classList.toggle('nav-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    menuBtn.addEventListener('click', () => setOpen(!navbar.classList.contains('nav-open')));
    links.forEach(link => link.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('nav-open')) {
            setOpen(false);
            menuBtn.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (navbar.classList.contains('nav-open') && !navbar.contains(e.target)) setOpen(false);
    });
}

/* ==========================================================================
   3. Hero Canvas (decorative network animation)
   ========================================================================== */
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let particles = [];
    let rafId = null;
    let heroVisible = true;
    let lastWidth = 0;
    const particleCount = 45;
    const maxDistance = 150;
    const mouse = { x: null, y: null, radius: 180 };

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2.5 + 1.5;
            this.isNode = Math.random() > 0.7; // highlighted substation node
            this.pulse = Math.random() * Math.PI;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulse += 0.03;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0 && dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw(isDark) {
            ctx.beginPath();
            const currentRadius = this.isNode ? this.radius + Math.sin(this.pulse) * 0.8 : this.radius;
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);

            if (this.isNode) {
                ctx.fillStyle = isDark ? '#38bdf8' : '#c92a2a';
            } else {
                ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(4, 20, 43, 0.35)';
            }
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawFrame(advance) {
        ctx.clearRect(0, 0, width, height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const alpha = (1 - dist / maxDistance) * (isDark ? 0.25 : 0.15);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    if (particles[i].isNode || particles[j].isNode) {
                        ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha * 1.5})` : `rgba(201, 42, 42, ${alpha * 1.5})`;
                        ctx.lineWidth = 1.2;
                    } else {
                        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(4, 20, 43, ${alpha})`;
                        ctx.lineWidth = 0.8;
                    }
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            if (advance) p.update();
            p.draw(isDark);
        });
    }

    function animate() {
        drawFrame(true);
        rafId = requestAnimationFrame(animate);
    }

    function start() {
        if (rafId === null && heroVisible && !document.hidden && !prefersReducedMotion.matches) {
            rafId = requestAnimationFrame(animate);
        }
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    window.addEventListener('resize', () => {
        resize();
        // Mobile browsers fire resize when the address bar shows or hides; only rebuild on real width changes
        if (Math.abs(width - lastWidth) > 40) {
            lastWidth = width;
            initParticles();
        } else {
            particles.forEach(p => {
                p.x = Math.min(Math.max(p.x, 0), width);
                p.y = Math.min(Math.max(p.y, 0), height);
            });
        }
        drawFrame(false);
    });

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Pause when the hero is off-screen or the tab is hidden
    new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        heroVisible ? start() : stop();
    }).observe(canvas.parentElement);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    prefersReducedMotion.addEventListener('change', () => {
        if (prefersReducedMotion.matches) {
            stop();
            drawFrame(false);
        } else {
            start();
        }
    });

    // Redraw the static frame when the theme changes under reduced motion
    new MutationObserver(() => {
        if (rafId === null) drawFrame(false);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    resize();
    lastWidth = width;
    initParticles();
    drawFrame(false);
    start();
}

/* ==========================================================================
   4. Scroll Progress Bar & Navigation ScrollSpy
   ========================================================================== */
function initScrollProgressAndSpy() {
    const progressBar = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        let currentSection = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            if (scrollTop >= secTop && scrollTop < secTop + sec.offsetHeight) {
                currentSection = sec.getAttribute('id');
            }
        });

        // The last section is too short to reach the threshold, so treat the page bottom as that section
        if (docHeight > 0 && scrollTop >= docHeight - 2 && sections.length) {
            currentSection = sections[sections.length - 1].getAttribute('id');
        }

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${currentSection}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ==========================================================================
   5. Focus Areas: Interactive Deep-Dive Explorer
   ========================================================================== */
const SOURCES = {
    niac: { label: 'National Infrastructure Advisory Council, Power Transformer Shortage report (Jun 2024)', url: 'https://www.cisa.gov/sites/default/files/2024-09/NIAC_Addressing%20the%20Critical%20Shortage%20of%20Power%20Transformers%20to%20Ensure%20Reliability%20of%20the%20U.S.%20Grid_Report_06112024_508c_pdf_0.pdf' },
    nercLoadLoss: { label: 'NERC, Incident Review: Voltage-Sensitive Load Reductions (2025)', url: 'https://www.nerc.com/globalassets/our-work/reports/event-reports/incident_review_large_load_loss.pdf' },
    fercColocation: { label: 'FERC, PJM co-location order fact sheet (Dec 2025)', url: 'https://www.ferc.gov/news-events/news/fact-sheet-ferc-directs-nations-largest-grid-operator-create-new-rules-embrace' },
    fercLargeLoad: { label: 'FERC, large-load show cause orders to six RTOs/ISOs (Jun 2026)', url: 'https://www.ferc.gov/news-events/news/ferc-launches-aggressive-targeted-action-speed-large-load-integration' },
    ercotQueue: { label: 'ERCOT, Large Load update to the Texas House State Affairs Committee (Apr 2026)', url: 'https://www.ercot.com/files/docs/2026/04/09/ERCOTLargeLoadUpdate-April9HouseStateAffairsHearing.pdf' },
    lbnlDataCenters: { label: 'LBNL, 2024 United States Data Center Energy Usage Report', url: 'https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report_1.pdf' },
    lbnlQueue: { label: 'LBNL, Queued Up: 2026 Edition', url: 'https://emp.lbl.gov/publications/queued-2026-edition-characteristics' },
    reconductoring: { label: 'Chojkiewicz et al., PNAS (2024), advanced conductors in existing right-of-way', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11459140/' },
    elliott: { label: 'FERC–NERC, Winter Storm Elliott report', url: 'https://www.ferc.gov/news-events/news/ferc-nerc-release-final-report-lessons-winter-storm-elliott' },
    part53: { label: 'NRC, Part 53 final rule', url: 'https://www.nrc.gov/facilities-safety/new-reactors/advanced-reactors/modernizing-how-we-regulate/rulemaking/part-53-risk-informed-technology-inclusive-regulatory-framework-for-advanced-reactors' },
    cnscDarlington: { label: 'Canadian Nuclear Safety Commission, Darlington New Nuclear Project', url: 'https://www.cnsc-ccsn.gc.ca/eng/reactors/new-reactor-power-plant-projects/new-reactor-power-plant-facilities/darlington-new-nuclear-project/' },
    eiaCapacityFactor: { label: 'EIA, capacity factors for non-fossil generators', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_6_07_b' },
    sepulveda: { label: 'Sepulveda et al., Nature Energy (2021)', url: 'https://www.nature.com/articles/s41560-021-00796-8' },
    pjmBra: { label: 'PJM, 2028/2029 Base Residual Auction Report (Jul 2026)', url: 'https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-auction-info/2028-2029/2028-2029-bra-results-report.pdf' },
    pjmImm: { label: 'PJM Independent Market Monitor, 2025 State of the Market Report', url: 'https://www.monitoringanalytics.com/reports/PJM_State_of_the_Market/2025.shtml' },
    miso: { label: 'MISO, 2026/27 Planning Resource Auction', url: 'https://www.misoenergy.org/meet-miso/media-center/2026---news-releases/misos-planning-resource-auction-shows-sufficient-capacity-for-coming-year' },
    duke: { label: 'Norris et al., Duke Nicholas Institute, Rethinking Load Growth (2025)', url: 'https://nicholasinstitute.duke.edu/publications/rethinking-load-growth' },
    sb6: { label: 'Texas Legislature, SB 6 enrolled text (89th Legislature, 2025)', url: 'https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00006F.htm' },
    susquehanna: { label: 'FERC, order rejecting the Susquehanna ISA amendment, 189 FERC ¶ 61,078 (Nov 2024)', url: 'https://www.ferc.gov/sites/default/files/2024-11/20241101-3061_ER24-2172-000.pdf' },
    gdc17: { label: 'eCFR, 10 CFR Part 50 Appendix A (General Design Criterion 17)', url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-50/appendix-Appendix%20A%20to%20Part%2050' },
    rtcb: { label: 'ERCOT, RTC+B go-live (Dec 2025)', url: 'https://www.ercot.com/news/release/12052025-ercot-goes-live' },
    sb100: { label: 'California Energy Commission, SB 100', url: 'https://www.energy.ca.gov/sb100' },
    georgiaPsc: { label: 'Georgia PSC, large-load rule (Jan 2025)', url: 'https://psc.ga.gov/site/assets/files/8617/media_advisory_data_centers_rule_1-23-2025.pdf' },
    pjmPlc: { label: 'PJM Manual 19: Load Forecasting and Analysis (5CP)', url: 'https://www.pjm.com/~/media/documents/manuals/m19.ashx' },
    ercot4cp: { label: 'ERCOT, Four Coincident Peak calculations', url: 'https://www.ercot.com/mktinfo/data_agg/4cp' },
    misoImm: { label: 'MISO Independent Market Monitor, 2025 State of the Market (Jul 2026)', url: 'https://cdn.misoenergy.org/20260701%20Markets%20Committee%20of%20the%20BOD%20Item%2004%20State%20of%20the%20Market%20Presentation765606.pdf' },
    doeLdes: { label: 'U.S. DOE, Storage Innovations 2030 (Long-Duration Storage Shot)', url: 'https://www.energy.gov/oe/storage-innovations-2030' }
};

const frontierData = {
    'ai-datacenters': {
        title: 'AI & Data Center Load Growth',
        pill: 'Large Loads',
        summary: 'AI training clusters now draw 100 kW or more per rack, and campuses are being proposed at the gigawatt scale. The binding constraints are rarely generation alone. They are transmission capacity at the point of interconnection, long-lead equipment, and how grid operators handle loads that behave very differently from traditional customers.',
        points: [
            'Long-lead equipment: power transformer lead times rose from about 50 weeks in 2021 to about 120 weeks in 2024, and large substation and generator step-up units take 80–210 weeks.',
            'Ride-through: in July 2024, a 230 kV fault in Northern Virginia caused ~1,500 MW of data center load to switch to backup power at once, an event grid operators had not planned for.',
            'Co-location rules: FERC directed PJM in December 2025 to create new firm and non-firm transmission services for load co-located with generation. Its June 2026 show cause orders require all six FERC-jurisdictional RTOs to justify or reform how large loads connect, pay for upgrades, and take transmission service.',
            'Water: direct-to-chip liquid cooling captures heat at the chip, but water use depends on how heat is rejected. Evaporative towers use water; dry coolers use more electricity on hot days.'
        ],
        metrics: [
            '~410 GW: large-load requests ERCOT was tracking in April 2026, about 87% of them data centers.',
            '176 TWh: U.S. data center electricity use in 2023 (4.4% of the national total), projected at 325–580 TWh by 2028. Average PUE fell from 1.6 in 2014 to 1.4 in 2023.'
        ],
        sources: ['niac', 'nercLoadLoss', 'fercColocation', 'fercLargeLoad', 'ercotQueue', 'lbnlDataCenters']
    },
    'grid-queues': {
        title: 'Interconnection Queues & Transmission',
        pill: 'Grid Access',
        summary: 'About 2,000 GW of generation and storage sits in U.S. interconnection queues, and the typical project now waits more than five years to reach operation. Large loads go through a separate process that, until recently, was far less standardized.',
        points: [
            'FERC Order 2023 replaced serial, first-come-first-served generator studies with "first-ready, first-served" cluster studies and stricter readiness requirements.',
            'Large-load interconnection has mostly been a utility and state process. FERC\'s June 2026 show cause orders require all six RTOs to justify or reform how large loads connect, pay for upgrades, and take transmission service, including new services for flexible loads.',
            'Reconductoring with advanced conductors can double a line\'s capacity within existing rights-of-way at less than half the cost per mile of new lines. Lines longer than about 50 miles are often limited by voltage or stability rather than heat, so they gain less.',
            'Ambient-adjusted ratings (FERC Order 881) and dynamic line ratings free up capacity on existing lines at far lower cost than new construction.'
        ],
        metrics: [
            '~2,060 GW: active U.S. queue at end-2025 (1,312 GW generation, ~749 GW storage), down 10% year over year.',
            '5+ years: median time from interconnection request to commercial operation for projects built in 2025.'
        ],
        sources: ['lbnlQueue', 'fercLargeLoad', 'reconductoring']
    },
    'peak-electrification': {
        title: 'Electrification & Winter Peaks',
        pill: 'Load Shape',
        summary: 'Heat pumps and vehicle charging are changing when and where demand peaks. As heating electrifies, summer-peaking systems can become winter-peaking, which moves the most stressed hours into the conditions in which generators are most likely to fail.',
        points: [
            'Heat pump efficiency (COP) falls as temperatures drop and backup resistance heat switches on, so demand rises fastest in the coldest hours.',
            'Winter failures are correlated: freezing equipment and gas supply shortfalls take out many generators at once. N-1 planning criteria, which cover the loss of any single element, do not capture this.',
            'DC fast-charging hubs and electrified truck depots can each add several MW on a single distribution feeder, stressing local substations long before the system peak.'
        ],
        metrics: [
            '90.5 GW: unplanned generator outages during Winter Storm Elliott (Dec 2022), 13% of Eastern Interconnection resources. 5.4 GW of firm load was shed.',
            '55%: share of Elliott generator problems caused by freezing (31%) and fuel supply issues (24%).'
        ],
        sources: ['elliott']
    },
    'nuclear-smr': {
        title: 'Advanced Nuclear & SMRs',
        pill: 'Firm Clean Power',
        summary: 'Hyperscalers\' 24/7 carbon-free energy goals have revived interest in the existing nuclear fleet and in small modular reactors (SMRs). The open questions are licensing speed, fuel supply for non-light-water designs, and how co-located load pays for the grid it still depends on.',
        points: [
            'Co-located load still relies on the grid when the reactor trips or refuels (typically every 18–24 months). FERC rejected the Susquehanna co-location agreement in November 2024 over cost-shift concerns, then ordered PJM to write new rules in December 2025.',
            'Nuclear plants must keep reliable offsite power for their safety systems (NRC General Design Criterion 17), which limits fully islanded "behind-the-meter" designs.',
            'HALEU fuel supply is a bottleneck for several non-light-water designs, such as sodium-cooled and high-temperature gas reactors. Light-water SMRs like the BWRX-300 use conventional low-enriched uranium.',
            'The NRC finalized its technology-inclusive Part 53 licensing framework in spring 2026. Most near-term projects applied under the existing Part 50/52 pathways.'
        ],
        metrics: [
            '>90%: U.S. nuclear capacity factor, versus roughly 25% for utility-scale solar and 35% for wind (EIA).',
            'April 2025: Canada\'s nuclear regulator licensed construction of a BWRX-300 SMR at Darlington, Ontario. The operating-licence application followed in March 2026.'
        ],
        sources: ['susquehanna', 'fercColocation', 'gdc17', 'part53', 'cnscDarlington', 'eiaCapacityFactor']
    },
    'storage-ldes': {
        title: 'Long-Duration Energy Storage',
        pill: 'Multi-Day Firming',
        summary: 'Four-hour lithium-ion batteries dominate new storage and are well suited to shifting solar output into the evening. Covering multi-day wind and solar lulls or week-long cold snaps needs storage measured in tens to hundreds of hours (DOE uses 10+ hours as its threshold), at a much lower cost per kWh of capacity.',
        points: [
            'Technology pathways include iron-air (~100 hours), flow batteries, compressed air in salt caverns, and thermal storage in bricks or carbon blocks for industrial heat.',
            'Capacity accreditation (ELCC) credits storage by its contribution in the riskiest hours. As 4-hour storage saturates, its marginal credit falls and longer durations gain value.',
            'Discharge efficiency matters nearly as much as capital cost: inefficient storage needs far more cheap charging energy to pay off.'
        ],
        metrics: [
            '≤ $20/kWh: energy-capacity capital cost at which LDES cuts total system cost by ≥10% in deeply decarbonized grids (Sepulveda et al., 2021).',
            '≤ $1/kWh: cost at which LDES could fully displace firm low-carbon generation in the same study. At realistic costs, LDES complements firm power rather than replacing it.'
        ],
        sources: ['doeLdes', 'sepulveda'],
        related: { label: 'Related project: Battery State-of-Charge Forecasting →', href: '#projects' }
    },
    'market-design': {
        title: 'Price Volatility & Market Design',
        pill: 'Power Markets',
        summary: 'Growing shares of zero-marginal-cost generation push prices negative in low-demand hours, while scarcity drives spikes when supply is tight. Capacity markets are clearing at administrative caps as load forecasts climb, and those prices fall directly on large new loads.',
        points: [
            'PJM\'s last three capacity auctions cleared at the negotiated price cap, reflecting tight supply against fast-rising data center load forecasts.',
            'ERCOT has no capacity market. Scarcity pricing (offer cap $5,000/MWh) and 4CP transmission charges set the incentives for large loads to curtail.',
            'Real-time co-optimization of energy and ancillary services (ERCOT RTC+B, launched December 2025) changes how batteries and flexible loads are paid.',
            'Congestion creates basis risk between where power is generated and where large loads sit, a central risk when hedging a data center\'s supply.'
        ],
        metrics: [
            '$325/MW-day: PJM 2028/29 capacity price, or about $119,000 per MW-year.',
            '$3.2B: PJM congestion costs in 2025, up 81% from 2024. MISO\'s real-time congestion rose 23% to $2.2B.'
        ],
        sources: ['pjmBra', 'rtcb', 'pjmImm', 'misoImm'],
        related: { label: 'Related project: Battery State-of-Charge Forecasting →', href: '#projects' }
    }
};

function initFrontierExplorer() {
    const tabBtns = Array.from(document.querySelectorAll('.topic-tab-btn'));
    const panel = document.getElementById('deepdive-panel');
    const titleEl = document.getElementById('deepdive-title');
    const pillEl = document.getElementById('deepdive-pill');
    const summaryEl = document.getElementById('deepdive-summary');
    const pointsListEl = document.getElementById('deepdive-points');
    const metricsListEl = document.getElementById('deepdive-metrics');
    const sourcesListEl = document.getElementById('deepdive-sources');
    const relatedEl = document.getElementById('deepdive-related');

    if (!tabBtns.length || !panel) return;

    function render(topicKey) {
        const data = frontierData[topicKey];
        titleEl.textContent = data.title;
        pillEl.textContent = data.pill;
        summaryEl.textContent = data.summary;
        renderList(pointsListEl, data.points);
        renderList(metricsListEl, data.metrics);
        renderSources(sourcesListEl, data.sources.map(key => SOURCES[key]));

        if (relatedEl) {
            relatedEl.hidden = !data.related;
            if (data.related) {
                relatedEl.textContent = data.related.label;
                relatedEl.href = data.related.href;
            }
        }
    }

    function select(btn, { focus = false } = {}) {
        const topicKey = btn.getAttribute('data-topic');
        if (!frontierData[topicKey]) return;

        tabBtns.forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', String(isActive));
            b.tabIndex = isActive ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', btn.id);
        if (focus) btn.focus();

        if (prefersReducedMotion.matches) {
            render(topicKey);
            return;
        }

        panel.style.opacity = '0.4';
        panel.style.transform = 'translateY(6px)';
        setTimeout(() => {
            render(topicKey);
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 150);
    }

    tabBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => select(btn));
        btn.addEventListener('keydown', (e) => {
            const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
            if (e.key in keys) {
                e.preventDefault();
                select(tabBtns[(i + keys[e.key] + tabBtns.length) % tabBtns.length], { focus: true });
            } else if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                select(tabBtns[e.key === 'Home' ? 0 : tabBtns.length - 1], { focus: true });
            }
        });
    });

    // Links elsewhere on the page that open a specific focus area (e.g. from the Projects section)
    document.querySelectorAll('[data-open-topic]').forEach(link => {
        link.addEventListener('click', () => {
            const btn = tabBtns.find(b => b.getAttribute('data-topic') === link.getAttribute('data-open-topic'));
            if (btn) select(btn);
        });
    });

    render(tabBtns[0].getAttribute('data-topic'));
}

/* ==========================================================================
   6. Large-Load Grid & Cost Estimator
   ========================================================================== */
const COOLING_DESIGNS = {
    liquid: { annualPue: 1.15, peakPue: 1.25, note: 'Liquid cooling keeps the design-day peak close to the annual average.' },
    hybrid: { annualPue: 1.30, peakPue: 1.45, note: 'Economizers save energy most of the year, but the grid must still serve the hot-weather peak.' },
    air: { annualPue: 1.50, peakPue: 1.70, note: 'Chiller load climbs on hot afternoons, raising the capacity the grid must serve at the system peak.' }
};

const MARKETS = {
    PJM: {
        name: 'PJM',
        capacityPrice: 325,
        capacityBasis: 'PJM 2028/29 auction',
        sources: ['pjmBra', 'fercColocation'],
        peakTiming: {
            text: 'PJM identifies the five summer system peak hours (5CP), and utilities typically base each customer\'s capacity obligation for the following year on its load in those hours.',
            capacityAvoidable: true,
            sources: ['pjmPlc']
        },
        note: 'PJM\'s last three capacity auctions cleared at the price cap, so capacity is now a major cost line for new load. Northern Virginia, the world\'s largest data center market, faces transmission limits. FERC\'s December 2025 order created non-firm transmission options for load co-located with generation.'
    },
    MISO: {
        name: 'MISO',
        capacityPrice: 126.19,
        capacityBasis: 'MISO 2026/27 annualized, North/Central',
        sources: ['miso'],
        peakTiming: {
            text: 'MISO sets capacity requirements from forecast coincident peak demand. Whether curtailment lowers the campus\'s own bill depends on its utility tariff.',
            sources: ['miso']
        },
        note: 'MISO prices capacity by season. Summer 2026/27 cleared at $424.30/MW-day versus under $40 in the other seasons, so demand during summer peaks drives most of the cost.'
    },
    ERCOT: {
        name: 'ERCOT',
        capacityPrice: null,
        capacityLabel: 'No capacity market',
        capacityBasis: 'Transmission costs are allocated by 4CP instead',
        sources: ['sb6', 'ercotQueue'],
        peakTiming: {
            text: 'ERCOT allocates transmission costs by 4CP: demand in the single 15-minute system peak of each month from June to September. Curtailing in those four intervals cuts the following year\'s transmission charges. SB 6 requires Texas regulators to evaluate 4CP and amend their transmission-cost rules by December 31, 2026.',
            sources: ['ercot4cp', 'sb6']
        },
        note: 'Transmission costs are allocated by 4CP: demand in the four monthly system-peak intervals from June to September. Curtailing in those intervals cuts transmission charges. Texas SB 6 (2025) requires loads of 75 MW or more to disclose on-site backup generation, which ERCOT can direct them to run, or to curtail, during emergencies. ERCOT was tracking about 410 GW of large-load requests in April 2026.'
    },
    CAISO: {
        name: 'CAISO',
        capacityPrice: null,
        capacityLabel: 'Bilateral RA',
        capacityBasis: 'No central capacity auction; load-serving entities contract Resource Adequacy',
        sources: ['sb100'],
        peakTiming: {
            text: 'Savings depend on how the campus\'s supply contract passes through Resource Adequacy costs.',
            sources: []
        },
        note: 'Resource Adequacy is procured bilaterally rather than through an auction. California\'s SB 100 targets 100% clean retail electricity by 2045. Hourly carbon-free matching is a voluntary corporate goal, not a state mandate.'
    },
    SOUTHEAST: {
        name: 'Southeast',
        capacityPrice: null,
        capacityLabel: 'Utility tariff',
        capacityBasis: 'Vertically integrated: capacity costs are embedded in retail rates',
        sources: ['georgiaPsc'],
        peakTiming: {
            text: 'Savings depend on the utility\'s demand charges and whether it offers an interruptible-service tariff.',
            sources: []
        },
        note: 'There is no organized wholesale market here. Vertically integrated utilities serve large loads under state-approved tariffs and plan for them in integrated resource plans. Some commissions (e.g., Georgia) now allow longer contracts and minimum bills for loads above 100 MW.'
    }
};

const POWER_FACTOR = 0.95;
const HOUSEHOLD_MWH_PER_YEAR = 10.38; // EIA 2024: 865 kWh/month per residential customer
const HOURS_PER_YEAR = 8760;
// Duke Nicholas Institute (2025): new load integrable at each curtailment rate
const DUKE_HEADROOM_GW = { 0.0025: 76, 0.005: 98, 0.01: 126 };

function formatNumber(value, digits = 0) {
    return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatHomes(homes) {
    return homes >= 1e6 ? `${formatNumber(homes / 1e6, 2)} million` : `${formatNumber(homes / 1000)}k`;
}

function formatPrice(price) {
    return formatNumber(price, Number.isInteger(price) ? 0 : 2);
}

function typicalVoltage(peakMw) {
    if (peakMw < 100) return { level: '69–138 kV', detail: 'Sub-transmission or 138 kV service' };
    if (peakMw < 300) return { level: '138–230 kV', detail: 'Dedicated transmission substation' };
    if (peakMw < 1000) return { level: '230–500 kV', detail: 'Often a loop-in to two or more lines' };
    return { level: '345–500 kV', detail: 'Usually multiple substations and new lines' };
}

function initGridSimulator() {
    const itLoadSlider = document.getElementById('sim-it-load');
    const itLoadValLabel = document.getElementById('sim-it-load-val');
    const utilSlider = document.getElementById('sim-util');
    const utilValLabel = document.getElementById('sim-util-val');
    const pueSelect = document.getElementById('sim-pue');
    const isoSelect = document.getElementById('sim-iso');
    const flexSelect = document.getElementById('sim-flex');
    const pueValuesEl = document.getElementById('sim-pue-values');

    const peakMwEl = document.getElementById('res-peak-mw');
    const peakUnitEl = document.getElementById('res-peak-unit');
    const annualTwhEl = document.getElementById('res-annual-twh');
    const annualUnitEl = document.getElementById('res-annual-unit');
    const capacityEl = document.getElementById('res-capacity');
    const capacityUnitEl = document.getElementById('res-capacity-unit');
    const voltageEl = document.getElementById('res-voltage');
    const voltageUnitEl = document.getElementById('res-voltage-unit');
    const flexEl = document.getElementById('res-flex');
    const insightEl = document.getElementById('res-insight');

    if (!itLoadSlider || !utilSlider || !pueSelect || !isoSelect || !flexSelect) return;

    function recalculate() {
        const itMw = parseFloat(itLoadSlider.value);
        const utilization = parseFloat(utilSlider.value) / 100;
        const cooling = COOLING_DESIGNS[pueSelect.value] || COOLING_DESIGNS.liquid;
        const market = MARKETS[isoSelect.value] || MARKETS.PJM;
        const curtailRate = parseFloat(flexSelect.value);

        itLoadValLabel.textContent = `${formatNumber(itMw)} MW`;
        utilValLabel.textContent = `${Math.round(utilization * 100)}%`;
        pueValuesEl.textContent = `PUE ${cooling.annualPue.toFixed(2)} annual avg / ${cooling.peakPue.toFixed(2)} design-day peak.`;

        // Grid capacity request: nameplate IT at design-day (hot weather) PUE
        const peakMw = itMw * cooling.peakPue;
        const peakMva = peakMw / POWER_FACTOR;
        peakMwEl.textContent = formatNumber(peakMw);
        peakUnitEl.textContent = `MW at design-day peak (≈ ${formatNumber(peakMva)} MVA)`;

        // Annual energy: average IT draw at annual-average PUE
        const annualMwh = itMw * utilization * cooling.annualPue * HOURS_PER_YEAR;
        const loadFactor = annualMwh / (peakMw * HOURS_PER_YEAR);
        const homes = annualMwh / HOUSEHOLD_MWH_PER_YEAR;
        annualTwhEl.textContent = formatNumber(annualMwh / 1e6, 2);
        annualUnitEl.textContent = `TWh/yr · ${Math.round(loadFactor * 100)}% load factor · energy use of ~${formatHomes(homes)} U.S. homes`;

        // Capacity exposure: demand coincident with the system peak
        const coincidentMw = itMw * utilization * cooling.peakPue;
        const annualCost = market.capacityPrice ? coincidentMw * market.capacityPrice * 365 : 0;
        if (market.capacityPrice) {
            capacityEl.textContent = `$${formatNumber(annualCost / 1e6)}M / yr`;
            capacityUnitEl.textContent = `${formatNumber(coincidentMw)} MW at system peak × $${formatPrice(market.capacityPrice)}/MW-day (${market.capacityBasis})`;
        } else {
            capacityEl.textContent = market.capacityLabel;
            capacityUnitEl.textContent = market.capacityBasis;
        }

        const voltage = typicalVoltage(peakMw);
        voltageEl.textContent = voltage.level;
        voltageUnitEl.textContent = `${voltage.detail}. Indicative only.`;

        // Flexibility: how much is curtailed, and what timing it to the peak hours could save
        flexEl.replaceChildren();
        if (curtailRate > 0) {
            const curtailedMwh = curtailRate * peakMw * HOURS_PER_YEAR;
            const fullLoadHours = curtailRate * HOURS_PER_YEAR;

            const volume = el('p');
            volume.append(
                el('strong', null, `Curtailing ${curtailRate * 100}% of the year: `),
                document.createTextNode(
                    `~${formatNumber(curtailedMwh)} MWh/yr, equal to ~${formatNumber(fullLoadHours)} hours at full load (in practice, spread across more hours as partial reductions). ` +
                    `Duke's 2025 study found U.S. grids could absorb ~${DUKE_HEADROOM_GW[curtailRate]} GW of new load at this curtailment rate without new capacity, which is why flexible loads may connect sooner.`
                )
            );

            const timing = el('p');
            timing.append(el('strong', null, 'Timing matters: '), document.createTextNode(`${market.peakTiming.text} `));
            if (market.peakTiming.capacityAvoidable) {
                timing.append(document.createTextNode('If curtailment covers those hours, up to '));
                timing.append(el('strong', 'flex-highlight', `~$${formatNumber(annualCost / 1e6)}M/yr`));
                timing.append(document.createTextNode(' of the capacity exposure above is avoidable. Only 5 of 8,760 hours set it, but they must be forecast in advance, and the utility\'s tariff determines how savings pass through.'));
            }
            if (market.peakTiming.sources.length) {
                const sourceList = el('ul', 'inline-sources');
                renderSources(sourceList, market.peakTiming.sources.map(key => SOURCES[key]));
                timing.appendChild(sourceList);
            }

            flexEl.append(volume, timing);
        } else {
            const firm = el('p');
            firm.append(
                el('strong', null, 'Firm service: '),
                document.createTextNode('the grid must serve the full request in every hour, including system emergencies. Select a flexibility level to see what limited curtailment involves and what it could save.')
            );
            flexEl.append(firm);
        }

        const marketSources = el('ul', 'inline-sources');
        renderSources(marketSources, market.sources.map(key => SOURCES[key]));
        insightEl.replaceChildren(
            el('strong', null, `${market.name}: `),
            document.createTextNode(`${market.note} ${cooling.note}`),
            marketSources
        );
    }

    itLoadSlider.addEventListener('input', recalculate);
    utilSlider.addEventListener('input', recalculate);
    pueSelect.addEventListener('change', recalculate);
    isoSelect.addEventListener('change', recalculate);
    flexSelect.addEventListener('change', recalculate);

    recalculate();
}

/* ==========================================================================
   7. Modal Manager (focus trap, Escape, restore focus)
   ========================================================================== */
const modalState = { open: null, returnFocus: null };
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openModal(modal, opener) {
    if (modalState.open && modalState.open !== modal) {
        closeModal({ restoreFocus: false });
    } else if (!modalState.returnFocus) {
        modalState.returnFocus = opener || document.activeElement;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalState.open = modal;

    const first = modal.querySelector('.modal-card').querySelector(FOCUSABLE);
    if (first) first.focus();
}

function closeModal({ restoreFocus = true } = {}) {
    const modal = modalState.open;
    if (!modal) return;

    modal.classList.remove('active');
    modalState.open = null;

    if (restoreFocus) {
        document.body.style.overflow = '';
        const target = modalState.returnFocus;
        if (target && target.offsetParent !== null) {
            target.focus();
        } else {
            const menuBtn = document.getElementById('nav-menu-btn');
            if (menuBtn && menuBtn.offsetParent !== null) menuBtn.focus();
        }
        modalState.returnFocus = null;
    }
}

function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', () => closeModal()));
    });

    document.addEventListener('keydown', (e) => {
        const modal = modalState.open;
        if (!modal) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = Array.from(modal.querySelectorAll(FOCUSABLE)).filter(node => node.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

/* ==========================================================================
   8. Advisory Inquiry Modal (opens a pre-filled email; there is no backend)
   ========================================================================== */
const CONTACT_EMAIL = 'contact@manassasenergy.com';

function initAdvisoryModal() {
    const modal = document.getElementById('advisory-modal');
    const form = document.getElementById('advisory-form');
    const success = document.getElementById('advisory-success');
    const successClose = document.getElementById('advisory-success-close');
    const sectorChips = document.querySelectorAll('.sector-chip');

    if (!modal || !form) return;

    document.querySelectorAll('.btn-open-advisory').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            form.hidden = false;
            success.hidden = true;
            openModal(modal, btn);
        });
    });

    sectorChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sectorChips.forEach(c => {
                c.classList.toggle('selected', c === chip);
                c.setAttribute('aria-pressed', String(c === chip));
            });
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('adv-name').value.trim();
        const org = document.getElementById('adv-org').value.trim();
        const scope = document.getElementById('adv-scope').value.trim();
        const selectedChip = document.querySelector('.sector-chip.selected');
        const sector = selectedChip ? selectedChip.getAttribute('data-sector') : 'Not specified';

        const subject = `Advisory inquiry: ${sector}${org ? ` (${org})` : ''}`;
        const body = [
            `Name: ${name}`,
            org ? `Organization: ${org}` : null,
            `Sector: ${sector}`,
            '',
            'Research scope & questions:',
            scope
        ].filter(line => line !== null).join('\n');

        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        form.hidden = true;
        success.hidden = false;
        successClose.focus();
    });

    successClose.addEventListener('click', () => {
        form.reset();
        closeModal();
    });
}

/* ==========================================================================
   9. Scroll Fade-In Observer & Back-To-Top Button
   ========================================================================== */
function initScrollAnimations() {
    const targets = document.querySelectorAll('.fade-in');

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
        targets.forEach(node => node.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

    targets.forEach(node => observer.observe(node));
}

function initBackToTop() {
    const backBtn = document.getElementById('back-to-top');
    if (!backBtn) return;

    window.addEventListener('scroll', () => {
        backBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
}
