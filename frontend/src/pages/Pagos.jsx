import { useEffect, useState, useCallback } from 'react';
import API from '@/api/axios.js';
import toast from 'react-hot-toast';
import { RefreshCw, X, Check, ChevronDown, Zap } from 'lucide-react';

const MESES = [
  '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];
const MESES_FULL = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-CR')}`;
}

function MesCell({ pago, onClick }) {
  if (!pago) {
    return (
      <td className="mes-cell mes-empty" onClick={onClick} title="Sin registro — clic para registrar">
        <span className="mes-dash">—</span>
      </td>
    );
  }
  if (pago.estado === 'pagado') {
    return (
      <td className="mes-cell mes-pagado" onClick={onClick} title={`Pagado: ${formatMoney(pago.monto)} — clic para editar`} style={{ cursor: 'pointer' }}>
        <span className="mes-icon">✓</span>
        <span className="mes-monto">{formatMoney(pago.monto)}</span>
      </td>
    );
  }
  if (pago.estado === 'vencido') {
    return (
      <td className="mes-cell mes-vencido" onClick={onClick} title="Vencido — clic para editar">
        <span className="mes-icon">!</span>
      </td>
    );
  }
  return (
    <td className="mes-cell mes-pendiente" onClick={onClick} title="Pendiente — clic para marcar pagado">
      <span className="mes-icon">○</span>
    </td>
  );
}

