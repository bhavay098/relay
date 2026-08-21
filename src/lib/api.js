/**
 * Shared client-side API helper with automatic status checks and JSON parsing.
 */
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(errorBody.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = errorBody;
    throw error;
  }
  return res.json();
}
