import { useState } from 'react';
import { STORES } from '../../lib/constants';
import EntryCard from './EntryCard';

export default function HistoryTab({ entries, onDelete }) {
  const [filterStore, setFilterStore] = useState('all');
  const [openId, setOpenId] = useState(null);

  const filtered = entries.filter((e) => filterStore === 'all' || e.store === filterStore);

  return (
    <>
      <div className="qcd-filters">
        <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
          <option value="all">全店舗</option>
          {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="qcd-empty">まだ記録がありません。「新規記録」タブから登録してください。</div>
      ) : (
        filtered.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            open={openId === e.id}
            onToggle={() => setOpenId(openId === e.id ? null : e.id)}
            onDelete={onDelete}
          />
        ))
      )}
    </>
  );
}
