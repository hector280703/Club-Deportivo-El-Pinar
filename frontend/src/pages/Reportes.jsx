import { useEffect, useState } from 'react';
import API from '@/api/axios.js';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const SERIE_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac'];

function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-CR')}`;
}

export default function Reportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMes, setSelectedMes] = useState(now.getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(now.getFullYear());

  useEffect(() => {
    setLoading(true);
    API.get('/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMes, selectedAnio]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!data) return null;

  const { resumenSeries, totales, historial } = data;

  const pieData = resumenSeries.map((s) => ({ name: s.nombre, value: s.totalSocios }));
  const recaudacionData = resumenSeries.map((s) => ({ name: s.nombre, recaudado: s.recaudado }));
  const historialFormatted = historial.map((h) => ({
    label: `${MESES[h.mes - 1].slice(0, 3)} ${h.anio}`,
    recaudado: h.recaudado,
  }));

  const totalRecaudado = resumenSeries.reduce((sum, s) => sum + s.recaudado, 0);
  const totalPendiente = resumenSeries.reduce((sum, s) => sum + s.pendientes * 2000, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reportes</h2>
          <p className="page-subtitle">Análisis financiero del club</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <label>Mes</label>
            <select value={selectedMes} onChange={(e) => setSelectedMes(parseInt(e.target.value))}>
              {MESES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Año</label>
            <select value={selectedAnio} onChange={(e) => setSelectedAnio(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-green" />
          <div>
            <p className="kpi-label">Total recaudado (mes)</p>
            <p className="kpi-value">{formatMoney(totalRecaudado)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-amber" />
          <div>
            <p className="kpi-label">Pendiente por cobrar</p>
            <p className="kpi-value">{formatMoney(totalPendiente)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-blue" />
          <div>
            <p className="kpi-label">% Cumplimiento</p>
            <p className="kpi-value">
              {totales.totalSocios > 0
                ? Math.round((totales.totalPagadosMes / totales.totalSocios) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="reports-grid">
        <div className="chart-card">
          <h3 className="section-title">Socios por Serie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={SERIE_COLORS[i % SERIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} socios`]} contentStyle={{ background: '#0d1a10', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#f0fdf4' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="section-title">Recaudación por Serie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={recaudacionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatMoney(v), 'Recaudado']} contentStyle={{ background: '#0d1a10', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#f0fdf4' }} />
              <Bar dataKey="recaudado" radius={[6, 6, 0, 0]}>
                {recaudacionData.map((_, i) => <Cell key={i} fill={SERIE_COLORS[i % SERIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-full">
          <h3 className="section-title">Historial de Recaudación (6 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={historialFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatMoney(v), 'Recaudado']} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="recaudado" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table detail */}
      <div className="table-wrapper" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-title" style={{ marginBottom: '1rem' }}>Detalle por Serie</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Serie</th>
              <th>Total Socios</th>
              <th>Pagados</th>
              <th>Pendientes</th>
              <th>Recaudado</th>
              <th>% Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {resumenSeries.map((s) => (
              <tr key={s.id}>
                <td><span className="serie-pill">{s.nombre}</span></td>
                <td>{s.totalSocios}</td>
                <td><span className="badge badge-green">{s.pagados}</span></td>
                <td><span className="badge badge-amber">{s.pendientes}</span></td>
                <td className="monto-cell">{formatMoney(s.recaudado)}</td>
                <td>
                  <div className="table-progress">
                    <div className="table-progress-fill" style={{ width: `${s.porcentajePago}%` }} />
                    <span>{s.porcentajePago}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
