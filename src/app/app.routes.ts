import { Routes } from "@angular/router";
import { WordleComponent } from "./wordle/wordle.component";
import { UnauthorizedComponent } from "./unauthorized/unauthorized.component";
import { discordAuthGuard } from "./guards/discord-auth.guard";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "/home",
		pathMatch: "full",
	},
	{
		path: "wordle",
		component: WordleComponent,
		canActivate: [discordAuthGuard],
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
