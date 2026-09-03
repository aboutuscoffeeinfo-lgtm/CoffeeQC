import { useCallback, useEffect, useState } from 'react';
import { fetchReports, upsertReport, deleteReport, toggleReleased } from './lib/db';
import ReportForm from './components/drip/ReportForm';
import History from './components/drip/History';
import ReleasedTab from './components/drip/ReleasedTab';

export default function App() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [toast, setToast] = useState(null); // { text, isError }

  useEffect(() => {
    fetchReports().then(setReports).catch((e) => setError(e.message));
  }, []);

  const showToast = useCallback((text, isError = false) => {
    setToast({ text, isError });
  }, []);

  const onSaveReport = useCallback(async (payload) => {
    const saved = await upsertReport(payload);
    setReports((rs) => {
      const exists = rs.some((r) => r.id === saved.id);
      return exists ? rs.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...rs];
    });
    return saved;
  }, []);

  const onDeleteReport = useCallback(async (id) => {
    await deleteReport(id);
    setReports((rs) => rs.filter((r) => r.id !== id));
  }, []);

  const onToggleReleased = useCallback(async (id, value) => {
    const saved = await toggleReleased(id, value);
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, is_released: saved.is_released } : r)));
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setToast(null);
  };

  if (error) {
    return <div id="qcd-app"><div className="qcd-body"><div className="qcd-toast-err">読み込みエラー：{error}</div></div></div>;
  }
  if (!reports) {
    return <div id="qcd-app"><div className="qcd-loading">読み込み中…</div></div>;
  }

  const drafts = reports.filter((r) => r.status === 'draft');
  const savedReports = reports.filter((r) => r.status !== 'draft');

  return (
    <div id="qcd-app">
      <div className="qcd-header">
        <p className="qcd-brand">QC報告書</p>
        <h1>About Us Coffee — ドリップ品質管理</h1>
        <div className="qcd-tabs">
          <button className={'qcd-tab' + (activeTab === 'new' ? ' active' : '')} onClick={() => changeTab('new')}>新規入力</button>
          <button className={'qcd-tab' + (activeTab === 'history' ? ' active' : '')} onClick={() => changeTab('history')}>履歴（{savedReports.length}）</button>
          <button className={'qcd-tab' + (activeTab === 'released' ? ' active' : '')} onClick={() => changeTab('released')}>リリース中</button>
        </div>
      </div>
      <div className="qcd-body">
        {toast && <div className={toast.isError ? 'qcd-toast-err' : 'qcd-toast'}>{toast.text}</div>}
        {activeTab === 'new' && (
          <ReportForm drafts={drafts} onSave={onSaveReport} showToast={showToast} />
        )}
        {activeTab === 'history' && (
          <History reports={savedReports} onDelete={onDeleteReport} onSave={onSaveReport} showToast={showToast} />
        )}
        {activeTab === 'released' && (
          <ReleasedTab reports={savedReports} onToggleReleased={onToggleReleased} />
        )}
      </div>
    </div>
  );
}
