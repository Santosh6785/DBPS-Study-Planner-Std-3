// ═══════════════════════════════════════════════════════
// app.js  ·  Study Planner Std 3  ·  v4
// ═══════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────
let activeTab   = "schedule";
let activeDay   = todayIndex();
let openInsight = -1;
let activePhase = 0;
let showSummer  = false;
let darkMode    = localStorage.getItem("theme") || "auto";

// ── Motivational tips (rotate daily) ─────────────────────
const MOTIV_TIPS = [
  "Every 40-minute session today is one step closer to July 1. Small steps, big results! 💪",
  "Revision is not repetition — it is understanding more deeply each time. Keep going! 🌟",
  "The children who do a little every day beat the ones who cram. You're doing it right! 📘",
  "Shrutilekh practice builds confidence, speed, and accuracy all at once. Don't skip it! 📕",
  "A poem learned with expression is never forgotten. Record it today! 🎤",
  "Maths speed comes from daily timed practice. Ten minutes a day makes exam day easy. 🔢",
  "EVS mind maps are the secret weapon. If you can draw it, you'll never forget it. 🌿",
  "Reading aloud is 3× more effective than silent reading for memory retention. Use it! 📖",
  "Rest is not wasted time — it's when the brain locks in today's learning. Sleep 9 hrs! 😴",
  "The best parent involvement is asking questions, not giving answers. Quiz the child! ❓",
  "Consistency beats intensity. 90 minutes every day beats 8 hours on Sunday. ⏰",
  "Summer vacation is your biggest advantage. Use it — most children don't. ☀️",
];

function todayMotiv() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  return MOTIV_TIPS[dayOfYear % MOTIV_TIPS.length];
}

// ── Helpers ───────────────────────────────────────────────
function todayIndex() { return [6,0,1,2,3,4,5][new Date().getDay()] ?? 0; }

function dateKey(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0,10);
}

function currentWeekNumber() {
  const diff = Math.floor((new Date() - new Date("2026-04-13")) / 604800000);
  return Math.min(Math.max(diff + 1, 1), 11);
}
function currentPhaseIndex() {
  const w = currentWeekNumber();
  return w <= 5 ? 0 : w <= 10 ? 1 : 2;
}

// ── Theme ─────────────────────────────────────────────────
function applyTheme() {
  document.body.classList.remove("theme-dark","theme-light");
  if (darkMode==="dark")  document.body.classList.add("theme-dark");
  if (darkMode==="light") document.body.classList.add("theme-light");
  const btn = document.getElementById("theme-btn");
  if (btn) btn.textContent = {dark:"☀️",light:"🌙",auto:"🌗"}[darkMode]||"🌗";
}
function toggleTheme() {
  darkMode = {auto:"dark",dark:"light",light:"auto"}[darkMode]||"auto";
  localStorage.setItem("theme", darkMode);
  applyTheme();
}

// ── Progress & Streak ─────────────────────────────────────
function progressKey(dayIdx, slotIdx) {
  const offset = dayIdx - todayIndex();
  return `progress_${dateKey(offset)}_${dayIdx}_${slotIdx}`;
}
function isSlotDone(dayIdx, slotIdx) {
  return localStorage.getItem(progressKey(dayIdx, slotIdx)) === "1";
}
function toggleSlot(dayIdx, slotIdx) {
  const k = progressKey(dayIdx, slotIdx);
  localStorage.getItem(k)==="1" ? localStorage.removeItem(k) : localStorage.setItem(k,"1");
}
function dayProgress(dayIdx) {
  const slots = DAYS[dayIdx].slots.filter(s=>!s.brk);
  return { done: slots.filter((_,si)=>isSlotDone(dayIdx,si)).length, total: slots.length };
}

// Weekly stats: minutes completed (approx from done slots) & total possible
function weeklyStats() {
  let doneMins=0, totalMins=0, subjectDone={};
  DAYS.forEach((day,di)=>{
    let si=0;
    day.slots.forEach(slot=>{
      if(slot.brk) return;
      totalMins += slot.dur;
      if (isSlotDone(di, si)) {
        doneMins += slot.dur;
        subjectDone[slot.subj] = (subjectDone[slot.subj]||0) + slot.dur;
      }
      si++;
    });
  });
  return { doneMins, totalMins, subjectDone };
}

