// ═══════════════════════════════════════════════════════
// app.js  –  Rendering logic  (data lives in data.js)
// ═══════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────
let activeTab   = "schedule";
let activeDay   = todayIndex();
let openInsight = -1;
let activePhase = 0;
let showSummer  = false;
let darkMode    = localStorage.getItem("theme") || "auto";

// ── Helpers ──────────────────────────────────────────────
function todayIndex() {
  return [6,0,1,2,3,4,5][new Date().getDay()] ?? 0;
}

// Returns YYYY-MM-DD for the date `daysOffset` from today
function dateKey(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

// Which week number (1-11) are we in?  Phase 1 starts Apr 13 2026.
function currentWeekNumber() {
  const start = new Date("2026-04-13");
  const now   = new Date();
  const diff  = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return Math.min(Math.max(diff + 1, 1), 11); // clamp 1-11
}

// Which phase index (0/1/2) contains the current week?
function currentPhaseIndex() {
  const wk = currentWeekNumber();
  if (wk <= 5)  return 0;
  if (wk <= 10) return 1;
  return 2;
}

// ── Progress (localStorage) ──────────────────────────────
// Key pattern:  progress_<YYYY-MM-DD>_<dayIndex>_<slotIndex>
// Value: "1" = done

function progressKey(dayIdx, slotIdx) {
  // Compute actual date for dayIdx relative to this week's Monday
  const today  = new Date();
  const jsDow  = today.getDay();          // 0=Sun
  const ourIdx = todayIndex();            // 0=Mon…6=Sun
  const offset = dayIdx - ourIdx;
  return `progress_${dateKey(offset)}_${dayIdx}_${slotIdx}`;
}

function isSlotDone(dayIdx, slotIdx) {
  return localStorage.getItem(progressKey(dayIdx, slotIdx)) === "1";
}

function toggleSlot(dayIdx, slotIdx) {
  const k   = progressKey(dayIdx, slotIdx);
  const was = localStorage.getItem(k) === "1";
  was ? localStorage.removeItem(k) : localStorage.setItem(k, "1");
}

function dayProgress(dayIdx) {
  const slots = DAYS[dayIdx].slots.filter(s => !s.brk);
  const done  = slots.filter((_, si) => isSlotDone(dayIdx, si)).length;
  return { done, total: slots.length };
}

// ── Theme ─────────────────────────────────────────────────
function applyTheme() {
  document.body.classList.remove("theme-dark", "theme-light");
  if (darkMode === "dark")  document.body.classList.add("theme-dark");
  if (darkMode === "light") document.body.classList.add("theme-light");
  const icons = { dark:"☀️", light:"🌙", auto:"🌗" };
  const btn = document.getElementById("theme-btn");
  if (btn) btn.textContent = icons[darkMode] || "🌗";
}

function toggleTheme() {
  darkMode = { auto:"dark", dark:"light", light:"auto" }[darkMode] || "auto";
  localStorage.setItem("theme", darkMode);
  applyTheme();
}

// ── DOM helpers ───────────────────────────────────────────
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k === "onclick") e.addEventListener("click", v);
    else if (k === "onchange") e.addEventListener("change", v);
    else if (k === "html")  e.innerHTML = v;
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

