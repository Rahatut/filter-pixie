import type { FilterParameters } from '../types/filters';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getApiUrl(path: string): string {
  if (import.meta.env.PROD && !API_BASE) {
    throw new Error('The image service is not configured. Set VITE_API_URL in GitHub Actions.');
  }

  return `${API_BASE}${path}`;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 90000
): Promise<Response> {
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  const callerSignal = init?.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);

  if (callerSignal) {
    if (callerSignal.aborted) abortFromCaller();
    else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout) {
      const timeoutError = new Error('Request timed out. The image service may be starting up.');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw error;
  } finally {
    if (callerSignal) callerSignal.removeEventListener('abort', abortFromCaller);
    clearTimeout(timeoutId);
  }
}

function isRetryableError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TypeError' || error.name === 'TimeoutError');
}

async function waitBeforeRetry(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function applyFilter(
  file: File,
  filterId: string,
  intensity: number,
  parameters: FilterParameters,
  polaroid: boolean,
  signal?: AbortSignal
): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('filter_name', filterId);
  formData.append('intensity', intensity.toString());
  formData.append('parameters', JSON.stringify(parameters));
  formData.append('polaroid', polaroid.toString());

  const maxAttempts = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(getApiUrl('/apply-filter'), {
        method: 'POST',
        body: formData,
        signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: '' }));
        throw new Error(error.detail || `Filter service returned ${response.status}.`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Something went wrong');
      if (attempt < maxAttempts && isRetryableError(lastError) && !signal?.aborted) {
        await waitBeforeRetry();
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

export async function fetchFilters(): Promise<Record<string, string>> {
  const response = await fetchWithTimeout(getApiUrl('/filters'));
  if (!response.ok) throw new Error('Failed to fetch filters');
  return response.json();
}