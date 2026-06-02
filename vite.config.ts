
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          // React core — needed everywhere, separate so it caches across deploys
          if (/react|react-dom|react-router-dom|@tanstack\/react-query/.test(id)) {
            return 'vendor-react';
          }
          // Radix UI primitives — large, only used by shadcn components
          if (id.includes('@radix-ui')) return 'vendor-radix';
          // Icon library — tree-shaken but still chunky
          if (id.includes('lucide-react')) return 'vendor-icons';
          // Supabase client — only loaded when DB calls happen
          if (id.includes('@supabase')) return 'vendor-supabase';
          // Charts / flow — heavy, only on a few admin pages
          if (id.includes('recharts') || id.includes('@xyflow')) return 'vendor-charts';
          // Forms + validation
          if (/react-hook-form|@hookform|zod/.test(id)) return 'vendor-forms';
        }
      }
    }
  }
}));
