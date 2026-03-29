import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(
  'mailto:noreply@diariosam.vercel.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

Deno.serve(async () => {
  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, subscription')

    if (error) throw error

    const payload = JSON.stringify({
      title: 'Diario 📔',
      body:  "Com'è andata oggi? Riorganizza i tuoi pensieri.",
    })

    const results = await Promise.allSettled(
      (subs ?? []).map(row =>
        webpush.sendNotification(row.subscription as webpush.PushSubscription, payload)
          .catch(async (err) => {
            // Subscription scaduta o non valida → rimuovila
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', row.id)
            }
            throw err
          })
      )
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
