import { createAdminClient } from '@/lib/supabase/admin'

interface MetaAdsSpend {
  templateCost: number
  campaignSpend: number
  total: number
  month: string
}

export async function getMetaAdsSpend(month: string): Promise<MetaAdsSpend> {
  const db = createAdminClient()
  const cacheKey = `meta_ads_spend_${month}`

  const { data: cached } = await db
    .from('admin_cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .maybeSingle()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return JSON.parse(cached.value) as MetaAdsSpend
  }

  const accountId = process.env.META_ADS_ACCOUNT_ID
  const token = process.env.META_ADS_ACCESS_TOKEN

  let campaignSpend = 0

  if (accountId && token) {
    try {
      const [year, mon] = month.split('-')
      const since = `${year}-${mon}-01`
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate()
      const until = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/insights?fields=spend&time_range=${encodeURIComponent(JSON.stringify({ since, until }))}&access_token=${token}`
      )
      const json = await res.json() as { data?: Array<{ spend?: string }> }
      campaignSpend = parseFloat(json?.data?.[0]?.spend ?? '0') * 3.67
    } catch (e) {
      console.error('Meta Ads API error:', e)
    }
  }

  const db2 = createAdminClient()
  const { count: sendCount } = await db2
    .from('outreach_sends')
    .select('*', { count: 'exact', head: true })

  const templateCost = Math.round((sendCount ?? 0) * 0.25)
  const result: MetaAdsSpend = {
    templateCost,
    campaignSpend: Math.round(campaignSpend),
    total: templateCost + Math.round(campaignSpend),
    month,
  }

  await db.from('admin_cache').upsert({
    key: cacheKey,
    value: JSON.stringify(result),
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  })

  return result
}
