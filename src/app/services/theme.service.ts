import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {
	private document = inject(DOCUMENT);
	
	// Signal for current theme
	public currentTheme = signal<Theme>('auto');
	
	// Signal for actual applied theme (resolved from auto)
	public appliedTheme = signal<'light' | 'dark'>('light');

	constructor() {
		// Load saved theme or default to auto
		const savedTheme = this.document.defaultView?.localStorage.getItem('theme') as Theme | null;
		this.currentTheme.set(savedTheme || 'auto');

		// Effect to apply theme changes
		effect(() => {
			const theme = this.currentTheme();
			this.applyTheme(theme);
		});

		// Listen for system theme changes
		if (this.document.defaultView?.matchMedia) {
			const mediaQuery = this.document.defaultView.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', () => {
				if (this.currentTheme() === 'auto') {
					this.applyTheme('auto');
				}
			});
		}
	}

	setTheme(theme: Theme): void {
		this.currentTheme.set(theme);
		this.document.defaultView?.localStorage.setItem('theme', theme);
	}

	toggleTheme(): void {
		const current = this.currentTheme();
		const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
		this.setTheme(next);
	}

	private applyTheme(theme: Theme): void {
		const html = this.document.documentElement;
		
		// Remove existing theme classes
		html.classList.remove('light', 'dark');
		
		let appliedTheme: 'light' | 'dark';
		
		if (theme === 'auto') {
			// Use system preference
			const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
			appliedTheme = prefersDark ? 'dark' : 'light';
		} else {
			appliedTheme = theme;
		}
		
		// Apply theme class
		html.classList.add(appliedTheme);
		this.appliedTheme.set(appliedTheme);
	}

	getThemeIcon(): string {
		const theme = this.currentTheme();
		switch (theme) {
			case 'light': return '☀️';
			case 'dark': return '🌙';
			case 'auto': return '🌗';
			default: return '🌗';
		}
	}
}
