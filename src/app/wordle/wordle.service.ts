import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { MESSAGES } from "../pop-up/pop-up.component";

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

	private http = inject(HttpClient);

	constructor() {
		this.loadWords();
		this.initializeGame();
	}

	private async loadWords(): Promise<void> {
		try {
			// Load popular words for game selection
			this.http
				.get(POPULAR_FRENCH_WORDS, { responseType: "text" })
				.subscribe((text: string) => {
					this.words = text.split("\n").map((word) => word.trim());
					this.newGame();
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
	}

	removeLetter(): void {
		if (this.gameStatus !== "playing" || this.currentGuess.length === 0) return;

		this.currentGuess = this.currentGuess.slice(0, -1);
		this.updateCurrentGuessDisplay();
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
