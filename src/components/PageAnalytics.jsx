import { useState } from 'react';
import { StatCard, Card, Badge, Select } from './UI';

const BAR_COLORS = ['#0057B7','#1D9E75','#7C3AED','#D4537E','#D97706','#0891B2','#DC2626','#059669','#7C3AED','#DB2777','#65A30D','#9333EA'];

export default function PageAnalytics({ state }) {
  const [year, setYear] = useState(state.currentYear);
  const students = state.students.filter(s => s.year === year);
  const activeClasses = state.classes.filter(c => c.active);

  const total = students.length;
  const classesWithStudents = new Set(students.map(s => s.cls)).size;
  const docs = students.reduce((a, s) => a + (s.docs || 0), 0);

  // По категоріях
  const byCat = state.categories.map(cat => ({
    ...cat,
    count: students.filter(s => s.catId === cat.id).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  // По класах — детально
  const byClass = activeClasses.map(c => {
    const list = students.filter(s => s.cls === c.name);
    if (!list.length) return null;
    const catBreakdown = state.categories.map(cat => ({
      ...cat,
      count: list.filter(s => s.catId === cat.id).length,
    })).filter(x => x.count > 0);
    return { cls: c.name, total: list.length, cats: catBreakdown };
  }).filter(Boolean).sort((a, b) => b.total - a.total);

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <h2 style={{ fontSize:16, fontWeight:700, fontFamily:'Unbounded, sans-serif' }}>Аналітика</h2>
        <Select value={year} onChange={setYear} style={{ width:'auto' }}>
          {state.years.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
        <StatCard label="Всього пільговиків" value={total} sub="по школі" icon="ti-users" color="#0057B7" />
        <StatCard label="Активних категорій" value={state.categories.length} icon="ti-tag" color="#7C3AED" />
        <StatCard label="Охоплено класів"    value={classesWithStudents} sub={`з ${activeClasses.length}`} icon="ti-school" color="#1D9E75" />
        <StatCard label="Документів на Drive" value={docs} icon="ti-files" color="#D97706" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {/* По категоріях */}
        <Card>
          <div style={{ padding:'14px 20px', borderBottom:'0.5px solid var(--border)', fontSize:13, fontWeight:600 }}>
            Розподіл за категоріями
          </div>
          <div style={{ padding:'16px 20px' }}>
            {byCat.length === 0
              ? <div style={{ color:'var(--text3)', fontSize:13, textAlign:'center', padding:'20px 0' }}>Даних немає</div>
              : byCat.map((item, i) => {
                  const pct = total > 0 ? (item.count / total) * 100 : 0;
                  const col = BAR_COLORS[i % BAR_COLORS.length];
                  return (
                    <div key={item.id} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
                        <span style={{ color:'var(--text2)', maxWidth:'82%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ fontWeight:700, color:col }}>{item.count}</span>
                      </div>
                      <div style={{ height:8, background:'var(--bg)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:col, borderRadius:4, transition:'width .5s ease' }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </Card>

        {/* По класах — компактно */}
        <Card>
          <div style={{ padding:'14px 20px', borderBottom:'0.5px solid var(--border)', fontSize:13, fontWeight:600 }}>
            Зведення по класах
          </div>
          <div style={{ overflowY:'auto', maxHeight:320 }}>
            {byClass.length === 0
              ? <div style={{ color:'var(--text3)', fontSize:13, textAlign:'center', padding:'30px 0' }}>Даних немає</div>
              : byClass.map(row => (
                  <div key={row.cls} style={{ padding:'10px 20px', borderBottom:'0.5px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{row.cls}</span>
                      <span style={{
                        background:'var(--ua-blue)', color:'#fff',
                        padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600,
                      }}>{row.total} учн{row.total === 1 ? 'ень' : row.total % 100 >= 11 && row.total % 100 <= 14 ? 'ів' : row.total % 10 >= 2 && row.total % 10 <= 4 ? 'і' : 'ів'}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {row.cats.map(cat => (
                        <div key={cat.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                          <span style={{ color:'var(--text2)', maxWidth:'82%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {cat.name}
                          </span>
                          <span style={{ fontWeight:600, color:'var(--text)', flexShrink:0, marginLeft:8 }}>{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            }
          </div>
        </Card>
      </div>

      {/* Детальна таблиця по класах */}
      <Card>
        <div style={{ padding:'14px 20px', borderBottom:'0.5px solid var(--border)', fontSize:13, fontWeight:600 }}>
          Детальна розбивка: клас × категорія
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                <th style={{ padding:'9px 14px', textAlign:'left', color:'var(--text3)', fontWeight:500, borderBottom:'0.5px solid var(--border)', position:'sticky', left:0, background:'var(--surface2)' }}>Клас</th>
                <th style={{ padding:'9px 14px', textAlign:'center', color:'var(--text3)', fontWeight:500, borderBottom:'0.5px solid var(--border)' }}>Всього</th>
                {state.categories.map(cat => (
                  <th key={cat.id} style={{ padding:'9px 10px', textAlign:'center', color:'var(--text3)', fontWeight:500, borderBottom:'0.5px solid var(--border)', fontSize:11, minWidth:80 }}>
                    {cat.name.length > 20 ? cat.name.slice(0,20)+'…' : cat.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byClass.map((row, i) => (
                <tr key={row.cls}
                  style={{ borderBottom: i < byClass.length-1 ? '0.5px solid var(--border)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'9px 14px', fontWeight:700, position:'sticky', left:0, background:'inherit' }}>{row.cls}</td>
                  <td style={{ padding:'9px 14px', textAlign:'center', fontWeight:700, color:'var(--ua-blue)' }}>{row.total}</td>
                  {state.categories.map(cat => {
                    const c = row.cats.find(x => x.id === cat.id);
                    return (
                      <td key={cat.id} style={{ padding:'9px 10px', textAlign:'center', color: c ? 'var(--text)' : 'var(--border2)', fontWeight: c ? 600 : 400 }}>
                        {c ? c.count : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {byClass.length > 0 && (
                <tr style={{ background:'var(--bg)', fontWeight:700 }}>
                  <td style={{ padding:'9px 14px', position:'sticky', left:0, background:'var(--bg)' }}>Разом</td>
                  <td style={{ padding:'9px 14px', textAlign:'center', color:'var(--ua-blue)' }}>{total}</td>
                  {state.categories.map(cat => {
                    const sum = students.filter(s => s.catId === cat.id).length;
                    return <td key={cat.id} style={{ padding:'9px 10px', textAlign:'center', color: sum ? 'var(--text)' : 'var(--border2)' }}>{sum || '—'}</td>;
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
