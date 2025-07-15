import { CommonModule } from "@angular/common";
import {
	Component,
	ChangeDetectionStrategy,
	signal,
	input,
	output,
} from "@angular/core";

@Component({
	selector: "app-instructions-modal",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./instructions-modal.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionsModalComponent {
	isVisible = input<boolean>(false);
	close = output<void>();

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
