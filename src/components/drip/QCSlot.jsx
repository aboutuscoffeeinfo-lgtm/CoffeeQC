import { ATTRS, ATTR_LABEL, INTENSITY_OPTIONS, MARKS } from '../../lib/constants';

function emptyPour() {
  return { time: '', dose: '' };
}

function emptySensoryCell() {
  return { intensity: '', quality: '' };
}

export function emptySlot() {
  const sensory = {};
  ATTRS.forEach((a) => { sensory[a] = { H: emptySensoryCell(), W: emptySensoryCell() }; });
  return { dose_g: '', mesh: '', pours: [emptyPour(), emptyPour(), emptyPour(), emptyPour(), emptyPour()], sensory, remarks: '' };
}

export default function QCSlot({ slot, index, onChange, onRemove, removable }) {
  const setField = (field, value) => onChange({ ...slot, [field]: value });
  const setPour = (pi, field, value) => {
    const pours = slot.pours.slice();
    pours[pi] = { ...pours[pi], [field]: value };
    onChange({ ...slot, pours });
  };
  const addPour = () => onChange({ ...slot, pours: [...slot.pours, emptyPour()] });
  const removePour = (pi) => onChange({ ...slot, pours: slot.pours.filter((_, i) => i !== pi) });
  const setSensory = (attr, temp, field, value) => {
    onChange({
      ...slot,
      sensory: {
        ...slot.sensory,
        [attr]: { ...slot.sensory[attr], [temp]: { ...slot.sensory[attr][temp], [field]: value } },
      },
    });
  };

  return (
    <div className="qcd-slot">
      <div className="qcd-slot-head">
        <span className="qcd-slot-mark">{MARKS[index]}</span>
        <div className="qcd-slot-dosemesh">
          <label>Dose<input type="number" step="0.1" placeholder="g" value={slot.dose_g} onChange={(e) => setField('dose_g', e.target.value)} />g</label>
          <label>Mesh #<input type="text" value={slot.mesh} onChange={(e) => setField('mesh', e.target.value)} /></label>
        </div>
        {removable && <button type="button" className="qcd-remove-btn" onClick={onRemove}>{MARKS[index]} を削除</button>}
      </div>

      <table className="qcd-pour-table"><thead>
        <tr><th style={{ width: '45%' }}>Time</th><th style={{ width: '45%' }}>Dose</th><th></th></tr>
      </thead><tbody>
        {slot.pours.map((p, pi) => (
          <tr className="qcd-pour-row" key={pi}>
            <td><input type="text" placeholder="0:00" value={p.time} onChange={(e) => setPour(pi, 'time', e.target.value)} /></td>
            <td><input type="text" placeholder="〇g" value={p.dose} onChange={(e) => setPour(pi, 'dose', e.target.value)} /></td>
            <td><button type="button" className="qcd-pour-remove" onClick={() => removePour(pi)}>×</button></td>
          </tr>
        ))}
      </tbody></table>
      <button type="button" className="qcd-add-pour" onClick={addPour}>+ 行を追加</button>

      <table className="qcd-sensory-table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th></th><th></th>
            <th className="qcd-sensory-head">Intensity</th>
            <th className="qcd-sensory-head">Quality</th>
          </tr>
        </thead>
        <tbody>
          {ATTRS.map((attr) => (
            <>
              <tr key={attr + 'H'}>
                <td className="qcd-attr-cell" rowSpan={2}>{ATTR_LABEL[attr]}</td>
                <td className="qcd-hw-cell">H</td>
                <td>
                  <select value={slot.sensory[attr].H.intensity} onChange={(e) => setSensory(attr, 'H', 'intensity', e.target.value)}>
                    <option value="">—</option>
                    {INTENSITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td><input type="number" min="1" max="5" value={slot.sensory[attr].H.quality} onChange={(e) => setSensory(attr, 'H', 'quality', e.target.value)} /></td>
              </tr>
              <tr key={attr + 'W'}>
                <td className="qcd-hw-cell">W</td>
                <td>
                  <select value={slot.sensory[attr].W.intensity} onChange={(e) => setSensory(attr, 'W', 'intensity', e.target.value)}>
                    <option value="">—</option>
                    {INTENSITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td><input type="number" min="1" max="5" value={slot.sensory[attr].W.quality} onChange={(e) => setSensory(attr, 'W', 'quality', e.target.value)} /></td>
              </tr>
            </>
          ))}
        </tbody>
      </table>

      <div className="qcd-remarks-field">
        <label>備考</label>
        <textarea rows={2} placeholder="このショットの気づき" value={slot.remarks} onChange={(e) => setField('remarks', e.target.value)} />
      </div>
    </div>
  );
}
