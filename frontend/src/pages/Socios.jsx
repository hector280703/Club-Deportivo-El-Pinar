import { useEffect, useState } from 'react';
import API from '../services/axios';
import toast from 'react-hot-toast';
import { UserPlus, Search, Edit2, X, Trash2 } from 'lucide-react';

export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSerie, setFilterSerie] = useState('');

  const emptyForm = { nombre: '', apellido: '', rut: '', telefono: '', email: '', seriesIds: [] };
  const [form, setForm] = useState(emptyForm);

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const params = { activo: true };
      if (filterSerie) params.serieId = filterSerie;
      const { data } = await API.get('/socios', { params });
      setSocios(data);
    } catch {
      toast.error('Error al cargar socios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { API.get('/series').then((r) => setSeries(r.data)); }, []);
  useEffect(() => { fetchSocios(); }, [filterSerie]);

  const toggleSerie = (id) => {
    const ids = form.seriesIds.includes(id)
      ? form.seriesIds.filter((s) => s !== id)
      : [...form.seriesIds, id];
    setForm({ ...form, seriesIds: ids });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.seriesIds.length) { toast.error('Selecciona al menos una serie'); return; }
    try {
      if (editingSocio) {
        await API.put(`/socios/${editingSocio.id}`, form);
        toast.success('Socio actualizado ✅');
      } else {
        await API.post('/socios', form);
        toast.success('Socio registrado ✅');
      }
      setShowModal(false);
      setEditingSocio(null);
      setForm(emptyForm);
      fetchSocios();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar socio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este socio?')) return;
    try {
      await API.delete(`/socios/${id}`);
      toast.success('Socio desactivado');
      fetchSocios();
    } catch { toast.error('Error al desactivar socio'); }
  };

  const openEdit = (socio) => {
    setEditingSocio(socio);
    setForm({
      nombre: socio.nombre,
      apellido: socio.apellido,
      rut: socio.rut,
      telefono: socio.telefono || '',
      email: socio.email || '',
      seriesIds: socio.series.map((ss) => ss.serieId),
    });
    setShowModal(true);
  };

  const filtered = socios.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(q) ||
      s.apellido.toLowerCase().includes(q) ||
      s.rut?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Socios</h2>
          <p className="page-subtitle">{filtered.length} socios activos</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingSocio(null); setForm(emptyForm); setShowModal(true); }}>
          <UserPlus size={18} /> Nuevo Socio
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Buscar por nombre o RUT..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Serie</label>
          <select value={filterSerie} onChange={(e) => setFilterSerie(e.target.value)}>
            <option value="">Todas</option>
            {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <div className="socios-grid">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>No se encontraron socios</p></div>
          ) : (
            filtered.map((socio) => (
              <div key={socio.id} className="socio-card">
                <div className="socio-card-avatar">
                  {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                </div>
                <div className="socio-card-info">
                  <h4>{socio.apellido}, {socio.nombre}</h4>
                  <p className="socio-cedula">RUT: {socio.rut}</p>
                  {socio.telefono && <p className="socio-detail">📞 {socio.telefono}</p>}
                  {socio.email && <p className="socio-detail">✉️ {socio.email}</p>}
                  <div className="socio-series-pills">
                    {socio.series.map((ss) => (
                      <span key={ss.serieId} className="serie-pill serie-pill-card">{ss.serie.nombre}</span>
                    ))}
                  </div>
                </div>
                <div className="socio-card-actions">
                  <button className="action-btn action-edit" onClick={() => openEdit(socio)} title="Editar"><Edit2 size={15} /></button>
                  <button className="action-btn action-danger" onClick={() => handleDelete(socio.id)} title="Desactivar"><Trash2 size={15} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSocio ? 'Editar Socio' : 'Nuevo Socio'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Carlos" />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Méndez" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>RUT *</label>
                  <input required value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 8888 1234" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
              </div>
              <div className="form-group">
                <label>Series * <span style={{fontWeight:400, color:'var(--text-muted)'}}>(selecciona una o más)</span></label>
                <div className="series-checkboxes">
                  {series.map((s) => (
                    <label key={s.id} className={`serie-checkbox ${form.seriesIds.includes(s.id) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.seriesIds.includes(s.id)} onChange={() => toggleSerie(s.id)} />
                      {s.nombre}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
