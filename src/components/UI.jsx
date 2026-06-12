import { createPortal } from 'react-dom';
import { COLOR_MAP } from '../data/constants';

export function Btn({ children, variant='primary', size='md', onClick, disabled, style }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6,
    border:'none', borderRadius:'var(--radius-sm)',
    fontFamily:'inherit', fontWeight:500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition:'all .15s',
  };
  const sizes = {
    sm: { padding:'5px 12px', fontSize:12 },
    md: { padding:'9px 18px', fontSize:13 },
    lg: { padding:'11px 24px', fontSize:14 },
  };
  const variants = {
    primary:   { background:'var(--ua-blue)', color:'#fff', boxShadow:'0 2px 8px rgba(0,87,183,.25)' },
    secondary: { background:'var(--surface2)', color:'var(--text2)', border:'0.5px solid var(--border)' },
    danger:    { background:'var(--danger-bg)', color:'var(--danger)', border:'0.5px solid #FCA5A5' },
    ghost:     { background:'transparent', color:'var(--text2)', border:'0.5px solid var(--border)' },
    success:   { background:'var(--success-bg)', color:'var(--success)', border:'0.5px solid #86EFAC' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({ color='blue', children }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:20,
      fontSize:11, fontWeight:500, background:c.bg, color:c.text, whiteSpace:'nowrap',
    }}>{children}</span>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background:'var(--surface)', borderRadius:'var(--radius-lg)',
      border:'0.5px solid var(--border)', boxShadow:'var(--shadow)', ...style
    }}>{children}</div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{
      padding:'16px 20px', borderBottom:'0.5px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type='text', style, required }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      style={{
        padding:'9px 13px', borderRadius:'var(--radius-sm)',
        border:'1px solid var(--border2)', background:'var(--surface)',
        color:'var(--text)', fontSize:13, width:'100%',
        transition:'border-color .15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor='var(--ua-blue)'}
      onBlur={e => e.target.style.borderColor='var(--border2)'}
    />
  );
}

export function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        padding:'9px 12px', borderRadius:'var(--radius-sm)',
        border:'1px solid var(--border2)', background:'var(--surface)',
        color: value ? 'var(--text)' : 'var(--text3)',
        fontSize:13, ...style,
      }}>
      {children}
    </select>
  );
}

export function Modal({ open, onClose, title, children, maxWidth=520 }) {
  if (!open) return null;
  return createPortal(
    <div
      style={{
        position:'fixed', inset:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:1000, padding:16,
        animation:'fadeIn .2s ease',
        pointerEvents:'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background:'var(--surface)', borderRadius:'var(--radius-lg)',
          boxShadow:'var(--shadow-lg)', width:'100%', maxWidth,
          animation:'fadeUp .22s cubic-bezier(.22,1,.36,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding:'16px 20px', borderBottom:'0.5px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span style={{ fontSize:15, fontWeight:600 }}>{title}</span>
          <button onClick={onClose} style={{
            background:'var(--surface2)', border:'none', cursor:'pointer',
            color:'var(--text3)', fontSize:16, width:28, height:28,
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div style={{ padding:'20px' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function Confirm({ open, title, message, onConfirm, onCancel, confirmLabel='Підтвердити', variant='danger' }) {
  if (!open) return null;
  return createPortal(
    <div style={{
      position:'fixed', inset:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1100, padding:16, pointerEvents:'auto',
    }}>
      <div style={{
        background:'var(--surface)', borderRadius:'var(--radius-lg)',
        boxShadow:'var(--shadow-lg)', maxWidth:340, width:'100%',
        padding:'28px 24px', textAlign:'center',
        animation:'fadeUp .2s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ fontSize:28, marginBottom:12 }}>
          {variant === 'danger' ? '⚠️' : '✅'}
        </div>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:22 }}>{message}</div>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <Btn variant={variant} onClick={onConfirm}>{confirmLabel}</Btn>
          <Btn variant="ghost" onClick={onCancel}>Скасувати</Btn>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:11, fontWeight:600, color:'var(--text3)',
      textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12,
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background:'var(--surface)', border:'0.5px solid var(--border)',
      borderRadius:'var(--radius-lg)', padding:'18px 20px',
      boxShadow:'var(--shadow)', position:'relative', overflow:'hidden',
    }}>
      {icon && (
        <div style={{
          position:'absolute', right:16, top:16, fontSize:28,
          color:'var(--border2)', opacity:.6,
        }}>
          <i className={`ti ${icon}`} />
        </div>
      )}
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>{label}</div>
      <div style={{
        fontSize:30, fontWeight:700, color: color || 'var(--ua-blue)',
        fontFamily:'Unbounded, sans-serif', lineHeight:1,
      }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{sub}</div>}
    </div>
  );
}
