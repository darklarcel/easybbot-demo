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
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
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
    id: `${baseDate.getTime()}-${Math.random()}`,
    timestamp: baseDate.getTime(),
    fechaHora: formatDate(baseDate),
    nombre: "EasyBBot",
    mililitros: randomBetween(23, 26),
    temperatura,
    alerta: temperatura > 7,
  };
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        borderRadius: "16px",
        padding: "20px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 8px 24px rgba(23,50,77,0.06)",
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
    } catch {}

    if (!stored.length) {
      let current = new Date();
      for (let i = 0; i < 15; i++) {
        stored.push(createFakeRecord(current));
        current = new Date(current - randomBetween(60, 300) * 1000);
      }
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
  };

  const clearRecords = () => {
    if (window.confirm("¿Eliminar todo?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllRecords([]);
      setPage(0);
    }
  };

  const regenerateRecords = () => {
    if (window.confirm("Generar 150 registros?")) {
      let generated = [];
      let current = new Date();

      for (let i = 0; i < 150; i++) {
        generated.push(createFakeRecord(current));
        current = new Date(current - randomBetween(50, 300) * 1000);
      }

      generated = generated.sort((a, b) => b.timestamp - a.timestamp);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      setAllRecords(generated);
      setPage(0);
    }
  };

  const filtered = useMemo(() => {
    const now = Date.now();

    let base = allRecords;

    if (timeFilter === "30m") {
      base = allRecords.filter((r) => now - r.timestamp < 1800000);
    } else if (timeFilter === "1h") {
      base = allRecords.filter((r) => now - r.timestamp < 3600000);
    } else if (timeFilter === "3h") {
      base = allRecords.filter((r) => now - r.timestamp < 10800000);
    }

    return base;
  }, [allRecords, timeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const totalLitros = (
    allRecords.reduce((acc, r) => acc + r.mililitros, 0) / 1000
  ).toFixed(2);

  const chartData = [...filtered]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      hora: r.fechaHora,
      temperatura: r.temperatura,
    }));

  return (
    <div style={{ padding: 20 }}>
      <h2>EasyBBot</h2>

      <button onClick={addNewRecord}>Actualizar</button>

      <p>Total registros: {allRecords.length}</p>
      <p>Litros: {totalLitros}</p>

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

      <table style={{ width: "100%", marginTop: 20 }}>
        <tbody>
          {paginated.map((r) => (
            <tr key={r.id}>
              <td>{r.fechaHora}</td>
              <td>{r.temperatura.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINACIÓN NUMÉRICA */}
      <div style={{ marginTop: 20 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{
              margin: "0 4px",
              padding: "6px 10px",
              background: page === i ? "#17324d" : "#e2e8f0",
              color: page === i ? "white" : "black",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={regenerateRecords}>↻</button>
        <button onClick={clearRecords}>Limpiar</button>
      </div>
    </div>
  );
}
