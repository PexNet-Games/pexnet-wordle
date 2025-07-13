import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";

@Component({
	selector: "app-instructions-modal",
	imports: [CommonModule],
	templateUrl: "./instructions-modal.component.html",
	styleUrl: "./instructions-modal.component.scss",
})
export class InstructionsModalComponent {
	@Input() isVisible: boolean = false;
	@Output() close = new EventEmitter<void>();

	public isClosing = signal<boolean>(false);

	onClose(): void {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300); // Match animation duration
	}

	onBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			this.onClose();
		}
	}
}
