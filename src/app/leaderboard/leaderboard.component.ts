import {
	Component,
	OnInit,
	inject,
	signal,
	effect,
	ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { WordleApiService } from "../services/wordle-api.service";
import { LeaderboardResponse } from "../models/wordle.interfaces";
import { LeaderboardSkeletonComponent } from "./leaderboard-skeleton.component";
import { GameEventsService } from "../services/game-events.service";

@Component({
	selector: "app-leaderboard",
	standalone: true,
	imports: [CommonModule, LeaderboardSkeletonComponent],
	templateUrl: "./leaderboard.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
	// Use signals for reactive state management
	public leaderboard = signal<LeaderboardResponse | null>(null);
	public isLoading = signal<boolean>(true);

	// Inject services using the inject function
	private wordleApiService = inject(WordleApiService);
	private gameEventsService = inject(GameEventsService);

	constructor() {
		// Listen for refresh events
		effect(() => {
			const refreshTrigger = this.gameEventsService.refreshLeaderboard();
			if (refreshTrigger > 0) {
				console.log("🏆 Refreshing leaderboard due to game completion...");
				this.loadLeaderboard();
			}
		});
	}

	ngOnInit() {
		this.loadLeaderboard();
	}

	loadLeaderboard() {
		this.isLoading.set(true);
		this.wordleApiService.getLeaderboard(10).subscribe({
			next: (data) => {
				this.leaderboard.set(data);
				this.isLoading.set(false);
			},
			error: (error: unknown) => {
				console.warn(
					"Failed to load leaderboard (backend not available):",
					error,
				);
				this.isLoading.set(false);
				// Set demo data for development
				this.leaderboard.set({
					users: [
						{
							discordId: "1",
							username: "WordleMaster",
							winPercentage: 95,
							currentStreak: 12,
							totalGames: 20,
						},
						{
							discordId: "2",
							username: "PuzzleKing",
							winPercentage: 88,
							currentStreak: 8,
							totalGames: 17,
						},
						{
							discordId: "3",
							username: "LetterLord",
							winPercentage: 82,
							currentStreak: 5,
							totalGames: 22,
						},
						{
							discordId: "4",
							username: "WordWizard",
							winPercentage: 78,
							currentStreak: 3,
							totalGames: 18,
						},
						{
							discordId: "5",
							username: "GuessGuru",
							winPercentage: 75,
							currentStreak: 7,
							totalGames: 16,
						},
						{
							discordId: "6",
							username: "LetterLegend",
							winPercentage: 72,
							currentStreak: 2,
							totalGames: 14,
						},
					],
				});
			},
		});
	}

	// Get only the top 6 users for the compact layout
	getTopSixUsers() {
		const currentLeaderboard = this.leaderboard();
		if (!currentLeaderboard?.users) return [];
		return currentLeaderboard.users.slice(0, 6);
	}

	// Public method to refresh leaderboard (called after game completion)
	refreshLeaderboard() {
		this.loadLeaderboard();
	}
}
