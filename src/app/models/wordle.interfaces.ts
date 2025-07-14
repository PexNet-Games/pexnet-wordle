// User data received from hub
export interface HubUserData {
	discordId: string | null;
	username: string | null;
	avatar: string | null;
}

// Daily word from API
export interface DailyWordResponse {
	word: string;
	date: string;
	wordId: number;
}

// Game statistics request
export interface GameStatsRequest {
	discordId: string;
	wordId: number;
	attempts: number;
	guesses: string[];
	solved: boolean;
	timeToComplete?: number;
}

// User statistics response
export interface UserStatsResponse {
	totalGames: number;
	totalWins: number;
	winPercentage: number;
	currentStreak: number;
	maxStreak: number;
	guessDistribution: { [key: string]: number };
	lastPlayedDate?: string;
}

// Play status response
export interface PlayStatusResponse {
	hasPlayed: boolean;
	gameResult?: {
		attempts: number;
		solved: boolean;
		guesses: string[];
	} | null;
}

// Leaderboard response
export interface LeaderboardResponse {
	users: Array<{
		discordId: string;
		username: string;
		winPercentage: number;
		currentStreak: number;
		totalGames: number;
	}>;
}

// Game state
export interface GameState {
	currentGuess: string;
	guesses: string[];
	currentRow: number;
	isGameComplete: boolean;
	isGameWon: boolean;
	targetWord: string;
	wordId: number;
	startTime: number;
	endTime?: number;
}

// Letter state for UI
export interface LetterState {
	letter: string;
	state: "correct" | "present" | "absent" | "empty";
}
