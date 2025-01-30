"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { MessageControls } from "@/components/message-controls"
import { BroadcastButton } from "@/components/broadcast-button"
import { TextInput } from "@/components/text-input"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"
import { VoiceSelector } from "@/components/voice-selector"

const App: React.FC = () => {
  // State for voice selection and UI modes
  const [voice, setVoice] = useState("alloy")
  const [isOpen, setIsOpen] = useState(false)

  // WebRTC Audio Session Hook
  const {
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage
  } = useWebRTCAudioSession(voice, tools)

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: 'getCurrentTime',
        backgroundFunction: 'changeBackgroundColor',
        partyFunction: 'partyMode',
        launchWebsite: 'launchWebsite', 
        copyToClipboard: 'copyToClipboard',
        scrapeWebsite: 'scrapeWebsite'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions])

  return (
    <main className="h-full">
      {/* チャットボットトグルボタン */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* チャットボットウィンドウ */}
      <motion.div 
        className={`fixed bottom-24 right-6 w-96 bg-background rounded-lg shadow-xl border overflow-hidden ${isOpen ? 'flex' : 'hidden'} flex-col`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20, scale: isOpen ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {/* ヘッダー */}
        <div className="p-4 border-b bg-background">
          <div className="space-y-4">
            <VoiceSelector value={voice} onValueChange={setVoice} />
            <BroadcastButton 
              isSessionActive={isSessionActive} 
              onClick={handleStartStopClick}
            />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <MessageControls 
              conversation={conversation} 
              msgs={msgs} 
            />
          </div>
          <div className="p-4 border-t bg-background">
            <TextInput 
              onSubmit={sendTextMessage}
              disabled={!isSessionActive}
            />
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default App;