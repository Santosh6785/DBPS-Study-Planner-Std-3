// ═══════════════════════════════════════════════════════
// app.js  –  Rendering logic only (data is in data.js)
// ═══════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────
let activeTab    = "schedule";
let activeDay    = todayIndex();
let openInsight  = -1;
let activePhase  = 0;
let showSummer   = false;
let darkMode     = loadTheme();   // "dark" | "light" | "auto"

// ── Utilities ─────────────────────────────────────────────
function todayIndex() {
  const map = [6, 0, 1, 2, 3, 4, 5]; // JS Sun=0 → our Sun=6
  return map[new Date().getDay()] ?? 0;
}

function loadTheme() {
  return localStorage.getItem("theme") || "auto";
}

function applyTheme() {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-light");
  if (darkMode === "dark")  body.classList.add("theme-dark");
  if (darkMode === "light") body.classList.add("theme-light");
  const icon = darkMode === "dark" ? "☀️" : darkMode === "light" ? "🌙" : "🌗";
  const btn = document.getElementById("theme-btn");
  if (btn) btn.textContent = icon;
}

function toggleTheme() {
  const cycle = { auto: "dark", dark: "light", light: "auto" };
  darkMode = cycle[darkMode] || "auto";
  localStorage.setItem("theme", darkMode);
  applyTheme();
}

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k === "onclick") e.addEventListener("click", v);
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return e;
}
const div  = (a, ...c) => el("div",    a, ...c);
const span = (a, ...c) => el("span",   a, ...c);
const btn  = (a, ...c) => el("button", a, ...c);

