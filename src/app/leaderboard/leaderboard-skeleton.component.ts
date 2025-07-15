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
	selector: "app-leaderboard-skeleton",
	standalone: true,
	imports: [CommonModule, SkeletonComponent],
	template: `
		<div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
			<h2 class="mb-4">
				<app-skeleton className="w-20 h-6"></app-skeleton>
			</h2>
			<div class="mb-4 grid grid-cols-2 gap-3">
				<!-- Top 3 users with yellow background -->
				@for (topUser of [1, 2, 3]; track topUser) {
					<div class="flex items-center rounded-md border border-yellow-300 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 p-2">
						<div class="mr-2 w-6">
							<app-skeleton className="w-8 h-4"></app-skeleton>
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-1">
								<app-skeleton className="w-22 h-4"></app-skeleton>
							</div>
							<div>
								<app-skeleton className="w-24 h-3"></app-skeleton>
							</div>
						</div>
						<div class="ml-2 text-right">
							<div class="mb-1">
								<app-skeleton className="w-12 h-4"></app-skeleton>
							</div>
							<div>
								<app-skeleton className="w-20 h-3"></app-skeleton>
							</div>
						</div>
					</div>
				}

				<!-- Remaining 3 users with gray background -->
				@for (regularUser of [4, 5, 6]; track regularUser) {
					<div class="flex items-center rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2">
						<div class="mr-2 w-6">
							<app-skeleton className="w-6 h-4"></app-skeleton>
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-1">
								<app-skeleton className="w-24 h-4"></app-skeleton>
							</div>
							<div>
								<app-skeleton className="w-24 h-3"></app-skeleton>
							</div>
						</div>
						<div class="ml-2 text-right">
							<div class="mb-1">
								<app-skeleton className="w-10 h-4"></app-skeleton>
							</div>
							<div>
								<app-skeleton className="w-18 h-3"></app-skeleton>
							</div>
						</div>
					</div>
				}
			</div>

			<div class="w-full rounded-md bg-gray-200 dark:bg-gray-600 px-4 py-2 transition-colors">
				<app-skeleton className="w-24 h-5 mx-auto"></app-skeleton>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardSkeletonComponent {}
