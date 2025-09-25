import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Types
interface User {
	id: string;
	email: string;
	full_name: string;
	created_at: string;
	modified_at: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	loading: boolean;
}

interface LoginRequest {
	email: string;
	password: string;
}

interface AuthResponse {
	access_token: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'access_token';

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clear tokens from localStorage
 */
function clearTokens(): void {
	if (browser) {
		localStorage.removeItem(TOKEN_KEY);
	}
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		const currentTime = Date.now() / 1000;
		return payload.exp < currentTime;
	} catch (error) {
		console.error('Error parsing token:', error);
		return true;
	}
}

// Initial state
const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	token: null,
	loading: true
};

// Create the store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	// Initialize store with token from localStorage
	const init = () => {
		if (browser) {
			const savedToken = getAccessToken();
			if (savedToken) {
				update(state => ({
					...state,
					token: savedToken,
					isAuthenticated: true,
					loading: false
				}));
				// Optionally validate token by fetching user profile
				validateToken(savedToken);
			} else {
				update(state => ({ ...state, loading: false }));
			}
		}
	};

	// Validate token by making an authenticated request
	const validateToken = async (token: string) => {
		try {
			// Check if token is expired
			if (isTokenExpired(token)) {
				throw new Error('Token expired');
			}
			
			update(state => ({
				...state,
				isAuthenticated: true,
				loading: false
			}));
		} catch (error) {
			// Token is invalid or expired, clear it and redirect
			clearTokens();
			set({
				isAuthenticated: false,
				user: null,
				token: null,
				loading: false
			});

			// Redirect to login page if we're in a browser
			if (browser && typeof window !== 'undefined') {
				window.location.href = '/';
			}
		}
	};

	// Login function
	const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
		update(state => ({ ...state, loading: true }));

		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(credentials)
			});

			if (!response.ok) {
				const errorData = await response.json();
				update(state => ({ ...state, loading: false }));
				return { 
					success: false, 
					error: errorData.error || 'Login failed' 
				};
			}

			const data: AuthResponse = await response.json();
			const token = data.access_token;

			// Save token to localStorage
			if (browser) {
				localStorage.setItem(TOKEN_KEY, token);
			}

			// Update store state
			update(state => ({
				...state,
				isAuthenticated: true,
				token,
				loading: false
			}));

			return { success: true };
		} catch (error) {
			update(state => ({ ...state, loading: false }));
			return { 
				success: false, 
				error: 'Network error. Please try again.' 
			};
		}
	};

	// Logout function
	const logout = () => {
		clearTokens();
		
		set({
			isAuthenticated: false,
			user: null,
			token: null,
			loading: false
		});

		// Redirect to login page
		if (browser) {
			goto('/login');
		}
	};

	// Get auth headers for API requests
	const getAuthHeaders = () => {
		const state = get(authStore);
		if (state.token) {
			return {
				'Authorization': `Bearer ${state.token}`,
				'Content-Type': 'application/json'
			};
		}
		return {
			'Content-Type': 'application/json'
		};
	};

	return {
		subscribe,
		init,
		login,
		logout,
		getAuthHeaders
	};
}

// Export the store
export const authStore = createAuthStore();

/**
 * Check if user is authenticated (has valid access token)
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
	try {
		const token = getAccessToken();
		if (!token) return false;
		return !isTokenExpired(token);
	} catch (error) {
		console.error('Error checking authentication:', error);
		return false;
	}
}

// Helper function to get current auth state
function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
	let value: T;
	const unsubscribe = store.subscribe(val => value = val);
	unsubscribe();
	return value!;
}

// Initialize the store when the module loads
if (browser) {
	authStore.init();
}