// ── Schedule Tab ─────────────────────────────────────────
function renderSchedule() {
  const day      = DAYS[activeDay];
  const dc       = DAY_COLOR[day.day];
  const todayIdx = todayIndex();
  const prog     = dayProgress(activeDay);
  let   studySlotIdx = 0; // tracks real slot index (skipping breaks)

  // Day scroll
  const dayScroll = div({ class:"day-scroll", role:"tablist", "aria-label":"Select day" },
    ...DAYS.map((d, i) => {
      const p = dayProgress(i);
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return div({
        class: "day-btn" + (i === activeDay ? " active" : "") + (i === todayIdx ? " is-today" : ""),
        style: i === activeDay ? { background: DAY_COLOR[d.day], color:"#fff" } : {},
        onclick: () => { activeDay = i; render(); },
        role: "tab",
        "aria-selected": i === activeDay ? "true" : "false",
        "aria-label": d.day + (i === todayIdx ? " (today)" : ""),
      },
        span({ style:{ fontSize:"15px" } }, d.emoji),
        span({}, d.short),
        // mini progress ring
        p.total > 0 ? div({
          class: "day-prog",
          title: `${p.done}/${p.total} done`,
          style: { background: pct === 100 ? "#22C55E" : (i===activeDay?"rgba(255,255,255,.25)":"#e5e7eb") }
        }, pct === 100 ? "✓" : `${p.done}/${p.total}`) : null,
        i === todayIdx ? span({ class:"today-dot", "aria-hidden":"true" }) : null
      );
    }),
    div({
      class:"today-btn", role:"button",
      onclick: () => { activeDay = todayIdx; render(); },
      "aria-label":"Jump to today", title:"Jump to today",
    }, "Today")
  );

  // Day header with progress bar
  const header = div({ class:"day-header", style:{ background:dc } },
    div({ class:"day-header-top" },
      div({ style:{ fontSize:"24px" }, "aria-hidden":"true" }, day.emoji),
      div({ class:"day-header-info" },
        div({ class:"day-name" }, day.day),
        div({ class:"day-note-text" }, "📌 " + day.note)
      )
    ),
    div({ class:"day-badges" },
      prog.total > 0 ? div({ class:"day-badge" },
        prog.done === prog.total
          ? "✅ All done!"
          : `📋 ${prog.done}/${prog.total} completed`
      ) : null,
      activeDay < 5 ? div({ class:"day-badge" }, "⚽ Free till 6:30 PM") : null,
    ),
    // Progress bar
    prog.total > 0 ? div({ class:"day-progress-bar-wrap", "aria-hidden":"true" },
      div({ class:"day-progress-bar",
        style:{ width: Math.round((prog.done/prog.total)*100) + "%",
                background: prog.done === prog.total ? "#22C55E" : "rgba(255,255,255,.7)" }
      })
    ) : null
  );

  // Slot cards with checkboxes
  const slots = div({ class:"slots-list" }, ...day.slots.map(slot => {
    if (slot.brk) return div({ class:"slot-break", role:"presentation" },
      span({ "aria-hidden":"true" }, "☕"),
      span({ style:{ fontSize:"12px", color:"#9CA3AF" } },
        `${slot.time} – ${slot.end}  ·  Break / Water`)
    );

    const si    = studySlotIdx++;
    const done  = isSlotDone(activeDay, si);
    const c     = COLORS[slot.subj];
    const isKey = slot.key;

    return div({
      class: "slot-card" + (isKey ? " slot-key" : "") + (done ? " slot-done" : ""),
      role:"article",
      "aria-label": LABELS[slot.subj] + ", " + slot.time,
    },
      div({ class:"slot-card-head", style:{ background: done ? "#6b7280" : c } },
        div({ class:"slot-head-left" },
          span({ class:"slot-emoji", "aria-hidden":"true" }, EMOJI[slot.subj]),
          span({ class:"slot-time-label" }, `${slot.time} – ${slot.end}`)
        ),
        div({ class:"slot-head-right" },
          isKey && !done ? span({ class:"slot-pill key-pill", "aria-label":"Key session" }, "★ Key") : null,
          done ? span({ class:"slot-pill done-pill" }, "✓ Done") : null,
          span({ class:"slot-pill dur-pill" }, `⏱ ${slot.dur}m`),
        )
      ),
      div({ class:"slot-card-body" },
        div({ class:"slot-subject-name", style:{ color: done ? "#9CA3AF" : "var(--text)" } },
          LABELS[slot.subj]),
        div({ class:"slot-topic", style:{ textDecoration: done ? "line-through" : "none", color: done ? "#9CA3AF" : "var(--text2)" } },
          slot.topic),
        div({ class:"slot-footer" },
          div({ class:"slot-sess-badge", style:{ color: done ? "#9CA3AF" : c } },
            SESS[slot.sess] || slot.sess),
          el("label", {
            class:"done-label",
            title: done ? "Mark as not done" : "Mark as done",
            "aria-label": (done ? "Unmark" : "Mark") + " " + LABELS[slot.subj] + " as done",
          },
            el("input", {
              type:"checkbox",
              class:"done-check",
              ...(done ? { checked:"" } : {}),
              onchange: (e) => {
                e.stopPropagation();
                toggleSlot(activeDay, si);
                render();
              },
            }),
            span({ class:"done-check-label" }, done ? "✓ Done" : "Mark done")
          )
        )
      )
    );
  }));

  // Flow reference card
  const flowRows = activeDay === 5 ? [
    { t:"9:00 – 11:00 AM",  l:"📚 Morning: revision + Shrutilekh + Grammar + Spelling", bold:true },
    { t:"11 AM – 3:30 PM",  l:"⚽ Free time — family, outdoor, rest" },
    { t:"3:30 – 5:00 PM",   l:"📚 Afternoon: Maths + Mental Maths + GK + All 5 Poems", bold:true },
    { t:"5:00 PM+",         l:"⚽ Fully free — evening rest" },
  ] : activeDay === 6 ? [
    { t:"9:00 – 10:45 AM",  l:"📚 Light revision: EVS + Hindi + Grammar + Poem", bold:true },
    { t:"10:45 AM+",        l:"⚽ FULLY FREE — no study all afternoon", bold:true },
  ] : [
    { t:"2:30 PM",          l:"🏠 Home from school" },
    { t:"2:30 – 6:30 PM",   l:"⚽ FREE TIME — play, rest, outdoor", bold:true },
    { t:"6:30 – 7:10 PM",   l:"📚 Study Slot 1 — 40 min heavy subject", bold:true },
    { t:"7:10 – 7:15 PM",   l:"☕ Break" },
    { t:"7:15 – 7:55 PM",   l:"📚 Study Slot 2 — 40 min second subject", bold:true },
    { t:"7:55 – 8:00 PM",   l:"☕ Break" },
    { t:"8:00 – 8:30 PM",   l:"📚 Study Slot 3 — 30 min light subject", bold:true },
    { t:"8:30 PM",          l:"🍽️ Dinner" },
    { t:"9:30 PM",          l:"😴 Sleep — 8–9 hrs essential", bold:true },
  ];

  const flowCard = div({ class:"flow-card" },
    div({ class:"flow-card-title" },
      "🕐 " + (activeDay<5 ? "Weekday Flow" : activeDay===5 ? "Saturday Flow" : "Sunday Flow")),
    ...flowRows.map(r =>
      div({ class:"flow-row" },
        div({ class:"flow-dot", style:{ background:r.bold?dc:"#9CA3AF" }, "aria-hidden":"true" }),
        div({ class:"flow-info" },
          div({ class:"flow-time", style:{ color:r.bold?dc:"#9CA3AF" } }, r.t),
          div({ class:"flow-label"+(r.bold?" bold":"") }, r.l)
        )
      )
    )
  );

  // Summer expandable
  const summerCard = div({ class:"summer-preview-card" },
    div({
      class:"summer-preview-head",
      onclick:()=>{ showSummer=!showSummer; render(); },
      role:"button",
      "aria-expanded": showSummer?"true":"false",
      "aria-label":"Summer vacation schedule",
    },
      span({ style:{ fontSize:"18px" }, "aria-hidden":"true" }, "☀️"),
      div({ style:{ flex:1 } },
        div({ style:{ fontWeight:900, fontSize:"13px", color:"#EA580C" } },
          "Summer Vacation Schedule  (May 17 – Jun 21)"),
        div({ style:{ fontSize:"11px", color:"#9CA3AF", marginTop:"2px" } },
          "Full-day study plan · tap to "+(showSummer?"hide":"view"))
      ),
      span({ class:"insight-arrow", "aria-hidden":"true" }, showSummer?"▲":"▼")
    ),
    showSummer ? div({ class:"summer-slots" },
      ...SUMMER_SLOTS.map(s => {
        if (s.type==="break") return div({ class:"slot-break", style:{ margin:"3px 0" } },
          span({ "aria-hidden":"true" },"☕"),
          span({ style:{ fontSize:"11px",color:"#9CA3AF" } }, s.time+" · Break / Water")
        );
        const bg={study:"#EFF6FF",play:"#E0F2FE",rest:"#FEFCE8",routine:"#F8FAFC"};
        return div({ class:"summer-slot", style:{ background:bg[s.type]||"#F8FAFC" } },
          div({ class:"summer-slot-icon", style:{ background:s.color } }, s.icon),
          div({ class:"summer-slot-info" },
            div({ class:"summer-slot-header" },
              span({ class:"summer-slot-label" }, s.label),
              span({ class:"summer-slot-time", style:{ color:s.color } }, s.time)
            ),
            s.note ? div({ class:"summer-slot-note" }, s.note) : null
          )
        );
      })
    ) : null
  );

  return div({ class:"tab-content" }, dayScroll, header, slots, flowCard, summerCard);
}

