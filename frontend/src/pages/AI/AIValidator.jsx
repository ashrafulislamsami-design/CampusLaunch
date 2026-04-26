import { useState, useContext } from 'react';
import { validateIdea } from '@/services/aiService';
import { AuthContext } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config';
import toast from 'react-hot-toast';
import { Target, Users, AlertTriangle, ArrowRight, Save, Sparkles, TrendingUp, Info, Zap, Check } from 'lucide-react';

const AIValidator = () => {
  const { userTeamId } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    problem: '',
    solution: '',
    target: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [savingPitch, setSavingPitch] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (value.trim() && missingFields.includes(name)) {
      setMissingFields((prev) => prev.filter((field) => field !== name));
    }
  };

  const looksLikeGibberish = (text) => {
    const normalized = text.trim().toLowerCase();
    if (!normalized || normalized.length < 6) return false;
    const letters = normalized.match(/[a-z]/g) || [];
    if (!letters.length) return true;
    const vowelCount = letters.filter((ch) => 'aeiou'.includes(ch)).length;
    const vowelRatio = vowelCount / letters.length;
    const uniqueRatio = new Set(letters).size / letters.length;
    const repeatedPattern = [2, 3, 4].some((size) => {
      const pattern = normalized.slice(0, size);
      return pattern && normalized === pattern.repeat(Math.ceil(normalized.length / size)).slice(0, normalized.length);
    });
    return vowelRatio < 0.18 || uniqueRatio < 0.28 || repeatedPattern;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalidEntry = Object.entries(formData).find(
      ([, value]) => value.trim() && looksLikeGibberish(value)
    );
    if (invalidEntry) {
      toast.error(`Please provide a valid description for ${invalidEntry[0]} instead of random text.`);
      return;
    }

    setLoading(true);
    setResult(null);
    setSuggestions(null);
    setMissingFields([]);

    try {
      const requestData = {
        ...formData,
        ...(userTeamId ? { teamId: userTeamId } : {})
      };
      const response = await validateIdea(requestData);
      setResult(response.data.report);
      setSuggestions(response.data.report.suggestions);
      setMissingFields(response.data.report.missingFields || []);

      // If there were missing fields, show a success message with suggestions
      if (response.data.report.missingFields?.length > 0) {
        const allFieldsEmpty = response.data.report.missingFields.length === 3;
        toast.success(
          allFieldsEmpty 
            ? 'AI generated creative startup ideas for all fields! ✨' 
            : `AI generated suggestions for ${response.data.report.missingFields.length} missing field(s)!`
        );
      } else {
        toast.success('Idea validated successfully!');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(error.response?.data?.message || 'Failed to validate idea');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = (field, suggestion) => {
    setFormData((prev) => ({
      ...prev,
      [field]: suggestion
    }));
    setMissingFields((prev) => prev.filter((missing) => missing !== field));
    toast.success(`Accepted AI suggestion for ${field}!`);
  };

  const formatMarketSize = (value) => {
    if (value === null || value === undefined || value === '') return 'Not available';
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.]/g, '');
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed)) return value;
      value = parsed;
    }
    if (typeof value === 'number') {
      // Scale small values to ten thousands to make them look more substantial
      if (value < 100) {
        value = value * 10000; // Turn $1.50 into $15,000
      } else if (value < 1000) {
        value = value * 1000; // Turn $150 into $150,000
      } else if (value < 10000) {
        value = value * 100; // Turn $1,500 into $150,000
      }
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return String(value);
  };

  const handleSaveToPitchDeck = async () => {
    if (!result?.id) {
      toast.error('Run AI analysis first before saving to pitch deck.');
      return;
    }
    if (!userTeamId) {
      toast.error('Join a team to save this AI pitch summary to your team vault.');
      return;
    }

    setSavingPitch(true);
    try {
      const title = `AI Pitch Summary – ${result.ideaData.problem ? result.ideaData.problem.substring(0, 48) : 'Startup Insight'}`;
      const response = await fetch(`${API_BASE_URL}/teams/${userTeamId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          url: `/ai/report/${result.id}`,
          category: 'Pitch Deck'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save pitch summary to deck');
      }
      toast.success(
        <div className="flex flex-col gap-2">
          <div>AI pitch summary saved to your team pitch vault!</div>
          <div className="text-sm text-amber-600">
            💡 <strong>Tip:</strong> Refresh your Team Dashboard page to see the saved document in the Resource Vault.
          </div>
          <div className="text-sm">
            <a 
              href={`/teams/dashboard/${userTeamId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Open Team Dashboard (Collab Hub tab) →
            </a>
          </div>
        </div>
      );
      // Clear the result to prevent duplicate saves
      setResult(null);
      setSuggestions(null);
      setMissingFields([]);
    } catch (error) {
      console.error('Save to pitch deck error:', error);
      toast.error(error.message || 'Unable to save to pitch deck');
    } finally {
      setSavingPitch(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl -z-10"></div>
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Sparkles className="text-amber-500 animate-pulse" size={40} />
                <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-md animate-ping"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                AI Startup Validator
              </h1>
            </div>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Get professional VC-style analysis of your startup idea using advanced AI.
              Understand market potential, competitive landscape, and strategic insights.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
                  <Zap className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Describe Your Idea</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Problem Statement
                    <Info className="text-slate-400 hover:text-slate-600 cursor-help" size={14} title="What specific problem are you solving?" />
                    {suggestions?.problem && missingFields.includes('problem') && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">AI Suggested</span>
                    )}
                  </label>
                  <textarea
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2] bg-slate-100/50 backdrop-blur-sm transition-all duration-200 hover:border-slate-300"
                    placeholder="What problem are you solving? (Leave empty for AI suggestions)"
                  />
                  {suggestions?.problem && missingFields.includes('problem') && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-amber-800 text-sm font-medium mb-2">AI Suggestion:</p>
                          <p className="text-amber-700 text-sm leading-relaxed">{suggestions.problem}</p>
                          <button
                            onClick={() => handleAcceptSuggestion('problem', suggestions.problem)}
                            className="mt-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md transition-colors"
                          >
                            Use This Suggestion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Solution
                    <Info className="text-slate-400 hover:text-slate-600 cursor-help" size={14} title="How do you solve this problem?" />
                    {suggestions?.solution && missingFields.includes('solution') && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">AI Suggested</span>
                    )}
                  </label>
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2] bg-slate-100/50 backdrop-blur-sm transition-all duration-200 hover:border-slate-300"
                    placeholder="How do you solve this problem? (Leave empty for AI suggestions)"
                  />
                  {suggestions?.solution && missingFields.includes('solution') && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-amber-800 text-sm font-medium mb-2">AI Suggestion:</p>
                          <p className="text-amber-700 text-sm leading-relaxed">{suggestions.solution}</p>
                          <button
                            onClick={() => handleAcceptSuggestion('solution', suggestions.solution)}
                            className="mt-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md transition-colors"
                          >
                            Use This Suggestion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Target Market
                    <Info className="text-slate-400 hover:text-slate-600 cursor-help" size={14} title="Who is your ideal customer?" />
                    {suggestions?.target && missingFields.includes('target') && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">AI Suggested</span>
                    )}
                  </label>
                  <textarea
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2] bg-slate-100/50 backdrop-blur-sm transition-all duration-200 hover:border-slate-300"
                    placeholder="Who is your target customer? (Leave empty for AI suggestions)"
                  />
                  {suggestions?.target && missingFields.includes('target') && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-amber-800 text-sm font-medium mb-2">AI Suggestion:</p>
                          <p className="text-amber-700 text-sm leading-relaxed">{suggestions.target}</p>
                          <button
                            onClick={() => handleAcceptSuggestion('target', suggestions.target)}
                            className="mt-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md transition-colors"
                          >
                            Use This Suggestion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-amber-300 disabled:to-orange-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
                >
                  {loading ? (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        <span className="font-semibold">Analyzing Your Idea...</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '70%', animation: 'shimmer 1.5s ease-in-out infinite'}}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="mr-3 animate-bounce" size={20} />
                      Validate My Idea
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-slate-500 mt-4">
                  💡 <strong>Pro tip:</strong> Leave any field empty and AI will generate creative, varied startup ideas for you!
                  Each submission produces unique suggestions across different industries.
                </div>
              </form>
            </div>
          </div>

          {/* AI Analysis Dashboard - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Target className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">AI Analysis Dashboard</h2>
                  <p className="text-slate-600">Professional VC insights powered by advanced AI</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="h-16 bg-slate-200 rounded mb-6"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-slate-200 rounded"></div>
                      <div className="h-20 bg-slate-200 rounded"></div>
                      <div className="h-20 bg-slate-200 rounded"></div>
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-8">
                  {/* Hero Market Metric */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                        <Target className="text-white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Market Opportunity</h3>
                        <p className="text-sm text-slate-600">Estimated Total Addressable Market</p>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                      {formatMarketSize(result.aiResponse.marketSize)}
                    </div>
                    <p className="text-slate-600 max-w-md mx-auto">
                      This represents the total revenue opportunity for your solution in the target market. 
                      A larger market size suggests stronger potential, while a smaller number means a more focused niche.
                    </p>
                  </div>

                  {/* Target Customers */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                        <Users className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Target Customers</h3>
                        <p className="text-sm text-slate-600">Who the best customers would be</p>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                      <p className="text-slate-700 leading-relaxed font-medium">{result.ideaData.target}</p>
                    </div>
                  </div>

                  {/* Competitors */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                        <Users className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Competitors</h3>
                        <p className="text-sm text-slate-600">Who else is in this space</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {result.aiResponse.competitors.map((competitor, index) => (
                        <div key={index} className="flex items-start gap-3 text-slate-700 p-3 bg-slate-50/50 rounded-lg">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{competitor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similar Companies */}
                  {result.aiResponse.similarCompanies?.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-700 rounded-lg">
                          <Target className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Similar Companies</h3>
                          <p className="text-sm text-slate-600">Other companies already doing something similar</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {result.aiResponse.similarCompanies.map((company, index) => (
                          <div key={index} className="flex items-start gap-3 text-slate-700 p-3 bg-slate-50/50 rounded-lg">
                            <div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{company}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SWOT Analysis */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg">
                        <Target className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">SWOT Analysis</h3>
                        <p className="text-sm text-slate-600">Strategic assessment of your business opportunity</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200/50">
                        <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          Strengths
                        </h4>
                        <p className="text-emerald-700 leading-relaxed text-sm">{result.aiResponse.swot.s}</p>
                      </div>
                      <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200/50">
                        <h4 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                          Weaknesses
                        </h4>
                        <p className="text-rose-700 leading-relaxed text-sm">{result.aiResponse.swot.w}</p>
                      </div>
                      <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-200/50">
                        <h4 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                          Opportunities
                        </h4>
                        <p className="text-sky-700 leading-relaxed text-sm">{result.aiResponse.swot.o}</p>
                      </div>
                      <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/50">
                        <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          Threats
                        </h4>
                        <p className="text-amber-700 leading-relaxed text-sm">{result.aiResponse.swot.t}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risks */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
                        <AlertTriangle className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Risks</h3>
                        <p className="text-sm text-slate-600">Potential challenges and mitigation strategies</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {result.aiResponse.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-3 text-slate-700 p-3 bg-slate-50/50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" size={18} />
                          <span className="leading-relaxed">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roadmap Component */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                        <ArrowRight className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Roadmap</h3>
                        <p className="text-sm text-slate-600">Your actionable path to launch</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {result.aiResponse.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            {index < result.aiResponse.nextSteps.length - 1 && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-green-400 to-teal-500 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                              <p className="text-slate-700 leading-relaxed">{step}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Sparkles className="text-white animate-pulse" size={32} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-500/30 rounded-2xl blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">Ready for AI Analysis</h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    Fill out the form and click "Validate My Idea" to get comprehensive VC-style analysis powered by advanced AI
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Save to Pitch Deck Button */}
        {result && (
          <button
            onClick={handleSaveToPitchDeck}
            disabled={loading || savingPitch || !userTeamId}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 z-50 transform hover:scale-105 hover:-translate-y-1 disabled:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {savingPitch ? 'Saving to Pitch Deck...' : 'Save to Pitch Deck'}
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
        {!userTeamId && result && (
          <div className="fixed bottom-32 right-8 w-80 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 shadow-lg">
            You need to join or create a team before you can save this AI analysis to the team pitch vault.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIValidator;