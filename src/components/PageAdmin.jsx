import { useState } from 'react';
import { Btn, Card, CardHeader, Input, Modal, Confirm } from './UI';
import * as XLSX from 'xlsx';

export default function PageAdmin({ state, setClassActive, deleteClass, addClass, addCategory, updateCategory, deleteCategory, addYear, setCurrentYear, deleteYear, setAdminPassword }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const checkPin = () => {
    if (pin === state.adminPassword) { setUnlocked(true); setPinError(false); }
    else { setPinError(true); setPin(''); }
  };

  if (!unlocked) return <LockScreen pin={pin} setPin={setPin} onCheck={checkPin} error={pinError} />;
  return (
    <AdminContent
      state={state}
      onLock={() => { setUnlocked(false); setPin(''); }}
      setClassActive={setClassActive}
      deleteClass={deleteClass}
      addClass={addClass}
      addCategory={addCategory}
      updateCategory={updateCategory}
      deleteCategory={deleteCategory}
      addYear={addYear}
      setCurrentYear={setCurrentYear}
      deleteYear={deleteYear}
      setAdminPassword={setAdminPassword}
    />
  );
}

function LockScreen({ pin, setPin, onCheck, error }) {
  return (
    <div className="fade-up" style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:420, gap:16,
    }}>
      <div style={{
        width:72, height:72, borderRadius:'50%',
        background:'linear-gradient(135deg, #0057B7, #1A6ED4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:30, color:'#fff',
        boxShadow:'0 8px 24px rgba(0,87,183,.3)',
      }}>
        <i className="ti ti-lock" />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:18, fontWeight:700, fontFamily:'Unbounded, sans-serif', marginBottom:6 }}>
          Адміністративна панель
        </div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>Введіть пароль для доступу</div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <input
          type="password" value={pin}
          onChange={e => { setPin(e.target.value); }}
          onKeyDown={e => e.key === 'Enter' && onCheck()}
          placeholder="••••••"
          style={{
            padding:'11px 18px', borderRadius:'var(--radius-sm)', fontSize:18,
            border:`2px solid ${error ? 'var(--danger)' : 'var(--border2)'}`,
            background:'var(--surface)', color:'var(--text)',
            letterSpacing:6, width:160, textAlign:'center', outline:'none',
            boxShadow:'var(--shadow)',
          }}
        />
        <Btn onClick={onCheck} size="lg"><i className="ti ti-arrow-right" /></Btn>
      </div>
      {error && (
        <div style={{ color:'var(--danger)', fontSize:13, display:'flex', alignItems:'center', gap:5 }}>
          <i className="ti ti-alert-circle" /> Невірний пароль
        </div>
      )}
    </div>
  );
}

function AdminContent({ state, onLock, setClassActive, deleteClass, addClass, addCategory, updateCategory, deleteCategory, addYear, setCurrentYear, deleteYear, setAdminPassword }) {
  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <i className="ti ti-shield-check" style={{ color:'var(--success)', fontSize:18 }} />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:'Unbounded, sans-serif' }}>Адміністративна панель</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Керування системою</div>
          </div>
        </div>
        <Btn variant="ghost" size="sm" onClick={onLock}><i className="ti ti-lock" /> Вийти</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <ClassManager state={state} setClassActive={setClassActive} deleteClass={deleteClass} addClass={addClass} />
        <CategoryManager state={state} addCategory={addCategory} deleteCategory={deleteCategory} />
        <ExportManager state={state} />
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <YearManager state={state} addYear={addYear} setCurrentYear={setCurrentYear} deleteYear={deleteYear} />
          <PasswordManager state={state} setAdminPassword={setAdminPassword} />
          <DriveStatus />
        </div>
      </div>
    </div>
  );
}

