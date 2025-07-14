import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WordleApiService } from "../services/wordle-api.service";
import { UserStatsResponse } from "../models/wordle.interfaces";

@Component({
	selector: "app-statistics",
	standalone: true,
	imports: [CommonModule],
	template: `
    @if (stats) {
      <div class="stats-container">
        <h2>Vos Statistiques</h2>

        <!-- Key Stats -->
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value">{{ stats.totalGames }}</div>
            <div class="stat-label">Jouées</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.winPercentage }}%</div>
            <div class="stat-label">% Victoires</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.currentStreak }}</div>
            <div class="stat-label">Série Actuelle</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.maxStreak }}</div>
            <div class="stat-label">Série Max</div>
          </div>
        </div>

        <!-- Guess Distribution -->
        <div class="guess-distribution">
          <h3>Distribution des Tentatives</h3>
          @for (guess of ['1', '2', '3', '4', '5', '6']; track guess) {
            <div class="distribution-row">
              <span class="guess-number">{{ guess }}</span>
              <div class="distribution-bar">
                <div
                  class="distribution-fill"
                  [style.width.%]="getDistributionPercentage(guess)">
                  {{ stats.guessDistribution[guess] || 0 }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    } @else if (isLoading) {
      <div class="loading">
        <p>Chargement des statistiques...</p>
      </div>
    } @else {
      <div class="no-stats">
        <p>Aucune statistique disponible pour le moment. Jouez une partie pour voir vos stats !</p>
      </div>
    }
  `,
	styleUrls: ["./statistics.component.scss"],
})
export class StatisticsComponent implements OnInit {
	@Input() discordId: string | null = null;
	stats: UserStatsResponse | null = null;
	isLoading = true;

	constructor(private wordleApiService: WordleApiService) {}

	ngOnInit() {
		if (this.discordId) {
			this.loadStats();
		} else {
			this.isLoading = false;
		}
	}

	private loadStats() {
		if (!this.discordId) return;

		this.wordleApiService.getUserStats(this.discordId).subscribe({
			next: (stats) => {
				this.stats = stats;
				this.isLoading = false;
			},
			error: (error) => {
				console.error("Failed to load stats:", error);
				this.isLoading = false;
			},
		});
	}

	getDistributionPercentage(guess: string): number {
		if (!this.stats || this.stats.totalGames === 0) return 0;
		const count = this.stats.guessDistribution[guess] || 0;
		return (count / this.stats.totalGames) * 100;
	}
}
