import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { MESSAGES } from "../pop-up/pop-up.component";
import {
	LocalStorageService,
	GameState,
} from "../services/local-storage.service";

export interface LetterGuess {
	letter: string;
	status: "correct" | "present" | "absent" | "empty";
}

export interface WordGuess {
	letters: LetterGuess[];
}

export type GameStatus = "playing" | "won" | "lost";

const POPULAR_FRENCH_WORDS = "assets/french_words_popular.txt";
const FULL_FRENCH_WORDS = "assets/french_words_full.txt";

@Injectable({
	providedIn: "root",
})
export class WordleService {
	private words: string[] = [];
	private fullWords: string[] = [];
	private currentWord = "";
	private currentGuess = "";
	private guesses: WordGuess[] = [];
	private currentRow = 0;
	private gameStatus: GameStatus = "playing";

	public guessesWritable = signal<WordGuess[]>([]);
	public currentGuessWritable = signal<string>("");
	public gameStatusWritable = signal<GameStatus>("playing");
	public invalidWordWritable = signal<boolean>(false);
	public invalidWordMessageWritable = signal<string>("");
	public messageTypeWritable = signal<"error" | "success" | "warning" | "info">(
		"error",
	);
	public isRestoringFromStorageWritable = signal<boolean>(false);
	public restoredRowsWritable = signal<number[]>([]);

	private http = inject(HttpClient);
	private localStorageService = inject(LocalStorageService);

	constructor() {
		console.log("🎮 WordleService constructor called");
		this.initializeGame();
		this.loadWords();
	}

	private saveGameToStorage(): void {
		const gameState: GameState = {
			currentWord: this.currentWord,
			guesses: this.guesses,
			currentGuess: this.currentGuess,
			currentRow: this.currentRow,
			gameStatus: this.gameStatus,
			timestamp: Date.now(),
		};
		this.localStorageService.saveGameState(gameState);
	}

	private loadGameFromStorage(): boolean {
		console.log("🔄 Attempting to load game from storage...");
		const savedState = this.localStorageService.loadGameState();
		if (savedState?.currentWord) {
			console.log("✅ Found saved game state, restoring...");

			// Validate that the saved word exists in our word list
			if (
				this.words.length > 0 &&
				!this.words.includes(savedState.currentWord)
			) {
				console.log("⚠️ Saved word not in current word list, starting new game");
				return false;
			}

			// Trigger restoration animation
			this.isRestoringFromStorageWritable.set(true);

			this.currentWord = savedState.currentWord;
			this.guesses = savedState.guesses;
			this.currentGuess = savedState.currentGuess;
			this.currentRow = savedState.currentRow;
			this.gameStatus = savedState.gameStatus;

			// Update signals
			this.guessesWritable.set([...this.guesses]);
			this.currentGuessWritable.set(this.currentGuess);
			this.gameStatusWritable.set(this.gameStatus);

			// Find rows that have been completed (not empty)
			const restoredRows: number[] = [];
			for (let i = 0; i < this.guesses.length; i++) {
				const hasContent = this.guesses[i].letters.some(
					(letter) => letter.letter && letter.status !== "empty",
				);
				if (hasContent) {
					restoredRows.push(i);
				}
			}
			this.restoredRowsWritable.set(restoredRows);

			console.log("✅ Game state restored from localStorage");

			// Stop animation after all letters are restored
			setTimeout(
				() => {
					this.isRestoringFromStorageWritable.set(false);
					this.restoredRowsWritable.set([]);
				},
				2000 + restoredRows.length * 300,
			); // Base delay + row animation delays

			return true;
		}
		console.log("🚫 No saved game state found");
		return false;
	}

	private async loadWords(): Promise<void> {
		try {
			// Load popular words for game selection
			this.http
				.get(POPULAR_FRENCH_WORDS, { responseType: "text" })
				.subscribe((text: string) => {
					this.words = text.split("\n").map((word) => word.trim());
					console.log("📝 Words loaded, checking for saved game state...");
					// Only start a new game if there's no saved state to restore
					if (!this.loadGameFromStorage()) {
						console.log("🆕 No saved state found, starting new game...");
						this.startNewGame();
					}
				});

			// Load full words list for validation
			this.http
				.get(FULL_FRENCH_WORDS, { responseType: "text" })
				.subscribe((text: string) => {
					this.fullWords = text.split("\n").map((word) => word.trim());
				});
		} catch (error) {
			console.error("Error loading words:", error);
		}
	}

	private initializeGame(): void {
		this.guesses = Array(6)
			.fill(null)
			.map(() => ({
				letters: Array(5)
					.fill(null)
					.map(() => ({ letter: "", status: "empty" })),
			}));
		this.guessesWritable.set(this.guesses);
	}

