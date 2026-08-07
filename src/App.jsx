import { useCallback, useEffect, useState } from 'react';
import { fetchEntries, saveEntry, deleteEntry } from './lib/db';
import NewEntryForm from './components/drip/NewEntryForm';
import HistoryTab from './components/drip/HistoryTab';

export default function App() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [toast, setToast] = useState(null); // { text, isError }

  useEffect(() => {
    fetchEntries().then(setEntries).catch((e) => setError(e.message));
  }, []);

  const showToast = useCallback((text, isError = false) => {
    setToast({ text, isError });
  }, []);

  const onSaveEntry = useCallback(async (fields) => {
    const saved = await saveEntry(fields);
    setEntries((es) => [saved, ...es]);
    return saved;
  }, []);

  const onDeleteEntry = useCallback(async (id) => {
    await deleteEntry(id);
    setEntries((es) => es.filter((e) => e.id !== id));
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setToast(null);
  };

  if (error) {
    return <div id="qcd-app"><div className="qcd-body"><div className="qcd-toast-err">読み込みエラー：{error}</div></div></div>;
  }
  if (!entries) {
    return <div id="qcd-app"><div className="qcd-loading">読み込み中…</div></div>;
  }

  return (
    <div id="qcd-app">
      <div className="qcd-header">
        <p className="qcd-brand">ABOUT US COFFEE</p>
        <h1>抽出品質 QCログ</h1>
      </div>
      <div className="qcd-tabs">
        <button className={'qcd-tab' + (activeTab === 'new' ? ' active' : '')} onClick={() => changeTab('new')}>新規記録</button>
        <button className={'qcd-tab' + (activeTab === 'history' ? ' active' : '')} onClick={() => changeTab('history')}>履歴（{entries.length}）</button>
      </div>
      <div className="qcd-body">
        {toast && <div className={toast.isError ? 'qcd-toast-err' : 'qcd-toast'}>{toast.text}</div>}
        {activeTab === 'new' ? (
          <NewEntryForm onSave={onSaveEntry} showToast={showToast} />
        ) : (
          <HistoryTab entries={entries} onDelete={onDeleteEntry} />
        )}
      </div>
    </div>
  );
}
