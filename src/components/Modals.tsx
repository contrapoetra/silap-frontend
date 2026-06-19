'use client';

import { DerivedData } from '@/lib/derived';
import { AppState, AppAction } from '@/lib/state';
import { Dispatch, useState, useRef, useEffect } from 'react';

interface Props {
  st: AppState;
  d: DerivedData;
  dispatch: Dispatch<AppAction>;
  showToast: (msg: string) => void;
}

export function LoginModal({ st, d, dispatch, showToast }: Props) {
  const doLogin = () => {
    const nik = st.loginForm.nik.trim();
    const password = st.loginForm.password.trim();
    const found = st.users.find(x => x.nik === nik && x.password === password);
    if (!found) { dispatch({ type: 'SET_LOGIN_ERROR', payload: 'NIK atau password salah. Coba lagi.' }); return; }
    dispatch({ type: 'DO_LOGIN', payload: found.id });
    showToast('Selamat datang, ' + found.name + '!');
    window.scrollTo(0, 0);
  };
  const loginKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') doLogin(); };

  return (
    <div onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: false })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 22, maxWidth: 430, width: '100%', animation: 'silapPop .25s ease', boxShadow: '0 30px 70px -20px rgba(10,30,16,.5)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' as const }}>
        <div style={{ background: 'linear-gradient(135deg,#1f7e44,#16622f)', padding: '24px 24px 18px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 14, height: 14, borderRadius: '50% 50% 50% 0', background: '#fff', transform: 'rotate(45deg)' }}></div></div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>Masuk ke SILAP</div>
            <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: false })} style={{ marginLeft: 'auto', border: 'none', background: 'rgba(255,255,255,.2)', cursor: 'pointer', width: 28, height: 28, borderRadius: 8, fontSize: 15, color: '#fff', flexShrink: 0 }}>×</button>
          </div>
          <div style={{ fontSize: 12, opacity: .85, paddingLeft: 46 }}>Gunakan NIK dan password untuk masuk</div>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>NIK (16 digit)</label>
          <input value={st.loginForm.nik} onChange={e => dispatch({ type: 'SET_LOGIN_FORM', payload: { nik: e.target.value } })} onKeyDown={loginKey} placeholder="Masukkan 16 digit NIK" maxLength={16} style={{ width: '100%', fontFamily: 'ui-monospace,monospace', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21', letterSpacing: '.05em' }} />
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Password</label>
          <input type="password" value={st.loginForm.password} onChange={e => dispatch({ type: 'SET_LOGIN_FORM', payload: { password: e.target.value } })} onKeyDown={loginKey} placeholder="Masukkan password" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 6, background: '#fafdf9', color: '#1c2a21' }} />
          {st.loginForm.error && <div style={{ background: '#fbe7ee', borderRadius: 9, padding: '9px 12px', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#c0436c', display: 'flex', alignItems: 'center', gap: 7 }}><span>⚠</span>{st.loginForm.error}</div>}
          <button onClick={doLogin} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, padding: 13, borderRadius: 12, background: '#1f7e44', color: '#fff', marginTop: 8, boxShadow: '0 8px 20px -8px rgba(31,126,68,.8)' }}>Masuk</button>
          <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: false })} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, padding: 9, borderRadius: 12, background: 'none', color: '#7d9385', marginTop: 5 }}>Lihat sebagai warga (tanpa login)</button>
          <button onClick={() => dispatch({ type: 'SET_LOGIN_FORM', payload: { showDemo: !st.loginForm.showDemo } })} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: '#9aa99e', padding: '7px 0 3px', marginTop: 5, borderTop: '1px solid #f0f4ef' }}>{d.lf.demoLabel} ▾</button>
          {st.loginForm.showDemo && (
            <div style={{ background: '#f7fbf6', border: '1px solid #e3ebe1', borderRadius: 11, padding: '11px 12px', marginTop: 7 }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9aa99e', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 7 }}>Akun Demo SILAP</div>
              {d.demoAccounts.map((da, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #eef3ec' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: da.accent, color: '#fff', fontSize: '9.5px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{da.initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#22382b' }}>{da.name} <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#9aa99e' }}>— {da.roleLabel}</span></div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#7d9385', letterSpacing: '.03em' }}>{da.nik} · pwd: <strong style={{ color: '#1f7e44' }}>{da.password}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnalogTimePicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isPm, setIsPm] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialHour = 12;
    let initialMinute = 0;
    let initialIsPm = false;
    if (value && value !== '—') {
      const parts = value.split(':');
      if (parts.length === 2) {
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m)) {
          initialMinute = m;
          if (h >= 12) {
            initialIsPm = true;
            initialHour = h === 12 ? 12 : h - 12;
          } else {
            initialIsPm = false;
            initialHour = h === 0 ? 12 : h;
          }
        }
      }
    }
    setHour(initialHour);
    setMinute(initialMinute);
    setIsPm(initialIsPm);
  }, [value]);

  const handleUpdate = (h: number, m: number, pm: boolean) => {
    let finalHour = h;
    if (pm) {
      finalHour = h === 12 ? 12 : h + 12;
    } else {
      finalHour = h === 12 ? 0 : h;
    }
    const pad = (num: number) => String(num).padStart(2, '0');
    onChange(`${pad(finalHour)}:${pad(m)}`);
  };

  const handleDialPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    let shifted = (angleDeg + 90 + 360) % 360;

    if (mode === 'hour') {
      let h = Math.round(shifted / 30);
      if (h === 0) h = 12;
      setHour(h);
      handleUpdate(h, minute, isPm);
    } else {
      let m = Math.round(shifted / 6);
      if (m === 60) m = 0;
      setMinute(m);
      handleUpdate(hour, m, isPm);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDialPointer(e.clientX, e.clientY);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleDialPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (mode === 'hour') {
        setMode('minute');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDialPointer(touch.clientX, touch.clientY);
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      handleDialPointer(moveTouch.clientX, moveTouch.clientY);
    };
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (mode === 'hour') {
        setMode('minute');
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getNumberPos = (idx: number) => {
    const angle = (idx * 30 - 90) * (Math.PI / 180);
    const r = 72;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return { left: `${x}px`, top: `${y}px` };
  };

  const numbers = mode === 'hour' 
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
      {/* Digital time header indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14, background: '#fafdf9', padding: '10px 14px', borderRadius: 12, border: '1px solid #dde7df', width: '100%', maxWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '30px', fontWeight: 800, fontFamily: 'ui-monospace, monospace', color: '#16331f' }}>
          <span 
            onClick={() => setMode('hour')} 
            style={{ 
              cursor: 'pointer', 
              padding: '2px 8px', 
              borderRadius: 8, 
              background: mode === 'hour' ? '#1f7e44' : 'transparent', 
              color: mode === 'hour' ? '#fff' : '#7d9385',
              transition: 'all 0.2s'
            }}
          >
            {String(hour).padStart(2, '0')}
          </span>
          <span style={{ margin: '0 2px', color: '#dde7df' }}>:</span>
          <span 
            onClick={() => setMode('minute')} 
            style={{ 
              cursor: 'pointer', 
              padding: '2px 8px', 
              borderRadius: 8, 
              background: mode === 'minute' ? '#1f7e44' : 'transparent', 
              color: mode === 'minute' ? '#fff' : '#7d9385',
              transition: 'all 0.2s'
            }}
          >
            {String(minute).padStart(2, '0')}
          </span>
        </div>
        
        {/* AM/PM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 10, borderLeft: '1px solid #eef3ec', paddingLeft: 10 }}>
          <button 
            type="button"
            onClick={() => { setIsPm(false); handleUpdate(hour, minute, false); }} 
            style={{ 
              border: 'none', 
              background: !isPm ? '#e1eadf' : 'transparent', 
              color: !isPm ? '#1f7e44' : '#7d9385', 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '2px 6px', 
              borderRadius: 5, 
              cursor: 'pointer' 
            }}
          >
            AM
          </button>
          <button 
            type="button"
            onClick={() => { setIsPm(true); handleUpdate(hour, minute, true); }} 
            style={{ 
              border: 'none', 
              background: isPm ? '#e1eadf' : 'transparent', 
              color: isPm ? '#1f7e44' : '#7d9385', 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '2px 6px', 
              borderRadius: 5, 
              cursor: 'pointer' 
            }}
          >
            PM
          </button>
        </div>
      </div>

      {/* Analog clock face */}
      <div 
        ref={dialRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ 
          position: 'relative', 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          background: '#fafdf9', 
          border: '1px solid #dde7df', 
          cursor: 'pointer', 
          userSelect: 'none',
          touchAction: 'none',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)'
        }}
      >
        {/* Center dot */}
        <div style={{ position: 'absolute', left: '100px', top: '100px', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#1f7e44', zIndex: 10 }} />
        
        {/* The pointer hand */}
        <div style={{
          position: 'absolute',
          left: '100px',
          top: '100px',
          width: '2px',
          height: '72px',
          background: '#1f7e44',
          transformOrigin: 'bottom center',
          transform: `translate(-50%, -100%) rotate(${mode === 'hour' ? hour * 30 : minute * 6}deg)`,
          pointerEvents: 'none',
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Hand tip indicator */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#1f7e44',
            zIndex: 5
          }} />
        </div>

        {/* Dial Face Numbers */}
        {numbers.map((num, i) => {
          const isSelected = mode === 'hour' 
            ? (num === hour) 
            : (parseInt(String(num), 10) === minute);
            
          const pos = getNumberPos(i);
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...pos,
                transform: 'translate(-50%, -50%)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: isSelected ? '800' : '500',
                color: isSelected ? '#fff' : '#5d7263',
                zIndex: 8,
                pointerEvents: 'none',
                transition: 'color 0.1s'
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EventModal({ st, d, dispatch, showToast }: Props) {
  const isEdit = !!st.eventModal?.id;

  return (
    <div onClick={() => dispatch({ type: 'SET_EVENT_MODAL', payload: null })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 390, width: '100%', padding: 24, animation: 'silapPop .25s ease' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 4 }}>
          {isEdit ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
        </div>
        <div style={{ fontSize: 13, color: '#7d9385', marginBottom: 16 }}>{d.eventModal.dateLabel} · {d.active.name}</div>
        
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Nama Kegiatan</label>
        <input value={st.eventModal!.title} onChange={e => dispatch({ type: 'SET_EVENT_MODAL', payload: { ...st.eventModal!, title: e.target.value } })} placeholder="cth: Posyandu balita" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }} />
        
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 6 }}>Waktu Kegiatan</label>
        <AnalogTimePicker value={st.eventModal!.time} onChange={newTime => dispatch({ type: 'SET_EVENT_MODAL', payload: { ...st.eventModal!, time: newTime } })} />
        
        <div style={{ display: 'flex', gap: 10 }}>
          {isEdit && (
            <button onClick={() => {
              dispatch({ type: 'DELETE_EVENT', payload: st.eventModal!.id! });
              dispatch({ type: 'SET_EVENT_MODAL', payload: null });
            }} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fbe7ee', color: '#c0436c', flex: 1 }}>Hapus</button>
          )}
          <button onClick={() => dispatch({ type: 'SET_EVENT_MODAL', payload: null })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            if (!st.eventModal!.title.trim()) { showToast('Isi nama kegiatan dulu'); return; }
            if (isEdit) {
              dispatch({
                type: 'UPDATE_EVENT',
                payload: {
                  id: st.eventModal!.id!,
                  pokja: st.activePokja,
                  y: st.calY,
                  m: st.calM,
                  d: st.eventModal!.day,
                  title: st.eventModal!.title.trim(),
                  time: st.eventModal!.time.trim() || '—'
                }
              } as any);
              showToast('Kegiatan diperbarui');
            } else {
              dispatch({ type: 'ADD_EVENT', payload: { id: st.nextId, pokja: st.activePokja, y: st.calY, m: st.calM, d: st.eventModal!.day, title: st.eventModal!.title.trim(), time: st.eventModal!.time.trim() || '—' } });
              showToast('Kegiatan ditambahkan');
            }
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#1f7e44', color: '#fff' }}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

export function GalModal({ st, d, dispatch, showToast }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Hanya berkas gambar yang didukung');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div onClick={() => dispatch({ type: 'SET_GAL_MODAL', payload: null })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 390, width: '100%', padding: 24, animation: 'silapPop .25s ease' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 16 }}>Unggah Foto · {d.active.name}</div>
        
        <label
          onDragOver={e => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          style={{
            display: 'block',
            border: isDragOver ? '2px dashed #1f7e44' : '1px dashed #c3d8c7',
            borderRadius: 12,
            background: isDragOver ? '#eef7ef' : '#f4f9f3',
            padding: 22,
            textAlign: 'center',
            marginBottom: 14,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            style={{ display: 'none' }}
          />
          {imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: 120, borderRadius: 8, overflow: 'hidden' }}>
              <img src={imagePreview} alt="Pratinjau" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                Seret foto baru atau klik untuk mengganti
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🖼</div>
              <div style={{ fontSize: '13px', color: '#1f7e44', fontWeight: 700 }}>
                Seret foto ke sini atau klik untuk memilih
              </div>
              <div style={{ fontSize: 11, color: '#7d9385', marginTop: 4 }}>
                Mendukung JPG, PNG, WEBP, GIF
              </div>
            </>
          )}
        </label>

        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Keterangan Foto</label>
        <input value={st.galModal!.caption} onChange={e => dispatch({ type: 'SET_GAL_MODAL', payload: { caption: e.target.value } })} placeholder="cth: Kegiatan posyandu Juni" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 16, background: '#fafdf9', color: '#1c2a21' }} />
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => dispatch({ type: 'SET_GAL_MODAL', payload: null })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            if (!imagePreview) { showToast('Pilih atau seret foto dulu'); return; }
            if (!st.galModal!.caption.trim()) { showToast('Isi keterangan foto dulu'); return; }
            
            const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            dispatch({
              type: 'ADD_GALLERY',
              payload: {
                id: st.nextId,
                pokja: st.activePokja,
                caption: st.galModal!.caption.trim(),
                date: todayStr,
                tag: 'foto baru',
                image: imagePreview
              } as any
            });
            showToast('Foto diunggah');
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#1f7e44', color: '#fff' }}>Unggah</button>
        </div>
      </div>
    </div>
  );
}

export function FileUploadModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div onClick={() => dispatch({ type: 'SET_FILE_MODAL', payload: null })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 390, width: '100%', padding: 24, animation: 'silapPop .25s ease' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 3 }}>Unggah Berkas · {d.active.name}</div>
        <div style={{ fontSize: '12.5px', color: '#7d9385', marginBottom: 14 }}>Mendukung PDF, Excel (.xlsx) &amp; Word (.docx).</div>
        <label style={{ display: 'block', border: '1px dashed #c3d8c7', borderRadius: 13, background: '#f4f9f3', padding: 22, textAlign: 'center', marginBottom: 11, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1f7e44'; e.currentTarget.style.background = '#eef7ef'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#c3d8c7'; e.currentTarget.style.background = '#f4f9f3'; }}>
          <input type="file" accept=".pdf,.xls,.xlsx,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const kb = Math.max(1, Math.round(f.size / 1024)); dispatch({ type: 'SET_FILE_MODAL', payload: { name: f.name, size: kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB' } }); }} style={{ display: 'none' }} />
          <div style={{ fontSize: 24, marginBottom: 5, color: '#1f7e44' }}>⬆</div>
          <div style={{ fontSize: '13.5px', color: '#1f7e44', fontWeight: 700 }}>Klik untuk memilih berkas</div>
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#c0436c', background: '#fbe7ee', padding: '3px 9px', borderRadius: 6 }}>PDF</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#1f7e44', background: '#e3f3e8', padding: '3px 9px', borderRadius: 6 }}>EXCEL</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#3d7fd6', background: '#e6effb', padding: '3px 9px', borderRadius: 6 }}>WORD</span>
          </div>
        </label>
        {d.fileModalV.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#eef6ef', border: '1px solid #d9eadc', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: d.fileModalV.tint, color: d.fileModalV.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{d.fileModalV.ext}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: '#22382b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileModalV.name}</div><div style={{ fontSize: 11, color: '#88a08e' }}>{d.fileModalV.size} · siap diunggah</div></div>
            <span style={{ color: '#1f7e44', fontSize: 15 }}>✓</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => dispatch({ type: 'SET_FILE_MODAL', payload: null })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            if (!st.fileModal!.name.trim()) { showToast('Pilih berkas dulu'); return; }
            const nm = st.fileModal!.name.trim();
            const ext = /\.xlsx?$/i.test(nm) ? 'XLS' : /\.docx?$/i.test(nm) ? 'DOC' : 'PDF';
            dispatch({ type: 'ADD_FILE', payload: { id: st.nextId, pokja: st.activePokja, name: nm, ext, size: st.fileModal!.size || '— KB', by: d.u ? d.u.name : '—', date: '12 Jun 2026' } });
            showToast('Berkas diunggah');
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#1f7e44', color: '#fff' }}>Unggah</button>
        </div>
      </div>
    </div>
  );
}

export function AvatarModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: false })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 360, width: '100%', padding: 26, animation: 'silapPop .25s ease', textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 3 }}>Foto Profil</div>
        <div style={{ fontSize: 13, color: '#7d9385', marginBottom: 20 }}>Unggah foto untuk akun Anda</div>
        <div style={{ margin: '0 auto 18px', width: 100, height: 100, borderRadius: '50%', border: '3px solid #e3ebe1', overflow: 'hidden' }}>
          <div style={d.avM.displayStyle}>{d.avM.displayInitial}</div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px dashed #c3d8c7', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', background: '#f4f9f3', fontSize: 14, fontWeight: 700, color: '#1f7e44', marginBottom: 18 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1f7e44'; e.currentTarget.style.background = '#eef7ef'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#c3d8c7'; e.currentTarget.style.background = '#f4f9f3'; }}>
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => dispatch({ type: 'SET_AVATAR_PREVIEW', payload: ev.target!.result as string }); r.readAsDataURL(f); }} style={{ display: 'none' }} />
          ⬆ Pilih foto
        </label>
        {d.avM.hasPreview && <div style={{ fontSize: '12.5px', color: '#7d9385', marginBottom: 14 }}>Pratinjau siap — klik Simpan</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: false })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            if (!st.avatarPreview) { showToast('Pilih foto terlebih dahulu'); return; }
            dispatch({ type: 'SAVE_AVATAR', payload: st.avatarPreview });
            showToast('Foto profil berhasil disimpan');
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#1f7e44', color: '#fff' }}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

