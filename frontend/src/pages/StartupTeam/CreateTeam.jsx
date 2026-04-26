import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '@/config';
import { Rocket } from 'lucide-react';

const CreateTeam = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', problemStatement: '', solution: '', targetCustomer: '', stage: 'Idea', logoUrl: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create team');

      // Redirect to new team dashboard
      navigate(`/teams/dashboard/${data._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-xl shadow-md border border-indigo-50 p-8">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket size={32} />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Start Your Journey</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
              <input type="text" name="name" onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="e.g. NextGen AI" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
              <textarea name="problemStatement" onChange={handleChange} required rows="3" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="What problem are you solving?"></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Solution</label>
              <textarea name="solution" onChange={handleChange} required rows="3" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="How does your startup solve it?"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Customer</label>
              <input type="text" name="targetCustomer" onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="e.g. College Students" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
              <select name="stage" onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500">
                <option value="Idea">Just an Idea</option>
                <option value="Testing">Testing</option>
                <option value="Building MVP">Building MVP</option>
                <option value="Growing">Growing</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition">
              Create Team workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