/* ---- Класи ---- */
function ClassManager({ state, setClassActive, deleteClass, addClass }) {
  const [filter,   setFilter]   = useState('all');
  const [newName,  setNewName]  = useState('');
  const [confirm,  setConfirm]  = useState(null);
  const [dupError, setDupError] = useState(false);

  const studentCount = name => state.students.filter(s => s.cls === name && s.year === state.currentYear).length;

  const filtered = state.classes.filter(c =>
    filter === 'all' ? true : filter === 'active' ? c.active : !c.active
  );
  const counts = {
    all:      state.classes.length,
    active:   state.classes.filter(c => c.active).length,
    inactive: state.classes.filter(c => !c.active).length,
  };

  const handleAdd = () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    if (state.classes.find(c => c.name === name)) { setDupError(true); return; }
    addClass(name); setNewName(''); setDupError(false);
  };

  const doConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'deactivate') setClassActive(confirm.name, false);
    if (confirm.type === 'delete')     deleteClass(confirm.name);
    setConfirm(null);
  };

  return (
    <Card>
      <CardHeader title="Класи" subtitle="Деактивовані класи не відображаються вчителям" />
      <div style={{ padding:'10px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', gap:5 }}>
        {['all','active','inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer',
            border:'0.5px solid var(--border)',
            background: filter === f ? 'var(--ua-blue)' : 'transparent',
            color:       filter === f ? '#fff' : 'var(--text2)',
            transition:'all .15s',
          }}>
            {f === 'all' ? 'Всі' : f === 'active' ? 'Активні' : 'Деактивовані'} {counts[f]}
          </button>
        ))}
      </div>
      <div style={{ overflowY:'auto', maxHeight:280 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ background:'var(--surface2)' }}>
              {['Клас','Статус','Учнів',''].map(h => (
                <th key={h} style={{ padding:'7px 12px', textAlign:'left', color:'var(--text3)', fontWeight:500, borderBottom:'0.5px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const cnt = studentCount(c.name);
              return (
                <tr key={c.name}
                  style={{ borderBottom: i < filtered.length-1 ? '0.5px solid var(--border)' : 'none', opacity: c.active ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'7px 12px', fontWeight:700 }}>{c.name}</td>
                  <td style={{ padding:'7px 12px' }}>
                    <span style={{
                      fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:500,
                      background: c.active ? '#D6EDBE' : 'var(--bg)',
                      color:       c.active ? '#2C5609' : 'var(--text3)',
                    }}>
                      {c.active ? 'Активний' : 'Деактивовано'}
                    </span>
                  </td>
                  <td style={{ padding:'7px 12px', fontWeight: cnt > 0 ? 700 : 400, color: cnt > 0 ? 'var(--ua-blue)' : 'var(--text3)' }}>{cnt}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>
                    <div style={{ display:'flex', gap:5, justifyContent:'flex-end' }}>
                      {c.active
                        ? <Btn variant="danger"  size="sm" onClick={() => setConfirm({ type:'deactivate', name:c.name })}><i className="ti ti-eye-off" /></Btn>
                        : <Btn variant="success" size="sm" onClick={() => setClassActive(c.name, true)}><i className="ti ti-eye" /></Btn>
                      }
                      <button
                        disabled={cnt > 0}
                        onClick={() => cnt === 0 && setConfirm({ type:'delete', name:c.name })}
                        title={cnt > 0 ? 'Є учні — не можна видалити' : 'Видалити клас'}
                        style={{
                          background:'none', border:'none', padding:'4px 6px', borderRadius:6,
                          cursor: cnt > 0 ? 'not-allowed' : 'pointer',
                          color:   cnt > 0 ? 'var(--border2)' : 'var(--danger)',
                          fontSize:15,
                        }}>
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding:'12px 16px', borderTop:'0.5px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
        <input value={newName} onChange={e => { setNewName(e.target.value); setDupError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Напр.: 5-Г"
          style={{
            padding:'7px 10px', borderRadius:'var(--radius-sm)', fontSize:13, width:100,
            border:`1px solid ${dupError ? 'var(--danger)' : 'var(--border2)'}`,
            background:'var(--surface)', color:'var(--text)',
          }} />
        <Btn size="sm" onClick={handleAdd}><i className="ti ti-plus" /> Додати</Btn>
        {dupError && <span style={{ fontSize:11, color:'var(--danger)' }}>Вже існує</span>}
      </div>
      <Confirm
        open={!!confirm}
        title={confirm?.type === 'deactivate' ? `Деактивувати ${confirm?.name}?` : `Видалити ${confirm?.name}?`}
        message={confirm?.type === 'deactivate'
          ? `Клас ${confirm?.name} буде прихований від вчителів. Дані збережуться.`
          : `Клас ${confirm?.name} буде видалений назавжди.`}
        confirmLabel={confirm?.type === 'deactivate' ? 'Деактивувати' : 'Видалити'}
        onConfirm={doConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Card>
  );
}

/* ---- Категорії (без скорочень) ---- */
function CategoryManager({ state, addCategory, deleteCategory }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [confirm, setConfirm]   = useState(null);

  const colors = ['blue','green','teal','amber','pink','purple'];

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name:newName.trim(), color:newColor });
    setNewName(''); setNewColor('blue'); setShowAdd(false);
  };

  return (
    <Card>
      <CardHeader title="Пільгові категорії" action={
        <Btn size="sm" onClick={() => setShowAdd(true)}><i className="ti ti-plus" /> Додати</Btn>
      } />
      <div style={{ overflowY:'auto', maxHeight:340, padding:'4px 0' }}>
        {state.categories.map((cat, i) => (
          <div key={cat.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 16px',
            borderBottom: i < state.categories.length-1 ? '0.5px solid var(--border)' : 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:
                cat.color === 'blue' ? '#0057B7' : cat.color === 'green' ? '#16A34A' :
                cat.color === 'teal' ? '#0891B2' : cat.color === 'amber' ? '#D97706' :
                cat.color === 'pink' ? '#DB2777' : '#7C3AED', flexShrink:0 }} />
              <span style={{ fontSize:13, color:'var(--text)' }}>{cat.name}</span>
            </div>
            <button onClick={() => setConfirm(cat.id)} style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text3)', fontSize:15, padding:'4px 6px', borderRadius:6, flexShrink:0,
            }}
              onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        ))}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Нова пільгова категорія" maxWidth={440}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>Назва категорії *</label>
            <Input value={newName} onChange={setNewName} placeholder="Повна назва категорії" />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:8 }}>Колір мітки</label>
            <div style={{ display:'flex', gap:8 }}>
              {colors.map(col => {
                const bg = col === 'blue' ? '#0057B7' : col === 'green' ? '#16A34A' :
                  col === 'teal' ? '#0891B2' : col === 'amber' ? '#D97706' :
                  col === 'pink' ? '#DB2777' : '#7C3AED';
                return (
                  <button key={col} onClick={() => setNewColor(col)} style={{
                    width:28, height:28, borderRadius:'50%', background:bg,
                    border: newColor === col ? '3px solid var(--text)' : '3px solid transparent',
                    cursor:'pointer', transition:'border .15s',
                  }} />
                );
              })}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <Btn onClick={handleAdd} disabled={!newName.trim()}>Зберегти</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Скасувати</Btn>
          </div>
        </div>
      </Modal>
      <Confirm
        open={!!confirm}
        title="Видалити категорію?"
        message="Категорія буде видалена. Записи учнів, що мають цю категорію, залишаться."
        confirmLabel="Видалити"
        onConfirm={() => { deleteCategory(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </Card>
  );
}

/* ---- Експорт Excel ---- */
function ExportManager({ state }) {
  const [year,   setYear]   = useState(state.currentYear);
  const [clsF,   setClsF]   = useState('');
  const [catF,   setCatF]   = useState('');

  const filtered = state.students.filter(s => {
    const matchY   = s.year === year;
    const matchCls = !clsF || s.cls === clsF;
    const matchCat = !catF || s.catId === parseInt(catF);
    return matchY && matchCls && matchCat;
  });

  const handleExport = () => {
    const rows = filtered.map(s => {
      const cat = state.categories.find(c => c.id === s.catId);
      return {
        'Прізвище':           s.lastName   || '',
        "Ім'я":               s.firstName  || '',
        'По батькові':        s.middleName || '',
        'Клас':               s.cls,
        'Пільгова категорія': cat?.name    || '',
        'Документів':         s.docs       || 0,
        'Документи (Drive)':  s.folderUrl  || '',
        'Примітка':           s.note       || '',
        'Дата внесення':      s.createdAt,
        'Навч. рік':          s.year,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    // Ширина колонок
    ws['!cols'] = [
      {wch:20},{wch:15},{wch:20},{wch:8},{wch:55},{wch:12},{wch:45},{wch:25},{wch:14},{wch:12}
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Пільговики');
    XLSX.writeFile(wb, `pilhovy_${year.replace('–','-')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader title="Експорт у Excel" subtitle="Вивантажити дані у .xlsx файл" />
      <div style={{ padding:'16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>Навчальний рік</label>
            <select value={year} onChange={e => setYear(e.target.value)} style={{
              padding:'8px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border2)',
              background:'var(--surface)', color:'var(--text)', fontSize:13, width:'100%',
            }}>
              {state.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>Клас</label>
            <select value={clsF} onChange={e => setClsF(e.target.value)} style={{
              padding:'8px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border2)',
              background:'var(--surface)', color:'var(--text)', fontSize:13, width:'100%',
            }}>
              <option value="">Усі класи</option>
              {state.classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>Категорія</label>
            <select value={catF} onChange={e => setCatF(e.target.value)} style={{
              padding:'8px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border2)',
              background:'var(--surface)', color:'var(--text)', fontSize:13, width:'100%',
            }}>
              <option value="">Усі категорії</option>
              {state.categories.map(c => <option key={c.id} value={c.id}>{c.name.length > 55 ? c.name.slice(0,55)+'…' : c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{
          background:'var(--surface2)', borderRadius:'var(--radius-sm)', padding:'10px 14px',
          fontSize:12, color:'var(--text2)', marginBottom:14,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <i className="ti ti-info-circle" style={{ color:'var(--ua-blue)' }} />
          Буде вивантажено <strong style={{ color:'var(--text)' }}>{filtered.length} записів</strong>
        </div>

        <Btn onClick={handleExport} disabled={filtered.length === 0}>
          <i className="ti ti-file-spreadsheet" /> Завантажити .xlsx
        </Btn>
      </div>
    </Card>
  );
}

/* ---- Роки ---- */
function YearManager({ state, addYear, setCurrentYear, deleteYear }) {
  const [newY,    setNewY]    = useState('');
  const [confirm, setConfirm] = useState(null);
  const [dupErr,  setDupErr]  = useState(false);

  const handleAdd = () => {
    const y = newY.trim();
    if (!y) return;
    if (state.years.includes(y)) { setDupErr(true); return; }
    addYear(y); setNewY(''); setDupErr(false);
  };

  const studentsInYear = (y) => state.students.filter(s => s.year === y).length;

  return (
    <Card>
      <CardHeader title="Навчальні роки" />
      <div style={{ padding:'8px 16px' }}>
        {state.years.map((y, i) => {
          const isCurrent = y === state.currentYear;
          const cnt = studentsInYear(y);
          return (
            <div key={y} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'9px 0',
              borderBottom: i < state.years.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--ua-blue)' : 'var(--text)' }}>
                  {y}
                </span>
                {cnt > 0 && (
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{cnt} учн{cnt === 1 ? 'ень' : cnt % 100 >= 11 && cnt % 100 <= 14 ? 'ів' : cnt % 10 >= 2 && cnt % 10 <= 4 ? 'і' : 'ів'}</span>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {isCurrent
                  ? <span style={{ fontSize:11, background:'#D6EDBE', color:'#2C5609', padding:'2px 10px', borderRadius:20, fontWeight:500 }}>поточний</span>
                  : <button onClick={() => setCurrentYear(y)} style={{
                      fontSize:11, background:'var(--bg)', color:'var(--ua-blue)',
                      border:'0.5px solid var(--border)', padding:'3px 10px', borderRadius:20,
                      cursor:'pointer', fontWeight:500, fontFamily:'inherit',
                    }}>
                      Зробити поточним
                    </button>
                }
                <button
                  onClick={() => setConfirm(y)}
                  disabled={state.years.length <= 1}
                  title={state.years.length <= 1 ? 'Не можна видалити єдиний рік' : cnt > 0 ? `Буде видалено разом з ${cnt} записами` : 'Видалити рік'}
                  style={{
                    background:'none', border:'none', padding:'4px 6px', borderRadius:6,
                    cursor: state.years.length <= 1 ? 'not-allowed' : 'pointer',
                    color: state.years.length <= 1 ? 'var(--border2)' : 'var(--text3)',
                    fontSize:15, transition:'color .15s',
                  }}
                  onMouseEnter={e => { if (state.years.length > 1) e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = state.years.length <= 1 ? 'var(--border2)' : 'var(--text3)'; }}
                >
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ display:'flex', gap:8, marginTop:12, alignItems:'center' }}>
          <input
            value={newY}
            onChange={e => { setNewY(e.target.value); setDupErr(false); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="2027–2028"
            style={{
              padding:'7px 10px', borderRadius:'var(--radius-sm)', fontSize:13,
              border:`1px solid ${dupErr ? 'var(--danger)' : 'var(--border2)'}`,
              background:'var(--surface)', color:'var(--text)', width:120,
            }}
          />
          <Btn size="sm" onClick={handleAdd}><i className="ti ti-plus" /> Додати</Btn>
          {dupErr && <span style={{ fontSize:11, color:'var(--danger)' }}>Вже існує</span>}
        </div>
      </div>

      <Confirm
        open={!!confirm}
        title={`Видалити ${confirm}?`}
        message={
          studentsInYear(confirm) > 0
            ? `Цей рік містить ${studentsInYear(confirm)} записів учнів. Усі вони будуть видалені разом з роком. Цю дію не можна скасувати.`
            : `Рік ${confirm} буде видалений. Цю дію не можна скасувати.`
        }
        confirmLabel="Видалити"
        onConfirm={() => { deleteYear(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </Card>
  );
}

/* ---- Зміна паролю ---- */
function PasswordManager({ state, setAdminPassword }) {
  const [oldPwd,  setOldPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleChange = async () => {
    setError(''); setSuccess(false);
    if (oldPwd !== state.adminPassword) { setError('Невірний поточний пароль'); return; }
    if (newPwd.length < 4)              { setError('Новий пароль — мінімум 4 символи'); return; }
    if (newPwd !== newPwd2)             { setError('Паролі не співпадають'); return; }
    setSaving(true);
    try {
      await setAdminPassword(newPwd);
      setOldPwd(''); setNewPwd(''); setNewPwd2('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch(err) {
      setError('Помилка: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, val, set, ph) => (
    <div>
      <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>{label}</label>
      <input type="password" value={val} onChange={e => { set(e.target.value); setError(''); setSuccess(false); }}
        placeholder={ph}
        style={{ padding:'8px 10px', borderRadius:'var(--radius-sm)', width:'100%', border:'1px solid var(--border2)', background:'var(--surface)', color:'var(--text)', fontSize:13 }} />
    </div>
  );

  return (
    <Card>
      <CardHeader title="Зміна паролю" subtitle="Пароль для адмін-панелі та видалення учнів" />
      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
        {field('Поточний пароль', oldPwd, setOldPwd, '••••••')}
        {field('Новий пароль', newPwd, setNewPwd, '••••••')}
        {field('Повторіть новий', newPwd2, setNewPwd2, '••••••')}
        {error   && <div style={{ fontSize:12, color:'var(--danger)', display:'flex', alignItems:'center', gap:5 }}><i className="ti ti-alert-circle" /> {error}</div>}
        {success && <div style={{ fontSize:12, color:'var(--success)', display:'flex', alignItems:'center', gap:5 }}><i className="ti ti-circle-check" /> Пароль успішно змінено</div>}
        <Btn size="sm" onClick={handleChange} disabled={saving} style={{ marginTop:4 }}>
          {saving ? <><i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Збереження...</> : <><i className="ti ti-key" /> Змінити пароль</>}
        </Btn>
      </div>
    </Card>
  );
}

/* ---- Drive ---- */
function DriveStatus() {
  return (
    <Card>
      <CardHeader title="Google Drive" />
      <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)' }} />
          <span style={{ color:'var(--success)', fontWeight:600 }}>Підключено</span>
        </div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>
          <span style={{ color:'var(--text3)' }}>Папка: </span>
          <span style={{ fontWeight:500 }}>Пільгові категорії (Автоматизована система)</span>
        </div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>
          <span style={{ color:'var(--text3)' }}>Акаунт: </span>
          <span style={{ fontWeight:500 }}>artschool313@gmail.com</span>
        </div>
        <a href="#" style={{ fontSize:13, color:'var(--ua-blue)', display:'inline-flex', alignItems:'center', gap:5, textDecoration:'none', marginTop:2 }}>
          <i className="ti ti-external-link" /> Відкрити Drive
        </a>
      </div>
    </Card>
  );
}
