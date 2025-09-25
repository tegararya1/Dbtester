<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getReports,
		createReport,
		updateReport,
		deleteReport,
		validateReportForm,
		type Report,
		type ReportFormData
	} from '$lib/api/reports';
	import { getStudents, type Student } from '$lib/api/students';
	import { getContainers, type Container } from '$lib/api/containers';
	import { getSensorData, type SensorData } from '$lib/api/sensor-data';
	import { Modal } from '$lib/ui/modal';
	import { DataTable } from '$lib/ui/datatable';
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { Plus, Loader, FileText, Edit, Trash2, AlertCircle, User, Package, Thermometer, Calendar, StickyNote } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State using $state
	let reportsList = $state<Report[]>([]);
	let loading = $state(false);
	let pagination = $state<{
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	} | null>(null);

	// Modal states
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let showViewModal = $state(false);
	let currentReport = $state<Report | null>(null);

	// Form data
	let formData = $state<ReportFormData>({
		student_id: '',
		container_id: '',
		sensor_data_id: '',
		notes: null
	});

	// Form validation
	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Reference data
	let students = $state<Student[]>([]);
	let containers = $state<Container[]>([]);
	let sensorDataList = $state<SensorData[]>([]);

	// Combobox data
	interface ComboboxData {
		label: string;
		value: string;
		item: any;
	}
	
	let studentComboboxData = $state<ComboboxData[]>([]);
	let containerComboboxData = $state<ComboboxData[]>([]);
	let sensorDataComboboxData = $state<ComboboxData[]>([]);
	
	let selectedStudentIds = $state<string[]>([]);
	let selectedContainerIds = $state<string[]>([]);
	let selectedSensorDataIds = $state<string[]>([]);

	// Fetch reports on mount
	onMount(() => {
		fetchReports({ limit: 25, offset: 0 });
		fetchStudents();
		fetchContainers();
		fetchSensorData();
	});

	// Fetch students from API
	const fetchStudents = async () => {
		try {
			const response = await getStudents({ limit: 100 });
			if (response.data) {
				students = response.data.students || [];
				studentComboboxData = students.map(student => ({
					label: student.full_name,
					value: student.id,
					item: student
				}));
			}
		} catch (err) {
			console.error('Failed to load students:', err);
			toast.error('Failed to load students');
		}
	};

	// Fetch containers from API
	const fetchContainers = async () => {
		try {
			const response = await getContainers({ limit: 100 });
			if (response.data) {
				containers = response.data.containers || [];
				containerComboboxData = containers.map(container => ({
					label: container.code,
					value: container.id,
					item: container
				}));
			}
		} catch (err) {
			console.error('Failed to load containers:', err);
			toast.error('Failed to load containers');
		}
	};

	// Fetch sensor data from API
	const fetchSensorData = async () => {
		try {
			const response = await getSensorData({ limit: 100 });
			if (response.data) {
                sensorDataList = response.data.sensor_data || [];
                sensorDataComboboxData = sensorDataList.map(sensorData => {
                    const last5Digits = sensorData.id.slice(-5);
                    const date = new Date(sensorData.created_at).toLocaleDateString();
                    return {
                        label: `${last5Digits} - ${date}`,
                        value: sensorData.id,
                        item: sensorData
                    };
                });
			}
		} catch (err) {
			console.error('Failed to load sensor data:', err);
			toast.error('Failed to load sensor data');
		}
	};

	// Fetch reports from API
	const fetchReports = async (params?: { limit?: number; offset?: number }) => {
		loading = true;

		try {
			const response = await getReports(params);
			console.log('API Response:', response); // Debug log

			if (response.data) {
				reportsList = response.data.reports || [];
				pagination = response.data.pagination || null;
			} else {
				toast.error(response.error || 'Failed to fetch reports');
			}
		} catch (err) {
			console.error('Network error while fetching reports:', err);
			toast.error('Network error while fetching reports');
		} finally {
			loading = false;
		}
	};

	// Handle pagination changes
	const handlePageChange = (page: number, pageSize: number) => {
		const offset = (page - 1) * pageSize;
		fetchReports({ limit: pageSize, offset });
	};

	// Refresh current page
	const refreshCurrentPage = () => {
		if (pagination) {
			fetchReports({ limit: pagination.limit, offset: pagination.offset });
		} else {
			fetchReports({ limit: 25, offset: 0 });
		}
	};

	// Create new report
	const handleCreateReport = async (event: Event) => {
		event.preventDefault();
		submitting = true;

		formErrors = validateReportForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Please fix the form errors');
			submitting = false;
			return;
		}

		try {
			// Filter out null/empty optional fields for minimal submission
			const submitData: ReportFormData = {
				student_id: formData.student_id,
				container_id: formData.container_id,
				sensor_data_id: formData.sensor_data_id
			};

			// Only add notes if it has a value
			if (formData.notes !== null && formData.notes !== undefined && formData.notes !== '') {
				submitData.notes = formData.notes;
			}

			const response = await createReport(submitData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showAddModal = false;
				toast.success(response.message || 'Report created successfully!');
			} else {
				toast.error(response.error || 'Failed to create report');
			}
		} catch (err) {
			toast.error('Network error while creating report');
		} finally {
			submitting = false;
		}
	};

	// Update existing report
	const handleUpdateReport = async (event: Event) => {
		event.preventDefault();
		if (!currentReport) return;

		submitting = true;

		formErrors = validateReportForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Please fix the form errors');
			submitting = false;
			return;
		}

		try {
			// Filter out null/empty optional fields for minimal submission
			const submitData: Partial<ReportFormData> = {
				student_id: formData.student_id,
				container_id: formData.container_id,
				sensor_data_id: formData.sensor_data_id
			};

			// Only add notes if it has a value
			if (formData.notes !== null && formData.notes !== undefined && formData.notes !== '') {
				submitData.notes = formData.notes;
			}

			const response = await updateReport(currentReport.id, submitData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showEditModal = false;
				currentReport = null;
				toast.success(response.message || 'Report updated successfully!');
			} else {
				toast.error(response.error || 'Failed to update report');
			}
		} catch (err) {
			toast.error('Network error while updating report');
		} finally {
			submitting = false;
		}
	};

	// Delete report
	const handleDeleteReport = async () => {
		if (!currentReport) return;

		submitting = true;

		try {
			const response = await deleteReport(currentReport.id);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				showDeleteModal = false;
				currentReport = null;
				toast.success(response.message);
			} else {
				toast.error(response.error || 'Failed to delete report');
			}
		} catch (err) {
			toast.error('Network error while deleting report');
		} finally {
			submitting = false;
		}
	};

	// Open view modal
	const openViewModal = (report: Report) => {
		currentReport = report;
		showViewModal = true;
	};

	// Open edit modal
	const openEditModal = (report: Report) => {
		currentReport = report;
		formData = {
			student_id: report.student_id,
			container_id: report.container_id,
			sensor_data_id: report.sensor_data_id,
			notes: report.notes || null
		};
		formErrors = {};
		selectedStudentIds = [report.student_id];
		selectedContainerIds = [report.container_id];
		selectedSensorDataIds = [report.sensor_data_id];
		showEditModal = true;
	};

	// Open delete modal
	const openDeleteModal = (report: Report) => {
		currentReport = report;
		showDeleteModal = true;
	};

	// Reset form
	const resetForm = () => {
		formData = {
			student_id: '',
			container_id: '',
			sensor_data_id: '',
			notes: null
		};
		formErrors = {};
		currentReport = null;
		selectedStudentIds = [];
		selectedContainerIds = [];
		selectedSensorDataIds = [];
	};

	// Open add modal
	const openAddModal = () => {
		resetForm();
		showAddModal = true;
	};

	// Close all modals
	const closeModals = () => {
		showAddModal = false;
		showEditModal = false;
		showDeleteModal = false;
		showViewModal = false;
		resetForm();
	};

	// Helper functions to get reference data
	const getStudentName = (studentId: string): string => {
		const student = students.find(s => s.id === studentId);
		return student ? student.full_name : 'Unknown Student';
	};

	const getContainerCode = (containerId: string): string => {
		const container = containers.find(c => c.id === containerId);
		return container ? container.code : 'Unknown Container';
	};

	const getSensorDataId = (sensorDataId: string): string => {
		const sensorData = sensorDataList.find(s => s.id === sensorDataId);
		if (!sensorData) return 'Unknown Sensor Data ID';
		
		return sensorData.id.slice(-5);
	};

    const getSensorDataDate = (sensorDataId: string): string => {
        const sensorData = sensorDataList.find(s => s.id === sensorDataId);
        if (!sensorData) return 'Unknown Date';

        return new Date(sensorData.created_at).toLocaleDateString();
    };
