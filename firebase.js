// ═══════════════════════════════════════════════════════
// firebase.js  ·  Study Planner Std 3
// Initialises Firebase, handles Google Auth + Firestore,
// and exposes window.FB — the only API app.js ever calls.
// ═══════════════════════════════════════════════════════

(function () {

  // ── Config ─────────────────────────────────────────────
  const CONFIG = {
    apiKey:            "AIzaSyC1v0aZWOyHpY8DwrEGByl0X8LTjhFfU1c",
    authDomain:        "study-planner-dbps.firebaseapp.com",
    projectId:         "study-planner-dbps",
    storageBucket:     "study-planner-dbps.firebasestorage.app",
    messagingSenderId: "104812027441",
    appId:             "1:104812027441:web:6aa07d8013e8a1bf19ff10",
  };

  // ── In-memory cache (avoids repeated Firestore reads) ──
  let _user         = null;
  let _progress     = {};   // { "YYYY-MM-DD_dayIdx_slotIdx": true }
  let _notes        = {};   // { "dayIdx_slotIdx": "text" }
  let _authChangeCb = null;
  let _authResolved = false; // true once first onAuthStateChanged has fired

  // ── Init ──────────────────────────────────────────────
  firebase.initializeApp(CONFIG);
  const auth = firebase.auth();
  const db   = firebase.firestore();

  // Enable offline persistence — app works without internet after first login.
  db.enablePersistence({ synchronizeTabs: true })
    .catch(e => console.warn("[FB] Persistence:", e.code));

  // ── Auth listener ─────────────────────────────────────
  auth.onAuthStateChanged(async user => {
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

  // ── Private: load from Firestore ──────────────────────
  async function _loadUserData(uid) {
    try {
      const base = db.collection("users").doc(uid).collection("data");
      const [pSnap, nSnap] = await Promise.all([
        base.doc("progress").get(),
        base.doc("notes").get(),
      ]);
      _progress = pSnap.exists ? (pSnap.data() || {}) : {};
      _notes    = nSnap.exists ? (nSnap.data() || {}) : {};
    } catch (e) {
      console.warn("[FB] Load failed (offline?):", e.message);
    }
  }

  function _progRef()  {
    return db.collection("users").doc(_user.uid).collection("data").doc("progress");
  }
  function _notesRef() {
    return db.collection("users").doc(_user.uid).collection("data").doc("notes");
  }

  // ── Public API ─────────────────────────────────────────
  window.FB = {

    get currentUser() { return _user; },
    get uid()         { return _user ? _user.uid : null; },

    // If auth already resolved before app.js registered this callback, fire now.
    onAuthChange(cb) {
      _authChangeCb = cb;
      if (_authResolved) cb(_user);
    },

    async signIn() {
      const p = new firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(p);
    },

    async signOut() {
      return auth.signOut();
    },

    // ── Progress ────────────────────────────────────────
    // Key: "YYYY-MM-DD_dayIdx_slotIdx"
    isSlotDone(key) {
      return _progress[key] === true;
    },

    // Cache updated synchronously → UI re-renders instantly.
    // Firestore write happens in background.
    async toggleSlot(key) {
      if (_progress[key] === true) {
        delete _progress[key];
        _progRef().set(
          { [key]: firebase.firestore.FieldValue.delete() }, { merge: true }
        ).catch(e => console.warn("[FB] toggle error:", e));
      } else {
        _progress[key] = true;
        _progRef().set({ [key]: true }, { merge: true })
          .catch(e => console.warn("[FB] toggle error:", e));
      }
    },

    // ── Notes ───────────────────────────────────────────
    // Key: "dayIdx_slotIdx"
    getNote(key) {
      return _notes[key] || "";
    },

    async saveNote(key, text) {
      const t = (text || "").trim();
      if (t) {
        _notes[key] = t;
        _notesRef().set({ [key]: t }, { merge: true })
          .catch(e => console.warn("[FB] saveNote error:", e));
      } else {
        delete _notes[key];
        _notesRef().set(
          { [key]: firebase.firestore.FieldValue.delete() }, { merge: true }
        ).catch(e => console.warn("[FB] saveNote error:", e));
      }
    },

    // ── Streak ──────────────────────────────────────────
    calculateStreak() {
      let streak = 0;
      const now  = new Date();
      for (let back = 0; back < 30; back++) {
        const d  = new Date(now);
        d.setDate(d.getDate() - back);
        const ds = d.toISOString().slice(0, 10);
        const any = Object.keys(_progress).some(
          k => k.startsWith(ds + "_") && _progress[k] === true
        );
        if (any)           streak++;
        else if (back > 0) break;
      }
      return streak;
    },

    // ── Weekly stats ────────────────────────────────────
    // Needs DAYS (data.js) to be in global scope — it always is.
    weeklyStats() {
      let doneMins = 0, totalMins = 0, subjectDone = {};
      const todayJs  = new Date();
      const todayIdx = [6,0,1,2,3,4,5][todayJs.getDay()];

      DAYS.forEach((day, di) => {
        const d = new Date(todayJs);
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

})();
