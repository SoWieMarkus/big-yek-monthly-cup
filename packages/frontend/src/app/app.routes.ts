import type { Routes } from "@angular/router";
import { AuthenticationGuard } from "./authentication.guard";
import { AdminCupPage } from "./pages/admin-page/admin-cup-page/admin-cup-page.component";
import { AdminDashboardPage } from "./pages/admin-page/admin-dashboard-page/admin-dashboard-page.component";
import { AdminPage } from "./pages/admin-page/admin-page.component";
import { LoginPage } from "./pages/login-page/login-page.component";
import { PrivacyPolicyPage } from "./pages/privacy-policy-page/privacy-policy-page.component";
import { StandingsPage } from "./pages/standings-page/standings-page.component";

export const routes: Routes = [
	{
		path: "admin",
		component: AdminPage,
		title: "BYMC: Admin Panel",
		canActivate: [AuthenticationGuard],
		children: [
			{
				path: "",
				redirectTo: "dashboard",
				pathMatch: "full",
			},
			{
				path: "dashboard",
				component: AdminDashboardPage,
			},
			{
				path: "cup/:id",
				component: AdminCupPage,
			},
		],
	},
	{
		path: "privacy-policy",
		component: PrivacyPolicyPage,
		title: "BYMC: Privacy Policy",
	},
	{
		path: "standings",
		component: StandingsPage,
		title: "BYMC: Standings",
	},
	{
		path: "login",
		component: LoginPage,
		title: "BYMC: Login",
	},
	{
		path: "",
		redirectTo: "/standings",
		pathMatch: "full",
	},
	{
		path: "**",
		redirectTo: "/standings",
		pathMatch: "full",
	},
];
