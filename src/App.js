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

  for (let i = 0; i < 14; i += 1) {
    const minutesAgo = (i + 1) * randomBetween(4, 18, 0);
    const date = new Date(now - minutesAgo * 60 * 1000);
    records.push(createFakeRecord(date));
  }

  return records.sort((a, b) => b.timestamp - a.timestamp);
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

export default function EasyBBotDemo() {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    let stored = [];

    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      stored = [];
    }

    if (!stored.length) {
      stored = seedRecords();
    }

    const newRecord = createFakeRecord();
    const allUpdated = [newRecord, ...stored].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    const visibleUpdated = allUpdated.slice(0, MAX_VISIBLE);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
    setAllRecords(allUpdated);
    setRecords(visibleUpdated);
  }, []);

  const addNewRecord = () => {
    const newRecord = createFakeRecord();
    const allUpdated = [newRecord, ...allRecords].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    const visibleUpdated = allUpdated.slice(0, MAX_VISIBLE);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
    setAllRecords(allUpdated);
    setRecords(visibleUpdated);
  };

  const clearRecords = () => {
    if (window.confirm("¿Seguro que quieres eliminar todos los registros?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllRecords([]);
      setRecords([]);
    }
  };

  const totalLitros = allRecords.length
    ? (
        allRecords.reduce((acc, item) => acc + item.mililitros, 0) / 1000
      ).toFixed(2)
    : "0.00";

  const filteredRecords = useMemo(() => {
    const now = Date.now();

    if (timeFilter === "30m") {
      return records.filter((r) => now - r.timestamp <= 30 * 60 * 1000);
    }

    if (timeFilter === "1h") {
      return records.filter((r) => now - r.timestamp <= 60 * 60 * 1000);
    }

    if (timeFilter === "3h") {
      return records.filter((r) => now - r.timestamp <= 3 * 60 * 60 * 1000);
    }

    return records;
  }, [records, timeFilter]);

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
        background: "#f8fafc",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: 0 }}>EasyBBot Dashboard</h1>
          <p style={{ color: "#555" }}>Control temperatura EasyBBot</p>
        </div>

        <button
          onClick={addNewRecord}
          style={{
            marginBottom: "20px",
            background: "#0f172a",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <Card>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Registros totales
            </div>
            <div style={{ fontSize: "26px", fontWeight: "bold" }}>
              {allRecords.length}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Litros totales servidos
            </div>
            <div style={{ fontSize: "26px", fontWeight: "bold" }}>
              {totalLitros} L
            </div>
          </Card>
        </div>

        <Card>
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
            <h3 style={{ margin: 0 }}>Evolución temperatura</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { key: "30m", label: "30 min" },
                { key: "1h", label: "1 h" },
                { key: "3h", label: "3 h" },
                { key: "all", label: "Todo" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTimeFilter(option.key)}
                  style={{
                    background: timeFilter === option.key ? "#0f172a" : "#e2e8f0",
                    color: timeFilter === option.key ? "white" : "#0f172a",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temperatura" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Últimos registros</h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Fecha
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Nombre
                  </th>
                  <th style={{ padding: "10px" }}>ml</th>
                  <th style={{ padding: "10px" }}>Temp</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      background: r.alerta ? "#fee2e2" : "white",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{r.fechaHora}</td>
                    <td style={{ padding: "10px" }}>
                      {r.nombre}
                      {i === 0 && (
                        <span
                          style={{
                            marginLeft: "6px",
                            background: "#d1fae5",
                            color: "#065f46",
                            padding: "2px 6px",
                            borderRadius: "8px",
                            fontSize: "10px",
                          }}
                        >
                          nuevo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {r.mililitros}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {r.temperatura.toFixed(2)}
                      {r.alerta && (
                        <span style={{ color: "red", marginLeft: "6px" }}>
                          ⚠️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={clearRecords}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
