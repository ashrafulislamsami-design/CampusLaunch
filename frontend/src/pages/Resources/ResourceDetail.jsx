import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Download, ThumbsUp, ThumbsDown, Edit, Trash2, ArrowLeft } from 'lucide-react';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await axios.get(`/api/resources/${id}`);
      setResource(response.data);
    } catch (error) {
      toast.error('Failed to fetch resource');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    try {
      await axios.post(`/api/resources/${id}/vote`, { vote }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchResource(); // Refresh to get updated votes
      toast.success('Vote recorded');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleDownload = async () => {
    try {
      if (resource.type === 'link') {
        window.open(resource.content, '_blank');
      } else if (resource.type === 'text') {
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
          `/api/resources/${id}/download`,
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
      // Download count is now incremented on the backend
      fetchResource(); // Update download count display
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await axios.delete(`/api/resources/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Resource deleted');
      navigate('/resources');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">Loading Resource...</div>
      </div>
    );
  }

  if (!resource) return null;

  const canEdit = user && (user._id === resource.author._id || user.role === 'Organizer');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Resources
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {resource.stage}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {resource.type}
              </span>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/resources/${id}/edit`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center gap-1"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6">{resource.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Author</h3>
            <p>{resource.author.name}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Downloads</h3>
            <p>{resource.downloads}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Added</h3>
            <p>{new Date(resource.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Votes */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('like')}
              className="flex items-center gap-1 text-green-600 hover:text-green-800"
            >
              <ThumbsUp size={20} />
              {resource.votes.likes}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('dislike')}
              className="flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <ThumbsDown size={20} />
              {resource.votes.dislikes}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">How to Use</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{resource.instructions}</p>
        </div>

        {/* Content */}
        {(resource.type === 'text' || resource.type === 'link') && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Content</h3>
            {resource.type === 'link' ? (
              <a
                href={resource.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {resource.content}
              </a>
            ) : (
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                {resource.content}
              </div>
            )}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download size={20} />
          {resource.type === 'link' ? 'Open Link' : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default ResourceDetail;