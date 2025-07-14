import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import * as Models from "../models/wordle.interfaces";

@Injectable({
	providedIn: "root",
})
export class WordleApiService {
	private readonly API_BASE = environment.apiUrl;

	constructor(private http: HttpClient) {}

	getApiBase(): string {
		return this.API_BASE;
	}

	// Get today's daily word
	getDailyWord(): Observable<Models.DailyWordResponse> {
		return this.http.get<Models.DailyWordResponse>(
			`${this.API_BASE}/wordle/daily-word`,
		);
	}

	// Save completed game statistics
	saveGameStats(stats: Models.GameStatsRequest): Observable<unknown> {
		return this.http.post(`${this.API_BASE}/stats`, stats, {
			withCredentials: true, // Important for Discord authentication
		});
	}

	// Get user's aggregate statistics
	getUserStats(discordId: string): Observable<Models.UserStatsResponse> {
		return this.http.get<Models.UserStatsResponse>(
			`${this.API_BASE}/stats/${discordId}`,
		);
	}

	// Check if user has played today
	hasPlayedToday(discordId: string): Observable<Models.PlayStatusResponse> {
		return this.http.get<Models.PlayStatusResponse>(
			`${this.API_BASE}/played-today/${discordId}`,
		);
	}

	// Get global leaderboard
	getLeaderboard(limit = 10): Observable<Models.LeaderboardResponse> {
		return this.http.get<Models.LeaderboardResponse>(
			`${this.API_BASE}/wordle/leaderboard?limit=${limit}`,
		);
	}
}
