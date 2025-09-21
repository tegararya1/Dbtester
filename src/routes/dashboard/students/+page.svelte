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
	import { Plus, Loader, Users, Edit, Trash2, AlertCircle } from 'lucide-svelte';
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
			<button class="btn preset-outlined-primary-500 hover:scale-105" onclick={openAddModal}>
				<Plus class="w-4 h-4 mr-2" />
				Add Student
			</button>
		</div>

		<!-- Students table -->
		<div class="card py-6 px-2">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<Loader class="animate-spin h-8 w-8 text-primary-600" />
					<span class="ml-2 text-surface-600 dark:text-surface-400">Loading students...</span>
				</div>
			{:else if students.length === 0}
				<div class="text-center py-12">
					<Users class="w-12 h-12 text-surface-400 mx-auto mb-4" />
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
												class="btn btn-sm hover:scale-105" 
												onclick={() => openEditModal(student)}
												aria-label="Edit student"
											>
												<Edit class="w-4 h-4" />
											</button>
											<button 
												class="btn btn-sm preset-tonal-error hover:scale-105" 
												onclick={() => openDeleteModal(student)}
												aria-label="Delete student"
											>
												<Trash2 class="w-4 h-4" />
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
					{#if formErrors.full_name}
						<p class="text-error-500 text-sm mt-1">{formErrors.full_name}</p>
					{/if}
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button type="button" class="btn variant-ghost" onclick={closeAllModals} disabled={submitting}>
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
				<button type="button" class="btn variant-ghost" onclick={closeAllModals} disabled={submitting}>
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