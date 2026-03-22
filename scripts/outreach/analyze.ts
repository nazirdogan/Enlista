import { createClient } from '@supabase/supabase-js'
import { runAnalysis } from '../../lib/outreach/analysis'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('No sends yet.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseKey)

runAnalysis(supabase).catch(err => {
  console.error(err)
  process.exit(1)
})
