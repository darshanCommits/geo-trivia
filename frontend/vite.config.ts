import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"), // Resolves @ to frontend/src
			"@shared": path.resolve(__dirname, "../shared/src"), // Resolves @ to frontend/src
		},
	},
});
