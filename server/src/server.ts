import express, { Request, Response, NextFunction } from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { pino } from "pino";
import { RTSession } from "./session.js";
import { getSystemMessage } from "./systemMessages.js";
import { CarCommand, CarControlMessage } from "./types.js";

const PORT = process.env.PORT || 8080;

const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
  transport: { target: "pino-pretty", options: { colorize: true } },
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Store for ESP32 car connections
const carConnections = new Map<string, WebSocket>();

// Function to broadcast commands to all connected cars
export function broadcastToCarDevices(commands: CarCommand[]) {
  const message: CarControlMessage = {
    type: "car_control",
    commands: commands,
  };
  const messageStr = JSON.stringify(message);

  let sentCount = 0;
  carConnections.forEach((ws, carId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
      sentCount++;
      logger.info({ carId, commands }, "🚗 Sent commands to car");
    }
  });

  if (sentCount === 0) {
    logger.warn("🟠 No car devices connected to receive commands");
  }

  return sentCount;
}

app.use(express.json()); // Middleware to parse JSON bodies

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url!, `http://${request.headers.host}`);
  if (pathname === "/realtime") {
    logger.debug({ pathname }, "Handling WebSocket upgrade request");
    wss.handleUpgrade(request, socket, head, (ws) => {
      logger.debug("WebSocket upgrade successful");
      wss.emit("connection", ws, request);
    });
  } else {
    logger.warn({ pathname }, "Invalid WebSocket path - destroying connection");
    socket.destroy();
  }
});

wss.on("connection", (ws: WebSocket) => {
  logger.info("🟢 New Client websocket connection opened");
  let rtSession: RTSession | null = null;
  let carId: string | null = null;

  const handleSocketEvent = (eventType: string, data?: any) => {
    switch (eventType) {
      case "message":
        if (!data) {
          logger.warn("Received empty message");
          return;
        }

        try {
          const messageText = data.toString();
          const parsedMessage = JSON.parse(messageText);

          // Handle ESP32 car device registration
          if (parsedMessage.type === "car_register") {
            const newCarId = parsedMessage.carId || `car_${Date.now()}`;
            carId = newCarId;
            carConnections.set(newCarId, ws);
            logger.info({ carId: newCarId }, "🚗 ESP32 car device registered");
            ws.send(
              JSON.stringify({ type: "car_registered", carId: newCarId }),
            );
            return;
          }

          // Handle direct car control from frontend (bypass AI)
          if (parsedMessage.type === "car_direct_control") {
            logger.info(
              { commands: parsedMessage.commands },
              "🎮 Direct car control received",
            );
            const sentCount = broadcastToCarDevices(parsedMessage.commands);
            ws.send(
              JSON.stringify({
                type: "car_control_sent",
                success: sentCount > 0,
                deviceCount: sentCount,
              }),
            );
            return;
          }

          // Handle AI session initialization
          if (parsedMessage.type === "init") {
            if (rtSession) {
              logger.warn(
                "🟠 RTSession already exists - ignoring duplicate init",
              );
              return;
            }

            logger.info("🔄 Initializing RTSession");
            const systemMessage = getSystemMessage(
              parsedMessage.systemMessageType,
            );
            logger.info({ systemMessage }, "✅ System message retrieved");

            rtSession = new RTSession(ws, logger, systemMessage);
            // Remove message handler once session is created
            ws.off("message", messageHandler);
          }
        } catch (error) {
          logger.error(
            { error, message: data.toString() },
            "🔥 Failed to process message",
          );
        }
        break;

      case "error":
        logger.error({ error: data }, "🔥 WebSocket error occurred");
        rtSession?.dispose();
        rtSession = null;
        break;

      case "close":
        logger.info("🔴 WebSocket connection closed");
        rtSession?.dispose();
        rtSession = null;

        // Remove car from connections if it was a car device
        if (carId) {
          carConnections.delete(carId);
          logger.info({ carId }, "🚗 ESP32 car device disconnected");
        }
        break;
    }
  };

  const messageHandler = (message: any) =>
    handleSocketEvent("message", message);

  ws.on("message", messageHandler);
  ws.on("error", (error: Error) => handleSocketEvent("error", error));
  ws.on("close", () => handleSocketEvent("close"));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err, "🔥 Unhandled error");
  res.status(500).json({ error: "🔥 Internal server error" });
});

server.listen(PORT, () =>
  logger.info(`🟢 WebSocket server started on http://localhost:${PORT}`),
);

server.on("close", () => {
  logger.info("🔴 WebSocket server stopped");
});