// ── Schedule Tab ──────────────────────────────────────────
function renderSchedule() {
  const day = DAYS[activeDay];
  const dc  = DAY_COLOR[day.day];
  const studyMin = day.slots.filter(s => !s.brk).reduce((a, s) => a + s.dur, 0);
  const todayIdx = todayIndex();

  // Day selector
  const dayScroll = div({ class: "day-scroll", role: "tablist", "aria-label": "Select day" },
    ...DAYS.map((d, i) => {
      const isToday = i === todayIdx;
      return div({
        class: "day-btn" + (i === activeDay ? " active" : "") + (isToday ? " is-today" : ""),
        style: i === activeDay ? { background: DAY_COLOR[d.day], color: "#fff" } : {},
        onclick: () => { activeDay = i; render(); },
        role: "tab",
        "aria-selected": i === activeDay ? "true" : "false",
        "aria-label": d.day + (isToday ? " (today)" : ""),
      },
        span({ style: { fontSize: "16px" } }, d.emoji),
        span({}, d.short),
        isToday ? span({ class: "today-dot", "aria-hidden": "true" }) : null
      );
    }),
    // Today button
    div({
      class: "today-btn",
      onclick: () => { activeDay = todayIdx; render(); },
      role: "button",
      "aria-label": "Jump to today",
      title: "Jump to today",
    }, "Today")
  );

  // Day header
  const header = div({ class: "day-header", style: { background: dc } },
    div({ class: "day-header-top" },
      div({ style: { fontSize: "24px" }, "aria-hidden": "true" }, day.emoji),
      div({ class: "day-header-info" },
        div({ class: "day-name" }, day.day),
        div({ class: "day-note-text" }, "📌 " + day.note)
      )
    ),
    div({ class: "day-badges" },
      studyMin > 0 ? div({ class: "day-badge" }, `📚 ${studyMin} min study`) : null,
      activeDay < 5 ? div({ class: "day-badge" }, "⚽ Free till 6:30 PM") : null,
    )
  );

  // Slot cards
  const slots = div({ class: "slots-list" },
    ...day.slots.map(slot => {
      if (slot.brk) {
        return div({ class: "slot-break", role: "presentation" },
          span({ "aria-hidden": "true" }, "☕"),
          span({ style: { fontSize: "12px", color: "#9CA3AF" } },
            `${slot.time} – ${slot.end}  ·  Break / Water`)
        );
      }
      const c   = COLORS[slot.subj];
      const isKey = slot.key;
      return div({
        class: "slot-card" + (isKey ? " slot-key" : ""),
        role: "article",
        "aria-label": LABELS[slot.subj] + ", " + slot.time + " to " + slot.end
      },
        div({ class: "slot-card-head", style: { background: c } },
          div({ class: "slot-head-left" },
            span({ class: "slot-emoji", "aria-hidden": "true" }, EMOJI[slot.subj]),
            span({ class: "slot-time-label" }, `${slot.time} – ${slot.end}`)
          ),
          div({ class: "slot-head-right" },
            isKey ? span({ class: "slot-pill key-pill", "aria-label": "Key session" }, "★ Key") : null,
            span({ class: "slot-pill dur-pill" }, `⏱ ${slot.dur}m`),
          )
        ),
        div({ class: "slot-card-body" },
          div({ class: "slot-subject-name" }, LABELS[slot.subj]),
          div({ class: "slot-topic" }, slot.topic),
          div({ class: "slot-sess-badge", style: { color: c } }, SESS[slot.sess] || slot.sess)
        )
      );
    })
  );

  // Flow reference card
  const flowRows = activeDay === 5 ? [
    { t: "9:00 – 11:00 AM",   l: "📚 Morning: revision + Shrutilekh + Grammar + Spelling", bold: true },
    { t: "11 AM – 3:30 PM",   l: "⚽ Free time — family, outdoor, rest" },
    { t: "3:30 – 5:00 PM",    l: "📚 Afternoon: Maths + Mental Maths + GK + All 5 Poems", bold: true },
    { t: "5:00 PM+",          l: "⚽ Fully free — evening rest" },
  ] : activeDay === 6 ? [
    { t: "9:00 – 10:45 AM",   l: "📚 Light revision: EVS + Hindi + Grammar + Poem", bold: true },
    { t: "10:45 AM+",         l: "⚽ FULLY FREE — no study all afternoon", bold: true },
  ] : [
    { t: "2:30 PM",           l: "🏠 Home from school" },
    { t: "2:30 – 6:30 PM",   l: "⚽ FREE TIME — play, rest, outdoor", bold: true },
    { t: "6:30 – 7:10 PM",   l: "📚 Study Slot 1 — 40 min heavy subject", bold: true },
    { t: "7:10 – 7:15 PM",   l: "☕ Break" },
    { t: "7:15 – 7:55 PM",   l: "📚 Study Slot 2 — 40 min second subject", bold: true },
    { t: "7:55 – 8:00 PM",   l: "☕ Break" },
    { t: "8:00 – 8:30 PM",   l: "📚 Study Slot 3 — 30 min light subject", bold: true },
    { t: "8:30 PM",           l: "🍽️ Dinner" },
    { t: "9:30 PM",           l: "😴 Sleep — 8–9 hrs essential", bold: true },
  ];

  const flowCard = div({ class: "flow-card" },
    div({ class: "flow-card-title" },
      "🕐 " + (activeDay < 5 ? "Weekday Flow" : activeDay === 5 ? "Saturday Flow" : "Sunday Flow")),
    ...flowRows.map(r =>
      div({ class: "flow-row" },
        div({ class: "flow-dot", style: { background: r.bold ? dc : "#9CA3AF" }, "aria-hidden": "true" }),
        div({ class: "flow-info" },
          div({ class: "flow-time", style: { color: r.bold ? dc : "#9CA3AF" } }, r.t),
          div({ class: "flow-label" + (r.bold ? " bold" : "") }, r.l)
        )
      )
    )
  );

  // Summer schedule expandable
  const summerCard = div({ class: "summer-preview-card" },
    div({
      class: "summer-preview-head",
      onclick: () => { showSummer = !showSummer; render(); },
      role: "button",
      "aria-expanded": showSummer ? "true" : "false",
      "aria-controls": "summer-slots",
      "aria-label": "Summer vacation schedule " + (showSummer ? "collapse" : "expand"),
    },
      span({ style: { fontSize: "18px" }, "aria-hidden": "true" }, "☀️"),
      div({ style: { flex: 1 } },
        div({ style: { fontWeight: 900, fontSize: "13px", color: "#EA580C" } },
          "Summer Vacation Schedule  (May 17 – Jun 21)"),
        div({ style: { fontSize: "11px", color: "#9CA3AF", marginTop: "2px" } },
          "Full-day study plan · tap to " + (showSummer ? "hide" : "view"))
      ),
      span({ class: "insight-arrow", "aria-hidden": "true" }, showSummer ? "▲" : "▼")
    ),
    showSummer ? div({ class: "summer-slots", id: "summer-slots" },
      ...SUMMER_SLOTS.map(s => {
        if (s.type === "break") return div({ class: "slot-break", style: { margin: "3px 0" } },
          span({ "aria-hidden": "true" }, "☕"),
          span({ style: { fontSize: "11px", color: "#9CA3AF" } }, s.time + " · Break / Water")
        );
        const typeColors = {
          study:"#EFF6FF", play:"#E0F2FE", rest:"#FEFCE8", routine:"#F8FAFC"
        };
        return div({
          class: "summer-slot",
          style: { background: typeColors[s.type] || "#F8FAFC" },
          role: "article",
          "aria-label": s.label + ", " + s.time + " to " + s.end
        },
          div({ class: "summer-slot-icon", style: { background: s.color } }, s.icon),
          div({ class: "summer-slot-info" },
            div({ class: "summer-slot-header" },
              span({ class: "summer-slot-label" }, s.label),
              span({ class: "summer-slot-time", style: { color: s.color } },
                s.time + (s.end && s.end !== "Bedtime" ? "" : ""))
            ),
            s.note ? div({ class: "summer-slot-note" }, s.note) : null
          )
        );
      })
    ) : null
  );

  return div({ class: "tab-content" }, dayScroll, header, slots, flowCard, summerCard);
}

