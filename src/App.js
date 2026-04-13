import React, { useEffect, useMemo, useState } from "react"; import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";

const STORAGE_KEY = "easybbot-registros-demo"; const MAX_VISIBLE = 15;

function randomBetween(min, max, decimals = 0) { const value = Math.random() * (max - min) + min; return Number(value.toFixed(decimals)); }

function formatDate(date) { return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", }).format(date); }

function createFakeRecord(baseDate = new Date()) { const temperatura = randomBetween(4, 7.5, 2);

return { id: ${baseDate.getTime()}-${Math.floor(Math.random() * 10000)}, timestamp: baseDate.getTime(), fechaHora: formatDate(baseDate), nombre: "EasyBBot", mililitros: randomBetween(25, 38, 0), temperatura, alerta: temperatura > 7, }; }

function seedRecords() { const records = []; const now = Date.now();

for (let i = 0; i < 14; i++) { const minutesAgo = (i + 1) * randomBetween(4, 18, 0); const date = new Date(now - minutesAgo * 60000); records.push(createFakeRecord(date)); }

return records.sort((a, b) => b.timestamp - a.timestamp); }

export default function App() { const [records, setRecords] = useState([]); const [allRecords, setAllRecords] = useState([]); const [timeFilter, setTimeFilter] = useState("all");

useEffect(() => { let stored = [];

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

const addNewRecord = () => { const newRecord = createFakeRecord(); const allUpdated = [newRecord, ...allRecords].sort( (a, b) => b.timestamp - a.timestamp );

setAllRecords(allUpdated);
setRecords(allUpdated.slice(0, MAX_VISIBLE));
localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));

};

const clearRecords = () => { if (window.confirm("¿Seguro que quieres eliminar todos los registros?")) { localStorage.removeItem(STORAGE_KEY); setAllRecords([]); setRecords([]); } };

const totalLitros = ( allRecords.reduce((acc, r) => acc + r.mililitros, 0) / 1000 ).toFixed(2);

const filtered = useMemo(() => { const now = Date.now();

if (timeFilter === "30m")
  return records.filter((r) => now - r.timestamp < 1800000);
if (timeFilter === "1h")
  return records.filter((r) => now - r.timestamp < 3600000);
if (timeFilter === "3h")
  return records.filter((r) => now - r.timestamp < 10800000);

return records;

}, [records, timeFilter]);

const chartData = [...filtered] .sort((a, b) => a.timestamp - b.timestamp) .map((r) => ({ hora: r.fechaHora, temperatura: r.temperatura, }));

return ( <div style={{ padding: 20, fontFamily: "Arial" }}> <h2>EasyBBot Dashboard</h2>

<button onClick={addNewRecord}>Insertar registro</button>

  <p><strong>Registros totales:</strong> {allRecords.length}</p>
  <p><strong>Litros totales:</strong> {totalLitros} L</p>

  <div style={{ margin: "10px 0" }}>
    <button onClick={() => setTimeFilter("30m")}>30 min</button>
    <button onClick={() => setTimeFilter("1h")}>1 h</button>
    <button onClick={() => setTimeFilter("3h")}>3 h</button>
    <button onClick={() => setTimeFilter("all")}>Todo</button>
  </div>

  <div style={{ height: 250 }}>
    <ResponsiveContainer>
      <LineChart data={chartData}>
        <CartesianGrid stroke="#ddd" />
        <XAxis dataKey="hora" />
        <YAxis />
        <Tooltip />
        <Line dataKey="temperatura" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </div>

  <table border="1" style={{ width: "100%", marginTop: 20 }}>
    <thead>
      <tr>
        <th>Hora</th>
        <th>Nombre</th>
        <th>ml</th>
        <th>Temp</th>
      </tr>
    </thead>
    <tbody>
      {filtered.map((r, i) => (
        <tr key={r.id} style={{ background: r.alerta ? "#ffe5e5" : "white" }}>
          <td>{r.fechaHora}</td>
          <td>{r.nombre} {i === 0 && "(último)"}</td>
          <td>{r.mililitros}</td>
          <td>{r.temperatura} {r.alerta && "⚠️"}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <div style={{ marginTop: 20 }}>
    <button onClick={clearRecords}>Limpiar</button>
  </div>
</div>

); }