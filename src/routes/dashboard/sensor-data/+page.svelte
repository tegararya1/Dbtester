<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import {
		getSensorData,
		createSensorData,
		updateSensorData,
		deleteSensorData,
		validateSensorDataForm,
		type SensorData,
		type SensorDataFormData
	} from '$lib/api/sensor-data';
	import { getContainers, type Container } from '$lib/api/containers';
	import { Modal } from '$lib/ui/modal';
	import { DataTable } from '$lib/ui/datatable';
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import {
		Plus,
		Loader,
		Thermometer,
		Edit,
		Trash2,
		AlertCircle,
		Droplets,
		Wind,
		FlaskConical
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State using $state
	let sensorDataList = $state<SensorData[]>([]);
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
	let currentSensorData = $state<SensorData | null>(null);

	// Form data
	let formData = $state<SensorDataFormData>({
		container_id: '',
		temperature: null,
		humidity: null,
		gas: null,
		ph: null,
		status: null
	});

	let status = $state<string[]>(['Belum Siap', 'Hampir Siap', 'Sudah Siap']);

	// Form validation
	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Container combobox data
	interface ContainerComboboxData {
		label: string;
		value: string;
		container: Container;
	}

	let containers = $state<Container[]>([]);
	let containerComboboxData = $state<ContainerComboboxData[]>([]);
	let selectedContainerIds = $state<string[]>([]);

	// Reactive authentication state
	let authState = $state($authStore);

	// Subscribe to auth store changes
	authStore.subscribe((state) => {
		authState = state;
	});

	// Fetch sensor data on mount
	onMount(() => {
		fetchSensorData({ limit: 25, offset: 0 });
		fetchContainers();
	});

	// Fetch containers from API
	const fetchContainers = async () => {
		try {
			const response = await getContainers();
			if (response.data) {
				containers = response.data.containers || [];
				// Transform containers data for combobox
				containerComboboxData = containers.map((container) => ({
					label: `${container.code}`,
					value: container.id,
					container: container
				}));
			}
		} catch (err) {
			console.error('Failed to load containers:', err);
			toast.error('Failed to load containers');
		}
	};

	// Fetch sensor data from API
	const fetchSensorData = async (params?: { limit?: number; offset?: number }) => {
		loading = true;

		try {
			const response = await getSensorData(params);

			if (response.data) {
				sensorDataList = response.data.sensor_data || [];
				pagination = response.data.pagination || null;
			} else {
				toast.error(response.error || 'Failed to fetch sensor data');
			}
		} catch (err) {
			console.error('Network error while fetching sensor data:', err);
			toast.error('Network error while fetching sensor data');
		} finally {
			loading = false;
		}
	};

	// Handle pagination changes
	const handlePageChange = (page: number, pageSize: number) => {
		const offset = (page - 1) * pageSize;
		fetchSensorData({ limit: pageSize, offset });
	};

	// Refresh current page
	const refreshCurrentPage = () => {
		if (pagination) {
			fetchSensorData({ limit: pagination.limit, offset: pagination.offset });
		} else {
			fetchSensorData({ limit: 25, offset: 0 });
		}
	};

	// Create new sensor data
	const handleCreateSensorData = async (event: Event) => {
		event.preventDefault();
		submitting = true;

		formErrors = validateSensorDataForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Error creating sensor data: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			// Filter out null/empty optional fields for minimal submission
			const submitData: SensorDataFormData = {
				container_id: formData.container_id
			};

			// Only add optional fields if they have values
			if (formData.temperature !== null && formData.temperature !== undefined) {
				submitData.temperature = formData.temperature;
			}
			if (formData.humidity !== null && formData.humidity !== undefined) {
				submitData.humidity = formData.humidity;
			}
			if (formData.gas !== null && formData.gas !== undefined) {
				submitData.gas = formData.gas;
			}
			if (formData.ph !== null && formData.ph !== undefined) {
				submitData.ph = formData.ph;
			}
			if (formData.status !== null && formData.status !== undefined && formData.status !== '') {
				submitData.status = formData.status;
			}

			const response = await createSensorData(submitData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showAddModal = false;
				toast.success(response.message || 'Sensor data created successfully!');
			}
		} catch (err) {
			toast.error('Network error while creating sensor data');
		} finally {
			submitting = false;
		}
	};

	// Update existing sensor data
	const handleUpdateSensorData = async (event: Event) => {
		event.preventDefault();
		if (!currentSensorData) return;

		submitting = true;

		formErrors = validateSensorDataForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Error updating sensor data: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			// Filter out null/empty optional fields for minimal submission
			const submitData: Partial<SensorDataFormData> = {
				container_id: formData.container_id
			};

			// Only add optional fields if they have values
			if (formData.temperature !== null && formData.temperature !== undefined) {
				submitData.temperature = formData.temperature;
			}
			if (formData.humidity !== null && formData.humidity !== undefined) {
				submitData.humidity = formData.humidity;
			}
			if (formData.gas !== null && formData.gas !== undefined) {
				submitData.gas = formData.gas;
			}
			if (formData.ph !== null && formData.ph !== undefined) {
				submitData.ph = formData.ph;
			}
			if (formData.status !== null && formData.status !== undefined && formData.status !== '') {
				submitData.status = formData.status;
			}

			const response = await updateSensorData(currentSensorData.id, submitData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showEditModal = false;
				currentSensorData = null;
				toast.success(response.message || 'Sensor data updated successfully!');
			} else {
				toast.error(response.error || 'Failed to update sensor data');
			}
		} catch (err) {
			toast.error('Network error while updating sensor data');
		} finally {
			submitting = false;
		}
	};

	// Delete sensor data
	const handleDeleteSensorData = async () => {
		if (!currentSensorData) return;

		submitting = true;

		try {
			const response = await deleteSensorData(currentSensorData.id);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				showDeleteModal = false;
				currentSensorData = null;
				toast.success(response.message);
			} else {
				toast.error(response.error || 'Failed to delete sensor data');
			}
		} catch (err) {
			toast.error('Network error while deleting sensor data');
		} finally {
			submitting = false;
		}
	};

	// Open edit modal
	const openEditModal = (sensorData: SensorData) => {
		currentSensorData = sensorData;
		formData = {
			container_id: sensorData.container_id,
			temperature: sensorData.temperature,
			humidity: sensorData.humidity,
			gas: sensorData.gas,
			ph: sensorData.ph,
			status: sensorData.status
		};
		formErrors = {};
		selectedContainerIds = sensorData.container_id ? [sensorData.container_id] : [];
		showEditModal = true;
	};

	// Open delete modal
	const openDeleteModal = (sensorData: SensorData) => {
		currentSensorData = sensorData;
		showDeleteModal = true;
	};

	// Reset form
	const resetForm = () => {
		formData = {
			container_id: '',
			temperature: null,
			humidity: null,
			gas: null,
			ph: null,
			status: null
		};
		formErrors = {};
		currentSensorData = null;
		selectedContainerIds = [];
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
		resetForm();
	};

	// Get container code by id for display
	const getContainerCode = (containerId: string): string => {
		const container = containers.find((c) => c.id === containerId);
		return container ? container.code : 'Unknown';
	};

	// Format number with units
	const formatTemperature = (temp: number | null | undefined): string =>
		`${temp != null ? temp : 'N/A'}°C`;
	const formatHumidity = (humidity: number | null | undefined): string =>
		`${humidity != null ? humidity : 'N/A'}%`;
	const formatGas = (gas: number | null | undefined): string => `${gas != null ? gas : 'N/A'} ppm`;
	const formatPH = (ph: number | null | undefined): string => `${ph != null ? ph : 'N/A'} pH`;
