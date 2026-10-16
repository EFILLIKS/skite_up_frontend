export const resolveAudioUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").trim().replace(/\/+$/, "");

  let backendOrigin = "http://localhost:8080";
  try {
    const parsed = new URL(apiBase, window.location.origin);
    backendOrigin = parsed.origin;
  } catch {
    backendOrigin = apiBase.replace(/\/api\/v1\/?$/, "");
  }

  if (trimmed.startsWith("/api/")) {
    return `${backendOrigin}${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${apiBase}${trimmed}`;
  }

  if (trimmed.startsWith("app/question-bank")) {
    return `${apiBase}/${trimmed}`;
  }

  return `${apiBase}/app/question-bank/audio/${trimmed}`;
};

export const formatAudioTime = (seconds?: number | null): string => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return "00:00";
  }
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