export function UserModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div onClick={() => dispatch({ type: 'SET_USER_MODAL', payload: null })} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(18,40,26,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 410, width: '100%', padding: 26, animation: 'silapPop .25s ease', maxHeight: '90vh', overflowY: 'auto' as const }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 16 }}>{d.umV.title}</div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Nama Lengkap</label>
        <input value={st.userModal!.form.name} onChange={e => dispatch({ type: 'SET_USER_FORM', payload: { name: e.target.value } })} placeholder="Nama anggota" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }} />
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>NIK (16 digit)</label>
        <input value={st.userModal!.form.nik} onChange={e => dispatch({ type: 'SET_USER_FORM', payload: { nik: e.target.value } })} placeholder="16 digit NIK" maxLength={16} style={{ width: '100%', fontFamily: 'ui-monospace,monospace', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21', letterSpacing: '.05em' }} />
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Password</label>
        <input type="password" value={st.userModal!.form.password} onChange={e => dispatch({ type: 'SET_USER_FORM', payload: { password: e.target.value } })} placeholder={d.umV.pwdHint} style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }} />
        {d.umV.showRoleSelect && (
          <>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Peran</label>
            <select value={st.userModal!.form.role} onChange={e => dispatch({ type: 'SET_USER_FORM', payload: { role: e.target.value } })} style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }}>
              <option value="admin">Admin Desa</option>
              <option value="ketua">Ketua Pokja</option>
              <option value="anggota">Anggota Pokja</option>
            </select>
          </>
        )}
        {d.umV.showPokjaSelect && (
          <>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Pokja</label>
            <select value={st.userModal!.form.pokja} onChange={e => dispatch({ type: 'SET_USER_FORM', payload: { pokja: e.target.value } })} style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }}>
              <option value="1">Pokja I — Pancasila &amp; Gotong Royong</option>
              <option value="2">Pokja II — Pendidikan &amp; Keterampilan</option>
              <option value="3">Pokja III — Pangan, Sandang &amp; Rumah</option>
              <option value="4">Pokja IV — Kesehatan &amp; Lingkungan</option>
            </select>
          </>
        )}
        {d.umV.hasError && <div style={{ background: '#fbe7ee', borderRadius: 9, padding: '9px 12px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#c0436c', display: 'flex', alignItems: 'center', gap: 7 }}><span>⚠</span>{d.umV.error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => dispatch({ type: 'SET_USER_MODAL', payload: null })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            const fm = st.userModal!;
            if (!fm.form.nik.trim() || !fm.form.name.trim() || (fm.mode === 'add' && !fm.form.password.trim())) {
              dispatch({ type: 'SET_USER_FORM', payload: { error: 'Lengkapi nama, NIK, dan password' } as any });
              return;
            }
            if (st.users.some((u: any) => u.nik === fm.form.nik.trim() && u.id !== fm.editId)) {
              dispatch({ type: 'SET_USER_FORM', payload: { error: 'NIK sudah digunakan akun lain' } as any });
              return;
            }
            if (fm.mode === 'add') {
              const role = fm.form.role || 'anggota';
              const pokja = role === 'admin' ? null : (parseInt(fm.form.pokja) || 1);
              dispatch({ type: 'ADD_USER', payload: { id: 'u' + st.nextId, nik: fm.form.nik.trim(), password: fm.form.password.trim(), role: role as any, name: fm.form.name.trim(), pokja, avatar: null } });
              showToast('Akun ' + fm.form.name.trim() + ' berhasil dibuat');
            } else {
              const existing = st.users.find(u => u.id === fm.editId)!;
              const role = (fm.form.role || existing.role) as 'admin' | 'ketua' | 'anggota';
              const pokja = role === 'admin' ? null : (parseInt(fm.form.pokja) || existing.pokja || 1);
              dispatch({ type: 'UPDATE_USER', payload: { ...existing, nik: fm.form.nik.trim(), name: fm.form.name.trim(), password: fm.form.password.trim() || existing.password, role, pokja } });
              showToast('Akun diperbarui');
            }
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#1f7e44', color: '#fff' }}>{d.umV.saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div onClick={() => dispatch({ type: 'SET_CONFIRM_DELETE', payload: null })} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(18,40,26,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 340, width: '100%', padding: 26, animation: 'silapPop .25s ease', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fbe7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>⚠</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 5 }}>Hapus akun ini?</div>
        <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#c0436c', marginBottom: 7 }}>{d.cdUser.name}</div>
        <div style={{ fontSize: '13.5px', color: '#7d9385', marginBottom: 22, lineHeight: 1.5 }}>Tindakan ini tidak dapat dibatalkan.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => dispatch({ type: 'SET_CONFIRM_DELETE', payload: null })} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
          <button onClick={() => {
            const id = st.confirmDelete!.userId;
            if (id === st.currentUserId) { showToast('Tidak dapat menghapus akun sendiri'); dispatch({ type: 'SET_CONFIRM_DELETE', payload: null }); return; }
            const uName = st.users.find(x => x.id === id)?.name;
            dispatch({ type: 'DELETE_USER', payload: id });
            showToast('Akun ' + (uName || '') + ' dihapus');
          }} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#c0436c', color: '#fff' }}>Hapus Akun</button>
        </div>
      </div>
    </div>
  );
}
