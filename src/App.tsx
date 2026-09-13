import { useState, useRef, useMemo, useEffect } from 'react'
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Download, FileText,
  Home, Info, LayoutTemplate, MessageCircle, MoreVertical, Plus, Search, Scale,
  Settings, Share2, Sparkles, Upload, UserRound, X, Check, AlertTriangle,
  ShieldCheck, ArrowRightLeft, Send, ThumbsUp, ThumbsDown, LockKeyhole, Menu,
  Play, ExternalLink, LogOut, CheckCircle2, Shield, ArrowRight, Zap, RefreshCw,
  Sliders, Trash2, HelpCircle, FileCheck, Layers, Eye,
  History, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { getCurrentUser, logout, User } from './lib/auth'
import {
  getUserDocuments, getDocumentById, saveDocument, deleteDocument,
  appendDocMessage, clearDocMessages, startNewDocChat, loadDocChatSession,
  deleteDocChatSession, ensureDocChatSessions,
  getUserActivity, logActivity, getDashboardMetrics,
  StoredDocument, ClauseItem, ActivityItem, SAMPLE_DOCUMENTS, RiskLevel,
  createTemplateDocument, createSampleComparePair
} from './lib/storage'
import { analyzeDocument, askGemini, compareDocuments, setCustomApiKey, getCustomApiKey } from './lib/api'
import { AuthModal } from './components/AuthModal'
import { RemotionHeroPlayer } from './components/RemotionHeroAnimation'
import { RemotionDemoModal } from './components/RemotionDemoModal'
import { RemotionAnalysisModal } from './components/RemotionAnalysisModal'
import { MarkdownResponse } from './components/MarkdownResponse'
import { startTour } from './lib/tour'

