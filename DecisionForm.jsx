import { useState } from 'react';
import { api, CATEGORIES, TEMPLATES } from '../api';
import { Tooltip } from './Tooltip';
import { HiBriefcase, HiCurrencyDollar, HiCode, HiHeart, HiBookOpen, HiTemplate, HiCheck } from 'react-icons/hi';

// Template icons mapping
const templateIcons = {
  briefcase: <HiBriefcase className="w-4 h-4" />,
  currency: <HiCurrencyDollar className="w-4 h-4" />,
  code: <HiCode className="w-4 h-4" />,
  heart: <HiHeart className="w-4 h-4" />,
  book: <HiBookOpen className="w-4 h-4" />
};

export function DecisionForm({ onDecisionCreated }) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await api.createDecision(input, category);
      setInput('');
      setCategory('general');
      onDecisionCreated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (prompt) => {
    setInput(prompt);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with template button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
          <h3 className="text-sm font-semibold text-slate-900">Log Decision</h3>
        </div>
        <Tooltip text="Templates" position="left">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-1.5 rounded-lg transition-colors ${showTemplates ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'}`}
          >
            <HiTemplate className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Templates dropdown */}
      {showTemplates && (
        <div className="bg-white border border-slate-200 rounded-xl p-2 space-y-1 shadow-md">
          {TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(t.prompt)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-sky-50 transition-colors text-slate-700 hover:text-sky-600"
            >
              {templateIcons[t.icon]}
              <span className="text-sm text-slate-700">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Category selector */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(CATEGORIES).map(([key, { color, label }]) => (
            <Tooltip key={key} text={label} position="top">
              <button
                type="button"
                onClick={() => setCategory(key)}
                className={`p-2 rounded-lg transition-all ${category === key
                  ? 'ring-2 ring-sky-600 bg-sky-50'
                  : 'bg-slate-100 hover:bg-slate-200'
                  }`}
              >
                <span
                  className="w-3 h-3 rounded-full block"
                  style={{ backgroundColor: color }}
                ></span>
              </button>
            </Tooltip>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your decision and reasoning..."
          className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 resize-none outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors"
          disabled={loading}
        />

        {error && (
          <div className="text-red-700 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${loading || !input.trim()
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
            : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.98] shadow-md'
            }`}
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <HiCheck className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
