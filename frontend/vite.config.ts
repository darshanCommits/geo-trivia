import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"), // Resolves @ to frontend/src
			"@shared": path.resolve(__dirname, "../shared/src"), // Resolves @ to frontend/src
		},
	},
});
