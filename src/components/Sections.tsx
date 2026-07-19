"use client";

import { DerivedData } from "@/lib/derived";
import { AppState, AppAction } from "@/lib/state";
import { blogPostPath, findBlogPostBySlug } from "@/lib/routes";

import {
  MONTH_NAMES_SHORT,
  POKJA,
  STATUS,
  STATUS_LABEL,
} from "@/lib/constants";
import { AnalogTimePicker } from "./Modals";
import { Dispatch, Fragment, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import ExcelJS from "exceljs/dist/exceljs.min.js";
import MDEditor from "@uiw/react-md-editor";
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewCtx,
  serializerCtx,
  editorViewOptionsCtx,
  parserCtx,
  prosePluginsCtx,
} from "@milkdown/core";
import { Plugin, PluginKey } from "@milkdown/prose/state";
import { Decoration, DecorationSet } from "@milkdown/prose/view";
import { nord } from "@milkdown/theme-nord";
import {
  commonmark,
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInHeadingCommand,
  turnIntoTextCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark";
import {
  history,
  undoCommand,
  redoCommand,
} from "@milkdown/kit/plugin/history";
import { Milkdown, useEditor } from "@milkdown/react";

function searchItems<T>(items: T[], query: string): T[] {
  if (!query.trim()) return items;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const vals = Object.values(item as Record<string, unknown>).filter(
      (v) => v != null
    ).map((v) => String(v).toLowerCase());
    return words.every((w) => vals.some((v) => v.includes(w)));
  });
}

function searchTree(tree: any[], query: string): any[] {
  if (!query.trim()) return tree;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  function match(item: any): boolean {
    const vals = Object.values(item).filter((v) => v != null && !Array.isArray(v)).map((v) => String(v).toLowerCase());
    return words.every((w) => vals.some((v) => v.includes(w)));
  }
  function filterNode(node: any): any | null {
    const children = (node.children || []).map(filterNode).filter(Boolean);
    if (match(node) || children.length > 0) {
      return { ...node, children };
    }
    return null;
  }
  return tree.map(filterNode).filter(Boolean);
}

interface Props {
  st: AppState;
  d: DerivedData;
  dispatch: Dispatch<AppAction>;
  go: (r: string) => void;
  openPokja: (p: { pokja: number; tab?: string }) => void;
  showToast: (msg: string) => void;
}

const BUNUTWETAN_CENTER: [number, number] = [-7.9546, 112.7050];

const DynamicMapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const DynamicTileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const DynamicMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const DynamicCircle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const DynamicPopup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

function DesaMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) {
    return (
      <div style={{ width: "100%", height: 300, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Memuat peta...</span>
      </div>
    );
  }
  return (
    <DynamicMapContainer
      center={BUNUTWETAN_CENTER}
      zoom={14}
      style={{ height: "100%", minHeight: 300, width: "100%" }}
      scrollWheelZoom={false}
    >
      <DynamicTileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DynamicCircle
        center={BUNUTWETAN_CENTER}
        radius={2000}
        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08, weight: 2 }}
      />
      <DynamicMarker position={BUNUTWETAN_CENTER}>
        <DynamicPopup>
          <strong>Desa Bunutwetan</strong><br />
          Kec. Pakis, Kab. Malang, Jawa Timur
        </DynamicPopup>
      </DynamicMarker>
    </DynamicMapContainer>
  );
}

