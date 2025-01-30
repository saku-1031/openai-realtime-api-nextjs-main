import { Conversation } from "@/lib/conversations"
import { MessageType } from "@/lib/message-translator"
import { useMemo, useRef, useEffect } from "react"
import { translateMessage, processMessages } from "@/lib/message-translator"
import cn from "classnames"

export function MessageControls({ conversation, msgs }: { conversation: Conversation[], msgs: MessageType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // メッセージを処理（重要なメッセージのフィルタリングとAI応答の結合）
  const processedMsgs = useMemo(() => processMessages(msgs), [msgs]);

  // 新しいメッセージが来たらスクロールを一番下に移動
  useEffect(() => {
    if (scrollRef.current) {
      // DOMの更新を待つために少し遅延を入れる
      const timeoutId = setTimeout(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [processedMsgs]);

  if (conversation.length === 0) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {processedMsgs.map((msg, index) => {
            const translatedMsg = translateMessage(msg);
            const isUserMessage = msg.type === "conversation.item.input_audio_transcription.completed";
            
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4",
                  isUserMessage ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    isUserMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm font-medium mb-1">
                    {isUserMessage ? "あなた" : "AI"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {translatedMsg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}