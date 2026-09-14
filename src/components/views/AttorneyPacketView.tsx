import React, { useState } from 'react'
import { FileText, Download, Copy, Check, Printer, Shield, Scale, HelpCircle, ArrowLeft } from 'lucide-react'
import { StoredDocument } from '../../types/legal'
import { generateAttorneyBriefing } from '../../lib/storage'
import { MarkdownResponse } from '../MarkdownResponse'

interface AttorneyPacketViewProps {
  doc: StoredDocument
  onBack: () => void
}

export function AttorneyPacketView({ doc, onBack }: AttorneyPacketViewProps) {
  const [copied, setCopied] = useState(false)
  const briefingMarkdown = generateAttorneyBriefing(doc)

  function handleCopy() {
    navigator.clipboard.writeText(briefingMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function handleDownloadMarkdown() {
    const element = document.createElement('a')
    const file = new Blob([briefingMarkdown], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${doc.name.replace(/\.[^/.]+$/, '')}_Attorney_Consultation_Briefing.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2" role="region" aria-label="Attorney Consultation Briefing Packet">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          aria-label="Back to document analysis"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Analysis</span>
        </button>

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

      {/* Printable Briefing Document Container */}
      <article className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <header className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <Scale className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700">Attorney Consultation Prep</span>
                <h1 className="text-xl font-black text-slate-900">Legal Counsel Briefing Packet</h1>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {doc.uploadDate || new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Document</span>
              <span className="font-bold text-slate-800 truncate block">{doc.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Classification</span>
              <span className="font-bold text-slate-800">{doc.analysis?.type || 'Contract'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Audited Risk</span>
              <span className={`font-black ${
                doc.overallRisk === 'High' ? 'text-rose-600' :
                doc.overallRisk === 'Medium' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>{doc.overallRisk}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Effective Term</span>
              <span className="font-bold text-slate-800">{doc.analysis?.duration || 'Standard'}</span>
            </div>
          </div>
        </header>

        {/* Ethical Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
          <p className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Ethical Purpose:</strong> This briefing is prepared by an AI document intelligence assistant to organize contract facts, extract high-risk quotes, and structure high-impact questions for your licensed attorney. It provides preparatory clarity to cut down billable hours and does not constitute formal legal representation.
            </span>
          </p>
        </div>

        {/* Rendered Markdown Packet Body */}
        <div className="prose-legal text-xs leading-relaxed text-slate-800">
          <MarkdownResponse content={briefingMarkdown} />
        </div>
      </article>
    </div>
  )
}
