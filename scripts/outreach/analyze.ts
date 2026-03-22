import { createClient } from '@supabase/supabase-js'
import { runAnalysis } from '../../lib/outreach/analysis'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

runAnalysis(supabase).catch(err => {
  console.error(err)
  process.exit(1)
})