	newGame(): void {
		if (this.words.length === 0) return;

		this.currentWord =
			this.words[Math.floor(Math.random() * this.words.length)].toLowerCase();
		console.log(
			"🚀 ~ WordleService ~ newGame ~ this.currentWord:",
			this.currentWord,
		);
		this.currentGuess = "";
		this.currentRow = 0;
		this.gameStatus = "playing";

		this.initializeGame();
		this.currentGuessWritable.set("");
		this.gameStatusWritable.set("playing");

		// Clear old game state and save new game
		this.localStorageService.clearGameState();
		this.saveGameToStorage();
	}

	startNewGame(): void {
		if (this.words.length === 0) return;

		this.currentWord =
			this.words[Math.floor(Math.random() * this.words.length)].toLowerCase();
		console.log(
			"🚀 ~ WordleService ~ startNewGame ~ this.currentWord:",
			this.currentWord,
		);
		this.currentGuess = "";
		this.currentRow = 0;
		this.gameStatus = "playing";

		this.initializeGame();
		this.currentGuessWritable.set("");
		this.gameStatusWritable.set("playing");

		// Save new game without clearing existing localStorage first
		console.log("💾 Saving initial game state...");
		this.saveGameToStorage();
	}

	addLetter(letter: string): void {
		if (this.gameStatus !== "playing" || this.currentGuess.length >= 5) return;

		// Validate character
		if (!/^[a-zA-ZàâäèéêëïîôöùûüÿçÀÂÄÈÉÊËÏÎÔÖÙÛÜŸÇ]$/.test(letter)) {
			this.showMessage(MESSAGES["INVALID_CHARACTERS"]);
			return;
		}

		this.currentGuess += letter.toLowerCase();
		this.updateCurrentGuessDisplay();
		this.saveGameToStorage();
	}

	removeLetter(): void {
		if (this.gameStatus !== "playing" || this.currentGuess.length === 0) return;

		this.currentGuess = this.currentGuess.slice(0, -1);
		this.updateCurrentGuessDisplay();
		this.saveGameToStorage();
	}

	private isValidWord(word: string): boolean {
		// First check popular words (faster lookup)
		if (this.words.includes(word)) {
			return true;
		}
		// Then check full dictionary
		return this.fullWords.includes(word);
	}

	submitGuess(): void {
		if (this.gameStatus !== "playing") {
			this.showMessage(MESSAGES["GAME_FINISHED"]);
			return;
		}

		if (this.currentGuess.length !== 5) {
			this.showMessage(MESSAGES["WORD_TOO_SHORT"]);
			return;
		}

		if (!this.isValidWord(this.currentGuess)) {
			this.showMessage(MESSAGES["WORD_NOT_FOUND"]);
			return;
		}

		console.log(
			"🚀 ~ WordleService ~ submitGuess ~ this.currentGuess:",
			this.currentGuess,
		);
		const guess = this.evaluateGuess(this.currentGuess);
		this.guesses[this.currentRow] = guess;

		if (this.currentGuess === this.currentWord) {
			this.gameStatus = "won";
			this.showMessage(MESSAGES["GAME_WON"]);
		} else if (this.currentRow === 5) {
			this.gameStatus = "lost";
		}

		this.currentRow++;
		this.currentGuess = "";

		this.guessesWritable.set([...this.guesses]);
		this.currentGuessWritable.set("");
		this.gameStatusWritable.set(this.gameStatus);

		// Save game state after each guess
		this.saveGameToStorage();

		// Clear localStorage when game is completed
		if (this.gameStatus !== "playing") {
			setTimeout(() => {
				this.localStorageService.clearGameState();
			}, 5000); // Clear after 5 seconds to allow user to see final state
		}
	}

	private evaluateGuess(guess: string): WordGuess {
		const result: LetterGuess[] = [];
		const targetLetters = this.currentWord.split("");
		const guessLetters = guess.split("");

		// First pass: mark correct letters
		for (let i = 0; i < 5; i++) {
			if (guessLetters[i] === targetLetters[i]) {
				result[i] = { letter: guessLetters[i], status: "correct" };
				targetLetters[i] = ""; // Remove from target
				guessLetters[i] = ""; // Remove from guess
			}
		}

		// Second pass: mark present letters
		for (let i = 0; i < 5; i++) {
			if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
				result[i] = { letter: guess[i], status: "present" };
				const targetIndex = targetLetters.indexOf(guessLetters[i]);
				targetLetters[targetIndex] = ""; // Remove from target
			} else if (guessLetters[i]) {
				result[i] = { letter: guess[i], status: "absent" };
			}
		}

		return { letters: result };
	}

	private updateCurrentGuessDisplay(): void {
		this.currentGuessWritable.set(this.currentGuess);
	}

	private showMessage(message: {
		text: string;
		type: "error" | "success" | "warning" | "info";
	}): void {
		this.invalidWordWritable.set(true);
		this.invalidWordMessageWritable.set(message.text);
		this.messageTypeWritable.set(message.type);
		setTimeout(() => {
			this.invalidWordWritable.set(false);
			this.invalidWordMessageWritable.set("");
		}, 2000);
	}

	getCurrentWord(): string {
		return this.currentWord;
	}
}
