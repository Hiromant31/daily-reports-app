import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const {data:  { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const { data, error } = await supabase
    .from('property_owners')
    .select('owners(*)')
    .eq('property_id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data.map(d => d.owners))
}