import { useEffect, useState } from 'react';
import API from '../api/axios.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const SERIE_COLORS = {
  'Honor': '#16a34a',
  'Segunda': '#22c55e',
  'Años Dorados': '#4ade80',
  'Super Seniors': '#86efac',
};

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-CR')}`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!data) return <div className="page-error">Error al cargar el dashboard</div>;

  const { resumenSeries, totales, historial } = data;

  const historialFormatted = historial.map((h) => ({
    label: `${MESES[h.mes - 1]} ${h.anio}`,
    recaudado: h.recaudado,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Resumen del mes — {MESES[totales.mesActual - 1]} {totales.anioActual}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-blue"><Users size={22} /></div>
          <div>
            <p className="kpi-label">Total Socios Activos</p>
            <p className="kpi-value">{totales.totalSocios}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-green"><CheckCircle size={22} /></div>
          <div>
            <p className="kpi-label">Pagos al día (mes)</p>
            <p className="kpi-value">{totales.totalPagadosMes}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-amber"><AlertCircle size={22} /></div>
          <div>
            <p className="kpi-label">Pendientes (mes)</p>
            <p className="kpi-value">{totales.totalPendientesMes}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-purple"><TrendingUp size={22} /></div>
          <div>
            <p className="kpi-label">Recaudado este mes</p>
            <p className="kpi-value">{formatMoney(totales.recaudacionMes)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Series cards */}
        <div className="series-section">
          <h3 className="section-title">Estado por Serie</h3>
          <div className="series-cards">
            {resumenSeries.map((serie) => (
              <div key={serie.id} className="serie-card">
                <div
                  className="serie-accent"
                  style={{ background: SERIE_COLORS[serie.nombre] || '#6366f1' }}
                />
                <div className="serie-card-content">
                  <div className="serie-card-header">
                    <h4 className="serie-name">{serie.nombre}</h4>
                    <span className="serie-badge">{serie.totalSocios} socios</span>
                  </div>

                  <div className="serie-progress-bar">
                    <div
                      className="serie-progress-fill"
                      style={{
                        width: `${serie.porcentajePago}%`,
                        background: SERIE_COLORS[serie.nombre] || '#6366f1',
                      }}
                    />
                  </div>
                  <p className="serie-progress-label">{serie.porcentajePago}% al día</p>

                  <div className="serie-stats">
                    <div className="serie-stat">
                      <span className="stat-dot dot-green" />
                      <span>{serie.pagados} pagados</span>
                    </div>
                    <div className="serie-stat">
                      <span className="stat-dot dot-amber" />
                      <span>{serie.pendientes} pendientes</span>
                    </div>
                    <div className="serie-recaudado">
                      {formatMoney(serie.recaudado)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="chart-section">
          <h3 className="section-title">Recaudación últimos 6 meses</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={historialFormatted} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [formatMoney(v), 'Recaudado']}
                  contentStyle={{
                    background: '#0d1a10',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="recaudado" radius={[6, 6, 0, 0]}>
                  {historialFormatted.map((_, i) => (
                    <Cell key={i} fill={i === historialFormatted.length - 1 ? '#22c55e' : '#1a3d24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