// ── Roadmap Tab ───────────────────────────────────────────
function renderRoadmap() {
  const ph = PHASES[activePhase];

  const phaseToggle = div({
    class: "phase-toggle",
    role: "tablist",
    "aria-label": "Select phase"
  },
    ...PHASES.map((p, i) =>
      btn({
        class: "phase-btn" + (i === activePhase ? " active" : ""),
        style: i === activePhase ? { background: p.color, color: "#fff", borderColor: p.color } : {},
        onclick: () => { activePhase = i; render(); },
        role: "tab",
        "aria-selected": i === activePhase ? "true" : "false",
        "aria-label": p.phase + ": " + p.label,
      }, p.icon + "  " + p.label)
    )
  );

  const phaseHeader = div({ class: "phase-header", style: { background: ph.color } },
    div({ class: "phase-header-top" },
      span({ style: { fontSize: "28px" }, "aria-hidden": "true" }, ph.icon),
      div({},
        div({ class: "phase-title" }, ph.phase + ": " + ph.label),
        div({ class: "phase-dates" }, ph.dates)
      )
    ),
    div({ class: "phase-note" }, "📌 " + ph.note)
  );

  const weekCards = ph.weeks.map(wk =>
    div({ class: "week-card" },
      div({ class: "week-head", style: { background: wk.color } },
        span({ class: "week-title" }, wk.week),
        span({ class: "week-tag" }, wk.tag)
      ),
      div({ class: "week-focus", style: { borderColor: wk.color, color: wk.color } },
        "★  " + wk.focus),
      div({ class: "week-rows" },
        ...wk.rows.map(([lbl, val]) =>
          div({ class: "week-row" },
            span({ class: "week-row-lbl" }, lbl),
            span({ class: "week-row-val" }, val)
          )
        )
      )
    )
  );

  const summaryCard = div({ class: "summary-card" },
    div({ class: "summary-title" }, "📊 Full Timeline at a Glance"),
    ...PHASES.map(p =>
      div({ class: "sum-row" },
        div({ class: "sum-dot", style: { background: p.color }, "aria-hidden": "true" }),
        span({ class: "sum-label" }, p.icon + " " + p.phase + ": " + p.label + " — " + p.dates),
        span({ class: "sum-time", style: { color: p.color } },
          p.weeks.length + " wk" + (p.weeks.length > 1 ? "s" : ""))
      )
    ),
    div({ class: "sum-total" },
      span({}, "Total weeks until assessment"),
      span({ style: { color: "#DC2626", fontWeight: "900" } }, "11 weeks")
    ),
    div({ class: "sum-note" }, "Assessment: July 1, 2026 · Plenty of time if plan is followed!")
  );

  // Scroll hint gradient
  const scrollHint = div({ class: "scroll-hint", "aria-hidden": "true" });

  return div({ class: "tab-content" },
    div({ class: "roadmap-intro" },
      div({ class: "roadmap-intro-title" }, "🗺️ 3-Phase · 11-Week Roadmap"),
      div({ class: "roadmap-intro-sub" },
        "Phase 1: School term  ·  Phase 2: Summer vacation  ·  Phase 3: Pre-assessment")
    ),
    phaseToggle,
    phaseHeader,
    ...weekCards,
    summaryCard,
    scrollHint
  );
}

