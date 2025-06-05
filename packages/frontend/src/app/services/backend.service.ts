import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Schema } from "@bymc/shared";
import type { Observable } from "rxjs";
import type { z } from "zod";
import { environment } from "../../environments/environment";
import { AuthenticationSchema } from "../schemas/authentication";
import { AdminCupDetailsSchema, AdminCupSchema, CupSchema } from "../schemas/cup";
import { LeaderboardEntrySchema } from "../schemas/leaderboard";
import { QualifierSchema } from "../schemas/qualifier";

const BACKEND_URL = environment.backend;

@Injectable({
	providedIn: "root",
})
export class BackendService {
	private readonly http = inject(HttpClient);

	private handleResponse<T>(observable: Observable<T>, responseModel?: z.Schema<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			observable.subscribe({
				next: (response) => {
					if (!responseModel) {
						resolve(response);
						return;
					}
					const { success, data, error } = responseModel.safeParse(response);
					if (!success) {
						reject(new Error(error.message));
						return;
					}
					resolve(data);
				},
				error: (error) => {
					console.error("Error in backend service:", error);
					reject(new Error(error.error?.error ?? "An error occurred while processing the request."));
				},
			});
		});
	}

	private get<T>(url: string, responseModel?: z.Schema<T>): Promise<T> {
		return this.handleResponse(this.http.get<T>(`${BACKEND_URL}/${url}`), responseModel);
	}

	private post<T>(url: string, body: unknown, responseModel?: z.Schema<T>): Promise<T> {
		return this.handleResponse(this.http.post<T>(`${BACKEND_URL}/${url}`, body), responseModel);
	}

	private delete<T>(url: string, responseModel?: z.Schema<T>): Promise<T> {
		return this.handleResponse(this.http.delete<T>(`${BACKEND_URL}/${url}`), responseModel);
	}

	public get admin() {
		return {
			createCup: (data: z.infer<typeof Schema.admin.create>) => {
				return this.post("admin/cup/create", data);
			},
			setCupVisibility: (cupId: string, visibility: z.infer<typeof Schema.admin.visibility>) => {
				return this.post(`admin/cup/${cupId}/public`, visibility);
			},
			renameCup: (cupId: string, name: z.infer<typeof Schema.admin.rename>) => {
				return this.post(`admin/cup/${cupId}/rename`, name);
			},
			deleteCup: (cupId: string) => {
				return this.delete(`admin/cup/${cupId}/delete`);
			},
			setCupToCurrent: (cupId: string) => {
				return this.post(`admin/cup/${cupId}/current`, {});
			},
			getCupDetails: (cupId: string) => {
				return this.get(`admin/cup/${cupId}`, AdminCupDetailsSchema);
			},
			updateQualifier: (cupId: string, qualifierId: string, data: z.infer<typeof Schema.admin.updateQualifier>) => {
				return this.post(`admin/cup/${cupId}/qualifier/${qualifierId}/update`, data);
			},
			clearQualifier: (cupId: string, qualifierId: string) => {
				return this.delete(`admin/cup/${cupId}/qualifier/${qualifierId}/clear`);
			},
			getAllCups: () => {
				return this.get("admin/cups", AdminCupSchema.array());
			},
			createQualifier: (cupId: string, data: z.infer<typeof Schema.admin.createQualifier>) => {
				return this.post(`admin/cup/${cupId}/qualifier/create`, data, QualifierSchema);
			},
			deleteQualifier: (cupId: string, qualifierId: string) => {
				return this.delete(`admin/cup/${cupId}/qualifier/${qualifierId}/delete`);
			},
		};
	}

	public get authentication() {
		return {
			login: (data: z.infer<typeof Schema.authentication.login>) => {
				return this.post("authentication/login", data, AuthenticationSchema);
			},
		};
	}

	public get cups() {
		return {
			getAllCups: () => {
				return this.get("cups", CupSchema.array());
			},
			current: () => {
				return this.get("cups/current", CupSchema);
			},
			getQualifier: (qualifierId: string) => {
				return this.get(`cups/qualifier/${qualifierId}`, QualifierSchema);
			},
			leaderboard: (cupId: string) => {
				return this.get(`cups/leaderboard/${cupId}`, LeaderboardEntrySchema.array());
			},
		};
	}
}
