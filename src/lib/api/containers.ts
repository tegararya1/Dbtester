import { apiClient } from './client';
import type { ApiResponse, Pagination } from './client';

/**
 * Container data types
 */
export interface Container {
	id: string;
	code: string;
	created_at: string;
	modified_at: string;
}

export interface ContainerFormData {
	code: string;
}

export interface ContainersListResponse {
	containers: Container[];
	pagination?: Pagination;
}

/**
 * Form validation for container data
 */
export const validateContainerForm = (data: ContainerFormData): Record<string, string> => {
	const errors: Record<string, string> = {};

	if (!data.code.trim()) {
		errors.code = 'Container code is required';
	}

	return errors;
};

/**
 * Containers API functions
 */
export class ContainersApi {
	/**
	 * Fetch containers with optional pagination
	 */
	static async getContainers(params?: { 
		limit?: number; 
		offset?: number; 
	}): Promise<ApiResponse<ContainersListResponse>> {
		const queryParams = new URLSearchParams();
		
		if (params?.limit) {
			queryParams.append('limit', params.limit.toString());
		}
		if (params?.offset) {
			queryParams.append('offset', params.offset.toString());
		}
		
		const url = `/containers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<{ data: ContainersListResponse }>(url);
		
		if (response.data?.data) {
			return {
				data: response.data.data,
			};
		}
		
		return {
			error: response.error || 'Failed to fetch containers'
		};
	}

	/**
	 * Get container by ID
	 */
	static async getContainer(id: string): Promise<ApiResponse<Container>> {
		const response = await apiClient.get<{ data: Container }>(`/containers/${id}`);
		
		if (response.data?.data) {
			return {
				data: response.data.data,
			};
		}
		
		return {
			error: response.error || 'Container not found'
		};
	}

	/**
	 * Create a new container
	 */
	static async createContainer(containerData: ContainerFormData): Promise<ApiResponse<Container>> {
		const response = await apiClient.post<{ data: Container }>('/containers', containerData);
		
		if (response.message && !response.error) {
			return {
				message: 'Container created successfully'
			};
		}
		
		return {
			error: response.error || 'Failed to create container'
		};
	}

	/**
	 * Update an existing container
	 */
	static async updateContainer(id: string, containerData: Partial<ContainerFormData>): Promise<ApiResponse<Container>> {
		const response = await apiClient.put<{ data: Container }>(`/containers/${id}`, containerData);
		
		if (response.message && !response.error) {
			return {
				message: 'Container updated successfully'
			};
		}
		
		return {
			error: response.error || 'Failed to update container'
		};
	}

	/**
	 * Delete a container
	 */
	static async deleteContainer(id: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete(`/containers/${id}`);

		if (response.message && !response.error) {
			return {
				message: 'Container deleted successfully'
			};
		}
		
		return {
			error: response.error || 'Failed to delete container'
		};
	}
}

// Export convenience functions
export const getContainers = ContainersApi.getContainers;
export const createContainer = ContainersApi.createContainer;
export const updateContainer = ContainersApi.updateContainer;
export const deleteContainer = ContainersApi.deleteContainer;
export const getContainer = ContainersApi.getContainer;
