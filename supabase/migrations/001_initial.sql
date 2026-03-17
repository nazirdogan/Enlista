-- Agencies (one per user at MVP)
create table agencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  rera_license text,
  phone text,
  email text,
  logo_url text,
  default_tone text default 'professional', -- professional | luxury | investment
  default_disclaimer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table agencies enable row level security;
create policy "Users own their agency" on agencies for all using (auth.uid() = user_id);

-- Listings
create table listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade,
  -- Property details
  property_type text not null, -- villa | apartment | townhouse | penthouse | office | retail
  listing_type text not null default 'sale', -- sale | rent
  bedrooms integer,
  bathrooms integer,
  parking integer,
  floor_number integer,
  total_floors integer,
  size_sqft numeric,
  price_aed numeric not null,
  community text,
  building_name text,
  developer text,
  handover_date text,
  features text[], -- array of feature tags
  tone text default 'professional',
  additional_notes text,
  -- Generated content
  en_listing text,
  ar_listing text,
  compact_listing text,
  highlight_bullets text,
  headline_title text,
  whatsapp_text text,
  instagram_caption text,
  short_teaser text,
  -- Status
  status text default 'draft', -- draft | published | scheduled
  portals_published text[], -- array of portal names published to
  -- Meta
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table listings enable row level security;
create policy "Users own their listings" on listings for all using (auth.uid() = user_id);

-- Portal connections
create table portal_connections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  portal_name text not null, -- bayut | property_finder | dubizzle
  api_key text,
  api_secret text,
  status text default 'disconnected', -- connected | disconnected
  listings_count integer default 0,
  last_sync timestamptz,
  created_at timestamptz default now()
);
alter table portal_connections enable row level security;
create policy "Agency members own connections" on portal_connections for all using (
  agency_id in (select id from agencies where user_id = auth.uid())
);