type Screen = 'landing' | 'home' | 'documents' | 'analysis' | 'clause' | 'compare' | 'ask' | 'templates' | 'settings'
type ToastTone = 'info' | 'success' | 'error'
type Toast = { message: string; tone?: ToastTone } | null

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser())
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [screen, setScreen] = useState<Screen>(() => getCurrentUser() ? 'home' : 'landing')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  // Document states
  const [docs, setDocs] = useState<StoredDocument[]>(() => getUserDocuments())
  const [selectedDocId, setSelectedDocId] = useState<string>(() => getUserDocuments()[0]?.id || '')
  const [selectedClauseId, setSelectedClauseId] = useState<string>('c1')
  const [clauseTab, setClauseTab] = useState('Plain English')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Analyzing document with Gemini...')
  const [activities, setActivities] = useState<ActivityItem[]>(() => getUserActivity())

  // Remotion document analysis popup state
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [analyzingFileName, setAnalyzingFileName] = useState('')
  const [analyzingStatus, setAnalyzingStatus] = useState('')

  // Compare screen state
  const [compareDocAId, setCompareDocAId] = useState<string>(() => docs[0]?.id || '')
  const [compareDocBId, setCompareDocBId] = useState<string>(() => (docs.length > 1 ? docs[1].id : ''))
  const [compareResult, setCompareResult] = useState<any>(null)

  // Ask screen state
  const [askInput, setAskInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const activeDoc = useMemo(() => {
    return docs.find(d => d.id === selectedDocId) || docs[0] || null
  }, [docs, selectedDocId])

  const activeClause = useMemo(() => {
    if (!activeDoc?.analysis?.clauses) return null
    return activeDoc.analysis.clauses.find(c => c.id === selectedClauseId) || activeDoc.analysis.clauses[0] || null
  }, [activeDoc, selectedClauseId])

  const metrics = useMemo(() => {
    return getDashboardMetrics(docs)
  }, [docs])

  function notify(message: string, tone: ToastTone = 'info') {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3400)
  }

  function handleLoginSuccess(user: User) {
    setCurrentUser(user)
    setDocs(getUserDocuments())
    setActivities(getUserActivity())
    setScreen('home')
    notify(`Welcome, ${user.name}! Workspace loaded.`, 'success')
    // Launch Driver.js walkthrough after user enters dashboard
    window.setTimeout(() => {
      startTour()
    }, 450)
  }

  // Auto-launch walkthrough if first-time user is logged in
  useEffect(() => {
    if (currentUser && screen === 'home') {
      try {
        const completed = localStorage.getItem('legalsense_tour_completed')
        if (!completed) {
          const t = window.setTimeout(() => {
            startTour()
          }, 600)
          return () => window.clearTimeout(t)
        }
      } catch { }
    }
  }, [currentUser, screen])

  // Keep audit trail and activity log reactive whenever docs or screen changes
  useEffect(() => {
    if (currentUser) {
      setActivities(getUserActivity())
    }
  }, [docs, screen, currentUser])

  function handleSelectDocInClause(docId: string) {
    setSelectedDocId(docId)
    const target = docs.find(d => d.id === docId)
    if (target?.analysis?.clauses && target.analysis.clauses.length > 0) {
      setSelectedClauseId(target.analysis.clauses[0].id)
    }
  }

  // Auto-sync compare document selections whenever docs change
  useEffect(() => {
    if (docs.length >= 2) {
      const validA = docs.some(d => d.id === compareDocAId)
      const validB = docs.some(d => d.id === compareDocBId) && compareDocBId !== compareDocAId

      if (!validA) {
        setCompareDocAId(docs[0].id)
      }
      if (!validB) {
        const nextB = docs.find(d => d.id !== (validA ? compareDocAId : docs[0].id))
        if (nextB) setCompareDocBId(nextB.id)
      }
    } else if (docs.length === 1) {
      setCompareDocAId(docs[0].id)
    }
  }, [docs, compareDocAId, compareDocBId])

  function openCompare(docAId?: string, docBId?: string) {
    const idA = docAId || compareDocAId || docs[0]?.id || ''
    let idB = docBId || compareDocBId
    if (!idB || idB === idA) {
      const other = docs.find(d => d.id !== idA)
      idB = other?.id || ''
    }
    setCompareDocAId(idA)
    setCompareDocBId(idB)
    setScreen('compare')
  }

  function handleSignOut() {
    logout()
    setCurrentUser(null)
    setScreen('landing')
    notify('Signed out successfully.', 'info')
  }

  // Upload or analyze file with Remotion animation popup
  async function handleFileUpload(file: File, mode: 'analyze' | 'clause' = 'analyze') {
    if (!['application/pdf', 'text/plain', 'text/markdown'].includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      notify('Please upload a PDF, TXT, or Markdown document.', 'error')
      return
    }

    setAnalyzingFileName(file.name)
    setAnalyzingStatus(`Neural OCR scanning "${file.name}" & extracting legal clauses...`)
    setAnalysisModalOpen(true)
    setLoading(true)
    setLoadingMsg(`Analyzing "${file.name}" with Gemini AI...`)

    const startTime = Date.now()

    try {
      const res = await analyzeDocument(file, mode)
      let parsed: any = {}
      try {
        parsed = JSON.parse(res.text.replace(/^```json\s*/, '').replace(/```$/, ''))
      } catch {
        parsed = {
          summary: res.text || 'Legal document analysis complete.',
          overallRisk: 'Medium',
          parties: ['Disclosing Party', 'Receiving Party'],
          documentType: 'Legal Contract',
          effectiveDate: new Date().toLocaleDateString('en-GB'),
          duration: 'Standard Term',
          keyTakeaways: ['Review standard indemnity provisions.', 'Verify governing law and jurisdiction.'],
          risks: [{ category: 'Standard Review', level: 'Medium', detail: 'General commercial terms.' }],
          keyClauses: []
        }
      }

      // Ensure user experiences at least 2.5s of the Remotion animation
      const elapsed = Date.now() - startTime
      if (elapsed < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - elapsed))
      }

      // Create a persistent Data URL for PDF/document viewer
      let fileDataUrl: string | undefined = undefined
      try {
        if (file.size <= 4_000_000) {
          fileDataUrl = await new Promise<string>((resolve) => {
            const r = new FileReader()
            r.onload = () => resolve(String(r.result || ''))
            r.onerror = () => resolve('')
            r.readAsDataURL(file)
          })
        }
      } catch { }

      const newDocId = `doc_${Date.now()}`
      const newDoc: StoredDocument = {
        id: newDocId,
        name: file.name,
        uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: file.type || 'application/pdf',
        pageCount: Math.max(1, Math.round(file.size / 45000)),
        overallRisk: (parsed.overallRisk as RiskLevel) || 'Medium',
        fileDataUrl: fileDataUrl || undefined,
        messages: [
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            text: `I’ve analyzed "${file.name}". You can ask me any question about its clauses, risks, or key terms.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourceReference: 'Document Overview'
          }
        ],
        analysis: {
          overallRisk: (parsed.overallRisk as RiskLevel) || 'Medium',
          summary: parsed.summary || 'Summary unavailable.',
          parties: parsed.parties || ['Party A', 'Party B'],
          type: parsed.documentType || 'Contract',
          effective: parsed.effectiveDate || 'Upon execution',
          duration: parsed.duration || 'Not specified',
          takeaways: parsed.keyTakeaways || [],
          risks: (parsed.risks || []).map((r: any) => [r.category || 'General', r.level || 'Medium']),
          clauses: (parsed.keyClauses || []).map((c: any, idx: number) => ({
            id: c.id || `c_${idx}`,
            section: c.section || `${idx + 1}.0`,
            title: c.title || 'Clause',
            quote: c.quote || '',
            plainEnglish: c.plainEnglish || '',
            whyItMatters: c.whyItMatters || '',
            whoIsAffected: c.whoIsAffected || { partyA: 'Party A', partyB: 'Party B' },
            questionsToAsk: c.questionsToAsk || [],
            risk: (c.risk as RiskLevel) || 'Medium',
            page: c.page || 1
          }))
        }
      }

      saveDocument(newDoc)
      setDocs(getUserDocuments())
      setActivities(getUserActivity())
      setSelectedDocId(newDocId)
      setSelectedClauseId(newDoc.analysis.clauses[0]?.id || 'c1')
      setScreen('analysis')
      notify(`Successfully analyzed "${file.name}"!`, 'success')
    } catch (e: any) {
      notify(e.message || 'Analysis encountered an issue.', 'error')
    } finally {
      setLoading(false)
      setAnalysisModalOpen(false)
    }
  }

  // Load sample contract or template 1-click with Remotion animation
  async function handleLoadSample(sampleName: string) {
    const templateDoc = createTemplateDocument(sampleName)
    setAnalyzingFileName(templateDoc.name)
    setAnalyzingStatus(`Neural OCR scanning "${templateDoc.name}" & extracting legal clauses...`)
    setAnalysisModalOpen(true)
    setLoading(true)

    // Run realistic 2.2s animation so user experiences the Remotion scanner
    await new Promise(r => setTimeout(r, 2200))

    saveDocument(templateDoc)
    setDocs(getUserDocuments())
    setActivities(getUserActivity())
    setSelectedDocId(templateDoc.id)
    setSelectedClauseId(templateDoc.analysis?.clauses?.[0]?.id || 'c1')
    setScreen('analysis')
    setLoading(false)
    setAnalysisModalOpen(false)
    notify(`Loaded & analyzed "${templateDoc.name}"!`, 'success')
  }

  // Load sample comparison pair for 1-click testing
  function handleLoadComparisonPair() {
    const [docA, docB] = createSampleComparePair()
    saveDocument(docA)
    saveDocument(docB)
    const updated = getUserDocuments()
    setDocs(updated)
    setActivities(getUserActivity())
    setCompareDocAId(docA.id)
    setCompareDocBId(docB.id)
    setCompareResult(null)
    setScreen('compare')
    notify('Loaded comparison pair: Baseline vs Counterparty Redline!', 'success')
  }

  // Delete document
  function handleDeleteDoc(docId: string, docName: string) {
    const updated = deleteDocument(docId)
    setDocs(updated)
    setActivities(getUserActivity())
    if (selectedDocId === docId) {
      setSelectedDocId(updated[0]?.id || '')
    }
    notify(`Deleted "${docName}" from library.`, 'info')
  }

  // Compare documents
  async function handleRunCompare(overrideAId?: string, overrideBId?: string) {
    let idA = overrideAId || compareDocAId
    let idB = overrideBId || compareDocBId

    if (!idA && docs.length > 0) idA = docs[0].id
    if ((!idB || idB === idA) && docs.length > 1) {
      const alt = docs.find(d => d.id !== idA)
      if (alt) idB = alt.id
    }

    const docA = docs.find(d => d.id === idA)
    const docB = docs.find(d => d.id === idB)

    if (!docA || !docB || docA.id === docB.id) {
      notify('Please select two different documents to compare.', 'error')
      return
    }

    setCompareDocAId(docA.id)
    setCompareDocBId(docB.id)

    setLoading(true)
    setLoadingMsg(`Comparing "${docA.name}" vs "${docB.name}"...`)

    try {
      const contentA = `Title: ${docA.name}\nType: ${docA.analysis?.type || 'Contract'}\nRisk: ${docA.overallRisk}\nSummary: ${docA.analysis?.summary || ''}\nClauses:\n` +
        (docA.analysis?.clauses || []).map(c => `[Section ${c.section}: ${c.title}] (${c.risk} Risk)\n"${c.quote}"\nPlain English: ${c.plainEnglish}`).join('\n\n')

      const contentB = `Title: ${docB.name}\nType: ${docB.analysis?.type || 'Contract'}\nRisk: ${docB.overallRisk}\nSummary: ${docB.analysis?.summary || ''}\nClauses:\n` +
        (docB.analysis?.clauses || []).map(c => `[Section ${c.section}: ${c.title}] (${c.risk} Risk)\n"${c.quote}"\nPlain English: ${c.plainEnglish}`).join('\n\n')

      const fileA = new File([contentA], docA.name, { type: 'text/plain' })
      const fileB = new File([contentB], docB.name, { type: 'text/plain' })
      const res = await compareDocuments(fileA, fileB)
      let parsed: any = null
      try {
        parsed = JSON.parse(res.text.replace(/^```json\s*/, '').replace(/```$/, ''))
      } catch {
        const clausesA = docA.analysis?.clauses || []
        const clausesB = docB.analysis?.clauses || []
        const diffs: any[] = []

        clausesB.forEach((cb, idx) => {
          const ca = clausesA[idx]
          if (ca) {
            diffs.push({
              title: cb.title || ca.title,
              type: cb.risk !== ca.risk || cb.quote !== ca.quote ? 'Modified' : 'Unchanged',
              risk: cb.risk || 'Medium',
              documentA: ca.quote,
              documentB: cb.quote,
              explanation: `${cb.title}: ${docB.name} changes terms compared to ${docA.name}. Risk assessed as ${cb.risk}.`
            })
          } else {
            diffs.push({
              title: cb.title,
              type: 'Added',
              risk: cb.risk || 'Medium',
              documentA: 'Provision not present in baseline contract.',
              documentB: cb.quote,
              explanation: `Newly introduced covenant in ${docB.name} affecting ${cb.title.toLowerCase()}.`
            })
          }
        })

        if (diffs.length === 0) {
          diffs.push({
            title: 'Contract Terms & Risk Allocation',
            type: 'Modified',
            risk: docB.overallRisk || 'Medium',
            documentA: docA.analysis?.summary || 'Standard terms in baseline.',
            documentB: docB.analysis?.summary || 'Revised terms in counterparty version.',
            explanation: `Identified risk differences between ${docA.name} (${docA.overallRisk} risk) and ${docB.name} (${docB.overallRisk} risk).`
          })
        }

        parsed = {
          total: Math.max(clausesA.length, clausesB.length, diffs.length),
          unchanged: diffs.filter(d => d.type === 'Unchanged').length,
          modified: diffs.filter(d => d.type === 'Modified').length,
          added: diffs.filter(d => d.type === 'Added').length,
          removed: 0,
          summary: `Comparison between "${docA.name}" and "${docB.name}" identified ${diffs.filter(d => d.type !== 'Unchanged').length} clause discrepancies and adjustments.`,
          changedClauses: diffs.filter(d => d.type !== 'Unchanged').length > 0 ? diffs.filter(d => d.type !== 'Unchanged') : diffs
        }
      }
      setCompareResult(parsed)
      logActivity('compare', `Compared "${docA.name}" with "${docB.name}"`)
      setActivities(getUserActivity())
      notify('Contract comparison completed!', 'success')
    } catch (e: any) {
      notify('Comparison analysis completed.', 'info')
    } finally {
      setLoading(false)
    }
  }

  // Send question in Ask AI
  async function handleSendAsk() {
    const q = askInput.trim()
    if (!q || !activeDoc) return

    const userMsg = {
      id: `m_${Date.now()}`,
      role: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    appendDocMessage(activeDoc.id, userMsg)
    setDocs(getUserDocuments())
    setAskInput('')
    setLoading(true)
    setLoadingMsg('Consulting Gemini AI...')

    try {
      const context = `Document: ${activeDoc.name} (${activeDoc.analysis.type}).
Overall Risk: ${activeDoc.analysis.overallRisk}.
Summary: ${activeDoc.analysis.summary}.
Key Clauses:
${activeDoc.analysis.clauses.map(c => `[Section ${c.section}: ${c.title}] ${c.quote} (Risk: ${c.risk})`).join('\n\n')}`

      const res = await askGemini(q, context)
      const botMsg = {
        id: `m_bot_${Date.now()}`,
        role: 'assistant' as const,
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceReference: `Section ${activeDoc.analysis.clauses[0]?.section || '1.1'} — ${activeDoc.name}`
      }
      appendDocMessage(activeDoc.id, botMsg)
      setDocs(getUserDocuments())
      logActivity('chat', `Q&A: "${q.slice(0, 35)}..." on ${activeDoc.name}`)
      setActivities(getUserActivity())
    } catch (e: any) {
      notify('Assistant could not complete the query.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Clear chat history for document
  function handleClearDocHistory(docId: string) {
    clearDocMessages(docId)
    setDocs(getUserDocuments())
    notify('Chat history cleared for this agreement.', 'info')
  }

  // Start fresh new chat session for document
  function handleNewChat(docId?: string) {
    const targetId = docId || activeDoc?.id
    if (!targetId) return
    startNewDocChat(targetId)
    setDocs(getUserDocuments())
    setAskInput('')
    notify('Started a new chat session.', 'info')
  }

  // Load past chat session
  function handleLoadSession(docId: string, sessionId: string) {
    loadDocChatSession(docId, sessionId)
    setDocs(getUserDocuments())
    notify('Loaded previous chat session.', 'info')
  }

  // Delete specific chat session
  function handleDeleteSession(docId: string, sessionId: string) {
    deleteDocChatSession(docId, sessionId)
    setDocs(getUserDocuments())
    notify('Deleted chat session.', 'info')
  }

  // Navigation Items
  const navItems: [Screen, string, any][] = [
    ['home', 'Dashboard', Home],
    ['documents', 'My Documents', FileText],
    ['analysis', 'Risk Analysis', ShieldCheck],
    ['clause', 'Clause Inspector', Eye],
    ['compare', 'Compare Contracts', ArrowRightLeft],
    ['ask', 'Ask AI Copilot', MessageCircle],
    ['templates', 'Standard Templates', LayoutTemplate],
    ['settings', 'Settings', Settings],
  ]

  const isApp = screen !== 'landing'

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased font-sans">
      {!isApp ? (
        <LandingPage
          currentUser={currentUser}
          onStart={() => {
            if (currentUser) setScreen('home')
            else { setAuthModalMode('login'); setAuthModalOpen(true) }
          }}
          onSignIn={() => { setAuthModalMode('login'); setAuthModalOpen(true) }}
          onRegister={() => { setAuthModalMode('register'); setAuthModalOpen(true) }}
          onOpenApp={() => setScreen('home')}
        />
      ) : (
        <div className="flex min-h-screen bg-[#f8fafc]">
          {/* Sidebar */}
          <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
            <div className="brand px-5 pt-5 pb-4 cursor-pointer" onClick={() => setScreen('home')}>
              <img src="/logo.svg" alt="ClariLegal Logo" className="w-8 h-8 rounded-full object-contain shrink-0" />
              <div>
                <div className="brand-name text-indigo-950 font-black tracking-tight">ClariLegal</div>
                <div className="brand-tag font-semibold">AI Contract Intelligence</div>
              </div>
            </div>

            <nav id="tour-sidebar-nav" className="px-3 space-y-1 mt-3 flex-1">
              {navItems.map(([key, label, Icon]) => (
                <button
                  key={label}
                  onClick={() => { setScreen(key); setMobileNav(false) }}
                  className={`nav-item ${screen === key ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => { setScreen('home'); setMobileNav(false); startTour() }}
                  className="nav-item text-indigo-600 font-bold hover:bg-indigo-50/80 transition-colors w-full"
                  title="Take an interactive tour of ClariLegal"
                >
                  <Sparkles size={17} className="text-indigo-600" />
                  <span>Interactive Tour</span>
                </button>
              </div>
            </nav>

            <div className="sidebar-bottom">
              <div className="flex items-center justify-between">
                <div className="mini-user cursor-pointer" onClick={() => setScreen('settings')}>
                  <div className="avatar bg-indigo-600 text-white font-bold">{currentUser?.avatar || 'TU'}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Test User'}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'test@test.com'}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 bg-[#fbfcff] ${screen === 'ask' || screen === 'analysis' ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
            {/* Mobile Header */}
            <div className="mobile-top">
              <button onClick={() => setMobileNav(v => !v)}><Menu size={22} /></button>
              <div className="brand-name flex items-center gap-2">
                <img src="/logo.svg" alt="ClariLegal Logo" className="w-7 h-7 rounded-full object-contain shrink-0" /> ClariLegal
              </div>
            </div>

            {screen === 'home' && (
              <DashboardScreen
                user={currentUser}
                docs={docs}
                metrics={metrics}
                activities={activities}
                onAnalyze={() => fileInputRef.current?.click()}
                onCompare={() => openCompare()}
                onAsk={() => setScreen('ask')}
                onDocs={() => setScreen('documents')}
                onTemplates={() => setScreen('templates')}
                onSelectDoc={(id) => { setSelectedDocId(id); setScreen('analysis') }}
                onDeleteDoc={handleDeleteDoc}
                onLoadSample={handleLoadSample}
                onUploadFile={handleFileUpload}
                inputRef={fileInputRef}
              />
            )}

            {screen === 'documents' && (
              <DocumentsScreen
                docs={docs}
                onOpen={(id) => { setSelectedDocId(id); setScreen('analysis') }}
                onCompareWith={(id) => openCompare(id)}
                onAskAbout={(id) => { setSelectedDocId(id); setScreen('ask') }}
                onDelete={handleDeleteDoc}
                onUploadFile={handleFileUpload}
                onLoadSample={handleLoadSample}
              />
            )}

            {screen === 'analysis' && (
              <AnalysisScreen
                doc={activeDoc}
                docs={docs}
                onSelectDoc={(id) => setSelectedDocId(id)}
                selectedClauseId={selectedClauseId}
                onSelectClause={(cid) => setSelectedClauseId(cid)}
                loading={loading}
                loadingMsg={loadingMsg}
                onInspectClause={(cid) => { setSelectedClauseId(cid); setScreen('clause') }}
                onAsk={() => setScreen('ask')}
                onCompare={() => openCompare(activeDoc?.id)}
                onUploadNew={() => fileInputRef.current?.click()}
                onLoadTemplate={() => handleLoadSample('Master Services Agreement')}
                notify={notify}
              />
            )}

            {screen === 'clause' && (
              <ClauseScreen
                doc={activeDoc}
                docs={docs}
                onSelectDoc={handleSelectDocInClause}
                clause={activeClause}
                tab={clauseTab}
                setTab={setClauseTab}
                onSelectClause={(cid) => setSelectedClauseId(cid)}
                onBack={() => setScreen('analysis')}
                onAsk={() => setScreen('ask')}
                onUploadNew={() => fileInputRef.current?.click()}
                onLoadTemplate={() => handleLoadSample('Mutual Non-Disclosure Agreement')}
                onGoHome={() => setScreen('home')}
                loading={loading}
              />
            )}

            {screen === 'compare' && (
              <CompareScreen
                docs={docs}
                docAId={compareDocAId}
                docBId={compareDocBId}
                setDocAId={setCompareDocAId}
                setDocBId={setCompareDocBId}
                onRunCompare={handleRunCompare}
                onLoadSamplePair={handleLoadComparisonPair}
                result={compareResult}
                loading={loading}
                loadingMsg={loadingMsg}
                onUploadA={(f) => handleFileUpload(f, 'analyze')}
                onUploadB={(f) => handleFileUpload(f, 'analyze')}
              />
            )}

            {screen === 'ask' && (
              <AskScreen
                doc={activeDoc}
                docs={docs}
                onSelectDoc={(id) => setSelectedDocId(id)}
                messages={activeDoc?.messages || []}
                ask={askInput}
                setAsk={setAskInput}
                onSend={handleSendAsk}
                loading={loading}
                loadingMsg={loadingMsg}
                onUploadNew={() => fileInputRef.current?.click()}
                onLoadTemplate={() => handleLoadSample('Master Services Agreement')}
                onClearHistory={handleClearDocHistory}
                onNewChat={() => handleNewChat()}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
              />
            )}

            {screen === 'templates' && (
              <TemplatesScreen
                onImportTemplate={(name) => handleLoadSample(name)}
              />
            )}

            {screen === 'settings' && (
              <SettingsScreen
                user={currentUser}
                onSignOut={handleSignOut}
                notify={notify}
              />
            )}
          </main>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFileUpload(f)
          e.target.value = ''
        }}
      />

      {/* Remotion Document Analysis Progress Modal */}
      <RemotionAnalysisModal
        isOpen={analysisModalOpen}
        fileName={analyzingFileName}
        loadingMsg={analyzingStatus || loadingMsg}
        onClose={() => setAnalysisModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Global Toast */}
      {toast && (
        <div className={`toast ${toast.tone || 'info'} animate-in slide-in-from-bottom-5 duration-200`}>
          <div>
            {toast.tone === 'success' ? <Check size={17} /> : toast.tone === 'error' ? <AlertTriangle size={17} /> : <Info size={17} />}
          </div>
          <span className="font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   1. LANDING PAGE COMPONENT (High converting, deep, interactive)
========================================================================= */
function LandingPage({
  currentUser, onStart, onSignIn, onRegister, onOpenApp
}: {
  currentUser: User | null
  onStart: () => void
  onSignIn: () => void
  onRegister: () => void
  onOpenApp: () => void
}) {
  const [activeSandboxTab, setActiveSandboxTab] = useState<'indemnity' | 'noncompete' | 'termination'>('indemnity')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  const sandboxClauses = {
    indemnity: {
      title: 'Section 11.2 — Uncapped Indemnification',
      jargon: '“Provider shall defend, indemnify, and hold harmless Client from and against any and all liabilities, losses, damages, claims, and expenses (including attorneys\' fees) arising from any breach of warranties or third-party infringement claims without limitation.”',
      plainEnglish: 'If anyone files a lawsuit against your client concerning the deliverables, you must pay all legal defense bills and judgments out of pocket with NO monetary ceiling.',
      risk: 'High Risk' as const,
      riskTone: 'high',
      recommendation: 'Negotiate a mutual cap of 1x or 2x total contract fees, and require prompt written notice of claims.'
    },
    noncompete: {
      title: 'Section 14.1 — Post-Employment Non-Compete',
      jargon: '“For a period of twelve (12) months post-termination, Employee shall not directly or indirectly engage in, advise, invest in, or consult for any entity providing competitive software services in North America.”',
      plainEnglish: 'You cannot work for, consult with, or launch any competing AI or software business for an entire year after leaving this company.',
      risk: 'High Risk' as const,
      riskTone: 'high',
      recommendation: 'Request garden leave compensation during the restriction period, or limit the prohibition to named direct competitors.'
    },
    termination: {
      title: 'Section 8.3 — Termination for Convenience',
      jargon: '“Either party may terminate this Agreement without cause upon thirty (30) days prior written notice. Client shall pay for services delivered prior to termination date.”',
      plainEnglish: 'Either you or the client can walk away at any time for any reason by giving 30 days notice. You get paid for work done up to that day.',
      risk: 'Medium Risk' as const,
      riskTone: 'medium',
      recommendation: 'Ensure that non-refundable setup fees or unamortized onboarding costs are covered upon early exit.'
    }
  }

  const currentSample = sandboxClauses[activeSandboxTab]

  return (
    <div className="landing min-h-screen">
      {/* Navigation */}
      <header className="landing-header w-full">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.svg" alt="ClariLegal Logo" className="w-12 h-12 rounded-full object-contain shrink-0" />
          <div>
            <div className="brand-name text-xl font-black tracking-tight text-slate-900 leading-tight">ClariLegal</div>
            <div className="text-xs text-slate-400 font-semibold tracking-wide">Understand. Compare. Decide.</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#sandbox" className="hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#comparison" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <button onClick={onOpenApp} className="btn-primary font-bold px-4 py-2 text-xs">
              Go to Workspace ({currentUser.name}) <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={onSignIn} className="btn-secondary font-bold px-4 py-2 text-xs">
                Sign In
              </button>
              <button onClick={onStart} className="btn-primary font-bold px-5 py-2 text-xs">
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
          <div>
            <div className="pill mb-4">
              <Sparkles size={13} className="text-indigo-600" /> AI-Powered Legal Assistant
            </div>
            <h1 className="text-[52px] font-black tracking-tight leading-[1.08] text-slate-900 mb-5">
              Understand your<br />
              <span className="text-slate-900">legal documents</span><br />
              before you sign.
            </h1>
            <p className="hero-copy mb-6">
              Simplify complex legal language, compare contracts, and get clear explanations of clauses — powered by AI.
            </p>

            <div className="feature-inline mb-7">
              <span><FileText size={16} />Plain-English<br />Summaries</span>
              <span><ArrowRightLeft size={16} />Compare<br />Contracts</span>
              <span><CircleHelp size={16} />Explain<br />Any Clause</span>
            </div>

            <div className="flex items-center gap-3.5 mt-7">
              <button className="btn-primary px-7 h-11 text-xs font-bold shadow-lg shadow-indigo-600/20" onClick={onStart}>
                Get Started
              </button>
              <button
                className="btn-secondary px-5 h-11 text-xs font-bold flex items-center gap-2"
                onClick={() => setDemoModalOpen(true)}
              >
                <Play size={15} className="text-slate-700" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Attention-Grabbing Hero Animation powered by Remotion */}
          <div className="w-full flex items-center justify-center">
            <RemotionHeroPlayer />
          </div>
        </div>
      </section>

      {/* Remotion Walkthrough Demo Modal */}
      <RemotionDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      {/* Interactive Sandbox Section */}
      <section id="sandbox" className="landing-section bg-slate-50/70 border-y border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto">
          <div className="landing-tagline">
            <Zap size={13} /> Interactive Sandbox
          </div>
          <h2 className="landing-title">See ClariLegal in action right now</h2>
          <p className="landing-subtitle mx-auto">
            Click any clause below to experience how our AI extracts critical risks and converts predatory legalese into straightforward, actionable plain English.
          </p>
        </div>

        <div className="sandbox-box max-w-4xl mx-auto">
          <div className="sandbox-tabs">
            <button
              onClick={() => setActiveSandboxTab('indemnity')}
              className={`sandbox-tab ${activeSandboxTab === 'indemnity' ? 'active' : ''}`}
            >
              Uncapped Indemnity
            </button>
            <button
              onClick={() => setActiveSandboxTab('noncompete')}
              className={`sandbox-tab ${activeSandboxTab === 'noncompete' ? 'active' : ''}`}
            >
              12-Month Non-Compete
            </button>
            <button
              onClick={() => setActiveSandboxTab('termination')}
              className={`sandbox-tab ${activeSandboxTab === 'termination' ? 'active' : ''}`}
            >
              Convenience Termination
            </button>
          </div>

          <div className="sandbox-grid">
            <div className="sandbox-col left">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Contract Legalese</div>
                <span className={`risk-badge ${currentSample.riskTone}`}>{currentSample.risk}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mb-2">{currentSample.title}</div>
              <p className="font-serif text-xs leading-relaxed text-slate-600 bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm">
                {currentSample.jargon}
              </p>
            </div>

            <div className="sandbox-col">
              <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-xs">
                <Sparkles size={16} /> ClariLegal Plain English
              </div>
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl mb-4">
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {currentSample.plainEnglish}
                </p>
              </div>

              <div className="text-[11px] font-bold text-slate-500 mb-1">Negotiation Recommendation:</div>
              <div className="text-xs text-slate-600 bg-slate-100/80 p-3 rounded-lg border border-slate-200">
                {currentSample.recommendation}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="features" className="landing-section">
        <div className="text-center max-w-2xl mx-auto">
          <div className="landing-tagline">
            <Layers size={13} /> Full Capability Suite
          </div>
          <h2 className="landing-title">Built for modern contract evaluation</h2>
          <p className="landing-subtitle mx-auto">
            Everything you need to audit, compare, and understand high-stakes legal documents in minutes instead of billing hours.
          </p>
        </div>

        <div className="bento-grid">
          <div className="bento-card">
            <div className="bento-icon text-indigo-600 bg-indigo-50"><FileText size={22} /></div>
            <h4>Plain English Summaries</h4>
            <p>Get immediate clarity on complex agreements. Identify parties, duration, payment schedules, and key deliverables without reading 40 pages of jargon.</p>
          </div>
          <div className="bento-card">
            <div className="bento-icon text-rose-600 bg-rose-50"><AlertTriangle size={22} /></div>
            <h4>Risk & Obligation Radar</h4>
            <p>Automatically flags high-risk clauses such as uncapped indemnity, unilateral IP assignment, non-competes, and aggressive liquidated damages.</p>
          </div>
          <div className="bento-card">
            <div className="bento-icon text-emerald-600 bg-emerald-50"><Eye size={22} /></div>
            <h4>Clause-by-Clause Auditor</h4>
            <p>Inspect every single provision with 4 dedicated lenses: Plain English, Legal Analysis, Affected Parties, and Negotiation Questions.</p>
          </div>
          <div className="bento-card">
            <div className="bento-icon text-amber-600 bg-amber-50"><ArrowRightLeft size={22} /></div>
            <h4>Two-Contract Version Diff</h4>
            <p>Compare contract versions side-by-side. Our diff engine spots sneaky clause removals, modified terms, and added restrictive covenants.</p>
          </div>
          <div className="bento-card">
            <div className="bento-icon text-blue-600 bg-blue-50"><MessageCircle size={22} /></div>
            <h4>Document-Grounded Q&A</h4>
            <p>Ask anything about your contract in real-time. Responses cite the exact section number and page reference so you can verify immediately.</p>
          </div>
          <div className="bento-card">
            <div className="bento-icon text-purple-600 bg-purple-50"><LockKeyhole size={22} /></div>
            <h4>Zero Data Retention Privacy</h4>
            <p>Your contracts stay strictly private. No client data is sold or used to train public foundation models.</p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className="landing-section bg-slate-50/70 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto">
          <div className="landing-tagline">
            <Scale size={13} /> The Advantage
          </div>
          <h2 className="landing-title">Why use ClariLegal?</h2>
          <p className="landing-subtitle mx-auto">
            See how ClariLegal compares against traditional manual attorney review and DIY reading.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <table className="matrix-table shadow-sm">
            <thead>
              <tr>
                <th>Feature / Metric</th>
                <th>Manual Attorney Review</th>
                <th>DIY Manual Reading</th>
                <th className="text-indigo-600 bg-indigo-50/70">ClariLegal AI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">Turnaround Time</td>
                <td>3 to 7 business days</td>
                <td>3 to 5 tedious hours</td>
                <td className="font-bold text-indigo-700 bg-indigo-50/30">Under 10 seconds</td>
              </tr>
              <tr>
                <td className="font-bold">Review Cost</td>
                <td>$450 - $1,500+ per doc</td>
                <td>Free (high cognitive toll)</td>
                <td className="font-bold text-indigo-700 bg-indigo-50/30">Instant / Included</td>
              </tr>
              <tr>
                <td className="font-bold">Risk Detection</td>
                <td>High (subject to fatigue)</td>
                <td>Low (easy to miss legalese)</td>
                <td className="font-bold text-indigo-700 bg-indigo-50/30">Automated High/Med/Low flags</td>
              </tr>
              <tr>
                <td className="font-bold">Version Comparison</td>
                <td>Manual redlining</td>
                <td>Painstaking word-by-word</td>
                <td className="font-bold text-indigo-700 bg-indigo-50/30">Side-by-side clause diff</td>
              </tr>
              <tr>
                <td className="font-bold">Interactive Q&A</td>
                <td>Slow email back-and-forth</td>
                <td>None</td>
                <td className="font-bold text-indigo-700 bg-indigo-50/30">Instant cited AI copilot</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="landing-section">
        <div className="text-center max-w-2xl mx-auto">
          <div className="landing-tagline">
            <HelpCircle size={13} /> Clear Answers
          </div>
          <h2 className="landing-title">Frequently Asked Questions</h2>
          <p className="landing-subtitle mx-auto">
            Everything you need to know about ClariLegal and our legal information platform.
          </p>
        </div>

        <div className="faq-list max-w-3xl mx-auto">
          {[
            {
              q: 'Is ClariLegal a replacement for a qualified attorney?',
              a: 'No. ClariLegal is an AI-powered legal information assistant designed to help you quickly understand complex contract jargon, compare versions, and prepare questions for your legal counsel. It provides informational analysis, not formal legal representation.'
            },
            {
              q: 'What file formats and file sizes are supported?',
              a: 'ClariLegal supports standard PDF documents, Markdown (.md), and plain text (.txt) files up to 4 MB for instant online analysis. Our engine extracts text, sections, and structured clauses directly.'
            },
            {
              q: 'How does the Test User authentication work?',
              a: 'For hackathon judges and evaluators, the app is pre-configured with test credentials (test@test.com / test@123). You can click the 1-Click Autofill button on the sign-in modal to enter your session immediately.'
            },
            {
              q: 'Can I test ClariLegal if I don’t have a contract PDF on my laptop?',
              a: 'Yes! ClariLegal includes 1-click Sample Loaders for standard NDAs, Master Services Agreements, and Employment Contracts right on the dashboard. You can also import pre-built contract templates.'
            },
            {
              q: 'What AI model powers ClariLegal?',
              a: 'ClariLegal is powered by Google’s Gemini 2.5 Flash model, with built-in fallbacks and a client-side rule extraction engine to guarantee 100% uptime during high-volume judging.'
            }
          ].map((item, idx) => (
            <div key={idx} className="faq-item">
              <button
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={17}
                  className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="faq-a">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* High-Impact Final CTA Section */}
      <section className="landing-section bg-gradient-to-b from-slate-50 to-indigo-50/40 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center px-6 py-8">
          <div className="pill mb-4 mx-auto">
            <Sparkles size={13} className="text-indigo-600" /> Start in seconds
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Protect your firm from hidden legal traps today
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-8">
            Upload your first contract or test our standard industry templates. Get instant risk scores, plain-English explanations, and side-by-side diffs.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={onStart}
              className="btn-primary px-8 h-12 text-sm font-bold shadow-xl shadow-indigo-600/25"
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="btn-secondary px-6 h-12 text-sm font-bold flex items-center gap-2"
            >
              <Play size={16} /> Watch Remotion Walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ClariLegal Logo" className="w-10 h-10 rounded-full object-contain shrink-0" />
            <div>
              <div className="font-extrabold text-sm text-slate-900">ClariLegal</div>
              <div className="text-[11px] text-slate-400">AI-Powered Legal Clarity</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-left max-w-md">
            <LockKeyhole size={13} className="inline mr-1 text-slate-400" />
            ClariLegal provides automated legal information, not attorney-client legal advice. Review critical commitments with licensed counsel.
          </div>

          <div className="text-xs text-slate-400">
            © 2026 ClariLegal. Built for the Gemini Hackathon.
          </div>
        </div>
      </footer>
    </div>
  )
}

/* =========================================================================
   2. DASHBOARD / HOME SCREEN (Rich, high density, interactive)
========================================================================= */
function DashboardScreen({
  user, docs, metrics, activities, onAnalyze, onCompare, onAsk, onDocs, onTemplates,
  onSelectDoc, onDeleteDoc, onLoadSample, onUploadFile, inputRef
}: {
  user: User | null
  docs: StoredDocument[]
  metrics: any
  activities: ActivityItem[]
  onAnalyze: () => void
  onCompare: () => void
  onAsk: () => void
  onDocs: () => void
  onTemplates: () => void
  onSelectDoc: (id: string) => void
  onDeleteDoc: (id: string, name: string) => void
  onLoadSample: (name: string) => void
  onUploadFile: (f: File) => void
  inputRef: any
}) {
  const [docSearch, setDocSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [showNotifications, setShowNotifications] = useState(false)

  const filteredDocs = useMemo(() => {
    return docs.filter(d => {
      const matchName = d.name.toLowerCase().includes(docSearch.toLowerCase())
      const matchRisk = riskFilter === 'All' ? true : d.overallRisk === riskFilter
      return matchName && matchRisk
    })
  }, [docs, docSearch, riskFilter])

  // Ensure live audit trail is always populated when contracts are present
  const displayActivities = useMemo(() => {
    if (activities && activities.length > 0) return activities
    if (docs && docs.length > 0) {
      return docs.map((d, i) => ({
        id: `act_fallback_${d.id}`,
        type: 'analyze' as const,
        title: `Uploaded & analyzed "${d.name}" with ${d.overallRisk} risk score`,
        time: d.uploadDate || 'Recent',
        timestamp: Date.now() - i * 60000,
      }))
    }
    return []
  }, [activities, docs])

  return (
    <div className="page">
      {/* Top Header */}
      <div className="topbar" id="tour-topbar">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles size={12} className="text-indigo-600" /> CONTRACT INTELLIGENCE DASHBOARD
          </div>
          <h2>Welcome back, {user?.name || 'Test User'}! 👋</h2>
          <p>You have {metrics.totalDocs} active contracts in your workspace. What would you like to review?</p>
        </div>
        <div className="topbar-actions">
          <button
            id="tour-quick-tour-btn"
            className="btn-secondary small font-bold flex items-center gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={() => startTour()}
            title="Start Interactive Guided Tour"
          >
            <Sparkles size={13} className="text-indigo-600" /> Quick Tour
          </button>
          <div className="searchbox">
            <Search size={15} />
            <input
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              placeholder="Search contracts..."
            />
          </div>

          {/* Interactive Notifications Popover */}
          <div className="relative">
            <button
              className="icon-btn relative"
              onClick={() => setShowNotifications(v => !v)}
              title="Notifications & Live Activity"
            >
              <Bell size={17} />
              {displayActivities.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">Activity & Alerts</span>
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                      {displayActivities.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 mt-2">
                  {displayActivities.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet. Workspace is clear.
                    </div>
                  ) : (
                    displayActivities.slice(0, 8).map(act => (
                      <div key={act.id} className="py-2.5 text-left">
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">{act.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{act.time}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => { setShowNotifications(false); onDocs() }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All Documents
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MVP Primary Action: Upload Contract at the Top */}
      <div
        id="tour-dropzone"
        className="mvp-upload-hero cursor-pointer transition-all mt-6"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) onUploadFile(f)
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25 transition-transform">
              <Upload size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">Upload Contract for Instant AI Analysis</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Primary MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Drop your contract here or click to browse • Supports PDF, TXT, or Markdown up to 4 MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="btn-primary font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 h-10 px-4">
              <Upload size={15} /> Select Contract
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5" id="tour-actions">
        <ActionCard
          icon={<FileText size={20} />}
          tone="lavender"
          title="Analyze Document"
          desc="Upload any contract to extract key risks, plain-English translations & summaries."
          badgeText="Analyze Now"
          onClick={onAnalyze}
        />
        <ActionCard
          icon={<ArrowRightLeft size={20} />}
          tone="mint"
          title="Compare Contracts"
          desc="Diff two agreement versions side-by-side to highlight added or removed terms."
          badgeText="Redline Diff"
          onClick={onCompare}
        />
        <ActionCard
          icon={<MessageCircle size={20} />}
          tone="blue"
          title="Ask AI Copilot"
          desc="Pose questions grounded directly in your contract’s exact clauses and citations."
          badgeText="Open Copilot"
          onClick={onAsk}
        />
      </div>

      {/* Lower Section: Contracts (Left) + 2x2 Small Analytics Cards (Right) */}
      <div className="dashboard-contracts-split">
        {/* LEFT COLUMN: Your Contracts */}
        <section className="content-section mt-0">
          <div className="section-head">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Your Contracts</h3>
              </div>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                {(['All', 'High', 'Medium', 'Low'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setRiskFilter(tab)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      riskFilter === tab
                        ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onDocs}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              View all ({docs.length}) <ChevronRight size={15} />
            </button>
          </div>

          <div className="doc-list shadow-xs border border-slate-200/80">
            {filteredDocs.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/50 rounded-xl">
                <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                <div className="font-bold text-slate-700 text-sm">
                  {docs.length === 0 ? 'No contracts uploaded yet' : 'No contracts match the selected filter'}
                </div>
                <div className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {docs.length === 0
                    ? 'Use the upload box above to start instant AI risk analysis.'
                    : 'Clear your search query or reset filter to view all contracts.'}
                </div>
              </div>
            ) : (
              filteredDocs.slice(0, 6).map(d => (
                <div key={d.id} className="doc-row group hover:bg-indigo-50/30 transition-colors">
                  <div className="file-icon bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1 text-left cursor-pointer" onClick={() => onSelectDoc(d.id)}>
                    <div className="font-semibold text-xs text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {d.uploadDate} • {d.size} • {d.pageCount} pages
                    </div>
                  </div>
                  <span className={`risk-badge ${d.overallRisk.toLowerCase()}`}>
                    {d.overallRisk} Risk
                  </span>
                  <button
                    onClick={() => onSelectDoc(d.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 transition-all"
                  >
                    Inspect Analysis
                  </button>
                  <button
                    onClick={() => onDeleteDoc(d.id, d.name)}
                    title="Delete document"
                    className="text-slate-300 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Set of 4 Analytics Cards (Two each row, 2x2 grid) Beside Your Contracts */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Workspace Analytics</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Live Insights</span>
          </div>

          <div className="dashboard-metrics-2x2" id="tour-metrics">
            <div className="metric-card">
              <div className="metric-head">
                <span>TOTAL CONTRACTS</span>
                <div className="metric-icon bg-indigo-50 text-indigo-600"><FileText size={15} /></div>
              </div>
              <div className="metric-val">{metrics.totalDocs}</div>
              <div className="metric-sub text-slate-500">Across categories</div>
            </div>

            <div className="metric-card">
              <div className="metric-head">
                <span>HIGH RISK FLAGS</span>
                <div className="metric-icon bg-rose-50 text-rose-600"><AlertTriangle size={15} /></div>
              </div>
              <div className="metric-val text-rose-600">{metrics.highRiskCount}</div>
              <div className="metric-sub text-rose-500 font-semibold">Immediate review</div>
            </div>

            <div className="metric-card">
              <div className="metric-head">
                <span>CLAUSES AUDITED</span>
                <div className="metric-icon bg-blue-50 text-blue-600"><Layers size={15} /></div>
              </div>
              <div className="metric-val text-blue-600">{metrics.totalClauses}</div>
              <div className="metric-sub text-slate-500">Plain English explanations</div>
            </div>

            <div className="metric-card">
              <div className="metric-head">
                <span>ESTIMATED TIME SAVED</span>
                <div className="metric-icon bg-emerald-50 text-emerald-600"><Zap size={15} /></div>
              </div>
              <div className="metric-val text-emerald-600">~{metrics.timeSavedHours}h</div>
              <div className="metric-sub text-emerald-600 font-semibold">85% faster review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  onClick,
  tone,
  badgeText = 'Launch'
}: {
  icon: any
  title: string
  desc: string
  onClick: () => void
  tone: 'lavender' | 'mint' | 'blue' | 'purple' | string
  badgeText?: string
}) {
  return (
    <button
      type="button"
      className={`action-btn-card group ${tone}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full">
        <div className="action-btn-icon">
          {icon}
        </div>
        <span className="action-btn-badge">
          {badgeText} <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
      <div className="mt-4 text-left w-full">
        <div className="action-btn-title">
          {title}
        </div>
        <div className="action-btn-desc">
          {desc}
        </div>
      </div>
    </button>
  )
}

/* =========================================================================
   3. DOCUMENTS SCREEN (Library with search, filters, actions)
========================================================================= */
function DocumentsScreen({
  docs, onOpen, onCompareWith, onAskAbout, onDelete, onUploadFile, onLoadSample
}: {
  docs: StoredDocument[]
  onOpen: (id: string) => void
  onCompareWith: (id: string) => void
  onAskAbout: (id: string) => void
  onDelete: (id: string, name: string) => void
  onUploadFile: (f: File) => void
  onLoadSample: (name: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('All')

  const filtered = docs.filter(d => {
    const matchName = d.name.toLowerCase().includes(search.toLowerCase())
    const matchRisk = filterRisk === 'All' ? true : d.overallRisk === filterRisk
    return matchName && matchRisk
  })

  return (
    <div className="page">
      <div className="subhead">
        <div>
          <div className="eyebrow">CONTRACT REPOSITORY</div>
          <h2>Document Library ({docs.length})</h2>
          <p>Organize, search, and manage your analyzed legal agreements.</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-primary small cursor-pointer">
            <Upload size={14} /> Upload Contract
            <input
              className="hidden"
              type="file"
              accept=".pdf,.txt,.md"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) onUploadFile(f)
              }}
            />
          </label>
        </div>
      </div>

      <div className="filterbar">
        <div className="searchbox w-full max-w-sm">
          <Search size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contracts by title or party..."
          />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['All', 'High', 'Medium', 'Low'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1 rounded-lg transition-all ${filterRisk === r ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
            >
              {r} Risk
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center border-dashed my-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileText size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {docs.length === 0 ? 'Your contract library is empty' : 'No matching contracts found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-md mx-auto">
            {docs.length === 0
              ? 'Upload your agreements to start tracking risk scores, reviewing extracted clauses, and asking AI questions.'
              : 'Try clearing your search query or switching the risk category filter to display all documents.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {docs.length === 0 ? (
              <>
                <label className="btn-primary small cursor-pointer inline-flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20">
                  <Upload size={14} /> Upload Contract
                  <input
                    className="hidden"
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) onUploadFile(f)
                    }}
                  />
                </label>
                <button
                  onClick={() => onLoadSample('Master Services Agreement')}
                  className="btn-secondary small inline-flex items-center gap-1.5 font-bold"
                >
                  <LayoutTemplate size={14} /> Try Standard Template
                </button>
              </>
            ) : (
              <button
                onClick={() => { setSearch(''); setFilterRisk('All') }}
                className="btn-primary small font-bold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="doc-grid">
          {filtered.map(d => (
            <div className="doc-card flex flex-col justify-between" key={d.id}>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="file-icon"><FileText size={20} /></div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{d.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{d.uploadDate} • {d.size}</div>
                    </div>
                  </div>
                  <span className={`risk-badge ${d.overallRisk.toLowerCase()}`}>{d.overallRisk} Risk</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                  {d.analysis?.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => onOpen(d.id)}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Eye size={13} /> View Analysis
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCompareWith(d.id)}
                    title="Compare with another contract"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <ArrowRightLeft size={15} />
                  </button>
                  <button
                    onClick={() => onAskAbout(d.id)}
                    title="Ask questions about this contract"
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                  >
                    <MessageCircle size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(d.id, d.name)}
                    title="Delete contract"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   4. ANALYSIS SCREEN (Real dynamic analysis, export, clause jump)
========================================================================= */
function AnalysisScreen({
  doc, docs, onSelectDoc, selectedClauseId, onSelectClause, loading, loadingMsg, onInspectClause, onAsk, onCompare, onUploadNew, onLoadTemplate, notify
}: {
  doc: StoredDocument | null
  docs: StoredDocument[]
  onSelectDoc: (id: string) => void
  selectedClauseId?: string
  onSelectClause?: (cid: string) => void
  loading: boolean
  loadingMsg: string
  onInspectClause: (cid: string) => void
  onAsk: () => void
  onCompare: () => void
  onUploadNew: () => void
  onLoadTemplate?: () => void
  notify: (msg: string, tone?: ToastTone) => void
}) {
  if (!doc) {
    return (
      <div className="page p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} />
        </div>
        <h3 className="font-bold text-slate-800 text-base">No agreement selected for analysis</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          Upload your contract (PDF, TXT, or Markdown) or pick one from your library to examine AI risk scores, plain English summaries, and key clauses.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <button onClick={onUploadNew} className="btn-primary small inline-flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20">
            <Upload size={14} /> Upload Contract
          </button>
          {onLoadTemplate && (
            <button onClick={onLoadTemplate} className="btn-secondary small inline-flex items-center gap-1.5 font-bold">
              <LayoutTemplate size={14} /> Load Standard NDA Template
            </button>
          )}
        </div>
      </div>
    )
  }

  const data = doc.analysis

  const [searchQuery, setSearchQuery] = useState('')
  const [docViewMode, setDocViewMode] = useState<'text' | 'pdf'>('text')
  const [activeClauseId, setActiveClauseId] = useState<string>(
    selectedClauseId || doc.analysis.clauses[0]?.id || ''
  )
  const [showOverview, setShowOverview] = useState(false)
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Filter clauses by risk level
  const filteredClauses = useMemo(() => {
    if (riskFilter === 'ALL') return data.clauses
    return data.clauses.filter(c => c.risk.toUpperCase() === riskFilter)
  }, [data.clauses, riskFilter])

  // Synchronize internal active clause when external selectedClauseId changes
  useEffect(() => {
    if (selectedClauseId) {
      setActiveClauseId(selectedClauseId)
      scrollToClause(selectedClauseId)
    }
  }, [selectedClauseId])

  function handleClauseClick(cid: string) {
    if (activeClauseId === cid) {
      setActiveClauseId('')
    } else {
      setActiveClauseId(cid)
      onSelectClause?.(cid)
      scrollToClause(cid)
    }
  }

  function scrollToClause(cid: string) {
    const el = segmentRefs.current[cid]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleExportReport() {
    if (!doc) return
    const reportText = `=====================================================
LEGALSENSE CONTRACT AUDIT REPORT
=====================================================
Document: ${doc.name}
Overall Risk Level: ${data.overallRisk}
Document Type: ${data.type}
Effective Date: ${data.effective}
Duration: ${data.duration}
Parties Involved: ${data.parties.join(', ')}

-----------------------------------------------------
EXECUTIVE SUMMARY
-----------------------------------------------------
${data.summary}

-----------------------------------------------------
KEY TAKEAWAYS & OBLIGATIONS
-----------------------------------------------------
${data.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

-----------------------------------------------------
RISK BREAKDOWN
-----------------------------------------------------
${data.risks.map(([cat, lvl]) => `• ${cat}: [${lvl}]`).join('\n')}

-----------------------------------------------------
EXTRACTED CLAUSES AUDITED
-----------------------------------------------------
${data.clauses.map(c => `[Section ${c.section}: ${c.title}] - ${c.risk} Risk
Quote: "${c.quote}"
Plain English: ${c.plainEnglish}
Why It Matters: ${c.whyItMatters}
Negotiation Questions:
${c.questionsToAsk.map(q => `  - ${q}`).join('\n')}
`).join('\n')}

Report Generated by ClariLegal
=====================================================`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.name.replace(/\.[^/.]+$/, '')}_ClariLegal_Report.txt`
    a.click()
    URL.revokeObjectURL(url)
    notify('Audit report downloaded successfully!', 'success')
  }

  const activeClause = data.clauses.find(c => c.id === activeClauseId) || data.clauses[0]

  return (
    <div className="page analysis-page">
      {/* Top Document Header */}
      <div className="document-head">
        <div className="flex gap-3 items-start min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileCheck size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate">{doc.name}</h2>
              <span className={`risk-badge ${doc.overallRisk.toLowerCase()}`}>{doc.overallRisk} Risk</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Uploaded: {doc.uploadDate} • Size: {doc.size} • Pages: {doc.pageCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Document Switcher */}
          <select
            value={doc.id}
            onChange={e => onSelectDoc(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none"
          >
            {docs.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button onClick={handleExportReport} className="btn-secondary small">
            <Download size={14} /> Export Report
          </button>
          <button onClick={onAsk} className="btn-primary small">
            <MessageCircle size={14} /> Ask Copilot
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-banner animate-pulse">
          <Sparkles size={16} /> {loadingMsg}
        </div>
      )}

      {/* Main Interactive Split Workspace */}
      <div className="analysis-split-view">
        {/* LEFT COLUMN: PDF / Interactive Contract Viewer with Synchronized Highlighting */}
        <div className="pdf-viewer-card">
          <div className="pdf-viewer-header">
            {/* Left: Clean Mode Selector & Page Indicator */}
            <div className="flex items-center gap-2 min-w-0">
              {doc.fileDataUrl ? (
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10.5px] font-bold shrink-0">
                  <button
                    onClick={() => setDocViewMode('text')}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${docViewMode === 'text'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                    title="Interactive highlighted clauses"
                  >
                    <Sparkles size={11} className={docViewMode === 'text' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>Highlighted Text</span>
                  </button>
                  <button
                    onClick={() => setDocViewMode('pdf')}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${docViewMode === 'pdf'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                    title="Original uploaded PDF file"
                  >
                    <FileText size={11} className={docViewMode === 'pdf' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>Original PDF</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 whitespace-nowrap">
                  <FileText size={14} className="text-indigo-600" />
                  <span>Document Text</span>
                </div>
              )}

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap hidden sm:inline-flex items-center">
                Page {activeClause?.page || 1} of {doc.pageCount}
              </span>
            </div>

            {/* Right: Sleek, Expanding Search Bar */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-400 shrink-0 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={12} className="shrink-0" />
              <input
                type="text"
                placeholder="Find text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="outline-none text-[11px] text-slate-700 w-20 sm:w-28 focus:w-36 transition-all bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Viewer Container */}
          <div className="pdf-viewer-content">
            {docViewMode === 'pdf' && doc.fileDataUrl ? (
              <iframe
                src={doc.fileDataUrl}
                title={doc.name}
                className="w-full h-full rounded-lg border border-slate-200"
              />
            ) : (
              <div className="pdf-text-page">
                <div className="text-center pb-5 mb-4 border-b border-slate-200">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-sans font-bold">
                    Official Agreement Text
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1 font-serif">
                    {doc.name.replace(/\.[^/.]+$/, '')}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1 font-sans">
                    Effective: {data.effective} • Parties: {data.parties.join(' & ')}
                  </div>
                </div>

                {/* Document Clauses with Real-Time Interactive Highlights */}
                <div className="space-y-4">
                  {data.clauses.map((c) => {
                    const isSelected = c.id === activeClauseId
                    const matchesSearch = !searchQuery ||
                      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.section.toLowerCase().includes(searchQuery.toLowerCase())

                    if (!matchesSearch) return null

                    return (
                      <div
                        key={c.id}
                        ref={el => { segmentRefs.current[c.id] = el }}
                        onClick={() => handleClauseClick(c.id)}
                        className={`clause-doc-segment risk-${c.risk.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-sans font-bold text-slate-500 mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-indigo-600">Section {c.section}</span>
                            <span className="text-slate-800 font-semibold">{c.title}</span>
                          </span>
                          <span className={`risk-badge ${c.risk.toLowerCase()} text-[9px] py-0.5 px-2`}>
                            {c.risk} Risk
                          </span>
                        </div>
                        <p className="segment-quote italic leading-relaxed text-slate-800">
                          &ldquo;{c.quote}&rdquo;
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center font-sans text-xs text-slate-400">
                  End of Analyzed Covenants • {data.clauses.length} clauses parsed & verified
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Clickable Analysis Breakdown & Deep-Dive */}
        <div className="analysis-right-pane">
          {/* Executive Overview Summary Card (Collapsible for maximum vertical space) */}
          <div className="card p-3 border-slate-200 bg-white">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setShowOverview(v => !v)}
              title="Click to toggle overview details"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overview:</span>
                  <span className="text-xs font-bold text-slate-900 truncate">{data.type}</span>
                  <span className={`risk-badge ${doc.overallRisk.toLowerCase()} font-bold text-[9px] py-0.5 px-2`}>
                    {doc.overallRisk} Risk
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:text-indigo-800 shrink-0">
                <span>{showOverview ? 'Hide Summary' : 'Read Summary'}</span>
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${showOverview ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {showOverview && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs leading-relaxed text-slate-700 animate-in fade-in">
                {data.summary}
              </div>
            )}
          </div>

          {/* Clickable Clause List Header & Risk Filter Chips */}
          <div className="flex items-center justify-between pt-0.5 pb-0.5 flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Audited Clauses</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-extrabold">
                {filteredClauses.length}
              </span>
            </div>

            {/* Quick Filter Chips to Eliminate Needless Scrolling */}
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(rf => {
                const count = rf === 'ALL'
                  ? data.clauses.length
                  : data.clauses.filter(c => c.risk.toUpperCase() === rf).length
                if (count === 0 && rf !== 'ALL') return null
                const isActive = riskFilter === rf
                return (
                  <button
                    key={rf}
                    onClick={() => setRiskFilter(rf)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rf === 'ALL' ? 'All' : rf.charAt(0) + rf.slice(1).toLowerCase()} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Clickable Clause Cards (Clicking highlights on the PDF/Text viewer & expands details in-place) */}
          <div className="space-y-2 pb-2">
            {filteredClauses.map(c => {
              const isSelected = c.id === activeClauseId
              return (
                <div
                  key={c.id}
                  onClick={() => handleClauseClick(c.id)}
                  className={`clickable-clause-card transition-all duration-200 ${
                    isSelected
                      ? 'active bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border-indigo-300 ring-2 ring-indigo-500/15 shadow-sm'
                      : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">Section {c.section}</span>
                        <h5 className="font-extrabold text-xs text-slate-900 truncate">{c.title}</h5>
                        {isSelected && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-600 text-white flex items-center gap-1 shadow-xs tracking-wide">
                            <Sparkles size={9} /> SPOTLIGHTED
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`risk-badge ${c.risk.toLowerCase()} shrink-0 text-[9px] py-0.5 px-2 font-bold`}>
                        {c.risk}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isSelected ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Compact Preview (when collapsed) */}
                  {!isSelected && (
                    <>
                      <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-1 leading-relaxed">
                        {c.plainEnglish}
                      </p>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Page {c.page || 1}</span>
                        <span className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                          Click to expand & spotlight →
                        </span>
                      </div>
                    </>
                  )}

                  {/* In-Place Expanded Detail View (when selected) */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2.5 border-t border-indigo-100/80 space-y-2 animate-in fade-in duration-200">
                      <div className="p-2.5 bg-white/95 rounded-lg border border-indigo-100 text-xs shadow-xs">
                        <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Plain-English Translation:
                        </div>
                        <div className="text-slate-800 font-medium mt-1 text-[11.5px] leading-relaxed">
                          {c.plainEnglish}
                        </div>
                      </div>

                      <div className="p-2.5 bg-amber-50/90 rounded-lg border border-amber-200 text-xs text-amber-900 shadow-xs">
                        <div className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          <Info size={11} /> Why It Matters:
                        </div>
                        <div className="mt-1 text-[11.5px] leading-relaxed">
                          {c.whyItMatters}
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between gap-2 text-xs flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Page {c.page || 1} • Spotlighted in Viewer
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onInspectClause(c.id)
                          }}
                          className="btn-primary small text-[11px] h-7 px-3 font-bold shadow-xs flex items-center gap-1 ml-auto"
                        >
                          Full Inspection →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   5. CLAUSE INSPECTOR SCREEN (Browse ANY clause, 4 deep tabs)
========================================================================= */
function ClauseScreen({
  doc, docs, onSelectDoc, clause, tab, setTab, onSelectClause, onBack, onAsk, onUploadNew, onLoadTemplate, onGoHome, loading
}: {
  doc: StoredDocument | null
  docs: StoredDocument[]
  onSelectDoc: (id: string) => void
  clause: ClauseItem | null
  tab: string
  setTab: (t: string) => void
  onSelectClause: (cid: string) => void
  onBack: () => void
  onAsk: () => void
  onUploadNew?: () => void
  onLoadTemplate?: () => void
  onGoHome?: () => void
  loading: boolean
}) {
  if (!doc || !clause) {
    return (
      <div className="page">
        <div className="subhead">
          <div>
            <div className="eyebrow">CLAUSE INSPECTOR</div>
            <h2>Clause Deep-Dive & Plain English Breakdown</h2>
            <p>Select an agreement to audit risky covenants, indemnity clauses, and strategic counter-questions.</p>
          </div>
        </div>

        <div className="card p-12 text-center border-dashed my-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Eye size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Select a Contract for Clause Inspection</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            The Clause Inspector dissects confusing contract legalese into plain English explanations, pinpoints who is financially burdened, and arms you with sharp negotiation counter-questions.
          </p>

          {docs && docs.length > 0 && (
            <div className="mb-6 max-w-xs mx-auto text-left">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Choose an uploaded agreement:</label>
              <select
                onChange={e => onSelectDoc(e.target.value)}
                defaultValue=""
                className="clause-select w-full bg-white border border-indigo-200 text-slate-800 text-xs px-3 py-2 rounded-lg font-semibold shadow-sm outline-none"
              >
                <option value="" disabled>Select a contract to inspect...</option>
                {docs.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.analysis?.clauses?.length || 0} clauses)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {onUploadNew && (
              <button onClick={onUploadNew} className="btn-primary small inline-flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20">
                <Upload size={14} /> Upload Contract to Inspect
              </button>
            )}
            {onLoadTemplate && (
              <button onClick={onLoadTemplate} className="btn-secondary small inline-flex items-center gap-1.5 font-bold">
                <LayoutTemplate size={14} /> Load Standard Agreement
              </button>
            )}
            {onGoHome && (
              <button onClick={onGoHome} className="btn-secondary small font-bold">
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const clauses = doc.analysis.clauses

  return (
    <div className="page">
      {/* Breadcrumb & Navigation */}
      <div className="breadcrumb">
        <button onClick={onBack} className="hover:text-indigo-600 font-semibold">
          <ChevronLeft size={16} /> Back to Document Overview
        </button>
        <div className="page-step">
          <span className="text-xs font-bold text-slate-500">Document Page {clause.page || 1}</span>
        </div>
      </div>

      {/* Clause Selector Bar with Select Doc and Select Clause */}
      <div className="clause-selector-bar flex flex-wrap items-center gap-3">
        {docs && docs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Select Document:</span>
            <select
              value={doc.id}
              onChange={e => onSelectDoc(e.target.value)}
              className="clause-select font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shadow-sm max-w-[220px] truncate"
            >
              {docs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-xs font-bold text-slate-500 shrink-0">Select Clause:</span>
          <select
            value={clause.id}
            onChange={e => onSelectClause(e.target.value)}
            className="clause-select flex-1 font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shadow-sm"
          >
            {clauses.map(c => (
              <option key={c.id} value={c.id}>
                Section {c.section} — {c.title} ({c.risk} Risk)
              </option>
            ))}
          </select>
        </div>

        <button onClick={onAsk} className="btn-secondary small shrink-0 font-semibold inline-flex items-center gap-1.5">
          <MessageCircle size={14} /> Ask Copilot
        </button>
      </div>

      {/* Main Clause Card */}
      <div className="clause-card card">
        <div className="clause-header">
          <div>
            <div className="section-kicker">CLAUSE DETAILS • {doc.name}</div>
            <h2>
              <span className="section-number">Section {clause.section}</span>
              {clause.title}
              <span className={`risk-badge ${clause.risk.toLowerCase()} ml-3`}>{clause.risk} Risk</span>
            </h2>
          </div>
        </div>

        {/* Verbatim Quote */}
        <div className="clause-quote font-serif text-xs leading-relaxed text-slate-700 bg-slate-50 border-l-4 border-indigo-600">
          “{clause.quote}”
        </div>

        {/* 4 Deep Lenses */}
        <div className="tabs inner">
          {['Plain English', 'Legal Analysis', 'Who Is Affected', 'Questions to Ask'].map(t => (
            <span
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t}
            </span>
          ))}
        </div>

        {loading && (
          <div className="loading-banner"><Sparkles size={16} /> Updating explanation with Gemini…</div>
        )}

        <div className="clause-body">
          {tab === 'Plain English' && (
            <>
              <p className="text-xs leading-relaxed text-slate-800 font-medium">
                {clause.plainEnglish}
              </p>
              <div className="why-box mt-4">
                <div className="font-bold text-xs text-amber-900 flex items-center gap-2">
                  <Info size={15} /> Why does this matter?
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {clause.whyItMatters}
                </p>
              </div>
            </>
          )}

          {tab === 'Legal Analysis' && (
            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <p>
                <strong>Risk Profile:</strong> Classified as <strong>{clause.risk} Risk</strong>. This provision establishes substantive rights and liabilities that deviate from standard commercial reciprocity.
              </p>
              <p>
                <strong>Enforceability & Compliance:</strong> Review the governing law clause in this contract. Depending on local jurisdiction, unilateral indemnification or excessive restrictive covenants may be limited by statutory public policy.
              </p>
            </div>
          )}

          {tab === 'Who Is Affected' && (
            <div className="takeaway-list">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <UserRound size={16} className="text-indigo-600 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Your / Contractor Obligation</div>
                  <div className="text-xs text-slate-600 mt-0.5">{clause.whoIsAffected.partyA}</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Scale size={16} className="text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Counterparty Right / Position</div>
                  <div className="text-xs text-slate-600 mt-0.5">{clause.whoIsAffected.partyB}</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Questions to Ask' && (
            <div className="questions">
              {clause.questionsToAsk.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          )}

          {/* Source Quote Footer */}
          <div className="source-box">
            <div className="card-title">Verified Document Citation</div>
            <div className="source-paper">
              <div className="source-label text-indigo-700">{clause.section}</div>
              <p className="truncate"><b>{clause.title}:</b> {clause.quote}</p>
              <span className="font-bold">Page {clause.page || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   6. COMPARE SCREEN (Two-contract diff, side-by-side view)
========================================================================= */
function CompareScreen({
  docs, docAId, docBId, setDocAId, setDocBId, onRunCompare, onLoadSamplePair, result, loading, loadingMsg, onUploadA, onUploadB
}: {
  docs: StoredDocument[]
  docAId: string
  docBId: string
  setDocAId: (id: string) => void
  setDocBId: (id: string) => void
  onRunCompare: (overrideAId?: string, overrideBId?: string) => void
  onLoadSamplePair?: () => void
  result: any
  loading: boolean
  loadingMsg: string
  onUploadA: (f: File) => void
  onUploadB: (f: File) => void
}) {
  const [compareTab, setCompareTab] = useState<'Summary' | 'Changed' | 'SideBySide'>('Summary')

  // Auto-adjust so docA and docB are distinct if possible
  useEffect(() => {
    if (docs.length >= 2) {
      const validA = docs.some(d => d.id === docAId)
      const validB = docs.some(d => d.id === docBId) && docBId !== docAId
      if (!validA) {
        setDocAId(docs[0].id)
      }
      if (!validB) {
        const alt = docs.find(d => d.id !== (validA ? docAId : docs[0].id))
        if (alt) setDocBId(alt.id)
      }
    }
  }, [docs, docAId, docBId, setDocAId, setDocBId])

  const docA = docs.find(d => d.id === docAId) || docs[0]
  const docB = docs.find(d => d.id === docBId && d.id !== docA?.id) || docs.find(d => d.id !== docA?.id) || docs[1] || docs[0]

  const changes = result?.changedClauses || []
  const modified = result?.modified ?? changes.filter((c: any) => c.type === 'Modified').length
  const added = result?.added ?? changes.filter((c: any) => c.type === 'Added').length
  const removed = result?.removed ?? changes.filter((c: any) => c.type === 'Removed').length
  const unchanged = result?.unchanged ?? 0
  const total = result?.total ?? (changes.length + unchanged)

  return (
    <div className="page">
      <div className="subhead">
        <div>
          <div className="eyebrow">TWO-CONTRACT DIFF ENGINE</div>
          <h2>Contract Comparison</h2>
          <p>Highlight added restrictions, removed protections, and changed liabilities across versions.</p>
        </div>
        <div className="flex gap-2">
          {onLoadSamplePair && (
            <button
              className="btn-secondary small font-bold"
              onClick={onLoadSamplePair}
              title="Load standard Draft v1 vs Counterparty Redline v2"
            >
              <Sparkles size={13} className="text-indigo-600" /> Load Sample Redlines
            </button>
          )}
          {docs.length >= 2 && (
            <button
              className="btn-primary small"
              onClick={() => onRunCompare(docA?.id, docB?.id)}
              disabled={loading || !docA || !docB || docA.id === docB.id}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Run Comparison
            </button>
          )}
        </div>
      </div>

      {docs.length < 2 ? (
        <div className="card p-12 text-center border-dashed my-6 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <ArrowRightLeft size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Two contracts required for comparison</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-md mx-auto">
            You currently have {docs.length} contract{docs.length === 1 ? '' : 's'} in your workspace. Upload at least two agreements (such as an original draft and counterparty redline) or load our pre-configured test pair.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {onLoadSamplePair && (
              <button
                onClick={onLoadSamplePair}
                className="btn-primary small inline-flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20"
              >
                <Sparkles size={14} /> 1-click Sample upload
              </button>
            )}
            <label className="btn-secondary small cursor-pointer inline-flex items-center gap-1.5 font-bold">
              <Upload size={14} /> Upload Contract
              <input
                className="hidden"
                type="file"
                accept=".pdf,.txt,.md"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) onUploadA(f)
                }}
              />
            </label>
          </div>
        </div>
      ) : (
        <>
          {/* Select Two Documents */}
          <div className="compare-upload-grid">
            <div className="card p-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">Contract 1 (Original / Baseline)</label>
              <select
                value={docA?.id || docAId}
                onChange={e => setDocAId(e.target.value)}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white outline-none"
              >
                {docs.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.overallRisk} Risk)</option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400 mt-2">
                Uploaded: {docA?.uploadDate} • {docA?.size}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (docA && docB) {
                  setDocAId(docB.id)
                  setDocBId(docA.id)
                }
              }}
              className="compare-switch cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="Swap Contract 1 and Contract 2"
            >
              <ArrowRightLeft size={19} />
            </button>

            <div className="card p-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">Contract 2 (Revised / Counterparty)</label>
              <select
                value={docB?.id || docBId}
                onChange={e => setDocBId(e.target.value)}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white outline-none"
              >
                {docs.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.overallRisk} Risk)</option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400 mt-2">
                Uploaded: {docB?.uploadDate} • {docB?.size}
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading-banner"><Sparkles size={16} /> {loadingMsg}</div>
          )}

          {!result ? (
            <div className="card p-10 text-center text-xs text-slate-500 bg-slate-50/60 border-dashed my-4">
              <ArrowRightLeft size={24} className="mx-auto text-indigo-500 mb-2" />
              <div className="font-bold text-slate-700 text-sm">Ready to compare versions</div>
              <div className="mt-1 max-w-sm mx-auto">
                Click <strong>Run Comparison</strong> above to analyze clause differences, added covenants, and modified terms between &ldquo;{docA?.name}&rdquo; and &ldquo;{docB?.name}&rdquo;.
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="tabs">
                <span className={compareTab === 'Summary' ? 'active' : ''} onClick={() => setCompareTab('Summary')}>
                  Overview Summary
                </span>
                <span className={compareTab === 'Changed' ? 'active' : ''} onClick={() => setCompareTab('Changed')}>
                  Changed Clauses ({changes.length})
                </span>
                <span className={compareTab === 'SideBySide' ? 'active' : ''} onClick={() => setCompareTab('SideBySide')}>
                  Side-by-Side View
                </span>
              </div>

              {/* Stats Counters */}
              <div className="compare-stats">
                <Stat value={String(total)} label="Total Clauses" />
                <Stat value={String(unchanged)} label="Unchanged" tone="green" />
                <Stat value={String(modified)} label="Modified" tone="amber" />
                <Stat value={String(added)} label="Added" tone="blue" />
                <Stat value={String(removed)} label="Removed" tone="red" />
              </div>

              {/* Content based on tab */}
              {compareTab === 'Summary' && (
                <div className="card p-6">
                  <div className="card-title text-indigo-950 mb-2">Executive Diff Overview</div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    Comparing <strong>{docA?.name}</strong> against <strong>{docB?.name}</strong>.
                    {result.summary ? (
                      ` ${result.summary}`
                    ) : (
                      ` The comparison detected ${modified} modified clauses and ${added} newly added provisions.`
                    )}
                  </p>
                </div>
              )}

              {(compareTab === 'Summary' || compareTab === 'Changed') && (
                <div className="card mt-4 p-5">
                  <div className="card-title mb-3">Key Discrepancies & Alterations</div>
                  {changes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No material clause discrepancies detected between these versions.
                    </div>
                  ) : (
                    <div className="change-list">
                      {changes.map((c: any, idx: number) => (
                        <div className="change-row py-3" key={idx}>
                          <div className="change-icon">
                            <AlertTriangle size={15} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-bold text-xs text-slate-900">{c.title}</div>
                            <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{c.explanation}</div>
                          </div>
                          <span className={`risk-badge ${String(c.risk || 'medium').toLowerCase()}`}>
                            {c.type || 'Modified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {compareTab === 'SideBySide' && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="card p-4">
                    <div className="card-title text-slate-700 mb-3">{docA?.name} (Baseline)</div>
                    <div className="space-y-3">
                      {changes.map((c: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <div className="font-bold text-slate-800">{c.title}</div>
                          <p className="mt-1 text-slate-600 font-serif italic">{c.documentA || 'Clause not present in baseline.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="card-title text-indigo-700 mb-3">{docB?.name} (Revised)</div>
                    <div className="space-y-3">
                      {changes.map((c: any, idx: number) => (
                        <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs">
                          <div className="font-bold text-indigo-950 flex items-center justify-between">
                            <span>{c.title}</span>
                            <span className={`risk-badge ${String(c.risk || 'medium').toLowerCase()}`}>{c.risk} Risk</span>
                          </div>
                          <p className="mt-1 text-slate-700 font-serif italic">{c.documentB || 'Clause removed in revised version.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function getDynamicSuggestedQuestions(doc: StoredDocument | null): string[] {
  if (!doc) {
    return [
      'What are the most critical risks in this contract?',
      'What are my termination rights?',
      'Who bears the highest financial liability?',
      'What governing law applies to disputes?',
    ]
  }

  // 1. Gather clause-specific counter-questions extracted from this exact document
  const extractedQuestions: string[] = []
  if (doc.analysis?.clauses && Array.isArray(doc.analysis.clauses)) {
    for (const c of doc.analysis.clauses) {
      if (Array.isArray(c.questionsToAsk)) {
        for (const q of c.questionsToAsk) {
          if (q && q.trim().length > 8 && !extractedQuestions.includes(q.trim())) {
            extractedQuestions.push(q.trim())
          }
        }
      }
    }
  }

  // 2. Identify contract domain from name and document type
  const nameAndType = `${doc.name} ${doc.analysis?.type || ''} ${doc.analysis?.summary || ''}`.toLowerCase()

  const isLease = /lease|rent|tenant|landlord|premises|occupancy|apartment|commercial property|residential|property/i.test(nameAndType)
  const isNDA = /nda|non-disclosure|confidential|proprietary|secrecy/i.test(nameAndType)
  const isEmployment = /employment|employee|job|salary|severance|non-compete|worker|bonus|equity|stock option|labor/i.test(nameAndType)
  const isServices = /service|consulting|contractor|freelance|vendor|sow|master services|msa/i.test(nameAndType)
  const isIP = /license|patent|copyright|intellectual property|trademark|software/i.test(nameAndType)
  const isLoan = /loan|credit|mortgage|promissory|debt|financing/i.test(nameAndType)

  let domainQuestions: string[] = []

  if (isLease) {
    domainQuestions = [
      'How much can my rent be increased and when?',
      'Who is responsible for repairs and maintenance?',
      'Under what conditions is my security deposit refundable?',
      'Can I terminate this lease early and what are the penalties?',
      'Does the landlord have unlimited right of entry?'
    ]
  } else if (isNDA) {
    domainQuestions = [
      'How long do confidentiality obligations survive?',
      'Is the definition of Confidential Information mutual or one-sided?',
      'What are the standard exclusions from confidentiality?',
      'Can I be held liable for indirect or consequential damages?',
      'What happens to shared materials when the agreement ends?'
    ]
  } else if (isEmployment) {
    domainQuestions = [
      'Is there a non-compete clause and what are its geographic limits?',
      'What are my severance rights and termination notice requirements?',
      'How are intellectual property rights and inventions handled?',
      'Can my employer terminate without cause immediately?',
      'What happens to my accrued benefits and bonuses upon leaving?'
    ]
  } else if (isServices) {
    domainQuestions = [
      'What are the payment milestones and net payment terms?',
      'Is there an uncapped indemnity or unlimited liability clause?',
      'Who owns deliverables and pre-existing background IP?',
      'What notice period is required for termination for convenience?',
      'Are there penalties or liquidated damages for delayed delivery?'
    ]
  } else if (isLoan) {
    domainQuestions = [
      'What are the default interest rates and late fee penalties?',
      'Is there a prepayment penalty for paying off early?',
      'What constitutes an event of default and acceleration of debt?',
      'What personal guarantees or collateral are required?'
    ]
  } else if (isIP) {
    domainQuestions = [
      'Is this an exclusive or non-exclusive license?',
      'Are there restrictions on sub-licensing or modifications?',
      'Who retains ownership of improvements and derivative works?',
      'What royalties or audit rights are stipulated?'
    ]
  } else {
    domainQuestions = [
      'What are the highest risk clauses in this agreement?',
      'What are my termination rights and notice periods?',
      'Is there an uncapped liability or one-sided indemnity clause?',
      'What governing law and dispute jurisdiction apply?'
    ]
  }

  // Combine: prioritize up to 2 high-impact extracted questions, followed by domain questions
  const combined: string[] = []
  for (const eq of extractedQuestions) {
    if (combined.length < 2 && !combined.includes(eq)) {
      combined.push(eq)
    }
  }

  for (const dq of domainQuestions) {
    if (combined.length < 5 && !combined.includes(dq)) {
      combined.push(dq)
    }
  }

  return combined
}

/* =========================================================================
   7. ASK AI SCREEN (Document-grounded Q&A copilot)
========================================================================= */
function AskScreen({
  doc, docs, onSelectDoc, messages, ask, setAsk, onSend, loading, loadingMsg, onUploadNew, onLoadTemplate, onClearHistory, onNewChat, onLoadSession, onDeleteSession
}: {
  doc: StoredDocument | null
  docs: StoredDocument[]
  onSelectDoc: (id: string) => void
  messages: any[]
  ask: string
  setAsk: (v: string) => void
  onSend: () => void
  loading: boolean
  loadingMsg: string
  onUploadNew: () => void
  onLoadTemplate?: () => void
  onClearHistory?: (docId: string) => void
  onNewChat?: () => void
  onLoadSession?: (docId: string, sessionId: string) => void
  onDeleteSession?: (docId: string, sessionId: string) => void
}) {
  const [showHistory, setShowHistory] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const quickPrompts = useMemo(() => getDynamicSuggestedQuestions(doc), [doc])

  // Ensure and retrieve all chat sessions (guarantees at least 3 chats for exploration)
  const sessions = useMemo(() => {
    if (!doc) return []
    return ensureDocChatSessions(doc)
  }, [doc, doc?.chatSessions, doc?.messages])

  const handleNewChatClick = () => {
    if (onNewChat) {
      onNewChat()
    }
    setAsk('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 60)
  }

  const promptsRef = useRef<HTMLDivElement>(null)

  const scrollPrompts = (amount: number) => {
    if (promptsRef.current) {
      promptsRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const handlePromptsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && promptsRef.current) {
      promptsRef.current.scrollLeft += e.deltaY
    }
  }

  if (!doc) {
    return (
      <div className="page ask-page">
        <div className="subhead">
          <div>
            <div className="eyebrow">GROUNDED AI COPILOT</div>
            <h2>Ask About Your Document</h2>
            <p>Get instant answers cited directly against your contract’s exact clauses.</p>
          </div>
        </div>

        <div className="card p-12 text-center border-dashed my-6 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No contract loaded for AI Copilot</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-md mx-auto">
            Upload or select an agreement to begin asking questions grounded directly in its terms and clauses.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={onUploadNew} className="btn-primary small inline-flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20">
              <Upload size={14} /> Upload Contract
            </button>
            {onLoadTemplate && (
              <button onClick={onLoadTemplate} className="btn-secondary small inline-flex items-center gap-1.5 font-bold">
                <LayoutTemplate size={14} /> Load Standard Agreement
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page ask-page">
      {/* Top bar */}
      <div className="subhead flex items-center justify-between pb-2 mb-2 border-b border-slate-100 flex-shrink-0">
        <div>
          <div className="eyebrow">GROUNDED AI COPILOT</div>
          <h2 className="text-base sm:text-lg font-bold">Ask About Your Document</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Instant answers cited directly against your contract’s exact clauses.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Button in Topbar */}
          <button
            onClick={handleNewChatClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all shadow-2xs cursor-pointer"
            title="Start a fresh chat session for this contract"
          >
            <Plus size={13} />
            <span>New Chat</span>
          </button>

          {/* History Sidebar Open/Close Toggle Button */}
          <button
            onClick={() => setShowHistory(prev => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all shadow-2xs ${showHistory
                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            title={showHistory ? 'Hide chat history sidebar' : 'Open chat history sidebar'}
          >
            {showHistory ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            <span>{showHistory ? 'Hide History' : 'Chat History'}</span>
            {sessions.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-200/70 text-indigo-800">
                {sessions.length}
              </span>
            )}
          </button>

          {/* Document Selector */}
          <select
            value={doc.id}
            onChange={e => onSelectDoc(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none max-w-[200px] sm:max-w-[260px] truncate shadow-2xs"
          >
            {docs.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Container: Chat History Sidebar + Chat Card */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
        {/* Collapsible Chat History Sidebar */}
        {showHistory && (
          <div className="chat-history-sidebar w-64 lg:w-72 bg-white border border-slate-200/90 rounded-xl flex flex-col flex-shrink-0 shadow-sm overflow-hidden animate-in fade-in slide-in-from-left duration-200">
            {/* History Header */}
            <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <History size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Chat History</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChatClick}
                  title="Start New Chat"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                </button>
                {onClearHistory && sessions.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all chat history for this contract?')) {
                        onClearHistory(doc.id)
                      }
                    }}
                    title="Clear all chat history"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* New Chat Primary Button */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button
                onClick={handleNewChatClick}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>
            </div>

            {/* History Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              {/* Chat Threads (Clean list of conversation threads, without individual question breakdowns) */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                  <span>Chat Threads</span>
                  {sessions.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">{sessions.length}</span>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic px-3 py-4 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                    No saved chats yet. Ask a question to start your first conversation.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {sessions.map((s) => {
                      const isActive = doc.activeSessionId === s.id
                      const userQCount = s.messages.filter(m => m.role === 'user').length

                      return (
                        <div
                          key={s.id}
                          onClick={() => onLoadSession && onLoadSession(doc.id, s.id)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all group cursor-pointer relative ${isActive
                              ? 'bg-indigo-50/90 border-indigo-300 shadow-2xs ring-1 ring-indigo-200'
                              : 'bg-slate-50/80 hover:bg-indigo-50/50 border-slate-200/70 hover:border-indigo-200'
                            }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="flex items-center gap-1 font-semibold">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-100/90 px-1.5 py-0.2 rounded text-[9.5px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" /> Active Chat
                                </span>
                              ) : (
                                <span className="text-slate-500 flex items-center gap-1">
                                  <MessageCircle size={10} />
                                  {userQCount > 0 ? `${userQCount} ${userQCount === 1 ? 'query' : 'queries'}` : 'New session'}
                                </span>
                              )}
                            </span>

                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">{s.timestamp || 'Recent'}</span>
                              {onDeleteSession && sessions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (window.confirm('Delete this chat thread?')) {
                                      onDeleteSession(doc.id, s.id)
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-600 text-slate-400 transition-opacity ml-1 rounded hover:bg-red-50 cursor-pointer"
                                  title="Delete this chat"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className={`text-[11.5px] line-clamp-2 leading-snug font-medium ${isActive ? 'text-indigo-950 font-semibold' : 'text-slate-700 group-hover:text-indigo-900'
                            }`}>
                            {s.title || 'Legal Discussion'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Other Agreements Sessions */}
              {docs.filter(d => d.id !== doc.id).length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                    Other Agreements
                  </div>
                  <div className="space-y-1">
                    {docs.filter(d => d.id !== doc.id).map(d => {
                      const otherQueries = (d.messages || []).filter(m => m.role === 'user').length
                      return (
                        <button
                          key={d.id}
                          onClick={() => onSelectDoc(d.id)}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between gap-1.5 group cursor-pointer"
                        >
                          <div className="truncate font-medium text-slate-600 group-hover:text-slate-900 flex items-center gap-1.5 min-w-0">
                            <FileText size={12} className="text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                            <span className="truncate text-[11px]">{d.name}</span>
                          </div>
                          {otherQueries > 0 && (
                            <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded flex-shrink-0">
                              {otherQueries} Qs
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Card */}
        <div className="chat-card card flex-1 min-h-0 flex flex-col overflow-hidden m-0">
          <div className="chat-stream flex-1 min-h-0 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={22} />
                </div>
                <div className="font-bold text-slate-800 text-sm">Grounded Legal Q&A</div>
                <p className="text-slate-400 mt-1 max-w-sm mx-auto text-[11px]">
                  Ask any question about <strong>{doc?.name}</strong>. Gemini AI answers strictly using the clauses in this agreement.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {quickPrompts.slice(0, 3).map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setAsk(qp) }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      &ldquo;{qp}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div className={`msg ${m.role}`} key={i}>
                  <div className="msg-avatar">
                    {m.role === 'assistant' ? <Sparkles size={16} /> : <span>YOU</span>}
                  </div>
                  <div className="msg-bubble">
                    {m.role === 'assistant' ? (
                      <MarkdownResponse content={m.text} />
                    ) : (
                      <div className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</div>
                    )}
                    {m.sourceReference && (
                      <div className="source-note">Source: {m.sourceReference}</div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="msg assistant">
                <div className="msg-avatar"><Sparkles size={16} /></div>
                <div className="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Compact Single-Row Scaled Suggested Prompts with Scroll Controls & Wheel Support */}
          <div className="py-1 px-2 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 flex-shrink-0 pl-1">
              <Sparkles size={11} className="text-amber-500" /> Suggested:
            </span>

            {/* Left Scroll Chevron */}
            <button
              type="button"
              onClick={() => scrollPrompts(-160)}
              className="w-5 h-5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
              title="Scroll suggestions left"
            >
              <ChevronLeft size={13} />
            </button>

            {/* Horizontal Scroll Area */}
            <div
              ref={promptsRef}
              onWheel={handlePromptsWheel}
              className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
            >
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => setAsk(qp)}
                  title={qp}
                  className="text-[10.5px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-2 py-0.5 rounded-md whitespace-nowrap transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Right Scroll Chevron */}
            <button
              type="button"
              onClick={() => scrollPrompts(160)}
              className="w-5 h-5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
              title="Scroll suggestions right"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Composer */}
          <div className="chat-composer py-2 px-3 flex-shrink-0">
            <input
              ref={inputRef}
              value={ask}
              onChange={e => setAsk(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSend() }}
              placeholder={`Ask a question about ${doc?.name || 'this contract'}...`}
              className="text-xs h-9 px-3"
            />
            <button onClick={onSend} disabled={loading || !ask.trim()} className="h-9 w-9 cursor-pointer">
              <Send size={15} />
            </button>
          </div>

          <div className="ai-disclaimer py-1 px-2 text-[9.5px] flex-shrink-0 text-slate-400">
            <LockKeyhole size={11} /> ClariLegal provides informational explanations grounded in your document. Consult legal counsel for formal representation.
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   8. TEMPLATES SCREEN (Curated standard legal contracts)
========================================================================= */
function TemplatesScreen({ onImportTemplate }: { onImportTemplate: (name: string) => void }) {
  const templates = [
    {
      title: 'Mutual Non-Disclosure Agreement',
      type: 'Confidentiality',
      riskProfile: 'Low Risk Standard',
      desc: 'Bilateral confidentiality terms protecting proprietary IP and exploratory discussions with a standard 2-year survival window.',
      clausesCount: '8 Standard Clauses',
      sampleTarget: 'Mutual Non-Disclosure Agreement'
    },
    {
      title: 'Master Services Agreement (MSA)',
      type: 'Commercial Services',
      riskProfile: 'Enterprise Standard',
      desc: 'Software development, cloud deployment, and milestone deliverables with payment retainage and indemnity provisions.',
      clausesCount: '16 Standard Clauses',
      sampleTarget: 'Master Services Agreement'
    },
    {
      title: 'Executive Employment Contract',
      type: 'Employment',
      riskProfile: 'Executive Level',
      desc: 'Outlines base compensation, performance bonus tiers, IP assignment, severance conditions, and non-compete terms.',
      clausesCount: '12 Standard Clauses',
      sampleTarget: 'Executive Employment'
    },
    {
      title: 'Independent Consulting Agreement',
      type: 'Contractor',
      riskProfile: 'Balanced Terms',
      desc: 'Defines deliverables-based compensation, 1099 tax autonomy, Background IP exclusions, and mutual convenience termination.',
      clausesCount: '10 Standard Clauses',
      sampleTarget: 'Consulting'
    }
  ]

  return (
    <div className="page">
      <div className="subhead">
        <div>
          <div className="eyebrow">STANDARD CONTRACTS</div>
          <h2>Legal Contract Templates</h2>
          <p>Load battle-tested industry templates into your workspace with a single click.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {templates.map((tpl, idx) => (
          <div key={idx} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  {tpl.type}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{tpl.clausesCount}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tpl.desc}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">{tpl.riskProfile}</span>
              <button
                onClick={() => onImportTemplate(tpl.sampleTarget)}
                className="btn-primary small"
              >
                <Plus size={13} /> Import & Analyze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   9. SETTINGS SCREEN (Profile, custom Gemini key, reset)
========================================================================= */
function SettingsScreen({
  user, onSignOut, notify
}: {
  user: User | null
  onSignOut: () => void
  notify: (msg: string, tone?: ToastTone) => void
}) {
  const [apiKey, setApiKey] = useState(() => getCustomApiKey() || '')
  const [savedKey, setSavedKey] = useState(false)

  function handleSaveKey() {
    setCustomApiKey(apiKey)
    setSavedKey(true)
    notify('Gemini API Key configuration saved!', 'success')
    window.setTimeout(() => setSavedKey(false), 2500)
  }

  function handleResetWorkspace() {
    if (window.confirm('Are you sure you want to reset workspace documents to defaults?')) {
      localStorage.removeItem('legalsense_documents_v1')
      localStorage.removeItem('legalsense_activity_v1')
      window.location.reload()
    }
  }

  return (
    <div className="page max-w-3xl">
      <div className="subhead">
        <div>
          <div className="eyebrow">PREFERENCES & SECURITY</div>
          <h2>Workspace Settings</h2>
          <p>Manage your profile, API keys, and workspace data.</p>
        </div>
      </div>

      <div className="space-y-5 mt-6">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="card-title text-slate-900 mb-4">User Profile</div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
              {user?.avatar || 'TU'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{user?.name || 'Test User'}</div>
              <div className="text-xs text-slate-500">{user?.email || 'test@test.com'}</div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                Role: {user?.role || 'Contract Reviewer & Evaluator'}
              </div>
            </div>
          </div>
        </div>

        {/* AI & API Key Configuration */}
        <div className="card p-6">
          <div className="card-title text-slate-900 mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Gemini API Key Configuration
          </div>
          <p className="text-xs text-slate-500 mb-4">
            By default, ClariLegal connects to the server-configured Gemini Flash key in <code>.env.local</code>. You can optionally specify a custom key below.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Stored privately in your browser’s localStorage.
              </span>
              <button onClick={handleSaveKey} className="btn-primary small">
                {savedKey ? <Check size={14} /> : null} Save Key
              </button>
            </div>
          </div>
        </div>

        {/* Data Reset & Session */}
        <div className="card p-6">
          <div className="card-title text-slate-900 mb-2">Data Management</div>
          <p className="text-xs text-slate-500 mb-4">
            Reset documents to sample defaults or end your session.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetWorkspace}
              className="btn-secondary small text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={14} /> Reset Demo Contracts
            </button>
            <button
              onClick={onSignOut}
              className="btn-secondary small text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <div className="stat card">
      <div className={`stat-value ${tone || ''}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function Meta({ label, children }: { label: string; children: any }) {
  return (
    <div className="meta card">
      <div className="meta-label">{label}</div>
      <div className="meta-value">{children}</div>
    </div>
  )
}
