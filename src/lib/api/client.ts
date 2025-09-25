import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Base API configuration
 */
export const API_BASE_URL = browser 
	? (import.meta.env.VITE_API_BASE_URL || 'https://damayanti-api.vercel.app/api')
	: 'https://damayanti-api.vercel.app/api';

/**
 * API response wrapper type
 */
export interface ApiResponse<T = any> {
	data?: T;
	message?: string;
	error?: string;
}

export interface Pagination {
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
}

/**
 * HTTP request options
 */
export interface RequestOptions extends Omit<RequestInit, 'headers'> {
	headers?: Record<string, string>;
	requireAuth?: boolean;
}

/**
 * Base API client with authentication support
 */
class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	/**
	 * Make an authenticated request
	 */
	private async makeRequest<T>(
		endpoint: string, 
		options: RequestOptions = {}
	): Promise<ApiResponse<T>> {
		const { headers = {}, requireAuth = true, ...fetchOptions } = options;

		// Set default headers
		const requestHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
			...headers,
		};

		// Add authentication if required
		if (requireAuth) {
			const authState = get(authStore);
			if (authState.token) {
				requestHeaders['Authorization'] = `Bearer ${authState.token}`;
			}
		}

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				...fetchOptions,
				headers: requestHeaders,
			});

			// Parse response
			const data = await response.json();

			if (response.ok) {
				return {
					data,
					message: data.message,
				};
			} else {
				return {
					error: data.message || `HTTP ${response.status}: ${response.statusText}`,
					message: data.message,
				};
			}
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : 'Network error occurred',
			};
		}
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.makeRequest<T>(endpoint, {
			...options,
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.makeRequest<T>(endpoint, {
			...options,
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.makeRequest<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined,
		});
	}
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Legacy compatibility function for existing code
 * @deprecated Use apiClient methods instead
 */
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const authState = get(authStore);
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	// Add additional headers from options
	if (options.headers) {
		Object.assign(headers, options.headers);
	}

	if (authState.token) {
		headers['Authorization'] = `Bearer ${authState.token}`;
	}

	return fetch(url, {
		...options,
		headers
	});
};
