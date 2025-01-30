export type MessageContent = {
  transcript?: string;
  delta?: string;
  text?: string;
};

export type MessageType = {
  type: string;
  [key: string]: MessageContent | string | undefined;
};

// 表示が必要なメッセージタイプを定義
const IMPORTANT_MESSAGE_TYPES = [
  'conversation.item.input_audio_transcription.completed',  // 音声入力の最終結果
  'response.audio_transcript.delta',                        // AIの応答（部分）
  'response.audio_transcript.done',                         // AIの応答完了
] as const;

// メッセージタイプの日本語訳
const messageTypeTranslations: Record<string, string> = {
  "conversation.item.input_audio_transcription.completed": "音声入力",
  "response.audio_transcript.delta": "AI応答",
  "response.audio_transcript.done": "AI応答完了",
};

// メッセージの重要度を判定
function isImportantMessage(msg: MessageType): boolean {
  return IMPORTANT_MESSAGE_TYPES.includes(msg.type as typeof IMPORTANT_MESSAGE_TYPES[number]);
}

// AIの部分応答をまとめる
function combineAIResponses(messages: MessageType[]): MessageType[] {
  const combinedMessages: MessageType[] = [];
  let currentAIResponse: MessageType | null = null;

  // メッセージを時系列順に処理
  for (const msg of messages) {
    if (msg.type === "conversation.item.input_audio_transcription.completed") {
      // ユーザーの入力は常に追加
      combinedMessages.push(msg);
    } else if (msg.type === "response.audio_transcript.delta") {
      // 部分応答の場合
      if (!currentAIResponse) {
        // 新しいAI応答を作成
        currentAIResponse = {
          type: "response.audio_transcript.delta",
          delta: "",
          timestamp: msg.timestamp
        };
      }
      // デルタを追加
      if (msg.delta) {
        currentAIResponse.delta = String(currentAIResponse.delta || "") + String(msg.delta || "");
      }
    } else if (msg.type === "response.audio_transcript.done" && currentAIResponse) {
      // 完了メッセージが来たら、蓄積したデルタを追加
      combinedMessages.push(currentAIResponse);
      currentAIResponse = null;
    }
  }

  // 未完了のAI応答があれば追加
  if (currentAIResponse && currentAIResponse.delta) {
    combinedMessages.push(currentAIResponse);
  }

  return combinedMessages;
}

export function translateMessage(msg: MessageType): {
  type: string;
  content: string;
  rawData: string;
  isImportant: boolean;
} {
  const isImportant = isImportantMessage(msg);
  
  // メッセージタイプの翻訳
  const translatedType = messageTypeTranslations[msg.type] || msg.type;

  // コンテンツの抽出と整形
  let content = "";
  if (msg.type === "conversation.item.input_audio_transcription.completed") {
    content = (msg as MessageType & { transcript?: string }).transcript || "";
  } else if (msg.type === "response.audio_transcript.delta") {
    content = (msg as MessageType & { delta?: string }).delta || "";
  } else if (msg.type === "response.audio_transcript.done") {
    content = (msg as MessageType & { text?: string }).text || (msg as MessageType & { transcript?: string }).transcript || "";
  }

  // 生データの整形（デバッグ用）
  const rawData = JSON.stringify(msg, null, 2);

  return {
    type: translatedType,
    content,
    rawData,
    isImportant
  };
}

// メッセージを処理（重要なメッセージのフィルタリングとAI応答の結合）
export function processMessages(messages: MessageType[]): MessageType[] {
  // 重要なメッセージのみをフィルタリング
  const importantMessages = messages.filter(isImportantMessage);
  // AIの応答をまとめる
  return combineAIResponses(importantMessages);
}
