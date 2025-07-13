import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { WordleComponent } from "./wordle/wordle.component";

@Component({
	selector: "app-root",
	imports: [CommonModule, WordleComponent],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent {}
