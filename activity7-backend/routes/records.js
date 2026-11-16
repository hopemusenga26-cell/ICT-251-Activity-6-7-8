// The five record routes, mounted at /api/records.
// Every request is validated here; the backend never relies on the form.
const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

// The four required fields from the shared data agreement.
const REQUIRED = {
  title: [3, 80, "Title"],
  category: [2, 40, "Category"],
  description: [5, 300, "Description"]
};

// Extra reporter fields. The website always sends them; API clients may leave them out.
const OPTIONAL = {
  reporter_name: [2, 80, "Reporter name"],
  location: [3, 100, "Location"]
};

const COLUMNS = "id, title, category, description, status, reporter_name, student_number, location";

// Send a JSON error with the given status code.
function fail(res, code, message) {
  return res.status(code).json({ message });
}

// Return the id as a number, or null if it is not a positive whole number.
function parseId(value) {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
}

// Check one optional text field: missing or blank becomes null.
function optionalText(body, field, [min, max, label]) {
  const value = body[field];
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== "string") return { error: `${label} must be text.` };
  const trimmed = value.trim();
  if (trimmed === "") return { value: null };
  if (trimmed.length < min || trimmed.length > max) {
    return { error: `${label} must have ${min} to ${max} characters.` };
  }
  return { value: trimmed };
}

// Check the request body. Returns { record } or { error }.
// Any id sent by the client is ignored.
function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }
  const record = {};
  for (const [field, [min, max, label]] of Object.entries(REQUIRED)) {
    const value = body[field];
    if (value === undefined || value === null) return { error: `${label} is required.` };
    if (typeof value !== "string") return { error: `${label} must be text.` };
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      return { error: `${label} must have ${min} to ${max} characters.` };
    }
    record[field] = trimmed;
  }

  if (body.status === undefined || body.status === null) return { error: "Status is required." };
  if (typeof body.status !== "string") return { error: "Status must be text." };
  const status = body.status.trim();
  if (!STATUSES.includes(status)) {
    return { error: "Status must be Pending, In progress or Completed." };
  }
  record.status = status;

  for (const [field, rule] of Object.entries(OPTIONAL)) {
    const { value, error } = optionalText(body, field, rule);
    if (error) return { error };
    record[field] = value;
  }

  const number = body.student_number;
  if (number === undefined || number === null || (typeof number === "string" && number.trim() === "")) {
    record.student_number = null;
  } else if (typeof number !== "string" || !/^\d{6,12}$/.test(number.trim())) {
    return { error: "Student number must be 6 to 12 digits." };
  } else {
    record.student_number = number.trim();
  }

  return { record };
}

function values(record) {
  return [
    record.title, record.category, record.description, record.status,
    record.reporter_name, record.student_number, record.location
  ];
}

// GET /api/records: all records in id order, or [] when there are none.
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id: one record.
router.get("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, "Record id must be a positive whole number.");
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = ?`, [id]);
    if (result.rowCount === 0) return fail(res, 404, `Record ${id} was not found.`);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/records: create a record; the database generates the id.
router.post("/", async (req, res, next) => {
  const { record, error } = validate(req.body);
  if (error) return fail(res, 400, error);
  try {
    const result = await pool.query(
      `INSERT INTO records (title, category, description, status, reporter_name, student_number, location)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING ${COLUMNS}`,
      values(record)
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/records/:id: replace the editable fields of an existing record.
router.put("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, "Record id must be a positive whole number.");
  const { record, error } = validate(req.body);
  if (error) return fail(res, 400, error);
  try {
    const result = await pool.query(
      `UPDATE records SET title = ?, category = ?, description = ?, status = ?,
         reporter_name = ?, student_number = ?, location = ?
       WHERE id = ? RETURNING ${COLUMNS}`,
      [...values(record), id]
    );
    if (result.rowCount === 0) return fail(res, 404, `Record ${id} was not found.`);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id: remove a record.
router.delete("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, "Record id must be a positive whole number.");
  try {
    const result = await pool.query("DELETE FROM records WHERE id = ? RETURNING id", [id]);
    if (result.rowCount === 0) return fail(res, 404, `Record ${id} was not found.`);
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