export function BerandaSection({ d, st, dispatch, go, openPokja }: Props) {
  const kepalaDesa = st.pkkMembers.find((m) => m.position === "Pembina");
  const ketuaTPPKK = st.pkkMembers.find((m) => m.position === "Ketua TP. PKK");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descText, setDescText] = useState(st.profileDesc || "Desa Bunutwetan merupakan salah satu desa yang berada di Kecamatan Pakis, Kabupaten Malang, Provinsi Jawa Timur. Desa ini memiliki letak yang strategis dan berada pada wilayah dataran tinggi dengan sebagian besar masyarakatnya bermata pencaharian di sektor pertanian dan pekerjaan informal lainnya. Secara administratif, Desa Bunutwetan berbatasan dengan Kecamatan Jabung di sebelah utara, Desa Pakisjajar dan Pakiskembar di sebelah timur, Desa Ampeldento di sebelah selatan, serta Desa Asrikaton di sebelah barat. Desa ini terdiri atas beberapa dusun dengan jumlah 9 RW dan 70 RT, serta memiliki berbagai potensi di bidang pertanian, pemberdayaan masyarakat, dan pengembangan keluarga melalui program Kampung KB di Dusun Boro Bunut. Dengan dukungan sumber daya manusia dan potensi wilayah yang dimiliki, Desa Bunutwetan terus berupaya meningkatkan kualitas pelayanan dan kesejahteraan masyarakat guna mewujudkan pembangunan desa yang berkelanjutan.");
  const handleSaveDesc = () => {
    dispatch({ type: "UPDATE_PROFILE_DESC", payload: descText });
    setEditingDesc(false);
  };
  const showEditDesc = !!(d.u && d.u.role === "admin");
  return (
    <div style={{ animation: "silapFade .3s ease" }}>
      <section style={d.rs.hero}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e0e7ff",
              color: "#1e3a5f",
              fontSize: "12.5px",
              fontWeight: 700,
              padding: "7px 14px",
              marginBottom: d.rs.heroTagMb,
            }}
          >
            <span style={{ width: 7, height: 7, background: "#2563eb" }}></span>
            Desa Bunutwetan · Tim Penggerak PKK
          </div>
          <h1 style={d.rs.h1}>
            Satu pintu untuk
            <br />
            layanan &amp; program desa
          </h1>
          <p
            style={{
              fontSize: d.rs.bodyFont,
              lineHeight: 1.6,
              color: "#475569",
              maxWidth: 480,
              marginBottom: d.rs.heroTagMb,
            }}
          >
            PENDESA-P3S —{" "}
            <strong style={{ color: "#334155" }}>
              Sistem Informasi Penguatan Desa Modul P3S Bunutwetan
            </strong>
            . <br />
            Pantau kegiatan, galeri, dan laporan dari 4 Pokja PKK.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => go("pokja")}
              style={{
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: d.rs.btnFont,
                fontWeight: 700,
                padding: d.rs.btnPad,
                background: "#1e3a5f",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(30,58,95,0.2)",
              }}
            >
              Jelajahi Layanan
            </button>
            <button
              onClick={() => go("laporan")}
              style={{
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: d.rs.btnFont,
                fontWeight: 700,
                padding: d.rs.btnPad,
                background: "#fff",
                color: "#334155",
              }}
            >
              Kirim Laporan
            </button>
          </div>
        </div>
        <div
          onClick={() => {
            const n = d.heroDots.length;
            if (n > 1) dispatch({ type: 'SET_HERO_IDX', payload: (st.heroIdx + 1) % n });
          }}
          style={{
            position: "relative",
            overflow: "hidden",
            background: d.heroCurrent.image
              ? `url(${d.heroCurrent.image}) center/cover no-repeat`
              : "repeating-linear-gradient(135deg,#e2e8f0,#e2e8f0 11px,#eef2f6 11px,#eef2f6 22px)",
            border: "1px solid #e2e8f0",
            minHeight: d.rs.heroImgH,
            display: "flex",
            alignItems: "flex-end",
            transition: "background .4s ease",
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 3,
              fontSize: "10.5px",
              fontWeight: 700,
              color: "#fff",
              background: d.heroCurrent.accent,
              padding: "4px 11px",
            }}
          >
            {d.heroCurrent.pokjaName}
          </span>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              padding: 20,
              background: "linear-gradient(transparent,rgba(15,23,42,.62))",
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#cbd5e1",
                letterSpacing: ".05em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Dokumentasi Terbaru
            </div>
            <div
              style={{
                fontSize: d.rs.heroCapFont,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.3,
                textShadow: "0 1px 8px rgba(0,0,0,.3)",
              }}
            >
              {d.heroCurrent.caption}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {d.heroDots.map((dt, i) => (
                <div
                  key={i}
                  onClick={dt.onClick}
                  style={{
                    width: dt.w,
                    height: 7,
                    background: dt.bg,
                    transition: "width .4s,background .4s",
                    cursor: "pointer",
                  }}
                />
          ))}
        </div>
      </div>
    </div>
      </section>
      <section style={{ marginTop: d.rs.sectionGap }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: d.rs.h2,
              fontWeight: 800,
              letterSpacing: "-.02em",
              color: "#0f172a",
            }}
          >
            Fitur Layanan
          </h2>
          {d.isDesktop && (
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>
              Pilih untuk membuka
            </span>
          )}
        </div>
        <div style={d.rs.featGrid}>
          {d.features.map((f, i) => (
            <button
              key={i}
              onClick={f.onClick}
              style={{
                textAlign: "left",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                fontFamily: "inherit",
                background: "#fff",
                padding: d.rs.cardPad,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "transform .15s,box-shadow .15s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: f.tint,
                  color: f.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {f.glyph}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: 3,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{ fontSize: 13, lineHeight: 1.5, color: "#64748b" }}
                >
                  {f.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section id="profil-desa" style={d.rs.profilSec}>
        <div>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#2563eb",
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Profil Desa
          </div>
          <h2
            style={{
              fontSize: d.rs.profilH2,
              fontWeight: 800,
              letterSpacing: "-.02em",
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            Desa Bunutwetan
          </h2>
          {editingDesc ? (
            <div style={{ marginBottom: 18 }}>
              <textarea
                value={descText}
                onChange={(e) => setDescText(e.target.value)}
                style={{
                  width: "100%", minHeight: 120, padding: 10, fontSize: 14, lineHeight: 1.65,
                  border: "1px solid #cbd5e1", fontFamily: "inherit", resize: "vertical",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => { setEditingDesc(false); setDescText(st.profileDesc); }} style={{ border: "1px solid #cbd5e1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", background: "#fff", color: "#475569" }}>Batal</button>
                <button onClick={handleSaveDesc} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 16px", background: "#1e3a5f", color: "#fff" }}>Simpan</button>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", marginBottom: 18 }}>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "#475569" }}>
                {st.profileDesc || descText}
              </p>
              {showEditDesc && (
                <button
                  onClick={() => setEditingDesc(true)}
                  style={{
                    position: "absolute", top: 0, right: 0, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "6px 12px",
                    background: "#eef2ff", color: "#1e3a5f",
                  }}
                >
                  ✎ Edit
                </button>
              )}
            </div>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ background: "#f8fafc", padding: "14px 16px" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: 3,
                }}
              >
                Kepala Desa
              </div>
              <div
                style={{
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {kepalaDesa?.name || "H. Bambang Sutejo"}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: "14px 16px" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: 3,
                }}
              >
                Ketua TP PKK
              </div>
              <div
                style={{
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {ketuaTPPKK?.name || "Ny. Endang Sutejo"}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            zIndex: 0,
          }}
        >
          <DesaMap />
        </div>
        {!d.isMob && <div style={{ height: 0 }} />}
        <span style={{ gridColumn: d.isMob ? 1 : 2, justifySelf: "end", alignSelf: "start", fontSize: 9, lineHeight: 1, color: "#94a3b8", marginTop: d.isMob ? 4 : -16, marginBottom: d.isMob ? 0 : -24 }}>
          Map viewer powered by OpenStreetMap and Leaflet
        </span>
      </section>
      <section style={{ marginTop: d.rs.sectionGap }}>
        <h2
          style={{
            fontSize: d.rs.h2,
            fontWeight: 800,
            letterSpacing: "-.02em",
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Kelompok Kerja
        </h2>
        <div style={d.rs.pokja4Grid}>
          {d.pokjas.map((p, i) => (
            <button
              key={i}
              onClick={p.onOpen}
              style={{
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                border: "1px solid #e2e8f0",
                background: "#fff",
                padding: d.rs.cardPad,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "transform .15s,box-shadow .15s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: p.accent,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {p.rom}
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: p.accent,
                    background: p.tint,
                    padding: "5px 10px",
                  }}
                >
                  {p.count} kegiatan
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "#1e293b",
                  }}
                >
                  {p.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PokjaOverviewSection({
  d,
  go,
}: {
  d: DerivedData;
  go: (r: string) => void;
}) {
  const BOARD_ROLES = [
    "Pembina",
    "Penasehat",
    "Ketua TP. PKK",
    "Wakil Ketua",
    "Sekretaris I",
    "Sekretaris II",
    "Bendahara",
  ];
  const active = (m: any) => m.membership_status !== "Tidak Aktif";

  const boardMembers = BOARD_ROLES.map((role) =>
    d.pkkMembers.find((m: any) => m.position === role && active(m)),
  ).filter(Boolean);

  const pokjaMembers = (idx: number) => {
    const rom = ["I", "II", "III", "IV"][idx];
    const ketua = d.pkkMembers.find(
      (m: any) => m.position === `Ketua Pokja ${rom}` && active(m),
    );
    const anggota = d.pkkMembers.filter(
      (m: any) => m.position === `Anggota Pokja ${rom}` && active(m),
    );
    return { ketua, anggota };
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: d.rs.pageH1,
            fontWeight: 800,
            letterSpacing: "-.025em",
            color: "#0f172a",
            marginBottom: 7,
          }}
        >
          Struktur & Kelompok Kerja PKK
        </h1>
        <p style={{ fontSize: "14.5px", color: "#475569" }}>
          Struktur pengurus dan empat kelompok kerja PKK Desa Bunutwetan.
        </p>
      </div>
      <div style={d.rs.pokjaOverview}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: d.rs.cardPad,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#cbd5e1",
              letterSpacing: ".05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Struktur Pengurus
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {boardMembers.map((m: any, i: number) => (
              <div key={i} style={{ padding: "8px 0" }}>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: ".02em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  {m.position}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {m.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {[0, 1, 2, 3].map((idx) => {
            const { ketua, anggota } = pokjaMembers(idx);
            if (!ketua && !anggota.length) return null;
            return (
              <div
                key={idx}
                style={{
                  padding: "10px 0 6px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: d.pokjas[idx]?.accent || "#2563eb",
                    marginBottom: 6,
                  }}
                >
                  {`POKJA ${["I", "II", "III", "IV"][idx]}`}
                </div>
                {ketua && (
                  <>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#64748b",
                        letterSpacing: ".02em",
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      Ketua
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 0 3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {ketua.name}
                      </span>
                    </div>
                  </>
                )}
                {anggota.length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#64748b",
                        letterSpacing: ".02em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                        marginTop: 6,
                      }}
                    >
                      Anggota
                    </div>
                    {anggota.map((a: any, ai: number) => (
                      <div
                        key={ai}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "2px 0",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#334155" }}>
                          {a.name}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {d.pokjas.map((p, i) => (
            <button
              key={i}
              onClick={p.onOpen}
              style={{
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                border: "1px solid #e2e8f0",
                background: "#fff",
                padding: d.rs.cardPad,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                transition: "transform .15s,box-shadow .15s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  background: p.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 17,
                }}
              >
                {p.rom}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: d.rs.pokjaCardH,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  {p.sub}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>
                    <strong style={{ color: p.accent, fontSize: 13 }}>
                      {p.count}
                    </strong>{" "}
                    kegiatan
                  </div>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>
                    <strong style={{ color: p.accent, fontSize: 13 }}>
                      {p.photoCount}
                    </strong>{" "}
                    foto
                  </div>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>
                    <strong style={{ color: p.accent, fontSize: 13 }}>
                      {p.fileCount}
                    </strong>{" "}
                    berkas
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PokjaDetailSection({ d, st, dispatch, go, showToast }: Props) {
  const pokjaKetua = st.pkkMembers.find(
    (m) => m.position === "Ketua Pokja " + d.active.rom,
  );
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: any[] } | null>(null);
  const [seekMin, setSeekMin] = useState(480);
  const draggingRef = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (clientX: number) => {
      if (!draggingRef.current || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setSeekMin(Math.round(pct * 1439));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onMouseUp = () => { draggingRef.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => { draggingRef.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 22 }}>
      <style>{`
@media(max-width:767px){.sc-dot{display:inline-block!important}.sc-ev{display:none!important}.sc-nav{flex-direction:column!important}.sc-nav-btn{width:40px!important;height:40px!important}.sc-tl{display:block!important}.sc-hint{display:none!important}}
@media(min-width:768px){.sc-dot{display:none!important}.sc-ev{display:flex!important}.sc-tl{display:none!important}}
`}</style>
      <button
        onClick={() => go("pokja")}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Semua Pokja
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            background: d.active.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {d.active.rom}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#cbd5e1",
              letterSpacing: ".05em",
              textTransform: "uppercase",
            }}
          >
            {d.active.name}
          </div>
          <h1
            style={{
              fontSize: d.rs.detailH1,
              fontWeight: 800,
              letterSpacing: "-.02em",
              color: "#0f172a",
              lineHeight: 1.15,
            }}
          >
            {d.active.title}
          </h1>
        </div>
      </div>
      <div
        style={{
          margin: "18px 0 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4 }}
        >
          {d.tabs.map((t, i) => (
            <button
              key={i}
              onClick={t.onClick}
              style={{
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: d.rs.tabFont,
                fontWeight: 700,
                padding: d.rs.tabPad,
                background: t.bg,
                color: t.color,
                boxShadow: t.shadow,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          {d.canEditActive && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1e3a5f",
                background: "#e0e7ff",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{ width: 6, height: 6, background: "#2563eb" }}
              ></span>
              {d.rs.editLabel}
            </span>
          )}
          {!d.canEditActive && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#78716c",
                background: "#f5f2ef",
                padding: "6px 12px",
              }}
            >
              🔒 {d.rs.readLabel}
            </span>
          )}
        </div>
      </div>
      {st.tab === "profil" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: d.active.accent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {d.active.rom}
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {d.active.name}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                {d.active.title}
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Deskripsi profil {d.active.name} akan ditampilkan di sini. Jelaskan
            cakupan kegiatan, sasaran, dan program kerja pokja ini.
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {pokjaKetua && (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: d.active.tint,
                    color: d.active.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {d.active.rom}
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}
                  >
                    {pokjaKetua.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    Ketua {d.active.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {st.tab === "kalender" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: d.rs.calPad,
          }}
        >
          <div
            className="sc-nav"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => {
                  let m = st.calM - 1,
                    y = st.calY;
                  if (m < 0) {
                    m = 11;
                    y--;
                  }
                  dispatch({ type: "SET_CAL_MONTH", payload: { m, y } });
                }}
                className="sc-nav-btn"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  width: 34,
                  height: 34,
                  fontSize: 16,
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <div
                style={{
                  fontSize: d.rs.calMonthFont,
                  fontWeight: 800,
                  color: "#0f172a",
                  minWidth: 130,
                  textAlign: "center",
                }}
              >
                {d.cal.monthLabel}
              </div>
              <button
                onClick={() => {
                  let m = st.calM + 1,
                    y = st.calY;
                  if (m > 11) {
                    m = 0;
                    y++;
                  }
                  dispatch({ type: "SET_CAL_MONTH", payload: { m, y } });
                }}
                className="sc-nav-btn"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  width: 34,
                  height: 34,
                  fontSize: 16,
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ›
              </button>
            </div>
          {d.canEditActive && (
              <span className="sc-hint" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                Klik tanggal untuk tambah
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: d.rs.calGap,
            }}
          >
            {d.cal.weekdays.map((w, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  paddingBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: ".03em",
                }}
              >
                {w}
              </div>
            ))}
            {d.cal.cells.map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  if (c.day) {
                    setSelectedDay({ day: c.day, events: c.events });
                    if (d.canEditActive && window.matchMedia('(min-width: 768px)').matches) c.onClick();
                  }
                }}
                style={{
                  minHeight: c.minH,
                  border: `1px solid ${c.border}`,
                  background: c.bg,
                  padding: d.rs.calCellPad,
                  cursor: c.cursor,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div
                  onClick={c.day ? () => setSelectedDay({ day: c.day, events: c.events }) : undefined}
                  style={{
                    fontSize: d.rs.calNumFont,
                    fontWeight: 700,
                    color: c.numColor,
                    cursor: c.day ? "pointer" : undefined,
                  }}
                >
                  {c.day}
                </div>
                {c.events.map((e: any, j: number) => (
                  <div key={j} style={{ position: "relative" }}>
                    <div className="sc-dot" style={{ width: 6, height: 6, background: e.accent, borderRadius: "50%", display: "inline-block", margin: "0 1px" }} />
                    <div
                    className="sc-ev"
                    onClick={e.onClick}
                    style={{
                      background: e.tint,
                      borderLeft: `3px solid ${e.accent}`,
                      padding: "2px 5px",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      cursor: e.canEdit ? "pointer" : "default",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: d.rs.calEvFont,
                          fontWeight: 700,
                          color: "#1e293b",
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        {e.time}
                      </div>
                    </div>
                    {e.canEdit && (
                      <button
                        onClick={e.onDelete}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#b08a7a",
                          fontSize: 12,
                          lineHeight: 1,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sc-tl">
        {selectedDay ? (
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{selectedDay.day} {d.cal.monthLabel}</div>
              <button onClick={() => { setSelectedDay(null); setSeekMin(480); }} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4 }}>✕</button>
            </div>
            {selectedDay.events.length === 0 && (
              <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>Tidak ada kegiatan</div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {selectedDay.events.map((ev, idx) => (
                <div key={ev.id} onClick={d.canEditActive ? () => { setSelectedDay(null); setSeekMin(480); dispatch({ type: "SET_EVENT_MODAL", payload: { day: selectedDay.day, title: ev.title, time: ev.time, id: ev.id, pokja: st.activePokja } }); } : undefined} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #e2e8f0", cursor: d.canEditActive ? "pointer" : "default" }}>
                  <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: "#64748b", textAlign: "right", flexShrink: 0 }}>{ev.time || "—"}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e293b", minWidth: 0 }}>{ev.title}</div>
                  {d.canEditActive && (
                    <span onClick={(e) => { e.stopPropagation(); if (confirm("Hapus kegiatan ini?")) { dispatch({ type: "DELETE_EVENT", payload: ev.id }); setSelectedDay({ day: selectedDay.day, events: selectedDay.events.filter(x => x.id !== ev.id) }); } }} style={{ cursor: "pointer", color: "#b08a7a", fontSize: 14, flexShrink: 0 }}>×</span>
                  )}
                </div>
              ))}
            </div>
            {d.canEditActive && (
              <div style={{ padding: "14px 14px 10px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ position: "relative", height: 50, userSelect: "none", marginBottom: 8 }}>
                  <div
                    ref={timelineRef}
                    style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "pointer", touchAction: "none" }}
                    onMouseDown={(e) => {
                      draggingRef.current = true;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setSeekMin(Math.round(pct * 1439));
                    }}
                    onTouchStart={(e) => {
                      draggingRef.current = true;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                      setSeekMin(Math.round(pct * 1439));
                    }}
                  />
                  <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 2, background: "#e2e8f0", borderRadius: 1, pointerEvents: "none" }} />
                  {[0,2,4,6,8,10,12,14,16,18,20,22].map(h => {
                    const pct = (h / 24) * 100;
                    return (
                      <div key={h} style={{ position: "absolute", top: 10, left: `${pct}%`, transform: "translateX(-50%)", pointerEvents: "none" }}>
                        <div style={{ width: 1, height: 10, background: "#cbd5e1", margin: "0 auto" }} />
                        <div style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", marginTop: 2, fontWeight: 500 }}>{String(h).padStart(2,"0")}</div>
                      </div>
                    );
                  })}
                  {selectedDay.events.map(ev => {
                    const [eh, em] = (ev.time || "00:00").split(":").map(Number);
                    const pct = ((eh * 60 + em) / 1440) * 100;
                    return (
                      <div
                        key={ev.id}
                        style={{ position: "absolute", top: 17, left: `${pct}%`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 12 }}
                        onClick={(e) => { e.stopPropagation(); const [hh,mm] = (ev.time||"00:00").split(":").map(Number); setSeekMin(hh*60+mm); }}
                        title={ev.title}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <rect x="0" y="0" width="12" height="12" rx="2" transform="rotate(45 6 6)" fill={ev.accent} />
                        </svg>
                      </div>
                    );
                  })}
                  <div style={{ position: "absolute", top: 0, left: `${(seekMin/1440)*100}%`, transform: "translateX(-50%)", zIndex: 11, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <svg width="10" height="7" viewBox="0 0 10 7">
                      <polygon points="0,0 10,0 5,7" fill="#ef4444" />
                    </svg>
                    <div style={{ width: 2, flex: 1, background: "#ef4444", minHeight: 38 }} />
                  </div>
                </div>
                <button onClick={() => { setSelectedDay(null); setSeekMin(480); dispatch({ type: "SET_EVENT_MODAL", payload: { day: selectedDay.day, title: "", time: `${String(Math.floor(seekMin / 60)).padStart(2, "0")}:${String(seekMin % 60).padStart(2, "0")}`, pokja: st.activePokja } }); }} style={{ width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "10px 0", background: "#1e3a5f", color: "#fff", borderRadius: 6 }}>
                  + Tambah di jam {String(Math.floor(seekMin / 60)).padStart(2, "0")}:{String(seekMin % 60).padStart(2, "0")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", padding: "24px 14px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            Klik tanggal untuk melihat kegiatan
          </div>
        )}
      </div>
        </div>
      )}
      {st.tab === "galeri" && (
        <div>
          {d.canEditActive && (
            <button
              onClick={() =>
                dispatch({ type: "SET_GAL_MODAL", payload: { caption: "" } })
              }
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#e2e8f0'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#f8fafc'}}
              style={{
                border: "1px dashed #94a3b8",
                background: "#f8fafc",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                color: "#1e3a5f",
                padding: "12px 18px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ＋ Unggah Foto ke {d.active.name}
            </button>
          )}
          <div style={d.rs.galPokjaGrid}>
            {d.pokjaPhotos.map((g, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    minHeight: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {g.image ? (
                    <div style={{ position: "relative", width: "100%", height: 140, flexShrink: 0 }}>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "silapShimmer 1.5s ease-in-out infinite",
                        }}
                      />
                          <div data-progress style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", animation: "silapProgress 2s ease-out forwards", zIndex: 2 }} />
                          {g.image && /\.(mp4|mov)$/i.test(g.image) ? (
                            <video
                              src={g.image}
                              muted
                              playsInline
                              preload="metadata"
                              onLoadedData={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                              onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                              style={{ position: "relative", opacity: 0, transition: "opacity .3s", width: "100%", height: 140, objectFit: "cover", display: "block" }}
                            />
                  ) : (
                            <img
                              src={g.image}
                              alt={g.caption}
                              loading="lazy"
                              onLoad={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "inherit"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                              onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "inherit"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                              style={{ position: "relative", opacity: 0, color: "transparent", transition: "opacity .3s", width: "100%", height: 140, objectFit: "cover", display: "block" }}
                            />
                          )}
                        </div>
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(135deg,#f1f5f9,#f1f5f9 10px,#f8fafc 10px,#f8fafc 20px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "ui-monospace,monospace",
                          fontSize: "10.5px",
                          color: "#94a3b8",
                        }}
                      >
                        [ {g.tag} ]
                      </span>
                    </div>
                  )}
                  {g.image && /\.(mp4|mov)$/i.test(g.image) && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.25)",
                        fontSize: 36,
                        color: "#fff",
                        zIndex: 5,
                        pointerEvents: "none",
                      }}
                    >
                      ▶
                    </div>
                  )}
                  {g.canDelete && (
                    <button
                      onClick={g.onDelete}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        border: "none",
                        cursor: "pointer",
                        background: "rgba(255,255,255,.9)",
                        width: 24,
                        height: 24,
                        fontSize: 14,
                        color: "#a8705f",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div style={{ padding: "11px 13px" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1.3,
                    }}
                  >
                    {g.caption}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {g.created_at
                        ? new Date(g.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : g.date}
                    </span>
                    {g.image && (
                      <a
                        href={g.image}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="silap-hover"
                        style={{ fontSize: 11, color: "#3b82f6", textDecoration: "none", fontWeight: 600, marginLeft: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⬇
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {st.tab === "berkas" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 8,
          }}
        >
          {!d.isMob && d.canEditActive && (
            <button
              onClick={() =>
                dispatch({
                  type: "SET_FILE_MODAL",
                  payload: { name: "", size: "" },
                })
              }
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#e2e8f0'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#f8fafc'}}
              style={{
                border: "1px dashed #94a3b8",
                background: "#f8fafc",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                color: "#1e3a5f",
                padding: 14,
                margin: "8px 8px 6px",
                width: "calc(100% - 16px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              ⬆ Unggah Berkas Baru
            </button>
          )}
          {d.pokjaFiles.map((fl, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: fl.tint,
                  color: fl.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {fl.ext}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fl.name}
                </div>
                <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                  {fl.meta}
                </div>
              </div>
              {fl.url ? (
                <a
href={fl.url}
              download={fl.name}
              className="silap-hover"
              style={{
                textDecoration: "none",
                border: "1px solid #e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                background: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#1e3a5f",
                padding: "7px 13px",
                flexShrink: 0,
              }}
            >
              ⬇ Unduh
            </a>
              ) : (
                <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
                  Berkas offline
                </span>
              )}
              {fl.canDelete && (
                <button
                  onClick={fl.onDelete}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#bfa093",
                    fontSize: 18,
                    padding: "4px 6px",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GaleriSection({ d, st, dispatch, showToast }: Props) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPokja, setUploadPokja] = useState(1);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isAdmin = !!(d.u && d.u.role === "admin");
  const [fsIdx, setFsIdx] = useState<number | null>(null);
  const [galSearch, setGalSearch] = useState("");

  const filteredGalSections = d.galSections
    .map((s: any) => ({
      ...s,
      photos: searchItems(s.photos, galSearch),
    }))
    .filter((s: any) => s.photos.length > 0);

  useEffect(() => {
    if (fsIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFsIdx(null);
      if (e.key === "ArrowLeft")
        setFsIdx((i) => (i !== null ? Math.max(0, i - 1) : null));
      if (e.key === "ArrowRight")
        setFsIdx((i) =>
          i !== null ? Math.min(d.allPhotos.length - 1, i + 1) : null,
        );
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fsIdx, d.allPhotos.length]);

  const handleUpload = async () => {
    if (!uploadFile) {
      showToast("Pilih foto dulu");
      return;
    }
    if (!uploadCaption.trim()) {
      showToast("Isi keterangan foto dulu");
      return;
    }
    setUploadProgress(1);
    try {
      const { uploadToS3 } = await import("@/lib/s3-upload");
      const imageUrl = await uploadToS3(uploadFile, setUploadProgress);
      dispatch({
        type: "ADD_GALLERY",
        payload: {
          id: st.nextId,
          pokja: uploadPokja,
          caption: uploadCaption.trim(),
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          tag: "bakblabla",
          image: imageUrl,
        } as any,
      });
      setShowUpload(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadCaption("");
      setUploadProgress(0);
      showToast("Foto diunggah");
    } catch (err) {
      setUploadProgress(0);
      showToast("Gagal mengunggah foto");
      console.error(err);
    }
  };

  const handleDeleteGal = (id: string | number) => {
    dispatch({ type: "DELETE_GALLERY", payload: id });
  };

  const isVideo = (f: File) => f.type.startsWith("video/") || /\.(mov|mp4|avi|mkv|webm|m4v)$/i.test(f.name);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !isVideo(file)) {
      showToast("Hanya gambar dan video (MP4/MOV) yang didukung");
      return;
    }
    setUploadFile(file);
    if (isVideo(file)) {
      setUploadPreview("__video__");
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Galeri Kegiatan
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Dokumentasi seluruh pokja dalam satu halaman.
          </p>
        </div>
        {!d.isMob && isAdmin && !showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 18px",
              background: "#1e3a5f",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + Tambah Foto
          </button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          className="silap-scroll"
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}
        >
          {d.galFilters.map((gf, i) => (
            <button
              key={i}
              onClick={gf.onClick}
              style={{
                border: `1px solid ${gf.border}`,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                background: gf.bg,
                color: gf.color,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {gf.label}
            </button>
          ))}
        </div>
        <div
          className="silap-scroll"
          style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, flexShrink: 0 }}
        >
          {d.galSortOptions.map((so, i) => (
            <button
              key={i}
              onClick={so.onClick}
              style={{
                border: so.active ? "1px solid #1e3a5f" : "1px solid #e2e8f0",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                background: so.active ? "#1e3a5f" : "#fff",
                color: so.active ? "#fff" : "#64748b",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {so.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          value={galSearch}
          onChange={(e) => setGalSearch(e.target.value)}
          placeholder="Cari foto…"
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            padding: "9px 12px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#1e293b",
            outline: "none",
            width: "100%",
            maxWidth: 320,
            boxSizing: "border-box" as const,
          }}
        />
      </div>

      {showUpload && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            Tambah Foto Baru
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Pokja
              </label>
              <select
                value={uploadPokja}
                onChange={(e) => setUploadPokja(Number(e.target.value))}
                style={{
                  width: "100%",
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "9px 11px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#1e293b",
                }}
              >
                <option value={1}>
                  Pokja I — Pancasila &amp; Gotong Royong
                </option>
                <option value={2}>
                  Pokja II — Pendidikan &amp; Keterampilan
                </option>
                <option value={3}>
                  Pokja III — Pangan, Sandang &amp; Rumah
                </option>
                <option value={4}>Pokja IV — Kesehatan &amp; Lingkungan</option>
                {isAdmin && <option value={5}>Umum</option>}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Foto
              </label>
              <label
                style={{
                  display: "block",
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/*,video/mp4,video/quicktime,.mov,.mp4"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                {uploadPreview === "__video__" ? (
                  <div
                    style={{
                      width: "100%",
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#0f172a",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      gap: 6,
                    }}
                  >
                    ▶ {uploadFile?.name}
                  </div>
                ) : uploadPreview ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 100,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={uploadPreview}
                      alt="Pratinjau"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Klik untuk mengganti
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🖼</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1e3a5f",
                        fontWeight: 700,
                      }}
                    >
                      Klik untuk memilih foto
                    </div>
                  </>
                )}
              </label>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Keterangan
              </label>
              <input
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="cth: Kegiatan posyandu Juni"
                style={{
                  width: "100%",
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "9px 11px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#1e293b",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadFile(null);
                  setUploadPreview(null);
                  setUploadCaption("");
                }}
                style={{
                  flex: 1,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: 10,
                  background: "#fff",
                  color: "#475569",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadProgress > 0}
                style={{
                  flex: 1.4,
                  border: "none",
                  cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: 10,
                  background: uploadProgress > 0 ? "#94a3b8" : "#1e3a5f",
                  color: "#fff",
                  opacity: uploadProgress > 0 ? 0.7 : 1,
                }}
              >
                {uploadProgress > 0 ? `Mengunggah ${uploadProgress}%` : "Unggah"}
              </button>
            </div>
            {uploadProgress > 0 && (
              <div
                style={{
                  marginTop: 10,
                  height: 6,
                  background: "#e2e8f0",
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    background: "#1e3a5f",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {filteredGalSections.length === 0 && galSearch ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          Tidak ditemukan
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
        {filteredGalSections.map(section => (
          <div key={section.label}>
            <div
              style={{
                fontSize: d.isMob ? 18 : 22,
                fontWeight: 800,
                color: "#0f172a",
                paddingBottom: 14,
                marginBottom: 20,
                marginTop: 8,
                borderBottom: "3px solid #cbd5e1",
                letterSpacing: "-0.3px",
              }}
            >
              {section.label}
              <span style={{ fontWeight: 500, color: "#94a3b8", marginLeft: 10, fontSize: d.isMob ? 13 : 15 }}>
                {section.photos.length} foto
              </span>
            </div>
            <div style={d.rs.galGrid}>
               {section.photos.map((g: any) => {
                const globalIdx = d.allPhotos.indexOf(g);
                return (
                  <div
                    key={g.id || globalIdx}
                    onClick={() => setFsIdx(globalIdx)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                      transition: "transform .15s,box-shadow .15s",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        minHeight: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {g.image ? (
                        <div style={{ position: "relative", width: "100%", height: 140, flexShrink: 0 }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)",
                              backgroundSize: "200% 100%",
                              animation: "silapShimmer 1.5s ease-in-out infinite",
                            }}
                          />
                      <div data-progress style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", animation: "silapProgress 2s ease-out forwards", zIndex: 2 }} />
                      {g.image && /\.(mp4|mov)$/i.test(g.image) ? (
                        <video
                          src={g.image}
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedData={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                          onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                          style={{ position: "relative", opacity: 0, transition: "opacity .3s", width: "100%", height: 140, objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <img
                          src={g.image}
                          alt={g.caption}
                          loading="lazy"
                          onLoad={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "inherit"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                          onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "inherit"; e.currentTarget.parentElement?.querySelector('[data-progress]')?.remove() }}
                          style={{ position: "relative", opacity: 0, color: "transparent", transition: "opacity .3s", width: "100%", height: 140, objectFit: "cover", display: "block" }}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(135deg,#f1f5f9,#f1f5f9 10px,#f8fafc 10px,#f8fafc 20px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "ui-monospace,monospace",
                          fontSize: 10,
                          color: "#94a3b8",
                        }}
                      >
                        [ {g.tag} ]
                      </span>
                    </div>
                  )}
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  background: g.accent,
                  padding: "3px 8px",
                  zIndex: 10,
                }}
              >
                      {g.pokjaName}
              </span>
              {g.image && /\.(mp4|mov)$/i.test(g.image) && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.25)",
                    fontSize: 36,
                    color: "#fff",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  ▶
                </div>
              )}
              {isAdmin && g.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGal(g.id);
                  }}
                  title="Hapus foto"
                  onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#b91c1c'}}
                  onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.85)'}}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(239,68,68,0.85)",
                    color: "#fff",
                    width: 26,
                    height: 26,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div
                style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: 1.3,
                }}
              >
                {g.caption}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {g.created_at
                    ? new Date(g.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : g.date}
                </span>
                {g.image && (
                  <a
                    href={g.image}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="silap-hover"
                    style={{ fontSize: 11, color: "#3b82f6", textDecoration: "none", fontWeight: 600, marginLeft: "auto" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⬇
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
            </div>
          </div>
        ))}
      </div>
      )}

      {fsIdx !== null && d.allPhotos[fsIdx] && (
        <div
          onClick={() => setFsIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => setFsIdx(null)}
            onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.opacity='.6'}}
            onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.opacity='1'}}
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              border: "none",
              cursor: "pointer",
              background: "none",
              color: "#fff",
              fontSize: 28,
              fontFamily: "inherit",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
          {fsIdx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFsIdx(fsIdx - 1);
              }}
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.3)'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                width: 44,
                height: 44,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              ←
            </button>
          )}
          {fsIdx < d.allPhotos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFsIdx(fsIdx + 1);
              }}
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.3)'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                width: 44,
                height: 44,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              →
            </button>
          )}
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg,#334155 25%,#475569 50%,#334155 75%)",
                backgroundSize: "200% 100%",
                animation: "silapShimmer 1.5s ease-in-out infinite",
              }}
            />
            <div data-progress-fs style={{ position: "absolute", bottom: 0, left: 0, height: 4, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", animation: "silapProgress 2s ease-out forwards", zIndex: 2 }} />
            {/\.(mp4|mov)$/i.test(d.allPhotos[fsIdx].image || '') ? (
              <video
                src={d.allPhotos[fsIdx].image!}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                onLoadedData={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress-fs]')?.remove() }}
                onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress-fs]')?.remove() }}
                style={{ position: "relative", opacity: 0, transition: "opacity .3s", maxWidth: "90vw", maxHeight: "80vh" }}
              />
            ) : (
              <img
                src={d.allPhotos[fsIdx].image!}
                alt={d.allPhotos[fsIdx].caption}
                onClick={(e) => e.stopPropagation()}
                onLoad={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress-fs]')?.remove() }}
                onError={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.parentElement?.querySelector('[data-progress-fs]')?.remove() }}
                style={{ position: "relative", opacity: 0, transition: "opacity .3s", maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
              />
            )}
          </div>
          <div
            style={{
              color: "#ccc",
              fontSize: 14,
              marginTop: 12,
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            {d.allPhotos[fsIdx].caption}
          </div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
            {d.allPhotos[fsIdx].pokjaName} · {d.allPhotos[fsIdx].date}
          </div>
          <a
            href={d.allPhotos[fsIdx].image || "#"}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="silap-hover"
            style={{ color: "#60a5fa", fontSize: 13, marginTop: 8, textDecoration: "none", fontWeight: 600 }}
          >
            ⬇ Unduh
          </a>
        </div>
      )}
      {d.isMob && isAdmin && !showUpload && (
        <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 50 }}>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: "#1e3a5f",
              color: "#fff",
              borderRadius: "50%",
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(30,58,95,.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="11" y1="5" x2="11" y2="17" />
              <line x1="5" y1="11" x2="17" y2="11" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function KalenderSection({
  d,
  st,
  dispatch,
  showToast,
}: {
  d: DerivedData;
  st: AppState;
  dispatch: Dispatch<AppAction>;
  showToast: (msg: string) => void;
}) {
  const today = new Date();
  const daysInMonth = new Date(st.calY, st.calM + 1, 0).getDate();
  const firstDow = new Date(st.calY, st.calM, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const isAdmin = !!(d.u && d.u.role === "admin");
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, i) => {
    if (i < startOffset) return { day: null, events: [] };
    const dayNum = i - startOffset + 1;
    const isToday =
      today.getFullYear() === st.calY &&
      today.getMonth() === st.calM &&
      today.getDate() === dayNum;
    const dayEvents = st.events
      .filter((e) => e.y === st.calY && e.m === st.calM && e.d === dayNum)
      .map((e) => {
        const poke = POKJA.find((p) => p.id === e.pokja)!;
        return {
          ...e,
          accent: poke.accent,
          tint: poke.tint,
          pokjaName: poke.name,
        };
      });
    return { day: dayNum, isToday, events: dayEvents };
  });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: any[] } | null>(null);
  const [seekMin, setSeekMin] = useState(480);
  const draggingRef = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (clientX: number) => {
      if (!draggingRef.current || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setSeekMin(Math.round(pct * 1439));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onMouseUp = () => { draggingRef.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => { draggingRef.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sync");
    if (s === "done") {
      const ins = params.get("inserted");
      const fail = params.get("failed");
      setSyncMsg(
        `Sync selesai! ${ins} event ditambahkan${Number(fail) > 0 ? `, ${fail} gagal` : ""}`,
      );
      window.history.replaceState({}, "", window.location.pathname);
    } else if (s === "denied") {
      setSyncMsg("Akses ditolak. Sync dibatalkan.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (s === "expired") {
      setSyncMsg("Sesi sync kadaluarsa. Coba lagi.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (s === "token_error") {
      setSyncMsg("Gagal mendapatkan token Google. Coba lagi.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/google/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: st.events }),
      });
      if (!res.ok) throw new Error("Gagal memulai sync");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setSyncing(false);
      setSyncMsg("Gagal memulai sync. Coba lagi.");
    }
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <style>{`
@media(max-width:767px){.sc-dot{display:inline-block!important}.sc-ev{display:none!important}.sc-nav{flex-direction:column!important}.sc-nav-btn{width:40px!important;height:40px!important}.sc-sync{width:100%!important}.sc-tl{display:block!important}.sc-hint{display:none!important}}
@media(min-width:768px){.sc-dot{display:none!important}.sc-ev{display:flex!important}.sc-tl{display:none!important}}
`}</style>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: d.rs.pageH1,
            fontWeight: 800,
            letterSpacing: "-.025em",
            color: "#0f172a",
            marginBottom: 7,
          }}
        >
          Kalender Kegiatan
        </h1>
        <p style={{ fontSize: "14.5px", color: "#475569" }}>
          Agenda seluruh pokja dalam satu halaman.
        </p>
      </div>
      {syncMsg && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: 14,
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#166534",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {syncMsg}
        </div>
      )}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: d.rs.calPad,
        }}
      >
        <div className="sc-nav"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => {
                let m = st.calM - 1,
                  y = st.calY;
                if (m < 0) {
                  m = 11;
                  y--;
                }
                dispatch({ type: "SET_CAL_MONTH", payload: { m, y } });
              }}
              className="sc-nav-btn"
              style={{
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                width: 34,
                height: 34,
                fontSize: 16,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            <div
              style={{
                fontSize: d.rs.calMonthFont,
                fontWeight: 800,
                color: "#0f172a",
                minWidth: 130,
                textAlign: "center",
              }}
            >
              {d.cal.monthLabel}
            </div>
            <button
              onClick={() => {
                let m = st.calM + 1,
                  y = st.calY;
                if (m > 11) {
                  m = 0;
                  y++;
                }
                dispatch({ type: "SET_CAL_MONTH", payload: { m, y } });
              }}
              className="sc-nav-btn"
              style={{
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                width: 34,
                height: 34,
                fontSize: 16,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="sc-sync"
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: syncing ? "wait" : "pointer",
              fontFamily: "inherit",
              fontSize: d.rs.btnFont || 13,
              fontWeight: 700,
              padding: "8px 16px",
              color: "#1e3a5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: syncing ? 0.6 : 1,
            }}
          >
            {syncing ? "⏳ Menyinkronkan..." : "☁ Sync ke Google Calendar"}
          </button>
        </div>
        {isAdmin && (
          <div className="sc-hint"
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Klik tanggal untuk tambah kegiatan
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: d.rs.calGap,
          }}
        >
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((w, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "#94a3b8",
                padding: "8px 0",
                textTransform: "uppercase",
              }}
            >
              {w}
            </div>
          ))}
          {cells.map((c, i) => (
            <div
              key={i}
              onClick={
                c.day
                  ? () => {
                      setSelectedDay({ day: c.day!, events: c.events });
                      if (isAdmin && window.matchMedia('(min-width: 768px)').matches) {
                        dispatch({ type: "SET_EVENT_MODAL", payload: { day: c.day, title: "", time: "", pokja: 1 } });
                      }
                    }
                  : undefined
              }
              style={{
                background: c.day
                  ? c.isToday
                    ? "#eef2ff"
                    : "#fff"
                  : "#f8fafc",
                border: `1px solid ${c.day ? (c.isToday ? "#2563eb" : "#e2e8f0") : "#f1f5f9"}`,
                minHeight: "var(--silap-cal-cell-min-h)",
                padding: 3,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {c.day && (
                <div
                  onClick={() => {
                    setSelectedDay({ day: c.day!, events: c.events });
                    if (isAdmin && window.matchMedia('(min-width: 768px)').matches) {
                      dispatch({
                        type: "SET_EVENT_MODAL",
                        payload: { day: c.day, title: "", time: "", pokja: 1 },
                      });
                    }
                  }}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: c.isToday ? "#2563eb" : "#334155",
                    marginBottom: 2,
                    cursor: "pointer",
                  }}
                >
                  {c.day}
                </div>
              )}
              {c.events.map((ev, j) => (
                <div key={j} style={{ position: "relative" }}>
                  <div className="sc-dot" style={{ width: 6, height: 6, background: ev.accent, borderRadius: "50%", display: "inline-block", margin: "0 1px" }} />
                  <div
                  className="sc-ev"
                  onClick={
                    isAdmin
                      ? (e) => {
                          e.stopPropagation();
                          if (window.matchMedia('(min-width: 768px)').matches) {
                            dispatch({
                              type: "SET_EVENT_MODAL",
                              payload: {
                                day: c.day!,
                                title: ev.title,
                                time: ev.time,
                                id: ev.id,
                                pokja: ev.pokja,
                              },
                            });
                          }
                        }
                      : undefined
                  }
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: ev.accent,
                    background: ev.tint,
                    padding: "1px 4px",
                    marginBottom: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: isAdmin ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                  title={`${ev.title} (${ev.pokjaName})`}
                >
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ev.title}
                  </span>
                  {isAdmin && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Hapus kegiatan ini?")) {
                          dispatch({ type: "DELETE_EVENT", payload: ev.id });
                        }
                      }}
                      style={{
                        color: "#b08a7a",
                        fontSize: 11,
                        lineHeight: 1,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </span>
                  )}
                </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      <div className="sc-tl">
        {selectedDay ? (
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{selectedDay.day} {d.cal.monthLabel}</div>
              <button onClick={() => { setSelectedDay(null); setSeekMin(480); }} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4 }}>✕</button>
            </div>
            {selectedDay.events.length === 0 && (
              <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>Tidak ada kegiatan</div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {selectedDay.events.map((ev, idx) => (
                <div key={ev.id} onClick={isAdmin ? () => { setSelectedDay(null); setSeekMin(480); dispatch({ type: "SET_EVENT_MODAL", payload: { day: selectedDay.day, title: ev.title, time: ev.time, id: ev.id, pokja: st.activePokja } }); } : undefined} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #e2e8f0", cursor: isAdmin ? "pointer" : "default" }}>
                  <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: "#64748b", textAlign: "right", flexShrink: 0 }}>{ev.time || "—"}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e293b", minWidth: 0 }}>{ev.title}</div>
                  {isAdmin && (
                    <span onClick={(e) => { e.stopPropagation(); if (confirm("Hapus kegiatan ini?")) { dispatch({ type: "DELETE_EVENT", payload: ev.id }); setSelectedDay({ day: selectedDay.day, events: selectedDay.events.filter(x => x.id !== ev.id) }); } }} style={{ cursor: "pointer", color: "#b08a7a", fontSize: 14, flexShrink: 0 }}>×</span>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && (
              <div style={{ padding: "14px 14px 10px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ position: "relative", height: 50, userSelect: "none", marginBottom: 8 }}>
                  {/* clickable overlay — full height so the whole area is interactive */}
                  <div
                    ref={timelineRef}
                    style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "pointer", touchAction: "none" }}
                    onMouseDown={(e) => {
                      draggingRef.current = true;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setSeekMin(Math.round(pct * 1439));
                    }}
                    onTouchStart={(e) => {
                      draggingRef.current = true;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                      setSeekMin(Math.round(pct * 1439));
                    }}
                  />
                  {/* timeline track */}
                  <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 2, background: "#e2e8f0", borderRadius: 1, pointerEvents: "none" }} />
                  {/* hour marks */}
                  {[0,2,4,6,8,10,12,14,16,18,20,22].map(h => {
                    const pct = (h / 24) * 100;
                    return (
                      <div key={h} style={{ position: "absolute", top: 10, left: `${pct}%`, transform: "translateX(-50%)", pointerEvents: "none" }}>
                        <div style={{ width: 1, height: 10, background: "#cbd5e1", margin: "0 auto" }} />
                        <div style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", marginTop: 2, fontWeight: 500 }}>{String(h).padStart(2,"0")}</div>
                      </div>
                    );
                  })}
                  {/* event keyframes (diamond shape) */}
                  {selectedDay.events.map(ev => {
                    const [eh, em] = (ev.time || "00:00").split(":").map(Number);
                    const pct = ((eh * 60 + em) / 1440) * 100;
                    return (
                      <div
                        key={ev.id}
                        style={{ position: "absolute", top: 17, left: `${pct}%`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 12 }}
                        onClick={(e) => { e.stopPropagation(); const [hh,mm] = (ev.time||"00:00").split(":").map(Number); setSeekMin(hh*60+mm); }}
                        title={ev.title}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <rect x="0" y="0" width="12" height="12" rx="2" transform="rotate(45 6 6)" fill={ev.accent} />
                        </svg>
                      </div>
                    );
                  })}
                  {/* playhead / scrubber */}
                  <div style={{ position: "absolute", top: 0, left: `${(seekMin/1440)*100}%`, transform: "translateX(-50%)", zIndex: 11, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <svg width="10" height="7" viewBox="0 0 10 7">
                      <polygon points="0,0 10,0 5,7" fill="#ef4444" />
                    </svg>
                    <div style={{ width: 2, flex: 1, background: "#ef4444", minHeight: 38 }} />
                  </div>
                </div>
                <button onClick={() => { setSelectedDay(null); setSeekMin(480); dispatch({ type: "SET_EVENT_MODAL", payload: { day: selectedDay.day, title: "", time: `${String(Math.floor(seekMin / 60)).padStart(2, "0")}:${String(seekMin % 60).padStart(2, "0")}`, pokja: st.activePokja } }); }} style={{ width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "10px 0", background: "#1e3a5f", color: "#fff", borderRadius: 6 }}>
                  + Tambah di jam {String(Math.floor(seekMin / 60)).padStart(2, "0")}:{String(seekMin % 60).padStart(2, "0")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", padding: "24px 14px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            Klik tanggal untuk melihat kegiatan
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export function BerkasSection({
  d,
  st,
  dispatch,
  showToast,
}: {
  d: DerivedData;
  st: AppState;
  dispatch: Dispatch<AppAction>;
  showToast: (msg: string) => void;
}) {
  const isAdmin = !!(d.u && d.u.role === "admin");
  const canUploadBerkas = isAdmin || (!!d.u && d.u.pokja != null && st.fileFilter !== "all" && d.u.pokja === st.fileFilter);
  const [berkasSearch, setBerkasSearch] = useState("");
  const filteredFiles = searchItems(d.allFiles, berkasSearch);

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Berkas Pokja
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Dokumen dan berkas seluruh pokja.
          </p>
        </div>
        {!d.isMob && canUploadBerkas && (
          <button
            onClick={() =>
              dispatch({
                type: "SET_FILE_MODAL",
                payload: { name: "", size: "" },
              })
            }
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 18px",
              background: "#16a34a",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ＋ Unggah Berkas
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <div
          className="silap-scroll"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {d.berkasFilters.map((bf, i) => (
            <button
              key={i}
              onClick={bf.onClick}
              style={{
                border: `1px solid ${bf.border}`,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                background: bf.bg,
                color: bf.color,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {bf.label}
            </button>
          ))}
        </div>
        <input
          value={berkasSearch}
          onChange={(e) => setBerkasSearch(e.target.value)}
          placeholder="Cari berkas…"
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            padding: "9px 12px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#1e293b",
            outline: "none",
            width: "100%",
            maxWidth: 280,
            boxSizing: "border-box" as const,
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {berkasSearch && filteredFiles.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
            Tidak ditemukan
          </div>
        ) : (
        filteredFiles.map((f, i) => {
          const extColor = /\.xlsx?$/i.test(f.name)
            ? "#16a34a"
            : /\.docx?$/i.test(f.name)
              ? "#2563eb"
              : "#ea580c";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                border: "1px solid #e2e8f0",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: `${extColor}18`,
                  color: extColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {(f.name.match(/\.(\w+)$/)?.[1] || "FILE").toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.name}
                </div>
                <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                  {f.size} · {f.pokjaName} · {f.date}
                </div>
              </div>
              {f.url ? (
                <a
href={f.url}
              download={f.name}
              className="silap-hover"
              style={{
                textDecoration: "none",
                border: "1px solid #e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                background: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#1e3a5f",
                padding: "7px 13px",
                flexShrink: 0,
              }}
            >
              ⬇ Unduh
            </a>
              ) : (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontStyle: "italic",
                    flexShrink: 0,
                  }}
                >
                  Offline
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => dispatch({ type: "DELETE_FILE", payload: f.id })}
                  onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#b91c1c'}}
                  onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.85)'}}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(239,68,68,0.85)",
                    color: "#fff",
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        }))}
        {!berkasSearch && d.allFiles.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#fff",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8, color: "#cbd5e1" }}>
              📄
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8" }}>
              Belum ada berkas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PengumumanSection({ d, st, dispatch, showToast }: Props) {
  const isAdmin = !!(d.u && d.u.role === "admin");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    image: "",
    caption: "",
    expires_date: "",
    expires_time: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [fsIdx, setFsIdx] = useState<number | null>(null);
  const [noTrans, setNoTrans] = useState(false);
  const fsIdxRef = useRef<number | null>(null);

  const now = new Date();
  const active = (st.pengumuman || []).filter(
    (p) => !p.expires_at || new Date(p.expires_at) > now,
  );
  const N = active.length;
  const loopItems =
    N > 1 ? [...active.slice(-N), ...active, ...active.slice(0, N)] : active;
  const fsOffset = N > 1 ? N : 0;
  fsIdxRef.current = fsIdx;
  const maxIdx = loopItems.length - 1;
  const goFsPrev = (i: number | null) =>
    i === null ? null : Math.max(i - 1, 0);
  const goFsNext = (i: number | null) =>
    i === null ? null : Math.min(i + 1, maxIdx);
  const lastNav = useRef(0);
  const nav = (fn: () => void) => {
    const t = Date.now();
    if (t - lastNav.current < 350) return;
    lastNav.current = t;
    fn();
  };
  const fsPrev = () => nav(() => setFsIdx(goFsPrev));
  const fsNext = () => nav(() => setFsIdx(goFsNext));

  useEffect(() => {
    if (active.length > 0 && storyIndex >= active.length)
      setStoryIndex(active.length - 1);
  }, [active.length]);

  useEffect(() => {
    if (noTrans) setNoTrans(false);
  }, [noTrans]);

  useEffect(() => {
    if (fsIdx === null || active.length === 0) return;
    const logical =
      (((fsIdx - fsOffset) % active.length) + active.length) % active.length;
    setStoryIndex(logical);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFsIdx(null);
      if (e.key === "ArrowLeft") fsPrev();
      if (e.key === "ArrowRight") fsNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fsIdx, active.length, fsOffset]);

  const handleTrackTransEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    const cur = fsIdxRef.current;
    if (cur === null || N <= 1) return;
    if (cur < N) {
      setNoTrans(true);
      setFsIdx(cur + N);
    } else if (cur >= 2 * N) {
      setNoTrans(true);
      setFsIdx(cur - N);
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setImageFile(f);
      const r = new FileReader();
      r.onload = () => setPreview(r.result as string);
      r.readAsDataURL(f);
    }
  };

  const handleAdd = async () => {
    if (!imageFile) {
      showToast("Pilih gambar dulu");
      return;
    }
    if (!addForm.caption.trim()) {
      showToast("Isi caption");
      return;
    }
    if (!addForm.expires_date) {
      showToast("Isi tanggal kadaluarsa");
      return;
    }
    const time = addForm.expires_time || "23:59";
    const expires_at = new Date(`${addForm.expires_date}T${time}:00`).toISOString();
    setUploadProgress(1);
    try {
      const { uploadToS3 } = await import("@/lib/s3-upload");
      const imageUrl = await uploadToS3(imageFile, setUploadProgress);
      dispatch({
        type: "ADD_PENGUMUMAN",
        payload: {
          id: st.nextId,
          image: imageUrl,
          caption: addForm.caption.trim(),
          expires_at,
          created_at: new Date().toISOString(),
          created_by: d.u?.name || "",
        },
      });
      setShowAdd(false);
      setAddForm({ image: "", caption: "", expires_date: "", expires_time: "" });
      setPreview("");
      setImageFile(null);
      setUploadProgress(0);
      showToast("Pengumuman ditambahkan");
    } catch (err) {
      setUploadProgress(0);
      showToast("Gagal mengunggah gambar");
      console.error(err);
    }
  };

  const handleDelete = (id: string | number) => {
    dispatch({ type: "DELETE_PENGUMUMAN", payload: id });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStoryIndex((i) => (i > 0 ? i - 1 : active.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStoryIndex((i) => (i < active.length - 1 ? i + 1 : 0));
  };

  const wheelRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - wheelRef.current < 600) return;
    wheelRef.current = now;
    if (e.deltaX > 0 || e.deltaY > 0) {
      setStoryIndex((i) => (i < active.length - 1 ? i + 1 : 0));
    } else {
      setStoryIndex((i) => (i > 0 ? i - 1 : active.length - 1));
    }
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardW = d.isMob ? 220 : 320;
  const gap = 10;
  const totalW = active.length * (cardW + gap) - gap;
  const carouselEl = carouselRef.current;
  const carouselW = carouselEl ? carouselEl.offsetWidth : d.isMob ? 360 : 1000;
  let offset = 0;
  if (carouselW > 0) {
    const target = (carouselW - cardW) / 2 - storyIndex * (cardW + gap);
    const maxOffset = (carouselW - cardW) / 2;
    const minOffset = (carouselW + cardW) / 2 - totalW;
    offset = Math.max(minOffset, Math.min(maxOffset, target));
  }

  const hasNav = active.length > 1;
  const fullscreenOverlay =
    fsIdx !== null && active.length > 0 ? (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setFsIdx(null)}
          onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.3)'}}
          onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}}
          style={{
            position: "absolute",
            top: d.isMob ? 12 : 20,
            right: d.isMob ? 12 : 20,
            zIndex: 20,
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          ✕
        </button>
        {hasNav && (
          <button
            onClick={fsPrev}
            onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.25)'}}
            onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.1)'}}
            style={{
              position: "absolute",
              left: d.isMob ? 6 : 20,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              border: "none",
              cursor: "pointer",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              borderRadius: "50%",
              width: d.isMob ? 36 : 44,
              height: d.isMob ? 36 : 44,
              fontSize: d.isMob ? 20 : 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ‹
          </button>
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            onTransitionEnd={handleTrackTransEnd}
            style={
              {
                display: "flex",
                transition: noTrans
                  ? "none"
                  : "transform .35s cubic-bezier(0.4,0,0.2,1)",
                transform: `translateX(calc(50vw - ${fsIdx + 0.5} * var(--fs-w)))`,
                height: "100%",
                width: "100%",
                "--fs-w": "88vw",
              } as any
            }
          >
            {loopItems.map((item, i) => {
              const diff = i - fsIdx;
              const isAdj = Math.abs(diff) <= 1;
              const cardTrans = noTrans
                ? "none"
                : "opacity .35s ease, transform .35s cubic-bezier(0.4,0,0.2,1)";
              return (
                <div
                  key={
                    item.id +
                    (i < fsOffset ? "-L" : i >= fsOffset + N ? "-R" : "")
                  }
                  style={{
                    flexShrink: 0,
                    width: "88vw",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    transition: cardTrans,
                    opacity: isAdj ? 1 : 0,
                    transform: `scale(${diff === 0 ? 1 : 0.88})`,
                    pointerEvents: diff === 0 ? "auto" : "none",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.caption}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: 8,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {hasNav && (
            <div
              onClick={fsPrev}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "40%",
                cursor: "pointer",
                zIndex: 5,
              }}
            />
          )}
          {hasNav && (
            <div
              onClick={fsNext}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "60%",
                cursor: "pointer",
                zIndex: 5,
              }}
            />
          )}
        </div>
        {loopItems[fsIdx].caption && (
          <div
            style={{
              position: "absolute",
              bottom: d.isMob ? 12 : 24,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: "80vw",
              background: "rgba(0,0,0,0.6)",
              padding: "10px 20px",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              textAlign: "center",
              zIndex: 10,
            }}
          >
            {loopItems[fsIdx].caption}
          </div>
        )}
      </div>
    ) : null;

  if (active.length === 0) {
    return (
      <div
        style={{
          animation: "silapFade .3s ease",
          paddingTop: 28,
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Pengumuman
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Informasi dan pengumuman PKK Desa Bunutwetan.
          </p>
        </div>
        {isAdmin && (
          <div style={{ marginBottom: 14, textAlign: "center" }}>
            {!showAdd ? (
              <button
                onClick={() => setShowAdd(true)}
                onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#047857'}}
                onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#059669'}}
                style={{
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "7px 14px",
                  background: "#059669",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                + Pengumuman Baru
              </button>
            ) : (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #d1fae5",
                  padding: 16,
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textAlign: "left",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}
                >
                  Tambah Pengumuman
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? "#059669" : "#d1fae5"}`,
                    borderRadius: 8,
                    padding: 24,
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragOver ? "#f0fdf4" : "#fff",
                    transition: "all .2s",
                    fontSize: 13,
                    color: "#94a3b8",
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    style={{ display: "none" }}
                  />
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        maxHeight: 160,
                        objectFit: "contain",
                        borderRadius: 8,
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    <span>
                      {dragOver
                        ? "Lepaskan gambar"
                        : "Klik atau seret gambar ke sini"}
                    </span>
                  )}
                </div>
                <input
                  value={addForm.caption}
                  onChange={(e) =>
                    setAddForm({ ...addForm, caption: e.target.value })
                  }
                  placeholder="Caption / keterangan"
                  style={{
                    width: "100%",
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    background: "#fff",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                />
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    value={addForm.expires_date}
                    onChange={(e) =>
                      setAddForm({ ...addForm, expires_date: e.target.value })
                    }
                    style={{
                      fontFamily: "inherit",
                      fontSize: 13,
                      padding: "6px 8px",
                      border: "1px solid #d1fae5",
                      background: "#fff",
                      color: "#1e293b",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Waktu (opsional)
                  </label>
                  <AnalogTimePicker
                    value={addForm.expires_time}
                    onChange={(v) =>
                      setAddForm({ ...addForm, expires_time: v })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setPreview("");
                      setImageFile(null);
                      setUploadProgress(0);
                    }}
                    onMouseEnter={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#d1fae5'}}
                    onMouseLeave={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#fff'}}
                    style={{
                      flex: 1,
                      border: "1px solid #d1fae5",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 0",
                      background: "#fff",
                      color: "#059669",
                      borderRadius: 6,
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAdd}
                    onMouseEnter={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#047857'}}
                    onMouseLeave={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#059669'}}
                    style={{
                      flex: 1.4,
                      border: "none",
                      cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 0",
                      background: uploadProgress > 0 ? "#94a3b8" : "#059669",
                      color: "#fff",
                      borderRadius: 6,
                      opacity: uploadProgress > 0 ? 0.7 : 1,
                    }}
                  >
                    Tambah
                  </button>
                </div>
                {uploadProgress > 0 && (
                  <div style={{ height: 5, background: "#d1fae5" }}>
                    <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#059669", transition: "width .2s ease" }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Belum ada pengumuman.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        animation: "silapFade .3s ease",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 28,
          textAlign: "center",
          maxWidth: 700,
          margin: "0 auto",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: d.rs.pageH1,
            fontWeight: 800,
            letterSpacing: "-.025em",
            color: "#0f172a",
            marginBottom: 7,
          }}
        >
          Pengumuman
        </h1>
        <p style={{ fontSize: "14.5px", color: "#475569" }}>
          Informasi dan pengumuman PKK Desa Bunutwetan.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: d.isMob ? 4 : 8,
            position: "relative",
            maxWidth: "calc(100vw - 32px)",
            margin: "0 auto",
          }}
        >
          {active.length > 1 && (
            <button
              onClick={handlePrev}
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.75)'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.55)'}}
              style={{
                border: "none",
                cursor: "pointer",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                backdropFilter: "blur(2px)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
                zIndex: 5,
              }}
            >
              ‹
            </button>
          )}
          <div
            ref={carouselRef}
            onWheel={handleWheel}
            style={{
              overflow: "hidden",
              width: "100%",
              borderRadius: 12,
              height: d.isMob ? 340 : 480,
            }}
          >
            <div
              style={{
                display: "flex",
                gap,
                transition: "transform .35s ease",
                transform: `translateX(${offset}px)`,
                height: "100%",
              }}
            >
              {active.map((item, i) => {
                const isActive = i === storyIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setStoryIndex(i);
                      setFsIdx(i + fsOffset);
                    }}
                    style={{
                      flexShrink: 0,
                      width: cardW,
                      height: "100%",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#000",
                      cursor: "pointer",
                      position: "relative",
                      transform: isActive ? "scale(1)" : "scale(0.9)",
                      transition: "transform .35s ease, opacity .3s",
                      opacity: isActive ? 1 : 0.8,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.caption}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "40px 14px 14px",
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          color: "#fff",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {item.caption}
                        </div>
                        <div
                          style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}
                        >
                          {item.expires_at
                            ? new Date(item.expires_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : ""}
                        </div>
                      </div>
                    )}
                    {isActive && isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.5)'}}
                        onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.25)'}}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          zIndex: 10,
                          border: "none",
                          cursor: "pointer",
                          background: "rgba(255,255,255,0.25)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 26,
                          height: 26,
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {active.length > 1 && (
            <button
              onClick={handleNext}
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.75)'}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.55)'}}
              style={{
                border: "none",
                cursor: "pointer",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                backdropFilter: "blur(2px)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
                zIndex: 5,
              }}
            >
              ›
            </button>
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -24,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              pointerEvents: "none",
            }}
          >
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => setStoryIndex(i)}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  background: i === storyIndex ? "#059669" : "#cbd5e1",
                  transition: "background .2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {isAdmin && !showAdd && (
        <div style={{ position: "absolute", top: 24, right: 24, zIndex: 20 }}>
          <button
            onClick={() => setShowAdd(true)}
            title="Tambah Pengumuman"
            onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#047857'}}
            onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#059669'}}
            style={{
              border: "none",
              cursor: "pointer",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#059669",
              color: "#fff",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
            }}
          >
            ＋
          </button>
        </div>
      )}

      {isAdmin && showAdd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #d1fae5",
              padding: 16,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>
                Tambah Pengumuman
              </div>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setPreview("");
                  setImageFile(null);
                  setUploadProgress(0);
                }}
                onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.color='#0f172a'}}
                onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.color='#475569'}}
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "none",
                  color: "#475569",
                  fontSize: 16,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#059669" : "#d1fae5"}`,
                borderRadius: 8,
                padding: 24,
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "#f0fdf4" : "#fff",
                transition: "all .2s",
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: "none" }}
              />
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    maxHeight: 160,
                    objectFit: "contain",
                    borderRadius: 8,
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <span>
                  {dragOver
                    ? "Lepaskan gambar"
                    : "Klik atau seret gambar ke sini"}
                </span>
              )}
            </div>

            <input
              value={addForm.caption}
              onChange={(e) =>
                setAddForm({ ...addForm, caption: e.target.value })
              }
              placeholder="Caption / keterangan"
              style={{
                width: "100%",
                fontFamily: "inherit",
                fontSize: 13,
                padding: "6px 8px",
                border: "1px solid #d1fae5",
                background: "#fff",
                color: "#1e293b",
                boxSizing: "border-box",
              }}
            />

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 3,
                }}
              >
                Tanggal Kadaluarsa
              </label>
              <input
                type="date"
                value={addForm.expires_date}
                onChange={(e) =>
                  setAddForm({ ...addForm, expires_date: e.target.value })
                }
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "6px 8px",
                  border: "1px solid #d1fae5",
                  background: "#fff",
                  color: "#1e293b",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 3,
                }}
              >
                Waktu (opsional)
              </label>
              <AnalogTimePicker
                value={addForm.expires_time}
                onChange={(v) => setAddForm({ ...addForm, expires_time: v })}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setPreview("");
                  setImageFile(null);
                  setUploadProgress(0);
                }}
                onMouseEnter={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#d1fae5'}}
                onMouseLeave={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#fff'}}
                style={{
                  flex: 1,
                  border: "1px solid #d1fae5",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 0",
                  background: "#fff",
                  color: "#059669",
                  borderRadius: 6,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                onMouseEnter={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#047857'}}
                onMouseLeave={uploadProgress > 0 ? undefined : (e)=>{(e.currentTarget as HTMLElement).style.background='#059669'}}
                style={{
                  flex: 1.4,
                  border: "none",
                  cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 0",
                  background: uploadProgress > 0 ? "#94a3b8" : "#059669",
                  color: "#fff",
                  borderRadius: 6,
                  opacity: uploadProgress > 0 ? 0.7 : 1,
                }}
              >
                Tambah
              </button>
            </div>
            {uploadProgress > 0 && (
              <div style={{ height: 5, background: "#d1fae5" }}>
                <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#059669", transition: "width .2s ease" }} />
              </div>
            )}
          </div>
        </div>
      )}

      {fullscreenOverlay}
    </div>
  );
}

export function LaporanSection({ d, st, dispatch, showToast }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReportGroups = d.reportGroups
    .map((g: any) => ({
      ...g,
      reports: searchItems(g.reports, searchQuery),
    }))
    .filter((g: any) => g.reports.length > 0);

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Laporan");
    ws.columns = [
      { width: 5 },
      { width: 16 },
      { width: 22 },
      { width: 18 },
      { width: 14 },
      { width: 50 },
      { width: 12 },
    ];
    const hdr = ws.addRow([
      "No",
      "Tanggal",
      "Pelapor",
      "Kontak",
      "Pokja",
      "Uraian",
      "Status",
    ]);
    hdr.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Calibri",
    };
    hdr.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    hdr.alignment = { horizontal: "center", vertical: "middle" };
    st.reports.forEach((r, i) =>
      ws.addRow([
        i + 1,
        r.date,
        r.name,
        r.contact,
        r.pokja,
        r.desc,
        STATUS_LABEL[r.status] || r.status,
      ]),
    );
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Laporan-Warga-PENDESA-P3S.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("File Excel berhasil diunduh");
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: d.rs.pageH1,
            fontWeight: 800,
            letterSpacing: "-.025em",
            color: "#0f172a",
            marginBottom: 7,
          }}
        >
          Laporan Warga
        </h1>
        <p style={{ fontSize: "14.5px", color: "#475569" }}>
          Sampaikan laporan atau usulan. Pengurus dapat mengekspor ke Excel.
        </p>
      </div>
      <div style={d.rs.laporanGrid}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            Form Laporan
          </div>
          <label
            style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 5,
            }}
          >
            Nama Pelapor
          </label>
          <input
            value={st.rf.name}
            onChange={(e) =>
              dispatch({ type: "SET_RF", payload: { name: e.target.value } })
            }
            placeholder="Nama lengkap"
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 12,
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
          <label
            style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 5,
            }}
          >
            Kontak (WA/Telepon)
          </label>
          <input
            value={st.rf.contact}
            onChange={(e) =>
              dispatch({ type: "SET_RF", payload: { contact: e.target.value } })
            }
            placeholder="08xx"
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 12,
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
          <label
            style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 5,
            }}
          >
            Ditujukan ke Pokja
          </label>
          <select
            value={st.rf.category}
            onChange={(e) =>
              dispatch({
                type: "SET_RF",
                payload: { category: e.target.value },
              })
            }
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 12,
              background: "#f8fafc",
              color: "#1e293b",
            }}
          >
            <option>Pokja I — Pancasila &amp; Gotong Royong</option>
            <option>Pokja II — Pendidikan &amp; Keterampilan</option>
            <option>Pokja III — Pangan, Sandang &amp; Rumah</option>
            <option>Pokja IV — Kesehatan &amp; Lingkungan</option>
          </select>
          <label
            style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 5,
            }}
          >
            Uraian Laporan
          </label>
          <textarea
            value={st.rf.desc}
            onChange={(e) =>
              dispatch({ type: "SET_RF", payload: { desc: e.target.value } })
            }
            placeholder="Tuliskan laporan Anda…"
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 14,
              background: "#f8fafc",
              color: "#1e293b",
              minHeight: 80,
              resize: "vertical",
            }}
          ></textarea>
          <button
            onClick={() => {
              if (!st.rf.name.trim() || !st.rf.desc.trim()) {
                showToast("Lengkapi nama & uraian laporan");
                return;
              }
              const pk = st.rf.category.split(" — ")[0];
              const now = new Date();
              const todayStr = `${now.getDate()} ${MONTH_NAMES_SHORT[now.getMonth()]} ${now.getFullYear()}`;
              dispatch({
                type: "ADD_REPORT",
                payload: {
                  id: st.nextId,
                  date: todayStr,
                  name: st.rf.name.trim(),
                  contact: st.rf.contact.trim() || "—",
                  pokja: pk,
                  desc: st.rf.desc.trim(),
                  status: "Masuk",
                },
              });
              showToast("Laporan terkirim, terima kasih!");
            }}
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "14.5px",
              fontWeight: 700,
              padding: 13,
              background: "#1e3a5f",
              color: "#fff",
            }}
          >
            Kirim Laporan
          </button>
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 18,
            overflow: "hidden",
          }}
        >
          {d.u ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}
                  >
                    Rekap Laporan Masuk
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                    {st.reports.length} laporan
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari laporan…"
                  style={{
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "9px 12px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#1e293b",
                    outline: "none",
                    width: "100%",
                    maxWidth: 220,
                    boxSizing: "border-box" as const,
                  }}
                />
            <button
              onClick={handleExportExcel}
              style={{
                border: "1px solid #1e3a5f",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                color: "#1e3a5f",
                background: "#eef2ff",
                padding: "9px 16px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>▦</span> Export Excel
          </button>
          </div>
        </div>
            {filteredReportGroups.length === 0 && searchQuery ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
                Tidak ditemukan
              </div>
            ) : d.isMob ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredReportGroups.map((g: any, gi: number) => (
              <Fragment key={gi}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f", padding: "8px 11px", background: "#eef2ff", border: "1px solid #e2e8f0" }}>{g.monthLabel}</div>
                {g.reports.map((r: any, i: number) => (
                  <div key={`${gi}-${i}`} style={{ border: "1px solid #e2e8f0", padding: "11px 13px", background: i % 2 ? "#f8fafc" : "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>#{r.no} {r.name}</div>
                      <button onClick={r.onStatus} style={{ border: "none", cursor: r.statusCursor, fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "4px 10px", background: r.statusBg, color: r.statusColor, whiteSpace: "nowrap", flexShrink: 0 }}>{STATUS_LABEL[r.status] || r.status}</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{r.date} · {r.pokja}</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>{r.desc}</div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="silap-scroll" style={{ overflowX: "auto", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", minWidth: 580 }}>
              <thead>
                <tr style={{ background: "#1e3a5f", color: "#fff", textAlign: "left" }}>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>No</th>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>Tanggal</th>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>Pelapor</th>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>Pokja</th>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>Uraian</th>
                  <th style={{ padding: "9px 11px", fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReportGroups.map((g: any, gi: number) => (
                  <Fragment key={gi}>
                    <tr style={{ background: "#eef2ff" }}>
                      <td colSpan={6} style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f", padding: "8px 11px" }}>{g.monthLabel}</td>
                    </tr>
                    {g.reports.map((r: any, i: number) => (
                      <tr key={`${gi}-${i}`} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 ? "#f8fafc" : "#fff" }}>
                        <td style={{ padding: "9px 11px", color: "#94a3b8", fontWeight: 600 }}>{r.no}</td>
                        <td style={{ padding: "9px 11px", color: "#334155", whiteSpace: "nowrap" }}>{r.date}</td>
                        <td style={{ padding: "9px 11px", color: "#1e293b", fontWeight: 700 }}>{r.name}</td>
                        <td style={{ padding: "9px 11px", color: "#475569", whiteSpace: "nowrap" }}>{r.pokja}</td>
                        <td style={{ padding: "9px 11px", color: "#334155", maxWidth: 200 }}>{r.desc}</td>
                        <td style={{ padding: "9px 11px" }}>
                          <button onClick={r.onStatus} style={{ border: "none", cursor: r.statusCursor, fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "4px 10px", background: r.statusBg, color: r.statusColor, whiteSpace: "nowrap" }}>{STATUS_LABEL[r.status] || r.status}</button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 14,
                }}
              >
                Rekap Laporan Masuk
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {(["Baru", "Diproses", "Selesai"] as const).map((status) => {
                  const s = STATUS[status];
                  const count = st.reports.filter(
                    (r) => r.status === status,
                  ).length;
                  return (
                    <div
                      key={status}
                      style={{
                        flex: "1 1 150px",
                        background: s.bg,
                        padding: "16px 18px",
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: s.color,
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: s.color,
                          marginTop: 4,
                        }}
                      >
                        {STATUS_LABEL[status]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardSection({
  d,
  st,
  dispatch,
  openPokja,
  showToast,
}: Props) {
  const [pwdForm, setPwdForm] = useState({ current: "", baru: "", confirm: "" });
  const [avatarHover, setAvatarHover] = useState(false);
  const handleChangePassword = () => {
    const u = d.u;
    if (!u) return;
    if (!pwdForm.current) { showToast("Masukkan password saat ini"); return; }
    if (pwdForm.current !== u.password) { showToast("Password saat ini salah"); return; }
    if (!pwdForm.baru) { showToast("Masukkan password baru"); return; }
    if (pwdForm.baru.length < 6) { showToast("Password baru minimal 6 karakter"); return; }
    if (pwdForm.baru !== pwdForm.confirm) { showToast("Konfirmasi password tidak cocok"); return; }
    dispatch({
      type: "UPDATE_USER",
      payload: { ...u, password: pwdForm.baru },
    });
    setPwdForm({ current: "", baru: "", confirm: "" });
    showToast("Password berhasil diubah");
  };
  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1e3a5f,#15294a)",
          padding: d.rs.dashHeroPad,
          color: "#fff",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          onClick={() => dispatch({ type: "SET_AVATAR_MODAL", payload: true })}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
          title="Edit foto profil"
          style={{
            cursor: "pointer",
            width: 64,
            height: 64,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
            border: "3px solid rgba(255,255,255,.35)",
            borderRadius: "50%",
          }}
        >
          <div style={d.userVals.avatarStyleLg}>
            {d.userVals.avatarInitialLg}
          </div>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: avatarHover ? "rgba(0,0,0,.45)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s",
          }}>
            <svg style={{ opacity: avatarHover ? 1 : 0, transition: "opacity .2s" }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12.5px", fontWeight: 600, opacity: 0.85 }}>
            Selamat datang kembali,
          </div>
          <div
            style={{
              fontSize: d.rs.dashWelcome,
              fontWeight: 800,
              letterSpacing: "-.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {d.userVals.name}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
            {d.userVals.roleLabel} · {d.userVals.scope}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: d.isMob ? "space-between" : undefined,
            gap: d.isMob ? "10px" : "14px",
            flexWrap: "wrap",
            width: d.isMob ? "100%" : undefined,
          }}
        >
          {d.dashStats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,.15)",
                padding: d.isMob ? "10px 14px" : "12px 18px",
                textAlign: "center",
                flex: d.isMob ? 1 : undefined,
                minWidth: d.isMob ? 0 : 100,
              }}
            >
              <div
                style={{
                  fontSize: d.isMob ? 20 : 24,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: d.isMob ? 10 : "11px",
                  opacity: 0.85,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 20,
          marginBottom: d.isMob ? "16px" : "20px",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 5,
          }}
        >
          Hak Akses Anda
        </div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
          {d.userVals.accessNote}
        </div>
        <div style={d.rs.dashQA}>
          {d.quickActions.map((q, i) => (
            <button
              key={i}
              onClick={q.onClick}
              style={{
                cursor: "pointer",
                fontFamily: "inherit",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "28px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: q.tint,
                  color: q.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {q.glyph}
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {q.title}
                </div>
                <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                  {q.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {d.userVals.isAdmin && (
        <div
          style={{
            marginTop: 18,
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                Manajemen Akun
              </div>
              <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                {st.users.length} akun terdaftar
              </div>
            </div>
            <button
              onClick={() => {
                const cu = d.u;
                const role = "anggota";
                const pokja = cu && cu.pokja ? String(cu.pokja) : "1";
                dispatch({
                  type: "SET_USER_MODAL",
                  payload: {
                    mode: "add",
                    editId: null,
                    form: { nik: "", name: "", password: "", role, pokja },
                    error: "",
                  },
                });
              }}
              style={{
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13.5px",
                fontWeight: 700,
                padding: "9px 18px",
                background: "#1e3a5f",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              ＋ Tambah Akun
            </button>
          </div>
          {d.isMob ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {d.allUsers.map((au, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "12px 14px",
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={au.avatarStyle as React.CSSProperties}>
                      {au.avatarInitial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#1e293b" }}>
                        {au.name}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "ui-monospace,monospace", color: "#94a3b8", letterSpacing: ".04em" }}>
                        {au.nikMasked}
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={au.onEdit}
                        style={{
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          color: "#1e3a5f",
                          padding: "7px 11px",
                        }}
                      >
                        Edit
                      </button>
                      {au.canDelete && (
                        <button
                          onClick={au.onDelete}
                          style={{
                            border: "1px solid #fef2f2",
                            background: "#fdf2f2",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#ef4444",
                            padding: "7px 11px",
                          }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: "12.5px", color: "#475569" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 9px",
                        background: au.roleBg,
                        color: au.roleColor,
                      }}
                    >
                      {au.roleLabel}
                    </span>
                    <span style={{ color: "#94a3b8" }}>{au.pokjaName}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div
            className="silap-scroll"
            style={{ overflowX: "auto", border: "1px solid #e2e8f0" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                minWidth: 520,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#1e3a5f",
                    color: "#fff",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "9px 12px", fontWeight: 700 }}>Nama</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700 }}>NIK</th>
                  <th style={{ padding: "9px 12px", fontWeight: 700 }}>
                    Peran
                  </th>
                  <th style={{ padding: "9px 12px", fontWeight: 700 }}>
                    Pokja
                  </th>
                  <th style={{ padding: "9px 12px", fontWeight: 700 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {d.allUsers.map((au, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: au.rowBg,
                    }}
                  >
                    <td style={{ padding: "9px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div style={au.avatarStyle as React.CSSProperties}>
                          {au.avatarInitial}
                        </div>
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>
                          {au.name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontFamily: "ui-monospace,monospace",
                        fontSize: 11,
                        color: "#94a3b8",
                        letterSpacing: ".04em",
                      }}
                    >
                      {au.nikMasked}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 9px",
                          background: au.roleBg,
                          color: au.roleColor,
                        }}
                      >
                        {au.roleLabel}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        color: "#475569",
                        fontSize: "12.5px",
                      }}
                    >
                      {au.pokjaName}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={au.onEdit}
                          style={{
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#1e3a5f",
                            padding: "5px 11px",
                          }}
                        >
                          Edit
                        </button>
                        {au.canDelete && (
                          <button
                            onClick={au.onDelete}
                            style={{
                              border: "1px solid #fef2f2",
                              background: "#fdf2f2",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              color: "#ef4444",
                              padding: "5px 11px",
                            }}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
      {!d.userVals.isAdmin && (
        <div style={{ marginTop: 18, background: "#fff", border: "1px solid #e2e8f0", padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Ganti Password</div>
          <div style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: 14 }}>Ubah password akun Anda</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
            <input type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} placeholder="Password saat ini" style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }} />
            <input type="password" value={pwdForm.baru} onChange={(e) => setPwdForm({ ...pwdForm, baru: e.target.value })} placeholder="Password baru" style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }} />
            <input type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} placeholder="Konfirmasi password baru" style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }} />
            <button onClick={handleChangePassword} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "10px 18px", background: "#1e3a5f", color: "#fff", alignSelf: "flex-start" }}>Simpan</button>
          </div>
        </div>
      )}
      {d.userVals.isKetua && (
        <div
          style={{
            marginTop: 18,
            background: "#fff",
            border: "1px solid #e2e8f0",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                Anggota {d.userVals.scope}
              </div>
              <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                {d.pokjaMemberList.length} anggota
              </div>
            </div>
          </div>
          {d.pokjaMemberList.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {d.pokjaMemberList.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div style={m.avatarStyle as React.CSSProperties}>
                    {m.avatarInitial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontFamily: "ui-monospace,monospace",
                        color: "#94a3b8",
                      }}
                    >
                      {m.nikMasked}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#7c3aed",
                      background: "#f3e8ff",
                      padding: "4px 9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Anggota
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: 24,
                color: "#cbd5e1",
                fontSize: "13.5px",
              }}
            >
              Belum ada anggota. Klik <strong>＋ Tambah Anggota</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BlogPostSection({
  d,
  st,
  dispatch,
  go,
}: {
  d: DerivedData;
  st: AppState;
  dispatch: Dispatch<AppAction>;
  go: (route: string) => void;
}) {
  const post = st.viewingPost || (st.route === "post" && st.blogDate && st.blogSlug ? findBlogPostBySlug(st.blogDate, st.blogSlug, d.blogPosts) : null) || (st.route === "post" ? d.blogPosts[0] : null);
  if (!post) {
    return (
      <div
        style={{
          animation: "silapFade .3s ease",
          paddingTop: 28,
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>
          Artikel tidak ditemukan
        </div>
        <button
          onClick={() => go("inovasi")}
          style={{
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            padding: "10px 20px",
            background: "#1e3a5f",
            color: "#fff",
            marginTop: 12,
          }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        animation: "silapFade .3s ease",
        paddingTop: 28,
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => {
          dispatch({ type: "SET_VIEWING_POST", payload: null });
          go("inovasi");
        }}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 700,
          color: "#64748b",
          padding: 0,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← Kembali ke Inovasi Desa
      </button>

      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2563eb",
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}
        >
          {post.category}
        </span>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#0f172a",
            margin: "8px 0 6px",
            lineHeight: 1.2,
            letterSpacing: "-.02em",
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#94a3b8",
          }}
        >
          <span style={{ fontWeight: 600, color: "#64748b" }}>
            {post.author}
          </span>
          <span>·</span>
          <span title={post.created_at}>{formatDate(post.created_at)}</span>
        </div>
      </div>

      <div style={{ height: 1, background: "#e2e8f0", marginBottom: 28 }} />

      <style>{`.wmde-markdown { background: transparent !important; } .wmde-markdown h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 28px 0 12px; letter-spacing: -.01em; } .wmde-markdown h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 22px 0 10px; } .wmde-markdown p { margin: 0 0 12px; } .wmde-markdown ul, .wmde-markdown ol { padding-left: 22px; margin: 8px 0 14px; } .wmde-markdown li { margin-bottom: 4px; } .wmde-markdown img { display: block; margin: 16px auto; max-width: 100%; min-width: 70%; height: auto; }`}</style>
      <div style={{ fontSize: 15, lineHeight: 1.85, color: "#334155" }}>
        <MDEditor.Markdown source={post.content} />
      </div>
    </div>
  );
}

export function InovasiSection({
  d,
  st,
  dispatch,
  go,
}: {
  d: DerivedData;
  st: AppState;
  dispatch: Dispatch<AppAction>;
  go: (route: string) => void;
}) {
  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          flexWrap: d.isMob ? "wrap" : undefined,
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Inovasi Desa
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Berita dan inovasi terbaru dari Desa Bunutwetan.
          </p>
        </div>
        {d.u && d.u.role === "admin" && (
          <button
            onClick={() => {
              dispatch({ type: "SET_POST_MODAL", payload: null });
              go("editor");
            }}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 18px",
              background: "#1e3a5f",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + Artikel Baru
          </button>
        )}
      </div>
      {d.blogPosts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12, color: "#cbd5e1" }}>
            📄
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: 4,
            }}
          >
            Belum ada artikel
          </div>
          <div style={{ fontSize: 13, color: "#cbd5e1" }}>
            Artikel yang diterbitkan akan muncul di sini.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {d.blogPosts.map((post: any) => (
            <div
              key={post.id}
              onClick={() => {
                dispatch({ type: "SET_VIEWING_POST", payload: post });
                go("post");
              }}
              style={{
                display: "flex",
                flexDirection: d.isMob ? "column" : "row",
                background: "#fff",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1e3a5f";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: d.isMob ? "100%" : 240,
                  minWidth: d.isMob ? "100%" : 240,
                  height: d.isMob ? 180 : 150,
                  background: firstImageUrl(post.content)
                    ? `#eef2ff center/cover no-repeat url(${firstImageUrl(post.content)})`
                    : "repeating-linear-gradient(135deg,#f1f5f9,#f1f5f9 10px,#f8fafc 10px,#f8fafc 20px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {!firstImageUrl(post.content) && (
                  <span
                    style={{
                      fontFamily: "ui-monospace,monospace",
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    [ {post.category} ]
                  </span>
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#2563eb",
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    {post.category}
                  </span>
                  <h2
                    style={
                      {
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.25,
                        margin: "0 0 6px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as any,
                        overflow: "hidden",
                      } as any
                    }
                  >
                    {post.title}
                  </h2>
                  <p
                    style={
                      {
                        fontSize: "13px",
                        color: "#475569",
                        lineHeight: 1.6,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as any,
                        overflow: "hidden",
                      } as any
                    }
                  >
                    {post.excerpt}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: 10,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {post.author}
                    </span>
                    <span
                      title={post.created_at}
                      style={{ fontSize: 12, color: "#cbd5e1" }}
                    >
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  {d.u && d.u.role === "admin" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: "SET_POST_MODAL",
                            payload: {
                              mode: "edit",
                              editId: post.id,
                              form: {
                                title: post.title,
                                excerpt: post.excerpt,
                                content: post.content,
                                category: post.category,
                              },
                            },
                          });
                          go("editor");
                        }}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#2563eb",
                          padding: 0,
                          marginRight: 8,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: "DELETE_BLOG_POST",
                            payload: post.id,
                          });
                        }}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#ef4444",
                          padding: 0,
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function escapeMd(text: string) {
  return text.replace(/([#*_`\[\]()>~\-+\\!|])/g, "\\$1");
}

function firstImageUrl(md: string) {
  const m = md.match(/!\[.*?\]\((.+?)\)/);
  return m ? m[1] : null;
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (md: string) => void;
}) {
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const [sourceMode, setSourceMode] = useState(false);

  const activeParaKey = useRef(new PluginKey("active-para"));
  const activeParaPlugin = useRef<Plugin | null>(null);

  if (!activeParaPlugin.current) {
    const key = activeParaKey.current;
    activeParaPlugin.current = new Plugin({
      key,
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply(tr) {
          const { from, to } = tr.selection;
          if (from !== to) return DecorationSet.empty;
          const $pos = tr.doc.resolve(from);
          for (let d = $pos.depth; d > 0; d--) {
            const node = $pos.node(d);
            if (node.type.isBlock && node.type.name !== "doc") {
              return DecorationSet.create(tr.doc, [
                Decoration.node($pos.before(d), $pos.after(d), {
                  class: "active-para",
                }),
              ]);
            }
          }
          return DecorationSet.empty;
        },
      },
      props: {
        decorations(state) {
          return key.getState(state) as DecorationSet | undefined;
        },
      },
    });
  }

  const { get } = useEditor((root) => {
    return Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, value || "");
        ctx.update(prosePluginsCtx, (prev) => [
          ...prev,
          activeParaPlugin.current!,
        ]);
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          dispatchTransaction: (tr) => {
            const view = ctx.get(editorViewCtx);
            view.updateState(view.state.apply(tr));
            const serializer = ctx.get(serializerCtx);
            changeRef.current(serializer(view.state.doc));
          },
        }));
      })
      .use(commonmark)
      .use(history);
  }, []);

  useEffect(() => {
    const editor = get();
    if (editor && value) {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const current = ctx.get(serializerCtx)(view.state.doc);
        if (current !== value) {
          const parser = ctx.get(parserCtx);
          const doc = parser(value);
          if (doc)
            view.dispatch(
              view.state.tr.replaceWith(0, view.state.doc.content.size, doc),
            );
        }
      });
    }
  }, [value, get]);

  const tbBtn = (label: string, onAct: () => void, active?: boolean) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAct}
      style={{
        border: active ? "1px solid #1e3a5f" : "1px solid #e2e8f0",
        background: active ? "#eef2ff" : "#fff",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 700,
        padding: "6px 10px",
        color: active ? "#1e3a5f" : "#1e293b",
        minWidth: 32,
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );

  const tbSep = () => (
    <span
      style={{
        width: 1,
        background: "#e2e8f0",
        margin: "0 4px",
        display: "inline-block",
        height: 20,
        alignSelf: "center",
      }}
    />
  );

  const insertImage = () => {
    const url = prompt("URL gambar:");
    if (!url) return;
    get()?.action((ctx) => {
      const parser = ctx.get(parserCtx);
      const view = ctx.get(editorViewCtx);
      const { from, to } = view.state.selection;
      const imgDoc = parser(`![](${url})`);
      if (imgDoc) {
        const tr = view.state.tr.replaceWith(from, to, imgDoc.content);
        view.dispatch(tr);
      }
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (sourceMode) return;
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const escaped = escapeMd(text);
    const editor = get();
    if (editor) {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        view.dispatch(view.state.tr.insertText(escaped));
      });
    }
  };

  const toggleSource = () => {
    if (sourceMode) {
      const editor = get();
      if (editor) {
        editor.action((ctx) => {
          const parser = ctx.get(parserCtx);
          const view = ctx.get(editorViewCtx);
          const doc = parser(value);
          if (doc)
            view.dispatch(
              view.state.tr.replaceWith(0, view.state.doc.content.size, doc),
            );
        });
      }
    }
    setSourceMode(!sourceMode);
  };

  return (
    <div>
      <style>{`.milkdown { padding: 14px; overflow-wrap: break-word; word-break: break-word; min-height: 280px; }
.milkdown .ProseMirror { min-height: 280px; }
.milkdown h1 { font-size: 28px; font-weight: 800; margin: 20px 0 10px; line-height: 1.25; color: #0f172a; }
.milkdown h2 { font-size: 22px; font-weight: 700; margin: 18px 0 8px; line-height: 1.3; color: #0f172a; }
.milkdown h3 { font-size: 18px; font-weight: 700; margin: 14px 0 6px; }
.milkdown h4 { font-size: 16px; font-weight: 700; margin: 12px 0 6px; color: #1e293b; }
.milkdown p { margin: 0; color: #334155; line-height: 1.7; }
.milkdown ul, .milkdown ol { padding-left: 24px; margin: 6px 0; }
.milkdown li { margin-bottom: 3px; }
.milkdown blockquote { border-left: 4px solid #1e3a5f; margin: 10px 0; padding: 6px 14px; background: #f8fafc; color: #475569; }
.milkdown img { display: block !important; margin: 16px auto !important; max-width: 100%; min-width: 70%; height: auto; float: none !important; }
.milkdown p:has(> img:only-child) { text-align: center; }
.milkdown .active-para { box-shadow: 0 0 0 2px #1e3a5f; border-radius: 4px; background: #f0f4ff; }
.milkdown p:hover, .milkdown h1:hover, .milkdown h2:hover, .milkdown h3:hover, .milkdown h4:hover, .milkdown blockquote:hover, .milkdown li:hover { background: #f1f5f9; border-radius: 4px; }
.milkdown p, .milkdown h1, .milkdown h2, .milkdown h3, .milkdown h4, .milkdown blockquote, .milkdown li { padding: 4px 8px; margin: 4px 0; border-radius: 4px; transition: background .15s; }
`}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: 8,
          padding: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        {tbBtn("B", () => get()?.action(() => toggleStrongCommand.run()))}
        {tbBtn("I", () => get()?.action(() => toggleEmphasisCommand.run()))}
        {tbSep()}
        {tbBtn("H1", () => get()?.action(() => wrapInHeadingCommand.run(1)))}
        {tbBtn("H2", () => get()?.action(() => wrapInHeadingCommand.run(2)))}
        {tbBtn("H3", () => get()?.action(() => wrapInHeadingCommand.run(3)))}
        {tbBtn("H4", () => get()?.action(() => wrapInHeadingCommand.run(4)))}
        {tbBtn("P", () => get()?.action(() => turnIntoTextCommand.run()))}
        {tbSep()}
        {tbBtn("•", () => get()?.action(() => wrapInBulletListCommand.run()))}
        {tbBtn("1.", () => get()?.action(() => wrapInOrderedListCommand.run()))}
        {tbSep()}
        {tbBtn("🖼", insertImage)}
        {tbSep()}
        {tbBtn("↩", () => get()?.action(() => undoCommand.run()))}
        {tbBtn("↪", () => get()?.action(() => redoCommand.run()))}
        {tbSep()}
        {tbBtn(sourceMode ? "Rendered" : "Source", toggleSource, sourceMode)}
      </div>
      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          style={{
            width: "100%",
            minHeight: 320,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 14,
            padding: 14,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
            resize: "vertical" as const,
          }}
        />
      ) : (
        <div
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            maxHeight: "55vh",
            overflowY: "auto" as const,
          }}
          onPaste={handlePaste}
        >
          <Milkdown />
        </div>
      )}
    </div>
  );
}

export function EditorSection({
  d,
  st,
  dispatch,
  go,
  showToast,
}: {
  d: DerivedData;
  st: AppState;
  dispatch: Dispatch<AppAction>;
  go: (route: string) => void;
  showToast: (msg: string) => void;
}) {
  const isEdit = st.postModal?.mode === "edit";
  const [title, setTitle] = useState(isEdit ? st.postModal!.form.title : "");
  const [category, setCategory] = useState(
    isEdit ? st.postModal!.form.category : "Inovasi Desa",
  );
  const [excerpt, setExcerpt] = useState(
    isEdit ? st.postModal!.form.excerpt : "",
  );
  const [content, setContent] = useState(
    isEdit ? st.postModal!.form.content : "",
  );

  const handleSave = () => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      showToast("Lengkapi judul, ringkasan, dan konten artikel");
      return;
    }
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      author: "Sekretaris",
      date: new Date().toISOString().split("T")[0],
    };
    if (isEdit) {
      dispatch({
        type: "UPDATE_BLOG_POST",
        payload: { ...payload, id: st.postModal!.editId! } as any,
      });
      go("inovasi");
    } else {
      dispatch({
        type: "ADD_BLOG_POST",
        payload: { ...payload, id: st.nextId } as any,
      });
      showToast('Artikel "' + title.trim() + '" diterbitkan');
      go("inovasi");
    }
  };

  return (
    <div
      style={{
        animation: "silapFade .3s ease",
        paddingTop: 28,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => go("inovasi")}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
            color: "#64748b",
            padding: 0,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Kembali ke Inovasi Desa
        </button>
        <h1
          style={{
            fontSize: d.rs.pageH1,
            fontWeight: 800,
            letterSpacing: "-.025em",
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          {isEdit
            ? "Perbarui konten artikel yang sudah ada."
            : "Gunakan editor untuk menulis berita atau pengumuman desa."}
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 24,
          marginBottom: 16,
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 5,
          }}
        >
          Judul Artikel
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="cth: Kegiatan Posyandu Balita Bulan Juni"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 24,
            fontWeight: 700,
            padding: "11px 13px",
            border: "1px solid #e2e8f0",
            marginBottom: 16,
            background: "#f8fafc",
            color: "#1e293b",
          }}
        />

        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: 5,
              }}
            >
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                fontFamily: "inherit",
                fontSize: 14,
                padding: "11px 13px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#1e293b",
              }}
            >
              <option value="Inovasi Desa">Inovasi Desa</option>
              <option value="Program Kerja">Program Kerja</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Pengumuman">Pengumuman</option>
            </select>
          </div>
        </div>

        <label
          style={{
            display: "block",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 5,
          }}
        >
          Ringkasan (tampil di daftar artikel)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Ringkasan singkat artikel (plain text)"
          rows={2}
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 14,
            padding: "11px 13px",
            border: "1px solid #e2e8f0",
            marginBottom: 20,
            background: "#f8fafc",
            color: "#1e293b",
            resize: "vertical" as const,
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 5,
          }}
        >
          Konten Artikel
        </label>
        <RichEditor value={content} onChange={setContent} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginBottom: 40,
        }}
      >
            <button
              onClick={() => go("laporan")}
              style={{
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: d.rs.btnFont,
                fontWeight: 700,
                padding: d.rs.btnPad,
                background: "#fff",
                color: "#334155",
              }}
            >
              Kirim Laporan
            </button>
        <button
          onClick={handleSave}
          style={{
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            padding: "11px 24px",
            background: "#1e3a5f",
            color: "#fff",
          }}
        >
          {isEdit ? "Simpan Perubahan" : "Terbitkan"}
        </button>
      </div>
    </div>
  );
}

const JABATAN_OPTIONS = [
  "Pembina",
  "Penasehat",
  "Ketua TP. PKK",
  "Wakil Ketua",
  "Sekretaris I",
  "Sekretaris II",
  "Bendahara",
  "Ketua Pokja I",
  "Ketua Pokja II",
  "Ketua Pokja III",
  "Ketua Pokja IV",
  "Anggota Pokja I",
  "Anggota Pokja II",
  "Anggota Pokja III",
  "Anggota Pokja IV",
];

const toDateInput = (v: string) => (v ? v.split("/").reverse().join("-") : "");
const fromDateInput = (v: string) =>
  v ? v.split("-").reverse().join("/") : "";

const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
  Pembina: { bg: "#1e3a5f", text: "#fff" },
  Penasehat: { bg: "#0d9488", text: "#fff" },
  "Ketua TP. PKK": { bg: "#7c3aed", text: "#fff" },
  "Wakil Ketua": { bg: "#4f46e5", text: "#fff" },
  "Sekretaris I": { bg: "#2563eb", text: "#fff" },
  "Sekretaris II": { bg: "#3b82f6", text: "#fff" },
  Bendahara: { bg: "#d97706", text: "#fff" },
  "Ketua Pokja I": { bg: "#0891b2", text: "#fff" },
  "Ketua Pokja II": { bg: "#059669", text: "#fff" },
  "Ketua Pokja III": { bg: "#ca8a04", text: "#fff" },
  "Ketua Pokja IV": { bg: "#ea580c", text: "#fff" },
};
const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA", "D1", "S1", "S2", "-"];
const STATUS_OPTIONS = ["Menikah", "Cerai Hidup", "Cerai Mati", "Janda", "-"];

const ic: React.CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 11,
  padding: "4px 6px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1e293b",
  boxSizing: "border-box",
};
const sc: React.CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 11,
  padding: "4px 6px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1e293b",
  boxSizing: "border-box",
};

function PKKAddForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: any;
  setForm: (f: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 3,
          }}
        >
          Nama
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nama lengkap"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
          }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Jabatan
          </label>
          <select
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          >
            {JABATAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Jenis Kelamin
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          >
            <option value="">—</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Tempat Lahir
          </label>
          <input
            value={form.birth_place}
            onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
            placeholder="Kota"
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Tanggal Lahir
          </label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Status
          </label>
          <select
            value={form.marital_status}
            onChange={(e) =>
              setForm({ ...form, marital_status: e.target.value })
            }
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            Pendidikan
          </label>
          <select
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          >
            {PENDIDIKAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 3,
          }}
        >
          Pekerjaan
        </label>
        <input
          value={form.occupation}
          onChange={(e) => setForm({ ...form, occupation: e.target.value })}
          placeholder="Pekerjaan"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 3,
          }}
        >
          Alamat
        </label>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Alamat"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 3,
          }}
        >
          Status Keanggotaan
        </label>
        <select
          value={form.membership_status}
          onChange={(e) =>
            setForm({ ...form, membership_status: e.target.value })
          }
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
          }}
        >
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
            padding: 10,
            background: "#fff",
            color: "#475569",
          }}
        >
          Batal
        </button>
        <button
          onClick={onSave}
          style={{
            flex: 1.4,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
            padding: 10,
            background: "#1e3a5f",
            color: "#fff",
          }}
        >
          Tambah
        </button>
      </div>
    </div>
  );
}

export function PKKMembersSection({ d, st, dispatch, showToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    position: "Anggota Pokja I",
    gender: "",
    birth_place: "",
    birth_date: "",
    marital_status: "Menikah",
    address: "",
    education: "SMA",
    occupation: "",
    membership_status: "Aktif",
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const memSearch = searchItems(d.pkkMembers, searchQuery);
  const [ef, setEf] = useState({
    name: "",
    position: "Anggota Pokja I",
    gender: "",
    birth_place: "",
    birth_date: "",
    marital_status: "Menikah",
    address: "",
    education: "SMA",
    occupation: "",
    membership_status: "Aktif",
  });

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Anggota PKK");
    ws.columns = [
      { width: 5 },
      { width: 24 },
      { width: 22 },
      { width: 5 },
      { width: 18 },
      { width: 16 },
      { width: 14 },
      { width: 12 },
      { width: 22 },
      { width: 14 },
    ];
    const hdr = ws.addRow([
      "No",
      "Nama",
      "Jabatan",
      "L/P",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Status",
      "Pendidikan",
      "Pekerjaan",
      "Keanggotaan",
    ]);
    hdr.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Calibri",
    };
    hdr.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    hdr.alignment = { horizontal: "center", vertical: "middle" };
    d.pkkMembers.forEach((m, i) =>
      ws.addRow([
        i + 1,
        m.name,
        m.position,
        m.gender,
        m.birth_place,
        m.birth_date,
        m.marital_status,
        m.education,
        m.occupation,
        m.membership_status,
      ]),
    );
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Anggota-PKK-PENDESA-P3S.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("File Excel berhasil diunduh");
  };

  const resetAdd = () => {
    setAddForm({
      name: "",
      position: "Anggota Pokja I",
      gender: "",
      birth_place: "",
      birth_date: "",
      marital_status: "Menikah",
      address: "",
      education: "SMA",
      occupation: "",
      membership_status: "Aktif",
    });
    setShowForm(false);
  };

  const startEdit = (m: any) => {
    setEf({
      name: m.name,
      position: m.position,
      gender: m.gender,
      birth_place: m.birth_place,
      birth_date: toDateInput(m.birth_date),
      marital_status: m.marital_status,
      address: m.address,
      education: m.education,
      occupation: m.occupation,
      membership_status: m.membership_status,
    });
    setEditingId(m.id);
  };

  const saveEdit = () => {
    if (!ef.name.trim()) {
      showToast("Isi nama anggota");
      return;
    }
    dispatch({
      type: "UPDATE_PKK_MEMBER",
      payload: {
        ...ef,
        name: ef.name.trim(),
        address: ef.address.trim(),
        occupation: ef.occupation.trim(),
        birth_date: fromDateInput(ef.birth_date),
        id: editingId,
      } as any,
    });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) {
      showToast("Isi nama anggota");
      return;
    }
    dispatch({
      type: "ADD_PKK_MEMBER",
      payload: {
        ...addForm,
        name: addForm.name.trim(),
        address: addForm.address.trim(),
        occupation: addForm.occupation.trim(),
        birth_date: fromDateInput(addForm.birth_date),
        id: st.nextId,
      } as any,
    });
    resetAdd();
  };

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressFiredRef = useRef(false);
  const [actionMenu, setActionMenu] = useState<{ item: any } | null>(null);
  const [drawerAnim, setDrawerAnim] = useState(false);

  useEffect(() => {
    if (actionMenu) {
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawerAnim(true)));
    } else {
      setDrawerAnim(false);
    }
  }, [actionMenu]);

  const handleDelete = (id: string | number, name: string) => {
    if (confirm(`Hapus ${name} dari daftar anggota PKK?`)) {
      dispatch({ type: "DELETE_PKK_MEMBER", payload: id });
    }
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Anggota PKK
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Daftar anggota PKK Desa Bunutwetan.
          </p>
        </div>
        {!d.isMob && !showForm && (
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 18px",
              background: "#1e3a5f",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + Tambah Anggota
          </button>
        )}
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Seluruh Anggota
            </div>
            <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
              {d.pkkMembers.length} anggota
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anggota…"
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#1e293b",
                outline: "none",
                width: "100%",
                maxWidth: 220,
                boxSizing: "border-box" as const,
              }}
            />
            <button
              onClick={handleExportExcel}
              style={{
                border: "1px solid #1e3a5f",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                padding: "9px 16px",
                background: "#eef2ff",
                color: "#1e3a5f",
                display: "flex",
                alignItems: "center",
                gap: 7,
                whiteSpace: "nowrap",
              }}
            >
              <span>▦</span> Export Excel
            </button>
        </div>
      </div>

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, animation: "silapFade .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              maxWidth: 410, width: "100%", padding: 26,
              animation: "silapPop .25s ease",
              maxHeight: "90vh", overflowY: "auto" as const,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              Tambah Anggota Baru
            </div>
            <PKKAddForm
              form={addForm}
              setForm={setAddForm}
              onSave={handleAdd}
              onCancel={resetAdd}
            />
          </div>
          </div>
        )}

        {d.isMob ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {memSearch.map((m: any, i: number) => {
              return (
                <div key={i} style={{ border: "1px solid #e2e8f0", padding: "12px 14px", background: m.rowBg }}
                  onTouchStart={() => { longPressFiredRef.current = false; longPressTimerRef.current = setTimeout(() => { longPressFiredRef.current = true; setActionMenu({ item: m }); }, 1000); }}
                  onTouchEnd={() => { clearTimeout(longPressTimerRef.current); }}
                  onTouchMove={() => { clearTimeout(longPressTimerRef.current); }}
                  onClick={() => { if (longPressFiredRef.current) { longPressFiredRef.current = false; return; } setActionMenu({ item: m }); }}
                >
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{m.name}</div>
                        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "3px 7px", background: POSITION_COLORS[m.position]?.bg || "#f1f5f9", color: POSITION_COLORS[m.position]?.text || "#475569" }}>{m.position}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => { setActionMenu({ item: m }); }}
                          title="Menu"
                          style={{ border: "none", cursor: "pointer", background: "#f1f5f9", color: "#475569", fontSize: 15, padding: "8px 10px", borderRadius: 6, lineHeight: 1 }}
                        >⋮</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{m.gender || "—"} · {m.birth_place || "—"} · {m.birth_date || "—"}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{m.marital_status || "—"} · {m.education || "—"} · {m.occupation || "—"}</div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", background: m.membership_status === "Aktif" ? "#f0fdf4" : "#fef2f2", color: m.membership_status === "Aktif" ? "#16a34a" : "#ef4444" }}>{m.membership_status || "—"}</span>
                    </div>
                  </>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="silap-scroll" style={{ overflowX: "auto", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#1e3a5f", color: "#fff", textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Nama</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Jabatan</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>L/P</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Tempat Lahir</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Tanggal Lahir</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Pendidikan</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Pekerjaan</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Keanggotaan</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700, width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {memSearch.map((m: any, i: number) => {
                  const isE = editingId === m.id;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: isE ? "#eef2ff" : m.rowBg }}>
                      {isE ? (
                        <>
                          <td style={{ padding: "4px 6px" }}><input value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={ic} /></td>
                          <td style={{ padding: "4px 6px" }}>
                            <select value={ef.position} onChange={(e) => setEf({ ...ef, position: e.target.value })} style={sc}>
                              {JABATAN_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                            </select>
                          </td>
                          <td style={{ padding: "4px 6px" }}>
                            <select value={ef.gender} onChange={(e) => setEf({ ...ef, gender: e.target.value })} style={sc}>
                              <option value="">—</option><option value="L">L</option><option value="P">P</option>
                            </select>
                          </td>
                          <td style={{ padding: "4px 6px" }}><input value={ef.birth_place} onChange={(e) => setEf({ ...ef, birth_place: e.target.value })} style={ic} /></td>
                          <td style={{ padding: "4px 6px" }}><input type="date" value={ef.birth_date} onChange={(e) => setEf({ ...ef, birth_date: e.target.value })} style={ic} /></td>
                          <td style={{ padding: "4px 6px" }}>
                            <select value={ef.marital_status} onChange={(e) => setEf({ ...ef, marital_status: e.target.value })} style={sc}>
                              {STATUS_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                            </select>
                          </td>
                          <td style={{ padding: "4px 6px" }}>
                            <select value={ef.education} onChange={(e) => setEf({ ...ef, education: e.target.value })} style={sc}>
                              {PENDIDIKAN_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                            </select>
                          </td>
                          <td style={{ padding: "4px 6px" }}><input value={ef.occupation} onChange={(e) => setEf({ ...ef, occupation: e.target.value })} style={ic} /></td>
                          <td style={{ padding: "4px 6px" }}>
                            <select value={ef.membership_status} onChange={(e) => setEf({ ...ef, membership_status: e.target.value })} style={sc}>
                              <option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option>
                            </select>
                          </td>
                          <td style={{ padding: "4px 6px", whiteSpace: "nowrap" }}>
                            <button onClick={() => setEditingId(null)} style={{ border: "1px solid #cbd5e1", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, padding: "5px 10px", background: "#fff", color: "#475569", marginRight: 5 }}>Batal</button>
                            <button onClick={saveEdit} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "5px 10px", background: "#1e3a5f", color: "#fff" }}>Simpan</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "8px 10px", color: "#1e293b", fontWeight: 700 }}>{m.name}</td>
                          <td style={{ padding: "8px 10px", color: "#475569" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "3px 7px", background: POSITION_COLORS[m.position]?.bg || "#f1f5f9", color: POSITION_COLORS[m.position]?.text || "#475569" }}>{m.position}</span>
                          </td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{m.gender || "—"}</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{m.birth_place || "—"}</td>
                          <td style={{ padding: "8px 10px", color: "#64748b", whiteSpace: "nowrap" }}>{m.birth_date || "—"}</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{m.marital_status || "—"}</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{m.education || "—"}</td>
                          <td style={{ padding: "8px 10px", color: "#334155", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.occupation || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", background: m.membership_status === "Aktif" ? "#f0fdf4" : "#fef2f2", color: m.membership_status === "Aktif" ? "#16a34a" : "#ef4444" }}>{m.membership_status || "—"}</span>
                          </td>
                          <td style={{ padding: "8px 10px", whiteSpace: "nowrap", position: "relative" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m.id ? null : m.id); }}
                              style={{
                                border: "1px solid #e2e8f0", cursor: "pointer",
                                fontFamily: "inherit", fontSize: 16,
                                padding: "4px 10px", background: "#fff",
                                color: "#475569", borderRadius: 4, lineHeight: 1,
                              }}
                            >⋮</button>
                            {openMenu === m.id && (
                              <div
                                onClick={() => setOpenMenu(null)}
                                style={{
                                  position: "fixed", inset: 0, zIndex: 49,
                                }}
                              />
                            )}
                            {openMenu === m.id && (
                              <div
                                style={{
                                  position: "absolute", right: 0, top: "100%", zIndex: 50,
                                  background: "#fff", border: "1px solid #e2e8f0",
                                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                                  minWidth: 160, borderRadius: 6, padding: 4,
                                }}
                              >
                                <button
                                  onClick={() => { startEdit(m); setOpenMenu(null); }}
                                  style={{
                                    display: "block", width: "100%", textAlign: "left",
                                    border: "none", cursor: "pointer", fontFamily: "inherit",
                                    fontSize: 13, fontWeight: 600,
                                    padding: "8px 12px", background: "transparent",
                                    color: "#1e293b", borderRadius: 4, whiteSpace: "nowrap",
                                  }}
                                >Edit</button>
                                <button
                                  onClick={() => { handleDelete(m.id, m.name); setOpenMenu(null); }}
                                  style={{
                                    display: "block", width: "100%", textAlign: "left",
                                    border: "none", cursor: "pointer", fontFamily: "inherit",
                                    fontSize: 13, fontWeight: 600,
                                    padding: "8px 12px", background: "transparent",
                                    color: "#ef4444", borderRadius: 4, whiteSpace: "nowrap",
                                  }}
                                >Hapus</button>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {d.isMob && !showForm && (
        <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 50 }}>
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "#1e3a5f", color: "#fff", borderRadius: "50%",
              width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(30,58,95,.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
            </svg>
          </button>
        </div>
      )}
      {actionMenu && d.isMob && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, opacity: drawerAnim ? 1 : 0, transition: "opacity .3s ease" }} onClick={() => setActionMenu(null)} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", zIndex: 1001, borderRadius: "14px 14px 0 0", padding: "20px 20px max(20px, env(safe-area-inset-bottom))", boxShadow: "0 -6px 30px rgba(0,0,0,.15)", transform: drawerAnim ? "translateY(0)" : "translateY(100%)", transition: "transform .35s ease-out" }}>
            <div style={{ width: 36, height: 4, background: "#cbd5e1", borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
              {actionMenu.item.name}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: 14 }}>#{actionMenu.item.position}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setActionMenu(null); startEdit(actionMenu.item); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#eef2ff", color: "#1e3a5f", borderRadius: 8, textAlign: "left" }}>Edit</button>
              <button onClick={() => { setActionMenu(null); handleDelete(actionMenu.item.id, actionMenu.item.name); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, textAlign: "left" }}>Hapus</button>
              <button onClick={() => setActionMenu(null)} style={{ border: "1px solid #e2e8f0", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "12px 14px", background: "#fff", color: "#475569", borderRadius: 8, textAlign: "center" }}>Batal</button>
            </div>
          </div>
        </>
      )}
      {editingId !== null && d.isMob && (
        <div
          onClick={() => setEditingId(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, animation: "silapFade .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", maxWidth: 410, width: "100%", padding: 26,
              animation: "silapPop .25s ease",
              maxHeight: "90vh", overflowY: "auto" as const,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Edit Anggota</div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>Nama</label>
            <input value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={ic} />
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginTop: 10, marginBottom: 3 }}>Jabatan</label>
            <select value={ef.position} onChange={(e) => setEf({ ...ef, position: e.target.value })} style={sc}>
              {JABATAN_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>L/P</label>
                <select value={ef.gender} onChange={(e) => setEf({ ...ef, gender: e.target.value })} style={sc}>
                  <option value="">—</option><option value="L">L</option><option value="P">P</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>Tempat Lahir</label>
                <input value={ef.birth_place} onChange={(e) => setEf({ ...ef, birth_place: e.target.value })} style={ic} />
              </div>
            </div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginTop: 10, marginBottom: 3 }}>Tanggal Lahir</label>
            <input type="date" value={ef.birth_date} onChange={(e) => setEf({ ...ef, birth_date: e.target.value })} style={ic} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>Status</label>
                <select value={ef.marital_status} onChange={(e) => setEf({ ...ef, marital_status: e.target.value })} style={sc}>
                  {STATUS_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>Pendidikan</label>
                <select value={ef.education} onChange={(e) => setEf({ ...ef, education: e.target.value })} style={sc}>
                  {PENDIDIKAN_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              </div>
            </div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginTop: 10, marginBottom: 3 }}>Pekerjaan</label>
            <input value={ef.occupation} onChange={(e) => setEf({ ...ef, occupation: e.target.value })} style={ic} />
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginTop: 10, marginBottom: 3 }}>Keanggotaan</label>
            <select value={ef.membership_status} onChange={(e) => setEf({ ...ef, membership_status: e.target.value })} style={sc}>
              <option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option>
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setEditingId(null)} style={{ flex: 1, border: "1px solid #e2e8f0", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: 10, background: "#fff", color: "#475569" }}>Batal</button>
              <button onClick={saveEdit} style={{ flex: 1.4, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: 10, background: "#1e3a5f", color: "#fff" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuratSection({ d, st, dispatch, showToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [addForm, setAddForm] = useState({
    tanggal_terima: "",
    tanggal_surat: "",
    nomor_surat: "",
    asal_surat_dari: "",
    perihal: "",
    lampiran: "",
    diteruskan_kepada: "",
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [ef, setEf] = useState({
    tanggal_terima: "",
    tanggal_surat: "",
    nomor_surat: "",
    asal_surat_dari: "",
    perihal: "",
    lampiran: "",
    diteruskan_kepada: "",
  });
  const [sortBy, setSortBy] = useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressFiredRef = useRef(false);
  const [actionMenu, setActionMenu] = useState<{ item: any } | null>(null);
  const [drawerAnim, setDrawerAnim] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);

  useEffect(() => {
    if (actionMenu) {
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawerAnim(true)));
    } else {
      setDrawerAnim(false);
    }
  }, [actionMenu]);

  const currentView = st.suratView;
  const items = currentView === "masuk" ? d.suratMasuk : d.suratKeluar;

  const resetAdd = () => {
    setAddForm({
      tanggal_terima: "",
      tanggal_surat: "",
      nomor_surat: "",
      asal_surat_dari: "",
      perihal: "",
      lampiran: "",
      diteruskan_kepada: "",
    });
    setShowForm(false);
  };

  const toggleSort = (key: string) => {
    setSortBy((s) =>
      s?.key === key
        ? s.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" },
    );
  };

  const filteredItems = searchItems(items, searchQuery);
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    if (!sortBy) return 0;
    const va = (a[sortBy.key] || "").toLowerCase();
    const vb = (b[sortBy.key] || "").toLowerCase();
    return sortBy.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const sortArrow = (key: string) =>
    sortBy?.key === key ? (sortBy.dir === "asc" ? " ▲" : " ▼") : "";

  const handleAdd = () => {
    if (!addForm.perihal.trim()) {
      showToast("Isi perihal surat");
      return;
    }
    dispatch({
      type: "ADD_SURAT",
      payload: {
        ...addForm,
        id: st.nextId,
        type: currentView,
        perihal: addForm.perihal.trim(),
        asal_surat_dari: addForm.asal_surat_dari.trim(),
        nomor_surat: addForm.nomor_surat.trim(),
      } as any,
    });
    resetAdd();
    showToast("Surat ditambahkan");
  };

  const startEdit = (m: any) => {
    setEf({
      tanggal_terima: m.tanggal_terima,
      tanggal_surat: m.tanggal_surat,
      nomor_surat: m.nomor_surat,
      asal_surat_dari: m.asal_surat_dari,
      perihal: m.perihal,
      lampiran: m.lampiran,
      diteruskan_kepada: m.diteruskan_kepada,
    });
    setEditingId(m.id);
    setExpandedId(null);
  };

  const saveEdit = () => {
    if (!ef.perihal.trim()) {
      showToast("Isi perihal surat");
      return;
    }
    dispatch({
      type: "UPDATE_SURAT",
      payload: { ...ef, id: editingId, type: currentView } as any,
    });
    setEditingId(null);
    showToast("Surat diperbarui");
  };

  const handleDelete = (id: string | number, perihal: string) => {
    if (confirm(`Hapus surat "${perihal}"?`)) {
      dispatch({ type: "DELETE_SURAT", payload: id });
      if (expandedId === id) setExpandedId(null);
      showToast("Surat dihapus");
    }
  };

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Surat");
    ws.columns = [
      { width: 5 },
      { width: 18 },
      { width: 18 },
      { width: 22 },
      { width: 24 },
      { width: 40 },
      { width: 18 },
      { width: 22 },
    ];
    const hdr = ws.addRow([
      "No",
      "Tanggal Terima",
      "Tanggal Surat",
      "Nomor Surat",
      "Asal Surat Dari",
      "Perihal",
      "Lampiran",
      "Diteruskan Kepada",
    ]);
    hdr.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Calibri",
    };
    hdr.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    hdr.alignment = { horizontal: "center", vertical: "middle" };
    items.forEach((r: any, i: number) =>
      ws.addRow([
        i + 1,
        r.tanggal_terima,
        r.tanggal_surat,
        r.nomor_surat,
        r.asal_surat_dari,
        r.perihal,
        r.lampiran,
        r.diteruskan_kepada,
      ]),
    );
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "Surat-" +
      (currentView === "masuk" ? "Masuk" : "Keluar") +
      "-PENDESA-P3S.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("File Excel berhasil diunduh");
  };

  const ic: React.CSSProperties = {
    width: "100%",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "6px 8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
  };

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Surat {currentView === "masuk" ? "Masuk" : "Keluar"}
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Kelola surat menyurat PKK Desa Bunutwetan.
          </p>
        </div>
        {!d.isMob && !showForm && (
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 18px",
              background: "#1e3a5f",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + Surat Baru
          </button>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari surat…"
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            padding: "9px 12px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#1e293b",
            outline: "none",
            width: "100%",
            maxWidth: 320,
            boxSizing: "border-box" as const,
          }}
        />
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* View toggle */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          {(["masuk", "keluar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                dispatch({ type: "SET_SURAT_VIEW", payload: v });
                setShowForm(false);
                setExpandedId(null);
                setEditingId(null);
              }}
              style={{
                flex: 1,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                padding: "11px 0",
                background: currentView === v ? "#1e3a5f" : "#f8fafc",
                color: currentView === v ? "#fff" : "#64748b",
              }}
            >
              Surat {v === "masuk" ? "Masuk" : "Keluar"}{" "}
              {v === "masuk"
                ? `(${d.suratMasuk.length})`
                : `(${d.suratKeluar.length})`}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
            {items.length} surat
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExportExcel}
              style={{
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 700,
                padding: "7px 14px",
                background: "#fff",
                color: "#475569",
              }}
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Add form modal */}
        {showForm && (
          <div
            onClick={() => setShowForm(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16, animation: "silapFade .2s ease",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                maxWidth: 410, width: "100%", padding: 26,
                animation: "silapPop .25s ease",
                maxHeight: "90vh", overflowY: "auto" as const,
              }}
            >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              Tambah Surat {currentView === "masuk" ? "Masuk" : "Keluar"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Tanggal Terima
                  </label>
                  <input
                    value={addForm.tanggal_terima}
                    onChange={(e) =>
                      setAddForm({ ...addForm, tanggal_terima: e.target.value })
                    }
                    placeholder="10 Januari 2025"
                    style={ic}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Tanggal Surat
                  </label>
                  <input
                    value={addForm.tanggal_surat}
                    onChange={(e) =>
                      setAddForm({ ...addForm, tanggal_surat: e.target.value })
                    }
                    placeholder="10 Januari 2025"
                    style={ic}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 3,
                  }}
                >
                  Nomor Surat
                </label>
                <input
                  value={addForm.nomor_surat}
                  onChange={(e) =>
                    setAddForm({ ...addForm, nomor_surat: e.target.value })
                  }
                  placeholder="02/SKR/PKK KEC/I/2025"
                  style={ic}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 3,
                  }}
                >
                  Asal Surat Dari
                </label>
                <input
                  value={addForm.asal_surat_dari}
                  onChange={(e) =>
                    setAddForm({ ...addForm, asal_surat_dari: e.target.value })
                  }
                  placeholder="TP PKK KEC PAKIS"
                  style={ic}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 3,
                  }}
                >
                  Perihal
                </label>
                <input
                  value={addForm.perihal}
                  onChange={(e) =>
                    setAddForm({ ...addForm, perihal: e.target.value })
                  }
                  placeholder="Perihal surat"
                  style={ic}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Lampiran
                  </label>
                  <input
                    value={addForm.lampiran}
                    onChange={(e) =>
                      setAddForm({ ...addForm, lampiran: e.target.value })
                    }
                    placeholder="(opsional)"
                    style={ic}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Diteruskan Kepada
                  </label>
                  <input
                    value={addForm.diteruskan_kepada}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        diteruskan_kepada: e.target.value,
                      })
                    }
                    placeholder="TP PKK DESA"
                    style={ic}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={resetAdd}
                  style={{
                    flex: 1,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: 10,
                    background: "#fff",
                    color: "#475569",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1.4,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: 10,
                    background: "#1e3a5f",
                    color: "#fff",
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Email-like list */}
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
          {items.length > 0 && !d.isMob && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              <div style={{ width: 32, flexShrink: 0 }} />
              <div
                onClick={() => toggleSort("asal_surat_dari")}
                style={{ flex: 1, cursor: "pointer", userSelect: "none" }}
              >
                Asal / Pengirim{sortArrow("asal_surat_dari")}
              </div>
              <div
                onClick={() => toggleSort("tanggal_terima")}
                style={{
                  width: 85,
                  textAlign: "right",
                  flexShrink: 0,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Tgl. Terima{sortArrow("tanggal_terima")}
              </div>
              <div
                onClick={() => toggleSort("tanggal_surat")}
                style={{
                  width: 85,
                  textAlign: "right",
                  flexShrink: 0,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Tgl. Surat{sortArrow("tanggal_surat")}
              </div>
              <div style={{ width: 64, flexShrink: 0 }} />
            </div>
          )}
          {!searchQuery && items.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Belum ada surat {currentView === "masuk" ? "masuk" : "keluar"}
            </div>
          ) : searchQuery && filteredItems.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Tidak ditemukan
            </div>
          ) : (
            sortedItems.map((m: any) => {
              const isE = editingId === m.id;
              const isExpanded = expandedId === m.id;
              return (
                <div key={m.id} style={d.isMob ? { marginBottom: 6 } : { borderBottom: "1px solid #f1f5f9" }}>
                  {d.isMob ? (
                    <>
                      <div
                        onClick={() => {
                          if (longPressFiredRef.current) { longPressFiredRef.current = false; return; }
                          if (actionMenu) { setActionMenu(null); return; }
                          setExpandedId(isExpanded ? null : m.id);
                        }}
                        onTouchStart={() => {
                          longPressFiredRef.current = false;
                          clearTimeout(longPressTimerRef.current);
                          longPressTimerRef.current = setTimeout(() => {
                            longPressFiredRef.current = true;
                            setActionMenu({ item: m });
                          }, 1000);
                        }}
                        onTouchMove={() => { clearTimeout(longPressTimerRef.current); }}
                        onTouchEnd={() => { clearTimeout(longPressTimerRef.current); }}
                        onContextMenu={(e) => { e.preventDefault(); setActionMenu(actionMenu?.item?.id === m.id ? null : { item: m }); }}
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "12px 14px",
                          background: isExpanded ? "#f8fafc" : "#fff",
                          position: "relative",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.asal_surat_dari || "—"}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.perihal}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>{m.tanggal_terima}</div>
                            <div style={{ fontSize: "10px", color: "#cbd5e1" }}>{m.tanggal_surat}</div>
                            <div style={{ fontSize: "9px", color: "#e2e8f0", marginTop: 1 }}>{m.nomor_surat}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionMenu({ item: m }); }}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 18, lineHeight: 1, padding: "8px 6px", background: "#e2e8f0", color: "#475569", borderRadius: 6, flexShrink: 0, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}
                          >⋮</button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: "12px 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.7, background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "none" }}>
                          <div><strong>Nomor Surat:</strong> {m.nomor_surat || "—"}</div>
                          <div><strong>Tanggal Surat:</strong> {m.tanggal_surat || "—"}</div>
                          <div><strong>Tanggal Terima:</strong> {m.tanggal_terima || "—"}</div>
                          <div><strong>Asal:</strong> {m.asal_surat_dari || "—"}</div>
                          <div><strong>Perihal:</strong> {m.perihal || "—"}</div>
                          <div><strong>Lampiran:</strong> {m.lampiran || "—"}</div>
                          <div><strong>Diteruskan Kepada:</strong> {m.diteruskan_kepada || "—"}</div>
                        </div>
                      )}
                    </>
                  ) : isE ? (
                    <div style={{ padding: 12, background: "#eef2ff" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <input
                          value={ef.tanggal_terima}
                          onChange={(e) =>
                            setEf({ ...ef, tanggal_terima: e.target.value })
                          }
                          style={ic}
                          placeholder="Tgl terima"
                        />
                        <input
                          value={ef.tanggal_surat}
                          onChange={(e) =>
                            setEf({ ...ef, tanggal_surat: e.target.value })
                          }
                          style={ic}
                          placeholder="Tgl surat"
                        />
                      </div>
                      <input
                        value={ef.nomor_surat}
                        onChange={(e) =>
                          setEf({ ...ef, nomor_surat: e.target.value })
                        }
                        style={{ ...ic, marginBottom: 8 }}
                        placeholder="Nomor surat"
                      />
                      <input
                        value={ef.asal_surat_dari}
                        onChange={(e) =>
                          setEf({ ...ef, asal_surat_dari: e.target.value })
                        }
                        style={{ ...ic, marginBottom: 8 }}
                        placeholder="Asal surat"
                      />
                      <input
                        value={ef.perihal}
                        onChange={(e) =>
                          setEf({ ...ef, perihal: e.target.value })
                        }
                        style={{ ...ic, marginBottom: 8 }}
                        placeholder="Perihal"
                      />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <input
                          value={ef.lampiran}
                          onChange={(e) =>
                            setEf({ ...ef, lampiran: e.target.value })
                          }
                          style={ic}
                          placeholder="Lampiran"
                        />
                        <input
                          value={ef.diteruskan_kepada}
                          onChange={(e) =>
                            setEf({ ...ef, diteruskan_kepada: e.target.value })
                          }
                          style={ic}
                          placeholder="Diteruskan"
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            flex: 1,
                            border: "1px solid #cbd5e1",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "7px 0",
                            background: "#fff",
                            color: "#475569",
                          }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={saveEdit}
                          style={{
                            flex: 1.4,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "7px 0",
                            background: "#1e3a5f",
                            color: "#fff",
                          }}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        style={{
                          cursor: "pointer",
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: isExpanded ? "#f8fafc" : "#fff",
                          transition: "background .1s",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0f172a",
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {m.asal_surat_dari || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#475569",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {m.perihal}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#94a3b8",
                            }}
                          >
                            {m.tanggal_terima}
                          </div>
                          <div style={{ fontSize: "10px", color: "#cbd5e1" }}>
                            {m.tanggal_surat}
                          </div>
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#e2e8f0",
                              marginTop: 1,
                            }}
                          >
                            {m.nomor_surat}
                          </div>
                        </div>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m.id ? null : m.id); }}
                            style={{
                              border: "1px solid #e2e8f0", cursor: "pointer",
                              fontFamily: "inherit", fontSize: 16,
                              padding: "4px 10px", background: "#fff",
                              color: "#475569", borderRadius: 4, lineHeight: 1,
                            }}
                          >⋮</button>
                          {openMenu === m.id && (
                            <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
                          )}
                          {openMenu === m.id && (
                            <div
                              style={{
                                position: "absolute", right: 0, top: "100%", zIndex: 50,
                                background: "#fff", border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                                minWidth: 160, borderRadius: 6, padding: 4,
                              }}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(m); setOpenMenu(null); }}
                                style={{
                                  display: "block", width: "100%", textAlign: "left",
                                  border: "none", cursor: "pointer", fontFamily: "inherit",
                                  fontSize: 13, fontWeight: 600,
                                  padding: "8px 12px", background: "transparent",
                                  color: "#1e293b", borderRadius: 4, whiteSpace: "nowrap",
                                }}
                              >Edit</button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.perihal); setOpenMenu(null); }}
                                style={{
                                  display: "block", width: "100%", textAlign: "left",
                                  border: "none", cursor: "pointer", fontFamily: "inherit",
                                  fontSize: 13, fontWeight: 600,
                                  padding: "8px 12px", background: "transparent",
                                  color: "#ef4444", borderRadius: 4, whiteSpace: "nowrap",
                                }}
                              >Hapus</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 16px 12px 60px",
                            fontSize: "12.5px",
                            color: "#64748b",
                            lineHeight: 1.7,
                            background: "#f8fafc",
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <strong>Nomor Surat:</strong> {m.nomor_surat || "—"}
                          </div>
                          <div>
                            <strong>Tanggal Surat:</strong>{" "}
                            {m.tanggal_surat || "—"}
                          </div>
                          <div>
                            <strong>Tanggal Terima:</strong>{" "}
                            {m.tanggal_terima || "—"}
                          </div>
                          <div>
                            <strong>Asal:</strong> {m.asal_surat_dari || "—"}
                          </div>
                          <div>
                            <strong>Perihal:</strong> {m.perihal || "—"}
                          </div>
                          <div>
                            <strong>Lampiran:</strong> {m.lampiran || "—"}
                          </div>
                          <div>
                            <strong>Diteruskan Kepada:</strong>{" "}
                            {m.diteruskan_kepada || "—"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {actionMenu && d.isMob && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, opacity: drawerAnim ? 1 : 0, transition: "opacity .3s ease" }} onClick={() => setActionMenu(null)} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", zIndex: 1001, borderRadius: "14px 14px 0 0", padding: "20px 20px max(20px, env(safe-area-inset-bottom))", boxShadow: "0 -6px 30px rgba(0,0,0,.15)", transform: drawerAnim ? "translateY(0)" : "translateY(100%)", transition: "transform .35s ease-out" }}>
            <div style={{ width: 36, height: 4, background: "#cbd5e1", borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
              {actionMenu.item.asal_surat_dari || "—"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: 14 }}>{actionMenu.item.perihal}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setActionMenu(null); startEdit(actionMenu.item); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#eef2ff", color: "#1e3a5f", borderRadius: 8, textAlign: "left" }}>Edit</button>
              <button onClick={() => { setActionMenu(null); handleDelete(actionMenu.item.id, actionMenu.item.perihal); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, textAlign: "left" }}>Hapus</button>
              <button onClick={() => setActionMenu(null)} style={{ border: "1px solid #e2e8f0", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "12px 14px", background: "#fff", color: "#475569", borderRadius: 8, textAlign: "center" }}>Batal</button>
            </div>
          </div>
        </>
      )}
      {d.isMob && !showForm && (
        <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 50 }}>
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "#1e3a5f", color: "#fff", borderRadius: "50%",
              width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(30,58,95,.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
            </svg>
          </button>
        </div>
      )}
      {editingId !== null && d.isMob && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", width: "92%", maxWidth: 400, borderRadius: 12, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,.2)", animation: "silapPop .25s ease" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#1e293b" }}>Edit Surat</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={ef.tanggal_terima} onChange={(e) => setEf({ ...ef, tanggal_terima: e.target.value })} style={ic} placeholder="Tgl terima" />
                <input value={ef.tanggal_surat} onChange={(e) => setEf({ ...ef, tanggal_surat: e.target.value })} style={ic} placeholder="Tgl surat" />
              </div>
              <input value={ef.nomor_surat} onChange={(e) => setEf({ ...ef, nomor_surat: e.target.value })} style={ic} placeholder="Nomor surat" />
              <input value={ef.asal_surat_dari} onChange={(e) => setEf({ ...ef, asal_surat_dari: e.target.value })} style={ic} placeholder="Asal surat" />
              <input value={ef.perihal} onChange={(e) => setEf({ ...ef, perihal: e.target.value })} style={ic} placeholder="Perihal" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={ef.lampiran} onChange={(e) => setEf({ ...ef, lampiran: e.target.value })} style={ic} placeholder="Lampiran" />
                <input value={ef.diteruskan_kepada} onChange={(e) => setEf({ ...ef, diteruskan_kepada: e.target.value })} style={ic} placeholder="Diteruskan" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setEditingId(null)} style={{ flex: 1, border: "1px solid #cbd5e1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 0", background: "#fff", color: "#475569", borderRadius: 8 }}>Batal</button>
                <button onClick={saveEdit} style={{ flex: 1.4, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 0", background: "#1e3a5f", color: "#fff", borderRadius: 8 }}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventarisSection({ d, st, dispatch, showToast }: Props) {
  const [addForm, setAddForm] = useState({
    nama_barang: "",
    asal_barang: "",
    jumlah: 0,
    tempat_penyimpanan: "",
    kondisi_barang: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [ef, setEf] = useState({
    nama_barang: "",
    asal_barang: "",
    jumlah: 0,
    tempat_penyimpanan: "",
    kondisi_barang: "",
  });
  const [collapsed, setCollapsed] = useState<Set<string | number>>(new Set());
  const [subParentId, setSubParentId] = useState<string | number | null>(null);
  const [subForm, setSubForm] = useState({
    nama_barang: "",
    asal_barang: "",
    jumlah: 0,
    tempat_penyimpanan: "",
    kondisi_barang: "",
  });
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressFiredRef = useRef(false);
  const [actionMenu, setActionMenu] = useState<{ item: any; depth: number } | null>(null);
  const [drawerAnim, setDrawerAnim] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const [subModal, setSubModal] = useState<{ item: any; depth: number } | null>(null);
  const filteredInventory = searchTree(st.inventory, searchQuery);

  useEffect(() => {
    if (actionMenu) {
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawerAnim(true)));
    } else {
      setDrawerAnim(false);
    }
  }, [actionMenu]);

  const ic: React.CSSProperties = {
    width: "100%",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "6px 8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
  };
  const kndBg = (k: string) => (k === "Bagus" ? "#f0fdf4" : "#fef2f2");
  const kndCl = (k: string) => (k === "Bagus" ? "#16a34a" : "#ef4444");

  const resetAdd = () => {
    setAddForm({
      nama_barang: "",
      asal_barang: "",
      jumlah: 0,
      tempat_penyimpanan: "",
      kondisi_barang: "",
    });
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!addForm.nama_barang.trim()) {
      showToast("Isi nama barang");
      return;
    }
    dispatch({
      type: "ADD_INVENTORY",
      payload: {
        ...addForm,
        nama_barang: addForm.nama_barang.trim(),
        asal_barang: addForm.asal_barang.trim(),
        kondisi_barang: addForm.kondisi_barang.trim(),
        id: st.nextId,
      } as any,
    });
    resetAdd();
    showToast("Barang ditambahkan");
  };

  const resetSub = () => {
    setSubForm({
      nama_barang: "",
      asal_barang: "",
      jumlah: 0,
      tempat_penyimpanan: "",
      kondisi_barang: "",
    });
    setSubParentId(null);
  };

  const handleAddChild = () => {
    if (!subForm.nama_barang.trim()) {
      showToast("Isi nama barang");
      return;
    }
    if (subParentId === null) return;
    dispatch({
      type: "ADD_INVENTORY_CHILD",
      payload: {
        parentId: subParentId,
        item: {
          ...subForm,
          nama_barang: subForm.nama_barang.trim(),
          asal_barang: subForm.asal_barang.trim(),
          kondisi_barang: subForm.kondisi_barang.trim(),
          id: st.nextId,
        },
      } as any,
    });
    resetSub();
    showToast("Sub-barang ditambahkan");
  };

  const startEdit = (m: any) => {
    setEf({
      nama_barang: m.nama_barang,
      asal_barang: m.asal_barang,
      jumlah: m.jumlah,
      tempat_penyimpanan: m.tempat_penyimpanan,
      kondisi_barang: m.kondisi_barang,
    });
    setEditingId(m.id);
  };

  const saveEdit = () => {
    if (!ef.nama_barang.trim()) {
      showToast("Isi nama barang");
      return;
    }
    dispatch({
      type: "UPDATE_INVENTORY",
      payload: {
        ...ef,
        nama_barang: ef.nama_barang.trim(),
        asal_barang: ef.asal_barang.trim(),
        kondisi_barang: ef.kondisi_barang.trim(),
        id: editingId,
      } as any,
    });
    setEditingId(null);
    showToast("Barang diperbarui");
  };

  const handleDelete = (m: any) => {
    const hasKids = m.children && m.children.length;
    if (
      hasKids &&
      !confirm(
        `Hapus "${m.nama_barang}" beserta ${m.children.length} sub-barang di dalamnya?`,
      )
    )
      return;
    if (!hasKids && !confirm(`Hapus "${m.nama_barang}" dari inventaris?`))
      return;
    dispatch({ type: "DELETE_INVENTORY", payload: m.id });
    showToast(hasKids ? "Barang beserta sub-barang dihapus" : "Barang dihapus");
  };

  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Inventaris");
    ws.columns = [
      { width: 6 },
      { width: 42 },
      { width: 22 },
      { width: 8 },
      { width: 20 },
      { width: 16 },
    ];
    const hdr = ws.addRow([
      "No",
      "Nama Barang",
      "Asal Barang",
      "Jumlah",
      "Tempat Penyimpanan",
      "Kondisi Barang",
    ]);
    hdr.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Calibri",
    };
    hdr.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    hdr.alignment = { horizontal: "center", vertical: "middle" };
    hdr.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    let exportNo = 0;
    function addTree(list: any[], depth = 0, parentNum = "") {
      list.forEach((m: any, idx: number) => {
        const num =
          depth === 0
            ? String(++exportNo)
            : parentNum
              ? parentNum + "." + (idx + 1)
              : String(idx + 1);
        const vals = [
          num,
          cleanName(m.nama_barang),
          m.asal_barang || "",
          depth === 0 && m.children ? totalJumlah(m) : m.jumlah || 0,
          m.tempat_penyimpanan || "",
          m.kondisi_barang || "",
        ];
        const row = ws.addRow(vals);
        const nc = row.getCell(1);
        nc.alignment = { horizontal: "right" };
        if (depth > 0)
          nc.font = { color: { argb: "FF94A3B8" }, name: "Calibri" };
        if (m.children) addTree(m.children, depth + 1, num);
      });
    }
    addTree(st.inventory);
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Inventaris-PKK-PENDESA-P3S.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("File Excel berhasil diunduh");
  };

  function cleanName(name: string): string {
    return name.replace(/^(?:\d+|[a-z])\.\s+/i, "");
  }

  function totalJumlah(item: any): number {
    if (!item.children || item.children.length === 0) return item.jumlah || 0;
    return item.children.reduce((s: number, c: any) => s + totalJumlah(c), 0);
  }

  function renderTree(
    list: any[],
    depth = 0,
    parentNum = "",
  ): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    list.forEach((m, idx) => {
      const isE = editingId === m.id;
      const hasKids = m.children && m.children.length > 0;
      const isCol = collapsed.has(m.id);
      const num = parentNum ? parentNum + "." + (idx + 1) : String(idx + 1);

      const card = d.isMob ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}>{num}.</span>
              {" "}
              <span style={{ fontWeight: depth === 0 ? 700 : 600, color: "#1e293b", fontSize: "13px" }}>{cleanName(m.nama_barang)}</span>
              {hasKids && <span style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, marginLeft: 4 }}>({m.children.length} item)</span>}
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: "11.5px", color: "#64748b", flexWrap: "wrap", marginTop: 4 }}>
              <span>Jumlah: <strong style={{color:"#1e293b"}}>{hasKids ? totalJumlah(m) : m.jumlah} unit</strong></span>
              <span>Tempat: {m.tempat_penyimpanan || "—"}</span>
              <span style={{ padding: "2px 8px", background: kndBg(m.kondisi_barang), color: kndCl(m.kondisi_barang), fontWeight: 600, fontSize: "10.5px" }}>{m.kondisi_barang || "—"}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setActionMenu({ item: m, depth }); }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 18, lineHeight: 1, padding: "8px 6px", background: "#e2e8f0", color: "#475569", borderRadius: 6, flexShrink: 0, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}
          >⋮</button>
        </div>
      ) : isE ? (
          <div style={{
            display: "flex", flexDirection: "column", gap: 6, flex: 1,
            border: "1px solid #c7d2fe", borderRadius: 6, padding: "10px 12px",
            background: "#eef2ff",
          }}>
            <input value={ef.nama_barang} onChange={(e) => setEf({ ...ef, nama_barang: e.target.value })} placeholder="Nama barang" style={ic} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <input value={ef.asal_barang} onChange={(e) => setEf({ ...ef, asal_barang: e.target.value })} placeholder="Asal" style={ic} />
              <input type="number" min="0" value={ef.jumlah} onChange={(e) => setEf({ ...ef, jumlah: parseInt(e.target.value) || 0 })} style={ic} placeholder="Jumlah" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <input value={ef.tempat_penyimpanan} onChange={(e) => setEf({ ...ef, tempat_penyimpanan: e.target.value })} placeholder="Tempat" style={ic} />
              <input value={ef.kondisi_barang} onChange={(e) => setEf({ ...ef, kondisi_barang: e.target.value })} placeholder="Kondisi" style={ic} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setEditingId(null)} style={{ flex: 1, border: "1px solid #cbd5e1", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "6px 0", background: "#fff", color: "#475569" }}>Batal</button>
              <button onClick={saveEdit} style={{ flex: 1.4, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "6px 0", background: "#1e3a5f", color: "#fff" }}>Simpan</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {d.isMob && hasKids && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const n = new Set(collapsed);
                    if (n.has(m.id)) n.delete(m.id);
                    else n.add(m.id);
                    setCollapsed(n);
                  }}
                  style={{ border: "none", cursor: "pointer", background: "none", color: "#94a3b8", fontSize: 12, padding: 0, flexShrink: 0, width: 16 }}
                >{isCol ? "▶" : "▼"}</button>
              )}
              {hasKids && !d.isMob && (
                <span style={{
                                  position: "absolute", top: 8, right: 8, zIndex: 2,
                  background: "#1e3a5f", color: "#fff",
                  fontSize: "12px", fontWeight: 700,
                  padding: "2px 7px", borderRadius: 4,
                  lineHeight: 1.2,
                }}>{m.children.length}</span>
              )}
              <span style={{
                flex: 1, minWidth: 0,
                fontWeight: depth === 0 ? 700 : 600,
                color: "#0f172a",
                fontSize: "14px",
                lineHeight: "1.3",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>{cleanName(m.nama_barang)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m.id ? null : m.id); }}
                style={{ border: "none", cursor: "pointer", background: "transparent", color: "#94a3b8", fontSize: 15, padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
              >⋮</button>
              {openMenu === m.id && <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />}
              {openMenu === m.id && (
                <div style={{ position: "absolute", right: 8, top: 30, zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,.1)", minWidth: 160, borderRadius: 6, padding: 4 }}>
                  {depth === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                        resetSub();
                        setSubParentId(subParentId === m.id ? null : m.id);
                        if (collapsed.has(m.id)) {
                          const n = new Set(collapsed);
                          n.delete(m.id);
                          setCollapsed(n);
                        }
                        setOpenMenu(null);
                      }}
                      style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "transparent", color: "#059669", borderRadius: 4, whiteSpace: "nowrap" }}
                    >Tambah Sub-Barang</button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); startEdit(m); setOpenMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "transparent", color: "#1e293b", borderRadius: 4, whiteSpace: "nowrap" }}>Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(m); setOpenMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "transparent", color: "#ef4444", borderRadius: 4, whiteSpace: "nowrap" }}>Hapus</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: "12px", color: "#64748b", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                {hasKids ? totalJumlah(m) : m.jumlah} unit
              </span>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{m.tempat_penyimpanan || "—"}</span>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <span style={{ padding: "2px 8px", background: kndBg(m.kondisi_barang), color: kndCl(m.kondisi_barang), fontWeight: 600, fontSize: "11px", borderRadius: 4 }}>{m.kondisi_barang || "—"}</span>
            </div>
          </>
        )
      ;

      nodes.push(
        <div key={m.id} style={d.isMob ? {} : {
          marginLeft: depth * 24,
          animation: depth > 0 ? "invCardIn .25s ease" : undefined,
        }}>
          <div
            {...(d.isMob ? {} : { onMouseEnter: () => setHoveredId(m.id), onMouseLeave: () => setHoveredId(null) })}
            style={d.isMob ? {
              border: depth > 0 ? "1px solid #e2e8f0" : "1px solid #e2e8f0",
              borderLeft: depth > 0 ? "3px solid #94a3b8" : "1px solid #e2e8f0",
              padding: "12px 14px",
              marginBottom: 6,
              background: isE ? "#eef2ff" : "#fff",
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: hasKids ? "pointer" : "default",
            } : {
              borderTop: `1px solid ${isE ? "#c7d2fe" : hoveredId === m.id && hasKids ? "#94a3b8" : "#e2e8f0"}`,
              borderRight: `1px solid ${isE ? "#c7d2fe" : hoveredId === m.id && hasKids ? "#94a3b8" : "#e2e8f0"}`,
              borderBottom: `1px solid ${isE ? "#c7d2fe" : hoveredId === m.id && hasKids ? "#94a3b8" : "#e2e8f0"}`,
              borderLeft: `${depth === 0 ? 5 : 3}px solid ${depth === 0 ? "#1e3a5f" : depth === 1 ? "#0d9488" : "#94a3b8"}`,
              borderRadius: 8,
              padding: "16px",
              background: isE ? "#eef2ff" : hoveredId === m.id && hasKids ? "#f1f5f9" : depth > 0 ? "#fafbfc" : "#fff",
              position: "relative",
              height: "100%",
              boxSizing: "border-box",
              cursor: hasKids ? "pointer" : "default",
              boxShadow: hasKids ? (hoveredId === m.id ? "4px 4px 0 #cbd5e1, 8px 8px 0 #e2e8f0" : "4px 4px 0 #e2e8f0, 8px 8px 0 #f1f5f9") : undefined,
            }}
            onClick={() => {
              if (d.isMob) {
                if (actionMenu) { setActionMenu(null); return; }
                if (longPressFiredRef.current) { longPressFiredRef.current = false; return; }
                if (hasKids) {
                  const n = new Set(collapsed);
                  if (n.has(m.id)) n.delete(m.id);
                  else n.add(m.id);
                  setCollapsed(n);
                }
              } else if (hasKids) {
                setSubModal({ item: m, depth });
              }
            }}
            onTouchStart={d.isMob ? () => {
              longPressFiredRef.current = false;
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = setTimeout(() => {
                longPressFiredRef.current = true;
                setActionMenu({ item: m, depth });
              }, 1000);
            } : undefined}
            onTouchMove={d.isMob ? () => { clearTimeout(longPressTimerRef.current); } : undefined}
            onTouchEnd={d.isMob ? () => { clearTimeout(longPressTimerRef.current); } : undefined}
            onContextMenu={d.isMob ? (e) => {
              e.preventDefault();
              setActionMenu(actionMenu?.item?.id === m.id ? null : { item: m, depth });
            } : undefined}
          >
            {card}
          </div>
          {subParentId === m.id && (
            <div
              style={{
                background: "#f0fdf4",
                borderBottom: "1px solid #d1fae5",
                padding: "8px 10px 8px 30px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#059669",
                  marginBottom: 6,
                }}
              >
                Tambah Sub-Barang di "{m.nama_barang}"
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  value={subForm.nama_barang}
                  onChange={(e) =>
                    setSubForm({ ...subForm, nama_barang: e.target.value })
                  }
                  placeholder="Nama barang"
                  style={ic}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    value={subForm.jumlah}
                    onChange={(e) =>
                      setSubForm({
                        ...subForm,
                        jumlah: parseInt(e.target.value) || 0,
                      })
                    }
                    style={ic}
                    placeholder="Jumlah"
                  />
                  <input
                    value={subForm.tempat_penyimpanan}
                    onChange={(e) =>
                      setSubForm({
                        ...subForm,
                        tempat_penyimpanan: e.target.value,
                      })
                    }
                    style={ic}
                    placeholder="Tempat penyimpanan"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  <input
                    value={subForm.asal_barang}
                    onChange={(e) =>
                      setSubForm({ ...subForm, asal_barang: e.target.value })
                    }
                    style={ic}
                    placeholder="Asal barang"
                  />
                  <input
                    value={subForm.kondisi_barang}
                    onChange={(e) =>
                      setSubForm({ ...subForm, kondisi_barang: e.target.value })
                    }
                    style={ic}
                    placeholder="Kondisi"
                  />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={resetSub}
                    style={{
                      flex: 1,
                      border: "1px solid #d1fae5",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 0",
                      background: "#fff",
                      color: "#059669",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddChild}
                    style={{
                      flex: 1.4,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 0",
                      background: "#059669",
                      color: "#fff",
                    }}
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
      if (hasKids && !isCol && d.isMob) {
        nodes.push(...renderTree(m.children, depth + 1, num));
      }
    });
    return nodes;
  }

  return (
    <div style={{ animation: "silapFade .3s ease", paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <div>
          <h1
            style={{
              fontSize: d.rs.pageH1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              color: "#0f172a",
              marginBottom: 7,
            }}
          >
            Inventaris PKK
          </h1>
          <p style={{ fontSize: "14.5px", color: "#475569" }}>
            Data barang inventaris PKK Desa Bunutwetan.
          </p>
        </div>
        {!d.isMob && !showForm && (
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 18px",
              background: "#1e3a5f",
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + Tambah Barang
          </button>
        )}
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Seluruh Barang
            </div>
            <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
              {d.inventory.length} barang
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari barang…"
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#1e293b",
                outline: "none",
                width: "100%",
                maxWidth: 220,
                boxSizing: "border-box" as const,
              }}
            />
            <button
              onClick={handleExportExcel}
              style={{
                border: "1px solid #1e3a5f",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                padding: "9px 16px",
                background: "#eef2ff",
                color: "#1e3a5f",
                display: "flex",
                alignItems: "center",
                gap: 7,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>▦</span> Export Excel
            </button>
          </div>
        </div>

        {showForm && (
          <div
            onClick={() => setShowForm(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16, animation: "silapFade .2s ease",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                maxWidth: 410, width: "100%", padding: 26,
                animation: "silapPop .25s ease",
                maxHeight: "90vh", overflowY: "auto" as const,
              }}
            >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              Tambah Barang Baru
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 3,
                  }}
                >
                  Nama Barang
                </label>
                <input
                  value={addForm.nama_barang}
                  onChange={(e) =>
                    setAddForm({ ...addForm, nama_barang: e.target.value })
                  }
                  placeholder="Nama barang"
                  style={{
                    width: "100%",
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "8px 10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.jumlah}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        jumlah: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 13,
                      padding: "8px 10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Tempat Penyimpanan
                  </label>
                  <input
                    value={addForm.tempat_penyimpanan}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        tempat_penyimpanan: e.target.value,
                      })
                    }
                    placeholder="Lokasi penyimpanan"
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 13,
                      padding: "8px 10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Asal Barang
                  </label>
                  <input
                    value={addForm.asal_barang}
                    onChange={(e) =>
                      setAddForm({ ...addForm, asal_barang: e.target.value })
                    }
                    placeholder="Asal barang"
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 13,
                      padding: "8px 10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: 3,
                    }}
                  >
                    Kondisi Barang
                  </label>
                  <input
                    value={addForm.kondisi_barang}
                    onChange={(e) =>
                      setAddForm({ ...addForm, kondisi_barang: e.target.value })
                    }
                    placeholder="Kondisi"
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 13,
                      padding: "8px 10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={resetAdd}
                  style={{
                    flex: 1,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: 10,
                    background: "#fff",
                    color: "#475569",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1.4,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: 10,
                    background: "#1e3a5f",
                    color: "#fff",
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Tree view */}
        <div
          style={d.isMob ? {
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            overflow: "hidden",
          } : {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {renderTree(filteredInventory)}
        </div>
      </div>

      {subModal && !d.isMob && (
        <>
          <div onClick={() => setSubModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 100, animation: "silapFade .2s ease" }} />
          <div style={{
            position: "fixed", top: "5%", left: "5%", right: "5%", bottom: "5%",
            background: "#fff", borderRadius: 12, zIndex: 101,
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            animation: "invCardIn .2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
              <button onClick={() => setSubModal(null)} style={{ border: "none", cursor: "pointer", background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "6px 12px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>← Kembali</button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {cleanName(subModal.item.nama_barang)}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {subModal.item.children?.length || 0} sub-barang
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              {(!subModal.item.children || subModal.item.children.length === 0) ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
                  Tidak ada sub-barang
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {subModal.item.children.map((child: any, ci: number) => {
                    const childHasKids = child.children && child.children.length > 0;
                    return (
                      <div key={child.id}>
                            <div style={{
                              border: "1px solid #e2e8f0",
                              borderLeft: "4px solid #0d9488",
                              borderRadius: 8,
                              padding: "16px",
                              background: "#fafbfc",
                              height: "100%",
                              boxSizing: "border-box",
                              position: "relative",
                              cursor: childHasKids ? "pointer" : "default",
                              boxShadow: childHasKids ? "4px 4px 0 #e2e8f0, 8px 8px 0 #f1f5f9" : undefined,
                            }} onClick={childHasKids ? () => setSubModal({ item: child, depth: subModal.depth + 1 }) : undefined}>
                              {childHasKids && (
                                <span style={{
                  position: "absolute", top: 8, right: 8, zIndex: 2,
                                  background: "#1e3a5f", color: "#fff",
                                  fontSize: "12px", fontWeight: 700,
                                  padding: "2px 7px", borderRadius: 4,
                                  lineHeight: 1.2,
                                }}>{child.children.length}</span>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                            <span style={{
                              flex: 1, minWidth: 0,
                              fontWeight: 600,
                              color: "#0f172a",
                              fontSize: "14px",
                              lineHeight: "1.3",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>{cleanName(child.nama_barang)}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === child.id ? null : child.id); }}
                              style={{ border: "none", cursor: "pointer", background: "transparent", color: "#94a3b8", fontSize: 15, padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                            >⋮</button>
                            {openMenu === child.id && <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />}
                            {openMenu === child.id && (
                              <div style={{ position: "absolute", right: 8, top: 30, zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,.1)", minWidth: 160, borderRadius: 6, padding: 4 }}>
                                <button onClick={(e) => { e.stopPropagation(); startEdit(child); setOpenMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "transparent", color: "#1e293b", borderRadius: 4, whiteSpace: "nowrap" }}>Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(child); setOpenMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "transparent", color: "#ef4444", borderRadius: 4, whiteSpace: "nowrap" }}>Hapus</button>
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: "12px", color: "#64748b", alignItems: "center", marginTop: 6 }}>
                            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>{child.jumlah || 0} unit</span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{child.tempat_penyimpanan || "—"}</span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span style={{ padding: "2px 8px", background: kndBg(child.kondisi_barang), color: kndCl(child.kondisi_barang), fontWeight: 600, fontSize: "11px", borderRadius: 4 }}>{child.kondisi_barang || "—"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {actionMenu && d.isMob && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, opacity: drawerAnim ? 1 : 0, transition: "opacity .3s ease" }} onClick={() => setActionMenu(null)} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", zIndex: 1001, borderRadius: "14px 14px 0 0", padding: "20px 20px max(20px, env(safe-area-inset-bottom))", boxShadow: "0 -6px 30px rgba(0,0,0,.15)", transform: drawerAnim ? "translateY(0)" : "translateY(100%)", transition: "transform .35s ease-out" }}>
            <div style={{ width: 36, height: 4, background: "#cbd5e1", borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
              {cleanName(actionMenu.item.nama_barang)}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: 14 }}>#{actionMenu.item.id}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actionMenu.depth === 0 && (
                <button onClick={() => { setActionMenu(null); setEditingId(null); resetSub(); setSubParentId(subParentId === actionMenu.item.id ? null : actionMenu.item.id); if (collapsed.has(actionMenu.item.id)) { const n = new Set(collapsed); n.delete(actionMenu.item.id); setCollapsed(n); } }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#f0fdf4", color: "#059669", borderRadius: 8, textAlign: "left" }}>Tambah Sub-Barang</button>
              )}
              <button onClick={() => { setActionMenu(null); startEdit(actionMenu.item); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#eef2ff", color: "#1e3a5f", borderRadius: 8, textAlign: "left" }}>Edit</button>
              <button onClick={() => { setActionMenu(null); handleDelete(actionMenu.item); }} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, textAlign: "left" }}>Hapus</button>
              <button onClick={() => setActionMenu(null)} style={{ border: "1px solid #e2e8f0", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "12px 14px", background: "#fff", color: "#475569", borderRadius: 8, textAlign: "center" }}>Batal</button>
            </div>
          </div>
        </>
      )}
      {d.isMob && !showForm && (
        <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 50 }}>
          <button
            onClick={() => { resetAdd(); setShowForm(true); }}
            style={{
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "#1e3a5f", color: "#fff", borderRadius: "50%",
              width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(30,58,95,.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
            </svg>
          </button>
        </div>
      )}
      {editingId !== null && d.isMob && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", width: "92%", maxWidth: 400, borderRadius: 12, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,.2)", animation: "silapPop .25s ease" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#1e293b" }}>Edit Barang</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={ef.nama_barang} onChange={(e) => setEf({ ...ef, nama_barang: e.target.value })} placeholder="Nama barang" style={ic} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={ef.asal_barang} onChange={(e) => setEf({ ...ef, asal_barang: e.target.value })} placeholder="Asal" style={ic} />
                <input type="number" min="0" value={ef.jumlah} onChange={(e) => setEf({ ...ef, jumlah: parseInt(e.target.value) || 0 })} style={ic} placeholder="Jumlah" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={ef.tempat_penyimpanan} onChange={(e) => setEf({ ...ef, tempat_penyimpanan: e.target.value })} placeholder="Tempat" style={ic} />
                <input value={ef.kondisi_barang} onChange={(e) => setEf({ ...ef, kondisi_barang: e.target.value })} placeholder="Kondisi" style={ic} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setEditingId(null)} style={{ flex: 1, border: "1px solid #cbd5e1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 0", background: "#fff", color: "#475569", borderRadius: 8 }}>Batal</button>
                <button onClick={saveEdit} style={{ flex: 1.4, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 0", background: "#1e3a5f", color: "#fff", borderRadius: 8 }}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
