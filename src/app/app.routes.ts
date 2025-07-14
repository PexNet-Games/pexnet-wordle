import { Routes } from "@angular/router";
import { WordleComponent } from "./wordle/wordle.component";
import { UnauthorizedComponent } from "./unauthorized/unauthorized.component";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "/home",
		pathMatch: "full",
	},
	{
		path: "wordle",
		component: WordleComponent,
	},
	{
		path: "unauthorized",
		component: UnauthorizedComponent,
	},
	{
		path: "**",
		redirectTo: "/unauthorized",
	},
];
