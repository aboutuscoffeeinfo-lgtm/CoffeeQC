import { ATTRS, ATTR_LABEL, MARKS } from '../../lib/constants';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export default function EntryCard({ entry, open, onToggle, onDelete }) {
  return (
    <div className="qcd-entry-card">
      <div className="qcd-entry-top" onClick={onToggle}>
        <div>
          <span>
            <span className="qcd-entry-store">{entry.store}</span>
            <span className="qcd-entry-date">{fmtDate(entry.date)}</span>
          </span>
          <div className="qcd-entry-bean">
            {entry.bean_name || '豆銘柄未記入'}{entry.bean_origin ? `　/　${entry.bean_origin}` : ''}
          </div>
          <div className="qcd-entry-checker">確認者：{entry.checker || '—'}　・　ショット {entry.shots.length}件</div>
        </div>
        <span className="qcd-chevron">{open ? '▲' : '▼'}</span>
      </div>
      <div className={'qcd-entry-detail' + (open ? ' open' : '')}>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>
          プロセス：<b style={{ color: 'var(--ink)' }}>{entry.bean_process || '—'}</b>
          　品種：<b style={{ color: 'var(--ink)' }}>{entry.bean_variety || '—'}</b>
          　焙煎日：<b style={{ color: 'var(--ink)' }}>{entry.roast_date ? fmtDate(entry.roast_date) : '—'}</b>
        </div>
        {entry.shots.map((s, i) => {
          const sensoryLine = ATTRS.map((a) => `${ATTR_LABEL[a]} H:${s.sensory[a].H || '—'} W:${s.sensory[a].W || '—'}`).join('　');
          const times = (s.times || []).filter(Boolean).join('　/　') || '—';
          return (
            <div key={i} className="qcd-shot-summary">
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {MARKS[i]} Dose {s.doseG || '—'}g　Mesh #{s.mesh || '—'}
                {(s.intensity || s.quality) ? `　Intensity ${s.intensity || '—'}　Quality ${s.quality || '—'}` : ''}
              </div>
              <div style={{ color: 'var(--ink-soft)' }}>時刻：{times}</div>
              <div style={{ color: 'var(--ink-soft)' }}>{sensoryLine}</div>
            </div>
          );
        })}
        {entry.note && <div style={{ fontSize: 12, marginTop: 6 }}>総合メモ：{entry.note}</div>}
        <button type="button" className="qcd-del-entry" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}>この記録を削除</button>
      </div>
    </div>
  );
}
