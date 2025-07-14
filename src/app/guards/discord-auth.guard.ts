import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError, map, timeout, first } from "rxjs/operators";
import { of } from "rxjs";

interface ProfileResponse {
	success: boolean;
	discordId?: string;
	username?: string;
}

export const discordAuthGuard: CanActivateFn = () => {
	const http = inject(HttpClient);

	console.log("GUARD: Starting authentication check");
	console.log("GUARD: API URL:", environment.apiUrl);
	console.log("GUARD: Full profile URL:", `${environment.apiUrl}/auth/profile`);
	return false;
	// Check authentication with the correct API endpoint
	return http
		.get<ProfileResponse>(`${environment.apiUrl}/auth/profile`, {
			withCredentials: true,
		})
		.pipe(
			first(),
			timeout(5000),
			map((response: ProfileResponse) => {
				console.log("GUARD: Response received:", response);

				if (response?.success === true && response?.discordId) {
					console.log("GUARD: ✅ Authentication successful - allowing access");
					console.log("GUARD: User:", response.username || response.discordId);
					return true;
				} else {
					console.log(
						"GUARD: ❌ Authentication failed - redirecting to unauthorized",
					);
					console.log(
						"GUARD: Expected success=true and discordId, got:",
						response,
					);
					// Use window.location to force redirect
					setTimeout(() => {
						console.log("GUARD: Forcing redirect to /unauthorized");
						window.location.href = "/unauthorized";
					}, 0);
					return false;
				}
			}),
			catchError((error) => {
				console.error("GUARD: Authentication error:");
				console.error("GUARD: Status:", error.status);
				console.error("GUARD: Message:", error.message);
				console.error("GUARD: URL:", error.url);

				// Use window.location to force redirect
				setTimeout(() => {
					console.log("GUARD: Forcing redirect to /unauthorized due to error");
					window.location.href = "/unauthorized";
				}, 0);
				return of(false);
			}),
		);
};
