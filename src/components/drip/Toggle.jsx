export default function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={'qcd-toggle' + (on ? ' on' : '')}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className="qcd-toggle-knob" />
    </button>
  );
}
