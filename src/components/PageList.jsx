import { useState } from 'react';
import { Badge, Card, Input, Select } from './UI';

export default function PageList({ state }) {
  const [search,     setSearch]     = useState('');
  const [filterCls,  setFilterCls]  = useState('');
  const [filterCat,  setFilterCat]  = useState('');
  const [filterYear, setFilterYear] = useState(state.currentYear);

  const filtered = state.students.filter(s => {
    const fullName = `${s.lastName} ${s.firstName} ${s.middleName}`.toLowerCase();
    const matchQ   = !search     || fullName.includes(search.toLowerCase());
    const matchC   = !filterCls  || s.cls === filterCls;
    const matchCat = !filterCat  || s.catId === parseInt(filterCat);
    const matchY   = s.year === filterYear;
    return matchQ && matchC && matchCat && matchY;
  });

  return (
    <div className="fade-up">
      <Card>
        <div style={{ padding:'14px 20px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{ fontSize:14, fontWeight:600 }}>Всі учні з пільговими категоріями</span>
            <span style={{ marginLeft:10, fontSize:12, color:'var(--text3)', background:'var(--bg)', padding:'2px 8px', borderRadius:20 }}>{filtered.length}</span>
          </div>
        </div>

        <div style={{ padding:'10px 20px', borderBottom:'0.5px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap', background:'var(--surface2)' }}>
          <Input value={search} onChange={setSearch} placeholder="🔍  Пошук за ПІБ..." style={{ maxWidth:220 }} />
          <Select value={filterCls} onChange={setFilterCls}>
            <option value="">Усі класи</option>
            {state.classes.filter(c => c.active).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </Select>
          <Select value={filterCat} onChange={setFilterCat}>
            <option value="">Усі категорії</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name.length > 50 ? c.name.slice(0,50)+'…' : c.name}</option>)}
          </Select>
          <Select value={filterYear} onChange={setFilterYear}>
            {state.years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Прізвище','Ім\'я','По батькові','Клас','Категорія','Документи','Примітка','Додано'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', color:'var(--text3)', fontWeight:500, fontSize:12, borderBottom:'0.5px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding:'30px', textAlign:'center', color:'var(--text3)' }}>Нічого не знайдено</td></tr>
              )}
              {filtered.map((s, i) => {
                const cat = state.categories.find(c => c.id === s.catId);
                return (
                  <tr key={s.id}
                    style={{ borderBottom: i < filtered.length-1 ? '0.5px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>{s.lastName}</td>
                    <td style={{ padding:'10px 14px' }}>{s.firstName}</td>
                    <td style={{ padding:'10px 14px' }}>{s.middleName}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ background:'var(--bg)', padding:'3px 8px', borderRadius:6, fontSize:12, fontWeight:600 }}>{s.cls}</span>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {cat && <Badge color={cat.color}>{cat.name.length > 30 ? cat.name.slice(0,30)+'…' : cat.name}</Badge>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12 }}>
                      {s.docs > 0
                        ? <span style={{ color:'var(--ua-blue)', display:'flex', alignItems:'center', gap:4 }}><i className="ti ti-file" /> {s.docs}</span>
                        : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:12 }}>{s.note || '—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text3)', fontSize:12, whiteSpace:'nowrap' }}>{s.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
