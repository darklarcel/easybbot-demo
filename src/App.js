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

const BRAND = {
  navy: "#17324d",
  blue: "#2f5f86",
  lightBlue: "#eaf1f6",
  border: "#d6e0e8",
  bg: "#f4f7fa",
  text: "#23384a",
  muted: "#6f8291",
  green: "#1f8a70",
  redBg: "#fdecec",
  redText: "#b42318",
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
    id: Date.now() + Math.random(),
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

function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        padding: "18px",
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
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
    <div style={{ padding: 20, background: BRAND.bg, minHeight: "100vh" }}>
      <h2>EasyBBot Dashboard</h2>

      <button onClick={addNewRecord}>Actualizar</button>

      <p>Litros totales: {totalLitros}</p>

      <div style={{ height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ddd" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Line dataKey="temperatura" stroke="#2f5f86" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Temp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>{r.fechaHora}</td>
              <td>
                {r.temperatura}
                {r.alerta && " ⚠️"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={clearRecords}>Limpiar</button>
    </div>
  );
}