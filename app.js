// ═══════════════════════════════════════════════════════
// app.js  ·  Study Planner Std 3  ·  v5 (Firebase)
// All data via window.FB — no direct localStorage use.
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
  "Revision is not repetition — it is understanding more deeply each time. 🌟",
  "Children who do a little every day beat those who cram. You're doing it right! 📘",
  "Shrutilekh practice builds confidence, speed, and accuracy all at once. 📕",
  "A poem learned with expression is never forgotten. Record it today! 🎤",
  "Maths speed comes from daily timed practice. Ten minutes a day makes exam day easy. 🔢",
  "EVS mind maps are the secret weapon. If you can draw it, you'll never forget it. 🌿",
  "Reading aloud is 3× more effective than silent reading for memory retention. 📖",
  "Rest is not wasted time — it's when the brain locks in today's learning. Sleep 9 hrs! 😴",
  "The best parent involvement is asking questions, not giving answers. Quiz the child! ❓",
  "Consistency beats intensity. 90 minutes daily beats 8 hours on Sunday. ⏰",
  "Summer vacation is your biggest advantage. Use it — most children won't. ☀️",
];

function todayMotiv() {
  const doy = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  return MOTIV_TIPS[doy % MOTIV_TIPS.length];
}

// ── Utilities ─────────────────────────────────────────────
function todayIndex() { return [6,0,1,2,3,4,5][new Date().getDay()] ?? 0; }

function slotProgressKey(dayIdx, slotIdx) {
  const d = new Date();
  d.setDate(d.getDate() + (dayIdx - todayIndex()));
  return d.toISOString().slice(0,10) + `_${dayIdx}_${slotIdx}`;
}
function noteKey(dayIdx, slotIdx) { return `${dayIdx}_${slotIdx}`; }

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
  const b = document.getElementById("theme-btn");
  if (b) b.textContent = {dark:"☀️",light:"🌙",auto:"🌗"}[darkMode] || "🌗";
}
function toggleTheme() {
  darkMode = {auto:"dark",dark:"light",light:"auto"}[darkMode] || "auto";
  localStorage.setItem("theme",darkMode);
  applyTheme();
}

// ── Day progress (uses FB cache synchronously) ────────────
function dayProgress(dayIdx) {
  let done=0, total=0, si=0;
  DAYS[dayIdx].slots.forEach(slot => {
    if (slot.brk) return;
    if (FB.isSlotDone(slotProgressKey(dayIdx, si))) done++;
    total++; si++;
  });
  return { done, total };
}

// ── iCal export ───────────────────────────────────────────
function exportIcal() {
  const events = [
    { date:"20260413", title:"Study Plan Phase 1 Starts – School Term",     desc:"New chapters begin. 6:30–8:30 PM." },
    { date:"20260517", title:"Summer Vacation Study Plan Starts",            desc:"Full-day schedule kicks in." },
    { date:"20260622", title:"School Reopens – Phase 3 Final Sprint",        desc:"Back to 6:30–8:30 PM." },
    { date:"20260701", title:"🎯 FIRST ASSESSMENT – Std 3 DBPS",             desc:"All the best! You are well prepared." },
  ];
  const uid = () => Math.random().toString(36).slice(2).toUpperCase();
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//StudyPlanner Std3//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    ...events.flatMap(ev=>[
      "BEGIN:VEVENT",`UID:${uid()}@dbps`,`DTSTART;VALUE=DATE:${ev.date}`,
      `DTEND;VALUE=DATE:${ev.date}`,`SUMMARY:${ev.title}`,`DESCRIPTION:${ev.desc}`,
      "END:VEVENT"
    ]),
    "END:VCALENDAR"
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\r\n")],{type:"text/calendar"}));
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
    else if (k==="html")     e.innerHTML=v;
    else e.setAttribute(k,v);
  }
  for (const c of children.flat()) {
    if(c==null)continue;
    e.appendChild(typeof c==="string"?document.createTextNode(c):c);
  }
  return e;
}
const div  = (a,...c) => el("div",   a,...c);
const span = (a,...c) => el("span",  a,...c);
const btn  = (a,...c) => el("button",a,...c);

