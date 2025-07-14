import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-skeleton",
	standalone: true,
	imports: [CommonModule],
	template: `
    <div
      aria-live="polite"
      aria-busy="true"
      [ngClass]="className">
      <span class="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none">
        ‌
      </span>
    </div>
  `,
})
export class SkeletonComponent {
	@Input() className: string = "";
}

@Component({
	selector: "app-svg-skeleton",
	standalone: true,
	imports: [CommonModule],
	template: `
    <svg [ngClass]="className + ' animate-pulse rounded bg-gray-300'"></svg>
  `,
})
export class SVGSkeletonComponent {
	@Input() className: string = "";
}

@Component({
	selector: "app-wordle-skeleton",
	standalone: true,
	imports: [CommonModule, SkeletonComponent, SVGSkeletonComponent],
	template: `
    <div class="relative mx-auto max-w-md flex-col rounded-lg bg-white p-4 shadow-sm md:max-w-lg lg:max-w-xl">
      <!-- Instructions Icon Skeleton -->
      <div class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center transition-colors">
        <app-svg-skeleton className="w-5 h-5"></app-svg-skeleton>
      </div>

      <!-- Game Board Skeleton -->
      <div class="mt-2 mb-4 flex flex-col gap-1 select-none sm:gap-2 md:gap-2">
        @for (row of [1, 2, 3, 4, 5, 6]; track row) {
          <div class="flex justify-center gap-1 sm:gap-2 md:gap-2">
            @for (col of [1, 2, 3, 4, 5]; track col) {
              <div class="flex aspect-square h-12 w-12 items-center justify-center rounded-sm border-3 transition-colors duration-300 sm:h-14 sm:w-14 md:h-16 md:w-16 border-gray-300 bg-white">
              </div>
            }
          </div>
        }
      </div>

      <!-- Virtual Keyboard Skeleton -->
      <div class="mb-4 space-y-1 select-none sm:space-y-1.5 md:space-y-2">
        <!-- First keyboard row -->
        <div class="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
          @for (key of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track key) {
            <div class="h-10 min-w-6 rounded bg-gray-200 flex items-center justify-center transition-colors sm:h-12 sm:min-w-8 md:h-14 md:min-w-10 lg:h-16 lg:min-w-10">
              <app-skeleton className="w-3 h-3"></app-skeleton>
            </div>
          }
        </div>

        <!-- Second keyboard row -->
        <div class="flex justify-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-4 md:px-6">
          @for (key of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track key) {
            <div class="h-10 min-w-6 rounded bg-gray-200 flex items-center justify-center transition-colors sm:h-12 sm:min-w-8 md:h-14 md:min-w-10 lg:h-16 lg:min-w-10">
              <app-skeleton className="w-3 h-3"></app-skeleton>
            </div>
          }
        </div>

        <!-- Third keyboard row -->
        <div class="flex justify-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 md:px-4">
          <!-- ENTER key -->
          <div class="h-10 min-w-6 rounded bg-gray-400 flex items-center justify-center transition-colors sm:h-12 sm:min-w-8 md:h-14 md:min-w-10 lg:h-16 lg:min-w-10">
            <app-svg-skeleton className="mx-auto w-3 h-3 sm:h-4 sm:w-4 md:h-5 md:w-5"></app-svg-skeleton>
          </div>

          <!-- Letter keys -->
          @for (key of [1, 2, 3, 4, 5, 6, 7]; track key) {
            <div class="h-10 min-w-6 rounded bg-gray-200 flex items-center justify-center transition-colors sm:h-12 sm:min-w-8 md:h-14 md:min-w-10 lg:h-16 lg:min-w-10">
              <app-skeleton className="w-3 h-3"></app-skeleton>
            </div>
          }

          <!-- BACKSPACE key -->
          <div class="h-10 min-w-6 rounded bg-gray-400 flex items-center justify-center transition-colors sm:h-12 sm:min-w-8 md:h-14 md:min-w-10 lg:h-16 lg:min-w-10">
            <app-svg-skeleton className="mx-auto w-4 h-4 sm:h-5 sm:w-5 md:h-6 md:w-6"></app-svg-skeleton>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WordleSkeletonComponent {}
