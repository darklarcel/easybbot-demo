import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Analytics } from "@vercel/analytics/react";

const STORAGE_KEY = "easybbot-registros-demo";
const ITEMS_PER_PAGE = 15;

const COLORS = {
  pageBg: "#f4f7fa",
  headerBg: "#eaf1f6",
  cardBg: "#ffffff",
  primary: "#17324d",
  secondary: "#2f5f86",
  text: "#23384a",
  muted: "#6f8291",
  border: "#d6e0e8",
  successBg: "#d8efe8",
  successText: "#1f8a70",
  dangerBg: "#fdecec",
  dangerText: "#b42318",
};

function randomBetween(min, max, decimals = 0) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function createFakeRecord(baseDate = new Date()) {
  const temperatura = randomBetween(4, 7.5, 2);

  return {
    id: `${baseDate.getTime()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: baseDate.getTime(),
    fechaHora: formatDate(baseDate),
    nombre: "EasyBBot",
    mililitros: randomBetween(23, 26, 0),
    temperatura,
    alerta: temperatura > 7,
  };
}

function seedRecords(count = 15) {
  const records = [];
  let currentDate = new Date();

  for (let i = 0; i < count; i += 1) {
    records.push(createFakeRecord(new Date(currentDate)));
    const secondsBack = randomBetween(60, 300, 0);
    currentDate = new Date(currentDate.getTime() - secondsBack * 1000);
  }

  return records.sort((a, b) => b.timestamp - a.timestamp);
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        borderRadius: "16px",
        padding: "20px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 8px 24px rgba(23, 50, 77, 0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [allRecords, setAllRecords] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let stored = [];

    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      stored = [];
    }

    if (!stored.length) {
      stored = seedRecords(15);
    }

    const newRecord = createFakeRecord();
    const updated = [newRecord, ...stored].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAllRecords(updated);
  }, []);

  const addNewRecord = () => {
    const newRecord = createFakeRecord();
    const updated = [newRecord, ...allRecords].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAllRecords(updated);
    setPage(0);
  };

  const clearRecords = () => {
    if (window.confirm("¿Seguro que quieres eliminar todos los registros?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllRecords([]);
      setPage(0);
    }
  };

const regenerateRecords = () => {
  if (
    window.confirm(
      "¿Seguro que quieres añadir 150 registros aleatorios al histórico actual?"
    )
  ) {
    const generated = [];
    let currentDate;

    if (allRecords.length > 0) {
      const oldestTimestamp = Math.min(...allRecords.map((r) => r.timestamp));
      currentDate = new Date(oldestTimestamp - randomBetween(50, 300, 0) * 1000);
    } else {
      currentDate = new Date();
    }

    for (let i = 0; i < 150; i += 1) {
      generated.push(createFakeRecord(new Date(currentDate)));
      const secondsBack = randomBetween(50, 300, 0);
      currentDate = new Date(currentDate.getTime() - secondsBack * 1000);
    }

    const mergedRecords = [...allRecords, ...generated].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRecords));
    setAllRecords(mergedRecords);
    setTimeFilter("all");
    setPage(0);
  }
};

  const filteredRecords = useMemo(() => {
    const now = Date.now();

    if (timeFilter === "30m") {
      return allRecords.filter((r) => now - r.timestamp <= 30 * 60 * 1000);
    }

    if (timeFilter === "1h") {
      return allRecords.filter((r) => now - r.timestamp <= 60 * 60 * 1000);
    }

    if (timeFilter === "3h") {
      return allRecords.filter((r) => now - r.timestamp <= 3 * 60 * 60 * 1000);
    }

    return allRecords;
  }, [allRecords, timeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(0);
    }
  }, [page, totalPages]);

  const paginatedRecords = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, page]);

  const totalLitros = allRecords.length
    ? (
        allRecords.reduce((acc, item) => acc + item.mililitros, 0) / 1000
      ).toFixed(2)
    : "0.00";

  const chartData = [...filteredRecords]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      hora: r.fechaHora,
      temperatura: r.temperatura,
    }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.headerBg} 0px, ${COLORS.pageBg} 190px)`,
        padding: "92px 16px 40px",
        fontFamily: "Arial, sans-serif",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: "0 6px 18px rgba(23, 50, 77, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/logo-easyq.png"
              alt="EasyQ"
              style={{
                height: "34px",
                width: "auto",
                objectFit: "contain",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: COLORS.secondary,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Production Monitoring
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: COLORS.primary,
                  fontSize: "22px",
                  lineHeight: 1.1,
                }}
              >
                EasyBBot
              </div>
            </div>
          </div>

          <button
            onClick={addNewRecord}
            style={{
              background: COLORS.primary,
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(23, 50, 77, 0.18)",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Card style={{ marginBottom: "20px", background: "rgba(255,255,255,0.96)" }}>
          <h1 style={{ margin: 0, color: COLORS.primary, fontSize: "28px" }}>
            Panel de control
          </h1>
          <p style={{ color: COLORS.muted, margin: "8px 0 0" }}>
            Seguimiento de temperatura y registros operativos en tiempo real.
          </p>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <Card>
            <div style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "8px" }}>
              Registros totales
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: COLORS.primary }}>
              {allRecords.length}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "8px" }}>
              Litros totales servidos
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: COLORS.primary }}>
              {totalLitros} L
            </div>
          </Card>
        </div>

        <Card style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ margin: 0, color: COLORS.primary }}>Evolución temperatura</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { key: "30m", label: "30 min" },
                { key: "1h", label: "1 h" },
                { key: "3h", label: "3 h" },
                { key: "all", label: "Todo" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setTimeFilter(option.key);
                    setPage(0);
                  }}
                  style={{
                    background:
                      timeFilter === option.key ? COLORS.primary : COLORS.headerBg,
                    color: timeFilter === option.key ? "white" : COLORS.primary,
                    border: `1px solid ${
                      timeFilter === option.key ? COLORS.primary : COLORS.border
                    }`,
                    padding: "8px 12px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperatura"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0, color: COLORS.primary }}>Últimos registros</h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ background: COLORS.headerBg }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: COLORS.primary,
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: COLORS.primary,
                    }}
                  >
                    Nombre
                  </th>
                  <th style={{ padding: "12px", color: COLORS.primary }}>ml</th>
                  <th style={{ padding: "12px", color: COLORS.primary }}>Temp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      background: r.alerta ? COLORS.dangerBg : "white",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{r.fechaHora}</td>
                    <td style={{ padding: "12px" }}>
                      {r.nombre}
                      {page === 0 && i === 0 && (
                        <span
                          style={{
                            marginLeft: "8px",
                            background: COLORS.successBg,
                            color: COLORS.successText,
                            padding: "3px 8px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          nuevo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {r.mililitros}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          color: r.alerta ? COLORS.dangerText : COLORS.text,
                          fontWeight: r.alerta ? 700 : 500,
                        }}
                      >
                        {r.temperatura.toFixed(2)}
                      </span>
                      {r.alerta && (
                        <span
                          style={{ color: COLORS.dangerText, marginLeft: "6px" }}
                        >
                          ⚠️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {!paginatedRecords.length && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: COLORS.muted,
                      }}
                    >
                      No hay registros para este rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  minWidth: "38px",
                  height: "38px",
                  padding: "0 10px",
                  borderRadius: "10px",
                  border: `1px solid ${
                    page === i ? COLORS.primary : COLORS.border
                  }`,
                  background: page === i ? COLORS.primary : "white",
                  color: page === i ? "white" : COLORS.primary,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </Card>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={regenerateRecords}
            title="Regenerar 150 registros"
            style={{
              background: COLORS.primary,
              color: "white",
              border: "none",
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ↻
          </button>

          <button
            onClick={clearRecords}
            style={{
              background: COLORS.dangerText,
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Limpiar
          </button>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