</script>

<svelte:head>
	<title>Reports - Damayanti Dashboard</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6 px-4">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
					Reports
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Manage student reports for container sensor data
				</p>
			</div>
			<button class="btn preset-outlined-primary-500 hover:scale-105" onclick={openAddModal}>
				<Plus class="w-4 h-4 mr-2" />
				Add Report
			</button>
		</div>

		<!-- Reports table -->
		<DataTable 
			data={reportsList}
			loading={loading}
			emptyIcon={FileText}
			emptyTitle="No reports found"
			emptyDescription="Get started by adding your first report"
			emptyButtonText="Add First Report"
			onEmptyButtonClick={openAddModal}
			defaultSort={{ column: 'created_at', direction: 'desc' }}
			showPagination={true}
			pagination={pagination || undefined}
			onPageChange={handlePageChange}
			pageSizeOptions={[10, 25, 50, 100]}
			columns={[
				{
					key: 'student_id',
					label: 'Student',
					sortable: true,
					sortType: 'string',
					render: (report) => `
						<div class="flex items-center">
							<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
								<User class="w-4 h-4 text-primary-600" />
							</div>
							<span class="font-medium text-surface-900 dark:text-surface-50">
								${getStudentName(report.student_id)}
							</span>
						</div>
					`
				},
				{
					key: 'container_id',
					label: 'Container',
					sortable: true,
					sortType: 'string',
					render: (report) => `
						<div class="flex items-center">
							<span class="font-medium text-surface-900 dark:text-surface-50">
								${getContainerCode(report.container_id)}
							</span>
						</div>
					`
				},
				{
					key: 'sensor_data_id',
					label: 'Sensor Data',
					sortable: true,
					sortType: 'string',
					render: (report) => `
						<div class="flex items-center gap-2">
							<span class="badge preset-tonal-primary">
								${getSensorDataId(report.sensor_data_id)}
							</span>
                            -
                            <span class="text-surface-900 dark:text-surface-50">
                                ${getSensorDataDate(report.sensor_data_id)}
                            </span>
						</div>
					`
				},
				{
					key: 'notes',
					label: 'Notes',
					sortable: false,
					render: (report) => `
						<div class="flex items-center">
							${report.notes ? `
								<span class="text-surface-700 dark:text-surface-300 truncate max-w-xs">
									${report.notes}
								</span>
							` : `
								<span class="text-surface-500 dark:text-surface-500 italic">No notes</span>
							`}
						</div>
					`
				},
				{
					key: 'created_at',
					label: 'Created',
					sortable: true,
					sortType: 'date',
					render: (report) => `
						<div class="flex items-center">
							<span class="text-surface-600 dark:text-surface-400">
								${new Date(report.created_at).toLocaleDateString()}
							</span>
						</div>
					`
				}
			]}
			actions={[
				{
					label: 'View',
					icon: FileText,
					onClick: openViewModal,
					ariaLabel: 'View report details'
				},
				{
					label: 'Edit',
					icon: Edit,
					onClick: openEditModal,
					ariaLabel: 'Edit report'
				},
				{
					label: 'Delete',
					icon: Trash2,
					onClick: openDeleteModal,
					variant: 'error',
					ariaLabel: 'Delete report'
				}
			]}
		/>
	</div>
