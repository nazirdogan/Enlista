'use client'

import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { DemoMessage } from '@/lib/demo/whatsapp-conversation'

interface WhatsAppPhoneProps {
  messages: DemoMessage[]
  isTyping: boolean
  onSend: (text: string) => void
  disabled?: boolean
}

const wa = '#25D366'
const waDark = '#128C7E'

function WaIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#999',
            animation: 'wa-bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

function Bubble({ msg }: { msg: DemoMessage }) {
  const isBot = msg.sender === 'bot'
  // Render *bold* markdown as <strong>
  const parts = msg.text.split(/(\*[^*]+\*)/)
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 6 }}>
      <div style={{
        maxWidth: '88%',
        background: isBot ? '#fff' : '#DCF8C6',
        borderRadius: isBot ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
        padding: '7px 10px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
          {parts.map((p, i) =>
            p.startsWith('*') && p.endsWith('*')
              ? <strong key={i}>{p.slice(1, -1)}</strong>
              : p
          )}
        </div>
        <div style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 2 }}>
          {msg.time} ✓✓
        </div>
      </div>
    </div>
  )
}

export function WhatsAppPhone({ messages, isTyping, onSend, disabled }: WhatsAppPhoneProps) {
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input)
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div style={{
      width: 300,
      background: '#1a1a2e',
      borderRadius: 32,
      padding: '12px 12px 16px',
      boxShadow: '0 32px 72px rgba(0,0,0,0.35)',
      border: '3px solid #2a2a3e',
    }}>
      {/* Keyframe defined once at component root, not inside TypingDots */}
      <style>{`
        @keyframes wa-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
      {/* Notch */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ width: 70, height: 5, borderRadius: 3, background: '#2a2a3e' }} />
      </div>

      {/* WA Header */}
      <div style={{
        background: waDark,
        borderRadius: '14px 14px 0 0',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: wa,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <WaIcon size={18} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Enlista Bot</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
            {isTyping ? '● typing...' : '● online'}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        style={{
          background: '#ECE5DD',
          padding: '10px 8px',
          height: 320,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          scrollBehavior: 'smooth',
        }}
      >
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 6 }}>
            <div style={{
              background: '#fff',
              borderRadius: '2px 10px 10px 10px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        background: '#f0f0f0',
        borderRadius: '0 0 14px 14px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled || isTyping}
          placeholder={disabled ? 'Conversation ended' : 'Type a message...'}
          style={{
            flex: 1,
            background: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '7px 14px',
            fontSize: 12,
            color: '#1a1a1a',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isTyping}
          aria-label="Send message"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: !input.trim() || disabled || isTyping ? '#ccc' : wa,
            border: 'none',
            cursor: !input.trim() || disabled || isTyping ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
