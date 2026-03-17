'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Minus, Plus } from 'lucide-react'
import VoiceInput, { type ParsedFields } from '@/components/VoiceInput'
import { SectionLabel } from '@/components/ui'

const PROPERTY_TYPES = ['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Office', 'Retail', 'Warehouse']

const COMMUNITIES = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JVC', 'JBR', 'DIFC',
  'Business Bay', 'Arabian Ranches', 'Meydan', 'Jumeirah', 'Al Barsha',
  'Dubai Hills', 'Creek Harbour', 'Emaar Beachfront', 'MBR City', 'Dubai South',
  'Damac Hills', 'Town Square', 'Sobha Hartland', 'Al Furjan', 'Silicon Oasis',
  'International City', 'Sports City', 'Motor City', 'Jumeirah Lake Towers',
]

const FEATURES = [
  'Burj View', 'Sea View', 'City View', 'Golf View', 'Pool View', 'Marina View',
  'Private Pool', 'Shared Pool', 'Private Garden', 'Balcony', 'Terrace',
  'Gym', 'Spa', 'Concierge', 'Security', 'Smart Home',
  'Fully Furnished', 'Semi-Furnished', 'Unfurnished',
  "Maid's Room", 'Study Room', 'Storage',
  'Near Metro', 'Near Mall', 'Near Beach', 'Near School',
  'Freehold', 'PHPP Available', 'Post-Handover Payment',
]

const TONES = [
  { value: 'professional', label: 'Agency Pro', desc: 'Structured, data-forward broker copy — Betterhomes / Allsopp style' },
  { value: 'luxury', label: 'Luxury Editorial', desc: 'Lifestyle-led, aspirational narrative — Engel & Völkers / Hamptons style' },
  { value: 'investment', label: 'Investor Brief', desc: 'ROI-first, metrics-driven, yield-focused copy' },
]

interface FormData {
  property_type: string
  listing_type: string
  bedrooms: number
  bathrooms: number
  parking: number
  floor_number: string
  size_sqft: string
  price_aed: string
  community: string
  building_name: string
  developer: string
  handover_date: string
  features: string[]
  tone: string
  additional_notes: string
}

const inputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 6,
  border: '1.5px solid #DDE3EC', outline: 'none',
  fontSize: 14, color: '#1E293B', background: '#FFFFFF',
  boxSizing: 'border-box' as const, fontFamily: 'inherit',
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: 32, height: 32, border: '1.5px solid #DDE3EC', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: 'white', fontFamily: 'inherit',
          }}
        >
          <Minus style={{ width: 12, height: 12 }} />
        </button>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#0F1829', minWidth: 28, textAlign: 'center', fontFamily: '"JetBrains Mono", monospace' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: 32, height: 32, border: '1.5px solid #DDE3EC', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: 'white', fontFamily: 'inherit',
          }}
        >
          <Plus style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  )
}