// ── Insights Tab ──────────────────────────────────────────
function renderInsights() {
  const cards = INSIGHTS.map((ins, i) =>
    div({ class: "insight-card" },
      div({
        class: "insight-head",
        style: { background: ins.color },
        onclick: () => { openInsight = openInsight === i ? -1 : i; render(); },
        role: "button",
        "aria-expanded": openInsight === i ? "true" : "false",
        "aria-controls": "insight-body-" + i,
        "aria-label": ins.title,
      },
        div({ class: "insight-head-left" },
          span({ style: { fontSize: "20px" }, "aria-hidden": "true" }, ins.emoji),
          span({ class: "insight-title" }, ins.title)
        ),
        span({ class: "insight-arrow", "aria-hidden": "true" }, openInsight === i ? "▲" : "▼")
      ),
      openInsight === i
        ? div({ class: "insight-body", id: "insight-body-" + i }, ins.body)
        : null
    )
  );

  const tipsCard = div({ class: "tips-card" },
    div({ class: "tips-title" }, "👨‍👩‍👧 Parent Action Points"),
    ...TIPS.map(([heading, detail], i) =>
      div({ class: "tip-row" },
        span({ class: "tip-num", "aria-hidden": "true" }, `${i + 1}.`),
        div({ class: "tip-text" },
          el("strong", {}, heading + " — "),
          detail
        )
      )
    )
  );

  return div({ class: "tab-content" },
    div({ class: "insights-intro" },
      div({ class: "insights-intro-title" }, "💡 Insights & Guidance"),
      div({ class: "insights-intro-sub" },
        "Updated for July 1 assessment · Includes summer vacation plan")
    ),
    ...cards,
    tipsCard
  );
}

// ── Main render ───────────────────────────────────────────
function render() {
  const main = document.getElementById("main");
  main.innerHTML = "";
  let content;
  if (activeTab === "schedule") content = renderSchedule();
  else if (activeTab === "roadmap") content = renderRoadmap();
  else content = renderInsights();
  main.appendChild(content);

  // Sync nav buttons
  document.querySelectorAll(".nav-btn").forEach(b => {
    const isActive = b.dataset.tab === activeTab;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  // Sync tab bar buttons
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === activeTab);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  // Theme toggle button
  document.getElementById("theme-btn")?.addEventListener("click", toggleTheme);

  // Tab bar
  document.querySelectorAll(".tab-btn, .nav-btn").forEach(b => {
    b.addEventListener("click", () => { activeTab = b.dataset.tab; render(); });
  });

  // Install banner — remember dismissal for 7 days
  let deferredPrompt;
  const banner = document.getElementById("install-banner");
  const dismissed = localStorage.getItem("installDismissed");
  const dismissedAt = parseInt(dismissed || "0", 10);
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    if (Date.now() - dismissedAt > weekMs && banner) {
      banner.style.display = "flex";
    }
  });

  document.getElementById("install-btn")?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (banner) banner.style.display = "none";
  });

  document.getElementById("dismiss-install")?.addEventListener("click", () => {
    if (banner) banner.style.display = "none";
    localStorage.setItem("installDismissed", Date.now().toString());
  });

  render();
});
