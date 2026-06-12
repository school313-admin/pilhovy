import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Btn, Card, Badge } from './UI';
import { apiSaveStudent } from '../data/api';
import { useGooglePicker } from './GooglePicker';

// Правильне відмінювання: 1 учень, 2-4 учні, 5+ учнів
function ukrStudents(n) {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} учнів`;
  if (lastOne === 1) return `${n} учень`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} учні`;
  return `${n} учнів`;
}
function groupByGrade(classes) {
  const map = {};
  classes.forEach(c => {
    const grade = parseInt(c.name);
    if (!map[grade]) map[grade] = [];
    map[grade].push(c);
  });
  const grades = Object.keys(map).map(Number).sort((a, b) => a - b);
  const groups = [];
  for (let i = 0; i < grades.length; i += 3) {
    const items = [];
    for (let j = i; j < i + 3 && j < grades.length; j++) {
      items.push(...map[grades[j]]);
    }
    groups.push({ items });
  }
  return groups;
}

export default function PageHome({ state, addStudent, deleteStudent, onModalChange, reload }) {
  const activeClasses = state.classes.filter(c => c.active);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Підраховуємо реально — реактивно від state.students
  const countFor = cls => state.students.filter(s => s.cls === cls && s.year === state.currentYear).length;

  const openForm  = () => { setShowForm(true);  onModalChange?.(true);  };
  const closeForm = () => { setShowForm(false); onModalChange?.(false); };

  useEffect(() => {
    const handler = e => {
      if (
        !e.target.closest('[data-class-grid]') &&
        !e.target.closest('[data-class-info]') &&
        !e.target.closest('[data-modal]')
      ) {
        setSelected(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const groups = groupByGrade(activeClasses);

  return (
    <div className="fade-up">
      <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
        Оберіть свій клас
      </div>

      <div data-class-grid style={{ marginBottom: 24 }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 10 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(9, 1fr)', gap:10 }}>
              {group.items.map(c => {
                const cnt   = countFor(c.name);
                const isSel = selected === c.name;
                return (
                  <button
                    key={c.name}
                    onMouseDown={e => { e.stopPropagation(); setSelected(isSel ? null : c.name); }}
                    style={{
                      minHeight: 80,
                      background: isSel ? 'linear-gradient(135deg, #0057B7 0%, #1A6ED4 100%)' : 'var(--surface)',
                      border: `1.5px solid ${isSel ? 'transparent' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 8px',
                      cursor: 'pointer', textAlign: 'center',
                      boxShadow: isSel ? '0 4px 16px rgba(0,87,183,.3)' : 'var(--shadow)',
                      transform: isSel ? 'translateY(-2px) scale(1.02)' : 'none',
                      transition: 'all .18s cubic-bezier(.22,1,.36,1)',
                    }}
                  >
                    <div style={{ fontSize:20, fontWeight:700, color: isSel ? '#fff' : 'var(--text)', fontFamily:'Unbounded, sans-serif', lineHeight:1, marginBottom:6 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize:11, fontWeight:500, color: isSel ? 'rgba(255,255,255,.75)' : cnt > 0 ? 'var(--ua-blue)' : 'var(--text3)' }}>
                      {cnt > 0 ? ukrStudents(cnt) : 'порожньо'}
                    </div>
                  </button>
                );
              })}
            </div>
            {gi < groups.length - 1 && (
              <div style={{ height:1, background:'var(--border)', margin:'10px 0 0' }} />
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="fade-up" data-class-info>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'8px 14px', boxShadow:'var(--shadow)' }}>
              <i className="ti ti-school" style={{ color:'var(--ua-blue)' }} />
              <span style={{ fontSize:14, fontWeight:600 }}>Клас {selected}</span>
            </div>
            <Btn onClick={openForm}>
              <i className="ti ti-plus" /> Додати учня
            </Btn>
          </div>
          <ClassStudentList
            students={state.students}
            cls={selected}
            year={state.currentYear}
            categories={state.categories}
            adminPassword={state.adminPassword}
            deleteStudent={deleteStudent}
            onModalChange={onModalChange}
          />
        </div>
      )}

      <StudentForm
        open={showForm}
        onClose={closeForm}
        cls={selected}
        categories={state.categories}
        year={state.currentYear}
        onSave={() => { closeForm(); reload(); }}
      />
    </div>
  );
}

// ---- Список учнів класу з видаленням ----
function ClassStudentList({ students, cls, year, categories, adminPassword, deleteStudent, onModalChange }) {
  const list = students.filter(s => s.cls === cls && s.year === year);

  // Стан видалення
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pinStep,      setPinStep]      = useState(false);
  const [pin,          setPin]          = useState('');
  const [pinError,     setPinError]     = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  const openDelete = (s) => {
    setDeleteTarget(s);
    setPinStep(true);
    setPin('');
    setPinError(false);
    setDeleteError('');
    onModalChange?.(true);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setPinStep(false);
    setPin('');
    setPinError(false);
    setDeleteError('');
    setDeleting(false);
    onModalChange?.(false);
  };

  const confirmDelete = async () => {
    if (pin !== adminPassword) { setPinError(true); setPin(''); return; }
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteStudent(deleteTarget.id, deleteTarget.folderId);
      closeDelete();
    } catch(err) {
      setDeleteError('Помилка: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (!list.length) return (
    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)', fontSize:13, background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'0.5px solid var(--border)' }}>
      <i className="ti ti-user-off" style={{ fontSize:32, display:'block', marginBottom:10, opacity:.4 }} />
      Учнів з пільговими категоріями не додано
    </div>
  );

  return (
    <>
      <Card>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Прізвище',"Ім'я",'По батькові','Категорія','Документи','Drive','Додано',''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'var(--text3)', fontWeight:500, fontSize:12, borderBottom:'0.5px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const cat = categories.find(c => c.id === s.catId);
                return (
                  <tr key={s.id}
                    style={{ borderBottom: i < list.length - 1 ? '0.5px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>{s.lastName}</td>
                    <td style={{ padding:'10px 14px' }}>{s.firstName}</td>
                    <td style={{ padding:'10px 14px' }}>{s.middleName}</td>
                    <td style={{ padding:'10px 14px' }}>
                      {cat && <Badge color={cat.color}>{cat.name.length > 35 ? cat.name.slice(0,35)+'…' : cat.name}</Badge>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12 }}>
                      {s.docs > 0 ? <span style={{ color:'var(--ua-blue)', display:'flex', alignItems:'center', gap:4 }}><i className="ti ti-file" /> {s.docs}</span> : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12 }}>
                      {s.folderUrl
                        ? <a href={s.folderUrl} target="_blank" rel="noopener noreferrer" style={{ color:'var(--ua-blue)', display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}><i className="ti ti-brand-google-drive" /> Відкрити</a>
                        : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ padding:'10px 14px', color:'var(--text3)', fontSize:12, whiteSpace:'nowrap' }}>{s.createdAt}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right' }}>
                      <button
                        onClick={() => openDelete(s)}
                        title="Видалити учня"
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:15, padding:'4px 6px', borderRadius:6, transition:'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Модалка видалення з PIN */}
      {pinStep && deleteTarget && createPortal(
        <div data-modal style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, pointerEvents:'auto' }}
          onClick={closeDelete}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', boxShadow:'0 24px 60px rgba(0,0,0,.18)', maxWidth:380, width:'100%', padding:'28px 24px', textAlign:'center', animation:'fadeUp .2s cubic-bezier(.22,1,.36,1)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Видалити учня?</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20, lineHeight:1.6 }}>
              <strong>{[deleteTarget.lastName, deleteTarget.firstName, deleteTarget.middleName].filter(Boolean).join(' ')}</strong><br/>
              Введіть пароль адміністратора для підтвердження
            </div>
            <input
              type="password" value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === 'Enter' && confirmDelete()}
              placeholder="••••••"
              autoFocus
              style={{
                padding:'10px 16px', borderRadius:'var(--radius-sm)', fontSize:16,
                border:`2px solid ${pinError ? 'var(--danger)' : 'var(--border2)'}`,
                background:'var(--surface)', color:'var(--text)',
                letterSpacing:4, width:160, textAlign:'center', outline:'none',
                marginBottom:8, display:'block', margin:'0 auto 8px',
              }}
            />
            {pinError && <div style={{ fontSize:12, color:'var(--danger)', marginBottom:12 }}>Невірний пароль</div>}
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16 }}>
              <button onClick={confirmDelete} disabled={deleting}
                style={{ padding:'9px 20px', borderRadius:'var(--radius-sm)', background: deleting ? '#F87171' : 'var(--danger)', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:6 }}>
                {deleting
                  ? <><i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Видалення...</>
                  : <><i className="ti ti-trash" /> Видалити</>
                }
              </button>
              <button onClick={closeDelete} disabled={deleting}
                style={{ padding:'9px 16px', borderRadius:'var(--radius-sm)', background:'transparent', color:'var(--text2)', border:'1px solid var(--border)', fontSize:13, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                Скасувати
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ---- Форма додавання учня ----
function StudentForm({ open, onClose, cls, categories, year, onSave }) {
  const [lastName,   setLastName]   = useState('');
  const [firstName,  setFirstName]  = useState('');
  const [middleName, setMiddleName] = useState('');
  const [catId,      setCatId]      = useState('');
  const [note,       setNote]       = useState('');
  const [files,      setFiles]      = useState([]);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');
  const [uploadStep, setUploadStep] = useState('');

  const { uploadFiles } = useGooglePicker();

  const validate = () => {
    const e = {};
    if (!lastName.trim())   e.lastName  = true;
    if (!firstName.trim())  e.firstName = true;
    if (!catId)             e.catId     = true;
    if (files.length === 0) e.files     = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => {
    setLastName(''); setFirstName(''); setMiddleName('');
    setCatId(''); setNote(''); setFiles([]); setErrors({});
    setSaveError(''); setUploadStep('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    const cat = categories.find(c => c.id === parseInt(catId));

    try {
      // Крок 1: створюємо запис і папку через GAS
      setUploadStep('Створюємо папку на Drive...');
      const result = await apiSaveStudent({
        lastName:   lastName.trim(),
        firstName:  firstName.trim(),
        middleName: middleName.trim(),
        catId:      parseInt(catId),
        category:   cat?.name || '',
        note,
        cls,
        year,
        filesCount: files.length,
      });

      // Крок 2: завантажуємо файли напряму через Google Drive API
      if (files.length > 0 && result.folderId) {
        setUploadStep('Завантажуємо документи...');
        await uploadFiles(files, result.folderId);
      }

      setUploadStep('');
      onSave({
        lastName:   lastName.trim(),
        firstName:  firstName.trim(),
        middleName: middleName.trim(),
        catId:      parseInt(catId),
        note,
        docs:       files.length,
        folderUrl:  result.folderUrl,
        folderId:   result.folderId,
        year,
        cls,
        id:         result.id,
        createdAt:  result.createdAt,
      });
      reset();
    } catch(err) {
      setSaveError('Помилка: ' + err.message);
      setUploadStep('');
    } finally {
      setSaving(false);
    }
  };

  const handleFileDrop  = e => { e.preventDefault(); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); if (errors.files) setErrors(p => ({...p,files:false})); };
  const handleFileInput = e => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); if (errors.files) setErrors(p => ({...p,files:false})); };

  if (!open) return null;

  const modal = (
    <div data-modal style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px 40px', pointerEvents:'auto' }}
      onClick={handleClose}>
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', boxShadow:'0 24px 60px rgba(0,0,0,.18)', width:'100%', maxWidth:720, animation:'fadeUp .22s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ padding:'18px 24px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:'Unbounded, sans-serif' }}>Додати учня</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>Клас {cls} · {year}</div>
          </div>
          <button onClick={handleClose} style={{ background:'var(--surface2)', border:'none', cursor:'pointer', color:'var(--text3)', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:20 }}>
          {/* ПІБ */}
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>ПІБ дитини</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {[
                { label:'Прізвище',    val:lastName,   set:setLastName,   key:'lastName',   ph:'Іваненко', req:true },
                { label:"Ім'я",        val:firstName,  set:setFirstName,  key:'firstName',  ph:'Іван',     req:true },
                { label:'По батькові', val:middleName, set:setMiddleName, key:'middleName', ph:'Петрович', req:false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>
                    {f.label}{f.req && <span style={{ color:'var(--danger)' }}> *</span>}
                  </label>
                  <input value={f.val}
                    onChange={e => { f.set(e.target.value); if(errors[f.key]) setErrors(p => ({...p,[f.key]:false})); }}
                    placeholder={f.ph}
                    style={{ padding:'9px 12px', borderRadius:'var(--radius-sm)', width:'100%', border:`1.5px solid ${errors[f.key] ? 'var(--danger)' : 'var(--border2)'}`, background:'var(--surface)', color:'var(--text)', fontSize:13 }}
                    onFocus={e => e.target.style.borderColor = errors[f.key] ? 'var(--danger)' : 'var(--ua-blue)'}
                    onBlur={e  => e.target.style.borderColor = errors[f.key] ? 'var(--danger)' : 'var(--border2)'}
                  />
                  {errors[f.key] && <span style={{ fontSize:11, color:'var(--danger)', marginTop:3, display:'block' }}>Обов'язкове поле</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Категорія */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>
              Пільгова категорія <span style={{ color:'var(--danger)' }}>*</span>
            </label>
            <select value={catId} onChange={e => { setCatId(e.target.value); if(errors.catId) setErrors(p => ({...p,catId:false})); }}
              style={{ padding:'10px 13px', borderRadius:'var(--radius-sm)', width:'100%', border:`1.5px solid ${errors.catId ? 'var(--danger)' : 'var(--border2)'}`, background:'var(--surface)', fontSize:13, color: catId ? 'var(--text)' : 'var(--text3)' }}>
              <option value="">— оберіть категорію —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.catId && <span style={{ fontSize:11, color:'var(--danger)', marginTop:3, display:'block' }}>Оберіть категорію</span>}
          </div>

          {/* Документи + примітка */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>
                Скан-копії документів <span style={{ color:'var(--danger)' }}>*</span>
              </label>
              <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}
                onClick={() => document.getElementById('fileInput').click()}
                style={{ border:`2px dashed ${errors.files ? 'var(--danger)' : files.length > 0 ? 'var(--ua-blue)' : 'var(--border2)'}`, borderRadius:'var(--radius)', padding:'22px 16px', textAlign:'center', color: files.length > 0 ? 'var(--ua-blue)' : 'var(--text3)', fontSize:13, cursor:'pointer', background: files.length > 0 ? '#EEF5FF' : 'var(--surface2)', minHeight:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                <input id="fileInput" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInput} style={{ display:'none' }} />
                <i className={`ti ${files.length > 0 ? 'ti-files' : 'ti-upload'}`} style={{ fontSize:26 }} />
                {files.length > 0
                  ? <><strong>{files.length} файл{files.length === 1 ? '' : files.length < 5 ? 'и' : 'ів'}</strong><span style={{ fontSize:11 }}>{files.map(f=>f.name).join(', ')}</span></>
                  : <><span>Перетягніть або натисніть</span><span style={{ fontSize:11 }}>PDF, JPG, PNG — до 10 МБ</span></>
                }
              </div>
              {errors.files && <span style={{ fontSize:11, color:'var(--danger)', marginTop:3, display:'block' }}>Додайте хоча б один документ</span>}
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>Примітка</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Додаткова інформація..." rows={4}
                style={{ padding:'10px 12px', borderRadius:'var(--radius-sm)', width:'100%', border:'1.5px solid var(--border2)', background:'var(--surface)', color:'var(--text)', fontSize:13, resize:'vertical', fontFamily:'inherit', minHeight:110 }} />
            </div>
          </div>

          {/* Кнопки */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:'var(--radius-sm)', background: saving ? '#6B9FD4' : 'linear-gradient(135deg,#0057B7,#1A6ED4)', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', boxShadow:'0 2px 10px rgba(0,87,183,.3)', fontFamily:'inherit' }}>
                {saving
                  ? <><i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> {uploadStep || 'Збереження...'}</>
                  : <><i className="ti ti-brand-google-drive" /> Зберегти на Drive</>
                }
              </button>
              <button onClick={handleClose} disabled={saving}
                style={{ padding:'10px 20px', borderRadius:'var(--radius-sm)', background:'transparent', color:'var(--text2)', border:'1px solid var(--border)', fontSize:14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                Скасувати
              </button>
            </div>
            {saveError && <div style={{ fontSize:12, color:'var(--danger)', display:'flex', alignItems:'center', gap:6 }}><i className="ti ti-alert-circle" /> {saveError}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
