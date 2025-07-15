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
		// Don't load from localStorage initially - wait for parent theme
		// Only fall back to localStorage if we're not in an iframe
		const isInIframe = window.parent !== window;

		if (isInIframe) {
			// Start with light theme and wait for parent message
			this.currentTheme.set('light');
		} else {
			// Load saved theme or default to auto when not in iframe
			const savedTheme = this.document.defaultView?.localStorage.getItem('theme') as Theme | null;
			this.currentTheme.set(savedTheme || 'auto');
		}

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

	/**
	 * Set theme from parent iframe message
	 * This method is called when the iframe receives a theme update from its parent
	 */
	setThemeFromParent(theme: Theme): void {
		this.currentTheme.set(theme);
		// Don't save to localStorage when set from parent to avoid conflicts
		// The parent app manages the theme persistence
	}

	private applyTheme(theme: Theme): void {
		const html = this.document.documentElement;
		const body = this.document.body;

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

		// Apply theme class to html
		html.classList.add(appliedTheme);

		// Update body classes based on theme
		if (appliedTheme === 'dark') {
			body.className = 'bg-gray-900 text-gray-100 transition-colors duration-200';
		} else {
			body.className = 'bg-slate-50 text-gray-900 transition-colors duration-200';
		}

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
