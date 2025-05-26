import {
	createRouter,
	createRoute,
	createRootRoute,
	Outlet,
} from "@tanstack/react-router";

import Home from "@/pages/home";
import GamePage from "@/pages/game";
import LeaderBoard from "@/pages/leaderboard";

import SessionPage from "./pages/session-new";
import GameLobby from "./pages/gamelobby";

const rootRoute = createRootRoute({
	component: () => <Outlet />,
});

const routes = {
	index: createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: Home,
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
		component: SessionPage,
	}),
	lobby: createRoute({
		getParentRoute: () => rootRoute,
		path: "lobby",
		component: GameLobby,
	}),
} as const;

const routeTree = rootRoute.addChildren(Object.values(routes));

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export const router = createRouter({ routeTree });