// Streak: how many consecutive days (going back) had at least 1 slot done
function calculateStreak() {
  let streak = 0;
  for (let back = 0; back < 30; back++) {
    const offset = -back;
    const di = ((todayIndex() - back) % 7 + 7) % 7;
    const slots = DAYS[di].slots.filter(s=>!s.brk);
    const anyDone = slots.some((_,si) => {
      const k = `progress_${dateKey(offset)}_${di}_${si}`;
      return localStorage.getItem(k) === "1";
    });
    if (anyDone) streak++;
    else if (back > 0) break; // allow today to be 0
  }
  return streak;
}

// ── Custom Notes ──────────────────────────────────────────
function noteKey(dayIdx, slotIdx) { return `note_${dayIdx}_${slotIdx}`; }
function getNote(dayIdx, slotIdx) { return localStorage.getItem(noteKey(dayIdx, slotIdx)) || ""; }
function saveNote(dayIdx, slotIdx, text) {
  text.trim() ? localStorage.setItem(noteKey(dayIdx, slotIdx), text.trim())
              : localStorage.removeItem(noteKey(dayIdx, slotIdx));
}

function openNoteDialog(dayIdx, slotIdx, subjectLabel) {
  const existing = getNote(dayIdx, slotIdx);
  // Remove any existing dialog
  document.getElementById("note-dialog")?.remove();

  const overlay = el("div",{ id:"note-dialog", class:"dialog-overlay",
    onclick:(e)=>{ if(e.target.id==="note-dialog") document.getElementById("note-dialog")?.remove(); }
  },
    div({ class:"dialog-card" },
      div({ class:"dialog-title" }, `📝 Note — ${subjectLabel}`),
      el("textarea",{
        id:"note-textarea", class:"note-textarea",
        placeholder:"Add a note, reminder or observation…",
        html: existing,
        rows:"4",
      }),
      div({ class:"dialog-actions" },
        btn({ class:"dialog-btn dialog-btn-cancel",
          onclick:()=>document.getElementById("note-dialog")?.remove() }, "Cancel"),
        btn({ class:"dialog-btn dialog-btn-clear",
          onclick:()=>{ saveNote(dayIdx,slotIdx,""); document.getElementById("note-dialog")?.remove(); render(); }
        }, "Clear"),
        btn({ class:"dialog-btn dialog-btn-save",
          onclick:()=>{
            const t = document.getElementById("note-textarea")?.value || "";
            saveNote(dayIdx,slotIdx,t);
            document.getElementById("note-dialog")?.remove();
            render();
          }
        }, "Save ✓")
      )
    )
  );
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById("note-textarea")?.focus(), 50);
}

