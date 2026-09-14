import React, { useState } from 'react'
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, ShieldAlert, ListChecks, HelpCircle, Copy, Check } from 'lucide-react'
import { StoredDocument } from '../../types/legal'
import { toggleChecklistItem, ensureDocumentActionPlan } from '../../lib/storage'

interface ActionPlanViewProps {
  doc: StoredDocument
  onDocUpdated: (updatedDoc: StoredDocument) => void
  onNavigateToClause?: (clauseId: string) => void
  onNavigateToBriefing?: () => void
}

export function ActionPlanView({
  doc,
  onDocUpdated,
  onNavigateToBriefing,
}: ActionPlanViewProps) {
  const [filterPhase, setFilterPhase] = useState<'All' | 'Pre-Signing' | 'Execution' | 'Post-Signing'>('All')
  const [copiedNotice, setCopiedNotice] = useState(false)

  const activeDoc = ensureDocumentActionPlan(doc)
  const analysis = activeDoc.analysis
  const checklists = analysis?.actionChecklist || []
  const inconsistencies = analysis?.inconsistencies || []
  const options = analysis?.optionsAndNextSteps || []

  const filteredChecklists = filterPhase === 'All'
    ? checklists
    : checklists.filter(item => item.phase === filterPhase)

  const completedCount = checklists.filter(c => c.completed).length
  const completionPercentage = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0

  function handleToggle(id: string) {
    const updated = toggleChecklistItem(doc.id, id)
    if (updated) onDocUpdated(updated)
  }

  function handleCopyAll() {
    const text = `CLARILEGAL ACTION PLAN: ${doc.name}\n\n` +
      `CHECKLIST ITEMS:\n` +
      checklists.map(c => `[${c.completed ? 'X' : ' '}] (${c.phase} - ${c.priority} Priority) ${c.task}`).join('\n') +
      `\n\nOPTIONS & NEXT STEPS:\n` +
      options.map(o => `• ${o.option} (${o.effort} Effort): ${o.impact}`).join('\n')

    navigator.clipboard.writeText(text)
    setCopiedNotice(true)
    setTimeout(() => setCopiedNotice(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-2" role="region" aria-label="Action Plan and Legal Checklists">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
                Actionable Next Steps
              </span>
              <span className="text-xs text-slate-400">Targeting {doc.name}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">Contract Execution & Compliance Action Plan</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Grounded, step-by-step guidance to help you navigate contract options, mitigate asymmetric liabilities, and complete pre-signing requirements.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              aria-label="Copy action plan to clipboard"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copiedNotice ? 'Copied!' : 'Copy Plan'}</span>
            </button>
            {onNavigateToBriefing && (
              <button
                onClick={onNavigateToBriefing}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="View attorney briefing packet"
              >
                <span>Attorney Packet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Execution Readiness:</span>
            <div className="w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
                role="progressbar"
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Checklist completion percentage"
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{completionPercentage}%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {completedCount} of {checklists.length} action items marked complete
          </p>
        </div>
      </header>

      {/* Inconsistencies & Asymmetric Obligations Alert */}
      {inconsistencies.length > 0 && (
        <section aria-labelledby="inconsistencies-heading" className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-slate-900">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="inconsistencies-heading" className="text-sm font-bold text-amber-950 flex items-center gap-2">
                Flagged Inconsistencies & Asymmetric Liabilities
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 font-semibold">
                  {inconsistencies.length} Identified
                </span>
              </h2>
              <p className="text-xs text-amber-900/80 mt-1">
                The automated audit identified covenants where rights and risks are unbalanced between the signing parties:
              </p>
              <ul className="mt-2.5 space-y-2">
                {inconsistencies.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-950 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-amber-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Options & Next Steps (Problem Statement Core Requirement) */}
      <section aria-labelledby="options-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="options-heading" className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            Strategic Options & Potential Next Steps
          </h2>
          <span className="text-xs text-slate-500">Tailored to your {doc.analysis?.type || 'Contract'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {options.map((opt, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    opt.effort === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    opt.effort === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {opt.effort} Effort
                  </span>
                  {opt.recommendation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {opt.recommendation}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{opt.option}</h3>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{opt.impact}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Checklists & Milestone Section */}
      <section aria-labelledby="checklist-heading" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 id="checklist-heading" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Actionable Checklists & Verification Items
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items to confirm and negotiate before executing this agreement.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl" role="tablist" aria-label="Checklist Phase Filter">
            {(['All', 'Pre-Signing', 'Execution', 'Post-Signing'] as const).map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={filterPhase === tab}
                onClick={() => setFilterPhase(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  filterPhase === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist items list */}
        <div className="space-y-2.5" role="list">
          {filteredChecklists.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No items found for this phase.</p>
          ) : (
            filteredChecklists.map(item => (
              <div
                key={item.id}
                role="listitem"
                onClick={() => handleToggle(item.id)}
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  item.completed
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                    : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/80 text-slate-900'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.completed}
                  aria-label={`Mark task as ${item.completed ? 'incomplete' : 'complete'}: ${item.task}`}
                  className="mt-0.5 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                      item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">{item.phase}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                    {item.task}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Ethical & Legal Notice Footer */}
      <footer className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center" role="contentinfo">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>
            <strong>Legal Assistance Notice:</strong> ClariLegal provides automated document navigation and informational assistance. It does not replace independent legal advice from a licensed attorney.
          </span>
        </p>
      </footer>
    </div>
  )
}
