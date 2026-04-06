'use client'

import { useState, useCallback } from 'react'
import {
  DemoMessage,
  QuestionStep,
  AnswerRecord,
  getFirstMessage,
  processAnswer,
  calculateScore,
  getScoreBand,
  formatTime,
} from './whatsapp-conversation'

export interface WhatsAppDemoState {
  messages: DemoMessage[]
  step: QuestionStep
  isTyping: boolean
  isDone: boolean
  score: number
  band: 'HOT' | 'WARM' | 'COLD'
  answers: AnswerRecord
  sendMessage: (text: string) => void
  restart: () => void
}

function makeInitialMessages(): DemoMessage[] {
  return [{ id: '0', sender: 'bot', text: getFirstMessage(), time: formatTime() }]
}

export function useWhatsAppDemo(): WhatsAppDemoState {
  const [messages, setMessages] = useState<DemoMessage[]>(makeInitialMessages)
  const [step, setStep] = useState<QuestionStep>('budget')
  const [answers, setAnswers] = useState<AnswerRecord>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const sendMessage = useCallback(
    (input: string) => {
      if (!input.trim() || isTyping || isDone) return

      const leadMsg: DemoMessage = {
        id: `lead-${Date.now()}`,
        sender: 'lead',
        text: input.trim(),
        time: formatTime(),
      }

      setMessages(prev => [...prev, leadMsg])
      setIsTyping(true)

      const result = processAnswer(step, input)

      // Timer is not cancelled on unmount — intentional for this demo page.
      // The 1500ms delay is short and the page is not re-entered during that window.
      // In production, store the timer ID in a useRef and clear it in a useEffect cleanup.
      setTimeout(() => {
        if (result.botText) {
          const botMsg: DemoMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: result.botText,
            time: formatTime(),
          }
          setMessages(prev => [...prev, botMsg])
        }

        setAnswers(prev => ({
          ...prev,
          [step]: { label: result.answerLabel, points: result.points },
        }))

        setIsTyping(false)
        setStep(result.nextStep)
        if (result.nextStep === 'done') setIsDone(true)
      }, 1500)
    },
    [step, isTyping, isDone],
  )

  const restart = useCallback(() => {
    setMessages(makeInitialMessages())
    setStep('budget')
    setAnswers({})
    setIsTyping(false)
    setIsDone(false)
  }, [])

  const score = calculateScore(answers)
  const band = getScoreBand(score)

  return { messages, step, isTyping, isDone, score, band, answers, sendMessage, restart }
}
