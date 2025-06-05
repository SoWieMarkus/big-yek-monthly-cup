import { Component, inject, model, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterLink } from "@angular/router";
import { z } from "zod";
import { LoadingComponent } from "../../../components/loading/loading.component";
import type { AdminCup } from "../../../schemas/cup";
import { BackendService } from "../../../services/backend.service";

const getCurrentYearAndMonth = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;

	return month < 10 ? `${year}-0${month}` : `${year}-${month}`;
};

@Component({
	selector: "app-admin-dashboard-page",
	imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule, LoadingComponent],
	templateUrl: "./admin-dashboard-page.component.html",
	styleUrl: "./admin-dashboard-page.component.scss",
})
export class AdminDashboardPage {
	private readonly backendService = inject(BackendService);
	private readonly snackbar = inject(MatSnackBar);

	protected readonly yearAndMonth = model(getCurrentYearAndMonth());
	protected readonly cups = signal<AdminCup[]>([]);
	protected readonly loading = signal(true);

	protected createCup() {
		const [yearAsString, monthAsString] = this.yearAndMonth().split("-");
		const monthSchema = z.coerce.number().min(1).max(12);
		const yearSchema = z.coerce.number().min(2000).max(2100);
		const month = monthSchema.safeParse(monthAsString);
		const year = yearSchema.safeParse(yearAsString);

		if (!month.success || !year.success) {
			this.snackbar.open("Invalid year or month format. Please use YYYY-MM.", undefined, { duration: 3000 });
			return;
		}

		this.loading.set(true);

		this.backendService.admin
			.createCup({ month: month.data, year: year.data })
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open("Can't create cup. Does it already exist?", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	public ngAfterViewInit(): void {
		this.refresh();
	}

	protected refresh() {
		this.loading.set(true);

		this.backendService.admin
			.getAllCups()
			.then((data) => {
				this.cups.set(data);
				this.loading.set(false);
			})
			.catch((error) => {
				this.snackbar.open("Failed to refresh.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	protected getRedirect(id: string) {
		return `/admin/cup/${id}`;
	}

	protected delete(cup: AdminCup) {
		const confirmMessage = `Are you sure you want to delete the Cup "${cup.name}"?`;
		if (!confirm(confirmMessage)) return;

		this.loading.set(true);
		this.backendService.admin
			.deleteCup(cup.id)
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open("Failed to delete the cup.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	protected changeCupVisibility(cup: AdminCup) {
		const newVisibility = cup.public ? "private" : "public";
		const confirmMessage = `Are you sure you want to make the Cup "${cup.name}" ${newVisibility}?`;

		if (!confirm(confirmMessage)) return;

		this.loading.set(true);
		this.backendService.admin
			.setCupVisibility(cup.id, { visible: !cup.public })
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open("Failed to change the visibility of the cup.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	protected changeCurrentCup(cup: AdminCup) {
		const confirmMessage = `Are you sure you want to make the Cup "${cup.name}" the new current cup?`;
		if (!confirm(confirmMessage)) return;

		this.loading.set(true);
		this.backendService.admin
			.setCupToCurrent(cup.id)
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open("Failed to change the current cup.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	protected rename(cup: AdminCup) {
		const name = prompt(`New name of cup "${cup.name}"`);
		if (name === null || name === undefined) return;
		this.loading.set(true);

		this.backendService.admin
			.renameCup(cup.id, { name })
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open("Failed to rename the cup.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			});
	}
}
