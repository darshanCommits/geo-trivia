import {
	createRouter,
	createRoute,
	createRootRoute,
	Outlet,
} from "@tanstack/react-router";

import Home from "@/pages/home";
import LoginPage from "@/pages/auth";
import GamePage from "@/pages/game";
import LeaderBoard from "@/pages/leaderboard";
import Session from "@/pages/Session";
import ShareSession from "@/components/ShareSession";
import { GameLobby } from "./pages/gamelobby";

const rootRoute = createRootRoute({
	component: () => <Outlet />,
});

const routes = {
	index: createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: Home,
	}),
	auth: createRoute({
		getParentRoute: () => rootRoute,
		path: "auth",
		component: LoginPage,
	}),
	game: createRoute({
		getParentRoute: () => rootRoute,
		path: "game",
		component: GamePage,
	}),
	leaderboard: createRoute({
		getParentRoute: () => rootRoute,
		path: "leaderboard",
		component: LeaderBoard,
	}),
	session: createRoute({
		getParentRoute: () => rootRoute,
		path: "session",
		component: Session,
	}),
	lobby: createRoute({
		getParentRoute: () => rootRoute,
		path: "lobby",
		component: GameLobby,
	}),
	shareSession: createRoute({
		getParentRoute: () => rootRoute,
		path: "share",
		component: ShareSession,
		validateSearch: (search) => ({
			sessionId: String(search.sessionId || ""),
		}),
	}),
} as const;

const routeTree = rootRoute.addChildren(Object.values(routes));

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export const router = createRouter({ routeTree });
