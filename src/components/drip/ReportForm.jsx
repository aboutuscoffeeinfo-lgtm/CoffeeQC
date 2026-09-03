import { useState } from 'react';
import { STORES, MIN_SLOTS } from '../../lib/constants';
import QCSlot, { emptySlot } from './QCSlot';
import CommentsSection from './CommentsSection';
import DateField from './DateField';
import Toggle from './Toggle';

function emptyDraft() {
  const iso = new Date().toISOString().slice(0, 10);
  return {
    id: null, store: STORES[0], date: iso, country: '', lot_name: '', variety: '', process: '',
    roast_date: '', checker: '', tendency: '', is_released: false,
    slots: [emptySlot()],
    comments: [],
  };
}

export function fromReport(r) {
  return {
    id: r.id, store: r.store, date: r.date, country: r.country, lot_name: r.lot_name,
    variety: r.variety, process: r.process, roast_date: r.roast_date || '', checker: r.checker,
    tendency: r.tendency, is_released: r.is_released,
    slots: r.qc_slots.length > 0
      ? r.qc_slots.map((s) => ({ dose_g: s.dose_g, mesh: s.mesh, pours: s.pours, sensory: s.sensory, remarks: s.remarks }))
      : [emptySlot()],
    comments: r.qc_comments.map((c) => ({ id: c.id, date: c.date || '', roast_date: c.roast_date || '', comment: c.comment })),
  };
}

function fmtDate(iso) {
  if (!iso) return '（日付未入力）';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export default function ReportForm({ drafts = [], initialReport, mode = 'new', onSave, showToast, onDone }) {
  const [draft, setDraft] = useState(() => (initialReport ? fromReport(initialReport) : emptyDraft()));
  const [saving, setSaving] = useState(null); // 'draft' | 'saved' | null

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setSlot = (i, slot) => setDraft((d) => {
    const slots = d.slots.slice();
    slots[i] = slot;
    return { ...d, slots };
  });
  const addSlot = () => setDraft((d) => ({ ...d, slots: [...d.slots, emptySlot()] }));
  const removeSlot = (i) => setDraft((d) => ({ ...d, slots: d.slots.filter((_, idx) => idx !== i) }));

  const handleSave = async (status) => {
    setSaving(status);
    try {
      await onSave({
        id: draft.id,
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
          is_released: draft.is_released,
          status,
        },
        slots: draft.slots,
        comments: draft.comments,
      });
      showToast(status === 'draft' ? '下書きを保存しました。' : mode === 'edit' ? '更新しました。' : '記録を保存しました。');
      if (mode === 'edit') {
        onDone?.();
      } else if (status === 'saved') {
        setDraft(emptyDraft());
      }
    } catch (e) {
      showToast('保存に失敗しました。もう一度お試しください。', true);
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      {mode === 'new' && drafts.length > 0 && (
        <div className="qcd-drafts-card">
          <p className="qcd-drafts-title">下書き</p>
          <p className="qcd-drafts-desc">途中まで入力した報告書です。続きから編集できます。</p>
          {drafts.map((d) => (
            <button type="button" className="qcd-draft-row" key={d.id} onClick={() => setDraft(fromReport(d))}>
              <span className="qcd-draft-date">{fmtDate(d.date)}</span>
              <span>{d.country}/{d.variety}/{d.process}</span>
              <span className="qcd-draft-lot">{d.lot_name || '（ロット名未入力）'}</span>
            </button>
          ))}
        </div>
      )}

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
            <DateField value={draft.date} onChange={(v) => setField('date', v)} />
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
            <DateField value={draft.roast_date} onChange={(v) => setField('roast_date', v)} />
          </div>
          <div className="qcd-field">
            <label>確認</label>
            <input type="text" placeholder="確認者名" value={draft.checker} onChange={(e) => setField('checker', e.target.value)} />
          </div>
          <div className="qcd-field qcd-release-field">
            <label>リリース中</label>
            <Toggle on={draft.is_released} onChange={(v) => setField('is_released', v)} />
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

      <div className="qcd-save-row">
        {mode === 'edit' ? (
          <>
            {onDone && <button type="button" className="qcd-draft-btn" disabled={!!saving} onClick={onDone}>キャンセル</button>}
            <button type="button" className="qcd-save-btn" disabled={!!saving} onClick={() => handleSave('saved')}>
              {saving === 'saved' ? '保存中…' : '更新を保存'}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="qcd-draft-btn" disabled={!!saving} onClick={() => handleSave('draft')}>
              {saving === 'draft' ? '保存中…' : '一時保存'}
            </button>
            <button type="button" className="qcd-save-btn" disabled={!!saving} onClick={() => handleSave('saved')}>
              {saving === 'saved' ? '保存中…' : '保存する'}
            </button>
          </>
        )}
      </div>
      <p className="qcd-note">保存したデータは伏見・二条の全スタッフと共有されます</p>
    </>
  );
}
