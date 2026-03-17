export interface Agency {
  id: string
  user_id: string
  name: string
  rera_license?: string
  phone?: string
  email?: string
  logo_url?: string
  default_tone: string
  default_disclaimer?: string
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  agency_id?: string
  property_type: string
  listing_type: string
  bedrooms?: number
  bathrooms?: number
  parking?: number
  floor_number?: number
  total_floors?: number
  size_sqft?: number
  price_aed: number
  community?: string
  building_name?: string
  developer?: string
  handover_date?: string
  features?: string[]
  tone?: string
  additional_notes?: string
  en_listing?: string
  ar_listing?: string
  compact_listing?: string
  highlight_bullets?: string
  headline_title?: string
  whatsapp_text?: string
  instagram_caption?: string
  short_teaser?: string
  status: string
  created_at: string
  updated_at: string
}
