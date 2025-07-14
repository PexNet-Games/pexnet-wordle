import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WordleApiService } from "../services/wordle-api.service";
import { LeaderboardResponse } from "../models/wordle.interfaces";

@Component({
	selector: "app-leaderboard",
	standalone: true,
	imports: [CommonModule],
	template: `
    <div class="leaderboard-container">
      <h2>Classement Global</h2>
      
      @if (isLoading) {
        <div class="loading">Chargement du classement...</div>
      } @else if (leaderboard && leaderboard.users && leaderboard.users.length > 0) {
        <div class="leaderboard-list">
          @for (user of leaderboard.users; track user.discordId; let i = $index) {
            <div class="leaderboard-item" [class.top-three]="i < 3">
              <div class="rank">
                @if (i === 0) {
                  🥇
                } @else if (i === 1) {
                  🥈
                } @else if (i === 2) {
                  🥉
                } @else {
                  {{ i + 1 }}
                }
              </div>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="games-played">{{ user.totalGames }} parties</div>
              </div>
              <div class="stats">
                <div class="win-rate">{{ user.winPercentage }}%</div>
                <div class="streak">{{ user.currentStreak }} série</div>
              </div>
            </div>
          }
        </div>
        
        <button class="refresh-button" (click)="loadLeaderboard()">
          Actualiser le Classement
        </button>
      } @else {
        <div class="no-data">
          <p>Aucune donnée de classement disponible</p>
          <button (click)="loadLeaderboard()">Réessayer</button>
        </div>
      }
    </div>
  `,
	styleUrls: ["./leaderboard.component.scss"],
})
export class LeaderboardComponent implements OnInit {
	leaderboard: LeaderboardResponse | null = null;
	isLoading = true;

	constructor(private wordleApiService: WordleApiService) {}

	ngOnInit() {
		this.loadLeaderboard();
	}

	loadLeaderboard() {
		this.isLoading = true;
		this.wordleApiService.getLeaderboard(10).subscribe({
			next: (data) => {
				this.leaderboard = data;
				this.isLoading = false;
			},
			error: (error) => {
				console.warn(
					"Failed to load leaderboard (backend not available):",
					error,
				);
				this.isLoading = false;
				// Set demo data for development
				this.leaderboard = {
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
					],
				};
			},
		});
	}
}
