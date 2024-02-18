import path from "path";
import { fileURLToPath } from "url";

import { WebSocketServer } from "ws";
import fs from "fs";

import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import sirv from "sirv";
import compress from "compression";

import { appRouter, createContext } from "./trpc.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");
  const writeStream = fs.createWriteStream("output.webm");

  ws.on("message", (message) => {
    console.log("Received chunk");
    writeStream.write(message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    writeStream.end();
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const assets = sirv("public", {
  maxAge: 31536000,
  immutable: true,
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.static(path.join(__dirname, "public")));
app.use(compress, assets);

const { PORT = 5000 } = process.env;

app.listen(PORT, () => {
  console.log();
  console.log(
    `tRPC running at \x1b[36mhttp://localhost:\x1b[1m${PORT}/\x1b[0m`,
  );
});