// ── Roadmap Tab ──────────────────────────────────────────
function renderRoadmap() {
  const ph      = PHASES[activePhase];
  const curWeek = currentWeekNumber();
  const curPhase= currentPhaseIndex();

  const phaseToggle = div({ class:"phase-toggle", role:"tablist" },
    ...PHASES.map((p, i) => {
      const isCur = i === curPhase;
      return btn({
        class: "phase-btn" + (i===activePhase?" active":"") + (isCur?" current-phase":""),
        style: i===activePhase ? { background:p.color, color:"#fff", borderColor:p.color } : {},
        onclick: ()=>{ activePhase=i; render(); },
        role:"tab",
        "aria-selected": i===activePhase?"true":"false",
        "aria-label": p.phase+": "+p.label+(isCur?" (current)":""),
      }, p.icon+"  "+p.label+(isCur?" 📍":""))
    })
  );

  // Overall week progress bar
  const overallPct = Math.min(Math.round(((curWeek-1)/11)*100), 100);
  const overallBar = div({ class:"overall-progress-card" },
    div({ class:"overall-progress-title" },
      `📍 Currently in Week ${curWeek} of 11`),
    div({ class:"overall-bar-track", "aria-label":`Week ${curWeek} of 11` },
      div({ class:"overall-bar-fill", style:{ width:overallPct+"%" } })
    ),
    div({ class:"overall-bar-labels" },
      span({}, "Apr 13"),
      span({ style:{ fontWeight:800, color:"#2563EB" } }, `Wk ${curWeek}`),
      span({}, "Jul 1 🎯")
    )
  );

  const phaseHeader = div({ class:"phase-header", style:{ background:ph.color } },
    div({ class:"phase-header-top" },
      span({ style:{ fontSize:"28px" }, "aria-hidden":"true" }, ph.icon),
      div({},
        div({ class:"phase-title" }, ph.phase+": "+ph.label),
        div({ class:"phase-dates" }, ph.dates)
      )
    ),
    div({ class:"phase-note" }, "📌 "+ph.note)
  );

  // Calculate cumulative week offset for week number matching
  let weekOffset = activePhase === 0 ? 0 : activePhase === 1 ? 5 : 10;

  const weekCards = ph.weeks.map((wk, wi) => {
    const globalWeekNum = weekOffset + wi + 1;
    const isCurrent = globalWeekNum === curWeek;
    const isPast    = globalWeekNum < curWeek;
    return div({
      class: "week-card" + (isCurrent?" week-current":"") + (isPast?" week-past":""),
      id: isCurrent ? "current-week-card" : undefined,
    },
      div({ class:"week-head", style:{ background: isPast?"#6b7280":wk.color } },
        span({ class:"week-title" },
          (isCurrent?"📍 ":"") + (isPast?"✓ ":"") + wk.week),
        span({ class:"week-tag" },
          isCurrent ? "← This Week" : isPast ? "Done" : wk.tag)
      ),
      div({ class:"week-focus",
            style:{ borderColor:isPast?"#9CA3AF":wk.color, color:isPast?"#9CA3AF":wk.color } },
        "★  "+wk.focus),
      div({ class:"week-rows" },
        ...wk.rows.map(([lbl,val]) =>
          div({ class:"week-row" },
            span({ class:"week-row-lbl" }, lbl),
            span({ class:"week-row-val" }, val)
          )
        )
      )
    );
  });

  const summaryCard = div({ class:"summary-card" },
    div({ class:"summary-title" }, "📊 Full Timeline at a Glance"),
    ...PHASES.map(p =>
      div({ class:"sum-row" },
        div({ class:"sum-dot", style:{ background:p.color } }),
        span({ class:"sum-label" }, p.icon+" "+p.phase+": "+p.label+" — "+p.dates),
        span({ class:"sum-time", style:{ color:p.color } },
          p.weeks.length+" wk"+(p.weeks.length>1?"s":""))
      )
    ),
    div({ class:"sum-total" },
      span({}, "Total weeks until assessment"),
      span({ style:{ color:"#DC2626", fontWeight:"900" } }, "11 weeks")
    ),
    div({ class:"sum-note" }, "Assessment: July 1, 2026 · Plenty of time if plan is followed!")
  );

  return div({ class:"tab-content" },
    div({ class:"roadmap-intro" },
      div({ class:"roadmap-intro-title" }, "🗺️ 3-Phase · 11-Week Roadmap"),
      div({ class:"roadmap-intro-sub" },
        "Phase 1: School term  ·  Phase 2: Summer vacation  ·  Phase 3: Pre-assessment")
    ),
    overallBar,
    phaseToggle,
    phaseHeader,
    ...weekCards,
    summaryCard
  );
}

