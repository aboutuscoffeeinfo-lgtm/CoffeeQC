import DateField from './DateField';

export function emptyComment() {
  const iso = new Date().toISOString().slice(0, 10);
  return { date: iso, roast_date: '', comment: '' };
}

export default function CommentsSection({ comments, onChange }) {
  const setField = (ci, field, value) => {
    const next = comments.slice();
    next[ci] = { ...next[ci], [field]: value };
    onChange(next);
  };
  const addComment = () => onChange([...comments, emptyComment()]);
  const removeComment = (ci) => onChange(comments.filter((_, i) => i !== ci));

  return (
    <div>
      {comments.map((c, ci) => (
        <div className="qcd-comment-row" key={ci}>
          <div>
            <label>日付</label>
            <DateField value={c.date} onChange={(v) => setField(ci, 'date', v)} />
          </div>
          <div>
            <label>焙煎日</label>
            <DateField value={c.roast_date} onChange={(v) => setField(ci, 'roast_date', v)} />
          </div>
          <div>
            <label>コメント</label>
            <textarea rows={2} placeholder="気づき・味の変化・違和感などを記入してください" value={c.comment} onChange={(e) => setField(ci, 'comment', e.target.value)} />
          </div>
          {ci > 0 && <button type="button" className="qcd-pour-remove" onClick={() => removeComment(ci)}>×</button>}
        </div>
      ))}
      <button type="button" className="qcd-add-comment" onClick={addComment}>+ コメントを追加</button>
    </div>
  );
}
