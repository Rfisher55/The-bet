#!/usr/bin/env node
/**
 * The Bet — Static file server
 * Serves the website root on port 3000 with correct MIME types and CORS.
 */
const http = require("http");
const fs   = require("fs");
const path = require("path");
const url  = require("url");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".ico":  "image/x-icon",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
};

http.createServer((req, res) => {
  const parsed   = url.parse(req.url);
  let   pathname = decodeURIComponent(parsed.pathname);

  // Default to index.html for root
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.join(ROOT, pathname);

  // Security: stay inside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type":  mime,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`The Bet running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${ROOT}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT",  () => process.exit(0));
