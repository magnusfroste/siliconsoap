
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
          // Order matters — check scoped packages first so they don't match the generic /react/ regex below
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack')) return 'vendor-react';
          if (id.includes('@hookform') || id.includes('react-hook-form') || id.includes('/zod/')) return 'vendor-forms';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('recharts') || id.includes('@xyflow')) return 'vendor-charts';
          // React core last — generic match
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'vendor-react';
          }
        }
      }
    }
  }
}));
