export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface ClauseItem {
  id: string
  section: string
  title: string
  quote: string
  plainEnglish: string
  whyItMatters: string
  whoIsAffected: {
    partyA: string
    partyB: string
  }
  questionsToAsk: string[]
  risk: RiskLevel
  page: number
}

export interface ContractOption {
  option: string
  impact: string
  effort: 'Low' | 'Medium' | 'High'
  recommendation?: string
}

export interface ChecklistItem {
  id: string
  task: string
  phase: 'Pre-Signing' | 'Execution' | 'Post-Signing'
  priority: 'High' | 'Medium' | 'Low'
  completed?: boolean
}

export interface AnalysisData {
  overallRisk: RiskLevel
  summary: string
  parties: string[]
  type: string
  effective: string
  duration: string
  takeaways: string[]
  risks: [string, RiskLevel][]
  clauses: ClauseItem[]
  inconsistencies?: string[]
  optionsAndNextSteps?: ContractOption[]
  actionChecklist?: ChecklistItem[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  sourceReference?: string
}

export interface ChatSession {
  id: string
  title: string
  timestamp: string
  messages: ChatMessage[]
}

export interface StoredDocument {
  id: string
  name: string
  uploadDate: string
  size: string
  fileType: string
  pageCount: number
  overallRisk: RiskLevel
  analysis: AnalysisData
  messages: ChatMessage[]
  chatSessions?: ChatSession[]
  activeSessionId?: string
  rawText?: string
  fileDataUrl?: string
}

export interface ActivityItem {
  id: string
  type: 'analyze' | 'compare' | 'chat' | 'delete' | 'export' | 'sample'
  title: string
  time: string
  timestamp: number
}

export interface CompareDifference {
  title: string
  type: 'Modified' | 'Added' | 'Removed' | 'Unchanged'
  risk: RiskLevel
  documentA: string
  documentB: string
  explanation: string
}

export interface CompareResult {
  total: number
  unchanged: number
  modified: number
  added: number
  removed: number
  summary?: string
  changedClauses: CompareDifference[]
}
