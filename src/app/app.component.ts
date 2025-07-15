import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, computed, effect } from "@angular/core";
import { WordleComponent } from "./wordle/wordle.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { LeaderboardComponent } from "./leaderboard/leaderboard.component";
import { HubIntegrationService } from "./services/hub-integration.service";
import { WordValidationService } from "./services/word-validation.service";
import { GameEventsService } from "./services/game-events.service";

@Component({
	selector: "app-root",
	imports: [
		CommonModule,
		WordleComponent,
		StatisticsComponent,
		LeaderboardComponent,
	],
	templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
	// Inject services using the new pattern
	private hubIntegrationService = inject(HubIntegrationService);
	private wordValidationService = inject(WordValidationService);
	private gameEventsService = inject(GameEventsService);

	// Computed signals for reactive data
	public currentUser = computed(() =>
		this.hubIntegrationService.userDataWritable(),
	);
	public wordsLoaded = computed(() =>
		this.wordValidationService.wordsLoadedWritable(),
	);

	constructor() {
		// Setup effects for reactive behavior
		effect(() => {
			const user = this.currentUser();
			console.log("🔄 Current user updated:", user);
		});

		effect(() => {
			const loaded = this.wordsLoaded();
			if (loaded) {
				console.log("📚 Word validation list loaded successfully");
			}
		});

		// Listen for game completion events
		effect(() => {
			const gameCompleted = this.hubIntegrationService.gameCompletedWritable();
			if (gameCompleted) {
				console.log("🎮 Game completed, refreshing stats and leaderboard...");
				this.refreshStatsAndLeaderboard();
				// Reset the game completed flag
				setTimeout(() => {
					this.hubIntegrationService.resetGameCompleted();
				}, 1000);
			}
		});
	}

	ngOnInit() {
		// Initialize hub integration - user data will be automatically requested in service constructor
		this.hubIntegrationService.notifyGameStarted();
		console.log("🚀 App component initialized with signal-based services");
	}

	// Method to refresh stats and leaderboard after game completion
	private refreshStatsAndLeaderboard() {
		// Use the GameEventsService to trigger refresh
		this.gameEventsService.triggerRefresh();
	}
}
