import { Injectable } from "@angular/core";
import { Schema } from "@bymc/shared";
import Papa from "papaparse";
import type { z } from "zod";

@Injectable({
	providedIn: "root",
})
export class CsvService {
	public async parse(csv: string) {
		return new Promise<z.infer<typeof Schema.admin.resultEntry>[]>((resolve, reject) => {
			Papa.parse(csv, {
				header: false,
				skipEmptyLines: true,
				dynamicTyping: true,
				complete: (results) => {
					if (results.errors.length > 0) {
						reject(new Error(`CSV parsing error: ${results.errors.map((e) => e.message).join(", ")}`));
						return;
					}

					const { success, data, error } = Schema.admin.resultEntry.array().safeParse(results.data);
					if (!success) {
						console.error("CSV parsing failed:", error);
						reject(new Error(`CSV validation error: ${error.errors[0].message}`));
						return;
					}
					resolve(data);
				},
			});
		});
	}
}