// ── Header: user info ─────────────────────────────────────
function updateHeaderUser(user) {
  const section = document.getElementById("user-section");
  if (!section) return;
  section.innerHTML = "";

  if (user.photoURL) {
    const img = document.createElement("img");
    img.src     = user.photoURL;
    img.alt     = user.displayName || "User";
    img.className = "user-avatar";
    img.onerror = () => img.remove();
    section.appendChild(img);
  }

  const name = document.createElement("span");
  name.className   = "user-name";
  name.textContent = (user.displayName || user.email || "").split(" ")[0];
  section.appendChild(name);

  const out = document.createElement("button");
  out.className   = "signout-btn";
  out.textContent = "Sign out";
  out.setAttribute("aria-label","Sign out of your account");
  out.addEventListener("click", () => FB.signOut());
  section.appendChild(out);
}

// ── Note dialog ───────────────────────────────────────────
function openNoteDialog(dayIdx, slotIdx, subjectLabel) {
  document.getElementById("note-dialog")?.remove();
  const existing = FB.getNote(noteKey(dayIdx, slotIdx));
  const nkey     = noteKey(dayIdx, slotIdx);

  const overlay = el("div",{
    id:"note-dialog", class:"dialog-overlay",
    onclick:(e)=>{ if(e.target.id==="note-dialog") overlay.remove(); }
  },
    div({class:"dialog-card"},
      div({class:"dialog-title"},`📝 Note — ${subjectLabel}`),
      el("textarea",{id:"note-ta",class:"note-textarea",placeholder:"Add your note here…",rows:"4",html:existing}),
      div({class:"dialog-actions"},
        btn({class:"dialog-btn cancel",onclick:()=>overlay.remove()},"Cancel"),
        btn({class:"dialog-btn clear", onclick:()=>{ FB.saveNote(nkey,""); overlay.remove(); render(); }},"Clear"),
        btn({class:"dialog-btn save",  onclick:()=>{
          const t = document.getElementById("note-ta")?.value||"";
          FB.saveNote(nkey,t); overlay.remove(); render();
        }},"Save ✓")
      )
    )
  );
  document.body.appendChild(overlay);
  setTimeout(()=>document.getElementById("note-ta")?.focus(),50);
}

