import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";
import type { IncomingMessage } from "http";

interface WebSocketMessage {
  type: "notification" | "activity" | "comment" | "presence" | "typing";
  userId: string;
  data: any;
  timestamp: string;
}

interface UserPresence {
  userId: string;
  username: string;
  status: "online" | "away" | "offline";
  lastSeen: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private userConnections: Map<string, WebSocket[]> = new Map();
  private userPresence: Map<string, UserPresence> = new Map();
  private messageHistory: WebSocketMessage[] = [];
  private maxHistorySize = 100;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      const url = parse(req.url || "", true);
      const userId = url.query.userId as string;
      const username = url.query.username as string;

      if (!userId) {
        ws.close(1008, "Missing userId");
        return;
      }

      const connectionId = uuidv4();
      console.log(`[WebSocket] User ${userId} connected with ID ${connectionId}`);

      // Add user to connections map
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)!.push(ws);

      // Update user presence
      this.userPresence.set(userId, {
        userId,
        username: username || "Unknown",
        status: "online",
        lastSeen: new Date().toISOString(),
      });

      // Broadcast presence update
      this.broadcastPresence();

      // Handle incoming messages
      ws.on("message", (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          message.userId = userId;
          message.timestamp = new Date().toISOString();

          // Store in history
          this.messageHistory.push(message);
          if (this.messageHistory.length > this.maxHistorySize) {
            this.messageHistory.shift();
          }

          // Route message based on type
          this.handleMessage(message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      // Handle disconnection
      ws.on("close", () => {
        const connections = this.userConnections.get(userId);
        if (connections) {
          const index = connections.indexOf(ws);
          if (index > -1) {
            connections.splice(index, 1);
          }
          if (connections.length === 0) {
            this.userConnections.delete(userId);
            this.userPresence.delete(userId);
            this.broadcastPresence();
          }
        }
        console.log(`[WebSocket] User ${userId} disconnected`);
      });

      // Handle errors
      ws.on("error", (error: Error) => {
        console.error("[WebSocket] Error:", error);
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "notification":
        this.broadcastNotification(message);
        break;
      case "activity":
        this.broadcastActivity(message);
        break;
      case "comment":
        this.broadcastComment(message);
        break;
      case "typing":
        this.broadcastTyping(message);
        break;
      default:
        console.warn(`[WebSocket] Unknown message type: ${message.type}`);
    }
  }

  private broadcastNotification(message: WebSocketMessage) {
    const notification = {
      type: "notification",
      data: message.data,
      from: message.userId,
      timestamp: message.timestamp,
    };
    this.broadcast(notification);
  }

  private broadcastActivity(message: WebSocketMessage) {
    const activity = {
      type: "activity",
      data: message.data,
      from: message.userId,
      timestamp: message.timestamp,
    };
    this.broadcast(activity);
  }

  private broadcastComment(message: WebSocketMessage) {
    const comment = {
      type: "comment",
      data: message.data,
      from: message.userId,
      timestamp: message.timestamp,
    };
    this.broadcast(comment);
  }

  private broadcastTyping(message: WebSocketMessage) {
    const typing = {
      type: "typing",
      data: message.data,
      from: message.userId,
      timestamp: message.timestamp,
    };
    this.broadcast(typing);
  }

  private broadcastPresence() {
    const presence = {
      type: "presence",
      data: Array.from(this.userPresence.values()),
      timestamp: new Date().toISOString(),
    };
    this.broadcast(presence);
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  public sendToUser(userId: string, message: any) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      const data = JSON.stringify(message);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    }
  }

  public getPresence(): UserPresence[] {
    return Array.from(this.userPresence.values());
  }

  public getMessageHistory(): WebSocketMessage[] {
    return this.messageHistory;
  }
}

export default WebSocketManager;
