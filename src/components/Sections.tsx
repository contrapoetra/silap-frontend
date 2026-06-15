'use client';

import { DerivedData } from '@/lib/derived';
import { AppState, AppAction } from '@/lib/state';
import { Dispatch } from 'react';

interface Props {
  st: AppState;
  d: DerivedData;
  dispatch: Dispatch<AppAction>;
  go: (r: string) => void;
  openPokja: (id: number) => void;
  showToast: (msg: string) => void;
}

export function BerandaSection({ d, st, dispatch, go, openPokja }: Props) {
  return (
    <div style={{ animation: 'silapFade .3s ease' }}>
      <section style={d.rs.hero}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dff0e3', color: '#1f7e44', fontSize: '12.5px', fontWeight: 700, padding: '7px 14px', borderRadius: 99, marginBottom: d.rs.heroTagMb }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2c9a55' }}></span>Desa Bunutwetan · Tim Penggerak PKK
          </div>
          <h1 style={d.rs.h1}>Satu pintu untuk<br />layanan &amp; program desa</h1>
          <p style={{ fontSize: d.rs.bodyFont, lineHeight: 1.6, color: '#54695b', maxWidth: 480, marginBottom: d.rs.heroTagMb }}>
            SILAP — <strong style={{ color: '#3a4f42' }}>Sistem Informasi Layanan Program Desa</strong>. <br />Pantau kegiatan, galeri, dan laporan dari 4 Pokja PKK.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => go('pokja')} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: d.rs.btnFont, fontWeight: 700, padding: d.rs.btnPad, borderRadius: 13, background: '#1f7e44', color: '#fff', boxShadow: '0 10px 24px -10px rgba(31,126,68,.9)' }}>Jelajahi Layanan</button>
            <button onClick={() => go('laporan')} style={{ border: '1px solid #cfe0d2', cursor: 'pointer', fontFamily: 'inherit', fontSize: d.rs.btnFont, fontWeight: 700, padding: d.rs.btnPad, borderRadius: 13, background: '#fff', color: '#2a4031' }}>Kirim Laporan</button>
          </div>
        </div>
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#e3eee4,#e3eee4 11px,#edf4ed 11px,#edf4ed 22px)', border: '1px solid #d8e5da', minHeight: d.rs.heroImgH, display: 'flex', alignItems: 'flex-end' }}>
          <span style={{ position: 'absolute', top: 16, left: 16, zIndex: 3, fontSize: '10.5px', fontWeight: 700, color: '#fff', background: d.heroCurrent.accent, padding: '4px 11px', borderRadius: 99 }}>{d.heroCurrent.pokjaName}</span>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'ui-monospace,monospace', fontSize: 12, color: '#7e9384', letterSpacing: '.04em' }}>[ {d.heroCurrent.tag} ]</span>
          <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: 20, background: 'linear-gradient(transparent,rgba(15,38,23,.62))' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#cfe8d6', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>Dokumentasi Terbaru</div>
            <div style={{ fontSize: d.rs.heroCapFont, fontWeight: 800, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,.3)' }}>{d.heroCurrent.caption}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {d.heroDots.map((dt, i) => <div key={i} style={{ width: dt.w, height: 7, borderRadius: 99, background: dt.bg, transition: 'width .4s,background .4s' }} />)}
            </div>
          </div>
        </div>
      </section>
      <section style={{ marginTop: d.rs.sectionGap }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: d.rs.h2, fontWeight: 800, letterSpacing: '-.02em', color: '#16331f' }}>Fitur Layanan</h2>
          {d.isDesktop && <span style={{ fontSize: 13, fontWeight: 600, color: '#7d9385' }}>Pilih untuk membuka</span>}
        </div>
        <div style={d.rs.featGrid}>
          {d.features.map((f, i) => (
            <button key={i} onClick={f.onClick} style={{ textAlign: 'left', border: '1px solid #e3ebe1', cursor: 'pointer', fontFamily: 'inherit', background: '#fff', borderRadius: 18, padding: d.rs.cardPad, display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform .15s,box-shadow .15s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 30px -18px rgba(20,48,29,.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: f.tint, color: f.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{f.glyph}</div>
              <div><div style={{ fontSize: 15, fontWeight: 700, color: '#1a3322', marginBottom: 3 }}>{f.title}</div><div style={{ fontSize: 13, lineHeight: 1.5, color: '#69806f' }}>{f.desc}</div></div>
            </button>
          ))}
        </div>
      </section>
      <section style={d.rs.profilSec}>
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#2c9a55', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Profil Desa</div>
          <h2 style={{ fontSize: d.rs.profilH2, fontWeight: 800, letterSpacing: '-.02em', color: '#14301d', marginBottom: 12 }}>Desa Bunutwetan</h2>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: '#54695b', marginBottom: 18 }}>Desa Bunutwetan merupakan salah satu desa yang berada di Kecamatan Pakis, Kabupaten Malang, Provinsi Jawa Timur. Desa ini memiliki letak yang strategis dan berada pada wilayah dataran tinggi dengan sebagian besar masyarakatnya bermata pencaharian di sektor pertanian dan pekerjaan informal lainnya. Secara administratif, Desa Bunutwetan berbatasan dengan Kecamatan Jabung di sebelah utara, Desa Pakisjajar dan Pakiskembar di sebelah timur, Desa Ampeldento di sebelah selatan, serta Desa Asrikaton di sebelah barat. Desa ini terdiri atas beberapa dusun dengan jumlah 9 RW dan 70 RT, serta memiliki berbagai potensi di bidang pertanian, pemberdayaan masyarakat, dan pengembangan keluarga melalui program Kampung KB di Dusun Boro Bunut. Dengan dukungan sumber daya manusia dan potensi wilayah yang dimiliki, Desa Bunutwetan terus berupaya meningkatkan kualitas pelayanan dan kesejahteraan masyarakat guna mewujudkan pembangunan desa yang berkelanjutan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f4f9f3', borderRadius: 13, padding: '14px 16px' }}><div style={{ fontSize: '11.5px', fontWeight: 600, color: '#7d9385', marginBottom: 3 }}>Kepala Desa</div><div style={{ fontSize: '14.5px', fontWeight: 700, color: '#22382b' }}>H. Bambang Sutejo</div></div>
            <div style={{ background: '#f4f9f3', borderRadius: 13, padding: '14px 16px' }}><div style={{ fontSize: '11.5px', fontWeight: 600, color: '#7d9385', marginBottom: 3 }}>Ketua TP PKK</div><div style={{ fontSize: '14.5px', fontWeight: 700, color: '#22382b' }}>Ny. Endang Sutejo</div></div>
          </div>
        </div>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#e3eee4,#e3eee4 11px,#edf4ed 11px,#edf4ed 22px)', border: '1px solid #d8e5da', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '11.5px', color: '#7e9384', letterSpacing: '.04em' }}>[ peta / foto wilayah desa ]</span>
        </div>
      </section>
      <section style={{ marginTop: d.rs.sectionGap }}>
        <h2 style={{ fontSize: d.rs.h2, fontWeight: 800, letterSpacing: '-.02em', color: '#16331f', marginBottom: 16 }}>Kelompok Kerja</h2>
        <div style={d.rs.pokja4Grid}>
          {d.pokjas.map((p, i) => (
            <button key={i} onClick={p.onOpen} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #e3ebe1', background: '#fff', borderRadius: 18, padding: d.rs.cardPad, display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform .15s,box-shadow .15s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 30px -18px rgba(20,48,29,.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: p.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>{p.rom}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: p.accent, background: p.tint, padding: '5px 10px', borderRadius: 99 }}>{p.count} kegiatan</div>
              </div>
              <div><div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9aa99e', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: '#1a3322' }}>{p.title}</div></div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PokjaOverviewSection({ d, go }: { d: DerivedData; go: (r: string) => void }) {
  return (
    <div style={{ animation: 'silapFade .3s ease', paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: d.rs.pageH1, fontWeight: 800, letterSpacing: '-.025em', color: '#14301d', marginBottom: 7 }}>Kelompok Kerja PKK</h1>
        <p style={{ fontSize: '14.5px', color: '#5d7263' }}>Pilih kelompok kerja untuk mengatur galeri, kalender, dan berkas</p>
      </div>
      <div style={d.rs.pokjaOverview}>
        {d.pokjas.map((p, i) => (
          <button key={i} onClick={p.onOpen} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #e3ebe1', background: '#fff', borderRadius: 20, padding: d.rs.cardPad, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'transform .15s,box-shadow .15s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 18px 34px -20px rgba(20,48,29,.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 16, background: p.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{p.rom}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa99e', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: d.rs.pokjaCardH, fontWeight: 800, lineHeight: 1.25, color: '#1a3322', marginBottom: 5 }}>{p.title}</div>
              <div style={{ fontSize: '12.5px', color: '#69806f', marginBottom: 12 }}>{p.sub}</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: '#5d7263' }}><strong style={{ color: p.accent, fontSize: 14 }}>{p.count}</strong> kegiatan</div>
                <div style={{ fontSize: 12, color: '#5d7263' }}><strong style={{ color: p.accent, fontSize: 14 }}>{p.photoCount}</strong> foto</div>
                <div style={{ fontSize: 12, color: '#5d7263' }}><strong style={{ color: p.accent, fontSize: 14 }}>{p.fileCount}</strong> berkas</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PokjaDetailSection({ d, st, dispatch, go, showToast }: Props) {
  return (
    <div style={{ animation: 'silapFade .3s ease', paddingTop: 22 }}>
      <button onClick={() => go('pokja')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#6a8273', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>← Semua Pokja</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: d.active.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>{d.active.rom}</div>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9aa99e', letterSpacing: '.05em', textTransform: 'uppercase' }}>{d.active.name}</div><h1 style={{ fontSize: d.rs.detailH1, fontWeight: 800, letterSpacing: '-.02em', color: '#14301d', lineHeight: 1.15 }}>{d.active.title}</h1></div>
      </div>
      <div style={{ margin: '18px 0 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: '#e6efe4', padding: 4, borderRadius: 12 }}>
          {d.tabs.map((t, i) => (
            <button key={i} onClick={t.onClick} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: d.rs.tabFont, fontWeight: 700, padding: d.rs.tabPad, borderRadius: 9, background: t.bg, color: t.color, boxShadow: t.shadow }}>{t.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {d.canEditActive && <span style={{ fontSize: 12, fontWeight: 700, color: '#1f7e44', background: '#dff0e3', padding: '6px 12px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2c9a55' }}></span>{d.rs.editLabel}</span>}
          {!d.canEditActive && <span style={{ fontSize: 12, fontWeight: 600, color: '#86766a', background: '#f3ede5', padding: '6px 12px', borderRadius: 99 }}>🔒 {d.rs.readLabel}</span>}
        </div>
      </div>
      {st.tab === 'kalender' && (
        <div style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: d.rs.calPad }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => { let m = st.calM - 1, y = st.calY; if (m < 0) { m = 11; y--; } dispatch({ type: 'SET_CAL_MONTH', payload: { m, y } }); }} style={{ border: '1px solid #e1eadf', background: '#fff', cursor: 'pointer', width: 34, height: 34, borderRadius: 9, fontSize: 16, color: '#5b7264' }}>‹</button>
              <div style={{ fontSize: d.rs.calMonthFont, fontWeight: 800, color: '#16331f', minWidth: 130, textAlign: 'center' }}>{d.cal.monthLabel}</div>
              <button onClick={() => { let m = st.calM + 1, y = st.calY; if (m > 11) { m = 0; y++; } dispatch({ type: 'SET_CAL_MONTH', payload: { m, y } }); }} style={{ border: '1px solid #e1eadf', background: '#fff', cursor: 'pointer', width: 34, height: 34, borderRadius: 9, fontSize: 16, color: '#5b7264' }}>›</button>
            </div>
            {d.canEditActive && <span style={{ fontSize: 12, color: '#7d9385', fontWeight: 600 }}>Klik tanggal untuk tambah</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: d.rs.calGap }}>
            {d.cal.weekdays.map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9aa99e', paddingBottom: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>{w}</div>)}
            {d.cal.cells.map((c, i) => (
              <div key={i} onClick={c.onClick} style={{ minHeight: c.minH, borderRadius: 10, border: `1px solid ${c.border}`, background: c.bg, padding: d.rs.calCellPad, cursor: c.cursor, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: d.rs.calNumFont, fontWeight: 700, color: c.numColor }}>{c.day}</div>
                {c.events.map((e: any, j: number) => (
                  <div key={j} style={{ background: e.tint, borderLeft: `3px solid ${e.accent}`, borderRadius: 4, padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: d.rs.calEvFont, fontWeight: 700, color: '#2a3d31', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div><div style={{ fontSize: 9, color: '#7d9385', fontWeight: 600 }}>{e.time}</div></div>
                    {e.canDelete && <button onClick={e.onDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b08a7a', fontSize: 12, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {st.tab === 'galeri' && (
        <div>
          {d.canEditActive && <button onClick={() => dispatch({ type: 'SET_GAL_MODAL', payload: { caption: '' } })} style={{ border: '1px dashed #b8d2bd', background: '#f4f9f3', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#1f7e44', padding: '12px 18px', borderRadius: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>＋ Unggah Foto ke {d.active.name}</button>}
          <div style={d.rs.galPokjaGrid}>
            {d.pokjaPhotos.map((g, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ position: 'relative', minHeight: 130, background: 'repeating-linear-gradient(135deg,#e6efe6,#e6efe6 10px,#eef5ee 10px,#eef5ee 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '10.5px', color: '#88a08e' }}>[ {g.tag} ]</span>
                  {g.canDelete && <button onClick={g.onDelete} style={{ position: 'absolute', top: 8, right: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.9)', width: 24, height: 24, borderRadius: 7, fontSize: 14, color: '#a8705f' }}>×</button>}
                </div>
                <div style={{ padding: '11px 13px' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#22382b', lineHeight: 1.3 }}>{g.caption}</div><div style={{ fontSize: 11, color: '#88a08e', marginTop: 3 }}>{g.date}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {st.tab === 'berkas' && (
        <div style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 8 }}>
          {d.canEditActive && <button onClick={() => dispatch({ type: 'SET_FILE_MODAL', payload: { name: '', size: '' } })} style={{ border: '1px dashed #b8d2bd', background: '#f4f9f3', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#1f7e44', padding: 14, borderRadius: 13, margin: '8px 8px 6px', width: 'calc(100% - 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>⬆ Unggah Berkas Baru</button>}
          {d.pokjaFiles.map((fl, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid #f0f4ef' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: fl.tint, color: fl.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{fl.ext}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#22382b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl.name}</div><div style={{ fontSize: '11.5px', color: '#88a08e' }}>{fl.meta}</div></div>
              <button onClick={() => showToast('Mengunduh ' + fl.name)} style={{ border: '1px solid #cfe0d2', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 700, color: '#1f7e44', padding: '7px 13px', borderRadius: 9, flexShrink: 0 }}>⬇ Unduh</button>
              {fl.canDelete && <button onClick={fl.onDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bfa093', fontSize: 18, padding: '4px 6px' }}>×</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GaleriSection({ d }: { d: DerivedData }) {
  return (
    <div style={{ animation: 'silapFade .3s ease', paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: d.rs.pageH1, fontWeight: 800, letterSpacing: '-.025em', color: '#14301d', marginBottom: 7 }}>Galeri Kegiatan</h1>
        <p style={{ fontSize: '14.5px', color: '#5d7263' }}>Dokumentasi seluruh pokja dalam satu halaman.</p>
      </div>
      <div className="silap-scroll" style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {d.galFilters.map((gf, i) => (
          <button key={i} onClick={gf.onClick} style={{ border: `1px solid ${gf.border}`, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 99, background: gf.bg, color: gf.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{gf.label}</button>
        ))}
      </div>
      <div style={d.rs.galGrid}>
        {d.allPhotos.map((g, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ position: 'relative', minHeight: 130, background: 'repeating-linear-gradient(135deg,#e6efe6,#e6efe6 10px,#eef5ee 10px,#eef5ee 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#88a08e' }}>[ {g.tag} ]</span>
              <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', background: g.accent, padding: '3px 8px', borderRadius: 99 }}>{g.pokjaName}</span>
            </div>
            <div style={{ padding: '10px 12px' }}><div style={{ fontSize: '12.5px', fontWeight: 700, color: '#22382b', lineHeight: 1.3 }}>{g.caption}</div><div style={{ fontSize: 11, color: '#88a08e', marginTop: 3 }}>{g.date}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LaporanSection({ d, st, dispatch, showToast }: Props) {
  const handleExportExcel = () => {
    const rows = st.reports;
    const head = ['No', 'Tanggal', 'Pelapor', 'Kontak', 'Pokja', 'Uraian', 'Status'];
    let html = '<table border="1"><tr>' + head.map(h => `<th style="background:#1f7e44;color:#fff;padding:6px">${h}</th>`).join('') + '</tr>';
    rows.forEach((r, i) => {
      html += '<tr>' + [i + 1, r.date, r.name, r.contact, r.pokja, r.desc, r.status].map(c => `<td style="padding:6px">${String(c).replace(/</g, '&lt;')}</td>`).join('') + '</tr>';
    });
    html += '</table>';
    const blob = new Blob(['<html><head><meta charset="utf-8"></head><body>' + html + '</body></html>'], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Laporan-Warga-SILAP.xls';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('File Excel berhasil diunduh');
  };

  return (
    <div style={{ animation: 'silapFade .3s ease', paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: d.rs.pageH1, fontWeight: 800, letterSpacing: '-.025em', color: '#14301d', marginBottom: 7 }}>Laporan Warga</h1>
        <p style={{ fontSize: '14.5px', color: '#5d7263' }}>Sampaikan laporan atau usulan. Pengurus dapat mengekspor ke Excel.</p>
      </div>
      <div style={d.rs.laporanGrid}>
        <div style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#16331f', marginBottom: 14 }}>Form Laporan</div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Nama Pelapor</label>
          <input value={st.rf.name} onChange={e => dispatch({ type: 'SET_RF', payload: { name: e.target.value } })} placeholder="Nama lengkap" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }} />
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Kontak (WA/Telepon)</label>
          <input value={st.rf.contact} onChange={e => dispatch({ type: 'SET_RF', payload: { contact: e.target.value } })} placeholder="08xx" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }} />
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Ditujukan ke Pokja</label>
          <select value={st.rf.category} onChange={e => dispatch({ type: 'SET_RF', payload: { category: e.target.value } })} style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 12, background: '#fafdf9', color: '#1c2a21' }}>
            <option>Pokja I — Pancasila &amp; Gotong Royong</option>
            <option>Pokja II — Pendidikan &amp; Keterampilan</option>
            <option>Pokja III — Pangan, Sandang &amp; Rumah</option>
            <option>Pokja IV — Kesehatan &amp; Lingkungan</option>
          </select>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#5d7263', marginBottom: 5 }}>Uraian Laporan</label>
          <textarea value={st.rf.desc} onChange={e => dispatch({ type: 'SET_RF', payload: { desc: e.target.value } })} placeholder="Tuliskan laporan Anda…" style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '11px 13px', border: '1px solid #dde7df', borderRadius: 11, marginBottom: 14, background: '#fafdf9', color: '#1c2a21', minHeight: 80, resize: 'vertical' }}></textarea>
          <button onClick={() => {
            if (!st.rf.name.trim() || !st.rf.desc.trim()) { showToast('Lengkapi nama & uraian laporan'); return; }
            const pk = st.rf.category.split(' — ')[0];
            dispatch({ type: 'ADD_REPORT', payload: { id: st.nextId, date: '12 Jun 2026', name: st.rf.name.trim(), contact: st.rf.contact.trim() || '—', pokja: pk, desc: st.rf.desc.trim(), status: 'Baru' } });
            showToast('Laporan terkirim, terima kasih!');
          }} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14.5px', fontWeight: 700, padding: 13, borderRadius: 12, background: '#1f7e44', color: '#fff' }}>Kirim Laporan</button>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 800, color: '#16331f' }}>Rekap Laporan Masuk</div><div style={{ fontSize: '12.5px', color: '#7d9385' }}>{st.reports.length} laporan</div></div>
            <button onClick={handleExportExcel} style={{ border: '1px solid #1f7e44', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#1f7e44', background: '#eaf6ed', padding: '9px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><span>▦</span> Export Excel</button>
          </div>
          <div className="silap-scroll" style={{ overflowX: 'auto', border: '1px solid #e8efe6', borderRadius: 11 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: 580 }}>
              <thead><tr style={{ background: '#1f7e44', color: '#fff', textAlign: 'left' }}><th style={{ padding: '9px 11px', fontWeight: 700 }}>No</th><th style={{ padding: '9px 11px', fontWeight: 700 }}>Tanggal</th><th style={{ padding: '9px 11px', fontWeight: 700 }}>Pelapor</th><th style={{ padding: '9px 11px', fontWeight: 700 }}>Pokja</th><th style={{ padding: '9px 11px', fontWeight: 700 }}>Uraian</th><th style={{ padding: '9px 11px', fontWeight: 700 }}>Status</th></tr></thead>
              <tbody>
                {d.reportRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eef3ec', background: r.rowBg }}>
                    <td style={{ padding: '9px 11px', color: '#7d9385', fontWeight: 600 }}>{r.no}</td>
                    <td style={{ padding: '9px 11px', color: '#3a4f42', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '9px 11px', color: '#22382b', fontWeight: 700 }}>{r.name}</td>
                    <td style={{ padding: '9px 11px', color: '#5d7263', whiteSpace: 'nowrap' }}>{r.pokja}</td>
                    <td style={{ padding: '9px 11px', color: '#3a4f42', maxWidth: 200 }}>{r.desc}</td>
                    <td style={{ padding: '9px 11px' }}><button onClick={r.onStatus} style={{ border: 'none', cursor: r.statusCursor, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: r.statusBg, color: r.statusColor, whiteSpace: 'nowrap' }}>{r.status}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSection({ d, st, dispatch, openPokja, showToast }: Props) {
  return (
    <div style={{ animation: 'silapFade .3s ease', paddingTop: 28 }}>
      <div style={{ background: 'linear-gradient(135deg,#1f7e44,#15622f)', borderRadius: 20, padding: d.rs.dashHeroPad, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: true })} title="Edit foto profil" style={{ cursor: 'pointer', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '3px solid rgba(255,255,255,.35)' }}>
          <div style={d.userVals.avatarStyleLg}>{d.userVals.avatarInitialLg}</div>
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#1f7e44', fontWeight: 800 }}>✎</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: .85 }}>Selamat datang kembali,</div>
          <div style={{ fontSize: d.rs.dashWelcome, fontWeight: 800, letterSpacing: '-.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.userVals.name}</div>
          <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>{d.userVals.roleLabel} · {d.userVals.scope}</div>
        </div>
      </div>
      <div style={d.rs.dashStats}>
        {d.dashStats.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#69806f', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#16331f', marginBottom: 5 }}>Hak Akses Anda</div>
        <div style={{ fontSize: 13, color: '#5d7263', marginBottom: 16 }}>{d.userVals.accessNote}</div>
        <div style={d.rs.dashQA}>
          {d.quickActions.map((q, i) => (
            <button key={i} onClick={q.onClick} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #e8efe6', background: '#f7fbf6', borderRadius: 13, padding: 14, display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: q.tint, color: q.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 }}>{q.glyph}</div>
              <div><div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1a3322' }}>{q.title}</div><div style={{ fontSize: '11.5px', color: '#7d9385' }}>{q.desc}</div></div>
            </button>
          ))}
        </div>
      </div>
      {d.userVals.isAdmin && (
        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 800, color: '#16331f' }}>Manajemen Akun</div><div style={{ fontSize: '12.5px', color: '#7d9385' }}>{st.users.length} akun terdaftar</div></div>
            <button onClick={() => { const cu = d.u; const role = 'anggota'; const pokja = cu && cu.pokja ? String(cu.pokja) : '1'; dispatch({ type: 'SET_USER_MODAL', payload: { mode: 'add', editId: null, form: { nik: '', name: '', password: '', role, pokja }, error: '' } }); }} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 700, padding: '9px 18px', borderRadius: 11, background: '#1f7e44', color: '#fff', whiteSpace: 'nowrap' }}>＋ Tambah Akun</button>
          </div>
          <div className="silap-scroll" style={{ overflowX: 'auto', border: '1px solid #e8efe6', borderRadius: 11 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead><tr style={{ background: '#1f7e44', color: '#fff', textAlign: 'left' }}><th style={{ padding: '9px 12px', fontWeight: 700 }}>Nama</th><th style={{ padding: '9px 12px', fontWeight: 700 }}>NIK</th><th style={{ padding: '9px 12px', fontWeight: 700 }}>Peran</th><th style={{ padding: '9px 12px', fontWeight: 700 }}>Pokja</th><th style={{ padding: '9px 12px', fontWeight: 700 }}>Aksi</th></tr></thead>
              <tbody>
                {d.allUsers.map((au, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eef3ec', background: au.rowBg }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={au.avatarStyle as React.CSSProperties}>{au.avatarInitial}</div>
                        <span style={{ fontWeight: 700, color: '#22382b' }}>{au.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#7d9385', letterSpacing: '.04em' }}>{au.nikMasked}</td>
                    <td style={{ padding: '9px 12px' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 99, background: au.roleBg, color: au.roleColor }}>{au.roleLabel}</span></td>
                    <td style={{ padding: '9px 12px', color: '#5d7263', fontSize: '12.5px' }}>{au.pokjaName}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={au.onEdit} style={{ border: '1px solid #d8e5da', background: '#f4f9f3', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 700, color: '#1f7e44', padding: '5px 11px', borderRadius: 8 }}>Edit</button>
                        {au.canDelete && <button onClick={au.onDelete} style={{ border: '1px solid #f0d8d0', background: '#fdf4f2', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 700, color: '#c0436c', padding: '5px 11px', borderRadius: 8 }}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {d.userVals.isKetua && (
        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #e3ebe1', borderRadius: 18, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 800, color: '#16331f' }}>Anggota {d.userVals.scope}</div><div style={{ fontSize: '12.5px', color: '#7d9385' }}>{d.pokjaMemberList.length} anggota</div></div>
            <button onClick={() => { const cu = d.u; const role = 'anggota'; const pokja = cu && cu.pokja ? String(cu.pokja) : '1'; dispatch({ type: 'SET_USER_MODAL', payload: { mode: 'add', editId: null, form: { nik: '', name: '', password: '', role, pokja }, error: '' } }); }} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 700, padding: '9px 18px', borderRadius: 11, background: '#1f7e44', color: '#fff', whiteSpace: 'nowrap' }}>＋ Tambah Anggota</button>
          </div>
          {d.pokjaMemberList.length > 0 ? (
            <div style={{ border: '1px solid #e8efe6', borderRadius: 11, overflow: 'hidden' }}>
              {d.pokjaMemberList.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid #f0f4ef' }}>
                  <div style={m.avatarStyle as React.CSSProperties}>{m.avatarInitial}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#22382b' }}>{m.name}</div><div style={{ fontSize: '11.5px', fontFamily: 'ui-monospace,monospace', color: '#88a08e' }}>{m.nikMasked}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3d7fd6', background: '#e6effb', padding: '4px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>Anggota</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#9aa99e', fontSize: '13.5px' }}>Belum ada anggota. Klik <strong>＋ Tambah Anggota</strong>.</div>
          )}
        </div>
      )}
    </div>
  );
}
