import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

export type MessageType = "error" | "success" | "warning" | "info";
export type Message = {
	text: string;
	type: MessageType;
};
export const MESSAGES: Record<string, Message> = {
	WORD_NOT_FOUND: {
		text: "Ce mot n'est pas dans la liste",
		type: "error",
	},
	WORD_TOO_SHORT: {
		text: "Le mot doit contenir 5 lettres",
		type: "warning",
	},
	GAME_FINISHED: { text: "La partie est terminée", type: "info" },
	INVALID_CHARACTERS: {
		text: "Seules les lettres sont autorisées",
		type: "warning",
	},
	GAME_WON: {
		text: "Félicitations ! Vous avez gagné !",
		type: "success",
	},
};

@Component({
	selector: "app-pop-up",
	imports: [CommonModule],
	templateUrl: "./pop-up.component.html",
	styleUrl: "./pop-up.component.scss",
})
export class PopUpComponent {
	@Input() message: string = "";
	@Input() isVisible: boolean = false;
	@Input() type: "error" | "success" | "warning" | "info" = "error";

	getEmoji(): string {
		switch (this.type) {
			case "error":
				return "❌";
			case "success":
				return "✅";
			case "warning":
				return "⚠️";
			case "info":
				return "ℹ️";
			default:
				return "";
		}
	}
}
