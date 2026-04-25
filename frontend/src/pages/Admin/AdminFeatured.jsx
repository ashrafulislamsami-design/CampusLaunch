import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Star, Plus, Trash2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { getFeatured, addFeatured, updateFeatured, deleteFeatured } from '../../services/adminService';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  mentor:        'bg-teal-100 text-teal-700',
  startup:       'bg-amber-100 text-amber-700',
  event:         'bg-violet-100 text-violet-700',
  success_story: 'bg-emerald-100 text-emerald-700',
};

const TYPE_LABELS = {
  mentor:        'Mentor',
  startup:       'Startup',
  event:         'Event',
  success_story: 'Success Story',
};

const FeaturedItem = ({ item, onToggle, onDelete }) => {
  const ref = item.refId || {};

  const displayName =
    ref.name || ref.title || ref.email || item.title || '(Unnamed)';

  return (
    <div className={`placard p-4 flex items-center gap-4 ${!item.isActive ? 'opacity-50' : ''}`}>
      <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0 ${TYPE_COLORS[item.contentType]}`}>
        {TYPE_LABELS[item.contentType]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-stone-800 truncate">{displayName}</p>
        {item.description && (
          <p className="text-xs text-stone-400 truncate">{item.description}</p>
        )}
      </div>
      <span className="text-xs text-stone-400 flex-shrink-0">
        Order: {item.sortOrder}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(item._id, !item.isActive)}
          className="p-1.5 text-stone-400 hover:text-teal-600 transition"
          title={item.isActive ? 'Deactivate' : 'Activate'}
        >
          {item.isActive ? <ToggleRight size={20} className="text-teal-500" /> : <ToggleLeft size={20} />}
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="p-1.5 text-stone-300 hover:text-red-500 transition"
          title="Remove"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const AddFeaturedModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    contentType: 'mentor',
    refId: '',
    title: '',
    description: '',
    sortOrder: '0',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.refId.trim()) {
      toast.error('Document ID is required');
      return;
    }
    setLoading(true);
    try {
      await onAdd({ ...form, sortOrder: Number(form.sortOrder) });
      toast.success('Featured content added');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-black font-serif-custom text-amber-900">Add Featured Content</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500">Content Type</label>
          <select
            value={form.contentType}
            onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            className="border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          >
            <option value="mentor">Mentor</option>
            <option value="startup">Startup (Team)</option>
            <option value="event">Event</option>
            <option value="success_story">Success Story (User)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500">
            Document ID <span className="text-stone-400 normal-case font-medium">(MongoDB _id)</span>
          </label>
          <input
            type="text"
            value={form.refId}
            onChange={(e) => setForm({ ...form, refId: e.target.value })}
            placeholder="e.g. 64abc123def456..."
            className="border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500">Custom Title (optional)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Override display title..."
            className="border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500">Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 w-24"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-teal-600 text-white font-black text-sm uppercase tracking-widest py-2.5 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Featured'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-stone-500 font-bold text-sm uppercase tracking-widest hover:text-stone-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminFeatured = () => {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      const data = await getFeatured(token, params);
      setItems(data.items);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  const handleToggle = async (id, isActive) => {
    try {
      await updateFeatured(token, id, { isActive });
      setItems((prev) => prev.map((it) => it._id === id ? { ...it, isActive } : it));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this featured item?')) return;
    try {
      await deleteFeatured(token, id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      toast.success('Removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = async (payload) => {
    await addFeatured(token, payload);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {showModal && <AddFeaturedModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      <Link to="/admin" className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8">
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif-custom text-amber-900">Featured Content</h1>
          <p className="text-stone-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="gilded-btn flex items-center gap-2"
        >
          <Plus size={16} /> Add Featured
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'mentor', 'startup', 'event', 'success_story'].map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition ${
              filterType === t ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="placard p-4 h-16 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="placard p-12 text-center text-stone-400">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold">No featured content yet</p>
          <p className="text-sm mt-1">Click "Add Featured" to highlight content on the platform</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <FeaturedItem key={it._id} item={it} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeatured;