// ── iCal Export ───────────────────────────────────────────
function exportIcal() {
  const events = [
    { date:"20260413", title:"Study Plan Phase 1 Starts – School Term", desc:"New chapters begin. Weekday 6:30–8:30 PM." },
    { date:"20260517", title:"Summer Vacation Study Plan Starts", desc:"Full-day schedule: 8:30 AM – 7 PM." },
    { date:"20260622", title:"School Reopens – Phase 3 Begins", desc:"Back to 6:30–8:30 PM. Final sprint." },
    { date:"20260701", title:"🎯 FIRST ASSESSMENT – STD 3", desc:"All the best! You are well prepared." },
  ];
  const uid = () => Math.random().toString(36).slice(2).toUpperCase();
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "PRODID:-//StudyPlanner Std3//DBPS//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    ...events.flatMap(ev => [
      "BEGIN:VEVENT",
      `UID:${uid()}@studyplanner`,
      `DTSTART;VALUE=DATE:${ev.date}`,
      `DTEND;VALUE=DATE:${ev.date}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.desc}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type:"text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "StudyPlan_Std3_2026.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── DOM helpers ───────────────────────────────────────────
function el(tag, attrs={}, ...children) {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k==="style"&&typeof v==="object") Object.assign(e.style,v);
    else if (k==="onclick")  e.addEventListener("click",v);
    else if (k==="onchange") e.addEventListener("change",v);
    else if (k==="html") e.innerHTML=v;
    else e.setAttribute(k,v);
  }
  for (const c of children.flat()) {
    if(c==null) continue;
    e.appendChild(typeof c==="string"?document.createTextNode(c):c);
  }
  return e;
}
const div  = (a,...c) => el("div",   a,...c);
const span = (a,...c) => el("span",  a,...c);
const btn  = (a,...c) => el("button",a,...c);

// ── SCHEDULE TAB ─────────────────────────────────────────
function renderSchedule() {
  const day      = DAYS[activeDay];
  const dc       = DAY_COLOR[day.day];
  const todayIdx = todayIndex();
  const prog     = dayProgress(activeDay);
  const streak   = calculateStreak();
  let   studySlotIdx = 0;

  // Day scroll with snap + keyboard nav
  const dayScroll = div({ class:"day-scroll", role:"tablist", "aria-label":"Select day",
    id:"day-scroll-bar" },
    ...DAYS.map((d,i)=>{
      const p   = dayProgress(i);
      const pct = p.total ? Math.round((p.done/p.total)*100) : 0;
      return div({
        class:"day-btn"+(i===activeDay?" active":"")+(i===todayIdx?" is-today":""),
        style:i===activeDay?{background:DAY_COLOR[d.day],color:"#fff"}:{},
        onclick:()=>{ activeDay=i; render(); },
        role:"tab", tabindex:"0",
        "aria-selected":i===activeDay?"true":"false",
        "aria-label":d.day+(i===todayIdx?" (today)":""),
        "data-day-idx":String(i),
        onkeydown: (e)=>{
          if(e.key==="ArrowRight"){ activeDay=(activeDay+1)%7; render(); }
          if(e.key==="ArrowLeft"){ activeDay=(activeDay+6)%7; render(); }
        },
      },
        span({style:{fontSize:"15px"}},d.emoji), span({},d.short),
        p.total>0 ? div({
          class:"day-prog",
          style:{background:pct===100?"#22C55E":(i===activeDay?"rgba(255,255,255,.25)":"#e5e7eb")}
        },pct===100?"✓":`${p.done}/${p.total}`) : null,
        i===todayIdx?span({class:"today-dot","aria-hidden":"true"}):null
      );
    }),
    div({ class:"today-btn", role:"button", tabindex:"0",
      onclick:()=>{ activeDay=todayIdx; render(); },
      "aria-label":"Jump to today",
      onkeydown:(e)=>{ if(e.key==="Enter"||e.key===" "){ activeDay=todayIdx; render(); } }
    },"Today")
  );

  // Streak banner
  const streakBanner = streak >= 2 ? div({ class:"streak-banner" },
    span({style:{fontSize:"22px"}},"🔥"),
    div({},
      div({class:"streak-num"}, streak+" day streak!"),
      div({class:"streak-sub"}, "Keep going — consistency is everything")
    )
  ) : null;

  // Day header + progress bar
  const header = div({ class:"day-header", style:{background:dc} },
    div({ class:"day-header-top" },
      div({style:{fontSize:"24px"},"aria-hidden":"true"},day.emoji),
      div({ class:"day-header-info" },
        div({class:"day-name"},day.day),
        div({class:"day-note-text"},"📌 "+day.note)
      )
    ),
    div({ class:"day-badges" },
      prog.total>0 ? div({class:"day-badge"},
        prog.done===prog.total ? "✅ All done!" : `📋 ${prog.done}/${prog.total} completed`
      ) : null,
      activeDay<5 ? div({class:"day-badge"},"⚽ Free till 6:30 PM") : null,
    ),
    prog.total>0 ? div({class:"day-progress-bar-wrap","aria-hidden":"true"},
      div({class:"day-progress-bar",
        style:{width:Math.round((prog.done/prog.total)*100)+"%",
               background:prog.done===prog.total?"#22C55E":"rgba(255,255,255,.75)"}
      })
    ) : null
  );

  // Slot cards
  const slots = div({class:"slots-list"},
    ...day.slots.map(slot=>{
      if (slot.brk) return div({class:"slot-break",role:"presentation"},
        span({"aria-hidden":"true"},"☕"),
        span({style:{fontSize:"12px",color:"#9CA3AF"}},`${slot.time} – ${slot.end}  ·  Break / Water`)
      );
      const si    = studySlotIdx++;
      const done  = isSlotDone(activeDay, si);
      const note  = getNote(activeDay, si);
      const c     = COLORS[slot.subj];
      return div({
        class:"slot-card"+(slot.key?" slot-key":"")+(done?" slot-done":""),
        role:"article",
        "aria-label":LABELS[slot.subj]+", "+slot.time+(done?", completed":""),
      },
        div({class:"slot-card-head",style:{background:done?"#6b7280":c}},
          div({class:"slot-head-left"},
            span({class:"slot-emoji","aria-hidden":"true"},EMOJI[slot.subj]),
            span({class:"slot-time-label"},`${slot.time} – ${slot.end}`)
          ),
          div({class:"slot-head-right"},
            slot.key&&!done ? span({class:"slot-pill key-pill"},"★ Key") : null,
            done ? span({class:"slot-pill done-pill"},"✓ Done") : null,
            span({class:"slot-pill dur-pill"},`⏱ ${slot.dur}m`),
          )
        ),
        div({class:"slot-card-body"},
          div({class:"slot-subject-name",style:{color:done?"#9CA3AF":"var(--text)"}},LABELS[slot.subj]),
          div({class:"slot-topic",
               style:{textDecoration:done?"line-through":"none",color:done?"#9CA3AF":"var(--text2)"}},
            slot.topic),
          // Custom note display
          note ? div({class:"slot-note-display"},
            span({class:"slot-note-icon"},"📝"),
            span({class:"slot-note-text"},note)
          ) : null,
          div({class:"slot-footer"},
            div({class:"slot-sess-badge",style:{color:done?"#9CA3AF":c}},SESS[slot.sess]||slot.sess),
            div({class:"slot-footer-actions"},
              // Note button
              btn({
                class:"note-btn"+(note?" note-btn-active":""),
                onclick:(e)=>{ e.stopPropagation(); openNoteDialog(activeDay,si,LABELS[slot.subj]); },
                "aria-label":(note?"Edit":"Add")+" note for "+LABELS[slot.subj],
                title:(note?"Edit":"Add")+" note",
              }, note?"📝":"＋📝"),
              // Checkbox
              el("label",{class:"done-label",
                title:done?"Mark as not done":"Mark as done",
                "aria-label":(done?"Unmark":"Mark")+" "+LABELS[slot.subj]+" as done",
              },
                el("input",{type:"checkbox",class:"done-check",
                  ...(done?{checked:""}:{}),
                  onchange:(e)=>{ e.stopPropagation(); toggleSlot(activeDay,si); render(); }
                }),
                span({class:"done-check-label"},done?"✓ Done":"Mark done")
              )
            )
          )
        )
      );
    })
  );

  // Flow card
  const flowRows = activeDay===5?[
    {t:"9:00 – 11:00 AM",l:"📚 Morning: revision + Shrutilekh + Grammar + Spelling",bold:true},
    {t:"11 AM – 3:30 PM",l:"⚽ Free time — family, outdoor, rest"},
    {t:"3:30 – 5:00 PM", l:"📚 Afternoon: Maths + Mental Maths + GK + All 5 Poems",bold:true},
    {t:"5:00 PM+",        l:"⚽ Fully free"},
  ]:activeDay===6?[
    {t:"9:00 – 10:45 AM",l:"📚 Light revision: EVS + Hindi + Grammar + Poem",bold:true},
    {t:"10:45 AM+",       l:"⚽ FULLY FREE — no study",bold:true},
  ]:[
    {t:"2:30 PM",         l:"🏠 Home from school"},
    {t:"2:30 – 6:30 PM",  l:"⚽ FREE TIME — play, rest, outdoor",bold:true},
    {t:"6:30 – 7:10 PM",  l:"📚 Study Slot 1 — 40 min heavy subject",bold:true},
    {t:"7:10 – 7:15 PM",  l:"☕ Break"},
    {t:"7:15 – 7:55 PM",  l:"📚 Study Slot 2 — 40 min second subject",bold:true},
    {t:"7:55 – 8:00 PM",  l:"☕ Break"},
    {t:"8:00 – 8:30 PM",  l:"📚 Study Slot 3 — 30 min light subject",bold:true},
    {t:"8:30 PM",         l:"🍽️ Dinner"},
    {t:"9:30 PM",         l:"😴 Sleep — 8–9 hrs essential",bold:true},
  ];

  const flowCard = div({class:"flow-card"},
    div({class:"flow-card-title"},"🕐 "+(activeDay<5?"Weekday Flow":activeDay===5?"Saturday Flow":"Sunday Flow")),
    ...flowRows.map(r=>div({class:"flow-row"},
      div({class:"flow-dot",style:{background:r.bold?DAY_COLOR[day.day]:"#9CA3AF"}}),
      div({class:"flow-info"},
        div({class:"flow-time",style:{color:r.bold?DAY_COLOR[day.day]:"#9CA3AF"}},r.t),
        div({class:"flow-label"+(r.bold?" bold":"")},r.l)
      )
    ))
  );

  // Summer expandable
  const summerCard = div({class:"summer-preview-card"},
    div({class:"summer-preview-head",onclick:()=>{showSummer=!showSummer;render();},
      role:"button","aria-expanded":showSummer?"true":"false"},
      span({style:{fontSize:"18px"},"aria-hidden":"true"},"☀️"),
      div({style:{flex:1}},
        div({style:{fontWeight:900,fontSize:"13px",color:"#EA580C"}},"Summer Vacation Schedule  (May 17 – Jun 21)"),
        div({style:{fontSize:"11px",color:"#9CA3AF",marginTop:"2px"}},"Full-day study plan · tap to "+(showSummer?"hide":"view"))
      ),
      span({class:"insight-arrow","aria-hidden":"true"},showSummer?"▲":"▼")
    ),
    showSummer?div({class:"summer-slots"},
      ...SUMMER_SLOTS.map(s=>{
        if(s.type==="break") return div({class:"slot-break",style:{margin:"3px 0"}},
          span({"aria-hidden":"true"},"☕"),span({style:{fontSize:"11px",color:"#9CA3AF"}},s.time+" · Break / Water")
        );
        const bg={study:"#EFF6FF",play:"#E0F2FE",rest:"#FEFCE8",routine:"#F8FAFC"};
        return div({class:"summer-slot",style:{background:bg[s.type]||"#F8FAFC"}},
          div({class:"summer-slot-icon",style:{background:s.color}},s.icon),
          div({class:"summer-slot-info"},
            div({class:"summer-slot-header"},
              span({class:"summer-slot-label"},s.label),
              span({class:"summer-slot-time",style:{color:s.color}},s.time)
            ),
            s.note?div({class:"summer-slot-note"},s.note):null
          )
        );
      })
    ):null
  );

  return div({class:"tab-content"}, streakBanner, dayScroll, header, slots, flowCard, summerCard);
}

// ── ROADMAP TAB ──────────────────────────────────────────
function renderRoadmap() {
  const ph       = PHASES[activePhase];
  const curWeek  = currentWeekNumber();
  const curPhase = currentPhaseIndex();
  let weekOffset = activePhase===0?0:activePhase===1?5:10;

  const phaseToggle = div({class:"phase-toggle",role:"tablist"},
    ...PHASES.map((p,i)=>{
      const isCur = i===curPhase;
      return btn({
        class:"phase-btn"+(i===activePhase?" active":"")+(isCur?" current-phase":""),
        style:i===activePhase?{background:p.color,color:"#fff",borderColor:p.color}:{},
        onclick:()=>{activePhase=i;render();},
        role:"tab","aria-selected":i===activePhase?"true":"false",
        tabindex:"0",
        onkeydown:(e)=>{
          if(e.key==="ArrowRight"){activePhase=(activePhase+1)%3;render();}
          if(e.key==="ArrowLeft") {activePhase=(activePhase+2)%3;render();}
        },
      }, p.icon+"  "+p.label+(isCur?" 📍":""))
    })
  );

  const overallPct = Math.min(Math.round(((curWeek-1)/11)*100),100);
  const overallBar = div({class:"overall-progress-card"},
    div({class:"overall-progress-title"},`📍 Currently in Week ${curWeek} of 11`),
    div({class:"overall-bar-track"},div({class:"overall-bar-fill",style:{width:overallPct+"%"}})),
    div({class:"overall-bar-labels"},
      span({},"Apr 13"),
      span({style:{fontWeight:800,color:"#2563EB"}},`Wk ${curWeek}`),
      span({},"Jul 1 🎯")
    ),
    // iCal export button
    div({class:"ical-row"},
      btn({class:"ical-btn",onclick:exportIcal,
           "aria-label":"Download key dates as calendar file",
           title:"Add key dates to your calendar app"},
        "📅 Export key dates to calendar (.ics)"
      )
    )
  );

  const phaseHeader = div({class:"phase-header",style:{background:ph.color}},
    div({class:"phase-header-top"},
      span({style:{fontSize:"28px"},"aria-hidden":"true"},ph.icon),
      div({},div({class:"phase-title"},ph.phase+": "+ph.label),div({class:"phase-dates"},ph.dates))
    ),
    div({class:"phase-note"},"📌 "+ph.note)
  );

  const weekCards = ph.weeks.map((wk,wi)=>{
    const globalNum = weekOffset+wi+1;
    const isCurrent = globalNum===curWeek;
    const isPast    = globalNum<curWeek;
    return div({
      class:"week-card"+(isCurrent?" week-current":"")+(isPast?" week-past":""),
      ...(isCurrent?{id:"current-week-card"}:{}),
    },
      div({class:"week-head",style:{background:isPast?"#6b7280":wk.color}},
        span({class:"week-title"},(isCurrent?"📍 ":"")+(isPast?"✓ ":"")+wk.week),
        span({class:"week-tag"},isCurrent?"← This Week":isPast?"Done":wk.tag)
      ),
      div({class:"week-focus",style:{borderColor:isPast?"#9CA3AF":wk.color,color:isPast?"#9CA3AF":wk.color}},
        "★  "+wk.focus),
      div({class:"week-rows"},
        ...wk.rows.map(([lbl,val])=>div({class:"week-row"},
          span({class:"week-row-lbl"},lbl),span({class:"week-row-val"},val)
        ))
      )
    );
  });

  const summaryCard = div({class:"summary-card"},
    div({class:"summary-title"},"📊 Full Timeline at a Glance"),
    ...PHASES.map(p=>div({class:"sum-row"},
      div({class:"sum-dot",style:{background:p.color}}),
      span({class:"sum-label"},p.icon+" "+p.phase+": "+p.label+" — "+p.dates),
      span({class:"sum-time",style:{color:p.color}},p.weeks.length+" wk"+(p.weeks.length>1?"s":""))
    )),
    div({class:"sum-total"},
      span({},"Total weeks until assessment"),
      span({style:{color:"#DC2626",fontWeight:"900"}},"11 weeks")
    ),
    div({class:"sum-note"},"Assessment: July 1, 2026 · Plenty of time if plan is followed!")
  );

  return div({class:"tab-content"},
    div({class:"roadmap-intro"},
      div({class:"roadmap-intro-title"},"🗺️ 3-Phase · 11-Week Roadmap"),
      div({class:"roadmap-intro-sub"},"Phase 1: School term  ·  Phase 2: Summer vacation  ·  Phase 3: Pre-assessment")
    ),
    overallBar, phaseToggle, phaseHeader, ...weekCards, summaryCard
  );
}

// ── INSIGHTS TAB ─────────────────────────────────────────
function renderStats() {
  const { doneMins, totalMins, subjectDone } = weeklyStats();
  const streak = calculateStreak();
  const pct    = totalMins ? Math.round((doneMins/totalMins)*100) : 0;

  const topSubj = Object.entries(subjectDone)
    .sort((a,b)=>b[1]-a[1]).slice(0,3);

  return div({class:"stats-card"},
    div({class:"stats-title"},"📊 This Week's Progress"),
    div({class:"stats-grid"},
      div({class:"stats-box"},
        div({class:"stats-num",style:{color:"#3B82F6"}},doneMins+"m"),
        div({class:"stats-lbl"},"Study done")
      ),
      div({class:"stats-box"},
        div({class:"stats-num",style:{color:"#9CA3AF"}},(totalMins-doneMins)+"m"),
        div({class:"stats-lbl"},"Remaining")
      ),
      div({class:"stats-box"},
        div({class:"stats-num",style:{color:streak>=3?"#F97316":"#22C55E"}},streak===0?"–":streak+"🔥"),
        div({class:"stats-lbl"},"Day streak")
      ),
      div({class:"stats-box"},
        div({class:"stats-num",style:{color:pct===100?"#22C55E":"#14B8A6"}},pct+"%"),
        div({class:"stats-lbl"},"Completion")
      ),
    ),
    // Progress bar
    div({class:"stats-bar-track"},
      div({class:"stats-bar-fill",
        style:{width:pct+"%",background:pct===100?"#22C55E":"linear-gradient(90deg,#3B82F6,#14B8A6)"}
      })
    ),
    // Top subjects
    topSubj.length>0 ? div({class:"stats-top"},
      div({class:"stats-top-label"},"Most studied this week:"),
      div({class:"stats-top-items"},
        ...topSubj.map(([subj,mins])=>
          div({class:"stats-top-item"},
            span({},EMOJI[subj]),
            span({style:{fontWeight:800,fontSize:"11px",color:COLORS[subj]}},LABELS[subj]),
            span({style:{fontSize:"10px",color:"var(--text3)"}},mins+"m")
          )
        )
      )
    ):null,
    // Motivational tip
    div({class:"motiv-tip"},
      span({class:"motiv-icon"},"💬"),
      span({class:"motiv-text"},todayMotiv())
    )
  );
}

function renderInsights() {
  const cards = INSIGHTS.map((ins,i)=>
    div({class:"insight-card"},
      div({class:"insight-head",style:{background:ins.color},
        onclick:()=>{openInsight=openInsight===i?-1:i;render();},
        role:"button","aria-expanded":openInsight===i?"true":"false",
        "aria-label":ins.title, tabindex:"0",
        onkeydown:(e)=>{ if(e.key==="Enter"||e.key===" "){ openInsight=openInsight===i?-1:i;render(); } }
      },
        div({class:"insight-head-left"},
          span({style:{fontSize:"20px"},"aria-hidden":"true"},ins.emoji),
          span({class:"insight-title"},ins.title)
        ),
        span({class:"insight-arrow","aria-hidden":"true"},openInsight===i?"▲":"▼")
      ),
      openInsight===i?div({class:"insight-body",id:"insight-body-"+i},ins.body):null
    )
  );

  const tipsCard = div({class:"tips-card"},
    div({class:"tips-title"},"👨‍👩‍👧 Parent Action Points"),
    ...TIPS.map(([heading,detail],i)=>
      div({class:"tip-row"},
        span({class:"tip-num","aria-hidden":"true"},`${i+1}.`),
        div({class:"tip-text"},el("strong",{},heading+" — "),detail)
      )
    )
  );

  const feedbackCard = div({class:"feedback-card"},
    div({class:"feedback-title"},"💬 Feedback & Suggestions"),
    div({class:"feedback-body"},"Found a bug or have a suggestion? Tap below to open a GitHub issue or share feedback."),
    div({class:"feedback-actions"},
      el("a",{
        href:"https://github.com/santosh6785/DBPS-Study-Planner-Std-3/issues/new",
        target:"_blank", rel:"noopener noreferrer",
        class:"feedback-btn", "aria-label":"Open feedback on GitHub",
      },"🐛 Report / Suggest"),
      btn({
        class:"ical-btn",
        onclick:exportIcal,
        "aria-label":"Download key dates as calendar file",
      },"📅 Export key dates (.ics)")
    )
  );

  return div({class:"tab-content"},
    div({class:"insights-intro"},
      div({class:"insights-intro-title"},"💡 Insights & Stats"),
      div({class:"insights-intro-sub"},"Live progress · Textbook insights · Parent tips")
    ),
    renderStats(),
    ...cards,
    tipsCard,
    feedbackCard
  );
}

// ── Onboarding ────────────────────────────────────────────
function showOnboarding() {
  if (localStorage.getItem("onboardingDone")) return;
  const overlay = el("div",{id:"onboarding-overlay",role:"dialog",
    "aria-modal":"true","aria-label":"Welcome guide",
    onclick:(e)=>{ if(e.target.id==="onboarding-overlay") closeOnboarding(); }
  },
    div({class:"onboard-card"},
      div({class:"onboard-icon"},"🎒"),
      div({class:"onboard-title"},"Welcome to Study Planner!"),
      div({class:"onboard-steps"},
        ...[
          ["📅 Schedule","See daily slots. Tick ✓ when done. Add 📝 notes to any slot."],
          ["🔥 Streak","Build a study streak — shown in the Schedule header."],
          ["🗺️ Roadmap","11-week plan across 3 phases. Current week is highlighted 📍"],
          ["💡 Insights","Stats, motivational tips, and textbook guidance — all live."],
          ["📅 iCal","Export key dates (phases + assessment) to your calendar app."],
          ["🌗 Theme","Top-right button: cycle dark / light / auto mode."],
        ].map(([t,d])=>div({class:"onboard-step"},
          div({class:"onboard-step-title"},t),div({class:"onboard-step-desc"},d)
        ))
      ),
      btn({class:"onboard-btn",onclick:closeOnboarding,"aria-label":"Close guide"},"Got it! Let's start 🚀")
    )
  );
  document.body.appendChild(overlay);
}

function closeOnboarding() {
  document.getElementById("onboarding-overlay")?.remove();
  localStorage.setItem("onboardingDone","1");
}

function resetOnboarding() {
  localStorage.removeItem("onboardingDone");
  document.getElementById("onboarding-overlay")?.remove();
  showOnboarding();
}

// ── Render ────────────────────────────────────────────────
function render() {
  const skeleton = document.getElementById("skeleton");
  if (skeleton) skeleton.style.display = "none";

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.style.opacity = "0";

  const content =
    activeTab==="schedule" ? renderSchedule() :
    activeTab==="roadmap"  ? renderRoadmap()  :
    renderInsights();

  main.appendChild(content);

  requestAnimationFrame(()=>{ main.style.transition="opacity .15s ease"; main.style.opacity="1"; });

  if (activeTab==="roadmap") {
    setTimeout(()=>document.getElementById("current-week-card")
      ?.scrollIntoView({behavior:"smooth",block:"nearest"}), 250);
  }

  document.querySelectorAll(".nav-btn,.tab-btn").forEach(b=>{
    const a = b.dataset.tab===activeTab;
    b.classList.toggle("active",a);
    b.setAttribute("aria-selected",a?"true":"false");
  });

  // Focus active day button for keyboard users
  if (activeTab==="schedule") {
    setTimeout(()=>{
      document.querySelector(`.day-btn[data-day-idx="${activeDay}"]`)?.focus();
    },50);
  }

  window.scrollTo({top:0,behavior:"smooth"});
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  applyTheme();
  activePhase = currentPhaseIndex();

  document.getElementById("theme-btn")?.addEventListener("click",toggleTheme);
  document.getElementById("help-btn")?.addEventListener("click",resetOnboarding);

  document.querySelectorAll(".tab-btn,.nav-btn").forEach(b=>{
    b.addEventListener("click",()=>{ activeTab=b.dataset.tab; render(); });
  });

  let deferredPrompt;
  const banner     = document.getElementById("install-banner");
  const dismissedAt= parseInt(localStorage.getItem("installDismissed")||"0",10);
  const weekMs     = 7*24*60*60*1000;

  window.addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferredPrompt=e;
    if(Date.now()-dismissedAt>weekMs&&banner) banner.style.display="flex";
  });
  document.getElementById("install-btn")?.addEventListener("click",async()=>{
    if(!deferredPrompt)return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice;
    deferredPrompt=null; if(banner)banner.style.display="none";
  });
  document.getElementById("dismiss-install")?.addEventListener("click",()=>{
    if(banner)banner.style.display="none";
    localStorage.setItem("installDismissed",Date.now().toString());
  });

  render();
  setTimeout(showOnboarding, 400);
});
