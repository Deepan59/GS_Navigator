const API_BASE = "/api";

/**
 * Sends natural language citizen request to POST /api/recommend
 */
export async function submitCitizenMessage(message, existingProfile = {}, language = null) {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      profile: existingProfile,
      language
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

/**
 * Directly evaluates structured profile via POST /api/schemes/recommend
 */
export async function recommendSchemesByProfile(profile) {
  const response = await fetch(`${API_BASE}/schemes/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches all verified schemes in the catalog
 */
export async function fetchAllSchemes() {
  const response = await fetch(`${API_BASE}/schemes`);
  if (!response.ok) {
    throw new Error("Failed to fetch verified schemes catalog.");
  }
  return response.json();
}

/**
 * Health check
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}
