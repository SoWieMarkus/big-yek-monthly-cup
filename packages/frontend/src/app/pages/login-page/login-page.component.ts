import { Component, inject, model, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../services/authentication.service";
import { BackendService } from "../../services/backend.service";

@Component({
	selector: "app-login-page",
	imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
})
export class LoginPage {
	private readonly router = inject(Router);
	private readonly backend = inject(BackendService);
	private readonly snackbar = inject(MatSnackBar);
	protected readonly authenticationService = inject(AuthenticationService);

	protected readonly username = model("");
	protected readonly password = model("");

	protected readonly passwordVisible = signal(false);
	protected readonly isLoggingIn = signal(false);

	protected login() {
		const username = this.username();
		const password = this.password();

		if (!username || !password) {
			this.snackbar.open("Username and password are required", "Close", {
				duration: 3000,
			});
			return;
		}
		this.isLoggingIn.set(true);
		this.backend.authentication
			.login({ username, password })
			.then(({ token }) => {
				this.authenticationService.setToken(token);
				this.router.navigate(["/admin"]);
				this.isLoggingIn.set(false);
			})
			.catch((error) => {
				console.error("Login failed:", error);
				this.snackbar.open(`Login failed: ${error.message}`, "Close", {
					duration: 3000,
				});
				this.password.set("");
				this.isLoggingIn.set(false);
			});
	}

	protected togglePasswordVisibility() {
		this.passwordVisible.update((visible) => !visible);
	}
}
