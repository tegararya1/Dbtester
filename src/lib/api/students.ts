import { apiClient } from './client';
import type { ApiResponse, Pagination } from './client';

/**
 * Student data types
 */
export interface Student {
	id: string;
	full_name: string;
	created_at: string;
	updated_at: string;
}

export interface StudentFormData {
	full_name: string;
}

export interface StudentsListResponse {
	students: Student[];
	pagination?: Pagination;
}

/**
 * Form validation for student data
 */
export const validateStudentForm = (data: StudentFormData): Record<string, string> => {
	const errors: Record<string, string> = {};

	if (!data.full_name.trim()) {
		errors.full_name = 'Full name is required';
	}

	return errors;
};

/**
 * Students API functions
 */
export class StudentsApi {
	/**
	 * Fetch all students
	 */
	static async getStudents(params?: {
		limit?: number;
		offset?: number;
	}): Promise<ApiResponse<StudentsListResponse>> {
		const queryParams = new URLSearchParams();

		if (params?.limit) {
			queryParams.append('limit', params.limit.toString());
		}
		if (params?.offset) {
			queryParams.append('offset', params.offset.toString());
		}

		const url = `/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<{ data: StudentsListResponse }>(url);

		if (response.data?.data) {
			return {
				data: response.data.data,
			};
		}

		return {
			error: response.error || 'Failed to fetch students',
		};
	}

	/**
	 * Get a single student by ID
	 */
	static async getStudent(id: string): Promise<ApiResponse<Student>> {
		const response = await apiClient.get<{ data: Student }>(`/students/${id}`);

		if (response.data?.data) {
			return {
				data: response.data.data,
			};
		}

		return {
			error: response.error || 'Failed to fetch student',
		};
	}

	/**
	 * Create a new student
	 */
	static async createStudent(studentData: StudentFormData): Promise<ApiResponse<string>> {
		// Validate form data
		const validationErrors = validateStudentForm(studentData);
		if (Object.keys(validationErrors).length > 0) {
			return {
				error: 'Validation failed',
				data: validationErrors as any,
			};
		}

		const response = await apiClient.post<{ message: string }>('/students', studentData);

		if (response.message && !response.error) {
			return {
				data: 'success',
				message: response.message,
			};
		}

		return {
			error: response.error || 'Failed to create student',
		};
	}

	/**
	 * Update an existing student
	 */
	static async updateStudent(id: string, studentData: StudentFormData): Promise<ApiResponse<string>> {
		// Validate form data
		const validationErrors = validateStudentForm(studentData);
		if (Object.keys(validationErrors).length > 0) {
			return {
				error: 'Validation failed',
				data: validationErrors as any,
			};
		}

		const response = await apiClient.put<{ message: string }>(`/students/${id}`, studentData);

		if (response.message && !response.error) {
			return {
				data: 'success',
				message: response.message,
			};
		}

		return {
			error: response.error || 'Failed to update student',
		};
	}

	/**
	 * Delete a student
	 */
	static async deleteStudent(id: string): Promise<ApiResponse<string>> {
		const response = await apiClient.delete<{ message: string }>(`/students/${id}`);

		if (response.message && !response.error) {
			return {
				data: 'success',
				message: response.message,
			};
		}

		return {
			error: response.error || 'Failed to delete student',
		};
	}
}

/**
 * Convenience functions for easier importing
 */
export const {
	getStudents,
	getStudent,
	createStudent,
	updateStudent,
	deleteStudent,
} = StudentsApi;
