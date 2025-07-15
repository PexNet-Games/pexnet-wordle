import { Injectable, signal, inject } from "@angular/core";
import { environment } from "../../environments/environment";
import type { HubUserData } from "../models/wordle.interfaces";
import { ThemeService } from "./theme.service";

@Injectable({
	providedIn: "root",
})
export class HubIntegrationService {
	public userDataWritable = signal<HubUserData | null>(null);
	public gameCompletedWritable = signal<boolean>(false);

	private messageListener: ((event: MessageEvent) => void) | null = null;
	private themeService = inject(ThemeService);

	constructor() {
		this.setupMessageListener();
		this.requestUserData();
	}

	// Setup message listener for communication with parent hub
	private setupMessageListener() {
		this.messageListener = (event: MessageEvent) => {
			// Security check - validate origin
			if (event.origin !== environment.hubUrl) return;

			this.handleMessage(event);
		};

		window.addEventListener("message", this.messageListener);
	}

	// Clean up message listener
	cleanup() {
		if (this.messageListener) {
			window.removeEventListener("message", this.messageListener);
			this.messageListener = null;
		}
	}

	// Request initial data from hub
	private requestUserData() {
		// Request user data from parent hub
		this.sendMessageToHub({
			type: "REQUEST_USER_DATA",
		});
	}

	// Handle incoming messages from hub
	private handleMessage(event: MessageEvent) {
		const message = event.data;

		switch (message.type) {
			case "USER_DATA":
				this.userDataWritable.set({
					discordId: message.discordId,
					username: message.username,
					avatar: message.avatar,
				});
				break;

			case "THEME_UPDATE":
				if (message.theme === 'light' || message.theme === 'dark') {
					this.themeService.setThemeFromParent(message.theme);
				}
				break;

			default:
				console.log("Unknown message from hub:", message);
		}
	}

	// Send message to parent hub
	private sendMessageToHub(message: Record<string, unknown>) {
		if (window.parent !== window) {
			window.parent.postMessage(message, environment.hubUrl);
		}
	}

	// Notify hub that game has started
	notifyGameStarted() {
		this.sendMessageToHub({
			type: "GAME_STATUS_UPDATE",
			status: "playing",
		});
	}

	// Notify hub that game is completed
	notifyGameCompleted() {
		this.sendMessageToHub({
			type: "GAME_STATUS_UPDATE",
			status: "completed",
		});

		// Set the signal to trigger UI updates
		this.gameCompletedWritable.set(true);
	}

	// Reset game completed flag
	resetGameCompleted() {
		this.gameCompletedWritable.set(false);
	}

	// Get current user data
	getCurrentUser(): HubUserData | null {
		return this.userDataWritable();
	}

	// Get user data from URL parameters (fallback method)
	getUserDataFromUrl(): HubUserData {
		const params = new URLSearchParams(window.location.search);
		return {
			discordId: params.get("discordId"),
			username: params.get("username"),
			avatar: null, // Avatar not passed via URL for security
		};
	}
}
