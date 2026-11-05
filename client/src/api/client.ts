const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
// Strip trailing slashes so concatenated paths remain consistent
const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '/api';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function resolveApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = localStorage.getItem('kd_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-dev-access': 'true', // Direct access mode in development
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData uploads (browser auto-sets boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = resolveApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await response.text();
      const text = rawText.trim();
      let diagnosticMessage = '';

      if (response.status === 404) {
        const isVercelEdge =
          response.headers.get('server')?.toLowerCase().includes('vercel') ||
          response.headers.has('x-vercel-id') ||
          text.includes('NOT_FOUND') ||
          text.includes('The page could not be found');

        if (isVercelEdge) {
          diagnosticMessage = `Backend API route not found (404) on Vercel: The frontend requested '${url}', which hit the Vercel static router instead of a running backend server. Ensure VITE_API_URL is configured in your Vercel Project Settings (e.g., https://your-backend.up.railway.app/api) and redeploy.`;
        } else {
          diagnosticMessage = `API endpoint not found (404 Not Found at ${url}). Please ensure the endpoint is registered on the backend server.`;
        }
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        diagnosticMessage = `Backend service unavailable (HTTP ${response.status} ${response.statusText} at ${url}). The backend server on Railway may be starting up or experiencing temporary downtime.`;
      } else if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        diagnosticMessage = `Server returned an HTML error page (HTTP ${response.status} ${response.statusText} at ${url}) instead of JSON. Check backend server logs and verify VITE_API_URL configuration.`;
      } else {
        const snippet = text.slice(0, 160).replace(/\s+/g, ' ');
        diagnosticMessage = `Server returned non-JSON response (HTTP ${response.status} ${response.statusText} at ${url}): ${snippet || 'Empty response'}`;
      }

      console.error(`[API Diagnostic] ${diagnosticMessage}`);

      return {
        success: false,
        error: {
          status: response.status,
          statusText: response.statusText,
          message: diagnosticMessage,
          url
        }
      };
    }

    let result: any;
    try {
      result = await response.json();
    } catch (parseErr: any) {
      return {
        success: false,
        error: { message: `Failed to parse JSON response from ${url}: ${parseErr.message}` }
      };
    }

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: { message: result.error?.message || result.message || `API request failed with status ${response.status}` }
      };
    }

    return result;
  } catch (err: any) {
    const isNetworkFailure = err.message === 'Failed to fetch' || err.name === 'TypeError';
    const message = isNetworkFailure
      ? `Unable to connect to backend server at ${url}. Please verify network connectivity and ensure the backend is running.`
      : (err.message || 'Network request failed');

    console.error(`API Error [${endpoint}]:`, message);
    return {
      success: false,
      error: { message }
    };
  }
}