type FormErrors = Partial<Record<'property_type' | 'price_aed' | 'community' | 'size_sqft', string>>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, color: '#EF4444' }}>
      <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
      {message}
    </p>
  )
}

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<FormData>({
    property_type: '',
    listing_type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    floor_number: '',
    size_sqft: '',
    price_aed: '',
    community: '',
    building_name: '',
    developer: '',
    handover_date: '',
    features: [],
    tone: 'professional',
    additional_notes: '',
  })
  const [priceDisplay, setPriceDisplay] = useState('')

  const toggleFeature = (feature: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setForm((prev) => ({ ...prev, price_aed: raw }))
    setPriceDisplay(raw ? `AED ${Number(raw).toLocaleString()}` : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}
    if (!form.property_type) newErrors.property_type = 'Please select a property type'
    if (!form.price_aed) newErrors.price_aed = 'Price is required'
    if (!form.community) newErrors.community = 'Please select a community'
    if (!form.size_sqft) newErrors.size_sqft = 'Size is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields')
      const firstErrorId = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setErrors({})
    setLoading(true)
    try {
      const payload = {
        ...form,
        bedrooms: form.bedrooms || undefined,
        bathrooms: form.bathrooms || undefined,
        parking: form.parking || undefined,
        floor_number: form.floor_number ? Number(form.floor_number) : undefined,
        size_sqft: form.size_sqft ? Number(form.size_sqft) : undefined,
        price_aed: Number(form.price_aed),
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Generation failed. Please try again.')
        return
      }

      sessionStorage.setItem('preview_listing', JSON.stringify(data.listing))
      toast.success('Listing generated successfully!')
      router.push(`/listings/preview`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sqm = form.size_sqft ? Math.round(Number(form.size_sqft) * 0.0929) : null

  const handleVoiceParsed = (fields: ParsedFields) => {
    const update: Partial<FormData> = {}
    if (fields.property_type) update.property_type = String(fields.property_type)
    if (fields.listing_type) update.listing_type = String(fields.listing_type)
    if (fields.bedrooms != null) update.bedrooms = Number(fields.bedrooms)
    if (fields.bathrooms != null) update.bathrooms = Number(fields.bathrooms)
    if (fields.parking != null) update.parking = Number(fields.parking)
    if (fields.floor_number) update.floor_number = String(fields.floor_number)
    if (fields.size_sqft) update.size_sqft = String(fields.size_sqft)
    if (fields.community) update.community = String(fields.community)
    if (fields.building_name) update.building_name = String(fields.building_name)
    if (fields.developer) update.developer = String(fields.developer)
    if (fields.handover_date) update.handover_date = String(fields.handover_date)
    if (Array.isArray(fields.features) && fields.features.length) update.features = fields.features as string[]
    if (fields.tone) update.tone = String(fields.tone)
    if (fields.additional_notes) update.additional_notes = String(fields.additional_notes)
    if (fields.price_aed) {
      update.price_aed = String(fields.price_aed)
      setPriceDisplay(`AED ${Number(fields.price_aed).toLocaleString()}`)
    }
    setForm((prev) => ({ ...prev, ...update }))
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontWeight: 800, fontSize: 28, color: '#0F1829', margin: 0 }}>New Listing</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>
          Fill in the property details and we&apos;ll generate bilingual copy in seconds.
        </p>
      </div>

      <VoiceInput onParsed={handleVoiceParsed} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {/* Section 01: Property Type */}
        <section id="field-property_type">
          <SectionLabel>01 — Property Type</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setForm((p) => ({ ...p, property_type: type.toLowerCase() }))
                  setErrors((prev) => ({ ...prev, property_type: undefined }))
                }}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: form.property_type === type.toLowerCase()
                    ? '1.5px solid #1D4ED8'
                    : errors.property_type ? '1.5px solid #FCA5A5' : '1.5px solid #DDE3EC',
                  background: form.property_type === type.toLowerCase() ? '#1D4ED8' : 'white',
                  color: form.property_type === type.toLowerCase() ? 'white' : '#64748B',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <FieldError message={errors.property_type} />
          <div style={{ marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'sale', label: 'For Sale' },
              { value: 'rent', label: 'For Rent' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, listing_type: opt.value }))}
                style={{
                  padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: form.listing_type === opt.value ? '1.5px solid #0F1829' : '1.5px solid #DDE3EC',
                  background: form.listing_type === opt.value ? '#0F1829' : 'white',
                  color: form.listing_type === opt.value ? 'white' : '#64748B',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Section 02: Property Details */}
        <section>
          <SectionLabel>02 — Property Details</SectionLabel>
          <div style={{ display: 'grid', gap: 28, marginBottom: 28 }} className="grid-cols-1 sm:grid-cols-3">
            <Stepper label="Bedrooms" value={form.bedrooms} onChange={(v) => setForm((p) => ({ ...p, bedrooms: v }))} min={0} max={10} />
            <Stepper label="Bathrooms" value={form.bathrooms} onChange={(v) => setForm((p) => ({ ...p, bathrooms: v }))} min={1} max={10} />
            <Stepper label="Parking" value={form.parking} onChange={(v) => setForm((p) => ({ ...p, parking: v }))} min={0} max={5} />
          </div>
          <div style={{ display: 'grid', gap: 20, marginBottom: 20 }} className="grid-cols-1 sm:grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Floor Number</label>
              <input
                type="number"
                value={form.floor_number}
                onChange={(e) => setForm((p) => ({ ...p, floor_number: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. 12"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
            <div id="field-size_sqft">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Size (sqft){errors.size_sqft && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
              </label>
              <input
                type="number"
                value={form.size_sqft}
                onChange={(e) => {
                  setForm((p) => ({ ...p, size_sqft: e.target.value }))
                  if (e.target.value) setErrors((prev) => ({ ...prev, size_sqft: undefined }))
                }}
                style={{ ...inputStyle, borderColor: errors.size_sqft ? '#FCA5A5' : '#DDE3EC' }}
                placeholder="e.g. 1450"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = errors.size_sqft ? '#FCA5A5' : '#DDE3EC' }}
              />
              {sqm ? (
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{sqm} sqm</p>
              ) : (
                <FieldError message={errors.size_sqft} />
              )}
            </div>
          </div>
          <div id="field-price_aed">
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Price (AED)</label>
            <input
              type="text"
              value={priceDisplay}
              onChange={(e) => {
                handlePriceChange(e)
                setErrors((prev) => ({ ...prev, price_aed: undefined }))
              }}
              style={{ ...inputStyle, fontSize: 24, fontWeight: 700, color: '#0F1829', borderColor: errors.price_aed ? '#FCA5A5' : '#DDE3EC' }}
              placeholder="AED 0"
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = errors.price_aed ? '#FCA5A5' : '#DDE3EC' }}
            />
            <FieldError message={errors.price_aed} />
          </div>
        </section>

        {/* Section 03: Location */}
        <section>
          <SectionLabel>03 — Location</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div id="field-community">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Community</label>
              <select
                value={form.community}
                onChange={(e) => {
                  setForm((p) => ({ ...p, community: e.target.value }))
                  if (e.target.value) setErrors((prev) => ({ ...prev, community: undefined }))
                }}
                style={{ ...inputStyle, borderColor: errors.community ? '#FCA5A5' : '#DDE3EC', cursor: 'pointer' }}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = errors.community ? '#FCA5A5' : '#DDE3EC' }}
              >
                <option value="">Select community...</option>
                {COMMUNITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <FieldError message={errors.community} />
            </div>
            <div style={{ display: 'grid', gap: 16 }} className="grid-cols-1 sm:grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Building / Tower Name</label>
                <input
                  type="text"
                  value={form.building_name}
                  onChange={(e) => setForm((p) => ({ ...p, building_name: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. Marina Gate 1"
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Developer (optional)</label>
                <input
                  type="text"
                  value={form.developer}
                  onChange={(e) => setForm((p) => ({ ...p, developer: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. Emaar"
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Handover Date (off-plan)</label>
              <input
                type="text"
                value={form.handover_date}
                onChange={(e) => setForm((p) => ({ ...p, handover_date: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. Q4 2026"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
          </div>
        </section>

        {/* Section 04: Key Features */}
        <section>
          <SectionLabel>04 — Key Features</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FEATURES.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: form.features.includes(feature) ? '1.5px solid #1D4ED8' : '1.5px solid #DDE3EC',
                  background: form.features.includes(feature) ? '#EFF6FF' : 'white',
                  color: form.features.includes(feature) ? '#1D4ED8' : '#64748B',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {feature}
              </button>
            ))}
          </div>
          {form.features.length > 0 && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>{form.features.length} feature{form.features.length !== 1 ? 's' : ''} selected</p>
          )}
        </section>

        {/* Section 05: Listing Style */}
        <section>
          <SectionLabel>05 — Listing Style</SectionLabel>
          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }} className="grid-cols-1 sm:grid-cols-3">
            {TONES.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tone: tone.value }))}
                style={{
                  padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  border: form.tone === tone.value ? '1.5px solid #1D4ED8' : '1.5px solid #DDE3EC',
                  background: form.tone === tone.value ? '#EFF6FF' : 'white',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: form.tone === tone.value ? '#1D4ED8' : '#1E293B', margin: 0, marginBottom: 4 }}>
                  {tone.label}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{tone.desc}</p>
              </button>
            ))}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Additional Notes (optional)</label>
            <textarea
              value={form.additional_notes}
              onChange={(e) => setForm((p) => ({ ...p, additional_notes: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              placeholder="Any extra context for the AI (e.g. 'tenant in place', 'motivated seller', 'recently renovated')..."
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
            />
          </div>
        </section>

        {/* Generate Button */}
        <div style={{ paddingBottom: 32 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#1D4ED8', color: 'white',
              padding: '16px', borderRadius: 8, border: 'none',
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                Crafting your listing in English and Arabic...
              </>
            ) : (
              'Generate Listing →'
            )}
          </button>
          {loading && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ height: 10, background: '#DDE3EC', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 10, background: '#DDE3EC', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', width: '80%' }} />
              <div style={{ height: 10, background: '#DDE3EC', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', width: '60%' }} />
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
