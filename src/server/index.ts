import fs from "fs";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    const id = randomUUID();
    const fileName = `${id}.mp4`;
    const writeStream = fs.createWriteStream(fileName);

    console.log(`Client connected, creating stream file`, fileName);

    ws.on("message", (message) => {
        console.log("Received chunk");
        writeStream.write(message);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        writeStream.end();
    });
});