// ── Insights Tab ─────────────────────────────────────────
function renderInsights() {
  const cards = INSIGHTS.map((ins, i) =>
    div({ class:"insight-card" },
      div({
        class:"insight-head", style:{ background:ins.color },
        onclick:()=>{ openInsight=openInsight===i?-1:i; render(); },
        role:"button",
        "aria-expanded": openInsight===i?"true":"false",
        "aria-controls":"insight-body-"+i,
        "aria-label": ins.title,
      },
        div({ class:"insight-head-left" },
          span({ style:{ fontSize:"20px" }, "aria-hidden":"true" }, ins.emoji),
          span({ class:"insight-title" }, ins.title)
        ),
        span({ class:"insight-arrow", "aria-hidden":"true" }, openInsight===i?"▲":"▼")
      ),
      openInsight===i
        ? div({ class:"insight-body", id:"insight-body-"+i }, ins.body)
        : null
    )
  );

  const tipsCard = div({ class:"tips-card" },
    div({ class:"tips-title" }, "👨‍👩‍👧 Parent Action Points"),
    ...TIPS.map(([heading, detail], i) =>
      div({ class:"tip-row" },
        span({ class:"tip-num", "aria-hidden":"true" }, `${i+1}.`),
        div({ class:"tip-text" }, el("strong",{}, heading+" — "), detail)
      )
    )
  );

  return div({ class:"tab-content" },
    div({ class:"insights-intro" },
      div({ class:"insights-intro-title" }, "💡 Insights & Guidance"),
      div({ class:"insights-intro-sub" },
        "Updated for July 1 assessment · Includes summer vacation plan")
    ),
    ...cards, tipsCard
  );
}

