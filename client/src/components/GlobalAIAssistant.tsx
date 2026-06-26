import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function GlobalAIAssistant() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response: any) => {
      const assistantContent = typeof response === "string" ? response : response?.content || "";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
      setIsLoading(false);
    },
    onError: () => {
      toast.error(t("common.error", "حدث خطأ"));
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      await chatMutation.mutateAsync({ messages: [...messages, userMessage] });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          dir="rtl"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">{t("ai.assistant", "المساعد الذكي")}</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 left-6 z-50 flex w-[calc(100vw-3rem)] max-w-md flex-col rounded-2xl border bg-card shadow-2xl"
          style={{ height: "min(600px, calc(100vh - 6rem))" }}
          dir="rtl"
        >
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{t("ai.assistant", "المساعد الذكي")}</h3>
                <p className="text-xs text-muted-foreground">{t("ai.assistantDesc", "اسأل عن أي شيء في النظام")}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="mb-2 h-10 w-10 opacity-40" />
                <p className="text-sm">{t("ai.startConversation", "ابدأ محادثة مع المساعد الذكي")}</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : <p>{msg.content}</p>}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("common.loading", "جارٍ التحميل...")}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("ai.chatPlaceholder", "اكتب سؤالك...")}
                className="max-h-32 min-h-11 resize-none"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()} size="icon" className="self-end h-11 w-11 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
