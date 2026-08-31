import { supabase } from './supabase';
import { NOTIFY_STAFF_KEY } from './constants';

function normalizeComment(c) {
  return { ...c, date: c.date || null, roast_date: c.roast_date || null };
}

async function notifyComment(report, comment) {
  if (!comment.comment) return;
  const message = `[${report.store}] ${report.date} のQC報告書にコメントが追加されました：${comment.comment}`;
  const { error } = await supabase.from('notifications').insert({
    staff_key: NOTIFY_STAFF_KEY,
    type: 'qc_comment',
    message,
    read: false,
  });
  if (error) console.error('notification insert failed:', error.message);
}

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

export async function upsertReport({ id, report, slots, comments }) {
  let savedReport;
  if (id) {
    const { data, error } = await supabase.from('qc_reports').update(report).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    savedReport = data;

    const { error: delError } = await supabase.from('qc_slots').delete().eq('report_id', id);
    if (delError) throw new Error(delError.message);
  } else {
    const { data, error } = await supabase.from('qc_reports').insert(report).select().single();
    if (error) throw new Error(error.message);
    savedReport = data;
  }

  const slotRows = slots.map((s, i) => ({ ...s, report_id: savedReport.id, slot_index: i + 1 }));
  const { data: savedSlots, error: slotsError } = await supabase.from('qc_slots').insert(slotRows).select();
  if (slotsError) throw new Error(slotsError.message);

  const existingComments = comments.filter((c) => c.id);
  const newComments = comments.filter((c) => !c.id && (c.comment || c.date || c.roast_date));

  let insertedComments = [];
  if (newComments.length > 0) {
    const commentRows = newComments.map((c) => ({ ...normalizeComment(c), report_id: savedReport.id }));
    const { data, error: commentsError } = await supabase.from('qc_comments').insert(commentRows).select();
    if (commentsError) throw new Error(commentsError.message);
    insertedComments = data;
    for (const c of insertedComments) await notifyComment(savedReport, c);
  }

  return { ...savedReport, qc_slots: savedSlots, qc_comments: [...existingComments, ...insertedComments] };
}

export async function toggleReleased(id, isReleased) {
  const { data, error } = await supabase.from('qc_reports').update({ is_released: isReleased }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addComment(report, comment) {
  const { data, error } = await supabase
    .from('qc_comments')
    .insert({ ...normalizeComment(comment), report_id: report.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await notifyComment(report, data);
  return data;
}

export async function deleteReport(id) {
  const { error } = await supabase.from('qc_reports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
