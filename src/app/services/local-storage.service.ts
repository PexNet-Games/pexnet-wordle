import { Injectable } from "@angular/core";
import { GameStatus, WordGuess } from "../wordle/wordle.service";

export interface GameState {
	currentWord: string;
	wordId: number;
	guesses: WordGuess[];
	currentGuess: string;
	currentRow: number;
	gameStatus: GameStatus;
	timestamp: number;
	statsSaved?: boolean; // Add flag to track if stats were already saved
}

@Injectable({
	providedIn: "root",
})
export class LocalStorageService {
	private readonly GAME_STATE_KEY = "wordle-game-state";

	saveGameState(gameState: GameState): void {
		try {
			const stateWithTimestamp = {
				...gameState,
				timestamp: Date.now(),
			};
			localStorage.setItem(
				this.GAME_STATE_KEY,
				JSON.stringify(stateWithTimestamp),
			);
			console.log("💾 Game state saved to localStorage:", stateWithTimestamp);
		} catch (error) {
			console.error("❌ Error saving game state to localStorage:", error);
		}
	}

	loadGameState(): GameState | null {
		try {
			const savedState = localStorage.getItem(this.GAME_STATE_KEY);
			console.log("🔍 Loading game state from localStorage:", savedState);

			if (savedState) {
				const parsedState = JSON.parse(savedState) as GameState;

				// Check if the saved state is from today
				const today = new Date();
				const savedDate = new Date(parsedState.timestamp);
				const isSameDay = today.toDateString() === savedDate.toDateString();

				console.log("📅 Saved date:", savedDate.toDateString());
				console.log("📅 Today:", today.toDateString());
				console.log("📅 Is same day:", isSameDay);

				if (isSameDay) {
					console.log("✅ Restoring game state from same day");
					return parsedState;
				} else {
					// Clear old game state if it's from a different day
					console.log("🗑️ Clearing old game state from different day");
					this.clearGameState();
					return null;
				}
			}
		} catch (error) {
			console.error("❌ Error loading game state from localStorage:", error);
		}
		console.log("🚫 No valid game state found in localStorage");
		return null;
	}

	clearGameState(): void {
		try {
			localStorage.removeItem(this.GAME_STATE_KEY);
			console.log("🗑️ Game state cleared from localStorage");
		} catch (error) {
			console.error("❌ Error clearing game state from localStorage:", error);
		}
	}

	hasGameState(): boolean {
		return localStorage.getItem(this.GAME_STATE_KEY) !== null;
	}
}