// ════════════════════════════════════════════════════════
//  SCHEDULE TAB
// ════════════════════════════════════════════════════════
function renderSchedule() {
  const day      = DAYS[activeDay];
  const dc       = DAY_COLOR[day.day];
  const todayIdx = todayIndex();
  const prog     = dayProgress(activeDay);
  const streak   = FB.calculateStreak();
  let   si       = 0;

  // ── Streak banner ────────────────────────────────────
  const streakBanner = streak >= 2
    ? div({class:"streak-banner"},
        span({style:{fontSize:"22px"}},"🔥"),
        div({},
          div({class:"streak-num"},streak+" day streak!"),
          div({class:"streak-sub"},"Consistency is the secret — keep going!")
        )
      )
    : null;

  // ── Day selector ─────────────────────────────────────
  const dayScroll = div({class:"day-scroll",role:"tablist","aria-label":"Select day"},
    ...DAYS.map((d,i)=>{
      const p   = dayProgress(i);
      const pct = p.total ? Math.round((p.done/p.total)*100) : 0;
      return div({
        class:"day-btn"+(i===activeDay?" active":"")+(i===todayIdx?" is-today":""),
        style:i===activeDay?{background:DAY_COLOR[d.day],color:"#fff"}:{},
        onclick:()=>{activeDay=i;render();},
        role:"tab",tabindex:"0",
        "aria-selected":i===activeDay?"true":"false",
        "aria-label":d.day+(i===todayIdx?" (today)":""),
        "data-day-idx":String(i),
        onkeydown:(e)=>{
          if(e.key==="ArrowRight"){activeDay=(activeDay+1)%7;render();}
          if(e.key==="ArrowLeft") {activeDay=(activeDay+6)%7;render();}
        },
      },
        span({style:{fontSize:"15px"}},d.emoji),
        span({},d.short),
        p.total>0 ? div({class:"day-prog",
          style:{background:pct===100?"#22C55E":(i===activeDay?"rgba(255,255,255,.25)":"#e5e7eb")}
        },pct===100?"✓":`${p.done}/${p.total}`) : null,
        i===todayIdx ? span({class:"today-dot","aria-hidden":"true"}) : null
      );
    }),
    div({class:"today-btn",role:"button",tabindex:"0",
      onclick:()=>{activeDay=todayIdx;render();},
      "aria-label":"Jump to today",
      onkeydown:(e)=>{ if(e.key==="Enter"||e.key===" "){activeDay=todayIdx;render();} }
    },"Today")
  );

  // ── Day header ───────────────────────────────────────
  const header = div({class:"day-header",style:{background:dc}},
    div({class:"day-header-top"},
      div({style:{fontSize:"24px"},"aria-hidden":"true"},day.emoji),
      div({class:"day-header-info"},
        div({class:"day-name"},day.day),
        div({class:"day-note-text"},"📌 "+day.note)
      )
    ),
    div({class:"day-badges"},
      prog.total>0
        ? div({class:"day-badge"},prog.done===prog.total?"✅ All done!":`📋 ${prog.done}/${prog.total} completed`)
        : null,
      activeDay<5 ? div({class:"day-badge"},"⚽ Free till 6:30 PM") : null,
    ),
    prog.total>0 ? div({class:"day-progress-bar-wrap","aria-hidden":"true"},
      div({class:"day-progress-bar",style:{
        width:Math.round((prog.done/prog.total)*100)+"%",
        background:prog.done===prog.total?"#22C55E":"rgba(255,255,255,.75)"
      }})
    ) : null
  );

  // ── Slots ─────────────────────────────────────────────
  const slots = div({class:"slots-list"},
    ...day.slots.map(slot=>{
      if(slot.brk) return div({class:"slot-break",role:"presentation"},
        span({"aria-hidden":"true"},"☕"),
        span({style:{fontSize:"12px",color:"#9CA3AF"}},`${slot.time} – ${slot.end}  ·  Break`)
      );
      const slotIdx  = si++;
      const pkey     = slotProgressKey(activeDay, slotIdx);
      const done     = FB.isSlotDone(pkey);
      const note     = FB.getNote(noteKey(activeDay, slotIdx));
      const c        = COLORS[slot.subj];

      return div({
        class:"slot-card"+(slot.key?" slot-key":"")+(done?" slot-done":""),
        role:"article",
        "aria-label":LABELS[slot.subj]+", "+slot.time+(done?", completed":""),
      },
        // Head
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
        // Body
        div({class:"slot-card-body"},
          div({class:"slot-subject-name",style:{color:done?"#9CA3AF":"var(--text)"}},LABELS[slot.subj]),
          div({class:"slot-topic",
               style:{textDecoration:done?"line-through":"none",color:done?"#9CA3AF":"var(--text2)"}},
            slot.topic),
          // Note display
          note ? div({class:"slot-note-display"},
            span({class:"slot-note-icon"},"📝"),
            span({class:"slot-note-text"},note)
          ) : null,
          // Footer
          div({class:"slot-footer"},
            div({class:"slot-sess-badge",style:{color:done?"#9CA3AF":c}},SESS[slot.sess]||slot.sess),
            div({class:"slot-footer-actions"},
              btn({
                class:"note-btn"+(note?" note-btn-active":""),
                onclick:(e)=>{e.stopPropagation();openNoteDialog(activeDay,slotIdx,LABELS[slot.subj]);},
                "aria-label":(note?"Edit":"Add")+" note",
                title:"Note",
              },note?"📝":"＋📝"),
              el("label",{class:"done-label",
                "aria-label":(done?"Unmark":"Mark")+" "+LABELS[slot.subj]+" as done"},
                el("input",{type:"checkbox",class:"done-check",
                  ...(done?{checked:""}:{}),
                  onchange:(e)=>{e.stopPropagation();FB.toggleSlot(pkey);render();}
                }),
                span({class:"done-check-label"},done?"✓ Done":"Mark done")
              )
            )
          )
        )
      );
    })
  );

  // ── Day flow card ─────────────────────────────────────
  const flowRows = activeDay===5?[
    {t:"9:00 – 11:00 AM",  l:"📚 Morning: revision + Shrutilekh + Grammar",bold:true},
    {t:"11 AM – 3:30 PM",  l:"⚽ Free time — outdoor, family, rest"},
    {t:"3:30 – 5:00 PM",   l:"📚 Afternoon: Maths + GK + All 5 Poems",bold:true},
    {t:"5:00 PM+",          l:"⚽ Fully free evening"},
  ]:activeDay===6?[
    {t:"9:00 – 10:45 AM",  l:"📚 Light revision: EVS + Hindi + Poem",bold:true},
    {t:"10:45 AM+",         l:"⚽ FULLY FREE — no study all afternoon",bold:true},
  ]:[
    {t:"2:30 PM",           l:"🏠 Home from school"},
    {t:"2:30 – 6:30 PM",   l:"⚽ FREE TIME — play, rest, outdoor",bold:true},
    {t:"6:30 – 7:10 PM",   l:"📚 Slot 1 — 40 min heavy subject",bold:true},
    {t:"7:10 – 7:15 PM",   l:"☕ Break"},
    {t:"7:15 – 7:55 PM",   l:"📚 Slot 2 — 40 min second subject",bold:true},
    {t:"7:55 – 8:00 PM",   l:"☕ Break"},
    {t:"8:00 – 8:30 PM",   l:"📚 Slot 3 — 30 min light subject",bold:true},
    {t:"9:30 PM",           l:"😴 Sleep — 8–9 hrs essential",bold:true},
  ];

  const flowCard = div({class:"flow-card"},
    div({class:"flow-card-title"},"🕐 "+(activeDay<5?"Weekday":activeDay===5?"Saturday":"Sunday")+" Flow"),
    ...flowRows.map(r=>div({class:"flow-row"},
      div({class:"flow-dot",style:{background:r.bold?dc:"#9CA3AF"}}),
      div({class:"flow-info"},
        div({class:"flow-time",style:{color:r.bold?dc:"#9CA3AF"}},r.t),
        div({class:"flow-label"+(r.bold?" bold":"")},r.l)
      )
    ))
  );

  // ── Summer expandable ─────────────────────────────────
  const summerCard = div({class:"summer-preview-card"},
    div({class:"summer-preview-head",
      onclick:()=>{showSummer=!showSummer;render();},
      role:"button","aria-expanded":showSummer?"true":"false"},
      span({style:{fontSize:"18px"},"aria-hidden":"true"},"☀️"),
      div({style:{flex:1}},
        div({style:{fontWeight:900,fontSize:"13px",color:"#EA580C"}},"Summer Vacation Schedule  (May 17 – Jun 21)"),
        div({style:{fontSize:"11px",color:"#9CA3AF",marginTop:"2px"}},"Full-day study plan · tap to "+(showSummer?"hide":"view"))
      ),
      span({class:"insight-arrow","aria-hidden":"true"},showSummer?"▲":"▼")
    ),
    showSummer ? div({class:"summer-slots"},
      ...SUMMER_SLOTS.map(s=>{
        if(s.type==="break") return div({class:"slot-break",style:{margin:"3px 0"}},
          span({"aria-hidden":"true"},"☕"),span({style:{fontSize:"11px",color:"#9CA3AF"}},s.time+" · Break")
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

  return div({class:"tab-content"},streakBanner,dayScroll,header,slots,flowCard,summerCard);
}

// ════════════════════════════════════════════════════════
//  ROADMAP TAB
// ════════════════════════════════════════════════════════
function renderRoadmap() {
  const ph        = PHASES[activePhase];
  const curWeek   = currentWeekNumber();
  const curPhase  = currentPhaseIndex();
  const wkOffset  = activePhase===0?0:activePhase===1?5:10;
  const overallPct= Math.min(Math.round(((curWeek-1)/11)*100),100);

  const phaseToggle = div({class:"phase-toggle",role:"tablist"},
    ...PHASES.map((p,i)=>
      btn({
        class:"phase-btn"+(i===activePhase?" active":"")+(i===curPhase?" current-phase":""),
        style:i===activePhase?{background:p.color,color:"#fff",borderColor:p.color}:{},
        onclick:()=>{activePhase=i;render();},
        role:"tab","aria-selected":i===activePhase?"true":"false",tabindex:"0",
        onkeydown:(e)=>{
          if(e.key==="ArrowRight"){activePhase=(activePhase+1)%3;render();}
          if(e.key==="ArrowLeft") {activePhase=(activePhase+2)%3;render();}
        },
      }, p.icon+"  "+p.label+(i===curPhase?" 📍":""))
    )
  );

  const overallBar = div({class:"overall-progress-card"},
    div({class:"overall-progress-title"},`📍 Week ${curWeek} of 11`),
    div({class:"overall-bar-track"},div({class:"overall-bar-fill",style:{width:overallPct+"%"}})),
    div({class:"overall-bar-labels"},
      span({},"Apr 13"),
      span({style:{fontWeight:800,color:"#2563EB"}},`Wk ${curWeek}`),
      span({},"Jul 1 🎯")
    ),
    div({class:"ical-row"},
      btn({class:"ical-btn",onclick:exportIcal,"aria-label":"Download key dates as .ics file"},
        "📅 Export key dates to calendar (.ics)")
    )
  );

  const phaseHeader = div({class:"phase-header",style:{background:ph.color}},
    div({class:"phase-header-top"},
      span({style:{fontSize:"28px"},"aria-hidden":"true"},ph.icon),
      div({},
        div({class:"phase-title"},ph.phase+": "+ph.label),
        div({class:"phase-dates"},ph.dates)
      )
    ),
    div({class:"phase-note"},"📌 "+ph.note)
  );

  const weekCards = ph.weeks.map((wk,wi)=>{
    const gn = wkOffset+wi+1;
    return div({
      class:"week-card"+(gn===curWeek?" week-current":"")+(gn<curWeek?" week-past":""),
      ...(gn===curWeek?{id:"current-week-card"}:{})
    },
      div({class:"week-head",style:{background:gn<curWeek?"#6b7280":wk.color}},
        span({class:"week-title"},(gn===curWeek?"📍 ":"")+(gn<curWeek?"✓ ":"")+wk.week),
        span({class:"week-tag"},gn===curWeek?"← This Week":gn<curWeek?"Done":wk.tag)
      ),
      div({class:"week-focus",style:{borderColor:gn<curWeek?"#9CA3AF":wk.color,color:gn<curWeek?"#9CA3AF":wk.color}},
        "★  "+wk.focus),
      div({class:"week-rows"},
        ...wk.rows.map(([l,v])=>div({class:"week-row"},
          span({class:"week-row-lbl"},l),span({class:"week-row-val"},v)
        ))
      )
    );
  });

  const summaryCard = div({class:"summary-card"},
    div({class:"summary-title"},"📊 Full Timeline"),
    ...PHASES.map(p=>div({class:"sum-row"},
      div({class:"sum-dot",style:{background:p.color}}),
      span({class:"sum-label"},p.icon+" "+p.phase+": "+p.label+" — "+p.dates),
      span({class:"sum-time",style:{color:p.color}},p.weeks.length+" wk"+(p.weeks.length>1?"s":""))
    )),
    div({class:"sum-total"},
      span({},"Total weeks until assessment"),
      span({style:{color:"#DC2626",fontWeight:"900"}},"11 weeks")
    ),
    div({class:"sum-note"},"Assessment: July 1, 2026 · Plenty of time if the plan is followed!")
  );

  return div({class:"tab-content"},
    div({class:"roadmap-intro"},
      div({class:"roadmap-intro-title"},"🗺️ 3-Phase · 11-Week Roadmap"),
      div({class:"roadmap-intro-sub"},"Phase 1: School term  ·  Phase 2: Summer  ·  Phase 3: Pre-assessment")
    ),
    overallBar, phaseToggle, phaseHeader, ...weekCards, summaryCard
  );
}

// ════════════════════════════════════════════════════════
//  INSIGHTS TAB
// ════════════════════════════════════════════════════════
function renderStats() {
  const { doneMins, totalMins, subjectDone } = FB.weeklyStats();
  const streak = FB.calculateStreak();
  const pct    = totalMins ? Math.round((doneMins/totalMins)*100) : 0;
  const topSubj = Object.entries(subjectDone).sort((a,b)=>b[1]-a[1]).slice(0,3);

  return div({class:"stats-card"},
    div({class:"stats-title"},"📊 This Week at a Glance"),
    div({class:"stats-grid"},
      div({class:"stats-box"},div({class:"stats-num",style:{color:"#3B82F6"}},doneMins+"m"),div({class:"stats-lbl"},"Study done")),
      div({class:"stats-box"},div({class:"stats-num",style:{color:"#9CA3AF"}},(totalMins-doneMins)+"m"),div({class:"stats-lbl"},"Remaining")),
      div({class:"stats-box"},div({class:"stats-num",style:{color:streak>=3?"#F97316":"#22C55E"}},streak===0?"–":streak+"🔥"),div({class:"stats-lbl"},"Day streak")),
      div({class:"stats-box"},div({class:"stats-num",style:{color:pct===100?"#22C55E":"#14B8A6"}},pct+"%"),div({class:"stats-lbl"},"Completion")),
    ),
    div({class:"stats-bar-track"},
      div({class:"stats-bar-fill",style:{
        width:pct+"%",
        background:pct===100?"#22C55E":"linear-gradient(90deg,#3B82F6,#14B8A6)"
      }})
    ),
    topSubj.length>0 ? div({class:"stats-top"},
      div({class:"stats-top-label"},"Most studied this week:"),
      div({class:"stats-top-items"},
        ...topSubj.map(([subj,mins])=>div({class:"stats-top-item"},
          span({},EMOJI[subj]),
          span({style:{fontWeight:800,fontSize:"11px",color:COLORS[subj]}},LABELS[subj]),
          span({style:{fontSize:"10px",color:"var(--text3)"}},mins+"m")
        ))
      )
    ):null,
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
        role:"button","aria-expanded":openInsight===i?"true":"false",tabindex:"0",
        onkeydown:(e)=>{ if(e.key==="Enter"||e.key===" "){openInsight=openInsight===i?-1:i;render();} }
      },
        div({class:"insight-head-left"},
          span({style:{fontSize:"20px"},"aria-hidden":"true"},ins.emoji),
          span({class:"insight-title"},ins.title)
        ),
        span({class:"insight-arrow","aria-hidden":"true"},openInsight===i?"▲":"▼")
      ),
      openInsight===i?div({class:"insight-body"},ins.body):null
    )
  );

  const tipsCard = div({class:"tips-card"},
    div({class:"tips-title"},"👨‍👩‍👧 Parent Action Points"),
    ...TIPS.map(([heading,detail],i)=>div({class:"tip-row"},
      span({class:"tip-num"},`${i+1}.`),
      div({class:"tip-text"},el("strong",{},heading+" — "),detail)
    ))
  );

  const feedbackCard = div({class:"feedback-card"},
    div({class:"feedback-title"},"💬 Feedback & Export"),
    div({class:"feedback-actions"},
      el("a",{href:"https://github.com/santosh6785/DBPS-Study-Planner-Std-3/issues/new",
        target:"_blank",rel:"noopener noreferrer",class:"feedback-btn"},
        "🐛 Report / Suggest on GitHub"),
      btn({class:"ical-btn",onclick:exportIcal},"📅 Export key dates (.ics)")
    )
  );

  return div({class:"tab-content"},
    div({class:"insights-intro"},
      div({class:"insights-intro-title"},"💡 Insights & Stats"),
      div({class:"insights-intro-sub"},"Live progress · Textbook guidance · Parent tips")
    ),
    renderStats(), ...cards, tipsCard, feedbackCard
  );
}

// ── Onboarding ────────────────────────────────────────────
function onboardingKey() {
  return "onboardingDone_" + (FB.uid || "guest");
}
function showOnboarding() {
  if (localStorage.getItem(onboardingKey())) return;
  const overlay = el("div",{id:"onboarding-overlay",role:"dialog","aria-modal":"true",
    onclick:(e)=>{ if(e.target.id==="onboarding-overlay") closeOnboarding(); }
  },
    div({class:"onboard-card"},
      div({class:"onboard-icon"},"🎒"),
      div({class:"onboard-title"},"Welcome to Study Planner!"),
      div({class:"onboard-steps"},
        ...[
          ["📅 Schedule","Daily slots with checkboxes. Tick ✓ when done. Add 📝 notes to any slot."],
          ["🔥 Streak","Build consecutive study days — streak shown at the top."],
          ["🗺️ Roadmap","11-week plan across 3 phases. Current week highlighted 📍"],
          ["💡 Insights","Live stats, streaks, daily tips, and textbook guidance."],
          ["☁️ Cloud sync","All progress saved to your Google account — works on any device."],
          ["📅 iCal","Export key dates (phases + assessment) to any calendar app."],
        ].map(([t,d])=>div({class:"onboard-step"},
          div({class:"onboard-step-title"},t),div({class:"onboard-step-desc"},d)
        ))
      ),
      btn({class:"onboard-btn",onclick:closeOnboarding},"Got it! Let's start 🚀")
    )
  );
  document.body.appendChild(overlay);
}
function closeOnboarding() {
  document.getElementById("onboarding-overlay")?.remove();
  localStorage.setItem(onboardingKey(),"1");
}
function resetOnboarding() {
  localStorage.removeItem(onboardingKey());
  document.getElementById("onboarding-overlay")?.remove();
  showOnboarding();
}

// ── Main render ───────────────────────────────────────────
function render() {
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = "";
  main.style.opacity = "0";

  const content =
    activeTab==="schedule" ? renderSchedule() :
    activeTab==="roadmap"  ? renderRoadmap()  :
    renderInsights();

  main.appendChild(content);
  requestAnimationFrame(()=>{ main.style.transition="opacity .15s"; main.style.opacity="1"; });

  if (activeTab==="roadmap") {
    setTimeout(()=>
      document.getElementById("current-week-card")
        ?.scrollIntoView({behavior:"smooth",block:"nearest"}),250);
  }

  document.querySelectorAll(".nav-btn,.tab-btn").forEach(b=>{
    const a = b.dataset.tab===activeTab;
    b.classList.toggle("active",a);
    b.setAttribute("aria-selected",a?"true":"false");
  });

  window.scrollTo({top:0,behavior:"smooth"});
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  activePhase = currentPhaseIndex();

  // ── Tab navigation ─────────────────────────────────
  document.querySelectorAll(".tab-btn,.nav-btn").forEach(b=>{
    b.addEventListener("click",()=>{ activeTab=b.dataset.tab; render(); });
  });

  // ── Theme + help buttons ────────────────────────────
  document.getElementById("theme-btn")?.addEventListener("click",toggleTheme);
  document.getElementById("help-btn")?.addEventListener("click",resetOnboarding);

  // ── Install banner ──────────────────────────────────
  let deferredPrompt;
  const banner     = document.getElementById("install-banner");
  const dismissedAt= parseInt(localStorage.getItem("installDismissed")||"0",10);
  window.addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferredPrompt=e;
    if(Date.now()-dismissedAt>7*864e5&&banner) banner.style.display="flex";
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

  // ── Google sign-in button ───────────────────────────
  document.getElementById("google-signin-btn")?.addEventListener("click",async()=>{
    const signinBtn = document.getElementById("google-signin-btn");
    const errDiv    = document.getElementById("signin-error");
    if (!signinBtn) return;

    signinBtn.disabled = true;
    signinBtn.innerHTML = '<span class="spinner"></span> Signing in…';
    if (errDiv) errDiv.textContent = "";

    try {
      await FB.signIn();
      // onAuthChange will handle showing the app
    } catch (e) {
      signinBtn.disabled = false;
      signinBtn.innerHTML = GOOGLE_BTN_HTML;
      if (errDiv && e.code !== "auth/popup-closed-by-user") {
        errDiv.textContent =
          e.code === "auth/popup-blocked"
            ? "Popups blocked. Please allow popups for this site and try again."
            : "Sign-in failed. Please check your connection and try again.";
      }
    }
  });

  // ── Firebase auth state drives the whole UI ─────────
  FB.onAuthChange(user => {
    // Remove skeleton on first auth check
    const sk = document.getElementById("skeleton");
    if (sk) sk.style.display = "none";

    if (user) {
      // Show app, hide login
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("app-shell").style.display = "flex";
      updateHeaderUser(user);
      render();
      setTimeout(showOnboarding, 500);
    } else {
      // Show login, hide app
      document.getElementById("app-shell").style.display = "none";
      document.getElementById("login-screen").style.display = "flex";
    }
  });
});

// HTML string for the Google sign-in button content
const GOOGLE_BTN_HTML = `
  <svg viewBox="0 0 24 24" width="20" height="20" style="flex-shrink:0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84.81-.68z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  Sign in with Google
`;

// Set initial button HTML once DOM is ready
document.addEventListener("DOMContentLoaded",()=>{
  const btn = document.getElementById("google-signin-btn");
  if (btn) btn.innerHTML = GOOGLE_BTN_HTML;
});
