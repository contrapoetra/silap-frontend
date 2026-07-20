"use client";

import { DerivedData } from "@/lib/derived";
import { AppState, AppAction } from "@/lib/state";
import { POKJA } from "@/lib/constants";
import { Dispatch, useState, useRef, useEffect } from "react";

interface Props {
  st: AppState;
  d: DerivedData;
  dispatch: Dispatch<AppAction>;
  showToast: (msg: string) => void;
}

const btnHover = {
  secondary: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; },
  secondaryL: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#fff"; },
  primary: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#152e4a"; },
  primaryL: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#1e3a5f"; },
  danger: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#b91c1c"; },
  dangerL: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.85)"; },
  ghost: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; },
  ghostL: (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = "transparent"; },
};

export function LoginModal({ st, d, dispatch, showToast }: Props) {
  const [loggingIn, setLoggingIn] = useState(false);
  const doLogin = async () => {
    const nik = st.loginForm.nik.trim();
    const password = st.loginForm.password.trim();
    if (!nik || !password) {
      dispatch({ type: "SET_LOGIN_ERROR", payload: "NIK dan password harus diisi." });
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "SET_LOGIN_ERROR", payload: data.error || "NIK atau password salah. Coba lagi." });
        return;
      }
      dispatch({ type: "SET_INITIAL_DATA", payload: { users: [data.user] } });
      dispatch({ type: "DO_LOGIN", payload: data.user.id });
      showToast("Selamat datang, " + data.user.name + "!");
      window.scrollTo(0, 0);
    } catch {
      dispatch({ type: "SET_LOGIN_ERROR", payload: "Gagal terhubung ke server." });
    } finally {
      setLoggingIn(false);
    }
  };
  const loginKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doLogin();
  };

  return (
    <div
      onClick={() => dispatch({ type: "SET_SHOW_LOGIN", payload: false })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 430,
          width: "100%",
          animation: "silapPop .25s ease",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          maxHeight: "90vh",
          overflowY: "auto" as const,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#1e3a5f,#15294a)",
            padding: "24px 24px 18px",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 3,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "rgba(255,255,255,.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: "#fff",
                  transform: "rotate(45deg)",
                }}
              ></div>
            </div>
            <div
              style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }}
            >
              Masuk ke PENDESA-P3S
            </div>
            <button
              onClick={() =>
                dispatch({ type: "SET_SHOW_LOGIN", payload: false })
              }
              style={{
                marginLeft: "auto",
                border: "none",
                background: "rgba(255,255,255,.2)",
                cursor: "pointer",
                width: 28,
                height: 28,
                fontSize: 15,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, paddingLeft: 46 }}>
            Gunakan NIK dan password untuk masuk
          </div>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#475569",
              marginBottom: 5,
            }}
          >
            NIK (16 digit)
          </label>
          <input
            value={st.loginForm.nik}
            onChange={(e) =>
              dispatch({
                type: "SET_LOGIN_FORM",
                payload: { nik: e.target.value },
              })
            }
            onKeyDown={loginKey}
            placeholder="Masukkan 16 digit NIK"
            maxLength={16}
            style={{
              width: "100%",
              fontFamily: "ui-monospace,monospace",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 12,
              background: "#f8fafc",
              color: "#1e293b",
              letterSpacing: ".05em",
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
            Password
          </label>
          <input
            type="password"
            value={st.loginForm.password}
            onChange={(e) =>
              dispatch({
                type: "SET_LOGIN_FORM",
                payload: { password: e.target.value },
              })
            }
            onKeyDown={loginKey}
            placeholder="Masukkan password"
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "11px 13px",
              border: "1px solid #e2e8f0",
              marginBottom: 6,
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
          {st.loginForm.error && (
            <div
              style={{
                background: "#fef2f2",
                padding: "9px 12px",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span>⚠</span>
              {st.loginForm.error}
            </div>
          )}
          <button
            onClick={doLogin}
            disabled={loggingIn}
            onMouseEnter={btnHover.primary}
            onMouseLeave={btnHover.primaryL}
            style={{
              width: "100%",
              border: "none",
              cursor: loggingIn ? "wait" : "pointer",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              padding: 13,
              background: "#1e3a5f",
              color: "#fff",
              marginTop: 8,
              boxShadow: "0 2px 8px rgba(30,58,95,0.15)",
              opacity: loggingIn ? 0.7 : 1,
            }}
          >
            {loggingIn ? "Memproses..." : "Masuk"}
          </button>
          <button
            onClick={() => dispatch({ type: "SET_SHOW_LOGIN", payload: false })}
            onMouseEnter={btnHover.ghost}
            onMouseLeave={btnHover.ghostL}
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "13.5px",
              fontWeight: 600,
              padding: 9,
              background: "none",
              color: "#94a3b8",
              marginTop: 5,
            }}
          >
            Lihat sebagai warga (tanpa login)
          </button>
          <button
            onClick={() =>
              dispatch({
                type: "SET_LOGIN_FORM",
                payload: { showDemo: !st.loginForm.showDemo },
              })
            }
            style={{
              width: "100%",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 700,
              color: "#cbd5e1",
              padding: "7px 0 3px",
              marginTop: 5,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {d.lf.demoLabel} ▾
          </button>
          {st.loginForm.showDemo && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "11px 12px",
                marginTop: 7,
              }}
            >
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
                Akun Demo PENDESA-P3S
              </div>
              {d.demoAccounts.map((da, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      background: da.accent,
                      color: "#fff",
                      fontSize: "9.5px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {da.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {da.name}{" "}
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 600,
                          color: "#cbd5e1",
                        }}
                      >
                        — {da.roleLabel}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "ui-monospace,monospace",
                        fontSize: 10,
                        color: "#94a3b8",
                        letterSpacing: ".03em",
                      }}
                    >
                      {da.nik} · pwd:{" "}
                      <strong style={{ color: "#1e3a5f" }}>
                        {da.password}
                      </strong>
                    </div>
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

export function AnalogTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isPm, setIsPm] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialHour = 12;
    let initialMinute = 0;
    let initialIsPm = false;
    if (value && value !== "—") {
      const parts = value.split(":");
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
    const pad = (num: number) => String(num).padStart(2, "0");
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

    if (mode === "hour") {
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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (mode === "hour") {
        setMode("minute");
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDialPointer(touch.clientX, touch.clientY);
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      handleDialPointer(moveTouch.clientX, moveTouch.clientY);
    };
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      if (mode === "hour") {
        setMode("minute");
      }
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const getNumberPos = (idx: number) => {
    const angle = (idx * 30 - 90) * (Math.PI / 180);
    const r = 72;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return { left: `${x}px`, top: `${y}px` };
  };

  const numbers =
    mode === "hour"
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [
          "00",
          "05",
          "10",
          "15",
          "20",
          "25",
          "30",
          "35",
          "40",
          "45",
          "50",
          "55",
        ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      {/* Digital time header indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 14,
          background: "#f8fafc",
          padding: "10px 14px",
          border: "1px solid #e2e8f0",
          width: "100%",
          maxWidth: "200px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: 800,
            fontFamily: "ui-monospace, monospace",
            color: "#0f172a",
          }}
        >
          <span
            onClick={() => setMode("hour")}
            style={{
              cursor: "pointer",
              padding: "2px 8px",
              background: mode === "hour" ? "#1e3a5f" : "transparent",
              color: mode === "hour" ? "#fff" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            {String(hour).padStart(2, "0")}
          </span>
          <span style={{ margin: "0 2px", color: "#e2e8f0" }}>:</span>
          <span
            onClick={() => setMode("minute")}
            style={{
              cursor: "pointer",
              padding: "2px 8px",
              background: mode === "minute" ? "#1e3a5f" : "transparent",
              color: mode === "minute" ? "#fff" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            {String(minute).padStart(2, "0")}
          </span>
        </div>

        {/* AM/PM */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginLeft: 10,
            borderLeft: "1px solid #f1f5f9",
            paddingLeft: 10,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsPm(false);
              handleUpdate(hour, minute, false);
            }}
            style={{
              border: "none",
              background: !isPm ? "#e2e8f0" : "transparent",
              color: !isPm ? "#1e3a5f" : "#94a3b8",
              fontSize: "10px",
              fontWeight: 800,
              padding: "2px 6px",
              cursor: "pointer",
            }}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPm(true);
              handleUpdate(hour, minute, true);
            }}
            style={{
              border: "none",
              background: isPm ? "#e2e8f0" : "transparent",
              color: isPm ? "#1e3a5f" : "#94a3b8",
              fontSize: "10px",
              fontWeight: 800,
              padding: "2px 6px",
              cursor: "pointer",
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
          position: "relative",
          width: "200px",
          height: "200px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          cursor: "pointer",
          userSelect: "none",
          touchAction: "none",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.02)",
        }}
      >
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            left: "100px",
            top: "100px",
            transform: "translate(-50%, -50%)",
            width: "6px",
            height: "6px",
            background: "#1e3a5f",
            zIndex: 10,
          }}
        />

        {/* The pointer hand */}
        <div
          style={{
            position: "absolute",
            left: "100px",
            top: "100px",
            width: "2px",
            height: "72px",
            background: "#1e3a5f",
            transformOrigin: "bottom center",
            transform: `translate(-50%, -100%) rotate(${mode === "hour" ? hour * 30 : minute * 6}deg)`,
            pointerEvents: "none",
            transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Hand tip indicator */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#1e3a5f",
              zIndex: 5,
            }}
          />
        </div>

        {/* Dial Face Numbers */}
        {numbers.map((num, i) => {
          const isSelected =
            mode === "hour"
              ? num === hour
              : parseInt(String(num), 10) === minute;

          const pos = getNumberPos(i);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                ...pos,
                transform: "translate(-50%, -50%)",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: isSelected ? "800" : "500",
                color: isSelected ? "#fff" : "#475569",
                zIndex: 8,
                pointerEvents: "none",
                transition: "color 0.1s",
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
    <div
      onClick={() => dispatch({ type: "SET_EVENT_MODAL", payload: null })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 390,
          width: "100%",
          padding: 24,
          animation: "silapPop .25s ease",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
          {d.eventModal.dateLabel} · {POKJA[st.eventModal!.pokja - 1].name}
        </div>

        {d.u?.role === "admin" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {POKJA.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  dispatch({
                    type: "SET_EVENT_MODAL",
                    payload: { ...st.eventModal!, pokja: p.id },
                  })
                }
                style={{
                  flex: 1,
                  border: `1px solid ${st.eventModal!.pokja === p.id ? p.accent : "#e2e8f0"}`,
                  background: st.eventModal!.pokja === p.id ? p.tint : "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "6px 4px",
                  color: st.eventModal!.pokja === p.id ? p.accent : "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        <label
          style={{
            display: "block",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 5,
          }}
        >
          Nama Kegiatan
        </label>
        <input
          value={st.eventModal!.title}
          onChange={(e) =>
            dispatch({
              type: "SET_EVENT_MODAL",
              payload: { ...st.eventModal!, title: e.target.value },
            })
          }
          placeholder="cth: Posyandu balita"
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
            marginBottom: 6,
          }}
        >
          Waktu Kegiatan
        </label>
        <AnalogTimePicker
          value={st.eventModal!.time}
          onChange={(newTime) =>
            dispatch({
              type: "SET_EVENT_MODAL",
              payload: { ...st.eventModal!, time: newTime },
            })
          }
        />

        <div style={{ display: "flex", gap: 10 }}>
          {isEdit && (
            <button
              onClick={() => {
                dispatch({ type: "DELETE_EVENT", payload: st.eventModal!.id! });
                dispatch({ type: "SET_EVENT_MODAL", payload: null });
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "#b91c1c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
              style={{
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                padding: 12,
                background: "#fef2f2",
                color: "#ef4444",
                flex: 1,
              }}
            >
              Hapus
            </button>
          )}
          <button
            onClick={() => dispatch({ type: "SET_EVENT_MODAL", payload: null })}
            onMouseEnter={btnHover.secondary}
            onMouseLeave={btnHover.secondaryL}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#fff",
              color: "#475569",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!st.eventModal!.title.trim()) {
                showToast("Isi nama kegiatan dulu");
                return;
              }
              if (isEdit) {
                dispatch({
                  type: "UPDATE_EVENT",
                  payload: {
                    id: st.eventModal!.id!,
                    pokja: st.eventModal!.pokja,
                    y: st.calY,
                    m: st.calM,
                    d: st.eventModal!.day,
                    title: st.eventModal!.title.trim(),
                    time: st.eventModal!.time.trim() || "—",
                  },
                } as any);
                showToast("Kegiatan diperbarui");
              } else {
                dispatch({
                  type: "ADD_EVENT",
                  payload: {
                    id: st.nextId,
                    pokja: st.eventModal!.pokja,
                    y: st.calY,
                    m: st.calM,
                    d: st.eventModal!.day,
                    title: st.eventModal!.title.trim(),
                    time: st.eventModal!.time.trim() || "—",
                  },
                });
                showToast("Kegiatan ditambahkan");
              }
            }}
            style={{
              flex: 1.4,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#1e3a5f",
              color: "#fff",
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalModal({ st, d, dispatch, showToast }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isVideo = (f: File) => f.type.startsWith("video/") || /\.(mov|mp4|avi|mkv|webm|m4v)$/i.test(f.name);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && !isVideo(file)) {
      showToast("Hanya gambar dan video (MP4/MOV) yang didukung");
      return;
    }
    setSelectedFile(file);
    if (isVideo(file)) {
      setImagePreview("__video__");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => dispatch({ type: "SET_GAL_MODAL", payload: null })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 390,
          width: "100%",
          padding: 24,
          animation: "silapPop .25s ease",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Unggah Foto · {d.active.name}
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          style={{
            display: "block",
            border: isDragOver ? "2px dashed #1e3a5f" : "1px dashed #cbd5e1",
            background: isDragOver ? "#eef2ff" : "#f8fafc",
            padding: 22,
            textAlign: "center",
            marginBottom: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <input
            type="file"
            accept="image/*,video/mp4,video/quicktime,.mov,.mp4"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            style={{ display: "none" }}
          />
          {imagePreview === "__video__" ? (
            <div
              style={{
                width: "100%",
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f172a",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                gap: 8,
              }}
            >
              ▶ {selectedFile?.name}
            </div>
          ) : imagePreview ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 120,
                overflow: "hidden",
              }}
            >
              <img
                src={imagePreview}
                alt="Pratinjau"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                Seret foto baru atau klik untuk mengganti
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🖼</div>
              <div
                style={{ fontSize: "13px", color: "#1e3a5f", fontWeight: 700 }}
              >
                Seret foto ke sini atau klik untuk memilih
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                Mendukung JPG, PNG, WEBP, GIF, MP4, MOV
              </div>
            </>
          )}
        </label>

        <label
          style={{
            display: "block",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#475569",
            marginBottom: 5,
          }}
        >
          Keterangan Foto
        </label>
        <input
          value={st.galModal!.caption}
          onChange={(e) =>
            dispatch({
              type: "SET_GAL_MODAL",
              payload: { caption: e.target.value },
            })
          }
          placeholder="cth: Kegiatan posyandu Juni"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 14,
            padding: "11px 13px",
            border: "1px solid #e2e8f0",
            marginBottom: 16,
            background: "#f8fafc",
            color: "#1e293b",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => dispatch({ type: "SET_GAL_MODAL", payload: null })}
            onMouseEnter={uploadProgress > 0 ? undefined : btnHover.secondary}
            onMouseLeave={uploadProgress > 0 ? undefined : btnHover.secondaryL}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#fff",
              color: "#475569",
            }}
          >
            Batal
          </button>
          <button
            onClick={async () => {
              if (!selectedFile || !imagePreview) {
                showToast("Pilih atau seret foto dulu");
                return;
              }
              if (!st.galModal!.caption.trim()) {
                showToast("Isi keterangan foto dulu");
                return;
              }

              const todayStr = new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              setUploadProgress(1);
              try {
                const { uploadToS3 } = await import("@/lib/s3-upload");
                const imageUrl = await uploadToS3(selectedFile, setUploadProgress);
                dispatch({
                  type: "ADD_GALLERY",
                  payload: {
                    id: st.nextId,
                    pokja: st.activePokja,
                    caption: st.galModal!.caption.trim(),
                    date: todayStr,
                    tag: "foto baru baru",
                    image: imageUrl,
                  } as any,
                });
                showToast("Foto diunggah");
              } catch (err) {
                showToast("Gagal mengunggah foto");
                console.error(err);
              } finally {
                setUploadProgress(0);
              }
            }}
            style={{
              flex: 1.4,
              border: "none",
              cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: uploadProgress > 0 ? "#94a3b8" : "#1e3a5f",
              color: "#fff",
              opacity: uploadProgress > 0 ? 0.7 : 1,
            }}
          >
            {uploadProgress > 0 ? `Mengunggah ${uploadProgress}%` : "Unggah"}
          </button>
        </div>
        {uploadProgress > 0 && (
          <div style={{ marginTop: 14, height: 6, background: "#e2e8f0" }}>
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
  );
}

export function FileUploadModal({ st, d, dispatch, showToast }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = (files: FileList) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast("Pilih berkas dulu");
      return;
    }
    setUploadProgress(1);
    try {
      const { uploadBerkasToS3 } = await import("@/lib/s3-upload");
      for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i];
        const nm = f.name;
        const ext = /\.xlsx?$/i.test(nm)
          ? "XLS"
          : /\.docx?$/i.test(nm)
            ? "DOC"
            : "PDF";
        const kb = Math.max(1, Math.round(f.size / 1024));
        const size = kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
        const url = await uploadBerkasToS3(f, (pct) =>
          setUploadProgress(Math.round(((i + pct / 100) / selectedFiles.length) * 100))
        );
        dispatch({
          type: "ADD_FILE",
          payload: {
            id: st.nextId + i,
            pokja: st.activePokja,
            name: nm,
            ext,
            size,
            by: d.u ? d.u.name : "—",
            date: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            url,
          },
        });
      }
      dispatch({ type: "SET_FILE_MODAL", payload: null });
      showToast(`${selectedFiles.length} berkas diunggah`);
    } catch (err) {
      setUploadProgress(0);
      showToast("Gagal mengunggah berkas");
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => { if (uploadProgress === 0) dispatch({ type: "SET_FILE_MODAL", payload: null }); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 390,
          width: "100%",
          padding: 24,
          animation: "silapPop .25s ease",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 3,
          }}
        >
          Unggah Berkas
        </div>
        <div style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: 14 }}>
          Mendukung PDF, Excel (.xlsx) &amp; Word (.docx).
        </div>
        <label
          style={{
            display: "block",
            border: "2px dashed",
            borderColor: isDragOver ? "#1e3a5f" : uploadProgress > 0 ? "#cbd5e1" : "#cbd5e1",
            background: isDragOver ? "#eef2ff" : uploadProgress > 0 ? "#f1f5f9" : "#f8fafc",
            padding: 22,
            textAlign: "center",
            marginBottom: 11,
            cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
            opacity: uploadProgress > 0 ? 0.6 : 1,
            transition: "border-color .15s,background .15s",
          }}
          onDragOver={(e) => { e.preventDefault(); if (uploadProgress === 0) setIsDragOver(true); }}
          onDragEnter={(e) => { e.preventDefault(); if (uploadProgress === 0) setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (uploadProgress > 0) return;
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,.doc,.docx"
            disabled={uploadProgress > 0}
            multiple
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
          {selectedFiles.length > 0 ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              ✓ {selectedFiles.length} berkas dipilih
            </div>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 5, color: isDragOver ? "#1e3a5f" : "#1e3a5f" }}>
                {isDragOver ? "📥" : "⬆"}
              </div>
              <div style={{ fontSize: "13.5px", color: "#1e3a5f", fontWeight: 700 }}>
                {isDragOver ? "Lepaskan berkas di sini" : "Klik atau seret berkas ke sini"}
              </div>
            </>
          )}
          <div
            style={{
              display: "flex",
              gap: 7,
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#ef4444",
                background: "#fef2f2",
                padding: "3px 9px",
              }}
            >
              PDF
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#22c55e",
                background: "#f0fdf4",
                padding: "3px 9px",
              }}
            >
              EXCEL
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#3b82f6",
                background: "#eff6ff",
                padding: "3px 9px",
              }}
            >
              WORD
            </span>
          </div>
        </label>
        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: 16, maxHeight: 160, overflowY: "auto" }}>
            {selectedFiles.map((f, i) => {
              const kb = Math.max(1, Math.round(f.size / 1024));
              const size = kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "8px 12px",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#1e3a5f", fontSize: 13 }}>✓</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1e293b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{size}</div>
                  </div>
                  {uploadProgress === 0 && (
                    <button
                      onClick={() => removeFile(i)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background: "transparent",
                        color: "#94a3b8",
                        fontSize: 16,
                        padding: "2px 6px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { if (uploadProgress === 0) dispatch({ type: "SET_FILE_MODAL", payload: null }); }}
            style={{
              flex: 1,
              border: "1px solid #cbd5e1",
              cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: uploadProgress > 0 ? "#f1f5f9" : "#fff",
              color: "#475569",
              opacity: uploadProgress > 0 ? 0.5 : 1,
            }}
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            style={{
              flex: 1.4,
              border: "none",
              cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: uploadProgress > 0 ? "#94a3b8" : "#1e3a5f",
              color: "#fff",
              opacity: uploadProgress > 0 ? 0.7 : 1,
            }}
          >
            {uploadProgress > 0 ? `Mengunggah ${uploadProgress}%` : `Unggah (${selectedFiles.length})`}
          </button>
        </div>
        {uploadProgress > 0 && (
          <div style={{ marginTop: 14, height: 6, background: "#e2e8f0" }}>
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
  );
}

export function AvatarModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div
      onClick={() => dispatch({ type: "SET_AVATAR_MODAL", payload: false })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 360,
          width: "100%",
          padding: 26,
          animation: "silapPop .25s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 3,
          }}
        >
          Foto Profil
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Unggah foto untuk akun Anda
        </div>
        <div
          style={{
            margin: "0 auto 18px",
            width: 100,
            height: 100,
            border: "3px solid #e2e8f0",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div style={d.avM.displayStyle}>{d.avM.displayInitial}</div>
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px dashed #cbd5e1",
            padding: "12px 20px",
            cursor: "pointer",
            background: "#f8fafc",
            fontSize: 14,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 18,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#1e3a5f";
            e.currentTarget.style.background = "#eef2ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.background = "#f8fafc";
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = (ev) =>
                dispatch({
                  type: "SET_AVATAR_PREVIEW",
                  payload: ev.target!.result as string,
                });
              r.readAsDataURL(f);
            }}
            style={{ display: "none" }}
          />
          ⬆ Pilih foto
        </label>
        {d.avM.hasPreview && (
          <div
            style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: 14 }}
          >
            Pratinjau siap — klik Simpan
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() =>
              dispatch({ type: "SET_AVATAR_MODAL", payload: false })
            }
            onMouseEnter={btnHover.secondary}
            onMouseLeave={btnHover.secondaryL}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#fff",
              color: "#475569",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!st.avatarPreview) {
                showToast("Pilih foto terlebih dahulu");
                return;
              }
              dispatch({ type: "SAVE_AVATAR", payload: st.avatarPreview });
              showToast("Foto profil berhasil disimpan");
            }}
            onMouseEnter={btnHover.primary}
            onMouseLeave={btnHover.primaryL}
            style={{
              flex: 1.4,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#1e3a5f",
              color: "#fff",
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div
      onClick={() => dispatch({ type: "SET_USER_MODAL", payload: null })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,23,42,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 410,
          width: "100%",
          padding: 26,
          animation: "silapPop .25s ease",
          maxHeight: "90vh",
          overflowY: "auto" as const,
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          {d.umV.title}
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
          Nama Lengkap
        </label>
        <input
          value={st.userModal!.form.name}
          onChange={(e) =>
            dispatch({
              type: "SET_USER_FORM",
              payload: { name: e.target.value },
            })
          }
          placeholder="Nama anggota"
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
          NIK (16 digit)
        </label>
        <input
          value={st.userModal!.form.nik}
          onChange={(e) =>
            dispatch({
              type: "SET_USER_FORM",
              payload: { nik: e.target.value },
            })
          }
          placeholder="16 digit NIK"
          maxLength={16}
          style={{
            width: "100%",
            fontFamily: "ui-monospace,monospace",
            fontSize: 14,
            padding: "11px 13px",
            border: "1px solid #e2e8f0",
            marginBottom: 12,
            background: "#f8fafc",
            color: "#1e293b",
            letterSpacing: ".05em",
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
          Password
        </label>
        <input
          type="password"
          value={st.userModal!.form.password}
          onChange={(e) =>
            dispatch({
              type: "SET_USER_FORM",
              payload: { password: e.target.value },
            })
          }
          placeholder={d.umV.pwdHint}
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
        {d.umV.showRoleSelect && (
          <>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: 5,
              }}
            >
              Peran
            </label>
            <select
              value={st.userModal!.form.role}
              onChange={(e) =>
                dispatch({
                  type: "SET_USER_FORM",
                  payload: { role: e.target.value },
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
              <option value="admin">Admin Desa</option>
              <option value="ketua">Ketua Pokja</option>
              <option value="anggota">Anggota Pokja</option>
            </select>
          </>
        )}
        {d.umV.showPokjaSelect && (
          <>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: 5,
              }}
            >
              Pokja
            </label>
            <select
              value={st.userModal!.form.pokja}
              onChange={(e) =>
                dispatch({
                  type: "SET_USER_FORM",
                  payload: { pokja: e.target.value },
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
              <option value="1">Pokja I — Pancasila &amp; Gotong Royong</option>
              <option value="2">
                Pokja II — Pendidikan &amp; Keterampilan
              </option>
              <option value="3">Pokja III — Pangan, Sandang &amp; Rumah</option>
              <option value="4">Pokja IV — Kesehatan &amp; Lingkungan</option>
            </select>
          </>
        )}
        {d.umV.hasError && (
          <div
            style={{
              background: "#fef2f2",
              padding: "9px 12px",
              marginBottom: 12,
              fontSize: 13,
              fontWeight: 600,
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span>⚠</span>
            {d.umV.error}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => dispatch({ type: "SET_USER_MODAL", payload: null })}
            onMouseEnter={btnHover.secondary}
            onMouseLeave={btnHover.secondaryL}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#fff",
              color: "#475569",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              const fm = st.userModal!;
              if (
                !fm.form.nik.trim() ||
                !fm.form.name.trim() ||
                (fm.mode === "add" && !fm.form.password.trim())
              ) {
                dispatch({
                  type: "SET_USER_FORM",
                  payload: { error: "Lengkapi nama, NIK, dan password" } as any,
                });
                return;
              }
              if (
                st.users.some(
                  (u: any) =>
                    u.nik === fm.form.nik.trim() && u.id !== fm.editId,
                )
              ) {
                dispatch({
                  type: "SET_USER_FORM",
                  payload: { error: "NIK sudah digunakan akun lain" } as any,
                });
                return;
              }
              if (fm.mode === "add") {
                const role = fm.form.role || "anggota";
                const pokja =
                  role === "admin" ? null : parseInt(fm.form.pokja) || 1;
                dispatch({
                  type: "ADD_USER",
                  payload: {
                    id: "u" + st.nextId,
                    nik: fm.form.nik.trim(),
                    password: fm.form.password.trim(),
                    role: role as any,
                    name: fm.form.name.trim(),
                    pokja,
                    avatar: null,
                  },
                });
                showToast("Akun " + fm.form.name.trim() + " berhasil dibuat");
              } else {
                const existing = st.users.find((u) => u.id === fm.editId)!;
                const role = (fm.form.role || existing.role) as
                  "admin" | "ketua" | "anggota";
                if (
                  fm.editId === st.currentUserId &&
                  existing.role === "admin" &&
                  role !== "admin"
                ) {
                  dispatch({
                    type: "SET_USER_FORM",
                    payload: {
                      error: "Anda tidak dapat menurunkan peran Anda sendiri",
                    } as any,
                  });
                  return;
                }
                const pokja =
                  role === "admin"
                    ? null
                    : parseInt(fm.form.pokja) || existing.pokja || 1;
                dispatch({
                  type: "UPDATE_USER",
                  payload: {
                    ...existing,
                    nik: fm.form.nik.trim(),
                    name: fm.form.name.trim(),
                    password: fm.form.password.trim(),
                    role,
                    pokja,
                  },
                });
                showToast("Akun diperbarui");
              }
            }}
            onMouseEnter={btnHover.primary}
            onMouseLeave={btnHover.primaryL}
            style={{
              flex: 1.4,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#1e3a5f",
              color: "#fff",
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ st, d, dispatch, showToast }: Props) {
  return (
    <div
      onClick={() => dispatch({ type: "SET_CONFIRM_DELETE", payload: null })}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(15,23,42,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "silapFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          maxWidth: 340,
          width: "100%",
          padding: 26,
          animation: "silapPop .25s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            background: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            margin: "0 auto 14px",
          }}
        >
          ⚠
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 5,
          }}
        >
          Hapus akun ini?
        </div>
        <div
          style={{
            fontSize: "14.5px",
            fontWeight: 700,
            color: "#ef4444",
            marginBottom: 7,
          }}
        >
          {d.cdUser.name}
        </div>
        <div
          style={{
            fontSize: "13.5px",
            color: "#94a3b8",
            marginBottom: 22,
            lineHeight: 1.5,
          }}
        >
          Tindakan ini tidak dapat dibatalkan.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() =>
              dispatch({ type: "SET_CONFIRM_DELETE", payload: null })
            }
            onMouseEnter={btnHover.secondary}
            onMouseLeave={btnHover.secondaryL}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#fff",
              color: "#475569",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              const id = st.confirmDelete!.userId;
              if (id === st.currentUserId) {
                showToast("Tidak dapat menghapus akun sendiri");
                dispatch({ type: "SET_CONFIRM_DELETE", payload: null });
                return;
              }
              const uName = st.users.find((x) => x.id === id)?.name;
              dispatch({ type: "DELETE_USER", payload: id });
              showToast("Akun " + (uName || "") + " dihapus");
            }}
            onMouseEnter={btnHover.danger}
            onMouseLeave={btnHover.dangerL}
            style={{
              flex: 1.4,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              padding: 12,
              background: "#ef4444",
              color: "#fff",
            }}
          >
            Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}
