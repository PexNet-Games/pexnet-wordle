import { Routes } from "@angular/router";
import { WordleComponent } from "./wordle/wordle.component";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "/wordle",
		pathMatch: "full",
	},
	{
		path: "wordle",
		component: WordleComponent,
	},
];
