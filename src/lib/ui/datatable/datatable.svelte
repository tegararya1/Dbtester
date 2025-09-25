<script lang="ts">
	import {
		Loader,
		ChevronUp,
		ChevronDown,
		ChevronsUpDown,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight
	} from 'lucide-svelte';
	import { useMobile } from '$lib/hooks';

	// Generic types for the datatable
	interface DataTableColumn<T = any> {
		key: string;
		label: string;
		align?: 'left' | 'right' | 'center';
		render?: (item: T) => string | any; // Can return string or HTML
		sortable?: boolean; // Whether this column can be sorted
		sortType?: 'string' | 'number' | 'date'; // How to sort this column
	}

	type SortDirection = 'asc' | 'desc' | null;

	interface SortState {
		column: string | null;
		direction: SortDirection;
	}

	interface DataTableAction<T = any> {
		label: string;
		icon: any; // Lucide icon component
		onClick: (item: T) => void;
		variant?: 'default' | 'error';
		ariaLabel?: string;
	}

	interface PaginationInfo {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	}

	interface PaginationState {
		currentPage: number;
		pageSize: number;
	}

	// Props
	interface Props<T = any> {
		data: T[];
		columns: DataTableColumn<T>[];
		actions?: DataTableAction<T>[];
		loading?: boolean;
		emptyIcon?: any;
		emptyTitle?: string;
		emptyDescription?: string;
		emptyButtonText?: string;
		onEmptyButtonClick?: () => void;
		keyField?: string; // Field to use as unique key for each row
		defaultSort?: { column: string; direction: 'asc' | 'desc' }; // Default sorting
		// Pagination props
		pagination?: PaginationInfo;
		onPageChange?: (page: number, pageSize: number) => void;
		showPagination?: boolean;
		pageSizeOptions?: number[];
	}

	let {
		data,
		columns,
		actions = [],
		loading = false,
		emptyIcon,
		emptyTitle = 'No data found',
		emptyDescription = 'Get started by adding your first item',
		emptyButtonText,
		onEmptyButtonClick,
		keyField = 'id',
		defaultSort,
		// Pagination props
		pagination,
		onPageChange,
		showPagination = false,
		pageSizeOptions = [10, 25, 50, 100]
	}: Props = $props();

	// Mobile detection hook
	const { isMobile } = useMobile();

	// Sorting state
	let sortState = $state<SortState>({
		column: defaultSort?.column || null,
		direction: defaultSort?.direction || null
	});

	// Sort data based on current sort state - use a reactive variable
	let sortedData = $state<any[]>([]);

	// Update sorted data when data or sort state changes
	$effect(() => {
		if (!sortState.column || !sortState.direction) {
			sortedData = data;
			return;
		}

		const column = columns.find((col) => col.key === sortState.column);
		if (!column?.sortable) {
			sortedData = data;
			return;
		}

		const sortType = column.sortType || 'string';
		const direction = sortState.direction;

		sortedData = [...data].sort((a, b) => {
			const aValue = getNestedValue(a, sortState.column!);
			const bValue = getNestedValue(b, sortState.column!);

			let comparison = 0;

			switch (sortType) {
				case 'number':
					comparison = (Number(aValue) || 0) - (Number(bValue) || 0);
					break;
				case 'date':
					comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
					break;
				case 'string':
				default:
					comparison = String(aValue || '').localeCompare(String(bValue || ''));
					break;
			}

			return direction === 'desc' ? -comparison : comparison;
		});
	});

	// Pagination state
	let paginationState = $state<PaginationState>({
		currentPage: pagination ? Math.floor(pagination.offset / pagination.limit) + 1 : 1,
		pageSize: pagination?.limit || pageSizeOptions[0]
	});

	// Update pagination state when pagination prop changes
	$effect(() => {
		if (pagination) {
			paginationState.currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
			paginationState.pageSize = pagination.limit;
		}
	});

	// Calculate pagination info
	const getPaginationInfo = () => {
		if (!pagination || !showPagination) return null;

		const totalPages = Math.ceil(pagination.total / pagination.limit);
		const startItem = pagination.offset + 1;
		const endItem = Math.min(pagination.offset + pagination.limit, pagination.total);
		const startPage = Math.max(1, paginationState.currentPage - 2);
		const endPage = Math.min(totalPages, paginationState.currentPage + 2);

		return {
			currentPage: paginationState.currentPage,
			totalPages,
			startItem,
			endItem,
			totalItems: pagination.total,
			hasMore: pagination.hasMore,
			startPage,
			endPage
		};
	};

	// Handle pagination
	const handlePageChange = (newPage: number) => {
		if (!onPageChange || !pagination) return;

		const newOffset = (newPage - 1) * paginationState.pageSize;
		onPageChange(newPage, paginationState.pageSize);
		paginationState.currentPage = newPage;
	};

	const handlePageSizeChange = (newPageSize: number) => {
		if (!onPageChange) return;

		paginationState.pageSize = newPageSize;
		paginationState.currentPage = 1;
		onPageChange(1, newPageSize);
	};

	// Handle column header click for sorting
	const handleSort = (column: DataTableColumn) => {
		if (!column.sortable) return;

		if (sortState.column === column.key) {
			// Cycle through: asc -> desc -> null
			if (sortState.direction === 'asc') {
				sortState.direction = 'desc';
			} else if (sortState.direction === 'desc') {
				sortState.column = null;
				sortState.direction = null;
			}
		} else {
			// New column, start with ascending
			sortState.column = column.key;
			sortState.direction = 'asc';
		}
	};

	// Get sort icon for column header
	const getSortIcon = (column: DataTableColumn) => {
		if (!column.sortable) return null;

		if (sortState.column === column.key) {
			return sortState.direction === 'asc' ? ChevronUp : ChevronDown;
		}
		return ChevronsUpDown;
	};

	// Get header classes for sortable columns
	const getHeaderClasses = (column: DataTableColumn) => {
		const baseClasses = `text-${column.align || 'left'} p-4 font-medium text-surface-900 dark:text-surface-50`;

		if (column.sortable) {
			return `${baseClasses} cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors select-none`;
		}

		return baseClasses;
	};

	// Helper to get nested property value
	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	};

	// Helper to determine button variant class
	const getActionVariant = (variant?: string) => {
		switch (variant) {
			case 'error':
				return 'btn btn-sm preset-tonal-error hover:scale-105';
			default:
				return 'btn btn-sm hover:scale-105';
		}
	};
