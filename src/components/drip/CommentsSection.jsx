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
            <input type="date" value={c.date} onChange={(e) => setField(ci, 'date', e.target.value)} />
          </div>
          <div>
            <label>焙煎日</label>
            <input type="date" value={c.roast_date} onChange={(e) => setField(ci, 'roast_date', e.target.value)} />
          </div>
          <div>
            <label>コメント</label>
            <input type="text" placeholder="気づき・味の変化など" value={c.comment} onChange={(e) => setField(ci, 'comment', e.target.value)} />
          </div>
          <button type="button" className="qcd-pour-remove" onClick={() => removeComment(ci)}>×</button>
        </div>
      ))}
      <button type="button" className="qcd-add-comment" onClick={addComment}>+ コメントを追加</button>
    </div>
  );
}
