// ═══════════════════════════════════════════════════════
// data.js  –  All static content for the Study Planner
// Edit this file to update subjects, schedule, roadmap,
// insights or tips without touching any rendering logic.
// ═══════════════════════════════════════════════════════

const COLORS = {
  english_lang:"#3B82F6", english_lit:"#A855F7", english_gram:"#6366F1",
  maths:"#14B8A6", mental_maths:"#10B981", evs:"#22C55E", moral:"#EAB308",
  gk:"#EF4444", hindi_vaideeka:"#F97316", hindi_gram:"#DC2626",
  hindi_writing:"#B45309", spelling:"#F59E0B", poem:"#EC4899",
};

const LABELS = {
  english_lang:"Active English",   english_lit:"Magnolia (Lit.)",
  english_gram:"English Grammar",  maths:"Mathematics",
  mental_maths:"Mental Maths",     evs:"EVS",
  moral:"Moral Science",           gk:"General Knowledge",
  hindi_vaideeka:"Hindi Vaideeka", hindi_gram:"Hindi Grammar",
  hindi_writing:"Hindi Writing",   spelling:"Spelling & Vocab",
  poem:"Poem Recitation",
};

const EMOJI = {
  english_lang:"📘", english_lit:"📖", english_gram:"✏️", maths:"🔢",
  mental_maths:"🧠", evs:"🌿", moral:"🌟", gk:"🌍",
  hindi_vaideeka:"📕", hindi_gram:"📝", hindi_writing:"✍️",
  spelling:"🔤", poem:"🎤",
};

const SESS = {
  s1:"Eve Slot 1", s2:"Eve Slot 2",
  morning:"Morning", afternoon:"Afternoon",
};

const DAY_COLOR = {
  Monday:"#2563EB", Tuesday:"#9333EA", Wednesday:"#059669",
  Thursday:"#EA580C", Friday:"#DC2626", Saturday:"#0891B2", Sunday:"#16A34A",
};

