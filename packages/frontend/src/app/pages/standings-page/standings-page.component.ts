import { Component, computed, inject, signal } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoadingComponent } from "../../components/loading/loading.component";
import type { Cup } from "../../schemas/cup";
import type { LeaderboardEntry } from "../../schemas/leaderboard";
import { BackendService } from "../../services/backend.service";

@Component({
	selector: "app-standings-page",
	imports: [LoadingComponent],
	templateUrl: "./standings-page.component.html",
	styleUrl: "./standings-page.component.scss",
})
export class StandingsPage {
	private readonly backend = inject(BackendService);
	private readonly snackbar = inject(MatSnackBar);

	protected readonly cup = signal<Cup | null>(null);

	protected readonly leaderboard = computed(() => {
		const cup = this.cup();
		if (cup === null) return [];
		return cup.leaderboard.entries;
	});

	protected readonly name = computed(() => {
		const cup = this.cup();
		if (cup === null) return "";
		return cup.name;
	});

	public ngOnInit(): void {
		this.backend.cups
			.current()
			.then((cup) => {
				this.cup.set(cup);
			})
			.catch((error) => {
				console.error("Failed to load current cup:", error);
				this.snackbar.open("Failed to load current cup", "Close", {
					duration: 3000,
				});
				this.cup.set(null);
			});
	}

	protected getPosition(entry: LeaderboardEntry) {
		if (entry.qualified) return "Qualified";
		return `${entry.position}.`;
	}

	protected getPoints(entry: LeaderboardEntry) {
		if (entry.qualified) return "-";
		return entry.points;
	}
}
