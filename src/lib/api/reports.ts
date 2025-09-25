import { apiClient } from './client';
import type { ApiResponse, Pagination } from './client';

/**
 * Report data types based on API schema
 */
export interface Report {
    id: string;
    student_id: string;
    container_id: string;
    sensor_data_id: string;
    notes?: string;
    created_at: string;
    modified_at: string;
    created_by?: string;
    modified_by?: string;
}

export interface ReportFormData {
    student_id: string;
    container_id: string;
    sensor_data_id: string;
    notes?: string | null;
}

export interface ReportsListResponse {
    reports: Report[];
    pagination?: Pagination;
}

export interface ReportFilters {
    limit?: number;
    offset?: number;
    student_id?: string;
    container_id?: string;
}

/**
 * Form validation for report data
 */
export const validateReportForm = (data: ReportFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.student_id.trim()) {
        errors.student_id = 'Student is required';
    }

    if (!data.container_id.trim()) {
        errors.container_id = 'Container is required';
    }

    if (!data.sensor_data_id.trim()) {
        errors.sensor_data_id = 'Sensor data is required';
    }

    return errors;
};

/**
 * Reports API class
 */
export class ReportsApi {
    /**
     * Fetch reports with optional pagination and filtering
     */
    static async getReports(params?: ReportFilters): Promise<ApiResponse<ReportsListResponse>> {
        const queryParams = new URLSearchParams();
        
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append('offset', params.offset.toString());
        }
        if (params?.student_id) {
            queryParams.append('student_id', params.student_id);
        }
        if (params?.container_id) {
            queryParams.append('container_id', params.container_id);
        }
        
        const url = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiClient.get<{ data: ReportsListResponse }>(url);
        
        console.log('Raw API response:', response); // Debug log
        
        if (response.data?.data) {
            return {
                data: response.data.data,
            };
        }
        
        return {
            error: response.error || 'Failed to fetch reports'
        };
    }

    /**
     * Get report by ID
     */
    static async getReportById(id: string): Promise<ApiResponse<Report>> {
        const response = await apiClient.get<{ data: Report }>(`/reports/${id}`);
        
        if (response.data?.data) {
            return {
                data: response.data.data,
            };
        }
        
        return {
            error: response.error || 'Report not found'
        };
    }

    /**
     * Create a new report
     */
    static async createReport(report: ReportFormData): Promise<ApiResponse<Report>> {
        const response = await apiClient.post<{ data: Report }>('/reports', report);
        
        if (response.message && !response.error) {
            return {
                message: 'Report created successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to create report'
        };
    }

    /**
     * Update an existing report
     */
    static async updateReport(id: string, report: Partial<ReportFormData>): Promise<ApiResponse<Report>> {
        const response = await apiClient.put<{ data: Report }>(`/reports/${id}`, report);
        
        if (response.message && !response.error) {
            return {
                message: 'Report updated successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to update report'
        };
    }

    /**
     * Delete a report
     */
    static async deleteReport(id: string): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/reports/${id}`);

        if (response.message && !response.error) {
            return {
                message: 'Report deleted successfully'
            };
        }
        
        return {
            error: response.error || 'Failed to delete report'
        };
    }
}

// Export convenience functions
export const getReports = ReportsApi.getReports;
export const createReport = ReportsApi.createReport;
export const updateReport = ReportsApi.updateReport;
export const deleteReport = ReportsApi.deleteReport;
export const getReportById = ReportsApi.getReportById;