<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { 
		getStudents, 
		createStudent, 
		updateStudent, 
		deleteStudent,
		validateStudentForm,
		type Student,
		type StudentFormData 
	} from '$lib/api/students';
	import { Modal } from '$lib/ui/modal';
	import { DataTable } from '$lib/ui/datatable';
	import { Plus, Loader, Users, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State using $state
	let students = $state<Student[]>([]);
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
	let currentStudent = $state<Student | null>(null);

	// Form data
	let formData = $state<StudentFormData>({
		full_name: ''
	});

	// Form validation
	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Reactive authentication state
	let authState = $state($authStore);

	// Subscribe to auth store changes
	authStore.subscribe(state => {
		authState = state;
	});

	// Fetch students on mount
	onMount(() => {
		fetchStudents({ limit: 25, offset: 0 });
	});

	// Fetch students from API
	const fetchStudents = async (params?: { limit?: number; offset?: number }) => {
		loading = true;

		try {
			const response = await getStudents(params);
			
			if (response.data) {
				students = response.data.students || [];
				pagination = response.data.pagination || null;
			} else {
                toast.error(response.error || 'Failed to fetch students');
			}
		} catch (err) {
			toast.error('Network error while fetching students');
		} finally {
			loading = false;
		}
	};

	// Create new student
	const handleCreateStudent = async (event: Event) => {
		event.preventDefault();
		submitting = true;
		formErrors = validateStudentForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Error creating student: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			const response = await createStudent(formData);
			
			if (response.data) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showAddModal = false;
				toast.success(response.message || 'Student created successfully!');
			} else {
				toast.error(response.error || 'Failed to create student');
			}
		} catch (err) {
			toast.error('Network error while creating student');
		} finally {
			submitting = false;
		}
	};

	// Update existing student
	const handleUpdateStudent = async (event: Event) => {
		event.preventDefault();
		if (!currentStudent) return;

		submitting = true;
		formErrors = validateStudentForm(formData);

		if (Object.keys(formErrors).length > 0) {
			toast.error('Error updating student: ' + JSON.stringify(formErrors));
			submitting = false;
			return;
		}

		try {
			const response = await updateStudent(currentStudent.id, formData);
			
			if (response.data) {
				await refreshCurrentPage(); // Refresh the list
				resetForm();
				showEditModal = false;
				currentStudent = null;
				toast.success(response.message || 'Student updated successfully!');
			} else {
				toast.error(response.error || 'Failed to update student');
			}
		} catch (err) {
			toast.error('Network error while updating student');
		} finally {
			submitting = false;
		}
	};

	// Delete student
	const handleDeleteStudent = async () => {
		if (!currentStudent) return;

		submitting = true;

		try {
			const response = await deleteStudent(currentStudent.id);
			
			if (!response.error) {
				await refreshCurrentPage(); // Refresh the list
				showDeleteModal = false;
				currentStudent = null;
				toast.success(response.message || 'Student deleted successfully!');
			} else {
				toast.error(response.error || 'Failed to delete student');
			}
		} catch (err) {
			toast.error('Network error while deleting student');
		} finally {
			submitting = false;
		}
	};

	// Handle pagination
	const handlePageChange = (page: number, pageSize: number) => {
		const offset = (page - 1) * pageSize;
		fetchStudents({ limit: pageSize, offset });
	};

	// Refresh current page
	const refreshCurrentPage = () => {
		if (pagination) {
			fetchStudents({ limit: pagination.limit, offset: pagination.offset });
		} else {
			fetchStudents({ limit: 25, offset: 0 });
		}
	};

	// Modal helpers
	const openAddModal = () => {
		resetForm();
		showAddModal = true;
	};

	const openEditModal = (student: Student) => {
		currentStudent = student;
		formData = {
			full_name: student.full_name,
		};
		formErrors = {};
		showEditModal = true;
	};

	const openDeleteModal = (student: Student) => {
		currentStudent = student;
		showDeleteModal = true;
	};

	const resetForm = () => {
		formData = {
			full_name: '',
		};
		formErrors = {};
		currentStudent = null;
	};

	const closeAllModals = () => {
		showAddModal = false;
		showEditModal = false;
		showDeleteModal = false;
		resetForm();
	};
</script>