// ── Onboarding modal ─────────────────────────────────────
function showOnboarding() {
  if (localStorage.getItem("onboardingDone")) return;
  const overlay = div({ id:"onboarding-overlay", role:"dialog",
                        "aria-modal":"true", "aria-label":"Welcome guide" },
    div({ class:"onboard-card" },
      div({ class:"onboard-icon" }, "🎒"),
      div({ class:"onboard-title" }, "Welcome to Study Planner!"),
      div({ class:"onboard-steps" },
        ...[
          ["📅 Schedule","See today's study slots. Tap ✓ on each slot when done."],
          ["🗺️ Roadmap","Your 11-week plan across 3 phases. Current week is highlighted 📍"],
          ["💡 Insights","Tap any card to expand tips from the actual textbooks."],
          ["☀️ Summer Plan","On Schedule tab, tap the orange banner for the full vacation schedule."],
          ["🌗 Theme","Top-right button toggles dark / light / auto mode."],
          ["📲 Install","Add to home screen for offline access (banner appears automatically)."],
        ].map(([title, desc]) =>
          div({ class:"onboard-step" },
            div({ class:"onboard-step-title" }, title),
            div({ class:"onboard-step-desc" }, desc)
          )
        )
      ),
      btn({
        class:"onboard-btn",
        onclick:() => {
          document.getElementById("onboarding-overlay")?.remove();
          localStorage.setItem("onboardingDone","1");
        },
        "aria-label":"Got it, close guide",
      }, "Got it! Let's start 🚀")
    )
  );
  document.body.appendChild(overlay);
}

