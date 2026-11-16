// Page behaviour: form events, record cards, search, filter and messages.
// All data access goes through recordService, so this file does not care
// whether records live in the browser or on the backend.
import { recordService } from "./data.js";

const STATUSES = ["Pending", "In progress", "Completed"];
const LIMITS = {
  title: [3, 80, "Title"],
  category: [2, 40, "Category"],
  description: [5, 300, "Description"]
};

// Static icons for each category (no user data is placed in these).
const ICONS = {
  "Electrical": '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  "Plumbing": '<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z"/></svg>',
  "Furniture": '<svg viewBox="0 0 24 24"><path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6M4 11h16v4H4zM6 15v6M18 15v6"/></svg>',
  "Building & Grounds": '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6"/></svg>',
  "default": '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>'
};

const $ = id => document.getElementById(id);
const form = $("record-form");
const fields = {
  title: $("title"),
  category: $("category"),
  description: $("description"),
  status: $("status")
};
const saveBtn = $("save-btn");
const cancelBtn = $("cancel-edit");
const list = $("record-list");
const emptyState = $("empty-state");
const messageBox = $("message");
const searchInput = $("search");
const filterSelect = $("filter-status");

let records = [];
let editingId = null;
let messageTimer;

/* ---------- Messages ---------- */

// Show a success, error or info message above the record list.
function showMessage(text, type = "success") {
  clearTimeout(messageTimer);
  messageBox.textContent = text;
  messageBox.className = `message ${type === "error" ? "error-msg" : type}`;
  messageBox.hidden = false;
  if (type === "success") {
    messageTimer = setTimeout(() => { messageBox.hidden = true; }, 5000);
  }
}

/* ---------- Validation ---------- */

// Trim every editable value and return { record, errors }.
function readForm() {
  const record = {};
  const errors = {};
  for (const [name, input] of Object.entries(fields)) {
    record[name] = input.value.trim();
  }
  for (const [name, [min, max, label]] of Object.entries(LIMITS)) {
    const length = record[name].length;
    if (length === 0) errors[name] = `${label} is required.`;
    else if (length < min || length > max) errors[name] = `${label} must have ${min} to ${max} characters.`;
  }
  if (!STATUSES.includes(record.status)) {
    errors.status = "Status must be Pending, In progress or Completed.";
  }
  return { record, errors };
}

function showFieldErrors(errors) {
  for (const name of Object.keys(fields)) {
    const message = errors[name] || "";
    $(`${name}-error`).textContent = message;
    fields[name].setAttribute("aria-invalid", message ? "true" : "false");
  }
}

/* ---------- Rendering ---------- */

function statusClass(status) {
  if (status === "Completed") return "status-completed";
  if (status === "In progress") return "status-progress";
  return "status-pending";
}

function makeBadge(status) {
  const badge = document.createElement("span");
  badge.className = `status-badge ${statusClass(status)}`;
  badge.textContent = status;
  return badge;
}

function makeButton(label, className, action, id, title) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn btn-sm ${className}`;
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  button.setAttribute("aria-label", `${label} request ${id}: ${title}`);
  return button;
}

// Build one record card. User-entered text is set with textContent only.
function makeCard(record) {
  const item = document.createElement("li");
  item.className = "record-card";
  if (record.id === editingId) item.classList.add("is-editing");

  const top = document.createElement("div");
  top.className = "card-top";
  const icon = document.createElement("span");
  icon.className = "badge-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = ICONS[record.category] || ICONS.default;
  const meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = `#${record.id}, ${record.category}`;
  top.append(icon, meta);

  const title = document.createElement("h3");
  title.textContent = record.title;

  const desc = document.createElement("p");
  desc.className = "desc";
  desc.textContent = record.description;

  const foot = document.createElement("div");
  foot.className = "card-foot";
  foot.append(
    makeBadge(record.status),
    makeButton("View", "btn-secondary", "view", record.id, record.title),
    makeButton("Edit", "btn-secondary", "edit", record.id, record.title),
    makeButton("Delete", "btn-danger", "delete", record.id, record.title)
  );

  item.append(top, title, desc, foot);
  return item;
}