<svelte:head>
	<title>Students - Damayanti Dashboard</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6 px-4">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
					Students
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Manage student records and information
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button class="btn-icon preset-tonal-surface hover:scale-105" onclick={refreshCurrentPage} disabled={loading}>
					<RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
				</button>
				<button class="btn preset-outlined-primary-500 hover:scale-105" onclick={openAddModal}>
					<Plus class="w-4 h-4" />
					Add Student
				</button>
			</div>
		</div>

		<!-- Students table -->
		<DataTable 
			data={students}
			loading={loading}
			emptyIcon={Users}
			emptyTitle="No students found"
			emptyDescription="Get started by adding your first student"
			emptyButtonText="Add First Student"
			onEmptyButtonClick={openAddModal}
			showPagination={true}
			pagination={pagination || undefined}
			onPageChange={handlePageChange}
			pageSizeOptions={[10, 25, 50, 100]}
			defaultSort={{ column: 'full_name', direction: 'asc' }}
			columns={[
				{
					key: 'full_name',
					label: 'Name',
					sortable: true,
					sortType: 'string',
					render: (student) => `
						<div class="flex items-center">
							<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
								<span class="text-sm font-medium text-primary-600">
									${student.full_name.charAt(0).toUpperCase()}
								</span>
							</div>
							<span class="font-medium text-surface-900 dark:text-surface-50">
								${student.full_name}
							</span>
						</div>
					`
				},
				{
					key: 'created_at',
					label: 'Created',
					sortable: true,
					sortType: 'date',
					render: (student) => `<span class="text-surface-600 dark:text-surface-400">${new Date(student.created_at).toLocaleDateString()}</span>`
				}
			]}
			actions={[
				{
					label: 'Edit',
					icon: Edit,
					onClick: openEditModal,
					ariaLabel: 'Edit student'
				},
				{
					label: 'Delete',
					icon: Trash2,
					onClick: openDeleteModal,
					variant: 'error',
					ariaLabel: 'Delete student'
				}
			]}
		/>
	</div>
</div>

<!-- Add Student Modal -->
<Modal 
	open={showAddModal} 
	title="Add New Student"
	size="md"
	on:close={closeAllModals}
>
	<form onsubmit={handleCreateStudent}>
		<div class="space-y-4">
			<div>
				<label for="add-full-name" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
					Full Name *
				</label>
				<input 
					id="add-full-name"
					type="text" 
					bind:value={formData.full_name}
					class="input w-full {formErrors.full_name ? 'input-error' : ''}"
					placeholder="Enter full name"
					required
				>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button type="button" class="btn preset-filled-surface-500" onclick={closeAllModals} disabled={submitting}>
				Cancel
			</button>
			<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
				{#if submitting}
					<Loader class="animate-spin h-4 w-4 mr-2" />
					Creating...
				{:else}
					Create Student
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Edit Student Modal -->
<Modal 
	open={showEditModal} 
	title="Edit Student"
	size="md"
	on:close={closeAllModals}
>
	{#if currentStudent}
		<form onsubmit={handleUpdateStudent}>
			<div class="space-y-4">
				<div>
					<label for="edit-full-name" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
						Full Name *
					</label>
					<input 
						id="edit-full-name"
						type="text" 
						bind:value={formData.full_name}
						class="input w-full {formErrors.full_name ? 'input-error' : ''}"
						placeholder="Enter full name"
						required
					>
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button type="button" class="btn preset-filled-surface-500" onclick={closeAllModals} disabled={submitting}>
					Cancel
				</button>
				<button type="submit" class="btn preset-filled-primary-500" disabled={submitting}>
					{#if submitting}
						<Loader class="animate-spin h-4 w-4 mr-2" />
						Updating...
					{:else}
						Update Student
					{/if}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && currentStudent}
	<Modal 
		open={showDeleteModal} 
		title="Delete Student"
		size="md"
		on:close={closeAllModals}
	>
		<div class="flex items-start gap-4 mb-6">
			<div class="flex-shrink-0 w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
				<AlertCircle class="w-5 h-5 text-error-600 dark:text-error-400" />
			</div>
			<div class="flex-1">
				<p class="text-surface-900 dark:text-surface-50 font-medium mb-1">
					Are you sure you want to delete this student?
				</p>
				<p class="text-surface-600 dark:text-surface-400 text-sm">
					<strong>{currentStudent.full_name}</strong> will be permanently removed from the system. This action cannot be undone.
				</p>
			</div>
		</div>

			<div class="flex justify-end gap-3">
				<button type="button" class="btn preset-filled-surface-500" onclick={closeAllModals} disabled={submitting}>
					Cancel
				</button>
				<button type="button" class="btn preset-filled-error-500" onclick={handleDeleteStudent} disabled={submitting}>
					{#if submitting}
						<Loader class="animate-spin h-4 w-4 mr-2" />
						Deleting...
					{:else}
						Delete Student
					{/if}
				</button>
		</div>
	</Modal>
{/if}