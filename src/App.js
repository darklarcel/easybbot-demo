import React, { useEffect, useMemo, useState } from "react"; import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";

const STORAGE_KEY = "easybbot-registros-demo"; const MAX_VISIBLE = 15; const BRAND = { navy: "#17324d", blue: "#2f5f86", lightBlue: "#eaf1f6", border: "#d6e0e8", bg: "#f4f7fa", text: "#23384a", muted: "#6f8291", green: "#1f8a70", redBg: "#fdecec", redText: "#b42318", };

function randomBetween(min, max, decimals = 0) { const value = Math.random() * (max - min) + min; return Number(value.toFixed(decimals)); }

function formatDate(date) { return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", }).format(date); }

function createFakeRecord(baseDate = new Date()) { const temperatura = randomBetween(4, 7.5, 2);

return { id: ${baseDate.getTime()}-${Math.floor(Math.random() * 10000)}, timestamp: baseDate.getTime(), fechaHora: formatDate(baseDate), nombre: "EasyBBot", mililitros: randomBetween(23, 26, 0), temperatura, alerta: temperatura > 7, }; }

function seedRecords() { const records = []; const now = Date.now();

for (let i = 0; i < 14; i += 1) { const minutesAgo = (i + 1) * randomBetween(4, 18, 0); const date = new Date(now - minutesAgo * 60 * 1000); records.push(createFakeRecord(date)); }

return records.sort((a, b) => b.timestamp - a.timestamp); }

function Card({ children, style = {} }) { return ( <div style={{ background: "white", borderRadius: "14px", padding: "18px", border: 1px solid ${BRAND.border}, boxShadow: "0 8px 28px rgba(23, 50, 77, 0.06)", ...style, }} > {children} </div> ); }

function FilterButton({ active, children, onClick }) { return ( <button onClick={onClick} style={{ background: active ? BRAND.navy : "white", color: active ? "white" : BRAND.text, border: 1px solid ${active ? BRAND.navy : BRAND.border}, padding: "8px 12px", borderRadius: "999px", cursor: "pointer", fontSize: "12px", fontWeight: 700, }} > {children} </button> ); }

export default function EasyBBotDemo() { const [records, setRecords] = useState([]); const [allRecords, setAllRecords] = useState([]); const [timeFilter, setTimeFilter] = useState("all");

useEffect(() => { let stored = [];

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

const addNewRecord = () => { const newRecord = createFakeRecord(); const allUpdated = [newRecord, ...allRecords].sort( (a, b) => b.timestamp - a.timestamp ); const visibleUpdated = allUpdated.slice(0, MAX_VISIBLE);

localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
setAllRecords(allUpdated);
setRecords(visibleUpdated);

};

const clearRecords = () => { if (window.confirm("¿Seguro que quieres eliminar todos los registros?")) { localStorage.removeItem(STORAGE_KEY); setAllRecords([]); setRecords([]); } };

const totalLitros = allRecords.length ? ( allRecords.reduce((acc, item) => acc + item.mililitros, 0) / 1000 ).toFixed(2) : "0.00";

const filteredRecords = useMemo(() => { const now = Date.now();

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

const chartData = [...filteredRecords] .sort((a, b) => a.timestamp - b.timestamp) .map((r) => ({ hora: r.fechaHora, temperatura: r.temperatura, }));

return ( <div style={{ minHeight: "100vh", background: linear-gradient(180deg, ${BRAND.lightBlue} 0%, ${BRAND.bg} 180px, ${BRAND.bg} 100%), padding: "96px 16px 40px", fontFamily: "Arial, sans-serif", color: BRAND.text, }} > <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: 1px solid ${BRAND.border}, boxShadow: "0 6px 18px rgba(23, 50, 77, 0.06)", }} > <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", }} > <div style={{ display: "flex", alignItems: "center", gap: "12px" }}> <img src="https://www.easyq.es/wp-content/uploads/2020/07/logo-easyq.png" alt="EasyQ" style={{ height: "34px" }} /> <div> <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.blue, fontWeight: 700, marginBottom: "2px", }} > Production Monitoring </div> <div style={{ fontSize: "20px", fontWeight: 700, color: BRAND.navy }}> EasyBBot Dashboard </div> </div> </div>

<button
        onClick={addNewRecord}
        style={{
          background: BRAND.navy,
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Actualizar registros
      </button>
    </div>
  </div>

  <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
    <div
      style={{
        background: "white",
        border: `1px solid ${BRAND.border}`,
        borderRadius: "18px",
        padding: "18px 20px",
        boxShadow: "0 10px 30px rgba(23, 50, 77, 0.06)",
        marginBottom: "18px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: BRAND.blue,
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          Production Monitoring
        </div>
        <h1 style={{ margin: 0, fontSize: "30px", color: BRAND.navy }}>
          Panel de control EasyBBot
        </h1>
        <p style={{ margin: "8px 0 0", color: BRAND.muted }}>
          Seguimiento de registros, temperatura y alertas operativas en tiempo real.
        </p>
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "14px",
        marginBottom: "18px",
      }}
    >
      <Card>
        <div style={{ fontSize: "13px", color: BRAND.muted, marginBottom: "8px" }}>
          Registros totales
        </div>
        <div style={{ fontSize: "30px", fontWeight: 700, color: BRAND.navy }}>
          {allRecords.length}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: "13px", color: BRAND.muted, marginBottom: "8px" }}>
          Litros totales servidos
        </div>
        <div style={{ fontSize: "30px", fontWeight: 700, color: BRAND.navy }}>
          {totalLitros} L
        </div>
      </Card>
    </div>

    <Card style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: BRAND.navy }}>Evolución de temperatura</h3>
          <div style={{ fontSize: "13px", color: BRAND.muted, marginTop: "4px" }}>
            Vista por rango horario sobre los últimos registros visibles.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <FilterButton active={timeFilter === "30m"} onClick={() => setTimeFilter("30m")}>30 min</FilterButton>
          <FilterButton active={timeFilter === "1h"} onClick={() => setTimeFilter("1h")}>1 h</FilterButton>
          <FilterButton active={timeFilter === "3h"} onClick={() => setTimeFilter("3h")}>3 h</FilterButton>
          <FilterButton active={timeFilter === "all"} onClick={() => setTimeFilter("all")}>Todo</FilterButton>
        </div>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke={BRAND.border} strokeDasharray="3 3" />
            <XAxis dataKey="hora" tick={{ fill: BRAND.muted, fontSize: 12 }} />
            <YAxis tick={{ fill: BRAND.muted, fontSize: 12 }} domain={[4, 8]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke={BRAND.blue}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>

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
        <div>
          <h3 style={{ margin: 0, color: BRAND.navy }}>Últimos registros</h3>
          <div style={{ fontSize: "13px", color: BRAND.muted, marginTop: "4px" }}>
            Se muestran hasta 15 registros ordenados del más reciente al más antiguo.
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: BRAND.lightBlue }}>
              <th style={{ padding: "12px 14px", textAlign: "left", color: BRAND.navy }}>Fecha</th>
              <th style={{ padding: "12px 14px", textAlign: "left", color: BRAND.navy }}>Nombre</th>
              <th style={{ padding: "12px 14px", textAlign: "center", color: BRAND.navy }}>ml</th>
              <th style={{ padding: "12px 14px", textAlign: "center", color: BRAND.navy }}>Temp</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr
                key={r.id}
                style={{ background: r.alerta ? BRAND.redBg : "white" }}
              >
                <td style={{ padding: "13px 14px", borderBottom: `1px solid ${BRAND.border}` }}>{r.fechaHora}</td>
                <td style={{ padding: "13px 14px", borderBottom: `1px solid ${BRAND.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span>{r.nombre}</span>
                    {i === 0 && (
                      <span
                        style={{
                          background: "#d8efe8",
                          color: BRAND.green,
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        último
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center", borderBottom: `1px solid ${BRAND.border}` }}>
                  {r.mililitros}
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center", borderBottom: `1px solid ${BRAND.border}` }}>
                  <span style={{ color: r.alerta ? BRAND.redText : BRAND.text, fontWeight: r.alerta ? 700 : 500 }}>
                    {r.temperatura.toFixed(2)} °C
                  </span>
                  {r.alerta && <span style={{ marginLeft: "6px" }}>⚠️</span>}
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
          background: "white",
          color: BRAND.redText,
          border: `1px solid #efc7c7`,
          padding: "12px 18px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Limpiar registros
      </button>
    </div>
  </div>
</div>

); }