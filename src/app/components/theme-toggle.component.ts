import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
	selector: 'app-theme-toggle',
	standalone: true,
	imports: [CommonModule],
	template: `
		<button
			(click)="toggleTheme()"
			class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			[title]="getTooltip()"
		>
			<span class="text-lg">{{ themeService.getThemeIcon() }}</span>
		</button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
	public themeService = inject(ThemeService);

	toggleTheme(): void {
		this.themeService.toggleTheme();
	}

	getTooltip(): string {
		const theme = this.themeService.currentTheme();
		const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
		return `Actuel: ${this.getThemeLabel(theme)} - Cliquer pour: ${this.getThemeLabel(next)}`;
	}

	private getThemeLabel(theme: string): string {
		switch (theme) {
			case 'light': return 'Clair';
			case 'dark': return 'Sombre';
			case 'auto': return 'Auto';
			default: return 'Auto';
		}
	}
}
