import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy,
	inject,
	signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { WordleApiService } from "../services/wordle-api.service";
import { UserStatsResponse } from "../models/wordle.interfaces";
import { StatisticsSkeletonComponent } from "./statistics-skeleton.component";

@Component({
	selector: "app-statistics",
	standalone: true,
	imports: [CommonModule, StatisticsSkeletonComponent],
	templateUrl: "./statistics.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnInit {
	@Input() discordId: string | null = null;

	public stats = signal<UserStatsResponse | null>(null);
	public isLoading = signal<boolean>(true);

	private wordleApiService = inject(WordleApiService);

	ngOnInit() {
		if (this.discordId) {
			this.loadStats();
		} else {
			this.isLoading.set(false);
		}
	}

	private loadStats() {
		if (!this.discordId) return;

		this.wordleApiService.getUserStats(this.discordId).subscribe({
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

	getDistributionPercentage(guess: string): number {
		const currentStats = this.stats();
		if (!currentStats || currentStats.totalGames === 0) return 0;
		const count = currentStats.guessDistribution[guess] || 0;
		return (count / currentStats.totalGames) * 100;
	}
}