</script>

<div class="card py-6 px-2">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader class="animate-spin h-8 w-8 text-primary-600" />
			<span class="ml-2 text-surface-600 dark:text-surface-400">Loading...</span>
		</div>
	{:else if sortedData.length === 0}
		<div class="text-center py-12">
			{#if emptyIcon}
				{@const IconComponent = emptyIcon}
				<IconComponent class="w-12 h-12 text-surface-400 mx-auto mb-4" />
			{/if}
			<h3 class="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">
				{emptyTitle}
			</h3>
			<p class="text-surface-600 dark:text-surface-400 mb-4">
				{emptyDescription}
			</p>
			{#if emptyButtonText && onEmptyButtonClick}
				<button class="btn variant-filled-primary" onclick={onEmptyButtonClick}>
					{emptyButtonText}
				</button>
			{/if}
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-surface-200 dark:border-surface-700">
						{#each columns as column}
							<th class={getHeaderClasses(column)} onclick={() => handleSort(column)}>
								<div class="flex items-center gap-2">
									<span>{column.label}</span>
									{#if column.sortable}
										{@const SortIcon = getSortIcon(column)}
										{#if SortIcon}
											<SortIcon class="w-4 h-4 text-surface-500" />
										{/if}
									{/if}
								</div>
							</th>
						{/each}
						{#if actions.length > 0}
							<th class="text-right p-4 font-medium text-surface-900 dark:text-surface-50"
								>Actions</th
							>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each sortedData as item}
						<tr
							class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50"
						>
							{#each columns as column}
								<td class="p-4 text-{column.align || 'left'}">
									{#if column.render}
										{@html column.render(item)}
									{:else}
										<span class="text-surface-600 dark:text-surface-400">
											{getNestedValue(item, column.key)}
										</span>
									{/if}
								</td>
							{/each}
							{#if actions.length > 0}
								<td class="p-4 text-right">
									<div class="flex items-center justify-end gap-2">
										{#each actions as action}
											{@const IconComponent = action.icon}
											<button
												class={getActionVariant(action.variant)}
												onclick={() => action.onClick(item)}
												aria-label={action.ariaLabel || action.label}
											>
												<IconComponent class="w-4 h-4" />
											</button>
										{/each}
									</div>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination Controls -->
		{#if showPagination && pagination}
			{@const paginationInfo = getPaginationInfo()}
			{#if paginationInfo}
				<div
					class="{$isMobile ? 'flex-col space-y-4' : 'flex'} items-center justify-between p-4 border-t border-surface-200 dark:border-surface-700"
				>
					<!-- Page size selector and info -->
					<div class="flex-col items-center gap-4">
						<span class="text-sm text-surface-600 dark:text-surface-400">Items per page</span>
						<select
							class="select select-sm w-16"
							value={paginationState.pageSize}
							onchange={(e) => {
								const target = e.target as HTMLSelectElement;
								handlePageSizeChange(Number(target.value));
							}}
						>
							{#each pageSizeOptions as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</div>

					<!-- Navigation controls -->
					<div class="{$isMobile ? 'flex-wrap' : 'flex'} flex items-center gap-2">
						<!-- First page button -->
						<button
							class="btn btn-sm variant-ghost-surface"
							disabled={paginationState.currentPage === 1}
							onclick={() => handlePageChange(1)}
							aria-label="First page"
						>
							<ChevronsLeft class="w-4 h-4" />
						</button>

						<!-- Previous page button -->
						<button
							class="btn btn-sm variant-ghost-surface"
							disabled={paginationState.currentPage === 1}
							onclick={() => handlePageChange(paginationState.currentPage - 1)}
							aria-label="Previous page"
						>
							<ChevronLeft class="w-4 h-4" />
						</button>

						<!-- Page numbers -->
						{#if paginationInfo.startPage > 1}
							<button class="btn btn-sm variant-ghost-surface" onclick={() => handlePageChange(1)}>
								1
							</button>
							{#if paginationInfo.startPage > 2}
								<span class="text-surface-400">...</span>
							{/if}
						{/if}

						{#each Array.from({ length: paginationInfo.endPage - paginationInfo.startPage + 1 }, (_, i) => paginationInfo.startPage + i) as page}
							<button
								class="btn btn-sm {page === paginationState.currentPage
									? 'variant-filled-primary'
									: 'variant-ghost-surface'}"
								onclick={() => handlePageChange(page)}
							>
								{page}
							</button>
						{/each}

						{#if paginationInfo.endPage < paginationInfo.totalPages}
							{#if paginationInfo.endPage < paginationInfo.totalPages - 1}
								<span class="text-surface-400">...</span>
							{/if}
							<button
								class="btn btn-sm variant-ghost-surface"
								onclick={() => handlePageChange(paginationInfo.totalPages)}
							>
								{paginationInfo.totalPages}
							</button>
						{/if}

						<!-- Next page button -->
						<button
							class="btn btn-sm variant-ghost-surface"
							disabled={paginationState.currentPage === paginationInfo.totalPages}
							onclick={() => handlePageChange(paginationState.currentPage + 1)}
							aria-label="Next page"
						>
							<ChevronRight class="w-4 h-4" />
						</button>

						<!-- Last page button -->
						<button
							class="btn btn-sm variant-ghost-surface"
							disabled={paginationState.currentPage === paginationInfo.totalPages}
							onclick={() => handlePageChange(paginationInfo.totalPages)}
							aria-label="Last page"
						>
							<ChevronsRight class="w-4 h-4" />
						</button>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
