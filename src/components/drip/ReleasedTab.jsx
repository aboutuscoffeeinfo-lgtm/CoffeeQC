import Toggle from './Toggle';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export default function ReleasedTab({ reports, onToggleReleased }) {
  const released = reports.filter((r) => r.is_released);

  return (
    <>
      <p className="qcd-released-note">現在「リリース中」に設定されている報告書の一覧です。オン/オフの切り替えはここから行えます。</p>
      {released.length === 0 ? (
        <div className="qcd-empty">リリース中の報告書はまだありません。</div>
      ) : (
        released.map((r) => (
          <div className="qcd-released-row" key={r.id}>
            <span className="qcd-draft-date">{fmtDate(r.date)}</span>
            <span className="qcd-released-cvp">{r.country}/{r.variety}/{r.process}</span>
            <span className="qcd-draft-lot" style={{ marginLeft: 0 }}>{r.lot_name || '（ロット名未入力）'}</span>
            <Toggle on={r.is_released} onChange={(v) => onToggleReleased(r.id, v)} />
          </div>
        ))
      )}
    </>
  );
}
