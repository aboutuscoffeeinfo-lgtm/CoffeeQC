function fmtDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export default function DateField({ value, onChange, placeholder }) {
  return (
    <div className="qcd-date-field">
      <div className="qcd-date-display">
        {value ? fmtDisplay(value) : <span className="qcd-date-placeholder">{placeholder || '----/--/--'}</span>}
      </div>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
