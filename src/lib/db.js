import { supabase } from './supabase';

export async function fetchEntries() {
  const { data, error } = await supabase
    .from('drip_qc_entries')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveEntry(entry) {
  const { data, error } = await supabase.from('drip_qc_entries').insert(entry).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEntry(id) {
  const { error } = await supabase.from('drip_qc_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
