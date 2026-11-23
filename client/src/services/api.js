
const API = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

// Render's free service may take a little while to wake from sleep.
const REQUEST_TIMEOUT_MS = 90000;

export async function request(path, token, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    const responseText = await response.text();
    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error(
          response.ok
            ? "The server returned an unreadable response. Please try again."
            : `The server returned an unexpected response (${response.status}).`
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status}).`
      );
    }

    return data;

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. Please check your connection and try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Couldn't connect to QuickFit. Check your internet connection and API server."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}
