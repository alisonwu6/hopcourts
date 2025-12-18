const { createClient } = require('@supabase/supabase-js')
const { env } = require('../config/env')

const supabaseAdmin =
  env.supabase.url && env.supabase.serviceRoleKey
    ? createClient(env.supabase.url, env.supabase.serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null

module.exports = { supabaseAdmin }
