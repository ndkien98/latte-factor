/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const DB_FILE_PATH = path.resolve(import.meta.dirname, 'src/data/db.json');

const DEFAULT_DB = {
  transactions: [],
  categories: [
    { id: "tra-sua", label: "Trà sữa", icon: "", defaultLabel: "latte", color: "#6366f1" },
    { id: "an-vat", label: "Ăn vặt", icon: "", defaultLabel: "latte", color: "#f59e0b" },
    { id: "an-uong", label: "Ăn uống", icon: "", defaultLabel: "essential", color: "#10b981" },
    { id: "xang-xe", label: "Xăng xe", icon: "", defaultLabel: "essential", color: "#3b82f6" },
    { id: "tien-nha", label: "Tiền nhà", icon: "", defaultLabel: "essential", color: "#8b5cf6" },
    { id: "dien-nuoc", label: "Điện nước", icon: "", defaultLabel: "essential", color: "#06b6d4" },
    { id: "mua-sam", label: "Mua sắm", icon: "", defaultLabel: "latte", color: "#ec4899" },
    { id: "giai-tri", label: "Giải trí", icon: "", defaultLabel: "latte", color: "#ef4444" },
    { id: "y-te", label: "Y tế", icon: "", defaultLabel: "essential", color: "#14b8a6" },
    { id: "khac", label: "Khác", icon: "", defaultLabel: "unknown", color: "#94a3b8" }
  ],
  params: {
    k: 3,
    kmeansWeightAmount: 1,
    kmeansWeightFrequency: 1,
    kmeansWeightHour: 0.5,
    nbConfidenceThreshold: 0.7,
    lrForecastDays: 30,
    fvRate: 0.005,
    fvMonths: 12,
    budget: 500000,
    minSupport: 0.1,
    minConfidence: 0.6
  },
  chatMessages: []
};

function fileDatabasePlugin(): Plugin {
  return {
    name: 'file-database-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        if (url === '/api/db' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            if (fs.existsSync(DB_FILE_PATH)) {
              const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
              res.end(data);
            } else {
              fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
              res.end(JSON.stringify(DEFAULT_DB));
            }
          } catch {
            res.end(JSON.stringify(DEFAULT_DB));
          }
          return;
        }

        if (url === '/api/db' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Saved to db.json file successfully' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (url === '/api/db/reset' && req.method === 'POST') {
          try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Reset db.json successfully' }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    fileDatabasePlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
