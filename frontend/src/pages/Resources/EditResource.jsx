import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text',
    content: '',
    stage: 'idea',
    instructions: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources/${id}`);
      const resource = response.data;
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        content: resource.content || '',
        stage: resource.stage,
        instructions: resource.instructions,
        tags: resource.tags.join(', ')
      });
    } catch (error) {
      toast.error('Failed to fetch resource');
      navigate('/resources');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (file) {
        data.append('file', file);
      }

      await axios.put(`${API_BASE_URL}/resources/${id}`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Resource updated successfully');
      navigate(`/resources/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update resource';
      toast.error(errorMessage);
      console.error('Resource update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stages = ['idea', 'validation', 'early', 'growth', 'scaling'];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Resource</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="text">Text</option>
            <option value="doc">Document</option>
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Startup Stage</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {(formData.type === 'text' || formData.type === 'link') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'text' ? 'Content' : 'URL'}
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
              className="w-full border rounded px-3 py-2"
              placeholder={formData.type === 'link' ? 'https://...' : 'Enter the text content...'}
            />
          </div>
        )}

        {(formData.type === 'doc' || formData.type === 'pdf') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">File (leave empty to keep current)</label>
            <input
              type="file"
              accept={formData.type === 'pdf' ? '.pdf' : '.doc,.docx,.txt'}
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border rounded px-3 py-2"
            placeholder="How to use this resource..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="template, legal, finance..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Resource'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/resources/${id}`)}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditResource;