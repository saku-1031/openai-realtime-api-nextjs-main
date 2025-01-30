import { Conversation } from "@/lib/conversations"
import { MessageType } from "@/lib/message-translator"
import { useEffect, useRef } from "react"
import { translateMessage, processMessages } from "@/lib/message-translator"

export function MessageControls({ conversation, msgs }: { conversation: Conversation[], msgs: MessageType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // メッセージを処理（重要なメッセージのフィルタリングとAI応答の結合）
  const processedMsgs = processMessages(msgs);

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
    <div className="flex-1 flex flex-col min-h-0">
      {/* メッセージログの表示 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-2 py-4"
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {processedMsgs.map((msg, i) => {
          const translated = translateMessage(msg);
          const isUser = msg.type === "conversation.item.input_audio_transcription.completed";
          const isPartialAI = msg.type === "response.audio_transcript.delta";
          
          if (!translated.content) return null;

          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0" />
              )}
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2
                  ${isUser 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-muted rounded-bl-sm'
                  }
                  ${isPartialAI ? 'opacity-70' : 'opacity-100'}
                `}
              >
                <div className="break-words whitespace-pre-wrap text-sm">
                  {translated.content}
                </div>
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}