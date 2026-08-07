import { useState } from 'react';
import { STORES, ATTRS, ATTR_LABEL, MARKS } from '../../lib/constants';

function emptyShot() {
  const s = { doseG: '', mesh: '', times: ['', '', '', '', ''], sensory: {}, intensity: '', quality: '' };
  ATTRS.forEach((a) => { s.sensory[a] = { H: '', W: '' }; });
  return s;
}

function emptyDraft() {
  const iso = new Date().toISOString().slice(0, 10);
  return {
    date: iso, store: STORES[0], checker: '', roastDate: '',
    bean: { name: '', origin: '', process: '', variety: '' },
    shots: [emptyShot(), emptyShot()], note: '',
  };
}

const TIME_PLACEHOLDERS = ['0:00', '：', '：', '：', '：'];

export default function NewEntryForm({ onSave, showToast }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setBeanField = (field, value) => setDraft((d) => ({ ...d, bean: { ...d.bean, [field]: value } }));
  const setShotField = (idx, field, value) => setDraft((d) => {
    const shots = d.shots.slice();
    shots[idx] = { ...shots[idx], [field]: value };
    return { ...d, shots };
  });
  const setShotTime = (idx, ti, value) => setDraft((d) => {
    const shots = d.shots.slice();
    const times = shots[idx].times.slice();
    times[ti] = value;
    shots[idx] = { ...shots[idx], times };
    return { ...d, shots };
  });
  const setSensory = (idx, attr, temp, value) => setDraft((d) => {
    const shots = d.shots.slice();
    const sensory = { ...shots[idx].sensory, [attr]: { ...shots[idx].sensory[attr], [temp]: value } };
    shots[idx] = { ...shots[idx], sensory };
    return { ...d, shots };
  });
  const addShot = () => setDraft((d) => (d.shots.length < 4 ? { ...d, shots: [...d.shots, emptyShot()] } : d));
  const removeShot = (idx) => setDraft((d) => (d.shots.length <= 1 ? d : { ...d, shots: d.shots.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        store: draft.store,
        date: draft.date,
        checker: draft.checker,
        roast_date: draft.roastDate || null,
        bean_name: draft.bean.name,
        bean_origin: draft.bean.origin,
        bean_process: draft.bean.process,
        bean_variety: draft.bean.variety,
        shots: draft.shots,
        note: draft.note,
      });
      showToast('記録を保存しました。');
      setDraft(emptyDraft());
    } catch (e) {
      showToast('保存に失敗しました。もう一度お試しください。', true);
    } finally {
      setSaving(false);
    }
  };

  function shotHeaderCells(shot, idx) {
    return (
      <>
        <td className="qcd-badge-cell"><span className="qcd-badge">{MARKS[idx]}</span></td>
        <td colSpan={2}>
          <input type="number" step="0.1" className="qcd-cell-input" placeholder="Dose (g)"
            value={shot.doseG} onChange={(e) => setShotField(idx, 'doseG', e.target.value)} />
        </td>
        <td>
          <input type="text" className="qcd-cell-input" placeholder="Mesh #"
            value={shot.mesh} onChange={(e) => setShotField(idx, 'mesh', e.target.value)} />
        </td>
      </>
    );
  }

  function timeCells(shot, idx, ti) {
    return (
      <>
        <td>
          <input type="text" className="qcd-cell-input" placeholder={TIME_PLACEHOLDERS[ti]}
            value={shot.times[ti]} onChange={(e) => setShotTime(idx, ti, e.target.value)} />
        </td>
        <td colSpan={3} className="qcd-blank-cell"></td>
      </>
    );
  }

  // Build sensory rows manually (paired left/right per attribute)
  function sensoryTableRows(leftIdx, rightIdx) {
    const left = draft.shots[leftIdx];
    const right = rightIdx < draft.shots.length ? draft.shots[rightIdx] : null;
    const rows = [];
    ATTRS.forEach((attr, ai) => {
      rows.push(
        <tr key={attr + '-H'}>
          <td className="qcd-attr-cell" rowSpan={2}>{ATTR_LABEL[attr]}</td>
          <td className="qcd-hw-cell">H</td>
          {ai === 0 ? (
            <>
              <td><input type="text" className="qcd-cell-input" placeholder="Intensity" value={left.intensity} onChange={(e) => setShotField(leftIdx, 'intensity', e.target.value)} /></td>
              <td><input type="text" className="qcd-cell-input" placeholder="Quality" value={left.quality} onChange={(e) => setShotField(leftIdx, 'quality', e.target.value)} /></td>
            </>
          ) : (
            <td colSpan={2}><input type="text" className="qcd-cell-input" placeholder="評価メモ" value={left.sensory[attr].H} onChange={(e) => setSensory(leftIdx, attr, 'H', e.target.value)} /></td>
          )}
          {right ? (
            <>
              <td className="qcd-attr-cell" rowSpan={2}>{ATTR_LABEL[attr]}</td>
              <td className="qcd-hw-cell">H</td>
              <td colSpan={2}><input type="text" className="qcd-cell-input" placeholder="評価メモ" value={right.sensory[attr].H} onChange={(e) => setSensory(rightIdx, attr, 'H', e.target.value)} /></td>
            </>
          ) : (
            <td colSpan={4} className="qcd-blank-cell"></td>
          )}
        </tr>
      );
      rows.push(
        <tr key={attr + '-W'}>
          <td className="qcd-hw-cell">W</td>
          <td colSpan={2}><input type="text" className="qcd-cell-input" placeholder="評価メモ" value={left.sensory[attr].W} onChange={(e) => setSensory(leftIdx, attr, 'W', e.target.value)} /></td>
          {right ? (
            <>
              <td className="qcd-hw-cell">W</td>
              <td colSpan={2}><input type="text" className="qcd-cell-input" placeholder="評価メモ" value={right.sensory[attr].W} onChange={(e) => setSensory(rightIdx, attr, 'W', e.target.value)} /></td>
            </>
          ) : (
            <td colSpan={3} className="qcd-blank-cell"></td>
          )}
        </tr>
      );
    });
    return rows;
  }

  function shotBlock(leftIdx, rightIdx) {
    const right = rightIdx < draft.shots.length ? draft.shots[rightIdx] : null;
    return (
      <div key={leftIdx} className="qcd-shot-block">
        <table className="qcd-orig-table"><tbody>
          <tr>
            {shotHeaderCells(draft.shots[leftIdx], leftIdx)}
            {right ? shotHeaderCells(right, rightIdx) : (
              <>
                <td className="qcd-badge-cell"></td>
                <td colSpan={3}><button type="button" className="qcd-add-shot" onClick={addShot}>+ 追加</button></td>
              </>
            )}
          </tr>
          {[0, 1, 2, 3, 4].map((ti) => (
            <tr key={ti}>
              {timeCells(draft.shots[leftIdx], leftIdx, ti)}
              {right ? timeCells(right, rightIdx, ti) : <td colSpan={4} className="qcd-blank-cell"></td>}
            </tr>
          ))}
          <tr><td colSpan={8} className="qcd-blank-cell" style={{ height: 8 }}></td></tr>
          {sensoryTableRows(leftIdx, rightIdx)}
        </tbody></table>
        {draft.shots.length > 1 && (
          <div className="qcd-shot-block-controls">
            <button type="button" className="qcd-remove-btn" onClick={() => removeShot(leftIdx)}>{MARKS[leftIdx]} を削除</button>
            {right && <button type="button" className="qcd-remove-btn" style={{ marginLeft: 8 }} onClick={() => removeShot(rightIdx)}>{MARKS[rightIdx]} を削除</button>}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="qcd-section-title">報告書ヘッダー</p>
      <table className="qcd-orig-table"><tbody>
        <tr>
          <td style={{ width: '12%' }}><input type="date" className="qcd-cell-input" value={draft.date} onChange={(e) => setField('date', e.target.value)} /></td>
          <td className="qcd-label" style={{ width: '10%' }}>Origin：</td>
          <td colSpan={2}><input type="text" className="qcd-cell-input" placeholder="産地を入力" value={draft.bean.origin} onChange={(e) => setBeanField('origin', e.target.value)} /></td>
          <td className="qcd-label" style={{ width: '12%' }}>焙煎日</td>
          <td colSpan={2}><input type="date" className="qcd-cell-input" value={draft.roastDate} onChange={(e) => setField('roastDate', e.target.value)} /></td>
          <td className="qcd-label" style={{ width: '10%' }}>確認：</td>
        </tr>
        <tr><td colSpan={8} style={{ padding: 0 }}><input type="text" className="qcd-cell-input" style={{ textAlign: 'right' }} placeholder="確認者名" value={draft.checker} onChange={(e) => setField('checker', e.target.value)} /></td></tr>
      </tbody></table>

      <p className="qcd-section-title">追加情報（原本にはない拡張項目）</p>
      <div className="qcd-extra-box">
        <p className="qcd-extra-label">データとして蓄積するために追加した項目です</p>
        <div className="qcd-grid4">
          <div className="qcd-field">
            <label>店舗</label>
            <select value={draft.store} onChange={(e) => setField('store', e.target.value)}>
              {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="qcd-field">
            <label>豆銘柄</label>
            <input type="text" placeholder="例）Yirgacheffe" value={draft.bean.name} onChange={(e) => setBeanField('name', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>プロセス</label>
            <input type="text" placeholder="例）Washed" value={draft.bean.process} onChange={(e) => setBeanField('process', e.target.value)} />
          </div>
          <div className="qcd-field">
            <label>品種</label>
            <input type="text" placeholder="例）Heirloom" value={draft.bean.variety} onChange={(e) => setBeanField('variety', e.target.value)} />
          </div>
        </div>
      </div>

      <p className="qcd-section-title">ショット記録（原本のグリッドを再現）</p>
      {shotBlock(0, 1)}
      {draft.shots.length > 2 && shotBlock(2, 3)}

      <div className="qcd-memo-field">
        <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 }}>総合メモ</label>
        <textarea rows={2} placeholder="全体を通しての所感" value={draft.note} onChange={(e) => setField('note', e.target.value)} />
      </div>

      <button type="button" className="qcd-save-btn" disabled={saving} onClick={handleSave}>
        {saving ? '保存中…' : '記録を保存'}
      </button>
      <p className="qcd-note">保存したデータは伏見・二条の全スタッフと共有されます</p>
    </>
  );
}
