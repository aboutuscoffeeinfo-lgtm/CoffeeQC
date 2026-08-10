import { useCallback, useEffect, useState } from 'react';
import { fetchReports, saveReport, deleteReport, addComment } from './lib/db';
import ReportForm from './components/drip/ReportForm';
import History from './components/drip/History';

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
    const saved = await saveReport(payload);
    setReports((rs) => [saved, ...rs]);
    return saved;
  }, []);

  const onDeleteReport = useCallback(async (id) => {
    await deleteReport(id);
    setReports((rs) => rs.filter((r) => r.id !== id));
  }, []);

  const onAddComment = useCallback(async (report, comment) => {
    const saved = await addComment(report, comment);
    setReports((rs) => rs.map((r) => (r.id === report.id ? { ...r, qc_comments: [...r.qc_comments, saved] } : r)));
    return saved;
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

  return (
    <div id="qcd-app">
      <div className="qcd-header">
        <p className="qcd-brand">QC報告書</p>
        <h1>About Us Coffee — ドリップ品質管理</h1>
        <div className="qcd-tabs">
          <button className={'qcd-tab' + (activeTab === 'new' ? ' active' : '')} onClick={() => changeTab('new')}>新規入力</button>
          <button className={'qcd-tab' + (activeTab === 'history' ? ' active' : '')} onClick={() => changeTab('history')}>履歴（{reports.length}）</button>
        </div>
      </div>
      <div className="qcd-body">
        {toast && <div className={toast.isError ? 'qcd-toast-err' : 'qcd-toast'}>{toast.text}</div>}
        {activeTab === 'new' ? (
          <ReportForm onSave={onSaveReport} showToast={showToast} />
        ) : (
          <History reports={reports} onDelete={onDeleteReport} onAddComment={onAddComment} />
        )}
      </div>
    </div>
  );
}
