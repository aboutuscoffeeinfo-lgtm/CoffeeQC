import { useMemo, useState } from 'react';
import ReportForm from './ReportForm';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export default function History({ reports, onDelete, onSave, showToast }) {
  const [country, setCountry] = useState('');
  const [variety, setVariety] = useState('');
  const [process, setProcess] = useState('');
  const [openId, setOpenId] = useState(null);

  const countries = useMemo(() => uniqueSorted(reports.map((r) => r.country)), [reports]);
  const varieties = useMemo(() => uniqueSorted(reports.map((r) => r.variety)), [reports]);
  const processes = useMemo(() => uniqueSorted(reports.map((r) => r.process)), [reports]);

  const allSelected = country && variety && process;
  const filtered = allSelected
    ? reports.filter((r) => r.country === country && r.variety === variety && r.process === process)
    : [];

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
                {open && (
                  <ReportForm
                    initialReport={r}
                    mode="edit"
                    onSave={onSave}
                    showToast={showToast}
                    onDone={() => setOpenId(null)}
                  />
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
