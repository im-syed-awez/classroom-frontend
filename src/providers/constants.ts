import { BACKEND_BASE_URL } from "@/constants";

// Accept either a backend origin or an already-prefixed /api base URL.
const backendBaseUrl = BACKEND_BASE_URL.replace(/\/+$/, "");
export const API_URL = /\/api$/i.test(backendBaseUrl)
	? backendBaseUrl
	: `${backendBaseUrl}/api`;
