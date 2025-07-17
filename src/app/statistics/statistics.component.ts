import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	inject,
	signal,
	effect,
	input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { WordleApiService } from "../services/wordle-api.service";
import { UserStatsResponse } from "../models/wordle.interfaces";
import { StatisticsSkeletonComponent } from "./statistics-skeleton.component";
import { GameEventsService } from "../services/game-events.service";

@Component({
	selector: "app-statistics",
	standalone: true,
	imports: [CommonModule, StatisticsSkeletonComponent],
	templateUrl: "./statistics.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnInit {
	discordId = input<string | null>(null);

	public stats = signal<UserStatsResponse | null>(null);
	public isLoading = signal<boolean>(true);

	private wordleApiService = inject(WordleApiService);
	private gameEventsService = inject(GameEventsService);

	constructor() {
		// Listen for refresh events
		effect(() => {
			const refreshTrigger = this.gameEventsService.refreshStats();
			if (refreshTrigger > 0 && this.discordId()) {
				console.log("📊 Refreshing stats due to game completion...");
				this.loadStats();
			}
		});
	}

	ngOnInit() {
		if (this.discordId()) {
			this.loadStats();
		} else {
			this.isLoading.set(false);
		}
	}

	private loadStats() {
		const discordId = this.discordId();
		if (!discordId) return;

		this.wordleApiService.getUserStats(discordId).subscribe({
			next: (stats) => {
				this.stats.set(stats);
				this.isLoading.set(false);
			},
			error: (error) => {
				console.error("Failed to load stats:", error);
				this.isLoading.set(false);
			},
		});
	}

	// Public method to refresh stats (called after game completion)
	refreshStats() {
		if (!this.discordId()) return;
		this.loadStats();
	}

	getDistributionPercentage(guess: string): number {
		const currentStats = this.stats();
		if (!currentStats || currentStats.totalGames === 0) return 0;
		const count = currentStats.guessDistribution[guess] || 0;
		return (count / currentStats.totalGames) * 100;
	}

	// Method to get failed games percentage (death wordle - 💀)
	getFailedGamesPercentage(): number {
		const currentStats = this.stats();
		if (!currentStats || currentStats.totalGames === 0) return 0;
		const failedCount = currentStats.guessDistribution["0"] || 0;
		return (failedCount / currentStats.totalGames) * 100;
	}

	// Method to get failed games count
	getFailedGamesCount(): number {
		const currentStats = this.stats();
		if (!currentStats) return 0;
		return currentStats.guessDistribution["0"] || 0;
	}
}
