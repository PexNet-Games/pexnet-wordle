import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	HostListener,
	inject,
	signal,
	computed,
	OnInit,
} from "@angular/core";
import { InstructionsModalComponent } from "../instructions-modal/instructions-modal.component";
import { MessageType, PopUpComponent } from "../pop-up/pop-up.component";
import { removeAccents } from "../utils/accent-utils";
import { GameStatus, WordGuess, WordleService } from "./wordle.service";
import { WordValidationService } from "../services/word-validation.service";
import { WordleApiService } from "../services/wordle-api.service";
import { HubIntegrationService } from "../services/hub-integration.service";
import { GameStatsRequest } from "../models/wordle.interfaces";
import { WordleSkeletonComponent } from "./wordle-skeleton.component";

@Component({
	selector: "app-wordle",
	imports: [
		CommonModule,
		PopUpComponent,
		InstructionsModalComponent,
		WordleSkeletonComponent,
	],
	templateUrl: "./wordle.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordleComponent implements OnInit {
	// Use the existing WordleService signals
	public guesses = signal<WordGuess[]>([]);
	public currentGuess = signal<string[]>([]);
	public gameStatus = signal<GameStatus>("playing");
	public invalidWord = signal<boolean>(false);
	public invalidWordMessage = signal<string>("");
	public messageType = signal<MessageType>("error");
	public showInstructions = signal<boolean>(false);
	public isRestoringFromStorage = signal<boolean>(false);
	public restoredRows = signal<number[]>([]);

	// Computed signals for new services integration
	public currentUser = computed(() =>
		this.hubIntegrationService.userDataWritable(),
	);
	public wordsLoaded = computed(() =>
		this.wordValidationService.wordsLoadedWritable(),
	);
	public canStartNewGame = computed(() => this.wordleService.canStartNewGame());
	public isDailyWordLoaded = computed(() =>
		this.wordleService.isDailyWordLoaded(),
	);
	public hasDailyWordError = computed(() =>
		this.wordleService.hasDailyWordError(),
	);

	public wordleService = inject(WordleService);
	private wordValidationService = inject(WordValidationService);
	private wordleApiService = inject(WordleApiService);
	private hubIntegrationService = inject(HubIntegrationService);

	private isInitializing = true;
	private hasProcessedInitialGameState = false;

	constructor() {
		// Sync with existing WordleService signals
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
			this.isRestoringFromStorage.set(
				this.wordleService.isRestoringFromStorageWritable(),
			);
			this.restoredRows.set(this.wordleService.restoredRowsWritable());
			console.log("Current Guess: ", this.wordleService.guessesWritable());
			console.log("Game Status: ", this.wordleService.gameStatusWritable());
			console.log("Guesses: ", this.wordleService.currentGuessWritable());
		});

		// Watch for game completion to handle backend integration
		effect(() => {
			const status = this.gameStatus();
			if (status === "won" || status === "lost") {
				// Delay to ensure all initialization is complete
				setTimeout(() => {
					this.handleGameCompletion();
				}, 100);
			}
		});
	}

	ngOnInit() {
		// Initialize hub integration for user data
		this.hubIntegrationService.notifyGameStarted();
		console.log("🎮 Wordle component initialized with hub integration");

		// Mark initialization as complete after a delay to ensure all effects have run
		setTimeout(() => {
			this.isInitializing = false;
			console.log("🎯 Component initialization complete");
		}, 1000);
	}

	private async handleGameCompletion() {
		console.log("🎯 handleGameCompletion called", {
			initializing: this.isInitializing,
			restoring: this.isRestoringFromStorage(),
			processed: this.hasProcessedInitialGameState,
			statsAlreadySaved: this.wordleService.areStatsAlreadySaved(),
		});

		const user = this.currentUser();
		if (!user?.discordId) {
			console.log("🚫 No user discordId, skipping stats save");
			return;
		}

		// Don't save stats if we're still initializing the component
		if (this.isInitializing) {
			console.log("🔄 Component still initializing, skipping stats save");
			return;
		}

		// Don't save stats if we're currently restoring from storage
		if (this.isRestoringFromStorage()) {
			console.log(
				"🔄 Game completion detected during restoration, skipping stats save",
			);
			return;
		}

		// Don't save stats for the initial game state (restored or fresh)
		if (!this.hasProcessedInitialGameState) {
			console.log("🔄 Initial game state detected, skipping stats save");
			this.hasProcessedInitialGameState = true;
			return;
		}

		// Check if stats were already saved to prevent duplicate calls
		if (this.wordleService.areStatsAlreadySaved()) {
			console.log("📊 Stats already saved for this game, skipping API call");
			return;
		}

		try {
			const gameStats: GameStatsRequest = {
				discordId: user.discordId,
				wordId: this.wordleService.getCurrentWordId(), // Get the actual daily word ID
				attempts: this.gameStatus() === "won" ? this.guesses().length : 0,
				guesses: this.guesses().map((g) =>
					g.letters.map((l) => l.letter).join(""),
				),
				solved: this.gameStatus() === "won",
				timeToComplete: undefined, // TODO: Add timing if needed
			};

			await this.wordleApiService.saveGameStats(gameStats).toPromise();

			// Mark stats as saved to prevent duplicate calls
			this.wordleService.markStatsAsSaved();

			this.hubIntegrationService.notifyGameCompleted();
			console.log("✅ Game stats saved successfully");
		} catch (error) {
			console.warn(
				"⚠️ Failed to save game stats (backend not available):",
				error,
			);
		}
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

	onEnter(): void {
		// Mark that we've processed the initial state when user starts playing
		this.hasProcessedInitialGameState = true;
		this.wordleService.submitGuess();
	}

	onLetterClick(letter: string): void {
		// Mark that we've processed the initial state when user starts playing
		this.hasProcessedInitialGameState = true;
		this.wordleService.addLetter(letter);
	}

	onBackspace(): void {
		this.wordleService.removeLetter();
	}

	onNewGame(): void {
		// Try to start a new daily game if a new word is available
		if (!this.wordleService.forceStartNewDailyGame()) {
			// If no new word is available, call the original newGame method which will show an info message
			this.wordleService.newGame();
		}
	}

	onShowInstructions(): void {
		this.showInstructions.set(true);
	}

	onCloseInstructions(): void {
		this.showInstructions.set(false);
	}

	onReload(): void {
		window.location.reload();
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

	shouldAnimateRestore(rowIndex: number, letterIndex: number): boolean {
		if (!this.isRestoringFromStorage()) return false;

		const restoredRows = this.restoredRows();
		const isRestoredRow = restoredRows.includes(rowIndex);
		const hasLetter = this.getLetterForPosition(rowIndex, letterIndex) !== "";

		return isRestoredRow && hasLetter;
	}

	getRestoreAnimationClass(rowIndex: number, letterIndex: number): string {
		if (!this.shouldAnimateRestore(rowIndex, letterIndex)) return "";

		return `letter-restore-wave letter-restore-delay-${letterIndex} row-restore-delay-${rowIndex}`;
	}

	getRestorationMessage(): string {
		const restoredRows = this.restoredRows();
		if (restoredRows.length === 0) return "";

		return `Restauration en cours... ${restoredRows.length} ligne${restoredRows.length > 1 ? "s" : ""} récupérée${restoredRows.length > 1 ? "s" : ""}`;
	}
}
