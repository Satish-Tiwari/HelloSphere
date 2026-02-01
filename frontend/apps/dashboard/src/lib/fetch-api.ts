import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  // Use environment variable for backend URL, fallback to localhost:5000/api/v1
  const backendUrl = process.env.BACKEND_ENDPOINT || "http://localhost:5000/api/v1";
  const mockApiUrl = "http://localhost:3024";

  // Check if request is for dashboard-specific data (served by mock API)
  const isDashboardApi = path.startsWith("/api/dashboard");

  // Choose the appropriate base URL
  const baseUrl = isDashboardApi ? mockApiUrl : backendUrl;

  // Ensure we don't have double "api" or "api/v1" if path also starts with it
  // This handles cases where path is like "/api/dashboard/activity" but baseUrl is ".../api/v1"
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  // If we are using the backend URL (which includes /api/v1), strip leading "api/" from path
  // If we are using mock API (which is just localhost:3024), we KEEP the full path
  if (!isDashboardApi && cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.substring(4); // Remove "api/"
  }

  const url = `${baseUrl}/${cleanPath}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store", // Default to no-store for dynamic data
  });

  if (!response.ok) {
    // Try to parse error message from JSON, fallback to status text
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // Response was not JSON
    }
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  return response.json() as Promise<T>;
}