export default function Pagos() {
  const [socios, setSocios] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [filterSerie, setFilterSerie] = useState('');
  const [search, setSearch] = useState('');

  // Modal pago rápido
  const [quickModal, setQuickModal] = useState(null); // { socio, mes, pagoExistente }
  const [quickForm, setQuickForm] = useState({ monto: 2000, estado: 'pagado', fechaPago: '', notas: '' });

  // Modal generar mes
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ mes: new Date().getMonth() + 1, anio: new Date().getFullYear(), monto: 2000 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { anio };
      if (filterSerie) params.serieId = filterSerie;
      const { data } = await API.get('/pagos/resumen-anual', { params });
      setSocios(data);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [anio, filterSerie]);

  useEffect(() => {
    API.get('/series').then((r) => setSeries(r.data));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openQuickModal = (socio, mes) => {
    const pago = socio.pagos[mes];
    setQuickModal({ socio, serieId: socio.serieId, mes, pago });
    setQuickForm({
      monto: pago?.monto ?? 2000,
      estado: pago?.estado ?? 'pagado',
      fechaPago: pago?.fechaPago ? pago.fechaPago.split('T')[0] : new Date().toISOString().split('T')[0],
      notas: pago?.notas ?? '',
    });
  };

  const handleQuickSave = async (e) => {
    e.preventDefault();
    const { socio, serieId, mes, pago } = quickModal;
    try {
      if (pago) {
        await API.put(`/pagos/${pago.id}`, {
          estado: quickForm.estado,
          monto: parseFloat(quickForm.monto),
          fechaPago: quickForm.estado === 'pagado' ? quickForm.fechaPago : null,
          notas: quickForm.notas,
        });
      } else {
        await API.post('/pagos', {
          socioId: socio.socioId,
          serieId,
          mes,
          anio,
          monto: parseFloat(quickForm.monto),
          estado: quickForm.estado,
          fechaPago: quickForm.estado === 'pagado' ? quickForm.fechaPago : null,
          notas: quickForm.notas,
        });
      }
      toast.success('Pago guardado ✅');
      setQuickModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar pago');
    }
  };

  const handleGenerar = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/pagos/generar-mes', genForm);
      toast.success(data.message);
      setShowGenModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al generar cuotas');
    }
  };

  const filtered = socios.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(q) ||
      s.apellido.toLowerCase().includes(q) ||
      s.rut?.toLowerCase().includes(q)
    );
  });

  // Agrupar por serie para separar con cabeceras
  const grouped = filtered.reduce((acc, s) => {
    const key = s.serie.nombre;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  // Estadísticas rápidas
  const mesActual = new Date().getMonth() + 1;
  const totalSocios = filtered.length;
  const pagadosHoy = filtered.filter((s) => s.pagos[mesActual]?.estado === 'pagado').length;
  const pendientesHoy = totalSocios - pagadosHoy;
  const recaudadoAnio = filtered.reduce((sum, s) =>
    sum + Object.values(s.pagos).filter(p => p.estado === 'pagado').reduce((a, p) => a + p.monto, 0), 0);

  return (
    <div className="page pagos-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestión de Pagos</h2>
          <p className="page-subtitle">Vista anual · {anio}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowGenModal(true)}>
            <Zap size={16} /> Generar cuotas
          </button>
          <button className="btn-secondary icon-btn" onClick={fetchData} title="Refrescar">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="pagos-kpis">
        <div className="pagos-kpi">
          <span className="pkpi-label">Socios activos</span>
          <span className="pkpi-value">{totalSocios}</span>
        </div>
        <div className="pagos-kpi pkpi-green">
          <span className="pkpi-label">Pagados (mes actual)</span>
          <span className="pkpi-value">{pagadosHoy}</span>
        </div>
        <div className="pagos-kpi pkpi-amber">
          <span className="pkpi-label">Pendientes (mes actual)</span>
          <span className="pkpi-value">{pendientesHoy}</span>
        </div>
        <div className="pagos-kpi pkpi-gold">
          <span className="pkpi-label">Recaudado {anio}</span>
          <span className="pkpi-value pkpi-value-sm">{formatMoney(recaudadoAnio)}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Año</label>
          <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))}>
            {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Serie</label>
          <select value={filterSerie} onChange={(e) => setFilterSerie(e.target.value)}>
            <option value="">Todas</option>
            {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div className="search-box" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Leyenda */}
      <div className="mes-legend">
        <span className="legend-item"><span className="legend-dot dot-pagado">✓</span> Pagado</span>
        <span className="legend-item"><span className="legend-dot dot-pendiente">○</span> Pendiente</span>
        <span className="legend-item"><span className="legend-dot dot-vencido">!</span> Vencido</span>
        <span className="legend-item"><span className="legend-dot dot-empty">—</span> Sin registro</span>
        <span className="legend-hint">Haz clic en una celda para registrar o editar el pago</span>
      </div>

      {/* Tabla matricial */}
      <div className="matriz-wrapper">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>No se encontraron socios</div>
        ) : (
          <table className="matriz-table">
            <thead>
              <tr>
                <th className="col-nombre">Nombre</th>
                <th className="col-serie">Serie</th>
                {MESES.slice(1).map((m, i) => (
                  <th key={i + 1} className={`col-mes ${i + 1 === mesActual && anio === new Date().getFullYear() ? 'col-mes-actual' : ''}`}>
                    {m}
                  </th>
                ))}
                <th className="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([serieName, sociosList]) => (
                <>
                  <tr key={`header-${serieName}`} className="serie-header-row">
                    <td colSpan={15} className="serie-header-cell">{serieName}</td>
                  </tr>
                  {sociosList.map((socio) => {
                    const totalPagado = Object.values(socio.pagos)
                      .filter((p) => p.estado === 'pagado')
                      .reduce((a, p) => a + p.monto, 0);
                    return (
                      <tr key={`${socio.socioId}-${socio.serieId}`} className="socio-row">
                        <td className="col-nombre-cell">
                          <div className="socio-name-cell">
                            <div className="socio-mini-avatar">
                              {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                            </div>
                            <div>
                              <div className="socio-fullname">{socio.apellido}, {socio.nombre}</div>
                              <div className="socio-rut-small">{socio.rut}</div>
                            </div>
                          </div>
                        </td>
                        <td className="col-serie-cell">
                          <span className="serie-pill">{socio.serie.nombre}</span>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                          <MesCell
                            key={mes}
                            pago={socio.pagos[mes]}
                            onClick={() => openQuickModal(socio, mes)}
                          />
                        ))}
                        <td className="col-total-cell">
                          {totalPagado > 0 ? (
                            <span className="total-pagado">{formatMoney(totalPagado)}</span>
                          ) : (
                            <span className="total-cero">$0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Pago Rápido */}
      {quickModal && (
        <div className="modal-overlay" onClick={() => setQuickModal(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {quickModal.pago ? 'Editar pago' : 'Registrar pago'} —&nbsp;
                {MESES_FULL[quickModal.mes]} {anio}
              </h3>
              <button className="modal-close" onClick={() => setQuickModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-socio-info">
              <div className="socio-mini-avatar">{quickModal.socio.nombre.charAt(0)}{quickModal.socio.apellido.charAt(0)}</div>
              <div>
                <div className="socio-fullname">{quickModal.socio.apellido}, {quickModal.socio.nombre}</div>
                <div className="socio-rut-small">{quickModal.socio.rut} · {quickModal.socio.serie.nombre}</div>
              </div>
            </div>
            <form onSubmit={handleQuickSave} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Monto ($)</label>
                  <input
                    type="number" required value={quickForm.monto}
                    onChange={(e) => setQuickForm({ ...quickForm, monto: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={quickForm.estado} onChange={(e) => setQuickForm({ ...quickForm, estado: e.target.value })}>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>
              {quickForm.estado === 'pagado' && (
                <div className="form-group">
                  <label>Fecha de pago</label>
                  <input type="date" value={quickForm.fechaPago}
                    onChange={(e) => setQuickForm({ ...quickForm, fechaPago: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Notas (opcional)</label>
                <input type="text" value={quickForm.notas} placeholder="Ej: Transferencia bancaria"
                  onChange={(e) => setQuickForm({ ...quickForm, notas: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setQuickModal(null)}>Cancelar</button>
                <button type="submit" className="btn-primary"><Check size={16} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generar Mes */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generar cuotas del mes</h3>
              <button className="modal-close" onClick={() => setShowGenModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleGenerar} className="modal-form">
              <p className="modal-hint">
                Genera cuotas pendientes para todos los socios activos en el mes seleccionado.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Mes</label>
                  <select value={genForm.mes} onChange={(e) => setGenForm({ ...genForm, mes: parseInt(e.target.value) })}>
                    {MESES_FULL.slice(1).map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <select value={genForm.anio} onChange={(e) => setGenForm({ ...genForm, anio: parseInt(e.target.value) })}>
                    {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Monto de cuota ($)</label>
                <input type="number" required value={genForm.monto}
                  onChange={(e) => setGenForm({ ...genForm, monto: parseFloat(e.target.value) })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowGenModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary"><Zap size={16} /> Generar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
