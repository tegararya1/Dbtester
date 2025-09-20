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
	import { toast } from 'svelte-sonner';

	// State using $state
	let students = $state<Student[]>([]);
	let loading = $state(false);

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
		fetchStudents();
	});

	// Fetch students from API
	const fetchStudents = async () => {
		loading = true;

		try {
			const response = await getStudents();
			
			if (response.data) {
				students = response.data.students || [];
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
			submitting = false;
			return;
		}

		try {
			const response = await createStudent(formData);
			
			if (response.data) {
				await fetchStudents(); // Refresh the list
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
			submitting = false;
			return;
		}

		try {
			const response = await updateStudent(currentStudent.id, formData);
			
			if (response.data) {
				await fetchStudents(); // Refresh the list
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
				await fetchStudents(); // Refresh the list
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

<div class="p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
					Students
				</h1>
				<p class="text-surface-600 dark:text-surface-400">
					Manage student records and information
				</p>
			</div>
			<button class="btn variant-filled-primary" onclick={openAddModal}>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Add Student
			</button>
		</div>

		<!-- Students table -->
		<div class="card p-6">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span class="ml-2 text-surface-600 dark:text-surface-400">Loading students...</span>
				</div>
			{:else if students.length === 0}
				<div class="text-center py-12">
					<svg class="w-12 h-12 text-surface-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
					</svg>
					<h3 class="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">
						No students found
					</h3>
					<p class="text-surface-600 dark:text-surface-400 mb-4">
						Get started by adding your first student
					</p>
					<button class="btn variant-filled-primary" onclick={openAddModal}>
						Add First Student
					</button>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-surface-200 dark:border-surface-700">
								<th class="text-left p-4 font-medium text-surface-900 dark:text-surface-50">Name</th>
								<th class="text-left p-4 font-medium text-surface-900 dark:text-surface-50">Created</th>
								<th class="text-right p-4 font-medium text-surface-900 dark:text-surface-50">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each students as student}
								<tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
									<td class="p-4">
										<div class="flex items-center">
											<div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
												<span class="text-sm font-medium text-primary-600">
													{student.full_name.charAt(0).toUpperCase()}
												</span>
											</div>
											<span class="font-medium text-surface-900 dark:text-surface-50">
												{student.full_name}
											</span>
										</div>
									</td>
									<td class="p-4 text-surface-600 dark:text-surface-400">
										{new Date(student.created_at).toLocaleDateString()}
									</td>
									<td class="p-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<button 
												class="btn btn-sm variant-ghost" 
												onclick={() => openEditModal(student)}
												aria-label="Edit student"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<button 
												class="btn btn-sm variant-ghost-error" 
												onclick={() => openDeleteModal(student)}
												aria-label="Delete student"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
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
				{#if formErrors.full_name}
					<p class="text-error-500 text-sm mt-1">{formErrors.full_name}</p>
				{/if}
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button type="button" class="btn variant-ghost" onclick={closeAllModals} disabled={submitting}>
				Cancel
			</button>
			<button type="submit" class="btn variant-filled-primary" disabled={submitting}>
				{#if submitting}
					<svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
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
					{#if formErrors.full_name}
						<p class="text-error-500 text-sm mt-1">{formErrors.full_name}</p>
					{/if}
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button type="button" class="btn variant-ghost" onclick={closeAllModals} disabled={submitting}>
					Cancel
				</button>
				<button type="submit" class="btn variant-filled-primary" disabled={submitting}>
					{#if submitting}
						<svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
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
				<svg class="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
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
				<button type="button" class="btn variant-ghost" onclick={closeAllModals} disabled={submitting}>
					Cancel
				</button>
				<button type="button" class="btn variant-filled-error" onclick={handleDeleteStudent} disabled={submitting}>
					{#if submitting}
						<svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Deleting...
					{:else}
						Delete Student
					{/if}
				</button>
		</div>
	</Modal>
{/if}