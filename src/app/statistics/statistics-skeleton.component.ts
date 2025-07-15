import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-skeleton",
	standalone: true,
	imports: [CommonModule],
	template: `
		<div
			aria-live="polite"
			aria-busy="true"
			[ngClass]="className"
		>
			<span class="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 dark:bg-gray-600 leading-none">
				‌
			</span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
	className: string = "";
}

@Component({
	selector: "app-statistics-skeleton",
	standalone: true,
	imports: [CommonModule, SkeletonComponent],
	template: `
		<div class="mb-4 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
			<h2 class="mb-4">
				<app-skeleton className="w-32 h-6"></app-skeleton>
			</h2>

			<!-- Key Stats Skeleton -->
			<div class="mb-8 grid grid-cols-4 gap-4">
				<div class="text-center">
					<div class="mb-1">
						<app-skeleton className="w-6 h-8 mx-auto"></app-skeleton>
					</div>
					<div class="mt-1">
						<app-skeleton className="w-12 h-4 mx-auto"></app-skeleton>
					</div>
				</div>
				<div class="text-center">
					<div class="mb-1">
						<app-skeleton className="w-12 h-8 mx-auto"></app-skeleton>
					</div>
					<div class="mt-1">
						<app-skeleton className="w-22 h-4 mx-auto"></app-skeleton>
					</div>
				</div>
				<div class="text-center">
					<div class="mb-1">
						<app-skeleton className="w-6 h-8 mx-auto"></app-skeleton>
					</div>
					<div class="mt-1">
						<app-skeleton className="w-28 h-4 mx-auto"></app-skeleton>
					</div>
				</div>
				<div class="text-center">
					<div class="mb-1">
						<app-skeleton className="w-6 h-8 mx-auto"></app-skeleton>
					</div>
					<div class="mt-1">
						<app-skeleton className="w-18 h-4 mx-auto"></app-skeleton>
					</div>
				</div>
			</div>

			<!-- Guess Distribution Skeleton -->
			<div>
				<h3 class="mb-2">
					<app-skeleton className="w-58 h-4"></app-skeleton>
				</h3>

				<!-- 6 distribution bars -->
				@for (row of [1, 2, 3, 4, 5, 6]; track row) {
					<div class="mb-1 flex items-center gap-2">
						<span class="w-3">
							<app-skeleton className="w-3 h-3"></app-skeleton>
						</span>
						<div class="relative h-4 flex-1 bg-gray-100 dark:bg-gray-700 rounded-sm">
							<div class="flex h-full min-w-6 items-center justify-end pr-1">
								<app-skeleton className="w-6 h-3"></app-skeleton>
							</div>
						</div>
					</div>
				}
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsSkeletonComponent {}
