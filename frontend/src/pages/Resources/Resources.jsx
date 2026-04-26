import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '@/config';
import toast from 'react-hot-toast';
import { Download, ThumbsUp, ThumbsDown, Eye, Plus, Filter } from 'lucide-react';

const Resources = () => {
  const { user, token } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: '',
    type: '',
    sortBy: 'createdAt',
    order: 'desc'
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.type) params.append('type', filters.type);
      params.append('sortBy', filters.sortBy);
      params.append('order', filters.order);

      const response = await axios.get(`${API_BASE_URL}/resources?${params}`);
      if (Array.isArray(response.data)) {
        setResources(response.data);
      } else {
        setResources([]);
        console.error('Expected array from /api/resources, got:', response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (resourceId, vote) => {
    try {
      await axios.post(`${API_BASE_URL}/resources/${resourceId}/vote`, { vote }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchResources(); // Refresh to get updated votes
      toast.success('Vote recorded');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleDownload = async (resource) => {
    try {
      if (resource.type === 'link') {
        window.open(resource.content, '_blank');
      } else if (resource.type === 'text') {
        // For text resources, download as txt
        const blob = new Blob([resource.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For doc/pdf files, download from backend endpoint
        const response = await axios.get(
          `${API_BASE_URL}/resources/${resource._id}/download`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
          }
        );
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = resource.title;
        link.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  const stages = ['idea', 'validation', 'early', 'growth', 'scaling'];
  const types = ['text', 'doc', 'pdf', 'link'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">Loading Resources...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
        {user && (
          <Link
            to="/resources/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Resource
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filters.stage}
            onChange={(e) => setFilters({...filters, stage: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="createdAt">Date Added</option>
            <option value="downloads">Downloads</option>
            <option value="votes.likes">Likes</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => setFilters({...filters, order: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(resources) && resources.map(resource => (
          <div key={resource._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
            <p className="text-gray-600 mb-3">{resource.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {resource.stage}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {resource.type}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              By {resource.author?.name || 'Unknown'} • {resource.downloads} downloads
            </p>

            {/* Votes */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handleVote(resource._id, 'like')}
                className="flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <ThumbsUp size={16} />
                {resource.votes.likes}
              </button>
              <button
                onClick={() => handleVote(resource._id, 'dislike')}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <ThumbsDown size={16} />
                {resource.votes.dislikes}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to={`/resources/${resource._id}`}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-center hover:bg-gray-200 flex items-center justify-center gap-1"
              >
                <Eye size={16} />
                View
              </Link>
              <button
                onClick={() => handleDownload(resource)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No resources found. Be the first to add one!</p>
        </div>
      )}
    </div>
  );
};

export default Resources;