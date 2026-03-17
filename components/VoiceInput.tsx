'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type VoiceState = 'idle' | 'recording' | 'processing' | 'done'

export interface ParsedFields {
  property_type?: string | null
  listing_type?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking?: number | null
  floor_number?: string | null
  size_sqft?: string | null
  price_aed?: string | null
  community?: string | null
  building_name?: string | null
  developer?: string | null
  handover_date?: string | null
  features?: string[] | null
  tone?: string | null
  additional_notes?: string | null
}

interface VoiceInputProps {
  onParsed: (fields: ParsedFields) => void
}

export default function VoiceInput({ onParsed }: VoiceInputProps) {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const isSupported =
    typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Pick a mime type the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const formData = new FormData()
        formData.append('audio', blob, `recording.${ext}`)

        setState('processing')

        try {
          const res = await fetch('/api/parse-voice', { method: 'POST', body: formData })
          const data = await res.json()

          if (!res.ok || !data.parsed) {
            toast.error(data.error || 'Could not parse your description. Please try again.')
            setState('idle')
            return
          }

          if (data.transcript) setTranscript(data.transcript)

          const fields: ParsedFields = {
            ...data.parsed,
            price_aed: data.parsed.price_aed ? String(data.parsed.price_aed) : null,
            floor_number: data.parsed.floor_number ? String(data.parsed.floor_number) : null,
            size_sqft: data.parsed.size_sqft ? String(data.parsed.size_sqft) : null,
          }

          onParsed(fields)
          setState('done')
          toast.success('Form filled from your description.')
          setTimeout(() => { setState('idle'); setTranscript('') }, 3000)
        } catch {
          toast.error('Network error. Please try again.')
          setState('idle')
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setState('recording')
      setTranscript('')
    } catch {
      toast.error('Microphone access denied. Please allow mic access and try again.')
    }
  }, [onParsed])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  if (!isSupported) return null

  return (
    <div style={{
      marginBottom: 36, border: '1.5px solid #DDE3EC', borderRadius: 10,
      background: '#FFFFFF', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#0F1829', marginBottom: 4 }}>
            Describe the property out loud
          </p>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            Say something like:{' '}
            <span style={{ color: '#1E293B' }}>
              &ldquo;3 bedroom apartment in Dubai Marina, 1,450 sqft, sea view, fully furnished,
              selling for 2.5 million&rdquo;
            </span>
          </p>

          {transcript && (
            <div style={{
              marginTop: 12, fontSize: 13, color: '#1E293B',
              background: '#F8FAFC', border: '1px solid #DDE3EC',
              borderRadius: 6, padding: 12, lineHeight: 1.6,
            }}>
              {transcript}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {state === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              style={{
                width: 52, height: 52, borderRadius: '50%', background: '#1D4ED8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
              }}
              title="Start recording"
            >
              <Mic style={{ width: 20, height: 20, color: 'white' }} />
            </button>
          )}

          {state === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                width: 52, height: 52, borderRadius: '50%', background: '#EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer', position: 'relative',
              }}
              title="Stop recording"
            >
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#FCA5A5', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
                opacity: 0.4,
              }} />
              <MicOff style={{ width: 20, height: 20, color: 'white', position: 'relative', zIndex: 1 }} />
            </button>
          )}

          {state === 'processing' && (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#1D4ED8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 style={{ width: 20, height: 20, color: 'white', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {state === 'done' && (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle style={{ width: 20, height: 20, color: 'white' }} />
            </div>
          )}

          <p style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
            {state === 'idle' && 'Tap to speak'}
            {state === 'recording' && 'Tap to stop'}
            {state === 'processing' && 'Transcribing...'}
            {state === 'done' && 'Done!'}
          </p>
        </div>
      </div>
    </div>
  )
}
