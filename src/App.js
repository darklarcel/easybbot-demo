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

const STORAGE_KEY = "easybbot-registros-demo";
const MAX_VISIBLE = 15;

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

function seedRecords() {
  const records = [];
  const now = Date.now();

  for (let i = 0; i < 14; i++) {
    const minutesAgo = (i + 1) * randomBetween(4, 18, 0);
    const date = new Date(now - minutesAgo * 60000);
    records.push(createFakeRecord(date));
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
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    let stored = [];

    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {}

    if (!stored.length) stored = seedRecords();

    const newRecord = createFakeRecord();
    const allUpdated = [newRecord, ...stored].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    setAllRecords(allUpdated);
    setRecords(allUpdated.slice(0, MAX_VISIBLE));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
  }, []);

  const addNewRecord = () => {
    const newRecord = createFakeRecord();
    const allUpdated = [newRecord, ...allRecords].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    setAllRecords(allUpdated);
    setRecords(allUpdated.slice(0, MAX_VISIBLE));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
  };

  const clearRecords = () => {
    if (window.confirm("¿Seguro que quieres eliminar todos los registros?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllRecords([]);
      setRecords([]);
    }
  };

  const totalLitros = (
    allRecords.reduce((acc, r) => acc + r.mililitros, 0) / 1000
  ).toFixed(2);

  const filtered = useMemo(() => {
    const now = Date.now();

    if (timeFilter === "30m")
      return records.filter((r) => now - r.timestamp < 1800000);
    if (timeFilter === "1h")
      return records.filter((r) => now - r.timestamp < 3600000);
    if (timeFilter === "3h")
      return records.filter((r) => now - r.timestamp < 10800000);

    return records;
  }, [records, timeFilter]);

  const chartData = [...filtered]
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
        padding: "90px 16px 40px",
        fontFamily: "Arial, sans-serif",
        color: COLORS.text,
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "white",
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
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
              <div style={{ fontSize: "11px", color: COLORS.secondary }}>
                Production Monitoring
              </div>
              <div style={{ fontWeight: "bold" }}>EasyBBot</div>
            </div>
          </div>

          <button
            onClick={addNewRecord}
            style={{
              background: COLORS.primary,
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Card style={{ marginBottom: 20 }}>
          <h2>Panel de control</h2>
          <p style={{ color: COLORS.muted }}>
            Seguimiento de temperatura en tiempo real
          </p>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <p>Registros totales: {allRecords.length}</p>
          <p>Litros totales: {totalLitros} L</p>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 10 }}>
            {["30m", "1h", "3h", "all"].map((f) => (
              <button key={f} onClick={() => setTimeFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#ddd" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line dataKey="temperatura" stroke={COLORS.secondary} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <table style={{ width: "100%" }}>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.fechaHora}</td>
                  <td>{r.temperatura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <button onClick={clearRecords}>Limpiar</button>
      </div>
    </div>
  );
}
