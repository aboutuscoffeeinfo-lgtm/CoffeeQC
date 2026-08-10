import { useMemo, useState } from 'react';
import { ATTRS, ATTR_LABEL, MARKS } from '../../lib/constants';
import CommentsSection, { emptyComment } from './CommentsSection';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export default function History({ reports, onDelete, onAddComment }) {
  const [country, setCountry] = useState('');
  const [variety, setVariety] = useState('');
  const [process, setProcess] = useState('');
  const [openId, setOpenId] = useState(null);
  const [newComment, setNewComment] = useState({});

  const countries = useMemo(() => uniqueSorted(reports.map((r) => r.country)), [reports]);
  const varieties = useMemo(() => uniqueSorted(reports.map((r) => r.variety)), [reports]);
  const processes = useMemo(() => uniqueSorted(reports.map((r) => r.process)), [reports]);

  const allSelected = country && variety && process;
  const filtered = allSelected
    ? reports.filter((r) => r.country === country && r.variety === variety && r.process === process)
    : [];

  const startComment = (reportId) => setNewComment((n) => ({ ...n, [reportId]: [emptyComment()] }));
  const submitComment = async (report) => {
    const rows = newComment[report.id] || [];
    for (const c of rows) {
      if (c.comment || c.date || c.roast_date) {
        await onAddComment(report, c);
      }
    }
    setNewComment((n) => ({ ...n, [report.id]: undefined }));
  };

  return (
    <>
      <div className="qcd-filters">
        <div>
          <label>国</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">選択してください</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>品種</label>
          <select value={variety} onChange={(e) => setVariety(e.target.value)}>
            <option value="">選択してください</option>
            {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label>プロセス</label>
          <select value={process} onChange={(e) => setProcess(e.target.value)}>
            <option value="">選択してください</option>
            {processes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {!allSelected ? (
        <div className="qcd-empty">国・品種・プロセスをすべて選択すると記録が表示されます。</div>
      ) : filtered.length === 0 ? (
        <div className="qcd-empty">該当する記録がありません。</div>
      ) : (
        filtered.map((r) => {
          const open = openId === r.id;
          const rows = newComment[r.id];
          return (
            <div className="qcd-entry-card" key={r.id}>
              <div className="qcd-entry-top" onClick={() => setOpenId(open ? null : r.id)}>
                <div>
                  <div className="qcd-entry-date">{fmtDate(r.date)}</div>
                  <div className="qcd-entry-cvp">{r.country}/{r.variety}/{r.process}</div>
                  <div className="qcd-entry-lot">{r.lot_name || 'ロット名未記入'}</div>
                </div>
                <span className="qcd-chevron">{open ? '▲' : '▼'}</span>
              </div>
              <div className={'qcd-entry-detail' + (open ? ' open' : '')}>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>
                  店舗：<b style={{ color: 'var(--ink)' }}>{r.store}</b>
                  　焙煎日：<b style={{ color: 'var(--ink)' }}>{r.roast_date ? fmtDate(r.roast_date) : '—'}</b>
                  　確認：<b style={{ color: 'var(--ink)' }}>{r.checker || '—'}</b>
                </div>
                {r.qc_slots.map((s, i) => {
                  const cellText = (c) => c && (c.intensity || c.quality) ? `${c.intensity || '—'}${c.quality ? `/Q${c.quality}` : ''}` : '—';
                  const sensory = ATTRS.map((a) => `${ATTR_LABEL[a]} H:${cellText(s.sensory[a]?.H)} W:${cellText(s.sensory[a]?.W)}`).join('　');
                  const pours = (s.pours || []).filter((p) => p.time || p.dose).map((p) => `${p.time || '—'}/${p.dose || '—'}`).join('　');
                  return (
                    <div key={i} className="qcd-shot-summary">
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {MARKS[i]} Dose {s.dose_g || '—'}g　Mesh #{s.mesh || '—'}
                      </div>
                      {pours && <div style={{ color: 'var(--ink-soft)' }}>Time/Dose：{pours}</div>}
                      <div style={{ color: 'var(--ink-soft)' }}>{sensory}</div>
                      {s.remarks && <div style={{ marginTop: 4 }}>備考：{s.remarks}</div>}
                    </div>
                  );
                })}
                {r.tendency && <div style={{ fontSize: 12, marginTop: 8 }}>傾向：{r.tendency}</div>}

                {r.qc_comments.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p className="qcd-section-title" style={{ margin: '10px 0 6px', fontSize: 11 }}>コメント</p>
                    {r.qc_comments.map((c) => (
                      <div key={c.id} className="qcd-comment-summary">
                        {fmtDate(c.date)}{c.roast_date ? `（焙煎日 ${fmtDate(c.roast_date)}）` : ''}：{c.comment}
                      </div>
                    ))}
                  </div>
                )}

                {rows ? (
                  <div style={{ marginTop: 10 }}>
                    <CommentsSection comments={rows} onChange={(next) => setNewComment((n) => ({ ...n, [r.id]: next }))} />
                    <button type="button" className="qcd-save-btn" onClick={() => submitComment(r)}>コメントを保存</button>
                  </div>
                ) : (
                  <button type="button" className="qcd-add-comment" style={{ marginTop: 10 }} onClick={() => startComment(r.id)}>+ コメントを追加</button>
                )}

                <button type="button" className="qcd-del-entry" onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}>この記録を削除</button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
