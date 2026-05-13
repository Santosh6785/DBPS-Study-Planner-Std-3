// ═══════════════════════════════════════════════════════
// firebase.js  ·  Study Planner Std 3  ·  v2
// Initialises Firebase, handles Google Auth + Firestore,
// and exposes window.FB — the only API app.js ever calls.
// ═══════════════════════════════════════════════════════

(function () {

  const CONFIG = {
    apiKey:            "AIzaSyC1v0aZWOyHpY8DwrEGByl0X8LTjhFfU1c",
    authDomain:        "study-planner-dbps.firebaseapp.com",
    projectId:         "study-planner-dbps",
    storageBucket:     "study-planner-dbps.firebasestorage.app",
    messagingSenderId: "104812027441",
    appId:             "1:104812027441:web:6aa07d8013e8a1bf19ff10",
  };

  // ── In-memory cache ───────────────────────────────────
  let _user         = null;
  let _progress     = {};
  let _notes        = {};
  let _authChangeCb = null;
  let _authResolved = false;

  // ── Init ──────────────────────────────────────────────
  firebase.initializeApp(CONFIG);
  const auth = firebase.auth();
  const db   = firebase.firestore();

  // Fix 1: removed deprecated synchronizeTabs:true option.
  // Fix 2: enablePersistence failure is now fully isolated —
  //        it will NEVER block auth or Firestore reads.
  db.enablePersistence()
    .then(() => console.log("[FB] Offline persistence enabled"))
    .catch(e => {
      if (e.code === "failed-precondition") {
        console.warn("[FB] Persistence disabled — multiple tabs open");
      } else if (e.code === "unimplemented") {
        console.warn("[FB] Persistence disabled — browser not supported");
      } else {
        console.warn("[FB] Persistence error:", e.code);
      }
      // App continues working — just no offline caching
    });

  // ── Auth state ─────────────────────────────────────────
  auth.onAuthStateChanged(async user => {
    console.log("[FB] Auth state:", user ? "signed in as " + user.email : "signed out");
    _user = user;

    if (user) {
      await _loadUserData(user.uid);
    } else {
      _progress = {};
      _notes    = {};
    }

    _authResolved = true;
    if (_authChangeCb) _authChangeCb(user);
  });

  // ── Load user data from Firestore ──────────────────────
  // Fix 3: 8-second timeout — app will still render even if
  //        Firestore is slow or security rules block access.
  async function _loadUserData(uid) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    );
    try {
      const base = db.collection("users").doc(uid).collection("data");
      const result = await Promise.race([
        Promise.all([base.doc("progress").get(), base.doc("notes").get()]),
        timeout,
      ]);
      const [pSnap, nSnap] = result;
      _progress = pSnap.exists  ? (pSnap.data()  || {}) : {};
      _notes    = nSnap.exists  ? (nSnap.data()  || {}) : {};
      console.log("[FB] Data loaded — progress keys:", Object.keys(_progress).length,
                  " note keys:", Object.keys(_notes).length);
    } catch (e) {
      if (e.message === "timeout") {
        console.error("[FB] Firestore load timed out — check security rules in Firebase Console");
      } else if (e.code === "permission-denied") {
        console.error("[FB] Permission denied — Firestore security rules not set correctly");
        console.error("[FB] Go to Firebase Console → Firestore → Rules and set the rules");
      } else {
        console.warn("[FB] Load failed:", e.code || e.message);
      }
      // Start with empty data — app still works, writes will retry
      _progress = {};
      _notes    = {};
    }
  }

  // ── Firestore document refs ─────────────────────────────
  function _progRef() {
    return db.collection("users").doc(_user.uid).collection("data").doc("progress");
  }
  function _notesRef() {
    return db.collection("users").doc(_user.uid).collection("data").doc("notes");
  }

  // ── Public API ─────────────────────────────────────────
  window.FB = {

    get currentUser() { return _user; },
    get uid()         { return _user ? _user.uid : null; },

    // Fires immediately if auth already resolved (fixes race condition)
    onAuthChange(cb) {
      _authChangeCb = cb;
      if (_authResolved) cb(_user);
    },

    async signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      return auth.signInWithPopup(provider);
    },

    async signOut() {
      return auth.signOut();
    },

    // ── Progress ──────────────────────────────────────────
    isSlotDone(key) {
      return _progress[key] === true;
    },

    async toggleSlot(key) {
      if (_progress[key] === true) {
        delete _progress[key];
        _progRef()
          .set({ [key]: firebase.firestore.FieldValue.delete() }, { merge: true })
          .catch(e => console.warn("[FB] toggleSlot delete error:", e.code));
      } else {
        _progress[key] = true;
        _progRef()
          .set({ [key]: true }, { merge: true })
          .catch(e => console.warn("[FB] toggleSlot set error:", e.code));
      }
    },

    // ── Notes ─────────────────────────────────────────────
    getNote(key) {
      return _notes[key] || "";
    },

    async saveNote(key, text) {
      const t = (text || "").trim();
      if (t) {
        _notes[key] = t;
        _notesRef()
          .set({ [key]: t }, { merge: true })
          .catch(e => console.warn("[FB] saveNote set error:", e.code));
      } else {
        delete _notes[key];
        _notesRef()
          .set({ [key]: firebase.firestore.FieldValue.delete() }, { merge: true })
          .catch(e => console.warn("[FB] saveNote delete error:", e.code));
      }
    },

    // ── Streak ────────────────────────────────────────────
    calculateStreak() {
      let streak = 0;
      const now = new Date();
      for (let back = 0; back < 30; back++) {
        const d  = new Date(now);
        d.setDate(d.getDate() - back);
        const ds = d.toISOString().slice(0, 10);
        const anyDone = Object.keys(_progress).some(
          k => k.startsWith(ds + "_") && _progress[k] === true
        );
        if (anyDone)       streak++;
        else if (back > 0) break;
      }
      return streak;
    },

    // ── Weekly stats ──────────────────────────────────────
    weeklyStats() {
      let doneMins = 0, totalMins = 0, subjectDone = {};
      const now      = new Date();
      const todayIdx = [6,0,1,2,3,4,5][now.getDay()];

      DAYS.forEach((day, di) => {
        const d = new Date(now);
        d.setDate(d.getDate() + (di - todayIdx));
        const ds = d.toISOString().slice(0, 10);
        let si = 0;
        day.slots.forEach(slot => {
          if (slot.brk) return;
          totalMins += slot.dur;
          if (_progress[`${ds}_${di}_${si}`] === true) {
            doneMins += slot.dur;
            subjectDone[slot.subj] = (subjectDone[slot.subj] || 0) + slot.dur;
          }
          si++;
        });
      });

      return { doneMins, totalMins, subjectDone };
    },
  };

  console.log("[FB] firebase.js loaded — waiting for auth state…");

})();
