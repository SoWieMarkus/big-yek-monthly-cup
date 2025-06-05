import { Component, computed, inject, model, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LoadingComponent } from "../../../components/loading/loading.component";
import { ParseQualifierResultDialog } from "../../../dialogs/parse-qualifier-result-dialog/parse-qualifier-result-dialog.component";
import type { AdminCupDetails } from "../../../schemas/cup";
import type { AdminQualifier } from "../../../schemas/qualifier";
import { BackendService } from "../../../services/backend.service";

@Component({
	selector: "app-admin-cup-page",
	imports: [RouterLink, MatIconModule, FormsModule, LoadingComponent, MatButtonModule],
	templateUrl: "./admin-cup-page.component.html",
	styleUrl: "./admin-cup-page.component.scss",
})
export class AdminCupPage {
	private readonly backendService = inject(BackendService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly dialog = inject(MatDialog);
	private readonly snackbar = inject(MatSnackBar);

	protected readonly version = model(4);

	protected readonly cup = signal<null | AdminCupDetails>(null);
	protected readonly qualifier = computed(() => {
		const cup = this.cup();
		if (cup === null) return [];
		return cup.qualifier;
	});
	protected readonly header = computed(() => {
		const cup = this.cup();
		if (cup === null) return "";
		return cup.name;
	});

	protected readonly loading = signal(false);

	public ngOnInit(): void {
		this.refresh();
	}

	protected openUploadDialog(qualifierId: string) {
		const cup = this.cup();
		if (cup === null) return;
		this.dialog
			.open(ParseQualifierResultDialog)
			.afterClosed()
			.subscribe((data) => {
				if (data === null || data === undefined) return;
				this.loading.set(true);
				this.backendService.admin
					.updateQualifier(cup.id, qualifierId, data)
					.then(() => {
						this.refresh();
					})
					.catch((error) => {
						this.snackbar.open("Failed to update qualifier results.", undefined, { duration: 5000 });
						console.error(error);
						this.loading.set(false);
					});
			});
	}

	protected clear(qualifierId: string) {
		const message = "Are you sure that you want to delete the results of this cup?";
		if (!confirm(message)) return;
		const cup = this.cup();
		if (cup === null) return;
		this.loading.set(true);
		this.backendService.admin
			.clearQualifier(cup.id, qualifierId)
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				this.snackbar.open(`Failed to clear the Results of Qualifier ${qualifierId}`, undefined, { duration: 5000 });
				console.error(error);
				this.loading.set(false);
			});
	}

	protected refresh() {
		const cupId = this.route.snapshot.paramMap.get("id");
		if (cupId === null) {
			this.router.navigate(["/admin"]);
			return;
		}
		this.loading.set(true);
		this.backendService.admin
			.getCupDetails(cupId)
			.then((data) => {
				this.cup.set(data);
				this.loading.set(false);
			})
			.catch((error) => {
				console.error(error);
				this.snackbar.open("Failed to refresh.", undefined, { duration: 5000 });
				this.loading.set(false);
			});
	}

	protected getColorByAmount(results: number) {
		return results > 0 ? "green" : "red";
	}

	protected addQualifier() {
		const cup = this.cup();
		if (cup === null) return;
		this.loading.set(true);
		const version = this.version();
		this.backendService.admin
			.createQualifier(cup.id, { version })
			.then(() => {
				this.refresh();
			})
			.catch((error) => {
				console.error(error);
				this.snackbar.open(`Failed to create qualifier ${version}. Does it already exist?`, undefined, {
					duration: 5000,
				});
				this.loading.set(false);
			});
	}

	protected deleteQualifier(qualifier: AdminQualifier) {
		const cup = this.cup();
		if (cup === null) return;
		const message = "Are you sure you want to delete this qualifier?";
		if (!confirm(message)) return;
		this.loading.set(true);
		this.backendService.admin
			.deleteQualifier(cup.id, qualifier.id)
			.then(() => {
				this.snackbar.open(`Qualifier ${qualifier.version} deleted successfully.`, undefined, { duration: 5000 });
				this.refresh();
			})
			.catch((error) => {
				console.error(error);
				this.snackbar.open(`Failed to delete qualifier ${qualifier.version}.`, undefined, { duration: 5000 });
				this.loading.set(false);
			});
	}
}
