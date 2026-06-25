import { useTranslation } from "react-i18next";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface ClientAIChatProps {
  clientId: number;
}

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function ClientAIChat({ clientId }: ClientAIChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response: any) => {
      const assistantContent = typeof response === 'string' ? response : (response?.content || '');
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
      setIsLoading(false);
    },
    onError: () => {
      toast.error(t("common.error", "An error occurred"));
      setIsLoading(false);
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      await chatMutation.mutateAsync({
        messages: [...messages, userMessage],
        clientId,
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          {t("ai.chat", "AI Assistant")}
        </CardTitle>
        <CardDescription>{t("ai.chatDesc", "Ask questions about client strategy and marketing")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/30 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center">
              <div>
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t("ai.startConversation", "Start a conversation with the AI assistant")}</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t("common.loading", "Loading...")}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSendMessage();
              }
            }}
            placeholder={t("ai.chatPlaceholder", "Ask a question...")}
            className="min-h-20 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
