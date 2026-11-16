// Live backend base URL: HTTPS, no final slash.
// When the page is opened from this computer (Live Server), the local API is used instead.
const LIVE_API_URL = "https://campus-maintenance-api.onrender.com";
const LOCAL_API_URL = "http://localhost:3000";

const isLocalPage = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL = isLocalPage ? LOCAL_API_URL : LIVE_API_URL;
