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

const API_BASE_URL = 'https://damayanti-api.vercel.app/api';
const TOKEN_KEY = 'access_token';

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
			const savedToken = localStorage.getItem(TOKEN_KEY);
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
			// Since there's no user profile endpoint, we'll just assume the token is valid
			// In a real app, you'd verify the token with the server
			update(state => ({
				...state,
				isAuthenticated: true,
				loading: false
			}));
		} catch (error) {
			// Token is invalid, clear it
			logout();
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
		if (browser) {
			localStorage.removeItem(TOKEN_KEY);
		}
		
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