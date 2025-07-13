import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	HostListener,
	inject,
	signal,
} from "@angular/core";
import { InstructionsModalComponent } from "../instructions-modal/instructions-modal.component";
import { MessageType, PopUpComponent } from "../pop-up/pop-up.component";
import { removeAccents } from "../utils/accent-utils";
import { GameStatus, WordGuess, WordleService } from "./wordle.service";

@Component({
	selector: "app-wordle",
	imports: [CommonModule, PopUpComponent, InstructionsModalComponent],
	templateUrl: "./wordle.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordleComponent {
	public guesses = signal<WordGuess[]>([]);
	public currentGuess = signal<string[]>([]);
	public gameStatus = signal<GameStatus>("playing");
	public invalidWord = signal<boolean>(false);
	public invalidWordMessage = signal<string>("");
	public messageType = signal<MessageType>("error");
	public showInstructions = signal<boolean>(false);

	public wordleService = inject(WordleService);

	constructor() {
		effect(() => {
			this.guesses.set(this.wordleService.guessesWritable());
			this.currentGuess.set(
				this.wordleService.currentGuessWritable().split(""),
			);
			this.gameStatus.set(this.wordleService.gameStatusWritable());
			this.invalidWord.set(this.wordleService.invalidWordWritable());
			this.invalidWordMessage.set(
				this.wordleService.invalidWordMessageWritable(),
			);
			this.messageType.set(this.wordleService.messageTypeWritable());
			console.log("Current Guess: ", this.wordleService.guessesWritable());
			console.log("Game Status: ", this.wordleService.gameStatusWritable());
			console.log("Guesses: ", this.wordleService.currentGuessWritable());
		});
	}

	@HostListener("window:keydown", ["$event"])
	handleKeyDown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			this.wordleService.submitGuess();
		} else if (event.key === "Backspace") {
			this.wordleService.removeLetter();
		} else if (
			/^[a-zA-ZàáâãäåèéêëìíîïòóôõöùúûüýÿçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÇÑ]$/.test(
				event.key,
			)
		) {
			const normalizedKey = removeAccents(event.key.toUpperCase());
			this.wordleService.addLetter(normalizedKey);
		}
	}

	onLetterClick(letter: string): void {
		this.wordleService.addLetter(letter);
	}

	onBackspace(): void {
		this.wordleService.removeLetter();
	}

	onEnter(): void {
		this.wordleService.submitGuess();
	}

	onNewGame(): void {
		this.wordleService.newGame();
	}

	onShowInstructions(): void {
		this.showInstructions.set(true);
	}

	onCloseInstructions(): void {
		this.showInstructions.set(false);
	}

	getLetterForPosition(rowIndex: number, letterIndex: number): string {
		const guess = this.guesses()[rowIndex];
		if (guess?.letters[letterIndex]?.letter) {
			return guess.letters[letterIndex].letter;
		}

		// Show current guess being typed
		if (
			rowIndex === this.getCurrentRowIndex() &&
			letterIndex < this.currentGuess().length
		) {
			return this.currentGuess()[letterIndex];
		}

		return "";
	}

	getStatusForPosition(rowIndex: number, letterIndex: number): string {
		const guess = this.guesses()[rowIndex];
		return guess?.letters[letterIndex]?.status || "empty";
	}

	public getCurrentRowIndex(): number {
		return this.guesses().findIndex((guess) =>
			guess.letters.every((letter) => letter.status === "empty"),
		);
	}

	get keyboardRows(): string[][] {
		return [
			["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
			["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
			["ENTER", "W", "X", "C", "V", "B", "N", "BACKSPACE"],
		];
	}

	getKeyStatus(key: string): string {
		if (key === "ENTER" || key === "BACKSPACE") return "action";

		const letter = key.toLowerCase();
		let status = "unused";

		for (const guess of this.guesses()) {
			for (const letterGuess of guess.letters) {
				if (letterGuess.letter === letter) {
					if (letterGuess.status === "correct") return "correct";
					if (letterGuess.status === "present" && status !== "correct")
						status = "present";
					if (letterGuess.status === "absent" && status === "unused")
						status = "absent";
				}
			}
		}

		return status;
	}

	isCurrentPosition(rowIndex: number, letterIndex: number): boolean {
		const currentRow = this.getCurrentRowIndex();
		return (
			this.gameStatus() === "playing" &&
			rowIndex === currentRow &&
			letterIndex === this.currentGuess().length
		);
	}
}
