import { Injectable, signal } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class GameEventsService {
	// Signal to trigger stats refresh
	private refreshStatsSignal = signal<number>(0);

	// Signal to trigger leaderboard refresh
	private refreshLeaderboardSignal = signal<number>(0);

	// Get signals for components to subscribe to
	get refreshStats() {
		return this.refreshStatsSignal.asReadonly();
	}

	get refreshLeaderboard() {
		return this.refreshLeaderboardSignal.asReadonly();
	}

	// Trigger refresh of stats and leaderboard after game completion
	triggerRefresh() {
		console.log("🔄 Triggering stats and leaderboard refresh...");
		this.refreshStatsSignal.update((count) => count + 1);
		this.refreshLeaderboardSignal.update((count) => count + 1);
	}
}
