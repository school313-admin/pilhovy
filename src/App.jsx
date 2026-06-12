// src/App.jsx
import { useState } from 'react';
import Topbar from './components/Topbar';
import PageHome from './components/PageHome';
import PageList from './components/PageList';
import PageAnalytics from './components/PageAnalytics';
import PageAdmin from './components/PageAdmin';
import { useStore } from './data/useStore';

export default function App() {
  const [page, setPage]           = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const store = useStore();
  const { state, loading, error, syncing, reload } = store;

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen error={error} onRetry={reload} />;

  const renderPage = () => {
    switch(page) {
      case 'home':      return <PageHome      state={state} addStudent={store.addStudent} deleteStudent={store.deleteStudent} onModalChange={setModalOpen} reload={store.reload} />;
      case 'list':      return <PageList      state={state} />;
      case 'analytics': return <PageAnalytics state={state} />;
      case 'admin':     return (
        <PageAdmin
          state={state}
          setClassActive={store.setClassActive}
          deleteClass={store.deleteClass}
          addClass={store.addClass}
          addCategory={store.addCategory}
          updateCategory={store.updateCategory}
          deleteCategory={store.deleteCategory}
          addYear={store.addYear}
          setCurrentYear={store.setCurrentYear}
          deleteYear={store.deleteYear}
          setAdminPassword={store.setAdminPassword}
        />
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Topbar page={page} setPage={setPage} syncing={syncing} onReload={reload} />
      <main style={{
        maxWidth:1100, margin:'0 auto', padding:'20px 20px 40px',
        filter: modalOpen ? 'blur(5px)' : 'none',
        transition:'filter .2s ease',
        pointerEvents: modalOpen ? 'none' : 'auto',
        userSelect:    modalOpen ? 'none' : 'auto',
      }}>
        {renderPage()}
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'var(--bg)' }}>
      <div style={{ display:'flex', flexDirection:'column', width:24, height:17, borderRadius:4, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>
        <div style={{ flex:1, background:'#0057B7' }} />
        <div style={{ flex:1, background:'#FFD700' }} />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:17, fontWeight:700, fontFamily:'Unbounded, sans-serif', color:'var(--text)', lineHeight:1.3 }}>
          Спеціалізована школа I–III ступенів № 313
        </div>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:6, letterSpacing:'.03em' }}>
          з поглибленим вивченням інформаційних технологій
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>
          Пільгові категорії
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text3)', fontSize:13, marginTop:4 }}>
        <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite', fontSize:18 }} />
        Завантаження даних...
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'var(--bg)', padding:20 }}>
      <i className="ti ti-wifi-off" style={{ fontSize:40, color:'var(--text3)' }} />
      <div style={{ fontSize:15, fontWeight:600, color:'var(--text)' }}>Не вдалось підключитись</div>
      <div style={{ fontSize:13, color:'var(--text2)', textAlign:'center', maxWidth:360, lineHeight:1.6 }}>{error}</div>
      <button onClick={onRetry} style={{
        padding:'10px 24px', borderRadius:'var(--radius-sm)',
        background:'linear-gradient(135deg,#0057B7,#1A6ED4)',
        color:'#fff', border:'none', fontSize:14, fontWeight:600,
        cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:8,
      }}>
        <i className="ti ti-refresh" /> Спробувати знову
      </button>
    </div>
  );
}