// ── Weekly school-day timetable (6:30 – 8:30 PM) ────────
const DAYS = [
  {
    day:"Monday", short:"Mon", emoji:"🌅",
    note:"2:30–6:30 PM fully free — rest, snack, outdoor play. Study starts sharp at 6:30 PM.",
    slots:[
      {time:"6:30",end:"7:10",subj:"english_lang",topic:"1 chapter — read aloud → all exercises in notebook",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:10",end:"7:15"},
      {time:"7:15",end:"7:55",subj:"maths",topic:"Chapter sums + practice — write every sum",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:55",end:"8:00"},
      {time:"8:00",end:"8:20",subj:"spelling",topic:"Synonyms / Antonyms — 10 words each from list",dur:20,sess:"s2"},
      {time:"8:20",end:"8:30",subj:"poem",topic:"Recite 1–2 poems aloud with expression — record on phone!",dur:10,sess:"s2"},
    ],
  },
  {
    day:"Tuesday", short:"Tue", emoji:"🌞",
    note:"Magnolia Part A today. Part B continues Wednesday — same unit, two days.",
    slots:[
      {time:"6:30",end:"7:10",subj:"english_lit",topic:"Story reading + Comprehension A & B in notebook",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:10",end:"7:15"},
      {time:"7:15",end:"7:45",subj:"hindi_vaideeka",topic:"1 lesson — read aloud + answer all questions",dur:30,sess:"s1"},
      {brk:true,time:"7:45",end:"7:50"},
      {time:"7:50",end:"8:10",subj:"gk",topic:"1 chapter — all labels, matches, activities completed",dur:20,sess:"s2"},
      {time:"8:10",end:"8:30",subj:"mental_maths",topic:"Call Out drill — tables + quick sums, parent times it",dur:20,sess:"s2"},
    ],
  },
  {
    day:"Wednesday", short:"Wed", emoji:"⭐",
    note:"Magnolia Part B (same unit as Tuesday). English Grammar in last slot — do not skip.",
    slots:[
      {time:"6:30",end:"7:10",subj:"english_lit",topic:"Think & Answer + Grammar + Vocabulary + Writing (same unit)",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:10",end:"7:15"},
      {time:"7:15",end:"7:55",subj:"maths",topic:"Roman Numerals I–X + Addition / Subtraction revision",dur:40,sess:"s1"},
      {brk:true,time:"7:55",end:"8:00"},
      {time:"8:00",end:"8:15",subj:"hindi_gram",topic:"1 Meru lesson — oral first, then written",dur:15,sess:"s2"},
      {time:"8:15",end:"8:30",subj:"english_gram",topic:"1 chapter — Sentence / Subject & Predicate / Noun etc.",dur:15,sess:"s2",key:true},
    ],
  },
  {
    day:"Thursday", short:"Thu", emoji:"🌈",
    note:"EVS: use Let's Recall mind map + fill Check Points as you read. Hindi essays last.",
    slots:[
      {time:"6:30",end:"7:10",subj:"english_lang",topic:"Next chapter — read aloud → all exercises",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:10",end:"7:15"},
      {time:"7:15",end:"7:50",subj:"evs",topic:"1 chapter: read concept → Check Point → oral Q&A with parent",dur:35,sess:"s1",key:true},
      {brk:true,time:"7:50",end:"7:55"},
      {time:"7:55",end:"8:10",subj:"moral",topic:"1 chapter — read + discuss values",dur:15,sess:"s2"},
      {time:"8:10",end:"8:30",subj:"hindi_writing",topic:"Essay / Paragraph writing (Golhar / Ganga / Grishma Ritu)",dur:20,sess:"s2"},
    ],
  },
  {
    day:"Friday", short:"Fri", emoji:"🎉",
    note:"EVS full Exercise section (all written answers) + Maths. Spelling closes the week.",
    slots:[
      {time:"6:30",end:"7:10",subj:"evs",topic:"Next chapter: full Exercise section — write every answer",dur:40,sess:"s1",key:true},
      {brk:true,time:"7:10",end:"7:15"},
      {time:"7:15",end:"7:55",subj:"maths",topic:"Subtraction + mixed addition-subtraction practice",dur:40,sess:"s1"},
      {brk:true,time:"7:55",end:"8:00"},
      {time:"8:00",end:"8:15",subj:"hindi_gram",topic:"Matras / Sanyukt Vyanjan / Ginti 1–50 oral drill",dur:15,sess:"s2"},
      {time:"8:15",end:"8:30",subj:"spelling",topic:"Homophones · Compound words · Prefixes & Suffixes",dur:15,sess:"s2"},
    ],
  },
  {
    day:"Saturday", short:"Sat", emoji:"🔁",
    note:"No school! Morning: revision + Shrutilekh + Grammar. Afternoon: Maths + GK + All 5 Poems.",
    slots:[
      {time:"9:00",end:"9:40",subj:"english_lang",topic:"Revision of week's chapters — oral first, then written",dur:40,sess:"morning",key:true},
      {brk:true,time:"9:40",end:"9:45"},
      {time:"9:45",end:"10:15",subj:"hindi_vaideeka",topic:"⭐ SHRUTILEKH — parent reads aloud, child writes, correct immediately",dur:30,sess:"morning",key:true},
      {brk:true,time:"10:15",end:"10:20"},
      {time:"10:20",end:"10:45",subj:"english_gram",topic:"1 chapter + Essay writing practice",dur:25,sess:"morning"},
      {time:"10:45",end:"11:00",subj:"spelling",topic:"Spelling list revision + Vocabulary topics",dur:15,sess:"morning"},
      {time:"3:30",end:"4:00",subj:"maths",topic:"Maths revision + Chapter Test practice",dur:30,sess:"afternoon"},
      {time:"4:00",end:"4:15",subj:"mental_maths",topic:"Speed drill — timed sums, parent times every table",dur:15,sess:"afternoon"},
      {time:"4:15",end:"4:35",subj:"gk",topic:"1 chapter — activity-based",dur:20,sess:"afternoon"},
      {time:"4:35",end:"5:00",subj:"poem",topic:"⭐ All 5 poems — full run-through with expression every Saturday",dur:25,sess:"afternoon",key:true},
    ],
  },
  {
    day:"Sunday", short:"Sun", emoji:"🌻",
    note:"Light revision 9–10:45 AM only. Afternoon FULLY FREE every week without exception.",
    slots:[
      {time:"9:00",end:"9:30",subj:"evs",topic:"Oral revision — 2 chapters using Let's Recall mind map",dur:30,sess:"morning"},
      {brk:true,time:"9:30",end:"9:35"},
      {time:"9:35",end:"10:05",subj:"hindi_vaideeka",topic:"Oral re-reading + Q&A — 1 lesson",dur:30,sess:"morning"},
      {brk:true,time:"10:05",end:"10:10"},
      {time:"10:10",end:"10:30",subj:"english_gram",topic:"Chapter revision / Essay draft",dur:20,sess:"morning"},
      {time:"10:30",end:"10:45",subj:"poem",topic:"Any 2 poems — recitation with full expression",dur:15,sess:"morning"},
    ],
  },
];

// ── Summer vacation full-day schedule (May 17 – Jun 21) ─
const SUMMER_SLOTS = [
  {time:"8:00 AM",end:"8:30 AM",icon:"🥣",label:"Breakfast + Morning routine",color:"#22C55E",type:"routine"},
  {time:"8:30 AM",end:"9:10 AM",icon:"📘",label:"Active English / Magnolia revision",color:"#3B82F6",type:"study",
   note:"40 min — read chapters aloud, answer exercises without looking at notes"},
  {time:"9:10 AM",end:"9:50 AM",icon:"🔢",label:"Mathematics",color:"#14B8A6",type:"study",
   note:"40 min — Chapter Test practice + HOTS questions, time every set of sums"},
  {time:"9:50 AM",end:"10:20 AM",icon:"⚽",label:"Snack + Free play",color:"#10B981",type:"play"},
  {time:"10:20 AM",end:"11:00 AM",icon:"🌿",label:"EVS revision",color:"#22C55E",type:"study",
   note:"40 min — full Q&A using Let's Recall mind maps. Case Study questions from Week 8+"},
  {time:"11:00 AM",end:"11:05 AM",icon:"☕",label:"Water break",color:"#9CA3AF",type:"break"},
  {time:"11:05 AM",end:"11:35 AM",icon:"📕",label:"Hindi Vaideeka + Shrutilekh",color:"#F97316",type:"study",
   note:"30 min — oral reading Mon/Wed/Fri · Shrutilekh (parent dictates) Tue/Thu/Sat"},
  {time:"11:35 AM",end:"12:05 PM",icon:"✏️",label:"English Grammar + Essays",color:"#6366F1",type:"study",
   note:"30 min — chapter revision. Essays: Earth Day (clues), India of My Dreams (no clues)"},
  {time:"12:05 PM",end:"1:30 PM",icon:"⚽",label:"Outdoor play",color:"#0369A1",type:"play",
   note:"1.5 hrs — cricket, cycling, park. Full outdoor time."},
  {time:"1:30 PM",end:"2:15 PM",icon:"🍽️",label:"Lunch + Rest",color:"#22C55E",type:"routine"},
  {time:"2:15 PM",end:"3:45 PM",icon:"😴",label:"Nap / Rest",color:"#EAB308",type:"rest",
   note:"Mandatory — brain consolidates morning learning during rest."},
  {time:"3:45 PM",end:"4:15 PM",icon:"🌍",label:"General Knowledge",color:"#EF4444",type:"study",
   note:"30 min — rapid quiz all 7 chapters from Week 7 onwards"},
  {time:"4:15 PM",end:"4:20 PM",icon:"☕",label:"Break",color:"#9CA3AF",type:"break"},
  {time:"4:20 PM",end:"4:45 PM",icon:"📝",label:"Hindi Grammar (Meru) + Writing",color:"#DC2626",type:"study",
   note:"25 min — Meru lessons revision + Paragraph / Essay writing"},
  {time:"4:45 PM",end:"4:55 PM",icon:"🎤",label:"Poem recitation",color:"#EC4899",type:"study",
   note:"10 min — all 5 poems full run-through with expression. Record on phone."},
  {time:"4:55 PM",end:"6:30 PM",icon:"⚽",label:"Outdoor play + Free time",color:"#0369A1",type:"play"},
  {time:"6:30 PM",end:"7:00 PM",icon:"🧠",label:"Mental Maths oral drill",color:"#10B981",type:"study",
   note:"30 min — tables 2–15, call-out, mixed sums. Parent times each table."},
  {time:"7:00 PM",end:"8:30 PM",icon:"📺",label:"Family time + Dinner",color:"#22C55E",type:"routine"},
  {time:"9:30 PM",end:"Bedtime",icon:"😴",label:"Sleep — 8–9 hrs essential",color:"#1a1a2e",type:"rest"},
];

// ── 3-Phase 11-Week Roadmap ──────────────────────────────
const PHASES = [
  {
    phase:"Phase 1", label:"School Term", dates:"Apr 13 – May 16",
    color:"#1a1a2e", icon:"🏫",
    note:"Weekday study: 6:30–8:30 PM  ·  Sat & Sun as per weekend schedule",
    weeks:[
      {
        week:"Week 1  (Apr 13–19)", color:"#2563EB", tag:"New Content",
        focus:"Establish the routine. Complete Magnolia Unit 1 and EVS Ch 1 & 2.",
        rows:[
          ["📘 Active English","Ch 1 (shall/like) — Mon  |  Ch 2 (same as/different from) — Thu"],
          ["📖 Magnolia","Unit 1 – Betty's Flower Shop  (Tue: Story+Comp A&B  →  Wed: Think&Answer+Writing)"],
          ["✏️ Eng Grammar","Ch 1 – Sentence (Wed eve)  |  Ch 2 – Subject & Predicate (Sat AM)"],
          ["🔢 Maths","Ch 1 – 3 & 4-digit numbers, Place Value, Comparing, Roman Numerals I–X"],
          ["📕 Hindi","Vaideeka Lesson 1 (Chand Ka Kurta) + Meru Lessons 1 & 2  |  Sat: Shrutilekh"],
          ["🌿 EVS","Ch 1 – Parts of Our Body (Thu)  |  Ch 2 – Keeping Safe & Healthy (Fri)"],
          ["🌍 GK","Ch 3 – Mountain Ranges  (Ch 1 & 2 already done ✓)"],
          ["🎤 Poems","Matilda Jane (Rhyme 2)  |  Spellings: Synonyms, Antonyms"],
        ],
      },
      {
        week:"Week 2  (Apr 20–26)", color:"#9333EA", tag:"New Content",
        focus:"Magnolia Unit 2 complete. Addition chapter — all exercises written.",
        rows:[
          ["📘 Active English","Ch 3 (may: Possibility) — Mon  |  Ch 4 (often/never) — Thu"],
          ["📖 Magnolia","Unit 2 – Tenali Rama  (Tue: Story+Comp  →  Wed: Grammar+Vocab+Writing)"],
          ["✏️ Eng Grammar","Ch 3 – Noun (Wed eve)  |  Ch 4 – Noun: Number (Sat AM)"],
          ["🔢 Maths","Ch 2 – Addition: 3-digit carry + 4-digit + properties + story problems"],
          ["📕 Hindi","Vaideeka Lesson 2 (Taraju) + Meru Lessons 3 & 4  |  Sat: Shrutilekh Lesson 2"],
          ["🌿 EVS","Ch 3 – The Food We Eat (Thu)  |  Ch 4 – Home Sweet Home (Fri)"],
          ["🌍 GK","Ch 4 – Unusual Animals (Tue)  |  Ch 5 – Technology in Everyday Life (Sat PM)"],
          ["🎤 Poems","The Cupboard (Rhyme 4)  |  Spellings: Rhyming words, Analogies, Similes"],
        ],
      },
      {
        week:"Week 3  (Apr 27 – May 3)", color:"#DC2626", tag:"New Content",
        focus:"⚠️ Complete ALL new chapters this week. Zero new chapters from Week 4 onward.",
        rows:[
          ["📘 Active English","Ch 5 (since/for/ago) — Mon  |  Ch 6 (have to/has to/had to) — Thu"],
          ["📖 Magnolia","Unit 3 – Mr Jeremy Fisher (Tue+Wed)  |  Poem 'Parrots' comprehension + notes"],
          ["✏️ Eng Grammar","Ch 5 – Noun: Gender (Wed eve)  |  Essay: Earth Day WITH clues (Sat AM)"],
          ["🔢 Maths","Ch 3 – Subtraction: with/without borrowing + 4-digit + combined + story problems"],
          ["📕 Hindi","Vaideeka Lessons 3 & 4 + Meru Lesson 13 (chitra-pathan, anucched) + Ginti 1–50"],
          ["🌿 EVS","Ch 5 – Clothes We Wear (Thu)  |  Ch 6 – Family (Fri)"],
          ["🌍 GK","Ch 6 – Amazing Trees (Tue)  |  Ch 7 – Things with Wings (Sat PM)"],
          ["🎤 Poems","I Met A Toad + The Duck + Parrots — all memorised  |  Compound words, Homophones"],
        ],
      },
      {
        week:"Week 4  (May 4–10)", color:"#EA580C", tag:"1st Revision",
        focus:"First full revision pass. Every subject reviewed. Chapter Tests started.",
        rows:[
          ["📘 Active English","Revision pages 7–14 (all 6 ch) — timed oral mock, 1 chapter/day"],
          ["📖 Magnolia","Re-read all 3 units. Parent Q&A. Re-do Think & Answer written answers."],
          ["✏️ Eng Grammar","Revise all 5 chapters  |  Essay: India of My Dreams (NO clues)  |  Passage practice"],
          ["🔢 Maths","Ch 1+2+3 Chapter Test pages. HOTS questions (bonus). Mental Maths speed tests."],
          ["📕 Hindi","All 4 lessons oral + written  |  Shrutilekh for Lessons 2, 3, 4 (Sat)"],
          ["🌿 EVS","All 6 chapters oral Q&A  |  Use Let's Recall mind maps  |  Case Study questions"],
          ["🌍 GK","All 7 chapters rapid oral quiz — 1 minute per chapter"],
          ["🎤 Poems","All 5 poems polished with expression  |  Full spelling & vocabulary review"],
        ],
      },
      {
        week:"Week 5  (May 11–16)", color:"#0891B2", tag:"Deep Revision",
        focus:"Identify and fix weak areas before summer vacation begins.",
        rows:[
          ["📘 Active English","Written answers to all exercise sections — timed, no help"],
          ["📖 Magnolia","Write all comprehension answers from memory. Check against book."],
          ["✏️ Eng Grammar","Both essays written under time. Passage exercise. MCQ speed practice."],
          ["🔢 Maths","Timed 20-sum test daily. Story problems. Redo any chapter with errors."],
          ["📕 Hindi","Focus on weak lessons. Shrutilekh every day this week. Essay timed."],
          ["🌿 EVS","Write full Exercise section for 3 chapters — no book. Then check."],
          ["🌍 GK","Make a cheat-sheet of key facts per chapter. Test from the sheet."],
          ["🎤 Poems","Record all 5 poems on phone. Note expression gaps. Fix before vacation."],
        ],
      },
    ],
  },
  {
    phase:"Phase 2", label:"Summer Vacation", dates:"May 17 – Jun 21",
    color:"#EA580C", icon:"☀️",
    note:"Full day at home · Morning + Afternoon study blocks · Long free time midday",
    weeks:[
      {
        week:"Week 6  (May 17–23)", color:"#F97316", tag:"Vacation Wk 1",
        focus:"Fresh start after school. Relaxed pace — rebuild momentum gently.",
        rows:[
          ["📘 Active English","Oral revision of all 6 chapters. Focus on Ch 5 & 6 (most complex)."],
          ["📖 Magnolia","Full re-read of all 3 units aloud. Parent asks comprehension questions orally."],
          ["✏️ Eng Grammar","Revise all 5 chapters. Begin both essays again from scratch (no clues)."],
          ["🔢 Maths","20-sum timed test daily. Target: all 3 chapters without errors."],
          ["📕 Hindi","Shrutilekh every Tue/Thu/Sat. Re-read all 4 Vaideeka lessons with expression."],
          ["🌿 EVS","Ch 1–3 thorough oral Q&A. Draw Let's Recall mind maps from memory."],
          ["🌍 GK","Chapters 3–7 complete oral revision. Make one fact card per chapter."],
          ["🎤 Poems","Daily 10-min recitation. Record and compare week-on-week improvement."],
        ],
      },
      {
        week:"Week 7  (May 24–30)", color:"#EF4444", tag:"Vacation Wk 2",
        focus:"Written practice round — everything written, nothing oral-only.",
        rows:[
          ["📘 Active English","Write answers to ALL exercise sections — timed, closed book."],
          ["📖 Magnolia","Write all Think & Answer + Vocabulary sections. Check every answer."],
          ["✏️ Eng Grammar","Full written test of all 5 chapters. Both essays under 20-min time limit."],
          ["🔢 Maths","Chapter Tests as full exam papers. HOTS questions. Verify every answer."],
          ["📕 Hindi","Written answers to all Vaideeka questions. Ginti 1–50 written (words + digits)."],
          ["🌿 EVS","Write full Exercise section for all 6 chapters — no book. Then check."],
          ["🌍 GK","Written answers to all GK chapter questions — activity sections included."],
          ["🎤 Poems","Write out the notes for Rhymes 5 & 6 from Rhythm Book from memory."],
        ],
      },
      {
        week:"Week 8  (May 31 – Jun 6)", color:"#9333EA", tag:"Vacation Wk 3",
        focus:"Error correction week — fix every mistake found in Week 7 written practice.",
        rows:[
          ["📘 Active English","Re-do any exercises with errors. Revision pages 7–14 timed oral mock."],
          ["📖 Magnolia","Re-do all incorrect answers. Speaking activities — act out the stories!"],
          ["✏️ Eng Grammar","Re-do all incorrect questions. Passage fill-in-blank practice daily."],
          ["🔢 Maths","Target weak chapter. Story problems — 5 per day, show full working."],
          ["📕 Hindi","Fix Shrutilekh errors. Re-write Meru Lesson 13 (chitra-pathan) exercises."],
          ["🌿 EVS","Case Studies: Helen Keller (Ch 1), Feeding India (Ch 3), Green Buildings (Ch 4)."],
          ["🌍 GK","Re-read Ch 3–7 once more. Answer all Thinking questions in each chapter."],
          ["🎤 Poems","Video-record all 5 poems. Watch together. Improve expression and pause."],
        ],
      },
      {
        week:"Week 9  (Jun 7–13)", color:"#16A34A", tag:"Vacation Wk 4",
        focus:"Mock test week — simulate exam conditions every day.",
        rows:[
          ["📘 Active English","Daily: pick 1 chapter, answer all questions from memory in 25 min."],
          ["📖 Magnolia","Daily: pick 1 unit, write full comprehension in 30 min — closed book."],
          ["✏️ Eng Grammar","Daily grammar test: 10 MCQ + 5 fill blanks + 1 essay (no clues)."],
          ["🔢 Maths","Daily: 25-sum mixed test (Ch 1+2+3). All story problems. Target 30 min."],
          ["📕 Hindi","Alternate: Shrutilekh day / Written answers day. Essay writing timed daily."],
          ["🌿 EVS","Daily: pick 2 chapters, answer all Exercise questions orally then written."],
          ["🌍 GK","Rapid fire quiz: parent asks random questions from all 7 chapters."],
          ["🎤 Poems","Full 5-poem recitation daily — treat it like a performance each time."],
        ],
      },
      {
        week:"Week 10  (Jun 14–21)", color:"#0891B2", tag:"Vacation Wk 5",
        focus:"Final vacation week — consolidate confidence. No new topics, only polish.",
        rows:[
          ["📘 Active English","Revision pages 7–14 as full timed mock — 3 times this week."],
          ["📖 Magnolia","Full paper: all 3 units comprehension written, 90-min timed sitting."],
          ["✏️ Eng Grammar","Full grammar paper daily: all 5 chapters + both essays. Self-mark."],
          ["🔢 Maths","Full Maths paper daily: Ch 1+2+3 mixed. 40 sums in 40 min target."],
          ["📕 Hindi","Full Hindi sitting: Shrutilekh + written Q&A + essay + Ginti. 1 hr."],
          ["🌿 EVS","Full EVS paper: all 6 chapters written Q&A from memory. Self-mark."],
          ["🌍 GK","Rapid oral quiz — all 7 chapters under 7 minutes total."],
          ["🎤 Poems","Record final polished recitation of all 5 poems. Keep this recording!"],
        ],
      },
    ],
  },
  {
    phase:"Phase 3", label:"Pre-Assessment", dates:"Jun 22 – Jun 30",
    color:"#DC2626", icon:"🎯",
    note:"School resumes · Back to 6:30–8:30 PM weekday study · Final sprint",
    weeks:[
      {
        week:"Week 11  (Jun 22–30)", color:"#DC2626", tag:"Final Sprint",
        focus:"⭐ Assessment is July 1. This week is pure exam simulation — every day.",
        rows:[
          ["📘 Active English","Timed written test daily. Revision pages as mock paper. No help."],
          ["📖 Magnolia","Write all comprehension + vocab + writing exercises — closed book timed."],
          ["✏️ Eng Grammar","Full timed Grammar paper every alternate day. Both essays. Passage."],
          ["🔢 Maths","Full timed Maths paper daily. All Chapter Tests. Mental Maths call-out."],
          ["📕 Hindi","Full Shrutilekh + written Q&A + essay under time. Ginti speed oral."],
          ["🌿 EVS","Full written paper all 6 chapters under 45 min. Self-mark and review."],
          ["🌍 GK","All 7 chapters rapid oral review — 1 min per chapter — daily."],
          ["🎤 Poems","Final recitation in front of family on Jun 29. Spellings dictation Jun 30."],
        ],
      },
    ],
  },
];

// ── Insights ─────────────────────────────────────────────
const INSIGHTS = [
  {emoji:"📅",color:"#2563EB",title:"Revised Timeline — Assessment Is July 1",
   body:"The original plan assumed a May assessment. With July 1 confirmed, there are 11 full weeks. Phase 1 (school term Apr 13–May 16): complete all new chapters + first revision. Phase 2 (summer vacation May 17–Jun 21): deep revision + mock tests with full-day schedule. Phase 3 (Jun 22–30): final sprint. This is a very comfortable runway — no need to rush."},
  {emoji:"☀️",color:"#EA580C",title:"Summer Vacation: Full-Day Schedule Kicks In",
   body:"From May 17, children are home all day. The vacation daily plan: morning study 8:30 AM–12:05 PM (Active English, Maths, EVS, Hindi, Grammar), long midday break with lunch and nap 12:05–3:45 PM, afternoon study 3:45–4:55 PM (GK, Hindi Grammar, Poems), extended outdoor play, and 30-min Mental Maths drill at 6:30 PM. Total ~4.5 hrs/day spread across the day — never more than 40 min per sitting."},
  {emoji:"🎯",color:"#DC2626",title:"Don't Waste the Vacation — It's Your Biggest Advantage",
   body:"5.5 weeks of full days at home is a rare gift. Most children do nothing in summer and panic in June. If the vacation plan is followed, your child will have done 4–5 full rounds of revision of every subject before school reopens on June 22. Week 11 (Jun 22–30) then becomes calm confidence-building — not a panic session."},
  {emoji:"⚠️",color:"#EF4444",title:"Active English: 40 Min Per Chapter",
   body:"Each chapter has 10–19 exercises. The Revision section (pp. 7–14) covers all 6 chapters — use as a timed oral mock in Weeks 4, 6, and 10. Ch 5 (since/for/ago) and Ch 6 (have to/has to/had to) are the most complex — always give the full 40 min."},
  {emoji:"📖",color:"#A855F7",title:"Magnolia: 2 Days Per Unit During School Term",
   body:"Tuesday: Story + Comp A & B. Wednesday: Think & Answer + Grammar + Vocab + Writing. During vacation: re-read each unit in one sitting (60–70 min), then answer everything. 'Parrots' poem needs both comprehension answers AND recitation with expression."},
  {emoji:"✏️",color:"#6366F1",title:"English Grammar: Scheduled Every Week",
   body:"5 chapters covered Wed evening (15 min) + Sat morning (25 min) + Sun morning (20 min) during school term. During vacation: 30-min daily grammar session. Earth Day essay first (with clues), India of My Dreams second (no clues, timed). Passage fill-in-blank practice from Week 7 onwards."},
  {emoji:"🌿",color:"#22C55E",title:"EVS: 4 Mini-Tests Built Into Each Chapter",
   body:"Planet Pals 3 has Check Points (mid-lesson fill-in), Activities, Oral Questions, and full Exercise section. During vacation, target one full chapter written from memory per day from Week 7. Case Studies — Helen Keller (Ch 1), Feeding India (Ch 3), Green Buildings (Ch 4) — are excellent for critical thinking in Weeks 8–10."},
  {emoji:"🔢",color:"#14B8A6",title:"Maths: Daily Timed Tests From Week 4",
   body:"Chapter Tests at end of Ch 1, 2, 3 are ready-made exam papers — use from Week 4. During vacation, target 25–40 mixed sums daily under time. HOTS questions from Week 4 onwards. Roman Numerals I–X is a quick single-session topic. Mental Maths should be oral and timed every single day of vacation."},
  {emoji:"📕",color:"#F97316",title:"Hindi: Shrutilekh 3× Per Week During Vacation",
   body:"During school term: Shrutilekh every Saturday morning. During vacation: parent dictates on Tuesday, Thursday, and Saturday — 10 words each time. Meru Lesson 13 (chitra-pathan, anucched-lekhan) needs the Thursday writing slot during school term and daily vacation morning. Ginti 1–50 oral drill — target 2 minutes for all 50 by Week 9."},
  {emoji:"🎤",color:"#EC4899",title:"Poems: Record Weekly — Track Improvement",
   body:"5 required: Matilda Jane (Rhyme 2), The Cupboard (Rhyme 4), I Met A Toad (Rhyme 5), The Duck (Rhyme 6), Parrots (Magnolia). Rhymes 5 & 6 also need Notes from the Rhythm Book. Record on phone every Saturday. Compare Week 1 to Week 10 — the improvement will be dramatic and motivating."},
  {emoji:"✅",color:"#22C55E",title:"GK Ch 1 & 2 Already Done!",
   body:"BrainBytes Ch 1 (Solar System) and Ch 2 (Eating Healthy) completed on 6/4/26. Only Ch 3–7 remain — 5 chapters × 20 min. During vacation, make one fact card per chapter and do rapid-fire quizzes. All 7 chapters should be answerable orally in under 7 minutes total by Week 10."},
];

// ── Parent tips ───────────────────────────────────────────
const TIPS = [
  ["6:30 PM start — every school day","Same time daily builds the habit faster than any reward system."],
  ["Don't skip vacation study","5.5 weeks of full-day revision is the biggest advantage. Even 3 hrs/day changes everything."],
  ["Active English — oral then write","Read exercises aloud together. Child answers orally first, then writes."],
  ["Magnolia — close the book","You ask the questions. Child answers without looking at the text."],
  ["Shrutilekh — 3× per week in vacation","Tue/Thu/Sat — dictate 10 words, child writes, correct immediately together."],
  ["EVS — use the mind map","Cover one branch at a time. Child fills it from memory. Do this weekly."],
  ["Maths — time every sitting","10 sums in 5 min to start. Target 40 sums in 40 min by Week 10."],
  ["Record poems every Saturday","Hearing themselves week-over-week improves expression fast and motivates."],
  ["Week 11 is calm, not panic","If vacation plan is followed, Jun 22–30 is revision — not catching up."],
];
