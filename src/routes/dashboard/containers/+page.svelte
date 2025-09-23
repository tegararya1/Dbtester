<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import {
		getContainers,
		createContainer,
		updateContainer,
		deleteContainer,
		validateContainerForm,
		type Container,
		type ContainerFormData
	} from '$lib/api/containers';
	import { getStudents, type Student } from '$lib/api/students';
	import { Modal } from '$lib/ui/modal';
	import { DataTable } from '$lib/ui/datatable';
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { Plus, Loader, Package, Edit, Trash2, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State using $state
	let containers = $state<Container[]>([]);
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
	let currentContainer = $state<Container | null>(null);

	// Form data
	let formData = $state<ContainerFormData>({
		code: '',
		location: '',
		student_id: ''
	});

	// Form validation
	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Student combobox data
	interface StudentComboboxData {
		label: string;
		value: string;
		student: Student;
	}
	
	let students = $state<Student[]>([]);
	let studentComboboxData = $state<StudentComboboxData[]>([]);
	let selectedStudentIds = $state<string[]>([]);

	// Reactive authentication state
	let authState = $state($authStore);

	// Subscribe to auth store changes
	authStore.subscribe((state) => {
		authState = state;
	});

	// Fetch containers on mount
	onMount(() => {
		fetchContainers({ limit: 25, offset: 0 });
		fetchStudents();
	});

	// Fetch students from API
	const fetchStudents = async () => {
		try {
			const response = await getStudents();
			if (response.data) {
				students = response.data.students || [];
				// Transform students data for combobox
				studentComboboxData = students.map(student => ({
					label: student.full_name,
					value: student.id,
					student: student
				}));
			}
		} catch (err) {
			console.error('Failed to load students:', err);
		}
	};

	// Fetch containers from API
	const fetchContainers = async (params?: { limit?: number; offset?: number }) => {
		loading = true;

		try {
			const response = await getContainers(params);

			if (response.data) {
				containers = response.data.containers || [];
				pagination = response.data.pagination || null;
			} else {
				toast.error(response.error || 'Failed to fetch containers');
			}
		} catch (err) {
			toast.error('Network error while fetching containers');
		} finally {
			loading = false;
		}
	};

	// Handle pagination changes
	const handlePageChange = (page: number, pageSize: number) => {
		const offset = (page - 1) * pageSize;
		fetchContainers({ limit: pageSize, offset });
	};

	// Refresh current page
	const refreshCurrentPage = () => {
		if (pagination) {
			fetchContainers({ limit: pagination.limit, offset: pagination.offset });
		} else {
			fetchContainers({ limit: 25, offset: 0 });
		}
	};

	// Create new container
	const handleCreateContainer = async (event: Event) => {
		event.preventDefault();
		submitting = true;

		formErrors = validateContainerForm(formData);

		if (Object.keys(formErrors).length > 0) {
            toast.error('Error creating container: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			const response = await createContainer(formData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showAddModal = false;
				toast.success(response.message || 'Container created successfully!');
			}
		} catch (err) {
			toast.error('Network error while creating container');
		} finally {
			submitting = false;
		}
	};

	// Update existing container
	const handleUpdateContainer = async (event: Event) => {
		event.preventDefault();
		if (!currentContainer) return;

		submitting = true;

		formErrors = validateContainerForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Error updating container: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			const response = await updateContainer(currentContainer.id, formData);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showEditModal = false;
				currentContainer = null;
				toast.success(response.message || 'Container updated successfully!');
			} else {
				toast.error(response.error || 'Failed to update container');
			}
		} catch (err) {
			toast.error('Network error while updating container');
		} finally {
			submitting = false;
		}
	};

	// Delete container
	const handleDeleteContainer = async () => {
		if (!currentContainer) return;

		submitting = true;

		try {
			const response = await deleteContainer(currentContainer.id);

			if (response.message) {
				await refreshCurrentPage(); // Refresh the list
				showDeleteModal = false;
				currentContainer = null;
				toast.success(response.message);
			} else {
				toast.error(response.error || 'Failed to delete container');
			}
		} catch (err) {
			toast.error('Network error while deleting container');
		} finally {
			submitting = false;
		}
	};

	// Open edit modal
	const openEditModal = (container: Container) => {
		currentContainer = container;
		formData = {
			code: container.code,
			location: container.location,
			student_id: container.student_id
		};
		formErrors = {};
		selectedStudentIds = container.student_id ? [container.student_id] : [];
		showEditModal = true;
	};

	// Open delete modal
	const openDeleteModal = (container: Container) => {
		currentContainer = container;
		showDeleteModal = true;
	};

	// Reset form
	const resetForm = () => {
		formData = {
			code: '',
			location: '',
			student_id: ''
		};
		formErrors = {};
		currentContainer = null;
		selectedStudentIds = [];
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
</script>

<svelte:head>
	<title>Containers - Damayanti Dashboard</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6 px-4">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
					Containers
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Manage container records and information
				</p>
			</div>
			<button class="btn preset-outlined-primary-500 hover:scale-105" onclick={openAddModal}>
				<Plus class="w-4 h-4 mr-2" />
				Add Container
			</button>
		</div>

		<!-- Containers table -->
		<DataTable 
			data={containers}
			loading={loading}
			emptyIcon={Package}
			emptyTitle="No containers found"
			emptyDescription="Get started by adding your first container"
			emptyButtonText="Add First Container"
			onEmptyButtonClick={openAddModal}
			defaultSort={{ column: 'code', direction: 'asc' }}
			showPagination={true}
			pagination={pagination || undefined}
			onPageChange={handlePageChange}
			pageSizeOptions={[10, 25, 50, 100]}
			columns={[
				{
					key: 'code',
					label: 'Code',
					sortable: true,
					sortType: 'string',
					render: (container) => `
						<div class="flex items-center">
							<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
								<span class="text-sm font-medium text-primary-600">
									${container.code.charAt(0).toUpperCase()}
								</span>
							</div>
							<span class="font-medium text-surface-900 dark:text-surface-50">
								${container.code}
							</span>
						</div>
					`
				},
				{
					key: 'location',
					label: 'Location',
					sortable: true,
					sortType: 'string',
					render: (container) => `<span class="text-surface-600 dark:text-surface-400">${container.location}</span>`
				},
				{
					key: 'created_at',
					label: 'Created',
					sortable: true,
					sortType: 'date',
					render: (container) => `<span class="text-surface-600 dark:text-surface-400">${new Date(container.created_at).toLocaleDateString()}</span>`
				}
			]}
			actions={[
				{
					label: 'Edit',
					icon: Edit,
					onClick: openEditModal,
					ariaLabel: 'Edit container'
				},
				{
					label: 'Delete',
					icon: Trash2,
					onClick: openDeleteModal,
					variant: 'error',
					ariaLabel: 'Delete container'
				}
			]}
		/>
	</div>
</div>

<!-- Add Container Modal -->
<Modal 
	open={showAddModal} 
	title="Add New Container"
	size="md"
	on:close={closeModals}
>
	<form onsubmit={handleCreateContainer}>
		<div class="space-y-4">
			<!-- Container Code -->
			<div>
				<label for="add-code" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Container Code *
				</label>
				<input
					id="add-code"
					type="text"
					bind:value={formData.code}
					class="input w-full {formErrors.code ? 'input-error' : ''}"
					placeholder="Enter container code (e.g., C001)"
					required
				/>
				{#if formErrors.code}
					<p class="text-error-500 text-sm mt-1">{formErrors.code}</p>
				{/if}
			</div>

			<!-- Location -->
			<div>
				<label for="add-location" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Location *
				</label>
				<input
					id="add-location"
					type="text"
					bind:value={formData.location}
					class="input w-full {formErrors.location ? 'input-error' : ''}"
					placeholder="Enter container location (e.g., Warehouse A, Section 1)"
					required
				/>
				{#if formErrors.location}
					<p class="text-error-500 text-sm mt-1">{formErrors.location}</p>
				{/if}
			</div>

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
						// Clear error when student is selected
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
				>
					{#snippet item(item: StudentComboboxData)}
						<div class="flex w-full justify-between space-x-2">
							<span>{item.label}</span>
							<span class="text-sm text-surface-500">
								{new Date(item.student.created_at).toLocaleDateString()}
							</span>
						</div>
					{/snippet}
				</Combobox>
				{#if formErrors.student_id}
					<p class="text-error-500 text-sm mt-1">{formErrors.student_id}</p>
				{/if}
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
					Create Container
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Edit Container Modal -->
<Modal 
	open={showEditModal} 
	title="Edit Container"
	size="md"
	on:close={closeModals}
>
	{#if currentContainer}
		<form onsubmit={handleUpdateContainer}>
			<div class="space-y-4">
				<!-- Container Code -->
				<div>
					<label for="edit-code" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Container Code *
					</label>
					<input
						id="edit-code"
						type="text"
						bind:value={formData.code}
						class="input w-full {formErrors.code ? 'input-error' : ''}"
						placeholder="Enter container code"
						required
					/>
					{#if formErrors.code}
						<p class="text-error-500 text-sm mt-1">{formErrors.code}</p>
					{/if}
				</div>

				<!-- Location -->
				<div>
					<label for="edit-location" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Location *
					</label>
					<input
						id="edit-location"
						type="text"
						bind:value={formData.location}
						class="input w-full {formErrors.location ? 'input-error' : ''}"
						placeholder="Enter container location"
						required
					/>
					{#if formErrors.location}
						<p class="text-error-500 text-sm mt-1">{formErrors.location}</p>
					{/if}
				</div>

				<!-- Student Selection -->
				<div>
					<label for="edit-student_id" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Student *
					</label>
					<Combobox
						zIndex="999"
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
						contentBase="border border-surface-300 dark:border-surface-600 shadow-lg rounded-container-token mt-1"
						contentMaxHeight="max-h-64"
						optionBase="px-3 py-2 cursor-pointer text-left w-full"
						optionHover="bg-surface-100 dark:bg-surface-700"
						optionFocus="bg-primary-100 dark:bg-primary-900/20"
						optionActive="bg-primary-500 text-white"
					>
						{#snippet item(item: StudentComboboxData)}
							<div class="flex w-full justify-between space-x-2">
								<span>{item.label}</span>
								<span class="text-sm text-surface-500">
									{new Date(item.student.created_at).toLocaleDateString()}
								</span>
							</div>
						{/snippet}
					</Combobox>
					{#if formErrors.student_id}
						<p class="text-error-500 text-sm mt-1">{formErrors.student_id}</p>
					{/if}
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
						Update Container
					{/if}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && currentContainer}
	<Modal 
		open={showDeleteModal} 
		title="Delete Container"
		size="md"
		on:close={closeModals}
	>
		<div class="flex items-start gap-4 mb-6">
			<div class="flex-shrink-0 w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
				<AlertCircle class="w-5 h-5 text-error-600 dark:text-error-400" />
			</div>
			<div class="flex-1">
				<p class="text-surface-900 dark:text-surface-50 font-medium mb-1">
					Are you sure you want to delete this container?
				</p>
				<p class="text-surface-600 dark:text-surface-400 text-sm mb-4">
					<strong>{currentContainer.code}</strong> ({currentContainer.location}) will be permanently removed from the system. This action cannot be undone.
				</p>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<button type="button" class="btn preset-filled-surface-500" onclick={closeModals} disabled={submitting}>
				Cancel
			</button>
			<button type="button" class="btn preset-filled-error-500" onclick={handleDeleteContainer} disabled={submitting}>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Deleting...
				{:else}
					Delete Container
				{/if}
			</button>
		</div>
	</Modal>
{/if}
