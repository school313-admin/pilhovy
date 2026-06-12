import { SCHOOL_NAME, CURRENT_YEAR } from '../data/constants';

const TABS = [
  { id:'home',       icon:'ti-home',      label:'Класи' },
  { id:'list',       icon:'ti-list',      label:'Список' },
  { id:'analytics',  icon:'ti-chart-bar', label:'Аналітика' },
  { id:'admin',      icon:'ti-lock',      label:'Адмін' },
];

export default function Topbar({ page, setPage, syncing, onReload }) {
  return (
    <header style={{
      background:'var(--surface)',
      borderBottom:'0.5px solid var(--border)',
      padding:'0 24px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:58,
      position:'sticky', top:0, zIndex:100,
      boxShadow:'0 1px 8px rgba(0,0,0,.06)',
    }}>
      {/* Лого */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', width:18, height:13, borderRadius:3, overflow:'hidden', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,.15)' }}>
          <div style={{ flex:1, background:'var(--ua-blue)' }} />
          <div style={{ flex:1, background:'var(--ua-yellow)' }} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:'Unbounded, sans-serif', lineHeight:1 }}>
            Спеціалізована школа I–III ступенів № 313
          </div>
          <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, letterSpacing:'.03em' }}>
            з поглибленим вивченням інформаційних технологій · Пільгові категорії
          </div>
        </div>
      </div>

      {/* Центр — статус синхронізації */}
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}>
        {syncing ? (
          <>
            <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite', fontSize:14 }} />
            <span>Синхронізація...</span>
          </>
        ) : (
          <>
            <i className="ti ti-cloud-check" style={{ fontSize:14, color:'var(--success)' }} />
            <span style={{ color:'var(--success)' }}>Дані синхронізовано</span>
          </>
        )}
        <button
          onClick={onReload}
          title="Оновити дані"
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:15, padding:'4px 6px', marginLeft:4, borderRadius:6 }}
          onMouseEnter={e => e.currentTarget.style.color='var(--ua-blue)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
        >
          <i className="ti ti-refresh" />
        </button>
      </div>

      {/* Навігація */}
      <nav style={{ display:'flex', gap:2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'8px 16px', borderRadius:'var(--radius-sm)',
            border:'none',
            background: page === t.id ? 'linear-gradient(135deg, var(--ua-blue) 0%, var(--ua-blue-light) 100%)' : 'transparent',
            color: page === t.id ? '#fff' : 'var(--text2)',
            fontFamily:'inherit', fontSize:13,
            fontWeight: page === t.id ? 600 : 400,
            boxShadow: page === t.id ? '0 2px 8px rgba(0,87,183,.25)' : 'none',
            transition:'all .18s',
          }}>
            <i className={`ti ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