</script>

<svelte:head>
	<title>Sensor Data - Damayanti Dashboard</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6 px-4">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">Sensor Data</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Monitor and manage sensor readings from containers
				</p>
			</div>
			<button class="btn preset-outlined-primary-500 hover:scale-105" onclick={openAddModal}>
				<Plus class="w-4 h-4 mr-2" />
				Add Sensor Reading
			</button>
		</div>

		<!-- Sensor data table -->
		<DataTable
			data={sensorDataList}
			{loading}
			emptyIcon={Thermometer}
			emptyTitle="No sensor data found"
			emptyDescription="Get started by adding your first sensor reading"
			emptyButtonText="Add First Reading"
			onEmptyButtonClick={openAddModal}
			defaultSort={{ column: 'created_at', direction: 'desc' }}
			showPagination={true}
			pagination={pagination || undefined}
			onPageChange={handlePageChange}
			pageSizeOptions={[10, 25, 50, 100]}
			columns={[
				{
					key: 'container_id',
					label: 'Container',
					sortable: true,
					sortType: 'string',
					render: (sensorData) => `
						<div class="flex items-center">
							<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
								<span class="text-sm font-medium text-primary-600">
									${getContainerCode(sensorData.container_id).charAt(0).toUpperCase()}
								</span>
							</div>
							<span class="font-medium text-surface-900 dark:text-surface-50">
								${getContainerCode(sensorData.container_id)}
							</span>
						</div>
					`
				},
				{
					key: 'temperature',
					label: 'Temperature',
					sortable: true,
					sortType: 'number',
					render: (sensorData) => `
						<div class="flex items-center">
							<svg class="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
							</svg>
							<span class="text-surface-900 dark:text-surface-50 font-medium">
								${formatTemperature(sensorData.temperature)}
							</span>
						</div>
					`
				},
				{
					key: 'humidity',
					label: 'Humidity',
					sortable: true,
					sortType: 'number',
					render: (sensorData) => `
						<div class="flex items-center">
							<svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"/>
							</svg>
							<span class="text-surface-900 dark:text-surface-50 font-medium">
								${formatHumidity(sensorData.humidity)}
							</span>
						</div>
					`
				},
				{
					key: 'gas',
					label: 'Gas',
					sortable: true,
					sortType: 'number',
					render: (sensorData) => `
						<div class="flex items-center">
							<svg class="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
							</svg>
							<span class="text-surface-900 dark:text-surface-50 font-medium">
								${formatGas(sensorData.gas)}
							</span>
						</div>
					`
				},
				{
					key: 'ph',
					label: 'pH Level',
					sortable: true,
					sortType: 'number',
					render: (sensorData) => `
						<div class="flex items-center">
							<svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
							</svg>
							<span class="text-surface-900 dark:text-surface-50 font-medium">
								${formatPH(sensorData.ph)}
							</span>
						</div>
					`
				},
				{
					key: 'status',
					label: 'Status',
					sortable: true,
					sortType: 'string',
					render: (sensorData) => `
						<div class="flex items-center">
							${(() => {
								const statusColors = {
									[status[0]]: 'preset-tonal-error',
									[status[1]]: 'preset-tonal-warning', 
									[status[2]]: 'preset-tonal-success'
								};
								
								const color = statusColors[sensorData.status] || 'text-surface-600 dark:text-surface-400 italic';
								const displayText = sensorData.status || 'N/A';
								
								return `
									<span class="badge ${color} font-medium">${displayText}</span>
									`;
							})()}
						</div>
					`
				},
				{
					key: 'created_at',
					label: 'Recorded',
					sortable: true,
					sortType: 'date',
					render: (sensorData) =>
						`<span class="text-surface-600 dark:text-surface-400">${new Date(sensorData.created_at).toLocaleDateString()}</span>`
				}
			]}
			actions={[
				{
					label: 'Edit',
					icon: Edit,
					onClick: openEditModal,
					ariaLabel: 'Edit sensor reading'
				},
				{
					label: 'Delete',
					icon: Trash2,
					onClick: openDeleteModal,
					variant: 'error',
					ariaLabel: 'Delete sensor reading'
				}
			]}
		/>
	</div>
