import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    university: '',
    skills: '',
    lookingFor: '',
    hoursPerWeek: '',
    workStyle: '',
    ideaStage: '',
    adminSecret: '',
    jobDetails: '',
    expertise: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (formData.role === 'Student') {
      payload.skills = formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        payload.lookingFor = formData.lookingFor
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        if (formData.hoursPerWeek) payload.hoursPerWeek = Number(formData.hoursPerWeek);
        if (formData.workStyle) payload.workStyle = formData.workStyle;
        if (formData.ideaStage) payload.ideaStage = formData.ideaStage;
      } else if (formData.role === 'Mentor') {
        payload.expertise = formData.expertise
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        // Ensure jobDetails is sent
        payload.jobDetails = formData.jobDetails;
      } else {
        delete payload.skills;
        delete payload.lookingFor;
        delete payload.jobDetails;
        delete payload.expertise;
      }

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      login(data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">Create an Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500">
              <option value="Student">Student</option>
              <option value="Mentor">Mentor</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>
          {formData.role === 'Student' && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">University</label>
                <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. React, Node.js, UI Design"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Interests (comma separated)</label>
                <input
                  type="text"
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. AI, FinTech, Sustainability"
                  required
                />
              </div>
              {/* Multi-dimensional matching fields */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Hours Available Per Week</label>
                <select
                  name="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select availability</option>
                  <option value="5">~5 hrs/week (side project)</option>
                  <option value="10">~10 hrs/week (part-time)</option>
                  <option value="20">~20 hrs/week (serious)</option>
                  <option value="40">~40 hrs/week (full-time)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Work Style Preference</label>
                <select
                  name="workStyle"
                  value={formData.workStyle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select preference</option>
                  <option value="remote">Online (Remote)</option>
                  <option value="in-person">Offline (In-Person)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Startup Idea Stage</label>
                <select
                  name="ideaStage"
                  value={formData.ideaStage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select stage</option>
                  <option value="idea">Idea — just brainstorming</option>
                  <option value="prototype">Prototype — building a demo</option>
                  <option value="mvp">MVP — first real product</option>
                  <option value="growth">Growth — users &amp; traction</option>
                </select>
              </div>
            </>
          )}
          {formData.role === 'Mentor' && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Job Details (Title/Company)</label>
                <input
                  type="text"
                  name="jobDetails"
                  value={formData.jobDetails}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Senior Developer at Google"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Expertise (comma separated)</label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. tech, marketing, fundraising"
                  required
                />
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition mt-4">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
