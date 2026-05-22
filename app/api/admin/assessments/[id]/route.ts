import { NextRequest, NextResponse } from 'next/server';
import { deleteAssessment, getAssessments } from '@/lib/data';

// DELETE /api/admin/assessments/[id] — reset a participant's assessment
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const all = await getAssessments();
    if (!all.find(a => a.id === id)) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }
    await deleteAssessment(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE assessment]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
