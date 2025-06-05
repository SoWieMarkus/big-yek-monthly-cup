import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
	selector: "app-admin-page",
	imports: [RouterLink, RouterOutlet],
	templateUrl: "./admin-page.component.html",
	styleUrl: "./admin-page.component.scss",
})
export class AdminPage {
	private readonly authenticationService = inject(AuthenticationService);
	private readonly router = inject(Router);

	protected logout() {
		this.authenticationService.removeToken();
		this.router.navigate(["/login"]);
	}
}
