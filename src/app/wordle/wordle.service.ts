import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import * as Models from "../models/wordle.interfaces";
import { MESSAGES } from "../pop-up/pop-up.component";
import {
	GameState,
	LocalStorageService,
} from "../services/local-storage.service";
import { WordleApiService } from "../services/wordle-api.service";

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
	private currentWordId = 0;
	private currentGuess = "";
	private guesses: WordGuess[] = [];
	private currentRow = 0;
	private gameStatus: GameStatus = "playing";
	private dailyWordLoaded = signal(false);
	private dailyWordError = signal(false);

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
	private wordleApiService = inject(WordleApiService);

	// Flag to track if stats were already saved
	private statsAlreadySaved = false;

	constructor() {
		console.log("🎮 WordleService constructor called");
		this.initializeGame();
		this.loadWords();
		this.loadDailyWord();
	}

	private saveGameToStorage(): void {
		const gameState: GameState = {
			currentWord: this.currentWord,
			wordId: this.currentWordId,
			guesses: this.guesses,
			currentGuess: this.currentGuess,
			currentRow: this.currentRow,
			gameStatus: this.gameStatus,
			timestamp: Date.now(),
			statsSaved: this.statsAlreadySaved,
		};
		this.localStorageService.saveGameState(gameState);
	}

	private loadGameFromStorage(): boolean {
		console.log("🔄 Attempting to load game from storage...");
		const savedState = this.localStorageService.loadGameState();
		if (savedState?.currentWord && savedState?.wordId) {
			console.log("✅ Found saved game state, restoring...");

			// Validate that the saved word matches today's daily word
			if (this.currentWordId > 0 && savedState.wordId !== this.currentWordId) {
				console.log(
					"🆕 New daily word available! Saved game is from previous day, clearing old state",
				);
				this.localStorageService.clearGameState();
				return false;
			}

			// If we haven't loaded today's word yet, we can restore any saved state
			// The validation will happen when the daily word is loaded
			if (this.currentWordId === 0) {
				this.currentWordId = savedState.wordId;
			}

			// Trigger restoration animation
			this.isRestoringFromStorageWritable.set(true);

			this.currentWord = savedState.currentWord;
			this.guesses = savedState.guesses;
			this.currentGuess = savedState.currentGuess;
			this.currentRow = savedState.currentRow;
			this.gameStatus = savedState.gameStatus;
			this.statsAlreadySaved = savedState.statsSaved || false; // Restore stats saved flag

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
			// Load popular words for validation only
			this.http
				.get(POPULAR_FRENCH_WORDS, { responseType: "text" })
				.subscribe((text: string) => {
					this.words = text.split("\n").map((word) => word.trim());
					console.log("📝 Popular words loaded for validation");
				});

			// Load full words list for validation
			this.http
				.get(FULL_FRENCH_WORDS, { responseType: "text" })
				.subscribe((text: string) => {
					this.fullWords = text.split("\n").map((word) => word.trim());
					console.log("📚 Full word list loaded for validation");
				});
		} catch (error) {
			console.error("Error loading words:", error);
			this.showMessage({
				text: "Erreur lors du chargement des dictionnaires de validation.",
				type: "warning",
			});
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

	// Method to start a new daily game (replaces random game)
	startDailyGame(): void {
		if (!this.currentWord || this.currentWordId === 0) {
			console.log("⚠️ Daily word not loaded yet, cannot start game");
			return;
		}

		console.log(
			"🚀 ~ WordleService ~ startDailyGame ~ this.currentWord:",
			this.currentWord,
		);
		this.currentGuess = "";
		this.currentRow = 0;
		this.gameStatus = "playing";
		this.statsAlreadySaved = false; // Reset stats flag for new game

		this.initializeGame();
		this.currentGuessWritable.set("");
		this.gameStatusWritable.set("playing");

		// Save new game state
		console.log("💾 Saving initial daily game state...");
		this.saveGameToStorage();
	}

	// Deprecated: Disable random new games - only daily words allowed
	newGame(): void {
		console.log(
			"⚠️ Random new games are disabled. Only daily word games are allowed.",
		);
		this.showMessage({
			text: "Seul le mot du jour est disponible. Revenez demain pour un nouveau défi !",
			type: "info",
		});
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

		// Don't clear localStorage when game is completed - keep the completed game
		// state until a new daily word is available
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

	private loadDailyWord(): void {
		console.log("🌅 Loading today's daily word...");
		console.log(
			"🔗 API URL:",
			`${this.wordleApiService.getApiBase()}/wordle/daily-word`,
		);

		// Set a timeout to prevent infinite loading
		const timeout = setTimeout(() => {
			if (!this.dailyWordLoaded()) {
				console.log("⏰ Daily word loading timeout");
				this.dailyWordLoaded.set(true);
				this.dailyWordError.set(true);
				this.showMessage({
					text: "Impossible de récupérer le mot du jour. Veuillez réessayer plus tard.",
					type: "error",
				});
			}
		}, 10000); // 10 second timeout

		console.log("📡 Making API call to get daily word...");
		this.wordleApiService.getDailyWord().subscribe({
			next: (response: Models.DailyWordResponse) => {
				clearTimeout(timeout);
				console.log("✅ Daily word API response received:", response);
				console.log("📊 Response type:", typeof response);
				console.log("📋 Response keys:", Object.keys(response));

				this.currentWord = response.word.toLowerCase();
				this.currentWordId = response.wordId;
				this.dailyWordLoaded.set(true);

				console.log("✅ Daily word loaded successfully:", {
					word: this.currentWord,
					wordId: this.currentWordId,
					loaded: this.dailyWordLoaded(),
				});

				// Check if we have a saved game for today
				console.log("📝 Daily word loaded, checking for saved game state...");
				if (!this.loadGameFromStorage()) {
					console.log(
						"🆕 No saved state found, starting fresh daily word game...",
					);
					this.startDailyGame();
				} else {
					// Validate that the restored game matches today's word
					const savedState = this.localStorageService.loadGameState();
					if (savedState && savedState.wordId !== this.currentWordId) {
						console.log(
							"🆕 New daily word available! Clearing old completed game and starting fresh...",
						);
						this.localStorageService.clearGameState();
						this.startDailyGame();
					} else {
						console.log(
							"✅ Restored game matches today's word - keeping game state",
						);
					}
				}
			},
			error: (error) => {
				clearTimeout(timeout);
				console.error("❌ Error loading daily word:", error);
				console.error("❌ Error details:", {
					status: error.status,
					statusText: error.statusText,
					message: error.message,
					url: error.url,
				});

				// Set dailyWordLoaded to true to stop the spinner
				this.dailyWordLoaded.set(true);
				this.dailyWordError.set(true);

				// Show error message - no fallback
				this.showMessage({
					text: "Impossible de récupérer le mot du jour. Veuillez vérifier votre connexion et réessayer.",
					type: "error",
				});
			},
		});
	}

	getCurrentWord(): string {
		return this.currentWord;
	}

	getCurrentWordId(): number {
		return this.currentWordId;
	}

	isDailyWordLoaded(): boolean {
		return this.dailyWordLoaded();
	}

	hasDailyWordError(): boolean {
		return this.dailyWordError();
	}

	// Check if the user can start a new game (when a new daily word is available)
	canStartNewGame(): boolean {
		const savedState = this.localStorageService.loadGameState();
		// Can start new game if no saved state or if saved word ID doesn't match current word ID
		return (
			!savedState ||
			(this.currentWordId > 0 && savedState.wordId !== this.currentWordId)
		);
	}

	// Force start a new daily game (if new word is available)
	forceStartNewDailyGame(): boolean {
		if (!this.canStartNewGame()) {
			console.log("🚫 Cannot start new game - same daily word");
			return false;
		}

		console.log("🔄 Starting new daily game - new word available");
		this.localStorageService.clearGameState();
		this.statsAlreadySaved = false; // Reset stats flag
		this.startDailyGame();
		return true;
	}

	// Add method to mark stats as saved
	markStatsAsSaved(): void {
		this.statsAlreadySaved = true;
		this.saveGameToStorage();
	}

	// Add method to check if stats were already saved
	areStatsAlreadySaved(): boolean {
		return this.statsAlreadySaved;
	}
}
