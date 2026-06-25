import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface UserPresence {
  userId: string;
  username: string;
  status: "online" | "away" | "offline";
  lastSeen: string;
}

interface RealtimeMessage {
  type: "notification" | "activity" | "comment" | "presence" | "typing";
  data: any;
  from: string;
  timestamp: string;
}

export function useRealtimeCollaboration() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userPresence, setUserPresence] = useState<UserPresence[]>([]);
  const [incomingMessages, setIncomingMessages] = useState<RealtimeMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const connect = useCallback(() => {
    if (!user) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}&username=${encodeURIComponent(user.name || "Unknown")}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);

          if (message.type === "presence") {
            setUserPresence(message.data);
          } else {
            setIncomingMessages((prev) => [...prev, message]);

            // Show toast for notifications
            if (message.type === "notification") {
              toast.info(message.data.title || "New notification");
            }

            // Show toast for comments
            if (message.type === "comment" && message.from !== String(user?.id)) {
              toast.info(`${message.data.author} commented`);
            }
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
    }
  }, [user?.id, user?.name]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type,
          data,
        })
      );
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, message: string) => {
      sendMessage("notification", { title, message });
    },
    [sendMessage]
  );

  const sendActivity = useCallback(
    (action: string, entity: string, entityId: string) => {
      sendMessage("activity", { action, entity, entityId });
    },
    [sendMessage]
  );

  const sendComment = useCallback(
    (content: string, entityId: string, entityType: string) => {
      sendMessage("comment", { content, entityId, entityType, author: user?.name });
    },
    [sendMessage, user?.name]
  );

  const sendTyping = useCallback(
    (entityId: string, isTyping: boolean) => {
      sendMessage("typing", { entityId, isTyping });
    },
    [sendMessage]
  );

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    userPresence,
    incomingMessages,
    sendNotification,
    sendActivity,
    sendComment,
    sendTyping,
  };
}
