  (() => {
    "use strict";
    const FORMS_KEY = "formly.forms.v1";
    const RESPONSES_KEY = "formly.responses.v1";
    const SUBMISSIONS_KEY = "formly.submissions.v1";
    const TYPES = [
      ["short", "Short answer"], ["paragraph", "Paragraph"], ["multiple", "Multiple choice"],
      ["checkboxes", "Checkboxes"], ["dropdown", "Dropdown"], ["date", "Date"],
      ["number", "Number"], ["email", "Email"], ["rating", "Rating"]
    ];
    const THEMES = {
      violet: { label: "Violet", accent: "#6256e8", accentDark: "#4c41c9", soft: "#f0efff", bg: "#f4f5fa", surface: "#ffffff", ink: "#182230", muted: "#667085", line: "#e7eaf0" },
      ocean: { label: "Ocean", accent: "#167d9a", accentDark: "#11677f", soft: "#e5f4f7", bg: "#eff7f9", surface: "#ffffff", ink: "#182230", muted: "#667085", line: "#dce8eb" },
      forest: { label: "Forest", accent: "#27815e", accentDark: "#1d684a", soft: "#e8f5ed", bg: "#f0f7f2", surface: "#ffffff", ink: "#182230", muted: "#667085", line: "#dce9df" },
      sunset: { label: "Sunset", accent: "#bd4e3b", accentDark: "#a83d2e", soft: "#fff0e9", bg: "#fff5f1", surface: "#ffffff", ink: "#182230", muted: "#667085", line: "#f0dfd8" },
      midnight: { label: "Midnight", accent: "#6d63d9", accentDark: "#5e52c1", soft: "#34314f", bg: "#171b2b", surface: "#242a3d", ink: "#f5f6fb", muted: "#b0b9cc", line: "#454d61" }
    };
    const FONT_STACKS = {
      system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      arial: 'Arial, Helvetica, sans-serif',
      georgia: 'Georgia, "Times New Roman", serif',
      trebuchet: '"Trebuchet MS", Arial, sans-serif'
    };
    const DEFAULT_THEME = { preset: "violet", accent: THEMES.violet.accent, background: THEMES.violet.bg, mode: "light", font: "system", radius: 16, spacing: 1, shadow: 1, buttonStyle: "rounded" };
    const app = document.getElementById("app");
    let responseTab = "summary";

    function normalizeTheme(value) {
      const input = typeof value === "string" ? { preset: value } : (value && typeof value === "object" ? value : {});
      const preset = input.preset === "custom" ? "custom" : (THEMES[input.preset] ? input.preset : "violet");
      const base = THEMES[preset] || THEMES.violet;
      const finite = (candidate, fallback, min, max) => {
        const number = Number(candidate);
        return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
      };
      const validHex = candidate => /^#[0-9a-f]{6}$/i.test(String(candidate || ""));
      return {
        preset,
        accent: validHex(input.accent) ? input.accent : base.accent,
        background: validHex(input.background) ? input.background : base.bg,
        mode: ["light", "dark", "auto"].includes(input.mode) ? input.mode : "light",
        font: Object.prototype.hasOwnProperty.call(FONT_STACKS, input.font) ? input.font : "system",
        radius: finite(input.radius, DEFAULT_THEME.radius, 0, 28),
        spacing: finite(input.spacing, DEFAULT_THEME.spacing, 0.75, 1.5),
        shadow: finite(input.shadow, DEFAULT_THEME.shadow, 0, 3),
        buttonStyle: ["rounded", "pill", "square"].includes(input.buttonStyle) ? input.buttonStyle : "rounded"
      };
    }
    function contrastingText(hex) {
      const channels = String(hex).slice(1).match(/.{2}/g).map(channel => parseInt(channel, 16) / 255);
      const linear = channels.map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
      const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
      const whiteContrast = 1.05 / (luminance + .05);
      const darkContrast = (luminance + .05) / .05;
      return whiteContrast >= darkContrast ? "#ffffff" : "#182230";
    }
    function darkenHex(hex, factor) {
      const channels = hex.slice(1).match(/.{2}/g).map(channel => Math.round(parseInt(channel, 16) * factor));
      return "#" + channels.map(channel => channel.toString(16).padStart(2, "0")).join("");
    }
    function applyTheme(value) {
      const theme = normalizeTheme(value);
      const preset = THEMES[theme.preset] || THEMES.violet;
      const systemDark = theme.mode === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = theme.mode === "dark" || systemDark;
      const accentDark = theme.accent === preset.accent ? preset.accentDark : theme.accent;
      const palette = dark ? {
        ink: "#f5f6fb", muted: "#b0b9cc", line: "#454d61", surface: "#242a3d",
        canvas: "#171b2b", soft: "#34314f", topbar: "rgba(36, 42, 61, .94)",
        danger: "#ff828b", dangerSoft: "#532f3a", success: "#5fdaa9",
        onAccent: "#ffffff", focus: "rgba(141, 130, 255, .38)", overlay: "rgba(0, 0, 0, .58)",
        neutralSoft: "#30374c", neutralInk: "#c3cada", successSoft: "#1f493d", successInk: "#86e1b8",
        controlBackground: "#30374c", controlBorder: "#555f77", barTrack: "#30374c"
      } : {
        ink: preset.ink, muted: preset.muted, line: preset.line, surface: preset.surface,
        canvas: theme.background, soft: preset.soft, topbar: "rgba(255, 255, 255, .92)",
        danger: "#c83d4b", dangerSoft: "#fff0f0", success: "#138a62",
        onAccent: "#ffffff", focus: `${theme.accent}45`, overlay: "rgba(18, 24, 38, .38)",
        neutralSoft: "#f0f2f6", neutralInk: "#687385", successSoft: "#e5f6ee", successInk: "#087450",
        controlBackground: "#ffffff", controlBorder: "#d9dee7", barTrack: "#f0f1f6"
      };
      const root = document.documentElement;
      const shadowLevels = [
        "none",
        dark ? "0 12px 35px rgba(0, 0, 0, .2)" : "0 12px 35px rgba(24, 34, 48, .07)",
        dark ? "0 14px 38px rgba(0, 0, 0, .32)" : "0 14px 38px rgba(24, 34, 48, .12)",
        dark ? "0 16px 42px rgba(0, 0, 0, .42)" : "0 16px 42px rgba(24, 34, 48, .18)"
      ];
      const properties = {
        "--ink": palette.ink, "--muted": palette.muted, "--line": palette.line,
        "--surface": palette.surface, "--canvas": palette.canvas, "--accent": theme.accent,
        "--accent-dark": accentDark, "--accent-ink": dark ? "#f5f6fb" : "#182230",
        "--accent-border": dark ? theme.accent : darkenHex(theme.accent, .5),
        "--soft-accent": palette.soft, "--on-accent": contrastingText(theme.accent),
        "--success": palette.success, "--danger": palette.danger, "--danger-soft": palette.dangerSoft,
        "--topbar-surface": palette.topbar, "--focus-ring": palette.focus, "--overlay": palette.overlay,
        "--neutral-soft": palette.neutralSoft, "--neutral-ink": palette.neutralInk,
        "--success-soft": palette.successSoft, "--success-ink": palette.successInk,
        "--control-background": palette.controlBackground, "--control-border": palette.controlBorder,
        "--bar-track": palette.barTrack,
        "--shadow": shadowLevels[Math.round(theme.shadow)],
        "--hover-shadow": shadowLevels[Math.round(theme.shadow)],
        "--control-shadow": `0 0 0 3px ${palette.focus}`,
        "--radius": `${theme.radius}px`, "--control-radius": `${theme.radius * .58}px`,
        "--button-radius": theme.buttonStyle === "pill" ? "999px" : theme.buttonStyle === "square" ? "4px" : `${Math.max(4, theme.radius * .62)}px`,
        "--spacing-scale": String(theme.spacing), "--body-font": FONT_STACKS[theme.font],
        "--heading-font": FONT_STACKS[theme.font],
        "--button-shadow": theme.shadow > 1 ? shadowLevels[Math.round(theme.shadow) - 1] : "none"
      };
      Object.entries(properties).forEach(([key, setting]) => root.style.setProperty(key, setting));
      root.style.colorScheme = dark ? "dark" : "light";
      root.classList.toggle("theme-dark", dark);
      root.dataset.themeMode = theme.mode;
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute("content", palette.canvas);
      return theme;
    }

    function readList(key) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
      } catch (error) {
        console.error("Unable to read saved Formly data:", error);
        toast("Saved data could not be read. Check browser storage.", true);
        return [];
      }
    }
    function saveList(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("Unable to save Formly data:", error);
        toast("Could not save. Browser storage may be full or disabled.", true);
        return false;
      }
    }
    function forms() { return readList(FORMS_KEY); }
    function responses() { return readList(RESPONSES_KEY); }
    function id() { return "f-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
    function escapeHtml(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[ch]);
    }
    function attr(value) { return escapeHtml(value); }
    function toast(message, error) {
      const region = document.getElementById("toast-region");
      if (!region) return;
      const item = document.createElement("div");
      item.className = "toast" + (error ? " error" : "");
      item.textContent = message;
      region.appendChild(item);
      window.setTimeout(() => item.remove(), 3400);
    }
    function linkFor(params) {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = new URLSearchParams(Object.entries(params)).toString();
      return url.href;
    }
    function go(params, replace) {
      const url = linkFor(params);
      window.history[replace ? "replaceState" : "pushState"]({}, "", url);
      render();
      window.scrollTo(0, 0);
    }
    function readRoute() {
      const hash = window.location.hash.replace(/^#/, "");
      const routeParams = new URLSearchParams(hash);
      const q = hash ? routeParams : new URLSearchParams(window.location.search);
      for (const key of ["edit", "responses", "respond", "preview"]) {
        if (q.has(key)) return { page: key, id: q.get(key) || "" };
      }
      return { page: "dashboard", id: "" };
    }
    function findForm(formId) { return forms().find(form => form.id === formId) || null; }
    function makeQuestion(type) {
      return { id: id(), type: type || "short", title: "", required: false, options: ["Option 1", "Option 2"], points: 0, correctAnswer: "" };
    }
    function makeForm(title) {
      const now = new Date().toISOString();
      return {
        id: id(), title: title || "Untitled form", description: "", theme: { ...DEFAULT_THEME }, questions: [],
        published: false, liveConfig: null, createdAt: now, updatedAt: now,
        settings: { closeDate: "", maxResponses: "", multipleSubmissions: true }
      };
    }
    function persistForm(form) {
      form.updatedAt = new Date().toISOString();
      const list = forms();
      const index = list.findIndex(item => item.id === form.id);
      if (index < 0) list.unshift(form);
      else list[index] = form;
      return saveList(FORMS_KEY, list);
    }
    function getResponseRows(formId) { return responses().filter(item => item.formId === formId); }
    function setSavedState(text) {
      const el = document.getElementById("save-state");
      if (el) el.textContent = text;
    }
    function queueSave(form) {
      setSavedState("Saving…");
      setSavedState(persistForm(form) ? "All changes saved" : "Save failed");
    }
    function saveThemeControl(target) {
      const form = findForm(target.dataset.id);
      if (!form) return;
      form.theme = normalizeTheme(form.theme);
      const key = target.dataset.themeField;
      if (!key) return;
      let value = target.value;
      if (key === "radius" || key === "spacing" || key === "shadow") value = Number(value);
      form.theme[key] = value;
      if (key === "accent" || key === "background") form.theme.preset = "custom";
      form.theme = normalizeTheme(form.theme);
      applyTheme(form.theme);
      persistForm(form);
      const label = target.closest(".design-field")?.querySelector("label span");
      if (label && (key === "radius" || key === "spacing" || key === "shadow")) {
        label.textContent = key === "radius" ? `${form.theme.radius}px` : key === "spacing" ? `${form.theme.spacing.toFixed(1)}×` : `${form.theme.shadow}/3`;
      }
      document.querySelectorAll(".theme-option").forEach(option => {
        const selected = option.dataset.theme === form.theme.preset;
        option.classList.toggle("active", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      const customNote = document.getElementById("custom-theme-note");
      if (customNote) customNote.classList.toggle("hidden", form.theme.preset !== "custom");
    }

    function render() {
      const route = readRoute();
      const form = route.id ? findForm(route.id) : null;
      let activeTheme = form ? form.theme : DEFAULT_THEME;
      if (form && route.page === "respond" && form.published && form.liveConfig) activeTheme = form.liveConfig.theme;
      applyTheme(activeTheme);
      if (route.page === "edit") return renderEditor(route.id);
      if (route.page === "responses") return renderResponses(route.id);
      if (route.page === "respond") return renderRespondent(route.id, false);
      if (route.page === "preview") return renderRespondent(route.id, true);
      renderDashboard();
    }
    function topbar(actions) {
      return `<header class="topbar">
        <a class="brand" href="${attr(linkFor({}))}" data-nav="dashboard"><span class="brand-mark" aria-hidden="true">f</span>Formly</a>
        <div class="top-actions">${actions || `<span class="subtle hide-mobile">A calmer way to collect answers</span>`}</div>
      </header>`;
    }
    function renderDashboard() {
      const list = forms().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      const allResponses = responses();
      const liveCount = list.filter(form => form.published).length;
      app.innerHTML = `${topbar(`<button class="btn primary" data-action="new-form">＋ New form</button>`)}
        <main class="page">
          <section class="hero">
            <div class="eyebrow">Your workspace</div>
            <h1>Good forms start with a good question.</h1>
            <p>Create a polished form, share it with your audience, and see every answer in one place.</p>
            <button class="btn primary" data-action="new-form">＋ Create a form</button>
          </section>
          <section class="stat-row" aria-label="Workspace summary">
            <div class="card stat"><strong>${list.length}</strong><span>Total forms</span></div>
            <div class="card stat"><strong>${liveCount}</strong><span>Live forms</span></div>
            <div class="card stat"><strong>${allResponses.length}</strong><span>Responses collected</span></div>
          </section>
          <div class="section-head"><h2>Your forms</h2><span class="subtle">${list.length} ${list.length === 1 ? "form" : "forms"}</span></div>
          ${list.length ? `<section class="form-grid">${list.map(form => {
            const count = getResponseRows(form.id).length;
            return `<article class="card form-card">
              <div class="form-card-top"><h3>${escapeHtml(form.title || "Untitled form")}</h3><span class="pill ${form.published ? "live dot" : ""}">${form.published ? "Live" : "Draft"}</span></div>
              <p>${escapeHtml(form.description || "No description yet")}</p>
              <div class="form-meta"><span>${count} ${count === 1 ? "response" : "responses"}</span><span>Updated ${escapeHtml(formatDate(form.updatedAt))}</span></div>
              <div class="card-actions">
                <button class="btn small primary" data-action="edit" data-id="${attr(form.id)}">Edit</button>
                <button class="btn small" data-action="responses" data-id="${attr(form.id)}">Responses</button>
                ${form.published ? `<button class="btn small" data-action="copy-link" data-id="${attr(form.id)}">Copy link</button>` : ""}
                <button class="btn small" data-action="duplicate" data-id="${attr(form.id)}">Duplicate</button>
                <button class="btn small danger" data-action="delete-form" data-id="${attr(form.id)}">Delete</button>
              </div>
            </article>`;
          }).join("")}</section>` : `<section class="card empty"><div class="empty-icon" aria-hidden="true">✳</div><h2>Your first form is waiting</h2><p>Start with a blank canvas. Add questions, choose a theme, and publish whenever you’re ready.</p><button class="btn primary" data-action="new-form">Create your first form</button></section>`}
          <p class="footer-note">Your forms are saved in this browser on this device.</p>
        </main>`;
    }
    function formatDate(value) {
      if (!value) return "just now";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "just now" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    function renderEditor(formId) {
      let form = findForm(formId);
      if (!form) return renderNotFound("This form could not be found.");
      form.theme = normalizeTheme(form.theme);
      applyTheme(form.theme);
      if (!Array.isArray(form.questions)) form.questions = [];
      if (!form.settings) form.settings = { closeDate: "", maxResponses: "", multipleSubmissions: true };
      const hasResponses = getResponseRows(form.id).length > 0;
      app.innerHTML = `${topbar("")}
        <main class="builder-wrap">
          <div class="builder-nav">
            <div class="left"><button class="btn small" data-action="dashboard">← Dashboard</button><span id="save-state" class="save-state">All changes saved</span></div>
            <div class="right">
              <button class="btn small" data-action="preview-side" data-id="${attr(form.id)}">Preview</button>
              <button class="btn small" data-action="preview-tab" data-id="${attr(form.id)}">Open preview ↗</button>
              ${form.published ? `<button class="btn primary" data-action="update-live" data-id="${attr(form.id)}">Update published form</button>` : `<button class="btn primary" data-action="publish-check" data-id="${attr(form.id)}">Publish</button>`}
            </div>
          </div>
          ${form.published ? `<div class="banner"><span aria-hidden="true">●</span><div><strong>This form is live.</strong> Changes will be visible right away when you select <strong>Update published form.</strong></div></div>` : ""}
          <nav class="builder-tabs" aria-label="Form editor sections">
            <button class="tab active" data-action="builder-tab" data-tab="questions">Questions</button>
            <button class="tab" data-action="builder-tab" data-tab="settings">Settings</button>
            ${hasResponses ? `<button class="tab" data-action="responses" data-id="${attr(form.id)}">Responses (${getResponseRows(form.id).length})</button>` : ""}
          </nav>
          <section class="builder-panel">
            <div class="editor-main" id="editor-main">${renderQuestionEditor(form)}</div>
            <aside class="card editor-sidebar">
              <h3>Design &amp; Theme</h3>
              <p class="small-note">Changes apply immediately and are saved with this form.</p>
              <div class="theme-options">${Object.entries(THEMES).map(([key, preset]) => `<button class="theme-option ${form.theme.preset === key ? "active" : ""}" data-action="theme" data-id="${attr(form.id)}" data-theme="${key}" aria-pressed="${form.theme.preset === key}">
                <span class="swatch" style="background:${preset.accent}"></span>${preset.label}</button>`).join("")}</div>
              <p id="custom-theme-note" class="custom-theme-note ${form.theme.preset === "custom" ? "" : "hidden"}" role="status">Custom design · no preset selected</p>
              ${renderDesignControls(form)}
              <button class="btn small theme-reset" data-action="theme-reset" data-id="${attr(form.id)}">Reset to default</button>
              <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
              <h3>Form status</h3><p class="small-note">${form.published ? "This form is accepting responses." : "This form is a private draft."}</p>
              ${form.published ? `<button class="btn small" data-action="unpublish" data-id="${attr(form.id)}">Unpublish form</button>` : ""}
            </aside>
          </section>
        </main>`;
    }
    function renderDesignControls(form) {
      const theme = form.theme;
      return `<div class="design-field"><label for="theme-accent">Accent color</label><input id="theme-accent" type="color" data-theme-field="accent" data-id="${attr(form.id)}" value="${attr(theme.accent)}"></div>
        <div class="design-field"><label for="theme-background">Page background</label><input id="theme-background" type="color" data-theme-field="background" data-id="${attr(form.id)}" value="${attr(theme.background)}"></div>
        <div class="design-field"><label for="theme-font">Font</label><select id="theme-font" class="select" data-theme-field="font" data-id="${attr(form.id)}">
          <option value="system" ${theme.font === "system" ? "selected" : ""}>System</option><option value="arial" ${theme.font === "arial" ? "selected" : ""}>Arial</option><option value="georgia" ${theme.font === "georgia" ? "selected" : ""}>Georgia</option><option value="trebuchet" ${theme.font === "trebuchet" ? "selected" : ""}>Trebuchet</option>
        </select></div>
        <div class="design-field"><label for="theme-mode">Color mode</label><select id="theme-mode" class="select" data-theme-field="mode" data-id="${attr(form.id)}">
          <option value="light" ${theme.mode === "light" ? "selected" : ""}>Light</option><option value="dark" ${theme.mode === "dark" ? "selected" : ""}>Dark</option><option value="auto" ${theme.mode === "auto" ? "selected" : ""}>Auto (system)</option>
        </select></div>
        <div class="design-field"><label for="theme-radius">Roundness <span>${theme.radius}px</span></label><input id="theme-radius" type="range" min="0" max="28" step="1" data-theme-field="radius" data-id="${attr(form.id)}" value="${theme.radius}"></div>
        <div class="design-field"><label for="theme-spacing">Spacing <span>${theme.spacing.toFixed(1)}×</span></label><input id="theme-spacing" type="range" min="0.75" max="1.5" step="0.05" data-theme-field="spacing" data-id="${attr(form.id)}" value="${theme.spacing}"></div>
        <div class="design-field"><label for="theme-shadow">Shadow <span>${theme.shadow}/3</span></label><input id="theme-shadow" type="range" min="0" max="3" step="1" data-theme-field="shadow" data-id="${attr(form.id)}" value="${theme.shadow}"></div>
        <div class="design-field"><label for="theme-button">Button style</label><select id="theme-button" class="select" data-theme-field="buttonStyle" data-id="${attr(form.id)}">
          <option value="rounded" ${theme.buttonStyle === "rounded" ? "selected" : ""}>Rounded</option><option value="pill" ${theme.buttonStyle === "pill" ? "selected" : ""}>Pill</option><option value="square" ${theme.buttonStyle === "square" ? "selected" : ""}>Square</option>
        </select></div>`;
    }
    function renderQuestionEditor(form) {
      return `<div class="card intro-card">
        <div class="field"><label class="hidden" for="form-title">Form title</label><input id="form-title" class="input" data-field="title" value="${attr(form.title)}" placeholder="Untitled form" aria-label="Form title"></div>
        <div class="field" style="margin-bottom:0"><label class="hidden" for="form-description">Form description</label><textarea id="form-description" class="textarea" data-field="description" placeholder="Add a short description or welcome message" aria-label="Form description">${escapeHtml(form.description)}</textarea></div>
      </div>
      ${form.questions.map((question, index) => renderQuestionCard(question, index)).join("")}
      <button class="add-question" data-action="add-question" data-id="${attr(form.id)}">＋ Add a question</button>
      <p class="small-note" style="text-align:center;margin-top:14px">Draft changes are saved automatically in this browser.</p>`;
    }
    function renderQuestionCard(question, index) {
      const choices = ["multiple", "checkboxes", "dropdown"].includes(question.type);
      const options = Array.isArray(question.options) ? question.options : ["Option 1", "Option 2"];
      return `<article class="card question-card" data-question-card="${attr(question.id)}">
        <div class="question-head">
          <span class="question-number">${index + 1}</span>
          <input class="input question-title" data-qfield="title" data-qid="${attr(question.id)}" value="${attr(question.title)}" placeholder="Question ${index + 1}" aria-label="Question ${index + 1} title">
          <div class="question-tools">
            <button class="icon-btn" title="Move question up" aria-label="Move question up" data-action="move-question" data-dir="-1" data-qid="${attr(question.id)}">↑</button>
            <button class="icon-btn" title="Move question down" aria-label="Move question down" data-action="move-question" data-dir="1" data-qid="${attr(question.id)}">↓</button>
            <button class="icon-btn" title="Delete question" aria-label="Delete question" data-action="delete-question" data-qid="${attr(question.id)}">×</button>
          </div>
        </div>
        <div class="field"><label for="type-${attr(question.id)}">Answer type</label>
          <select id="type-${attr(question.id)}" class="select" data-qfield="type" data-qid="${attr(question.id)}">${TYPES.map(([type, label]) => `<option value="${type}" ${question.type === type ? "selected" : ""}>${label}</option>`).join("")}</select>
        </div>
        ${choices ? `<div class="field"><span class="label">Answer choices</span><div>${options.map((option, i) => `<div class="option-row"><span class="${question.type === "checkboxes" ? "option-check" : "option-dot"}" aria-hidden="true"></span><input class="input" data-qoption="${i}" data-qid="${attr(question.id)}" value="${attr(option)}" aria-label="Choice ${i + 1}"><button class="icon-btn" data-action="remove-option" data-qid="${attr(question.id)}" data-index="${i}" aria-label="Remove choice ${i + 1}">×</button></div>`).join("")}</div><button class="btn small" data-action="add-option" data-qid="${attr(question.id)}">＋ Add choice</button></div>` : ""}
        <div class="question-settings">
          <label class="toggle-line"><input type="checkbox" data-qfield="required" data-qid="${attr(question.id)}" ${question.required ? "checked" : ""}> Required</label>
          <div class="inline-actions"><label class="small-note" for="points-${attr(question.id)}">Score points</label><input id="points-${attr(question.id)}" class="input" style="width:70px;min-height:34px;padding:5px 8px" type="number" min="0" data-qfield="points" data-qid="${attr(question.id)}" value="${attr(question.points || 0)}" aria-label="Score points"></div>
        </div>
        ${question.points > 0 ? `<div class="field" style="margin-top:13px;margin-bottom:0"><label for="answer-${attr(question.id)}">Correct answer for scoring</label><input id="answer-${attr(question.id)}" class="input" data-qfield="correctAnswer" data-qid="${attr(question.id)}" value="${attr(question.correctAnswer || "")}" placeholder="Enter the expected answer"></div>` : ""}
      </article>`;
    }
    function renderSettings(form) {
      const settings = form.settings || {};
      return `<article class="card settings-card">
        <h2>Response settings</h2><p class="subtle">Control when and how people can submit this form.</p>
        <div class="field"><label for="close-date">Close date and time (optional)</label><input id="close-date" class="input" type="datetime-local" data-setting="closeDate" value="${attr(settings.closeDate || "")}"><span class="small-note">Responses stop after this date and time.</span></div>
        <div class="field"><label for="max-responses">Maximum responses (optional)</label><input id="max-responses" class="input" type="number" min="1" step="1" data-setting="maxResponses" value="${attr(settings.maxResponses || "")}" placeholder="No limit"><span class="small-note">Responses stop when this limit is reached.</span></div>
        <label class="toggle-line"><input type="checkbox" data-setting="multipleSubmissions" ${settings.multipleSubmissions !== false ? "checked" : ""}> Allow multiple submissions from the same browser</label>
      </article>
      <article class="card settings-card"><h2>About responses</h2><p class="subtle">Unpublishing prevents new submissions. Existing responses stay saved and available in the Responses tab.</p></article>`;
    }
    function getEditorForm() {
      const route = readRoute();
      return route.page === "edit" ? findForm(route.id) : null;
    }
    function switchBuilderTab(tab) {
      document.querySelectorAll(".builder-tabs .tab").forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
      const main = document.getElementById("editor-main");
      const form = getEditorForm();
      if (!main || !form) return;
      main.innerHTML = tab === "settings" ? renderSettings(form) : renderQuestionEditor(form);
    }
    function validationErrors(form) {
      const errors = [];
      if (!form.title || !form.title.trim()) errors.push("Add a form title.");
      if (!form.questions.length) errors.push("Add at least one question.");
      form.questions.forEach((question, i) => {
        if (!question.title || !question.title.trim()) errors.push(`Add a title to question ${i + 1}.`);
        if (["multiple", "checkboxes", "dropdown"].includes(question.type) && !(question.options || []).some(option => String(option).trim())) errors.push(`Add an answer choice to question ${i + 1}.`);
        if (question.points > 0 && !String(question.correctAnswer || "").trim()) errors.push(`Add a correct answer for scored question ${i + 1}.`);
      });
      return errors;
    }
    function openPublishCheck(form) {
      const issues = validationErrors(form);
      if (issues.length) {
        toast("Fix the pre-publish check before publishing.", true);
        const main = document.getElementById("editor-main");
        if (main) {
          main.insertAdjacentHTML("afterbegin", `<div class="notice error" role="alert"><strong>Pre-publish check</strong><ul>${issues.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`);
          const firstInvalid = main.querySelector('input[value=""], textarea:placeholder-shown');
          if (firstInvalid) firstInvalid.focus();
        }
        return;
      }
      if (window.confirm("Publish this form now? Anyone with the link can submit a response.")) {
        form.published = true;
        form.liveConfig = cloneConfig(form);
        persistForm(form);
        toast("Your form is live.");
        renderEditor(form.id);
      }
    }
    function cloneConfig(form) {
      return JSON.parse(JSON.stringify({
        title: form.title, description: form.description, theme: normalizeTheme(form.theme),
        questions: form.questions, settings: form.settings
      }));
    }
    function updateLive(form) {
      const issues = validationErrors(form);
      if (issues.length) {
        toast("Fix the pre-publish check before updating.", true);
        switchBuilderTab("questions");
        const main = document.getElementById("editor-main");
        if (main) main.insertAdjacentHTML("afterbegin", `<div class="notice error" role="alert"><strong>Pre-publish check</strong><ul>${issues.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`);
        return;
      }
      if (!window.confirm("Update published form? Changes will be visible to respondents right away.")) return;
      form.liveConfig = cloneConfig(form);
      persistForm(form);
      toast("Published form updated.");
      renderEditor(form.id);
    }
    function renderNotFound(message) {
      app.innerHTML = `${topbar("")}<main class="page narrow"><section class="card empty"><div class="empty-icon" aria-hidden="true">?</div><h2>We couldn’t find that form</h2><p>${escapeHtml(message)}</p><button class="btn primary" data-action="dashboard">Go to dashboard</button></section></main>`;
    }
    function renderRespondent(formId, preview) {
      const form = findForm(formId);
      if (!form) return renderNotFound("This form link may be invalid or the form may have been deleted.");
      const config = preview || !form.published ? cloneConfig(form) : (form.liveConfig || cloneConfig(form));
      config.theme = normalizeTheme(config.theme);
      const theme = applyTheme(config.theme);
      const responseCount = getResponseRows(form.id).length;
      const limit = Number(config.settings && config.settings.maxResponses);
      let closedReason = "";
      if (!preview && !form.published) closedReason = "This form is not accepting responses.";
      else if (!preview && config.settings && config.settings.closeDate && new Date(config.settings.closeDate).getTime() <= Date.now()) closedReason = "This form is closed and is no longer accepting responses.";
      else if (!preview && limit > 0 && responseCount >= limit) closedReason = "This form has reached its response limit and is no longer accepting responses.";
      app.innerHTML = `<main class="respond-page">
        <div class="respond-shell">${preview ? `<div class="preview-label">Preview · responses submitted here are not saved</div>` : ""}
          <section class="respond-card"><div class="respond-accent"></div><div class="respond-content">
            ${closedReason ? `<div class="success-mark closed-mark">i</div><h1>${escapeHtml(config.title || "Untitled form")}</h1><div class="notice">${escapeHtml(closedReason)}</div>${preview ? `<button class="btn" data-action="back-edit" data-id="${attr(form.id)}">Back to editing</button>` : ""}` :
            `<h1>${escapeHtml(config.title || "Untitled form")}</h1><p class="respond-description">${escapeHtml(config.description || "")}</p>
              <form id="respond-form" data-formid="${attr(form.id)}" data-preview="${preview}">
                ${config.questions.map((question, index) => renderRespondQuestion(question, index)).join("")}
                ${!config.questions.length ? `<div class="notice">This form has no questions yet.</div>` : ""}
                <button class="btn primary" type="submit" ${!config.questions.length ? "disabled" : ""}>Submit</button>
              </form>
              ${preview ? `<button class="btn ghost" style="margin-top:12px" data-action="back-edit" data-id="${attr(form.id)}">← Back to editing</button>` : `<p class="footer-note">Your response is saved securely in this browser.</p>`}`}
          </div></section>
        </div></main>`;
      if (closedReason) return;
    }
    function renderRespondQuestion(question, index) {
      const requiredMark = question.required ? `<span class="required-mark" aria-label="required">*</span>` : "";
      const name = `answer-${attr(question.id)}`;
      let input = "";
      switch (question.type) {
        case "paragraph": input = `<textarea id="answer-${attr(question.id)}" class="textarea" name="${name}" ${question.required ? "required" : ""}></textarea>`; break;
        case "multiple":
        case "checkboxes":
          input = `<div class="respond-options">${(question.options || []).filter(item => String(item).trim()).map((option, i) => `<label class="respond-option"><input id="answer-${attr(question.id)}${i ? `-${i}` : ""}" type="${question.type === "multiple" ? "radio" : "checkbox"}" name="${name}" value="${attr(option)}" ${question.type === "multiple" && question.required ? "required" : ""}><span>${escapeHtml(option)}</span></label>`).join("")}</div>`;
          break;
        case "dropdown": input = `<select id="answer-${attr(question.id)}" class="select" name="${name}" ${question.required ? "required" : ""}><option value="">Select an option</option>${(question.options || []).filter(item => String(item).trim()).map(option => `<option value="${attr(option)}">${escapeHtml(option)}</option>`).join("")}</select>`; break;
        case "date": input = `<input id="answer-${attr(question.id)}" class="input" type="date" name="${name}" ${question.required ? "required" : ""}>`; break;
        case "number": input = `<input id="answer-${attr(question.id)}" class="input" type="number" name="${name}" ${question.required ? "required" : ""}>`; break;
        case "email": input = `<input id="answer-${attr(question.id)}" class="input" type="email" name="${name}" ${question.required ? "required" : ""}>`; break;
        case "rating": input = `<div class="rating-row" role="group" aria-label="${attr(question.title || "Rating")}">${[1,2,3,4,5].map(value => `<button type="button" class="rating-button" data-rating="${value}" data-name="${name}" aria-pressed="false">${value}</button>`).join("")}<input id="answer-${attr(question.id)}" type="hidden" name="${name}" ${question.required ? "data-required-rating" : ""}></div>`; break;
        default: input = `<input id="answer-${attr(question.id)}" class="input" type="text" name="${name}" ${question.required ? "required" : ""}>`;
      }
      return `<div class="respond-question"><label class="title" for="answer-${attr(question.id)}">${index + 1}. ${escapeHtml(question.title || "Untitled question")}${requiredMark}</label>${input}</div>`;
    }
    function responseScore(form, answers) {
      let total = 0, earned = 0;
      form.questions.forEach(question => {
        const points = Math.max(0, Number(question.points) || 0);
        if (!points) return;
        total += points;
        const answer = answers[question.id];
        const expected = String(question.correctAnswer || "").trim().toLowerCase();
        if (expected && String(Array.isArray(answer) ? answer.join(", ") : answer || "").trim().toLowerCase() === expected) earned += points;
      });
      return total ? { earned, total } : null;
    }
    function renderThankYou(form, score, preview) {
      const theme = applyTheme((form.liveConfig || form).theme);
      app.innerHTML = `<main class="respond-page">
        <div class="respond-shell">${preview ? `<div class="preview-label">Preview submission · not saved</div>` : ""}
        <section class="respond-card"><div class="respond-accent"></div><div class="respond-content">
          <div class="success-mark">✓</div><h1>Thank you for your response!</h1><p class="respond-description">Your answers have been ${preview ? "previewed" : "recorded"}.</p>
          ${score ? `<div class="notice"><strong>Your score: ${score.earned} / ${score.total}</strong></div>` : ""}
          ${preview ? `<button class="btn primary" data-action="back-edit" data-id="${attr(form.id)}">Back to editing</button>` : `<button class="btn" data-action="respond-again" data-id="${attr(form.id)}">Done</button>`}
        </div></section></div></main>`;
    }
    function renderResponses(formId) {
      const form = findForm(formId);
      if (!form) return renderNotFound("This form may have been deleted.");
      form.theme = normalizeTheme(form.theme);
      applyTheme(form.theme);
      const rows = getResponseRows(form.id).sort((a,b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
      app.innerHTML = `${topbar(`<button class="btn small" data-action="dashboard">← Dashboard</button><button class="btn small primary" data-action="edit" data-id="${attr(form.id)}">Edit form</button>`)}
        <main class="page narrow">
          <div class="eyebrow">Responses</div><h1>${escapeHtml(form.title || "Untitled form")}</h1><p class="muted">${rows.length} ${rows.length === 1 ? "response" : "responses"} collected</p>
          <div class="response-summary">
            <div class="card summary-card"><strong>${rows.length}</strong><span>Total responses</span></div>
            <div class="card summary-card"><strong>${form.published ? "Live" : "Closed"}</strong><span>Form status</span></div>
            <div class="card summary-card"><strong>${form.questions.length}</strong><span>Questions</span></div>
          </div>
          <div class="response-toolbar"><nav class="response-nav" aria-label="Response views">
            <button class="tab ${responseTab === "summary" ? "active" : ""}" data-action="response-tab" data-tab="summary">Summary</button>
            <button class="tab ${responseTab === "individual" ? "active" : ""}" data-action="response-tab" data-tab="individual">Individual</button>
          </nav>
          <div class="inline-actions"><button class="btn small" data-action="export-csv" data-id="${attr(form.id)}" ${rows.length ? "" : "disabled"}>↓ Export CSV</button></div></div>
          ${!rows.length ? `<section class="card empty"><div class="empty-icon" aria-hidden="true">↗</div><h2>No responses yet</h2><p>${form.published ? "Share your form link to start collecting answers." : "Publish your form to start collecting answers."}</p>${form.published ? `<button class="btn" data-action="copy-link" data-id="${attr(form.id)}">Copy form link</button>` : `<button class="btn primary" data-action="edit" data-id="${attr(form.id)}">Edit and publish</button>`}</section>` :
            responseTab === "summary" ? renderResponseSummary(form, rows) : renderIndividual(form, rows)}
        </main>`;
    }
    function renderResponseSummary(form, rows) {
      return `<section class="card response-card"><h2>Answer summary</h2>${form.questions.map(question => {
        const answers = rows.map(row => row.answers[question.id]).filter(value => value !== undefined && value !== "" && !(Array.isArray(value) && !value.length));
        if (["multiple", "dropdown", "checkboxes"].includes(question.type)) {
          const counts = {};
          answers.forEach(value => (Array.isArray(value) ? value : [value]).forEach(item => counts[item] = (counts[item] || 0) + 1));
          const max = Math.max(1, ...Object.values(counts));
          return `<div class="response-question-result"><h3>${escapeHtml(question.title || "Untitled question")}</h3>${Object.keys(counts).length ? Object.entries(counts).map(([answer,count]) => `<div class="row" style="justify-content:space-between;margin-top:8px"><span>${escapeHtml(answer)}</span><span class="subtle">${count} (${Math.round(count / rows.length * 100)}%)</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(count / max * 100)}%"></div></div>`).join("") : `<p class="small-note">No answers</p>`}</div>`;
        }
        return `<div class="response-question-result"><h3>${escapeHtml(question.title || "Untitled question")}</h3><p class="small-note">${answers.length} ${answers.length === 1 ? "answer" : "answers"}</p>${answers.slice(0,3).map(value => `<div class="answer-item">${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</div>`).join("")}${answers.length > 3 ? `<p class="small-note">And ${answers.length - 3} more — see Individual.</p>` : ""}</div>`;
      }).join("")}</section>`;
    }
    function renderIndividual(form, rows) {
      return `<section class="card response-card"><h2>Individual responses</h2><div class="answer-list">${rows.map((row,index) => `<article class="answer-item"><strong>Response ${rows.length - index} · ${escapeHtml(formatDateTime(row.submittedAt))}${row.preview ? " · Preview (not saved)" : ""}</strong>
        ${form.questions.map(question => `<p style="margin:10px 0 0"><strong style="color:var(--ink);font-size:13px">${escapeHtml(question.title || "Untitled question")}</strong><br>${escapeHtml(displayAnswer(row.answers[question.id]))}</p>`).join("")}
        ${row.score ? `<p class="small-note">Score: ${row.score.earned}/${row.score.total}</p>` : ""}
      </article>`).join("")}</div></section>`;
    }
    function formatDateTime(value) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
    }
    function displayAnswer(value) {
      if (value === undefined || value === "") return "—";
      return Array.isArray(value) ? value.join(", ") || "—" : String(value);
    }
    function downloadCsv(form) {
      const rows = getResponseRows(form.id);
      const columns = ["Submitted at", ...form.questions.map(question => question.title || "Untitled question"), "Score"];
      const quote = value => `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
      const lines = [columns.map(quote).join(",")];
      rows.forEach(row => lines.push([
        row.submittedAt, ...form.questions.map(question => displayAnswer(row.answers[question.id])),
        row.score ? `${row.score.earned}/${row.score.total}` : ""
      ].map(quote).join(",")));
      const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `${(form.title || "form").replace(/[^a-z0-9-_]+/gi, "-")}-responses.csv`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("CSV downloaded.");
    }
    function copyFormLink(form) {
      const value = linkFor({ respond: form.id });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(() => toast("Form link copied."), () => copyFallback(value));
      } else copyFallback(value);
    }
    function copyFallback(value) {
      const input = document.createElement("textarea");
      input.value = value; input.style.position = "fixed"; input.style.opacity = "0";
      document.body.appendChild(input); input.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch (error) { console.error("Clipboard copy failed:", error); }
      input.remove();
      if (copied) toast("Form link copied.");
      else toast("Copy this link from the address bar: " + value, true);
    }
    function addNewForm() {
      const form = makeForm();
      persistForm(form);
      go({ edit: form.id });
    }
    function duplicateForm(form) {
      const copy = JSON.parse(JSON.stringify(form));
      copy.id = id();
      copy.title = (form.title || "Untitled form") + " (copy)";
      copy.published = false;
      copy.liveConfig = null;
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      copy.questions.forEach(question => question.id = id());
      persistForm(copy);
      toast("Form duplicated as a draft.");
      renderDashboard();
    }
    function deleteForm(form) {
      if (!window.confirm(`Delete “${form.title || "Untitled form"}” and its ${getResponseRows(form.id).length} saved response(s)? This cannot be undone.`)) return;
      saveList(FORMS_KEY, forms().filter(item => item.id !== form.id));
      saveList(RESPONSES_KEY, responses().filter(row => row.formId !== form.id));
      toast("Form deleted.");
      go({});
    }
    function moveQuestion(form, questionId, direction) {
      const index = form.questions.findIndex(question => question.id === questionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= form.questions.length) return;
      [form.questions[index], form.questions[target]] = [form.questions[target], form.questions[index]];
      persistForm(form); renderEditor(form.id);
    }
    function handleClick(event) {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const action = target.dataset.action;
      const form = target.dataset.id ? findForm(target.dataset.id) : getEditorForm();
      if (action === "dashboard") return go({});
      if (action === "new-form") return addNewForm();
      if (action === "edit" && form) return go({ edit: form.id });
      if (action === "responses" && form) { responseTab = "summary"; return go({ responses: form.id }); }
      if (action === "preview-side" && form) {
        const overlay = document.createElement("div");
        overlay.className = "preview-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Form preview");
        overlay.innerHTML = `<section class="preview-panel"><header class="preview-panel-head"><span>Preview · responses will not be saved</span><button class="btn small" type="button" data-action="close-preview">Close preview</button></header><iframe title="Form preview"></iframe></section>`;
        app.appendChild(overlay);
        overlay.querySelector("iframe").src = linkFor({ preview: form.id });
        overlay.querySelector("button").focus();
        return;
      }
      if (action === "close-preview") { target.closest(".preview-overlay").remove(); return; }
      if (action === "preview-tab" && form) { window.open(linkFor({ preview: form.id }), "_blank", "noopener"); return; }
      if (action === "back-edit" && form) return go({ edit: form.id });
      if (action === "copy-link" && form) return copyFormLink(form);
      if (action === "duplicate" && form) return duplicateForm(form);
      if (action === "delete-form" && form) return deleteForm(form);
      if (action === "publish-check" && form) return openPublishCheck(form);
      if (action === "update-live" && form) return updateLive(form);
      if (action === "unpublish" && form) {
        if (!window.confirm("Unpublish this form? Its existing responses will be kept.")) return;
        form.published = false; persistForm(form); toast("Form unpublished. Existing responses were kept."); renderEditor(form.id); return;
      }
      if (action === "theme" && form) {
        const preset = THEMES[target.dataset.theme];
        if (!preset) return;
        form.theme = {
          ...normalizeTheme(form.theme), preset: target.dataset.theme,
          accent: preset.accent, background: preset.bg
        };
        applyTheme(form.theme);
        persistForm(form);
        renderEditor(form.id);
        return;
      }
      if (action === "theme-reset" && form) {
        form.theme = { ...DEFAULT_THEME };
        applyTheme(form.theme);
        persistForm(form);
        renderEditor(form.id);
        return;
      }
      if (action === "builder-tab") return switchBuilderTab(target.dataset.tab);
      if (action === "add-question" && form) { form.questions.push(makeQuestion()); persistForm(form); renderEditor(form.id); return; }
      if (action === "delete-question" && form) {
        const question = form.questions.find(item => item.id === target.dataset.qid);
        if (!question) return;
        const questionHasResponses = getResponseRows(form.id).some(row => {
          const answer = row.answers && row.answers[question.id];
          return answer !== undefined && answer !== "" && !(Array.isArray(answer) && answer.length === 0);
        });
        if (questionHasResponses && !window.confirm("This question already has responses. Delete it? Saved answers remain in individual response records, but this question will no longer appear in summaries.")) return;
        form.questions = form.questions.filter(item => item.id !== question.id);
        persistForm(form); renderEditor(form.id); toast("Question deleted."); return;
      }
      if (action === "move-question" && form) return moveQuestion(form, target.dataset.qid, Number(target.dataset.dir));
      if (action === "add-option" && form) {
        const question = form.questions.find(item => item.id === target.dataset.qid);
        if (question) { question.options = question.options || []; question.options.push(`Option ${question.options.length + 1}`); persistForm(form); renderEditor(form.id); }
        return;
      }
      if (action === "remove-option" && form) {
        const question = form.questions.find(item => item.id === target.dataset.qid);
        if (question && question.options.length > 1) { question.options.splice(Number(target.dataset.index), 1); persistForm(form); renderEditor(form.id); }
        else toast("Keep at least one answer choice.", true);
        return;
      }
      if (action === "response-tab") { responseTab = target.dataset.tab; return renderResponses(readRoute().id); }
      if (action === "export-csv" && form) return downloadCsv(form);
      if (action === "respond-again" && form) return renderRespondent(form.id, false);
      if (action === "rating") return;
    }
    function applyEditorValue(target) {
      const form = getEditorForm();
      if (!form) return;
      if (target.dataset.field) {
        form[target.dataset.field] = target.value;
        queueSave(form);
      } else if (target.dataset.qfield) {
        const question = form.questions.find(item => item.id === target.dataset.qid);
        if (!question) return;
        const key = target.dataset.qfield;
        question[key] = key === "required" ? target.checked : key === "points" ? Math.max(0, Number(target.value) || 0) : target.value;
        queueSave(form);
      } else if (target.dataset.qoption !== undefined) {
        const question = form.questions.find(item => item.id === target.dataset.qid);
        if (question) { question.options[Number(target.dataset.qoption)] = target.value; queueSave(form); }
      } else if (target.dataset.setting) {
        const key = target.dataset.setting;
        if (key === "multipleSubmissions") form.settings[key] = target.checked;
        else if (key === "maxResponses") form.settings[key] = target.value === "" ? "" : Math.max(1, Number(target.value) || 1);
        else form.settings[key] = target.value;
        queueSave(form);
      }
    }
    function getFormFromRespondEvent(target) {
      const formEl = target.closest("#respond-form");
      return formEl ? { element: formEl, form: findForm(formEl.dataset.formid), preview: formEl.dataset.preview === "true" } : null;
    }
    function submitRespondent(event) {
      const ctx = getFormFromRespondEvent(event.target);
      if (!ctx || !ctx.form) return;
      event.preventDefault();
      const form = ctx.form;
      const config = ctx.preview ? cloneConfig(form) : form.liveConfig || cloneConfig(form);
      if (!ctx.preview && !form.published) { toast("This form is not accepting responses.", true); renderRespondent(form.id, false); return; }
      const count = getResponseRows(form.id).length;
      const max = Number(config.settings && config.settings.maxResponses);
      if (!ctx.preview && max > 0 && count >= max) { renderRespondent(form.id, false); return; }
      if (!ctx.preview && config.settings && config.settings.closeDate && new Date(config.settings.closeDate).getTime() <= Date.now()) { renderRespondent(form.id, false); return; }
      const submissionKey = `formly.submitted.${form.id}`;
      if (!ctx.preview && config.settings && config.settings.multipleSubmissions === false && localStorage.getItem(submissionKey)) {
        toast("You’ve already submitted this form in this browser.", true); return;
      }
      const data = new FormData(ctx.element);
      const answers = {};
      let missing = null;
      config.questions.forEach(question => {
        const name = `answer-${question.id}`;
        let value = data.getAll(name);
        if (question.type !== "checkboxes") value = value[0] || "";
        if (question.required && (value === "" || (Array.isArray(value) && value.length === 0))) missing = question.title || "a required question";
        answers[question.id] = value;
      });
      const ratingMissing = config.questions.find(question => question.type === "rating" && question.required && !answers[question.id]);
      if (ratingMissing) missing = ratingMissing.title || "a required rating";
      if (missing) { toast(`Please answer: ${missing}`, true); return; }
      const score = responseScore({ questions: config.questions }, answers);
      if (!ctx.preview) {
        const item = { id: id(), formId: form.id, submittedAt: new Date().toISOString(), answers, score };
        const current = responses(); current.push(item);
        if (!saveList(RESPONSES_KEY, current)) return;
        if (config.settings && config.settings.multipleSubmissions === false) {
          try { localStorage.setItem(submissionKey, "1"); }
          catch (error) { console.error("Unable to store submission guard:", error); toast("Your response was saved, but the multiple-submission guard could not be stored.", true); }
        }
      }
      renderThankYou(form, score, ctx.preview);
    }
    function handleRating(event) {
      const button = event.target.closest("[data-rating]");
      if (!button) return;
      const group = button.closest(".rating-row");
      if (!group) return;
      const hidden = group.querySelector('input[type="hidden"]');
      if (hidden) hidden.value = button.dataset.rating;
      group.querySelectorAll(".rating-button").forEach(item => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    }
    app.addEventListener("click", event => {
      if (event.target.closest("[data-rating]")) { handleRating(event); return; }
      handleClick(event);
    });
    app.addEventListener("input", event => {
      if (event.target.matches("[data-theme-field]")) {
        saveThemeControl(event.target);
        return;
      }
      applyEditorValue(event.target);
    });
    app.addEventListener("change", event => {
      const target = event.target;
      if (target.matches("[data-theme-field]")) {
        saveThemeControl(target);
        return;
      }
      applyEditorValue(target);
      if (target.matches('[data-qfield="type"], [data-qfield="points"]')) {
        const form = getEditorForm();
        if (form) renderEditor(form.id);
      }
    });
    app.addEventListener("submit", submitRespondent);
    window.addEventListener("popstate", render);
    if (window.matchMedia) {
      const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => {
        const route = readRoute();
        const form = route.id ? findForm(route.id) : null;
        applyTheme(form ? (route.page === "respond" && form.published && form.liveConfig ? form.liveConfig.theme : form.theme) : DEFAULT_THEME);
      };
      if (colorPreference.addEventListener) colorPreference.addEventListener("change", handleSystemThemeChange);
      else if (colorPreference.addListener) colorPreference.addListener(handleSystemThemeChange);
    }
    window.addEventListener("beforeunload", () => {
      const form = getEditorForm();
      if (form) persistForm(form);
    });
    render();
  })();
  