import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";

const FULL_FRENCH_WORDS = "assets/french_words_full.txt";

@Injectable({
	providedIn: "root",
})
export class WordValidationService {
	private validWords = new Set<string>();
	public wordsLoadedWritable = signal<boolean>(false);
	public wordCountWritable = signal<number>(0);

	private http = inject(HttpClient);

	constructor() {
		this.loadWordList();
	}

	isValidWord(word: string): boolean {
		return this.validWords.has(word.toLowerCase());
	}

	// Load word list from assets using HTTP client like WordleService
	private loadWordList(): void {
		this.http.get(FULL_FRENCH_WORDS, { responseType: "text" }).subscribe({
			next: (text: string) => {
				const words = text.split("\n").map((word) => word.trim().toLowerCase());

				// Filter for 5-letter words and add to the set
				words.forEach((word) => {
					if (word.length === 5 && /^[a-zàâäèéêëïîôöùûüÿç]+$/.test(word)) {
						this.validWords.add(word);
					}
				});

				this.wordCountWritable.set(this.validWords.size);
				this.wordsLoadedWritable.set(true);
				console.log(
					`✅ Loaded ${this.validWords.size} French 5-letter words for validation`,
				);
			},
			error: (error) => {
				console.warn("Failed to load French word list from assets:", error);
				// Fallback to a small set of basic French words
				const fallbackWords = [
					"about",
					"agent",
					"autre",
					"avoir",
					"boire",
					"bonus",
					"coeur",
					"dance",
					"ecole",
					"enfin",
					"fille",
					"grand",
					"heure",
					"image",
					"jouer",
					"lever",
					"monde",
					"notre",
					"ordre",
					"partir",
					"quand",
					"route",
					"sauce",
					"temps",
					"unite",
					"ville",
					"voire",
					"wagon",
					"yacht",
					"zebra",
				];
				fallbackWords.forEach((word) => this.validWords.add(word));
				this.wordCountWritable.set(this.validWords.size);
				this.wordsLoadedWritable.set(true);
				console.log(
					`⚠️ Using fallback word list with ${this.validWords.size} words`,
				);
			},
		});
	}
}
