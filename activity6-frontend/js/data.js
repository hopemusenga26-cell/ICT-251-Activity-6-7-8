// Browser demonstration data service.
// Records are stored as a JSON array under one localStorage key.
// Every method is async so app.js can await it; Activity 8 keeps these
// method names and swaps the bodies for calls to the backend API.

const KEY = "campus-maintenance-demo-v2";

const STARTING_RECORDS = [
  {"id":1,"title":"Broken classroom light","category":"Electrical","description":"The light in Room B12 does not switch on.","status":"Pending","reporter_name":"Mwila Banda","student_number":"202410215","location":"Room B12, Block B"},
  {"id":2,"title":"Leaking tap in hostel washroom","category":"Plumbing","description":"The second tap in the ground floor washroom drips all night and wastes water.","status":"In progress","reporter_name":"Chipo Phiri","student_number":"202320877","location":"Hostel Block C, ground floor washroom"},
  {"id":3,"title":"Wobbly lecture desk","category":"Furniture","description":"Desk 14 has a loose leg and tips over when students lean on it.","status":"Pending","reporter_name":"Joseph Tembo","student_number":"202511042","location":"Lecture Theatre 2"},
  {"id":4,"title":"Flickering corridor tubes","category":"Electrical","description":"Three fluorescent tubes flicker constantly in the evening.","status":"Completed","reporter_name":"Natasha Mulenga","student_number":"202410998","location":"Corridor outside the ICT lab"},
  {"id":5,"title":"Blocked drain near cafeteria","category":"Building & Grounds","description":"Rainwater collects at the back entrance because the drain is blocked with leaves.","status":"In progress","reporter_name":"Grace Zulu","student_number":"202320415","location":"Cafeteria back entrance"},
  {"id":6,"title":"Toilet will not flush","category":"Plumbing","description":"The end cubicle toilet does not flush.","status":"Pending","reporter_name":"Ruth Sakala","student_number":"202511730","location":"Science Block, ladies' toilets"},
  {"id":7,"title":"Broken library chair","category":"Furniture","description":"A study chair has a cracked seat and should be removed before someone is hurt.","status":"Completed","reporter_name":"Peter Lungu","student_number":"202410333","location":"Library, first floor"},
  {"id":8,"title":"Dead socket in Lab 3","category":"Electrical","description":"The wall socket beside workstation 22 gives no power to laptops.","status":"In progress","reporter_name":"Daniel Chanda","student_number":"202511508","location":"Computer Lab 3, workstation 22"},
  {"id":9,"title":"Cracked window pane","category":"Building & Grounds","description":"A window is cracked across the middle and lets in the wind and rain.","status":"Pending","reporter_name":"Esther Musonda","student_number":"202320119","location":"Room A7, Block A"},
  {"id":10,"title":"Microwave not heating","category":"Appliances","description":"The kitchen microwave turns on and the plate spins, but food stays cold.","status":"Pending","reporter_name":"Brian Kunda","student_number":"202410561","location":"Hostel Block B kitchen"},
  {"id":11,"title":"No Wi-Fi signal in reading room","category":"IT & Network","description":"Laptops and phones cannot find the campus Wi-Fi in the back half of the room.","status":"In progress","reporter_name":"Mercy Mwansa","student_number":"202511214","location":"Library reading room"},
  {"id":12,"title":"Loose door handle","category":"Furniture","description":"The handle comes off when the door is pulled.","status":"Completed","reporter_name":"Kelvin Ngoma","student_number":"202320660","location":"Staff room, Administration Block"}
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

// Copy only the editable fields, never the id.
function editable(record) {
  return {
    title: record.title,
    category: record.category,
    description: record.description,
    status: record.status,
    reporter_name: record.reporter_name,
    student_number: record.student_number,
    location: record.location
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

  // Replace the editable fields and keep the original id.
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