// Apply search and status filter, then redraw the cards, count and empty state.
function render() {
  const term = searchInput.value.trim().toLowerCase();
  const status = filterSelect.value;
  const shown = records.filter(r =>
    (!term || r.title.toLowerCase().includes(term)) &&
    (!status || r.status === status)
  );

  list.replaceChildren(...shown.map(makeCard));

  const word = shown.length === 1 ? "request" : "requests";
  $("result-count").textContent = (term || status)
    ? `Showing ${shown.length} of ${records.length} ${records.length === 1 ? "request" : "requests"}`
    : `${shown.length} ${word}`;

  if (records.length === 0) {
    emptyState.textContent = "No requests yet. Use the form above to report the first problem.";
    emptyState.hidden = false;
  } else if (shown.length === 0) {
    emptyState.textContent = "No requests match your search or filter. Change the search words or choose Clear.";
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  $("count-pending").textContent = records.filter(r => r.status === "Pending").length;
  $("count-progress").textContent = records.filter(r => r.status === "In progress").length;
  $("count-completed").textContent = records.filter(r => r.status === "Completed").length;
}

// Load every record from the data service and redraw the page.
async function loadRecords() {
  list.replaceChildren();
  emptyState.textContent = "Loading records…";
  emptyState.hidden = false;
  try {
    const result = await recordService.list();
    records = Array.isArray(result) ? result : [];
    render();
  } catch (error) {
    records = [];
    list.replaceChildren();
    emptyState.textContent = "Requests could not be loaded. Check your connection and refresh the page.";
    showMessage(`Could not load requests: ${error.message}`, "error");
  }
}

/* ---------- Form: add, edit, cancel ---------- */

function setEditMode(record) {
  editingId = record ? record.id : null;
  $("form-title").textContent = record ? "Edit request" : "New request";
  $("form-id").hidden = !record;
  $("form-id").textContent = record ? `Request #${record.id}` : "";
  saveBtn.textContent = record ? "Save changes" : "Add request";
  cancelBtn.hidden = !record;
}

function resetForm() {
  form.reset();
  showFieldErrors({});
  setEditMode(null);
  updateCharCount();
}

function updateCharCount() {
  $("description-count").textContent = fields.description.value.trim().length;
}

// Validate, then create or update through the data service.
async function handleSubmit(event) {
  event.preventDefault();
  const { record, errors } = readForm();
  showFieldErrors(errors);
  const firstInvalid = Object.keys(fields).find(name => errors[name]);
  if (firstInvalid) {
    fields[firstInvalid].focus();
    showMessage("Check the highlighted fields and try again. Nothing was saved.", "error");
    return;
  }

  const wasEditing = editingId;
  const idleLabel = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = wasEditing ? "Saving…" : "Adding…";
  try {
    if (wasEditing) {
      const updated = await recordService.update(wasEditing, record);
      showMessage(`Request #${updated.id} updated.`);
    } else {
      const created = await recordService.create(record);
      showMessage(`Request #${created.id} added.`);
    }
    resetForm();
    await loadRecords();
  } catch (error) {
    // Keep what the user typed so they can try again.
    showMessage(`${wasEditing ? "Changes were not saved" : "The request was not added"}: ${error.message}`, "error");
  } finally {
    saveBtn.disabled = false;
    if (saveBtn.textContent.endsWith("…")) saveBtn.textContent = idleLabel;
  }
}

/* ---------- Card buttons: view, edit, delete ---------- */

const viewDialog = $("view-dialog");

async function viewRecord(id) {
  try {
    const record = await recordService.get(id);
    $("view-icon").innerHTML = ICONS[record.category] || ICONS.default;
    $("view-meta").textContent = `Request #${record.id}`;
    $("view-title").textContent = record.title;
    $("view-category").textContent = record.category;
    $("view-status").replaceChildren(makeBadge(record.status));
    $("view-description").textContent = record.description;
    viewDialog.showModal();
  } catch (error) {
    showMessage(`Could not open request #${id}: ${error.message}`, "error");
  }
}

async function editRecord(id) {
  try {
    const record = await recordService.get(id);
    for (const name of Object.keys(fields)) fields[name].value = record[name];
    showFieldErrors({});
    setEditMode(record);
    updateCharCount();
    render();
    $("manage").scrollIntoView();
    fields.title.focus({ preventScroll: true });
  } catch (error) {
    showMessage(`Could not edit request #${id}: ${error.message}`, "error");
  }
}

async function deleteRecord(id, button) {
  const record = records.find(r => r.id === id);
  const name = record ? `"${record.title}"` : `#${id}`;
  if (!confirm(`Delete request ${name}? This cannot be undone.`)) {
    showMessage("Delete cancelled. The request was kept.", "info");
    return;
  }
  button.disabled = true;
  try {
    await recordService.remove(id);
    if (editingId === id) resetForm();
    showMessage(`Deleted request ${name}.`);
    await loadRecords();
  } catch (error) {
    showMessage(`Could not delete ${name}: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
}

list.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "view") viewRecord(id);
  if (button.dataset.action === "edit") editRecord(id);
  if (button.dataset.action === "delete") deleteRecord(id, button);
});

/* ---------- Theme switch (dark is the default) ---------- */

const THEME_KEY = "campus-maintenance-theme";
const themeToggle = $("theme-toggle");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const light = theme === "light";
  themeToggle.textContent = light ? "Dark mode" : "Light mode";
  themeToggle.setAttribute("aria-pressed", String(light));
}

function readTheme() {
  try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; }
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* preference only */ }
});

/* ---------- Start ---------- */

form.addEventListener("submit", handleSubmit);
cancelBtn.addEventListener("click", () => {
  resetForm();
  render();
  showMessage("Edit cancelled. The saved request was not changed.", "info");
});
fields.description.addEventListener("input", updateCharCount);
for (const name of Object.keys(fields)) {
  fields[name].addEventListener("input", () => {
    if (fields[name].getAttribute("aria-invalid") === "true") {
      $(`${name}-error`).textContent = "";
      fields[name].setAttribute("aria-invalid", "false");
    }
  });
}
searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);
$("clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  filterSelect.value = "";
  render();
  searchInput.focus();
});

applyTheme(readTheme());
loadRecords();
