import { Injectable } from "@angular/core";
import { WordGuess, GameStatus } from "../wordle/wordle.service";

export interface GameState {
	currentWord: string;
	guesses: WordGuess[];
	currentGuess: string;
	currentRow: number;
	gameStatus: GameStatus;
	timestamp: number;
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
		} catch (error) {
			console.error("Error saving game state to localStorage:", error);
		}
	}

	loadGameState(): GameState | null {
		try {
			const savedState = localStorage.getItem(this.GAME_STATE_KEY);
			if (savedState) {
				const parsedState = JSON.parse(savedState) as GameState;

				// Check if the saved state is from today
				const today = new Date();
				const savedDate = new Date(parsedState.timestamp);
				const isSameDay = today.toDateString() === savedDate.toDateString();

				if (isSameDay) {
					return parsedState;
				} else {
					// Clear old game state if it's from a different day
					this.clearGameState();
					return null;
				}
			}
		} catch (error) {
			console.error("Error loading game state from localStorage:", error);
		}
		return null;
	}

	clearGameState(): void {
		try {
			localStorage.removeItem(this.GAME_STATE_KEY);
		} catch (error) {
			console.error("Error clearing game state from localStorage:", error);
		}
	}

	hasGameState(): boolean {
		return localStorage.getItem(this.GAME_STATE_KEY) !== null;
	}
}
