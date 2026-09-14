import React, { useState } from 'react'
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Shield,
  Scale,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Users,
  Quote,
  Flame,
  LayoutDashboard,
  Code
} from 'lucide-react'
import { StoredDocument } from '../../types/legal'
import { generateAttorneyBriefing, ensureDocumentActionPlan } from '../../lib/storage'
import { MarkdownResponse } from '../MarkdownResponse'

interface AttorneyPacketViewProps {
  doc: StoredDocument
  onBack: () => void
}

export function AttorneyPacketView({ doc, onBack }: AttorneyPacketViewProps) {
  const [copied, setCopied] = useState(false)
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'dossier' | 'markdown'>('dossier')

  const activeDoc = ensureDocumentActionPlan(doc)
  const briefingMarkdown = generateAttorneyBriefing(activeDoc)

  const analysis = activeDoc.analysis
  const highRiskClauses = (analysis?.clauses || []).filter(c => c.risk === 'High' || c.risk === 'Medium')
  const inconsistencies = analysis?.inconsistencies || []
  const questions = (analysis?.clauses || []).flatMap(c => c.questionsToAsk || [])
  const options = analysis?.optionsAndNextSteps || []

  function handleCopy() {
    navigator.clipboard.writeText(briefingMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function handleCopySingleQuestion(q: string, idx: number) {
    navigator.clipboard.writeText(q)
    setCopiedQuestionIdx(idx)
    setTimeout(() => setCopiedQuestionIdx(null), 2000)
  }

  function handleDownloadMarkdown() {
    const element = document.createElement('a')
    const file = new Blob([briefingMarkdown], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${activeDoc.name.replace(/\.[^/.]+$/, '')}_Attorney_Consultation_Briefing.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2" role="region" aria-label="Attorney Consultation Briefing Packet">
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          aria-label="Back to document analysis"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Analysis</span>
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('dossier')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'dossier'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Executive Dossier</span>
          </button>
          <button
            onClick={() => setViewMode('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'markdown'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Markdown Source</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Copy briefing text to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Download briefing as Markdown file"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download .MD</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Print briefing packet"
          >
            <Printer className="w-4 h-4" />
            <span>Print Packet</span>
          </button>
        </div>
      </div>

      {/* Main Printable Dossier Container */}
      <article className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header & Metadata Strip */}
        <header className="border-b border-slate-200 pb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
                <Scale className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Attorney Consultation Prep
                  </span>
                  <span className="text-xs text-slate-400">Privileged Preparation Docket</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Legal Counsel Briefing Packet
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                {activeDoc.uploadDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">ClariLegal AI Workspace</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Target Document</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5" title={activeDoc.name}>
                {activeDoc.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Classification</span>
              <span className="font-bold text-slate-800 block mt-0.5">{analysis?.type || 'Contract Agreement'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Audited Risk</span>
              <span className={`font-black inline-flex items-center gap-1 mt-0.5 ${
                activeDoc.overallRisk === 'High' ? 'text-rose-600' :
                activeDoc.overallRisk === 'Medium' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>
                {activeDoc.overallRisk === 'High' && <Flame className="w-3.5 h-3.5" />}
                {activeDoc.overallRisk} Risk Profile
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Effective Term</span>
              <span className="font-bold text-slate-800 block mt-0.5">{analysis?.duration || 'Standard Term'}</span>
            </div>
          </div>
        </header>

        {/* Ethical Purpose & Safe AI Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed shadow-2xs">
          <p className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Ethical Notice & Legal Purpose:</strong> This briefing is compiled by an AI document intelligence system to organize factual findings, extract high-risk covenants, and formulate prioritized questions for your consultation with licensed legal counsel. It is designed to maximize consultation efficiency and minimize billable hours, and does not constitute formal legal representation or legal advice.
            </span>
          </p>
        </div>

        {/* VIEW MODE 1: EXECUTIVE DOSSIER (RICH STRUCTURED UI) */}
        {viewMode === 'dossier' ? (
          <div className="space-y-8">
            {/* Section 1: Executive Summary */}
            <section className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-extrabold text-slate-900">Executive Summary</h2>
              </div>

              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {analysis?.summary || 'No automated summary available.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold">Parties:</span>
                    <span className="text-slate-600">{(analysis?.parties || ['Party A', 'Party B']).join(' & ')}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
                    <span className="font-bold">Effective:</span>
                    <span className="text-slate-600">{analysis?.effective || 'Upon execution'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Critical & High-Risk Provisions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Critical & High-Risk Provisions Requiring Counsel Review
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {highRiskClauses.length} Flagged {highRiskClauses.length === 1 ? 'Clause' : 'Clauses'}
                </span>
              </div>

              <div className="space-y-4">
                {highRiskClauses.map((clause, idx) => (
                  <div
                    key={clause.id || idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden"
                  >
                    {/* Clause Header Strip */}
                    <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          Section {clause.section}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{clause.title}</h3>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        clause.risk === 'High'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {clause.risk} Risk
                      </span>
                    </div>

                    <div className="p-5 space-y-3.5 text-xs">
                      {/* Contract Excerpt */}
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          <Quote className="w-3 h-3 text-slate-400" />
                          <span>Exact Contract Excerpt</span>
                        </div>
                        <blockquote className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-serif text-xs leading-relaxed border-l-4 border-rose-500 shadow-inner">
                          "{clause.quote}"
                        </blockquote>
                      </div>

                      {/* Plain English & Why Counsel Should Review Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-3.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                            Plain-English Translation
                          </span>
                          <p className="text-indigo-950 leading-relaxed font-normal">
                            {clause.plainEnglish}
                          </p>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                            Why Counsel Should Review
                          </span>
                          <p className="text-amber-950 leading-relaxed font-normal">
                            {clause.whyItMatters}
                          </p>
                        </div>
                      </div>

                      {/* Parties Impacted */}
                      {clause.whoIsAffected && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Parties Impacted:</span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                            <strong>Party A:</strong> {clause.whoIsAffected.partyA}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                            <strong>Party B:</strong> {clause.whoIsAffected.partyB}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Potential Inconsistencies & Asymmetric Obligations */}
            {inconsistencies.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Potential Inconsistencies & Asymmetric Obligations
                  </h2>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-2.5">
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Automated structural analysis flagged the following asymmetries in party remedies, cure periods, or notice requirements:
                  </p>
                  <ul className="space-y-2 mt-2">
                    {inconsistencies.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-950 bg-white/80 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Section 4: Prioritized Questions to Ask Your Attorney */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Prioritized Questions to Ask Your Attorney
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Click to copy any question into your meeting notes
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 transition-all text-xs text-slate-900 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-semibold leading-relaxed">{q}</span>
                    </div>

                    <button
                      onClick={() => handleCopySingleQuestion(q, idx)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all print:hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                      title="Copy question to clipboard"
                      aria-label={`Copy question ${idx + 1}`}
                    >
                      {copiedQuestionIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Recommended Next Steps & Options */}
            {options.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    5
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Recommended Next Steps & Options
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {options.map((opt, i) => (
                    <div key={i} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            opt.effort === 'Low' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            opt.effort === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            {opt.effort} Effort
                          </span>
                          {opt.recommendation && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {opt.recommendation}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{opt.option}</h4>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{opt.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* VIEW MODE 2: RAW MARKDOWN SOURCE PREVIEW */
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
              {briefingMarkdown}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
