import { useEffect, useState, useCallback } from 'react';
import API from '../services/axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  Plus, Edit2, Trash2, X, Check,
} from 'lucide-react';

const MESES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MESES_FULL = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CATEGORIAS_INGRESO = ['Cuotas', 'Donación', 'Evento', 'Otro Ingreso'];
const CATEGORIAS_EGRESO = ['Mantenimiento', 'Salarios', 'Árbitros', 'Equipamiento', 'Servicios', 'Otro Gasto'];

const COLORS_INGRESO = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
const COLORS_EGRESO  = ['#ef4444', '#f97316', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-CR')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = {
  tipo: 'ingreso',
  categoria: 'Cuotas',
  descripcion: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  notas: '',
};

export default function Finanzas() {
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(''); // '' = todos los meses
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [stats, setStats] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [totalTx, setTotalTx] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch estadísticas
  const fetchStats = useCallback(() => {
    setLoadingStats(true);
    API.get(`/finanzas/estadisticas?anio=${anio}`)
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [anio]);

  // Fetch transacciones
  const fetchTx = useCallback(() => {
    setLoadingTx(true);
    const params = new URLSearchParams({ anio, limit: 100 });
    if (mes) params.set('mes', mes);
    if (tipoFiltro) params.set('tipo', tipoFiltro);
    API.get(`/finanzas?${params}`)
      .then((r) => { setTransacciones(r.data.transacciones); setTotalTx(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingTx(false));
  }, [anio, mes, tipoFiltro]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTx(); }, [fetchTx]);

  // Abrir modal para crear
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  // Abrir modal para editar
  const openEdit = (tx) => {
    setEditTarget(tx);
    setForm({
      tipo: tx.tipo,
      categoria: tx.categoria,
      descripcion: tx.descripcion,
      monto: tx.monto,
      fecha: tx.fecha.split('T')[0],
      notas: tx.notas || '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
      setForm((f) => ({
        ...f,
        tipo: value,
        categoria: value === 'ingreso' ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0],
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!form.descripcion || !form.monto || !form.fecha || !form.categoria) {
      toast.error('Completa todos los campos requeridos.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await API.put(`/finanzas/${editTarget.id}`, form);
        toast.success('Transacción actualizada.');
      } else {
        await API.post('/finanzas', form);
        toast.success('Transacción registrada.');
      }
      closeModal();
      fetchStats();
      fetchTx();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/finanzas/${id}`);
      toast.success('Transacción eliminada.');
      setConfirmDelete(null);
      fetchStats();
      fetchTx();
    } catch {
      toast.error('Error al eliminar.');
    }
  };

  // ─── Datos para gráficos ───────────────────────────────────────────────────
  const historialData = stats?.historialMensual?.map((h) => ({
    mes: MESES[h.mes],
    Ingresos: h.ingresos,
    Egresos: h.egresos,
    Balance: h.balance,
  })) || [];

  const categoriaEgresoData = stats?.porCategoria
    ?.filter((c) => c.tipo === 'egreso')
    .map((c) => ({ name: c.categoria, value: c.monto })) || [];

  const categoriaIngresoData = stats?.porCategoria
    ?.filter((c) => c.tipo === 'ingreso')
    .map((c) => ({ name: c.categoria, value: c.monto })) || [];

  const tooltipStyle = {
    background: '#0d1a10',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 8,
    color: '#f0fdf4',
    fontSize: 13,
  };

  const tickStyle = { fill: '#86efac', fontSize: 11 };
  const gridStyle = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.06)' };

  return (
    <div className="page">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Finanzas</h2>
          <p className="page-subtitle">Ingresos, egresos y estadísticas del club</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <label>Año</label>
            <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nueva transacción
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────────────── */}
      {loadingStats ? (
        <div className="page-loading" style={{ height: 120 }}><div className="spinner" /></div>
      ) : (
        <div className="finanzas-kpis">
          <div className="fin-kpi-card fin-kpi-green">
            <div className="fin-kpi-icon"><TrendingUp size={22} /></div>
            <div>
              <p className="fin-kpi-label">Total Ingresos</p>
              <p className="fin-kpi-value">{formatMoney(stats?.totales?.totalIngresos)}</p>
              <p className="fin-kpi-sub">Año {anio}</p>
            </div>
          </div>
          <div className="fin-kpi-card fin-kpi-red">
            <div className="fin-kpi-icon"><TrendingDown size={22} /></div>
            <div>
              <p className="fin-kpi-label">Total Egresos</p>
              <p className="fin-kpi-value">{formatMoney(stats?.totales?.totalEgresos)}</p>
              <p className="fin-kpi-sub">Año {anio}</p>
            </div>
          </div>
          <div className={`fin-kpi-card ${(stats?.totales?.balanceNeto || 0) >= 0 ? 'fin-kpi-blue' : 'fin-kpi-amber'}`}>
            <div className="fin-kpi-icon"><DollarSign size={22} /></div>
            <div>
              <p className="fin-kpi-label">Balance Neto</p>
              <p className="fin-kpi-value">{formatMoney(stats?.totales?.balanceNeto)}</p>
              <p className="fin-kpi-sub">{(stats?.totales?.balanceNeto || 0) >= 0 ? '✓ Superávit' : '⚠ Déficit'}</p>
            </div>
          </div>
          <div className="fin-kpi-card fin-kpi-purple">
            <div className="fin-kpi-icon"><Activity size={22} /></div>
            <div>
              <p className="fin-kpi-label">Transacciones</p>
              <p className="fin-kpi-value">{stats?.totales?.totalTransacciones || 0}</p>
              <p className="fin-kpi-sub">Año {anio}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Gráficos ───────────────────────────────────────────────────────── */}
      {!loadingStats && stats && (
        <div className="reports-grid" style={{ marginTop: '1.5rem' }}>
          {/* Barras: Ingresos vs Egresos por mes */}
          <div className="chart-card chart-full">
            <h3 className="section-title">Ingresos vs Egresos por Mes</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={historialData} barCategoryGap="25%">
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="mes" tick={tickStyle} />
                <YAxis tick={tickStyle} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatMoney(v)]} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: '#86efac', fontSize: 12 }} />
                <Bar dataKey="Ingresos" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Egresos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Área: Balance acumulado */}
          <div className="chart-card chart-full">
            <h3 className="section-title">Balance Mensual</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={historialData}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="mes" tick={tickStyle} />
                <YAxis tick={tickStyle} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatMoney(v), 'Balance']} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="Balance" stroke="#22c55e" fill="url(#balGrad)" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Torta: Categorías de egresos */}
          {categoriaEgresoData.length > 0 && (
            <div className="chart-card">
              <h3 className="section-title">Egresos por Categoría</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoriaEgresoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                    {categoriaEgresoData.map((_, i) => <Cell key={i} fill={COLORS_EGRESO[i % COLORS_EGRESO.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [formatMoney(v)]} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Torta: Categorías de ingresos */}
          {categoriaIngresoData.length > 0 && (
            <div className="chart-card">
              <h3 className="section-title">Ingresos por Categoría</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoriaIngresoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                    {categoriaIngresoData.map((_, i) => <Cell key={i} fill={COLORS_INGRESO[i % COLORS_INGRESO.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [formatMoney(v)]} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ─── Tabla de transacciones ─────────────────────────────────────────── */}
      <div className="table-wrapper" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Transacciones ({totalTx})</h3>
          <div className="header-actions" style={{ gap: '0.5rem' }}>
            <div className="filter-group">
              <label>Mes</label>
              <select value={mes} onChange={(e) => setMes(e.target.value)}>
                <option value="">Todos</option>
                {MESES_FULL.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Tipo</label>
              <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                <option value="">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
            </div>
          </div>
        </div>

        {loadingTx ? (
          <div className="page-loading" style={{ height: 80 }}><div className="spinner" /></div>
        ) : transacciones.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No hay transacciones registradas</p>
            <button className="btn-primary" onClick={openCreate} style={{ marginTop: '0.75rem' }}>
              <Plus size={15} /> Registrar primera transacción
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.fecha)}</td>
                  <td>
                    <span className={`badge ${tx.tipo === 'ingreso' ? 'badge-green' : 'badge-red'}`}>
                      {tx.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                    </span>
                  </td>
                  <td><span className="serie-pill">{tx.categoria}</span></td>
                  <td>{tx.descripcion}</td>
                  <td className={`monto-cell ${tx.tipo === 'egreso' ? 'monto-red' : ''}`}>
                    {tx.tipo === 'egreso' ? '-' : '+'}{formatMoney(tx.monto)}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tx.notas || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="action-btn" onClick={() => openEdit(tx)} title="Editar">
                        <Edit2 size={15} />
                      </button>
                      {confirmDelete === tx.id ? (
                        <>
                          <button className="action-btn action-btn-danger" onClick={() => handleDelete(tx.id)} title="Confirmar">
                            <Check size={15} />
                          </button>
                          <button className="action-btn" onClick={() => setConfirmDelete(null)} title="Cancelar">
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <button className="action-btn action-btn-danger" onClick={() => setConfirmDelete(tx.id)} title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card fin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editTarget ? 'Editar transacción' : 'Nueva transacción'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="modal-body">
              {/* Tipo */}
              <div className="fin-tipo-toggle">
                <button
                  className={`fin-tipo-btn ${form.tipo === 'ingreso' ? 'active-ingreso' : ''}`}
                  onClick={() => handleFormChange({ target: { name: 'tipo', value: 'ingreso' } })}
                >
                  <TrendingUp size={16} /> Ingreso
                </button>
                <button
                  className={`fin-tipo-btn ${form.tipo === 'egreso' ? 'active-egreso' : ''}`}
                  onClick={() => handleFormChange({ target: { name: 'tipo', value: 'egreso' } })}
                >
                  <TrendingDown size={16} /> Egreso
                </button>
              </div>

              <div className="form-grid-2">
                {/* Categoría */}
                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select name="categoria" value={form.categoria} onChange={handleFormChange} className="form-input">
                    {(form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Monto */}
                <div className="form-group">
                  <label className="form-label">Monto *</label>
                  <input
                    type="number"
                    name="monto"
                    value={form.monto}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    step="100"
                  />
                </div>

                {/* Fecha */}
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                {/* Descripción */}
                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Ej: Cuotas enero, Compra de uniformes..."
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Notas (opcional)</label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleFormChange}
                  className="form-input"
                  rows={3}
                  placeholder="Información adicional..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className={`btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editTarget ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
