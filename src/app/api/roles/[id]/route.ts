import { NextResponse } from 'next/server'
import { nestPut } from '@/lib/server-api'

/**
 * PUT /api/roles/[id]
 * Proxy update to upstream and forward status/message
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await req.json();

    console.log(`[PUT /api/roles/${params.id}] Proxying to upstream with body:`, body);

    // Basic validation (keep quick client-side guards)
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ success: false, message: 'Role name is required' }, { status: 400 });
    }

    // Call upstream API
    const r = await nestPut<any>(`/roles/${encodeURIComponent(params.id)}`, body);

    // If upstream returned failure, forward status/message
    if (!r.success) {
      console.warn(`[PUT /api/roles/${params.id}] Upstream returned error:`, r.message, r.status);
      return NextResponse.json({ success: false, message: r.message || 'Upstream error' }, { status: r.status ?? 400 });
    }

    // Success — return upstream data
    return NextResponse.json({ success: true, data: r.data, message: 'Role updated successfully' }, { status: 200 });
  } catch (err: any) {
    console.error(`[PUT /api/roles/${params.id}] Error proxying to upstream:`, err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}