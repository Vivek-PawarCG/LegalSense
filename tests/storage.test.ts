import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  appendDocMessage,
  createTemplateDocument,
  createSampleComparePair,
  toggleChecklistItem,
  generateAttorneyBriefing,
  getDashboardMetrics,
  logActivity,
  getUserActivity,
} from '../src/lib/storage'

describe('Local Document Store & Intelligence Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates comprehensive template document for Mutual NDA with checklists', () => {
    const doc = createTemplateDocument('Mutual Non-Disclosure Agreement')
    expect(doc.name).toContain('Mutual_Non_Disclosure')
    expect(doc.overallRisk).toBe('Low')
    expect(doc.analysis.clauses.length).toBeGreaterThan(0)
    expect(doc.analysis.actionChecklist?.length).toBeGreaterThan(0)
    expect(doc.analysis.optionsAndNextSteps?.length).toBeGreaterThan(0)
  })

  it('creates high-risk template for Executive Employment with non-compete and IP covenants', () => {
    const doc = createTemplateDocument('Executive Employment Agreement')
    expect(doc.name).toContain('Executive_Employment')
    expect(doc.overallRisk).toBe('High')
    expect(doc.analysis.inconsistencies?.length).toBeGreaterThan(0)
  })

  it('saves, retrieves, and deletes documents in local storage', () => {
    const doc = createTemplateDocument('Master Services Agreement')
    saveDocument(doc)
    const stored = getUserDocuments()
    expect(stored.length).toBe(1)
    expect(stored[0].id).toBe(doc.id)

    const retrieved = getDocumentById(doc.id)
    expect(retrieved?.name).toBe(doc.name)

    const remaining = deleteDocument(doc.id)
    expect(remaining.length).toBe(0)
    expect(getDocumentById(doc.id)).toBeNull()
  })

  it('toggles checklist items accurately and saves updated state', () => {
    const doc = createTemplateDocument('Master Services Agreement')
    saveDocument(doc)
    const checklistId = doc.analysis.actionChecklist![0].id

    const updated1 = toggleChecklistItem(doc.id, checklistId)
    expect(updated1?.analysis.actionChecklist?.find(c => c.id === checklistId)?.completed).toBe(true)

    const updated2 = toggleChecklistItem(doc.id, checklistId)
    expect(updated2?.analysis.actionChecklist?.find(c => c.id === checklistId)?.completed).toBe(false)
  })

  it('generates a formatted attorney briefing packet with legal disclaimer', () => {
    const doc = createTemplateDocument('Executive Employment Agreement')
    const briefing = generateAttorneyBriefing(doc)
    expect(briefing).toContain('Attorney Consultation Briefing Packet')
    expect(briefing).toContain('Ethical & Legal Notice')
    expect(briefing).toContain('Executive Summary')
    expect(briefing).toContain('Prioritized Questions to Ask Your Attorney')
    expect(briefing).toContain('does not constitute formal legal representation')
  })

  it('computes accurate dashboard risk metrics and time saved', () => {
    const doc1 = createTemplateDocument('Mutual Non-Disclosure Agreement') // Low
    const doc2 = createTemplateDocument('Executive Employment Agreement') // High
    const metrics = getDashboardMetrics([doc1, doc2])

    expect(metrics.totalDocs).toBe(2)
    expect(metrics.highRiskCount).toBe(1)
    expect(metrics.lowRiskCount).toBe(1)
    expect(metrics.timeSavedHours).toBe(5) // 2 * 2.5
    expect(metrics.totalClauses).toBeGreaterThan(0)
  })

  it('creates sample comparison pair for baseline vs counterparty redline', () => {
    const [docA, docB] = createSampleComparePair()
    expect(docA.name).toContain('Baseline')
    expect(docB.name).toContain('Redline')
    expect(docA.overallRisk).toBe('Low')
    expect(docB.overallRisk).toBe('High')
  })

  it('logs user activity with timestamps', () => {
    logActivity('analyze', 'Audited Commercial Lease')
    const activities = getUserActivity()
    expect(activities.length).toBeGreaterThan(0)
    expect(activities[0].title).toContain('Audited Commercial Lease')
  })
})