</div>

<!-- Add Report Modal -->
<Modal 
	open={showAddModal} 
	title="Add New Report"
	size="lg"
	on:close={closeModals}
>
	<form onsubmit={handleCreateReport}>
		<div class="space-y-4">
			<!-- Student Selection -->
			<div>
				<label for="add-student_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Student *
				</label>
				<Combobox
					data={studentComboboxData}
					value={selectedStudentIds}
					onValueChange={(e: { value: string[] }) => {
						selectedStudentIds = e.value;
						formData.student_id = e.value[0] || '';
						if (formErrors.student_id && e.value.length > 0) {
							formErrors.student_id = '';
						}
					}}
					label=""
					placeholder="Select a student..."
					inputGroupBase="relative"
					inputGroupInput="input w-full pr-10"
					inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
					contentBackground="bg-surface-50 dark:bg-surface-800"
					contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
					contentMaxHeight="max-h-64"
					optionBase="px-3 py-2 cursor-pointer text-left w-full"
					optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
					optionFocus="bg-primary-100 dark:bg-primary-900/20"
					optionActive="bg-primary-500 text-white"
				/>
				{#if formErrors.student_id}
					<p class="text-error-600 text-sm mt-1">{formErrors.student_id}</p>
				{/if}
			</div>

			<!-- Container Selection -->
			<div>
				<label for="add-container_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Container *
				</label>
				<Combobox
					data={containerComboboxData}
					value={selectedContainerIds}
					onValueChange={(e: { value: string[] }) => {
						selectedContainerIds = e.value;
						formData.container_id = e.value[0] || '';
						if (formErrors.container_id && e.value.length > 0) {
							formErrors.container_id = '';
						}
					}}
					label=""
					placeholder="Select a container..."
					inputGroupBase="relative"
					inputGroupInput="input w-full pr-10"
					inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
					contentBackground="bg-surface-50 dark:bg-surface-800"
					contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
					contentMaxHeight="max-h-64"
					optionBase="px-3 py-2 cursor-pointer text-left w-full"
					optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
					optionFocus="bg-primary-100 dark:bg-primary-900/20"
					optionActive="bg-primary-500 text-white"
				/>
				{#if formErrors.container_id}
					<p class="text-error-600 text-sm mt-1">{formErrors.container_id}</p>
				{/if}
			</div>

			<!-- Sensor Data Selection -->
			<div>
				<label for="add-sensor_data_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Sensor Data *
				</label>
				<Combobox
					data={sensorDataComboboxData}
					value={selectedSensorDataIds}
					onValueChange={(e: { value: string[] }) => {
						selectedSensorDataIds = e.value;
						formData.sensor_data_id = e.value[0] || '';
						if (formErrors.sensor_data_id && e.value.length > 0) {
							formErrors.sensor_data_id = '';
						}
					}}
					label=""
					placeholder="Select sensor data..."
					inputGroupBase="relative"
					inputGroupInput="input w-full pr-10"
					inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
					contentBackground="bg-surface-50 dark:bg-surface-800"
					contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
					contentMaxHeight="max-h-64"
					optionBase="px-3 py-2 cursor-pointer text-left w-full"
					optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
					optionFocus="bg-primary-100 dark:bg-primary-900/20"
					optionActive="bg-primary-500 text-white"
				/>
				{#if formErrors.sensor_data_id}
					<p class="text-error-600 text-sm mt-1">{formErrors.sensor_data_id}</p>
				{/if}
			</div>

			<!-- Notes -->
			<div>
				<label for="add-notes" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Notes
				</label>
				<textarea
					id="add-notes"
					bind:value={formData.notes}
					rows={4}
					class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700"
					placeholder="Add any additional notes about this report..."
				></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button type="button" class="btn preset-filled-surface-500" onclick={closeModals} disabled={submitting}>
				Cancel
			</button>
			<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Creating...
				{:else}
					Create Report
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Edit Report Modal -->
<Modal 
	open={showEditModal} 
	title="Edit Report"
	size="lg"
	on:close={closeModals}
>
	{#if currentReport}
		<form onsubmit={handleUpdateReport}>
			<div class="space-y-6">
				<!-- Student Selection -->
				<div>
					<label for="edit-student_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Student *
					</label>
					<Combobox
						data={studentComboboxData}
						value={selectedStudentIds}
						onValueChange={(e: { value: string[] }) => {
							selectedStudentIds = e.value;
							formData.student_id = e.value[0] || '';
							if (formErrors.student_id && e.value.length > 0) {
								formErrors.student_id = '';
							}
						}}
						label=""
						placeholder="Select a student..."
						inputGroupBase="relative"
						inputGroupInput="input w-full pr-10"
						inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
						contentBackground="bg-surface-50 dark:bg-surface-800"
						contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
						contentMaxHeight="max-h-64"
						optionBase="px-3 py-2 cursor-pointer text-left w-full"
						optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
						optionFocus="bg-primary-100 dark:bg-primary-900/20"
						optionActive="bg-primary-500 text-white"
					/>
				</div>

				<!-- Container Selection -->
				<div>
					<label for="edit-container_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Container *
					</label>
					<Combobox
						data={containerComboboxData}
						value={selectedContainerIds}
						onValueChange={(e: { value: string[] }) => {
							selectedContainerIds = e.value;
							formData.container_id = e.value[0] || '';
							if (formErrors.container_id && e.value.length > 0) {
								formErrors.container_id = '';
							}
						}}
						label=""
						placeholder="Select a container..."
						inputGroupBase="relative"
						inputGroupInput="input w-full pr-10"
						inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
						contentBackground="bg-surface-50 dark:bg-surface-800"
						contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
						contentMaxHeight="max-h-64"
						optionBase="px-3 py-2 cursor-pointer text-left w-full"
						optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
						optionFocus="bg-primary-100 dark:bg-primary-900/20"
						optionActive="bg-primary-500 text-white"
					/>
				</div>

				<!-- Sensor Data Selection -->
				<div>
					<label for="edit-sensor_data_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Sensor Data *
					</label>
					<Combobox
						data={sensorDataComboboxData}
						value={selectedSensorDataIds}
						onValueChange={(e: { value: string[] }) => {
							selectedSensorDataIds = e.value;
							formData.sensor_data_id = e.value[0] || '';
							if (formErrors.sensor_data_id && e.value.length > 0) {
								formErrors.sensor_data_id = '';
							}
						}}
						label=""
						placeholder="Select sensor data..."
						inputGroupBase="relative"
						inputGroupInput="input w-full pr-10"
						inputGroupButton="absolute right-2 top-1/2 -translate-y-1/2 p-1"
						contentBackground="bg-surface-50 dark:bg-surface-800"
						contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-base"
						contentMaxHeight="max-h-64"
						optionBase="px-3 py-2 cursor-pointer text-left w-full"
						optionHover="bg-surface-50 dark:bg-surface-700 rounded-base"
						optionFocus="bg-primary-100 dark:bg-primary-900/20"
						optionActive="bg-primary-500 text-white"
					/>
				</div>

				<!-- Notes -->
				<div>
					<label for="edit-notes" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Notes
					</label>
					<textarea
						id="edit-notes"
						bind:value={formData.notes}
						rows={2}
						class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700"
						placeholder="Add any additional notes about this report..."
					></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button type="button" class="btn preset-filled-surface-500" onclick={closeModals} disabled={submitting}>
					Cancel
				</button>
				<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
					{#if submitting}
						<Loader class="animate-spin h-4 w-4 mr-2" />
						Updating...
					{:else}
						Update Report
					{/if}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- View Report Modal -->
{#if showViewModal && currentReport}
	<Modal 
		open={showViewModal} 
		title="Report Details"
		size="lg"
		on:close={closeModals}
	>
		<div class="space-y-6">
			<!-- Report Information -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-4">
					<div>
						<h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Student</h3>
						<div class="flex items-center p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
							<User class="w-5 h-5 text-primary-600 mr-2" />
							<span class="font-medium">{getStudentName(currentReport.student_id)}</span>
						</div>
					</div>

					<div>
						<h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Container</h3>
						<div class="flex items-center p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
							<Package class="w-5 h-5 text-blue-600 mr-2" />
							<span class="font-medium">{getContainerCode(currentReport.container_id)}</span>
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sensor Data</h3>
						<div class="flex items-center p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
							<Thermometer class="w-5 h-5 text-orange-600 mr-2" />
                            <div class="flex items-center gap-2">
							    <span class="badge preset-tonal-primary">{getSensorDataId(currentReport.sensor_data_id)}</span>
                                <span class="text-surface-500 dark:text-surface-400">{getSensorDataDate(currentReport.sensor_data_id)}</span>
                            </div>
						</div>
					</div>

					<div>
						<h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Created</h3>
						<div class="flex items-center p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
							<Calendar class="w-5 h-5 text-surface-600 mr-2" />
							<span class="text-sm">{new Date(currentReport.created_at).toLocaleString()}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Notes Section -->
			<div>
				<h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Notes</h3>
				<div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg min-h-[120px]">
					{#if currentReport.notes}
						<div class="flex items-start">
							<StickyNote class="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
							<p class="text-surface-900 dark:text-surface-50 leading-relaxed">{currentReport.notes}</p>
						</div>
					{:else}
						<div class="flex items-center justify-center h-full">
							<span class="text-surface-500 dark:text-surface-500 italic">No notes added to this report</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Metadata -->
			{#if currentReport.modified_at !== currentReport.created_at}
				<div class="pt-4 border-t border-surface-200 dark:border-surface-700">
					<div class="text-xs text-surface-500 dark:text-surface-500">
						Last modified: {new Date(currentReport.modified_at).toLocaleString()}
					</div>
				</div>
			{/if}
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button type="button" class="btn preset-filled-surface-500" onclick={closeModals}>
				Close
			</button>
			<button type="button" class="btn preset-outlined-primary-500" onclick={() => { closeModals(); if (currentReport) openEditModal(currentReport); }}>
				<Edit class="w-4 h-4 mr-2" />
				Edit Report
			</button>
		</div>
	</Modal>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && currentReport}
	<Modal 
		open={showDeleteModal} 
		title="Delete Report"
		size="md"
		on:close={closeModals}
	>
		<div class="flex items-start gap-4 mb-6">
			<div class="flex-shrink-0 w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
				<AlertCircle class="w-5 h-5 text-error-600 dark:text-error-400" />
			</div>
			<div class="flex-1">
				<p class="text-surface-900 dark:text-surface-50 font-medium mb-1">
					Are you sure you want to delete this report?
				</p>
				<p class="text-surface-600 dark:text-surface-400 text-sm mb-4">
					Report by <strong>{getStudentName(currentReport.student_id)}</strong> for container <strong>{getContainerCode(currentReport.container_id)}</strong> will be permanently removed. This action cannot be undone.
				</p>
				
				{#if currentReport.notes}
					<div class="bg-surface-100 dark:bg-surface-800 p-3 rounded text-sm">
						<div class="flex items-start">
							<StickyNote class="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
							<span class="text-surface-700 dark:text-surface-300">{currentReport.notes}</span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<button type="button" class="btn preset-filled-surface-500" onclick={closeModals} disabled={submitting}>
				Cancel
			</button>
			<button type="button" class="btn preset-filled-error-500" onclick={handleDeleteReport} disabled={submitting}>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Deleting...
				{:else}
					Delete Report
				{/if}
			</button>
		</div>
	</Modal>
{/if}
