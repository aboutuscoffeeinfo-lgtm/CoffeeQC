import { supabase } from './supabase';

export async function fetchReports() {
  const { data, error } = await supabase
    .from('qc_reports')
    .select('*, qc_slots(*), qc_comments(*)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    qc_slots: r.qc_slots.slice().sort((a, b) => a.slot_index - b.slot_index),
    qc_comments: r.qc_comments.slice().sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')),
  }));
}

export async function saveReport({ report, slots, comments }) {
  const { data: savedReport, error: reportError } = await supabase
    .from('qc_reports')
    .insert(report)
    .select()
    .single();
  if (reportError) throw new Error(reportError.message);

  const slotRows = slots.map((s, i) => ({ ...s, report_id: savedReport.id, slot_index: i + 1 }));
  const { data: savedSlots, error: slotsError } = await supabase.from('qc_slots').insert(slotRows).select();
  if (slotsError) throw new Error(slotsError.message);

  let savedComments = [];
  if (comments.length > 0) {
    const commentRows = comments.map((c) => ({ ...c, report_id: savedReport.id }));
    const { data, error: commentsError } = await supabase.from('qc_comments').insert(commentRows).select();
    if (commentsError) throw new Error(commentsError.message);
    savedComments = data;
  }

  return { ...savedReport, qc_slots: savedSlots, qc_comments: savedComments };
}

export async function addComment(reportId, comment) {
  const { data, error } = await supabase
    .from('qc_comments')
    .insert({ ...comment, report_id: reportId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReport(id) {
  const { error } = await supabase.from('qc_reports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
