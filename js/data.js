// Browser demonstration data service.
// Records are stored as a JSON array under one localStorage key.
// Every method is async so app.js can await it; Activity 8 keeps these
// method names and swaps the bodies for calls to the backend API.

const KEY = "campus-maintenance-demo-v1";

const STARTING_RECORDS = [
  { id: 1, title: "Broken classroom light", category: "Electrical", description: "The light in Room B12 does not switch on.", status: "Pending" },
  { id: 2, title: "Leaking tap in hostel washroom", category: "Plumbing", description: "The second tap in Block C ground floor washroom drips all night and wastes water.", status: "In progress" },
  { id: 3, title: "Wobbly lecture desk", category: "Furniture", description: "Desk 14 in Lecture Theatre 2 has a loose leg and tips over when students lean on it.", status: "Pending" },
  { id: 4, title: "Flickering corridor tubes", category: "Electrical", description: "Three fluorescent tubes outside the ICT lab flicker constantly in the evening.", status: "Completed" },
  { id: 5, title: "Blocked drain near cafeteria", category: "Building & Grounds", description: "Rainwater collects at the cafeteria back entrance because the drain is blocked with leaves.", status: "In progress" },
  { id: 6, title: "Toilet will not flush", category: "Plumbing", description: "The end cubicle in the Science Block ladies' toilets does not flush.", status: "Pending" },
  { id: 7, title: "Broken library chair", category: "Furniture", description: "A study chair on the library first floor has a cracked seat and should be removed.", status: "Completed" },
  { id: 8, title: "Dead socket in Lab 3", category: "Electrical", description: "The wall socket beside workstation 22 in Lab 3 gives no power to laptops.", status: "In progress" },
  { id: 9, title: "Cracked window pane", category: "Building & Grounds", description: "A window in Room A7 is cracked across the middle and lets in the wind.", status: "Pending" },
  { id: 10, title: "Loose door handle", category: "Furniture", description: "The handle on the staff room door comes off when it is pulled.", status: "Completed" }
];

// Read the saved array. Seed only when the key has never been written,
// so an emptied list stays empty after a refresh.
function load() {
  const saved = localStorage.getItem(KEY);
  if (saved === null) {
    save(STARTING_RECORDS);
    return structuredClone(STARTING_RECORDS);
  }
  try {
    const records = JSON.parse(saved);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function save(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

function toId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) throw new Error("Record id must be a positive whole number.");
  return n;
}

// Copy only the four editable fields, never the id.
function editable(record) {
  return {
    title: record.title,
    category: record.category,
    description: record.description,
    status: record.status
  };
}

export const recordService = {
  // Return an array of all records.
  async list() {
    return load();
  },

  // Return one record, or report that it is missing.
  async get(id) {
    const recordId = toId(id);
    const record = load().find(r => r.id === recordId);
    if (!record) throw new Error("Record not found.");
    return record;
  },

  // Generate an id one higher than any existing id, save and return the record.
  async create(record) {
    const records = load();
    const nextId = records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const created = { id: nextId, ...editable(record) };
    records.push(created);
    save(records);
    return created;
  },

  // Replace the four editable fields and keep the original id.
  async update(id, record) {
    const recordId = toId(id);
    const records = load();
    const index = records.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error("Record not found.");
    records[index] = { id: recordId, ...editable(record) };
    save(records);
    return records[index];
  },

  // Delete the record and return a success message.
  async remove(id) {
    const recordId = toId(id);
    const records = load();
    const remaining = records.filter(r => r.id !== recordId);
    if (remaining.length === records.length) throw new Error("Record not found.");
    save(remaining);
    return { message: "Record deleted." };
  }
};
