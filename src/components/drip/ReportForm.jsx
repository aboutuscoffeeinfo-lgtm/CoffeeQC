import { useState } from 'react';
import { STORES, MIN_SLOTS } from '../../lib/constants';
import QCSlot, { emptySlot } from './QCSlot';
import CommentsSection from './CommentsSection';

function emptyDraft() {
  const iso = new Date().toISOString().slice(0, 10);
  return {
    store: STORES[0], date: iso, country: '', lot_name: '', variety: '', process: '',
    roast_date: '', checker: '', tendency: '',
    slots: [emptySlot()],
    comments: [],
  };
}

export default function ReportForm({ onSave, showToast }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setSlot = (i, slot) => setDraft((d) => {
    const slots = d.slots.slice();
    slots[i] = slot;
    return { ...d, slots };
  });
  const addSlot = () => setDraft((d) => ({ ...d, slots: [...d.slots, emptySlot()] }));
  const removeSlot = (i) => setDraft((d) => ({ ...d, slots: d.slots.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        report: {
          store: draft.store,
          date: draft.date,
          country: draft.country,
          lot_name: draft.lot_name,
          variety: draft.variety,
          process: draft.process,
          roast_date: draft.roast_date || null,
          checker: draft.checker,
          tendency: draft.tendency,
        },
        slots: draft.slots,
        comments: draft.comments.filter((c) => c.comment || c.date || c.roast_date),
      });
      showToast('記録を保存しました。');
      setDraft(emptyDraft());
    } catch (e) {
      showToast('保存に失敗しました。もう一度お試しください。', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="qcd-section-title">報告書ヘッダー</p>
      <div className="qcd-extra-box">
        <div className="qcd-grid4">
          <div className="qcd-field">
            <label>店舗</label>
            <select value={draft.store} onChange={(e) => setField('store', e.target.value)}>
              {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="qcd-field">
            <label>日付</label>
            <input type="date" value={draft.date} onChange={(e) => setField('date', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>国</label>
            <input type="text" placeholder="例）Ethiopia" value={draft.country} onChange={(e) => setField('country', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>ロット名</label>
            <input type="text" placeholder="例）Yirgacheffe" value={draft.lot_name} onChange={(e) => setField('lot_name', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>品種</label>
            <input type="text" placeholder="例）Heirloom" value={draft.variety} onChange={(e) => setField('variety', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>プロセス</label>
            <input type="text" placeholder="例）Washed" value={draft.process} onChange={(e) => setField('process', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>焙煎日</label>
            <input type="date" value={draft.roast_date} onChange={(e) => setField('roast_date', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>確認</label>
            <input type="text" placeholder="確認者名" value={draft.checker} onChange={(e) => setField('checker', e.target.value)} />
          </div>
        </div>
      </div>

      <p className="qcd-section-title">抽出欄</p>
      <div className="qcd-slots-grid">
        {draft.slots.map((slot, i) => (
          <QCSlot
            key={i}
            slot={slot}
            index={i}
            onChange={(s) => setSlot(i, s)}
            onRemove={() => removeSlot(i)}
            removable={draft.slots.length > MIN_SLOTS}
          />
        ))}
      </div>
      <button type="button" className="qcd-add-slot" onClick={addSlot}>+ 抽出欄を追加</button>

      <p className="qcd-section-title">傾向</p>
      <div className="qcd-memo-field">
        <textarea rows={3} placeholder="全体を通しての傾向・所感" value={draft.tendency} onChange={(e) => setField('tendency', e.target.value)} />
      </div>

      <p className="qcd-section-title">コメント</p>
      <CommentsSection comments={draft.comments} onChange={(comments) => setField('comments', comments)} />

      <button type="button" className="qcd-save-btn" disabled={saving} onClick={handleSave}>
        {saving ? '保存中…' : '記録を保存'}
      </button>
      <p className="qcd-note">保存したデータは伏見・二条の全スタッフと共有されます</p>
    </>
  );
}
