import { apiClient } from './client';
import type { ApiResponse, Pagination } from './client';

export interface SensorData {
    id: string;
    container_id: string;
    temperature?: number;
    humidity?: number;
    gas?: number;
    ph?: number;
    status?: string;
    created_at: string;
    modified_at: string;
}

export interface SensorDataFormData {
    container_id: string;
    temperature?: number | null;
    humidity?: number | null;
    gas?: number | null;
    ph?: number | null;
    status?: string | null;
}

export interface SensorDataListResponse {
    sensor_data: SensorData[];
    pagination?: Pagination;
}

export interface SensorDataFilters {
    limit?: number;
    offset?: number;
    container_id?: string;
    date_from?: string;
    date_to?: string;
}

export const validateSensorDataForm = (data: SensorDataFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.container_id.trim()) {
        errors.container_id = 'Container is required';
    }

    if (data.temperature !== null && data.temperature !== undefined) {
        if (data.temperature < -50 || data.temperature > 100) {
            errors.temperature = 'Temperature must be between -50°C and 100°C';
        }
    }

    if (data.humidity !== null && data.humidity !== undefined) {
        if (data.humidity < 0 || data.humidity > 100) {
            errors.humidity = 'Humidity must be between 0% and 100%';
        }
    }

    if (data.gas !== null && data.gas !== undefined) {
        if (data.gas < 0) {
            errors.gas = 'Gas reading cannot be negative';
        }
    }

    if (data.ph !== null && data.ph !== undefined) {
        if (data.ph < 0 || data.ph > 14) {
            errors.ph = 'pH must be between 0 and 14';
        }
    }

    return errors;
};

export class SensorDataApi {
    static async getSensorData(params?: SensorDataFilters): Promise<ApiResponse<SensorDataListResponse>> {
        const queryParams = new URLSearchParams();
        
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append('offset', params.offset.toString());
        }
        if (params?.container_id) {
            queryParams.append('container_id', params.container_id);
        }
        if (params?.date_from) {
            queryParams.append('date_from', params.date_from);
        }
        if (params?.date_to) {
            queryParams.append('date_to', params.date_to);
        }
        
        const url = `/sensor-data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiClient.get<{ data: SensorDataListResponse }>(url);
        
        console.log('Raw API response:', response); // Debug log
        
        if (response.data?.data) {
            return {
                data: response.data.data,
            };
        }
        
        return {
            error: response.error || 'Failed to fetch sensor data'
        };
    }

    static async getSensorDataById(id: string): Promise<ApiResponse<SensorData>> {
        const response = await apiClient.get<{ data: SensorData }>(`/sensor-data/${id}`);
        
        if (response.data?.data) {
            return {
                data: response.data.data,
            };
        }
        
        return {
            error: response.error || 'Sensor data not found'
        };
    }

    static async getLatestSensorData(containerId: string): Promise<ApiResponse<SensorData>> {
        const response = await apiClient.get<{ data: SensorData }>(`/sensor-data/latest/${containerId}`);
        
        if (response.data?.data) {
            return {
                data: response.data.data,
            };
        }
        
        return {
            error: response.error || 'No sensor data found for this container'
        };
    }

    static async createSensorData(sensorData: SensorDataFormData): Promise<ApiResponse<SensorData>> {
        const response = await apiClient.post<{ data: SensorData }>('/sensor-data', sensorData);
        
        if (response.message && !response.error) {
            return {
                message: 'Sensor data created successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to create sensor data'
        };
    }

    static async updateSensorData(id: string, sensorData: Partial<SensorDataFormData>): Promise<ApiResponse<SensorData>> {
        const response = await apiClient.put<{ data: SensorData }>(`/sensor-data/${id}`, sensorData);
        
        if (response.message && !response.error) {
            return {
                message: 'Sensor data updated successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to update sensor data'
        };
    }

    static async deleteSensorData(id: string): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/sensor-data/${id}`);

        if (response.message && !response.error) {
            return {
                message: 'Sensor data deleted successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to delete sensor data'
        };
    }
}

export const getSensorData = SensorDataApi.getSensorData;
export const createSensorData = SensorDataApi.createSensorData;
export const updateSensorData = SensorDataApi.updateSensorData;
export const deleteSensorData = SensorDataApi.deleteSensorData;
export const getSensorDataById = SensorDataApi.getSensorDataById;
export const getLatestSensorData = SensorDataApi.getLatestSensorData;