</div>

<!-- Add Sensor Data Modal -->
<Modal open={showAddModal} title="Add New Sensor Reading" size="lg" on:close={closeModals}>
	<form onsubmit={handleCreateSensorData}>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Container Selection -->
			<div class="md:col-span-2">
				<label
					for="add-container_id"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					Container *
				</label>
				<Combobox
					data={containerComboboxData}
					value={selectedContainerIds}
					onValueChange={(e: { value: string[] }) => {
						selectedContainerIds = e.value;
						formData.container_id = e.value[0] || '';
						// Clear error when container is selected
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
				>
					{#snippet item(item: ContainerComboboxData)}
						<div class="flex w-full justify-between space-x-2">
							<span>{item.label}</span>
							<span class="text-sm text-surface-500">
								{new Date(item.container.created_at).toLocaleDateString()}
							</span>
						</div>
					{/snippet}
				</Combobox>
			</div>

			<!-- Temperature -->
			<div>
				<label
					for="add-temperature"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					Temperature (°C)
				</label>
				<input
					id="add-temperature"
					type="number"
					step="0.1"
					min="-50"
					max="100"
					bind:value={formData.temperature}
					class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.temperature
						? 'input-error'
						: ''}"
					placeholder="25.5"
				/>
			</div>

			<!-- Humidity -->
			<div>
				<label
					for="add-humidity"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					Humidity (%)
				</label>
				<input
					id="add-humidity"
					type="number"
					step="0.1"
					min="0"
					max="100"
					bind:value={formData.humidity}
					class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.humidity
						? 'input-error'
						: ''}"
					placeholder="60.2"
				/>
			</div>

			<!-- Gas -->
			<div>
				<label
					for="add-gas"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					Gas (ppm)
				</label>
				<input
					id="add-gas"
					type="number"
					step="0.01"
					min="0"
					bind:value={formData.gas}
					class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.gas
						? 'input-error'
						: ''}"
					placeholder="0.03"
				/>
			</div>

			<!-- pH -->
			<div>
				<label
					for="add-ph"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					pH Level
				</label>
				<input
					id="add-ph"
					type="number"
					step="0.1"
					min="0"
					max="14"
					bind:value={formData.ph}
					class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.ph
						? 'input-error'
						: ''}"
					placeholder="7.2"
				/>
			</div>

			<!-- status -->
			<div>
				<label
					for="add-status"
					class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
				>
					status
				</label>
				<select
					bind:value={formData.status}
					class="select w-full {formErrors.status ? 'select-error' : ''}"
					aria-label="Select status"
					placeholder="Select status"
				>
					{#each status as stat}
						<option value={stat}>{stat}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button
				type="button"
				class="btn preset-filled-surface-500"
				onclick={closeModals}
				disabled={submitting}
			>
				Cancel
			</button>
			<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Creating...
				{:else}
					Create Reading
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Edit Sensor Data Modal -->
<Modal open={showEditModal} title="Edit Sensor Reading" size="lg" on:close={closeModals}>
	{#if currentSensorData}
		<form onsubmit={handleUpdateSensorData}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Container Selection -->
				<div class="md:col-span-2">
					<label
						for="edit-container_id"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						Container *
					</label>
					<Combobox
						zIndex="999"
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
						contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-container-token mt-1"
						contentMaxHeight="max-h-64"
						optionBase="px-3 py-2 cursor-pointer text-left w-full"
						optionHover="bg-surface-100 dark:bg-surface-700"
						optionFocus="bg-primary-100 dark:bg-primary-900/20"
						optionActive="bg-primary-500 text-white"
					>
						{#snippet item(item: ContainerComboboxData)}
							<div class="flex w-full justify-between space-x-2">
								<span>{item.label}</span>
								<span class="text-sm text-surface-500">
									{new Date(item.container.created_at).toLocaleDateString()}
								</span>
							</div>
						{/snippet}
					</Combobox>
				</div>

				<!-- Temperature -->
				<div>
					<label
						for="edit-temperature"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						Temperature (°C) *
					</label>
					<input
						id="edit-temperature"
						type="number"
						step="0.1"
						min="-50"
						max="100"
						bind:value={formData.temperature}
						class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.temperature
							? 'input-error'
							: ''}"
						placeholder="25.5"
					/>
				</div>

				<!-- Humidity -->
				<div>
					<label
						for="edit-humidity"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						Humidity (%) *
					</label>
					<input
						id="edit-humidity"
						type="number"
						step="0.1"
						min="0"
						max="100"
						bind:value={formData.humidity}
						class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.humidity
							? 'input-error'
							: ''}"
						placeholder="60.2"
					/>
				</div>

				<!-- Gas -->
				<div>
					<label
						for="edit-gas"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						Gas (ppm) *
					</label>
					<input
						id="edit-gas"
						type="number"
						step="0.01"
						min="0"
						bind:value={formData.gas}
						class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.gas
							? 'input-error'
							: ''}"
						placeholder="0.03"
					/>
				</div>

				<!-- pH -->
				<div>
					<label
						for="edit-ph"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						pH Level *
					</label>
					<input
						id="edit-ph"
						type="number"
						step="0.1"
						min="0"
						max="14"
						bind:value={formData.ph}
						class="input w-full placeholder:text-surface-200 dark:placeholder:text-surface-700 {formErrors.ph
							? 'input-error'
							: ''}"
						placeholder="7.0"
					/>
				</div>

				<!-- status -->
				<div>
					<label
						for="add-status"
						class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
					>
						status
					</label>
					<select
						bind:value={formData.status}
						class="select w-full {formErrors.status ? 'select-error' : ''}"
						aria-label="Select status"
						placeholder="Select status"
					>
						{#each status as stat}
							<option value={stat}>{stat}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button
					type="button"
					class="btn preset-filled-surface-500"
					onclick={closeModals}
					disabled={submitting}
				>
					Cancel
				</button>
				<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
					{#if submitting}
						<Loader class="animate-spin h-4 w-4 mr-2" />
						Updating...
					{:else}
						Update Reading
					{/if}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && currentSensorData}
	<Modal open={showDeleteModal} title="Delete Sensor Reading" size="md" on:close={closeModals}>
		<div class="flex items-start gap-4 mb-6">
			<div
				class="flex-shrink-0 w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center"
			>
				<AlertCircle class="w-5 h-5 text-error-600 dark:text-error-400" />
			</div>
			<div class="flex-1">
				<p class="text-surface-900 dark:text-surface-50 font-medium mb-1">
					Are you sure you want to delete this sensor reading?
				</p>
				<p class="text-surface-600 dark:text-surface-400 text-sm mb-4">
					Reading from <strong>{getContainerCode(currentSensorData.container_id)}</strong> recorded
					on <strong>{new Date(currentSensorData.created_at).toLocaleString()}</strong> will be permanently
					removed. This action cannot be undone.
				</p>
				<div class="grid grid-cols-2 gap-4 text-sm bg-surface-100 dark:bg-surface-800 p-3 rounded">
					<div>
						<div class="flex items-center text-orange-600">
							<Thermometer class="w-3 h-3 mr-1" />
							<span class="font-medium">{formatTemperature(currentSensorData.temperature)}</span>
						</div>
						<div class="flex items-center text-blue-600 mt-1">
							<Droplets class="w-3 h-3 mr-1" />
							<span class="font-medium">{formatHumidity(currentSensorData.humidity)}</span>
						</div>
					</div>
					<div>
						<div class="flex items-center text-yellow-600">
							<Wind class="w-3 h-3 mr-1" />
							<span class="font-medium">{formatGas(currentSensorData.gas)}</span>
						</div>
						<div class="flex items-center text-purple-600 mt-1">
							<FlaskConical class="w-3 h-3 mr-1" />
							<span class="font-medium">{formatPH(currentSensorData.ph)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<button
				type="button"
				class="btn preset-filled-surface-500"
				onclick={closeModals}
				disabled={submitting}
			>
				Cancel
			</button>
			<button
				type="button"
				class="btn preset-filled-error-500"
				onclick={handleDeleteSensorData}
				disabled={submitting}
			>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Deleting...
				{:else}
					Delete Reading
				{/if}
			</button>
		</div>
	</Modal>
{/if}
