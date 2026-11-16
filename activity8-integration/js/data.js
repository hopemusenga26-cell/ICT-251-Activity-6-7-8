// Data service backed by the Campus Maintenance Requests API.
// Same method names as the Activity 6 browser version; each one now
// sends a request to the backend, which validates it and saves the change.
import { API_BASE_URL } from "./config.js";

// Send one request and return the parsed JSON.
// fetch does not reject on 400 or 500, so response.ok is checked here.
async function request(path, method = "GET", body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, options);
  } catch {
    throw new Error("The server could not be reached. It may be starting up; wait a moment and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The server sent an unexpected response (status ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }
  return data;
}

// Only the four editable fields are sent; the backend generates the id.
function editable(record) {
  return {
    title: record.title,
    category: record.category,
    description: record.description,
    status: record.status
  };
}

export const recordService = {
  list() {
    return request("/api/records");
  },
  get(id) {
    return request(`/api/records/${id}`);
  },
  create(record) {
    return request("/api/records", "POST", editable(record));
  },
  update(id, record) {
    return request(`/api/records/${id}`, "PUT", editable(record));
  },
  remove(id) {
    return request(`/api/records/${id}`, "DELETE");
  }
};
