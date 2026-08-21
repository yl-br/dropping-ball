/**
 * startup-quiz.js — Self-contained startup quiz for the Ball Dropping Game.
 *
 * Zero dependencies. No Vue, no separate CSS file, no required JSON file.
 * - Injects its own styles (all classes prefixed "sq-" to avoid collisions).
 * - Tries to fetch ./math-questions.json so you can edit questions there;
 *   if the fetch fails for any reason, it falls back to the questions
 *   embedded below, so the quiz ALWAYS appears.
 * - Shows itself as a full-screen overlay as soon as the page loads.
 * - When finished, it removes itself and notifies your game via:
 *     1. window.onStartupQuizComplete(result)   (if you define it)
 *     2. document event: "startup-quiz-complete" (detail = result)
 *     3. window.startupQuizResult               (stored for late readers)
 *
 * To install: add ONE line to index.html, before your other game scripts:
 *   <script src="./components/startup-quiz.js"></script>
 */
(function () {
  "use strict";

  if (window.__startupQuizLoaded) return; // guard against double-include
  window.__startupQuizLoaded = true;

  /* ------------------------------------------------------------------ */
  /* Embedded fallback questions (kept in sync with math-questions.json) */
  /* ------------------------------------------------------------------ */
  var FALLBACK_QUESTIONS = [
    { id: 1,  difficulty: "easy",   question: "What is the derivative of x\u00B3?",                          options: ["3x\u00B2", "x\u00B2", "3x", "x\u00B3/3"],                             correct: "3x\u00B2" },
    { id: 2,  difficulty: "easy",   question: "What is the derivative of sin(x)?",                            options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],                              correct: "cos(x)" },
    { id: 3,  difficulty: "easy",   question: "What is the integral of 2x dx?",                               options: ["x\u00B2 + C", "2x\u00B2 + C", "x\u00B2/2 + C", "2 + C"],               correct: "x\u00B2 + C" },
    { id: 4,  difficulty: "easy",   question: "What is the derivative of e\u02E3?",                           options: ["e\u02E3", "xe\u02E3\u207B\u00B9", "e\u02E3\u207B\u00B9", "ln(x)"],      correct: "e\u02E3" },
    { id: 5,  difficulty: "medium", question: "What is the derivative of ln(x)?",                             options: ["1/x", "ln(x)/x", "x", "e\u02E3"],                                      correct: "1/x" },
    { id: 6,  difficulty: "medium", question: "What is the derivative of 5x\u00B2 \u2212 3x + 2?",            options: ["10x \u2212 3", "10x + 3", "5x \u2212 3", "10x \u2212 1"],              correct: "10x \u2212 3" },
    { id: 7,  difficulty: "medium", question: "What is the integral of cos(x) dx?",                           options: ["sin(x) + C", "-sin(x) + C", "cos(x) + C", "-cos(x) + C"],              correct: "sin(x) + C" },
    { id: 8,  difficulty: "medium", question: "What is the limit as x\u21921 of (x\u00B2 \u2212 1)/(x \u2212 1)?", options: ["2", "1", "0", "Undefined"],                                       correct: "2" },
    { id: 9,  difficulty: "hard",   question: "What is the derivative of x\u00B2e\u02E3? (product rule)",     options: ["(x\u00B2 + 2x)e\u02E3", "2xe\u02E3", "x\u00B2e\u02E3", "(x\u00B2 \u2212 2x)e\u02E3"], correct: "(x\u00B2 + 2x)e\u02E3" },
    { id: 10, difficulty: "hard",   question: "What is the second derivative of x\u2074?",                    options: ["12x\u00B2", "4x\u00B3", "24x", "12x\u00B3"],                           correct: "12x\u00B2" },
    { id: 11, difficulty: "hard",   question: "What is the integral of 1/x from 1 to e?",                     options: ["1", "e", "e \u2212 1", "0"],                                           correct: "1" },
    { id: 12, difficulty: "hard",   question: "What is the derivative of tan(x)?",                            options: ["sec\u00B2(x)", "sec(x)tan(x)", "-cot(x)", "csc\u00B2(x)"],             correct: "sec\u00B2(x)" },
    { id: 13, difficulty: "hard",   question: "What is the derivative of (3x + 1)\u2075? (chain rule)",       options: ["15(3x + 1)\u2074", "5(3x + 1)\u2074", "3(3x + 1)\u2075", "15(3x + 1)\u2075"], correct: "15(3x + 1)\u2074" }
  ];

  var AUTO_ADVANCE_MS = 2000;

  /* --------------------------- Styles ------------------------------- */
  var CSS = "\n" +
    ".sq-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 55%,#a855f7 100%);font-family:'Segoe UI',system-ui,-apple-system,sans-serif;overflow-y:auto}\n" +
    ".sq-card{width:100%;max-width:560px;background:rgba(255,255,255,.97);border-radius:18px;box-shadow:0 24px 60px rgba(30,10,70,.45);padding:28px 26px;box-sizing:border-box}\n" +
    ".sq-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7c3aed;font-weight:700;margin:0 0 4px}\n" +
    ".sq-title{margin:0 0 18px;font-size:24px;color:#2e1065;font-weight:800}\n" +
    ".sq-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;color:#6b7280}\n" +
    ".sq-diff{padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}\n" +
    ".sq-diff-easy{background:#dcfce7;color:#166534}\n" +
    ".sq-diff-medium{background:#fef9c3;color:#854d0e}\n" +
    ".sq-diff-hard{background:#fee2e2;color:#991b1b}\n" +
    ".sq-bar{height:8px;border-radius:999px;background:#ede9fe;overflow:hidden;margin-bottom:20px}\n" +
    ".sq-bar-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#7c3aed,#a855f7);transition:width .35s ease}\n" +
    ".sq-question{font-size:19px;line-height:1.4;color:#1f2937;font-weight:600;margin:0 0 18px;min-height:52px}\n" +
    ".sq-options{display:grid;gap:10px;margin:0;padding:0;list-style:none}\n" +
    ".sq-option{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 15px;border:2px solid #e5e7eb;border-radius:12px;background:#fff;font-size:16px;color:#1f2937;cursor:pointer;transition:border-color .15s,background .15s,transform .1s;font-family:inherit}\n" +
    ".sq-option:hover:not(:disabled){border-color:#a855f7;background:#faf5ff}\n" +
    ".sq-option:focus-visible{outline:3px solid #a855f7;outline-offset:2px}\n" +
    ".sq-option:disabled{cursor:default}\n" +
    ".sq-letter{flex:0 0 28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#ede9fe;color:#6d28d9;font-weight:700;font-size:14px}\n" +
    ".sq-option.sq-correct{border-color:#22c55e;background:#f0fdf4}\n" +
    ".sq-option.sq-correct .sq-letter{background:#22c55e;color:#fff}\n" +
    ".sq-option.sq-wrong{border-color:#ef4444;background:#fef2f2}\n" +
    ".sq-option.sq-wrong .sq-letter{background:#ef4444;color:#fff}\n" +
    ".sq-feedback{margin-top:14px;font-size:14px;font-weight:600;min-height:20px}\n" +
    ".sq-feedback.sq-good{color:#16a34a}\n" +
    ".sq-feedback.sq-bad{color:#dc2626}\n" +
    ".sq-summary{text-align:center;padding:8px 0}\n" +
    ".sq-score{font-size:44px;font-weight:800;color:#6d28d9;margin:6px 0 2px}\n" +
    ".sq-score-label{color:#6b7280;font-size:14px;margin-bottom:22px}\n" +
    ".sq-start{display:inline-block;padding:14px 34px;border:none;border-radius:12px;background:linear-gradient(90deg,#7c3aed,#a855f7);color:#fff;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 10px 24px rgba(124,58,237,.4);transition:transform .12s,box-shadow .12s}\n" +
    ".sq-start:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(124,58,237,.5)}\n" +
    ".sq-start:focus-visible{outline:3px solid #2e1065;outline-offset:2px}\n" +
    "@media (max-width:480px){.sq-card{padding:20px 16px}.sq-title{font-size:20px}.sq-question{font-size:17px}.sq-option{font-size:15px;padding:11px 12px}}\n" +
    "@media (prefers-reduced-motion:reduce){.sq-bar-fill,.sq-option,.sq-start{transition:none}}\n";

  /* --------------------------- Helpers ------------------------------ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* --------------------------- Quiz --------------------------------- */
  function StartupQuiz(questions) {
    // Keep easy -> medium -> hard progression, but shuffle within each tier.
    var tiers = { easy: [], medium: [], hard: [] };
    questions.forEach(function (q) { (tiers[q.difficulty] || tiers.medium).push(q); });
    this.questions = shuffle(tiers.easy).concat(shuffle(tiers.medium), shuffle(tiers.hard));
    this.index = 0;
    this.score = 0;
    this.build();
  }

  StartupQuiz.prototype.build = function () {
    var style = document.createElement("style");
    style.id = "sq-styles";
    style.textContent = CSS;
    document.head.appendChild(style);

    this.overlay = el("div", "sq-overlay");
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.setAttribute("aria-label", "Startup math quiz");

    this.card = el("div", "sq-card");
    this.overlay.appendChild(this.card);
    document.body.appendChild(this.overlay);

    this.renderQuestion();
  };

  StartupQuiz.prototype.renderQuestion = function () {
    var q = this.questions[this.index];
    var self = this;
    this.card.innerHTML = "";

    this.card.appendChild(el("p", "sq-eyebrow", "Warm-up round"));
    this.card.appendChild(el("h2", "sq-title", "Calculus Quiz"));

    var meta = el("div", "sq-meta");
    meta.appendChild(el("span", null, "Question " + (this.index + 1) + " of " + this.questions.length));
    meta.appendChild(el("span", "sq-diff sq-diff-" + q.difficulty, q.difficulty));
    this.card.appendChild(meta);

    var bar = el("div", "sq-bar");
    var fill = el("div", "sq-bar-fill");
    fill.style.width = ((this.index / this.questions.length) * 100) + "%";
    bar.appendChild(fill);
    this.card.appendChild(bar);
    // animate to include current question
    requestAnimationFrame(function () {
      fill.style.width = (((self.index + 1) / self.questions.length) * 100) + "%";
    });

    this.card.appendChild(el("p", "sq-question", q.question));

    var list = el("ul", "sq-options");
    var letters = ["A", "B", "C", "D", "E", "F"];
    var buttons = [];
    shuffle(q.options).forEach(function (opt, i) {
      var li = document.createElement("li");
      var btn = el("button", "sq-option");
      btn.type = "button";
      btn.appendChild(el("span", "sq-letter", letters[i] || "?"));
      btn.appendChild(el("span", null, opt));
      btn.dataset.value = opt;
      btn.addEventListener("click", function () { self.answer(opt, buttons, feedback, q); });
      li.appendChild(btn);
      list.appendChild(li);
      buttons.push(btn);
    });
    this.card.appendChild(list);

    var feedback = el("div", "sq-feedback");
    feedback.setAttribute("aria-live", "polite");
    this.card.appendChild(feedback);

    if (buttons[0]) buttons[0].focus();
  };

  StartupQuiz.prototype.answer = function (chosen, buttons, feedback, q) {
    var self = this;
    var correct = chosen === q.correct;
    if (correct) this.score++;

    buttons.forEach(function (btn) {
      btn.disabled = true;
      if (btn.dataset.value === q.correct) btn.classList.add("sq-correct");
      else if (btn.dataset.value === chosen) btn.classList.add("sq-wrong");
    });

    feedback.textContent = correct
      ? "Correct!"
      : "Not quite \u2014 the answer is " + q.correct + ".";
    feedback.classList.add(correct ? "sq-good" : "sq-bad");

    setTimeout(function () {
      self.index++;
      if (self.index < self.questions.length) self.renderQuestion();
      else self.renderSummary();
    }, AUTO_ADVANCE_MS);
  };

  StartupQuiz.prototype.renderSummary = function () {
    var self = this;
    this.card.innerHTML = "";
    var wrap = el("div", "sq-summary");
    wrap.appendChild(el("p", "sq-eyebrow", "Quiz complete"));
    wrap.appendChild(el("div", "sq-score", this.score + " / " + this.questions.length));
    wrap.appendChild(el("p", "sq-score-label", "Nice work \u2014 your ball is ready to drop."));
    var btn = el("button", "sq-start", "Start Game");
    btn.type = "button";
    btn.addEventListener("click", function () { self.finish(); });
    wrap.appendChild(btn);
    this.card.appendChild(wrap);
    btn.focus();
  };

  StartupQuiz.prototype.finish = function () {
    var result = { completed: true, score: this.score, total: this.questions.length };
    this.overlay.remove();
    var style = document.getElementById("sq-styles");
    if (style) style.remove();

    window.startupQuizResult = result;
    try {
      document.dispatchEvent(new CustomEvent("startup-quiz-complete", { detail: result }));
    } catch (e) { /* older browsers */ }
    if (typeof window.onStartupQuizComplete === "function") {
      try { window.onStartupQuizComplete(result); } catch (e) { console.error(e); }
    }
  };

  /* --------------------------- Boot -------------------------------- */
  function loadQuestions() {
    // Optional external file so questions can be edited without touching JS.
    return fetch("./math-questions.json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var qs = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(qs) || qs.length === 0) throw new Error("Empty question file");
        return qs;
      })
      .catch(function (err) {
        console.warn("[startup-quiz] Using built-in questions (" + err.message + ")");
        return FALLBACK_QUESTIONS;
      });
  }

  function boot() {
    loadQuestions().then(function (qs) { new StartupQuiz(qs); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
