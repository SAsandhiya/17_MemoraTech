import { useState } from 'react';
import { api, CATEGORIES } from '../api';
import { Tooltip } from './Tooltip';
import { HiOutlineTrash, HiPlus, HiStar, HiOutlineStar, HiChevronDown, HiChevronRight } from 'react-icons/hi';

export function MemoryTimeline({ decisions, onDecisionDeleted, onTogglePin, onUpdateCategory, onClearAll }) {
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(null);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeleting(id);
    await onDecisionDeleted(id);
    setDeleting(null);
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL decisions? This cannot be undone.')) return;
    setClearing(true);
    try {
      await api.clearAllDecisions();
      onClearAll();
    } catch (err) {
      alert('Failed to clear: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handlePin = (id, e) => {
    e.stopPropagation();
    onTogglePin(id);
  };

  const handleCategoryChange = (id, category, e) => {
    e.stopPropagation();
    onUpdateCategory(id, category);
    setShowCategoryMenu(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
          <span className="text-sm font-semibold text-slate-900">Memories</span>
        </div>
        {decisions.length > 0 && (
          <Tooltip text="Clear All" position="left">
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {decisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-3">
              <HiPlus className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-600 text-sm text-center">No memories found</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {decisions.map((decision) => (
              <div
                key={decision._id}
                className={`bg-white border rounded-lg overflow-hidden transition-colors fade-in ${decision.pinned ? 'border-sky-200 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <button
                  onClick={() => setExpandedId(expandedId === decision._id ? null : decision._id)}
                  className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {/* Category indicator */}
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: CATEGORIES[decision.category || 'general']?.color || '#64748B' }}
                    ></span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {decision.pinned && (
                          <HiStar className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        <p className="font-medium text-slate-900 text-sm truncate">{decision.summary}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">
                        {decision.goal}
                      </p>
                    </div>

                    <span className="text-slate-400 flex-shrink-0">
                      {expandedId === decision._id ? <HiChevronDown className="w-3.5 h-3.5" /> : <HiChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                {expandedId === decision._id && (
                  <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-3 text-xs">
                    <div>
                      <p className="font-medium text-sky-700 mb-1 text-[11px] uppercase tracking-wider">Reasoning</p>
                      <p className="text-slate-700 leading-relaxed">{decision.reasoning}</p>
                    </div>

                    {decision.constraints && decision.constraints.length > 0 && (
                      <div>
                        <p className="font-medium text-sky-700 mb-1 text-[11px] uppercase tracking-wider">Constraints</p>
                        <ul className="text-slate-700 space-y-0.5">
                          {decision.constraints.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-sky-600 mt-0.5">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {decision.tags && decision.tags.length > 0 && (
                      <div>
                        <p className="font-medium text-sky-700 mb-1 text-[11px] uppercase tracking-wider">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {decision.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-slate-500">
                        {new Date(decision.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex items-center gap-1">
                        {/* Category menu */}
                        <div className="relative">
                          <Tooltip text="Change Category" position="top">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCategoryMenu(showCategoryMenu === decision._id ? null : decision._id);
                              }}
                              className="p-1 rounded hover:bg-slate-200 transition-colors"
                            >
                              <span
                                className="w-3 h-3 rounded-full block"
                                style={{ backgroundColor: CATEGORIES[decision.category || 'general']?.color }}
                              ></span>
                            </button>
                          </Tooltip>

                          {showCategoryMenu === decision._id && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-slate-200 rounded-lg p-1 shadow-lg z-10">
                              {Object.entries(CATEGORIES).map(([key, { color, label }]) => (
                                <Tooltip key={key} text={label} position="left">
                                  <button
                                    onClick={(e) => handleCategoryChange(decision._id, key, e)}
                                    className="w-full p-1.5 rounded hover:bg-slate-100 transition-colors flex items-center justify-center"
                                  >
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                  </button>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pin button */}
                        <Tooltip text={decision.pinned ? 'Unpin' : 'Pin'} position="top">
                          <button
                            onClick={(e) => handlePin(decision._id, e)}
                            className={`p-1 rounded transition-colors ${decision.pinned
                              ? 'text-sky-600 bg-sky-100'
                              : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                              }`}
                          >
                            {decision.pinned ? <HiStar className="w-4 h-4" /> : <HiOutlineStar className="w-4 h-4" />}
                          </button>
                        </Tooltip>

                        {/* Delete button */}
                        <Tooltip text="Delete" position="top">
                          <button
                            onClick={(e) => handleDelete(decision._id, e)}
                            disabled={deleting === decision._id}
                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
