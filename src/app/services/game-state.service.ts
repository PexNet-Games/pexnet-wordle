import { Injectable, signal } from "@angular/core";
import { GameState, LetterState } from "../models/wordle.interfaces";

@Injectable({
	providedIn: "root",
})
export class GameStateService {
	public gameStateWritable = signal<GameState>({
		currentGuess: "",
		guesses: [],
		currentRow: 0,
		isGameComplete: false,
		isGameWon: false,
		targetWord: "",
		wordId: 0,
		startTime: Date.now(),
	});

	// Initialize new game
	initializeGame(targetWord: string, wordId: number) {
		this.gameStateWritable.set({
			currentGuess: "",
			guesses: [],
			currentRow: 0,
			isGameComplete: false,
			isGameWon: false,
			targetWord: targetWord.toLowerCase(),
			wordId,
			startTime: Date.now(),
		});
	}

	// Add letter to current guess
	addLetter(letter: string) {
		const currentState = this.gameStateWritable();
		if (currentState.currentGuess.length < 5 && !currentState.isGameComplete) {
			this.gameStateWritable.set({
				...currentState,
				currentGuess: currentState.currentGuess + letter.toLowerCase(),
			});
		}
	}

	// Remove letter from current guess
	removeLetter() {
		const currentState = this.gameStateWritable();
		if (currentState.currentGuess.length > 0 && !currentState.isGameComplete) {
			this.gameStateWritable.set({
				...currentState,
				currentGuess: currentState.currentGuess.slice(0, -1),
			});
		}
	}

	// Submit current guess
	submitGuess(): boolean {
		const currentState = this.gameStateWritable();

		if (currentState.currentGuess.length !== 5 || currentState.isGameComplete) {
			return false;
		}

		const newGuesses = [...currentState.guesses, currentState.currentGuess];
		const isCorrect = currentState.currentGuess === currentState.targetWord;
		const isGameComplete = isCorrect || newGuesses.length >= 6;

		this.gameStateWritable.set({
			...currentState,
			guesses: newGuesses,
			currentGuess: "",
			currentRow: currentState.currentRow + 1,
			isGameComplete,
			isGameWon: isCorrect,
			endTime: isGameComplete ? Date.now() : undefined,
		});

		return true;
	}

	// Get letter state for a specific guess and position
	getLetterState(guess: string, letterIndex: number): LetterState {
		const currentState = this.gameStateWritable();
		const letter = guess[letterIndex];
		const targetWord = currentState.targetWord;

		if (targetWord[letterIndex] === letter) {
			return { letter, state: "correct" };
		} else if (targetWord.includes(letter)) {
			return { letter, state: "present" };
		} else {
			return { letter, state: "absent" };
		}
	}

	// Get current state
	getCurrentState(): GameState {
		return this.gameStateWritable();
	}
}
