import { CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, computed, inject, model, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import type { Schema } from "@bymc/shared";
import type { z } from "zod";
import { CsvService } from "../../services/csv.service";

@Component({
	selector: "app-parse-qualifier-result-dialog",
	imports: [MatDialogModule, CdkDrag, CdkDropList, MatButtonModule],
	templateUrl: "./parse-qualifier-result-dialog.component.html",
	styleUrl: "./parse-qualifier-result-dialog.component.scss",
})
export class ParseQualifierResultDialog {
	private readonly reference = inject(MatDialogRef<ParseQualifierResultDialog>);
	private readonly csvService = inject(CsvService);
	private readonly snackbar = inject(MatSnackBar);

	protected readonly server = model(1);
	protected readonly results = signal<z.infer<typeof Schema.admin.resultEntry>[]>([]);
	protected readonly top5Results = computed(() => {
		const results = this.results();
		return results.slice(0, 5);
	});
	protected readonly restResults = computed(() => {
		if (this.results().length <= 5) {
			return [];
		}
		const results = this.results();
		return results.slice(5);
	});

	protected import(file: File) {
		if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
			this.snackbar.open("Please upload a valid CSV file.", "Close", {
				duration: 3000,
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = async (event) => {
			const csvContent = event.target?.result;

			if (typeof csvContent !== "string") {
				this.snackbar.open("Error reading the file content.", "Close", {
					duration: 3000,
				});
				return;
			}

			this.csvService
				.parse(csvContent.trim())
				.then((parsedResults) => {
					this.results.set(parsedResults);
					this.snackbar.open("CSV file parsed successfully.", "Close", {
						duration: 3000,
					});
				})
				.catch((error) => {
					console.error("Error parsing CSV:", error);
					this.snackbar.open(`Error parsing CSV: ${error.message}`, "Close", {
						duration: 3000,
					});
				});
		};
		reader.onerror = () => {
			this.snackbar.open("Error reading the file.", "Close", {
				duration: 3000,
			});
		};
		reader.readAsText(file);
	}

	protected onChangeFile(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || !target.files || target.files.length === 0) {
			return;
		}
		this.import(target.files[0]);
	}

	protected onDragOverFile(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		const dataTransfer = event.dataTransfer;
		if (!dataTransfer) {
			return;
		}
		event.dataTransfer.dropEffect = "copy";
	}

	protected async onDropFile(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		const dataTransfer = event.dataTransfer;
		if (!dataTransfer?.files || dataTransfer.files.length === 0) {
			return;
		}
		const file = dataTransfer.files[0];
		this.import(file);
	}

	protected onDropResult(event: CdkDragDrop<z.infer<typeof Schema.admin.resultEntry>>) {
		if (event.previousIndex >= 5 || event.currentIndex >= 5) {
			return; // Only allow reordering within the top 5 results
		}

		const updatedResults = [...this.results()];
		moveItemInArray(updatedResults, event.previousIndex, event.currentIndex);

		let position = 1;
		for (const result of updatedResults.slice(0, 5)) {
			result[0] = position;
			position++;
		}

		this.results.set(updatedResults);
	}

	protected onUpload() {
		this.reference.close({
			server: this.server(),
			data: this.results(),
		});
	}

	protected onClose() {
		this.reference.close();
	}
}
