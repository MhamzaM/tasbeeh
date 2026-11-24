/*
 * Tasbeeh — a free dhikr counter with no ads.
 * Everything is stored on the device (localStorage). The Android app adds volume-button
 * counting, vibration, keep-screen-on and dim brightness through window.TasbeehNative.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const native = window.TasbeehNative || null;

  // ------------------------------------------------------------ content

  const PRESETS = [
    { id: "subhanallah", ar: "سُبْحَانَ اللّٰهِ", en: "SubhanAllah", ur: "سبحان اللہ", men: "Glory be to Allah", mur: "اللہ پاک ہے", target: 33 },
    { id: "alhamdulillah", ar: "اَلْحَمْدُ لِلّٰهِ", en: "Alhamdulillah", ur: "الحمدللہ", men: "All praise is for Allah", mur: "تمام تعریفیں اللہ کے لیے ہیں", target: 33 },
    { id: "allahuakbar", ar: "اَللّٰهُ أَكْبَرُ", en: "Allahu Akbar", ur: "اللہ اکبر", men: "Allah is the Greatest", mur: "اللہ سب سے بڑا ہے", target: 34 },
    { id: "astaghfirullah", ar: "أَسْتَغْفِرُ اللّٰهَ", en: "Astaghfirullah", ur: "استغفراللہ", men: "I seek Allah's forgiveness", mur: "میں اللہ سے معافی مانگتا ہوں", target: 100 },
    { id: "tahleel", ar: "لَا إِلٰهَ إِلَّا اللّٰهُ", en: "La ilaha illallah", ur: "لا الہ الا اللہ", men: "There is no god but Allah", mur: "اللہ کے سوا کوئی معبود نہیں", target: 100 },
    { id: "subhanallahiwabihamdihi", ar: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ", en: "SubhanAllahi wa bihamdihi", ur: "سبحان اللہ وبحمدہ", men: "Glory be to Allah, and all praise to Him", mur: "اللہ پاک ہے اپنی تعریف کے ساتھ", target: 100 },
    { id: "hawqala", ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ", en: "La hawla wa la quwwata illa billah", ur: "لا حول ولا قوۃ الا باللہ", men: "There is no power or strength except with Allah", mur: "اللہ کے بغیر نہ کوئی طاقت ہے نہ قوت", target: 100 },
    { id: "durood", ar: "اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ", en: "Durood Shareef", ur: "درود شریف", men: "O Allah, send blessings upon Muhammad ﷺ", mur: "اے اللہ! محمد ﷺ پر رحمت نازل فرما", target: 100 },
  ];

  // Tasbeeh-e-Fatima: counted after each prayer, one step after another
  const SEQUENCES = [
    { id: "fatima", en: "Tasbeeh-e-Fatima", ur: "تسبیحِ فاطمہ", steps: [["subhanallah", 33], ["alhamdulillah", 33], ["allahuakbar", 34]] },
  ];

  const T = {
    en: {
      history: "History", settings: "Settings", close: "Close", undo: "Undo", dim: "Dim", holdReset: "Hold to reset",
      dimHint: "Tap anywhere to count", exitDim: "Exit dim mode", chooseDhikr: "Choose a dhikr", addDhikr: "Add your own",
      name: "Name", target: "Target", add: "Add", of: (t) => "of " + t, round: (r) => "Round " + r,
      hint: "Tap anywhere to count", hintVol: "Tap anywhere, or press a volume button", hintKeys: "Tap anywhere, or press the space bar",
      targetReached: (n, t) => n + ": " + t + " done", seqDone: "Tasbeeh-e-Fatima complete", resetDone: "Counter reset",
      today: "Today", streak: "Day streak", streak1: "Day streak", totalToday: "Counted today", last7: "Last 7 days", byDhikr: "Today by dhikr",
      none: "Nothing counted yet today.", custom: "Your dhikr", deleted: "Deleted", del: "Delete",
      fatimaSub: "33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar", added: "Added",
      tg: {
        vibrateTap: ["Vibrate on each count", ""],
        vibrateTarget: ["Vibrate at the target", ""],
        sound: ["Click sound", ""],
        volumeKeys: ["Count with volume buttons", "Volume up adds one, volume down undoes"],
        keepAwake: ["Keep the screen on", "While this app is open"],
        showMeaning: ["Show the meaning", ""],
      },
      about: "Free, with no ads and no tracking. Your counts stay on this phone. Made by FreeApps by Hamza.",
    },
    ur: {
      history: "تاریخچہ", settings: "ترتیبات", close: "بند کریں", undo: "واپس", dim: "مدھم", holdReset: "دبا کر ری سیٹ",
      dimHint: "گننے کے لیے کہیں بھی ٹیپ کریں", exitDim: "مدھم موڈ بند کریں", chooseDhikr: "ذکر منتخب کریں", addDhikr: "اپنا ذکر شامل کریں",
      name: "نام", target: "ہدف", add: "شامل کریں", of: (t) => t + " میں سے", round: (r) => "چکر " + r,
      hint: "گننے کے لیے کہیں بھی ٹیپ کریں", hintVol: "کہیں بھی ٹیپ کریں یا والیوم بٹن دبائیں", hintKeys: "کہیں بھی ٹیپ کریں یا اسپیس بار دبائیں",
      targetReached: (n, t) => n + ": " + t + " مکمل", seqDone: "تسبیحِ فاطمہ مکمل", resetDone: "گنتی صفر کر دی گئی",
      today: "آج", streak: "مسلسل دن", streak1: "مسلسل دن", totalToday: "آج کی گنتی", last7: "پچھلے سات دن", byDhikr: "آج ہر ذکر",
      none: "آج ابھی کچھ نہیں گنا گیا۔", custom: "آپ کا ذکر", deleted: "حذف کر دیا گیا", del: "حذف کریں",
      fatimaSub: "۳۳ سبحان اللہ، ۳۳ الحمدللہ، ۳۴ اللہ اکبر", added: "شامل کر دیا گیا",
      tg: {
        vibrateTap: ["ہر گنتی پر وائبریشن", ""],
        vibrateTarget: ["ہدف پورا ہونے پر وائبریشن", ""],
        sound: ["کلک کی آواز", ""],
        volumeKeys: ["والیوم بٹن سے گنیں", "اوپر والا بٹن ایک بڑھاتا ہے، نیچے والا واپس کرتا ہے"],
        keepAwake: ["اسکرین آن رکھیں", "جب تک ایپ کھلی ہو"],
        showMeaning: ["معنی دکھائیں", ""],
      },
      about: "مفت، بغیر اشتہارات اور بغیر ٹریکنگ کے۔ آپ کی گنتی صرف اسی فون پر رہتی ہے۔ FreeApps by Hamza کی پیشکش۔",
    },
  };

  // ------------------------------------------------------------ state

  const KEY = "tasbeeh:v1";
  const defaults = () => ({
    lang: (navigator.language || "").toLowerCase().startsWith("ur") ? "ur" : "en",
    current: "fatima",
    counts: {},          // id -> { n, rounds }
    seq: {},             // sequence id -> { step, n }
    custom: [],          // [{ id, name, target }]
    history: {},         // "YYYY-MM-DD" -> { id: count }
    settings: { vibrateTap: true, vibrateTarget: true, sound: false, volumeKeys: true, keepAwake: true, showMeaning: true },
  });

  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const base = defaults();
        return Object.assign(base, d, { settings: Object.assign(base.settings, d.settings || {}) });
      }
    } catch (e) {}
    return defaults();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  const tr = () => T[S.lang];

  const UR_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
  const fmtNum = (n) => {
    const s = new Intl.NumberFormat("en").format(n);
    return S.lang === "ur" ? s.replace(/\d/g, (d) => UR_DIGITS[d]).replace(/,/g, "٬") : s;
  };

  const today = () => dayKey(new Date());
  function dayKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // ------------------------------------------------------------ what is being counted

  function findDhikr(id) {
    const p = PRESETS.find((d) => d.id === id);
    if (p) return { id: p.id, ar: p.ar, name: p[S.lang], meaning: S.lang === "ur" ? p.mur : p.men, target: p.target };
    const c = S.custom.find((d) => d.id === id);
    if (c) return { id: c.id, ar: "", name: c.name, meaning: "", target: c.target, custom: true };
    return null;
  }

  /** The thing on screen right now: a single dhikr or a step inside a sequence. */
  function active() {
    const seq = SEQUENCES.find((s) => s.id === S.current);
    if (seq) {
      const st = S.seq[seq.id] || (S.seq[seq.id] = { step: 0, n: 0 });
      const [did, target] = seq.steps[st.step];
      const d = findDhikr(did);
      return { kind: "seq", seq, st, dhikr: d, target, n: st.n, rounds: 0, label: seq[S.lang] };
    }
    const d = findDhikr(S.current) || findDhikr("subhanallah");
    const c = S.counts[d.id] || (S.counts[d.id] = { n: 0, rounds: 0 });
    return { kind: "single", dhikr: d, target: d.target, n: c.n, rounds: c.rounds, c, label: d.name };
  }

  // ------------------------------------------------------------ counting

  function countOne() {
    const a = active();
    logHistory(a.dhikr.id, 1);
    if (a.kind === "single") {
      a.c.n += 1;
      if (a.c.n >= a.target) {
        a.c.n = 0;
        a.c.rounds += 1;
        reachedTarget(a.dhikr.name, a.target, false);
      } else tick();
    } else {
      a.st.n += 1;
      if (a.st.n >= a.target) {
        a.st.n = 0;
        a.st.step += 1;
        if (a.st.step >= a.seq.steps.length) {
          a.st.step = 0;
          reachedTarget(a.seq[S.lang], 0, true);
        } else {
          reachedTarget(a.dhikr.name, a.target, false);
        }
      } else tick();
    }
    save();
    render(true);
  }

  function undo() {
    const a = active();
    if (a.kind === "single") {
      if (a.c.n > 0) a.c.n -= 1;
      else if (a.c.rounds > 0) { a.c.rounds -= 1; a.c.n = a.target - 1; }
      else return;
    } else {
      if (a.st.n > 0) a.st.n -= 1;
      else if (a.st.step > 0) { a.st.step -= 1; a.st.n = a.seq.steps[a.st.step][1] - 1; }
      else return;
    }
    logHistory(active().dhikr.id, -1);
    vibrate(12);
    save();
    render(false);
  }

  function reset() {
    const a = active();
    if (a.kind === "single") { a.c.n = 0; a.c.rounds = 0; }
    else { a.st.n = 0; a.st.step = 0; }
    save();
    render(false);
    vibrate(30);
    toast(tr().resetDone);
  }

  function logHistory(id, delta) {
    const k = today();
    const day = S.history[k] || (S.history[k] = {});
    day[id] = Math.max(0, (day[id] || 0) + delta);
    // keep about 60 days
    const keys = Object.keys(S.history).sort();
    while (keys.length > 60) delete S.history[keys.shift()];
  }

  // ------------------------------------------------------------ feedback

  function vibrate(ms) {
    try {
      if (native && native.vibrate) native.vibrate(ms);
      else if (navigator.vibrate) navigator.vibrate(ms);
    } catch (e) {}
  }
  function vibratePattern(arr) {
    try {
      if (native && native.vibratePattern) native.vibratePattern(arr.join(","));
      else if (navigator.vibrate) navigator.vibrate(arr);
    } catch (e) {}
  }

  let audio = null;
  function click(strong) {
    if (!S.settings.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio = audio || new AC();
      if (audio.state === "suspended") audio.resume();
      const t = audio.currentTime;
      // a short wooden "tock": a filtered noise burst plus a low sine
      const len = Math.floor(audio.sampleRate * 0.06);
      const buf = audio.createBuffer(1, len, audio.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      const src = audio.createBufferSource();
      src.buffer = buf;
      const f = audio.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = strong ? 900 : 1600;
      f.Q.value = 3;
      const g = audio.createGain();
      g.gain.value = strong ? 0.9 : 0.5;
      src.connect(f); f.connect(g); g.connect(audio.destination);
      src.start(t);
    } catch (e) {}
  }

  function tick() {
    if (S.settings.vibrateTap) vibrate(14);
    click(false);
  }

  function reachedTarget(name, target, sequenceDone) {
    if (S.settings.vibrateTarget) vibratePattern(sequenceDone ? [0, 90, 80, 90, 80, 160] : [0, 70, 70, 140]);
    else if (S.settings.vibrateTap) vibrate(14);
    click(true);
    toast(sequenceDone ? tr().seqDone : tr().targetReached(name, fmtNum(target)));
  }

  let toastTimer = 0;
  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ------------------------------------------------------------ rendering

  let ringBeads = 0;

  /** A string of wooden beads around a cord, with a larger "imam" bead at the top. */
  function buildRing(n) {
    const svg = $("ring");
    const cx = 200, cy = 200, R = 178;
    const r = Math.min(12, ((Math.PI * 2 * R) / n) * 0.36);
    let s = '<defs>' +
      '<radialGradient id="wood" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f2c690"/><stop offset=".45" stop-color="#c98a52"/><stop offset="1" stop-color="#6e3f1c"/></radialGradient>' +
      '<radialGradient id="woodDim" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#5f6f63"/><stop offset="1" stop-color="#22433f"/></radialGradient>' +
      '<radialGradient id="imam" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff1c8"/><stop offset=".5" stop-color="#e3bd72"/><stop offset="1" stop-color="#8a6420"/></radialGradient>' +
      "</defs>";
    s += '<circle class="cord" cx="200" cy="200" r="' + R + '"/>';
    // imam bead and tassel at the top
    s += '<path d="M200 4 L193 -14 L207 -14 Z" fill="#e3bd72" opacity=".7"/>';
    s += '<circle cx="200" cy="' + (cy - R) + '" r="' + (r * 1.7) + '" fill="url(#imam)"/>';
    for (let i = 0; i < n; i++) {
      // beads run clockwise from just after the imam bead
      const a = -Math.PI / 2 + ((i + 1) / (n + 1)) * Math.PI * 2;
      const x = (cx + R * Math.cos(a)).toFixed(1), y = (cy + R * Math.sin(a)).toFixed(1);
      s += '<circle class="bead" data-i="' + i + '" cx="' + x + '" cy="' + y + '" r="' + r.toFixed(1) +
        '" fill="url(#woodDim)" style="transform-origin:' + x + "px " + y + 'px"/>';
    }
    svg.innerHTML = s;
    ringBeads = n;
  }

  function beadCount(target) {
    return target >= 7 && target <= 40 ? target : 33;
  }

  function render(bumped) {
    const t = tr();
    const a = active();
    const d = a.dhikr;

    // header chip
    const seqLabel = a.kind === "seq";
    $("pickAr").textContent = d.ar || "";
    $("pickAr").classList.toggle("hidden", !d.ar);
    $("pickName").textContent = seqLabel ? a.label : d.name;

    // ring
    const B = beadCount(a.target);
    if (B !== ringBeads) buildRing(B);
    const lit = B === a.target ? a.n : a.n % B;
    const beads = $("ring").querySelectorAll(".bead");
    beads.forEach((b, i) => {
      b.setAttribute("fill", i < lit ? "url(#wood)" : "url(#woodDim)");
      b.style.transform = bumped && i === lit - 1 ? "scale(1.35)" : "";
    });
    if (bumped && lit > 0) {
      const last = beads[lit - 1];
      setTimeout(() => { if (last) last.style.transform = ""; }, 160);
    }

    // centre
    $("arabic").textContent = d.ar || d.name;
    $("arabic").lang = d.ar ? "ar" : S.lang;
    const cnt = $("count");
    cnt.textContent = fmtNum(a.n);
    if (bumped) {
      cnt.classList.remove("bump");
      void cnt.offsetWidth;
      cnt.classList.add("bump");
    }
    let of = t.of(fmtNum(a.target));
    if (a.rounds > 0) of += "  ·  " + t.round(fmtNum(a.rounds + 1));
    $("of").textContent = of;
    $("meaning").textContent = S.settings.showMeaning ? d.meaning : "";

    // sequence progress
    const step = $("step");
    if (seqLabel) {
      step.innerHTML = a.seq.steps.map((_, i) => '<i class="' + (i < a.st.step ? "done" : i === a.st.step ? "now" : "") + '"></i>').join("");
    } else step.innerHTML = "";

    $("tapHint").textContent = native && native.setVolumeKeys && S.settings.volumeKeys ? t.hintVol : native ? t.hint : t.hintKeys;
    $("dimCount").textContent = fmtNum(a.n);
  }

  function applyLanguage() {
    const t = tr();
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === "ur" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => el.setAttribute("aria-label", t[el.dataset.i18nLabel]));
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)));
    $("about").textContent = t.about;
    render(false);
  }

  // ------------------------------------------------------------ sheets

  function openSheet(id) {
    if (id === "pickSheet") renderPicker();
    if (id === "historySheet") renderHistory();
    if (id === "settingsSheet") renderSettings();
    $(id).classList.remove("hidden");
    const close = $(id).querySelector("[data-close]");
    if (close) close.focus({ preventScroll: true });
  }
  function closeSheets() {
    let closed = false;
    document.querySelectorAll(".sheet-back").forEach((s) => {
      if (!s.classList.contains("hidden")) closed = true;
      s.classList.add("hidden");
    });
    return closed;
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderPicker() {
    const t = tr();
    const items = [];
    for (const s of SEQUENCES) {
      items.push('<li><button class="dhikr-item" data-pick="' + s.id + '" aria-current="' + (S.current === s.id) + '">' +
        '<span class="nm">' + esc(s[S.lang]) + '</span><span class="tg">' + fmtNum(100) + "</span>" +
        '<span class="sub">' + esc(t.fatimaSub) + "</span></button></li>");
    }
    for (const p of PRESETS) {
      items.push('<li><button class="dhikr-item" data-pick="' + p.id + '" aria-current="' + (S.current === p.id) + '">' +
        '<span class="ar" lang="ar" dir="rtl">' + p.ar + "</span>" +
        '<span class="nm">' + esc(p[S.lang]) + '</span><span class="tg">' + fmtNum(p.target) + "</span></button></li>");
    }
    for (const c of S.custom) {
      items.push('<li class="row-wrap"><button class="dhikr-item" data-pick="' + c.id + '" aria-current="' + (S.current === c.id) + '">' +
        '<span class="nm">' + esc(c.name) + '</span><span class="tg">' + fmtNum(c.target) + "</span>" +
        '<span class="sub">' + esc(t.custom) + "</span></button>" +
        '<button class="del" data-del="' + c.id + '" aria-label="' + esc(t.del + ": " + c.name) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21a2 2 0 0 1-2-2V7H4V5h5V4h6v1h5v2h-1v12a2 2 0 0 1-2 2H7zm2-4h2V9H9v8zm4 0h2V9h-2v8z"/></svg></button></li>');
    }
    $("dhikrList").innerHTML = items.join("");
  }

  function renderHistory() {
    const t = tr();
    const todayData = S.history[today()] || {};
    const totalToday = Object.values(todayData).reduce((a, b) => a + b, 0);

    // streak: consecutive days with any count, ending today (or yesterday if nothing yet today)
    let streak = 0;
    const d = new Date();
    if (!totalToday) d.setDate(d.getDate() - 1);
    for (;;) {
      const v = S.history[dayKey(d)];
      if (v && Object.values(v).some((x) => x > 0)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const x = new Date();
      x.setDate(x.getDate() - i);
      const k = dayKey(x);
      const v = S.history[k] ? Object.values(S.history[k]).reduce((a, b) => a + b, 0) : 0;
      days.push({ k, v, label: i === 0 ? t.today : new Intl.DateTimeFormat(S.lang === "ur" ? "ur-PK" : "en", { weekday: "short" }).format(x), today: i === 0 });
    }
    const max = Math.max(1, ...days.map((x) => x.v));

    const rows = Object.entries(todayData)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id, v]) => {
        const dh = findDhikr(id);
        const name = dh ? dh.name : id;
        return "<li><span>" + (dh && dh.ar ? '<span class="ar" lang="ar">' + dh.ar + "</span> " : "") + esc(name) + "</span><b>" + fmtNum(v) + "</b></li>";
      });

    $("historyBody").innerHTML =
      '<div class="stats"><div class="stat"><b>' + fmtNum(totalToday) + "</b><span>" + t.totalToday + "</span></div>" +
      '<div class="stat"><b>' + fmtNum(streak) + "</b><span>" + t.streak + "</span></div></div>" +
      '<h3 class="history-h">' + t.last7 + '</h3><div class="week">' +
      days.map((x) => '<div class="week-row' + (x.today ? " today" : "") + '"><span>' + esc(x.label) + '</span><div class="bar-bg"><div class="bar-fg" style="width:' +
        ((x.v / max) * 100).toFixed(1) + '%"></div></div><span class="n">' + fmtNum(x.v) + "</span></div>").join("") +
      '</div><h3 class="history-h">' + t.byDhikr + "</h3>" +
      (rows.length ? '<ul class="today-list">' + rows.join("") + "</ul>" : '<p class="empty">' + t.none + "</p>");
  }

  function renderSettings() {
    const t = tr();
    const keys = ["vibrateTap", "vibrateTarget", "sound", "keepAwake", "showMeaning"];
    if (native && native.setVolumeKeys) keys.splice(3, 0, "volumeKeys");
    $("toggles").innerHTML = keys.map((k) => {
      const [label, small] = t.tg[k];
      return '<li><span class="t-text">' + esc(label) + (small ? "<small>" + esc(small) + "</small>" : "") + "</span>" +
        '<button class="switch" role="switch" data-toggle="' + k + '" aria-checked="' + S.settings[k] + '" aria-label="' + esc(label) + '"></button></li>';
    }).join("");
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)));
  }

  function applyNativeSettings() {
    if (!native) return;
    try {
      if (native.setKeepScreenOn) native.setKeepScreenOn(!!S.settings.keepAwake);
      if (native.setVolumeKeys) native.setVolumeKeys(!!S.settings.volumeKeys);
    } catch (e) {}
  }

  // ------------------------------------------------------------ dim mode

  function setDim(on) {
    $("dim").classList.toggle("hidden", !on);
    try { if (native && native.setDim) native.setDim(on); } catch (e) {}
    render(false);
  }

  // ------------------------------------------------------------ events

  $("stage").addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    countOne();
  });
  $("dim").addEventListener("pointerdown", (e) => {
    if (e.target.closest("#dimExit")) return;
    countOne();
  });
  $("dimExit").addEventListener("click", () => setDim(false));
  $("dimBtn").addEventListener("click", () => setDim(true));
  $("undoBtn").addEventListener("click", undo);

  // hold to reset (prevents accidental resets)
  let holdTimer = 0, holdStart = 0, holdRaf = 0;
  const fill = $("resetFill");
  function holdEnd() {
    clearTimeout(holdTimer);
    cancelAnimationFrame(holdRaf);
    fill.style.width = "0";
  }
  $("resetBtn").addEventListener("pointerdown", () => {
    holdStart = performance.now();
    const step = () => {
      fill.style.width = Math.min(100, ((performance.now() - holdStart) / 800) * 100) + "%";
      holdRaf = requestAnimationFrame(step);
    };
    step();
    holdTimer = setTimeout(() => { holdEnd(); reset(); }, 800);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => $("resetBtn").addEventListener(ev, holdEnd));
  $("resetBtn").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reset(); } });

  $("pickBtn").addEventListener("click", () => openSheet("pickSheet"));
  $("historyBtn").addEventListener("click", () => openSheet("historySheet"));
  $("settingsBtn").addEventListener("click", () => openSheet("settingsSheet"));
  document.querySelectorAll(".sheet-back").forEach((back) => {
    back.addEventListener("click", (e) => { if (e.target === back || e.target.closest("[data-close]")) closeSheets(); });
  });

  $("dhikrList").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      S.custom = S.custom.filter((c) => c.id !== del.dataset.del);
      delete S.counts[del.dataset.del];
      if (S.current === del.dataset.del) S.current = "subhanallah";
      save();
      renderPicker();
      render(false);
      toast(tr().deleted);
      return;
    }
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      S.current = pick.dataset.pick;
      save();
      closeSheets();
      render(false);
    }
  });

  $("addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("addName").value.trim();
    const target = Math.max(1, Math.min(100000, parseInt($("addTarget").value, 10) || 0));
    if (!name || !target) return;
    const id = "c" + Date.now().toString(36);
    S.custom.push({ id, name, target });
    S.current = id;
    save();
    $("addName").value = "";
    closeSheets();
    render(false);
    toast(tr().added);
  });

  $("toggles").addEventListener("click", (e) => {
    const sw = e.target.closest("[data-toggle]");
    if (!sw) return;
    const k = sw.dataset.toggle;
    S.settings[k] = !S.settings[k];
    sw.setAttribute("aria-checked", String(S.settings[k]));
    save();
    applyNativeSettings();
    render(false);
  });
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    S.lang = b.dataset.lang;
    save();
    applyLanguage();
    renderSettings();
  }));

  document.addEventListener("keydown", (e) => {
    const sheetOpen = [...document.querySelectorAll(".sheet-back")].some((s) => !s.classList.contains("hidden"));
    if (e.key === "Escape") { if (!closeSheets()) setDim(false); return; }
    if (sheetOpen || e.target.closest("input, button")) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp") { e.preventDefault(); countOne(); }
    else if (e.key === "Backspace" || e.key === "ArrowDown") { e.preventDefault(); undo(); }
  });

  // ------------------------------------------------------------ Android hooks

  window.onVolumeKey = function (dir) {
    const sheetOpen = [...document.querySelectorAll(".sheet-back")].some((s) => !s.classList.contains("hidden"));
    if (sheetOpen) return;
    if (dir === "up") countOne();
    else undo();
  };
  window.onAndroidBack = function () {
    if (closeSheets()) return true;
    if (!$("dim").classList.contains("hidden")) { setDim(false); return true; }
    return false;
  };
  window.setInsets = function (top, bottom) {
    document.documentElement.style.setProperty("--inset-top", top + "px");
    document.documentElement.style.setProperty("--inset-bottom", bottom + "px");
  };
  window.onAndroidResume = function () {
    applyNativeSettings();
    render(false); // the day may have changed
  };

  // test hook
  window.__tasbeeh = { get state() { return S; }, countOne, undo, reset, active, dayKey };

  applyLanguage();
  applyNativeSettings();
})();