// Reset onboarding (for help button)
function resetOnboarding() {
  localStorage.removeItem("onboardingDone");
  showOnboarding();
}

// ── Main render ───────────────────────────────────────────
function render() {
  // Hide skeleton
  const skeleton = document.getElementById("skeleton");
  if (skeleton) skeleton.style.display = "none";

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.style.opacity = "0";

  let content;
  if (activeTab==="schedule") content = renderSchedule();
  else if (activeTab==="roadmap") content = renderRoadmap();
  else content = renderInsights();

  main.appendChild(content);

  // Fade in
  requestAnimationFrame(() => {
    main.style.transition = "opacity 0.15s ease";
    main.style.opacity = "1";
  });

  // Scroll to current week card if roadmap tab
  if (activeTab === "roadmap") {
    setTimeout(() => {
      document.getElementById("current-week-card")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 200);
  }

  // Sync nav
  document.querySelectorAll(".nav-btn, .tab-btn").forEach(b => {
    const active = b.dataset.tab === activeTab;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active?"true":"false");
  });

  window.scrollTo({ top:0, behavior:"smooth" });
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  // Auto-switch to current phase in roadmap
  activePhase = currentPhaseIndex();

  // Theme toggle
  document.getElementById("theme-btn")?.addEventListener("click", toggleTheme);

  // Help button
  document.getElementById("help-btn")?.addEventListener("click", resetOnboarding);

  // Tab navigation
  document.querySelectorAll(".tab-btn, .nav-btn").forEach(b => {
    b.addEventListener("click", () => { activeTab = b.dataset.tab; render(); });
  });

  // Install banner — dismiss remembered for 7 days
  let deferredPrompt;
  const banner       = document.getElementById("install-banner");
  const dismissedAt  = parseInt(localStorage.getItem("installDismissed")||"0",10);
  const weekMs       = 7*24*60*60*1000;

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    if (Date.now() - dismissedAt > weekMs && banner) {
      banner.style.display = "flex";
    }
  });

  document.getElementById("install-btn")?.addEventListener("click", async() => {
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

  // Show onboarding after first render (slight delay for smoothness)
  setTimeout(showOnboarding, 400);
});
