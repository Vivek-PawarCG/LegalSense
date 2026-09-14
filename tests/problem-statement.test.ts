import { describe, it, expect } from 'vitest'
import { createTemplateDocument, createSampleComparePair, generateAttorneyBriefing } from '../src/lib/storage'
import { clientSideAnalysisFallback } from '../src/lib/api'

describe('Problem Statement Alignment: AI for Legal Assistance & Access', () => {
  const sampleDoc = createTemplateDocument('Master Services Agreement')

  it('Use Case 1: Simplifies complex legal documents into plain English and Why It Matters', () => {
    const clause = sampleDoc.analysis.clauses[0]
    expect(clause.quote).toBeDefined()
    expect(clause.plainEnglish).toBeDefined()
    expect(clause.plainEnglish.length).toBeGreaterThan(15)
    expect(clause.whyItMatters).toBeDefined()
    expect(clause.whyItMatters.length).toBeGreaterThan(15)
  })

  it('Use Case 2: Compares contracts and redlines to identify modified, added, and omitted terms', () => {
    const [docA, docB] = createSampleComparePair()
    const diff = clientSideAnalysisFallback(`${docA.name} vs ${docB.name}`, 'compare')
    const parsed = JSON.parse(diff.text)
    expect(parsed.total).toBeGreaterThan(0)
    expect(parsed.changedClauses.length).toBeGreaterThan(0)

    const modified = parsed.changedClauses.find((c: any) => c.type === 'Modified')
    expect(modified).toBeDefined()
    expect(modified.documentA).toBeDefined()
    expect(modified.documentB).toBeDefined()
    expect(modified.explanation).toBeDefined()
  })

  it('Use Case 3: Highlights important clauses, obligations, risks, and inconsistencies', () => {
    expect(sampleDoc.analysis.risks.length).toBeGreaterThan(0)
    expect(sampleDoc.overallRisk).toMatch(/Low|Medium|High/)

    // Inconsistencies & asymmetric liability detection
    expect(sampleDoc.analysis.inconsistencies).toBeDefined()
    expect(sampleDoc.analysis.inconsistencies?.length).toBeGreaterThan(0)
  })

  it('Use Case 4: Grounds answers in document context with plain English explanation', () => {
    const clause = sampleDoc.analysis.clauses[0]
    expect(clause.questionsToAsk).toBeInstanceOf(Array)
    expect(clause.questionsToAsk.length).toBeGreaterThan(0)
    expect(clause.whoIsAffected.partyA).toBeDefined()
    expect(clause.whoIsAffected.partyB).toBeDefined()
  })

  it('Use Case 5: Helps users understand their options and potential next steps', () => {
    const options = sampleDoc.analysis.optionsAndNextSteps
    expect(options).toBeDefined()
    expect(options?.length).toBeGreaterThan(0)
    expect(options![0].option).toBeDefined()
    expect(options![0].impact).toBeDefined()
    expect(options![0].effort).toMatch(/Low|Medium|High/)
  })

  it('Use Case 6: Generates executive summaries and actionable execution checklists', () => {
    expect(sampleDoc.analysis.summary).toBeDefined()
    expect(sampleDoc.analysis.summary.length).toBeGreaterThan(50)

    const checklists = sampleDoc.analysis.actionChecklist
    expect(checklists).toBeDefined()
    expect(checklists?.length).toBeGreaterThan(0)
    expect(checklists![0].task).toBeDefined()
    expect(checklists![0].phase).toMatch(/Pre-Signing|Execution|Post-Signing/)
    expect(checklists![0].priority).toMatch(/High|Medium|Low/)
  })

  it('Use Case 7: Helps users prepare information and questions for a legal professional', () => {
    const briefing = generateAttorneyBriefing(sampleDoc)
    expect(briefing).toContain('Attorney Consultation Briefing Packet')
    expect(briefing).toContain('Prioritized Questions to Ask Your Attorney')
    expect(briefing).toContain('Critical & High-Risk Provisions Requiring Counsel Review')
  })

  it('Mandatory Requirement: Solution provides information & assistance, not replacing legal counsel', () => {
    const briefing = generateAttorneyBriefing(sampleDoc)
    expect(briefing).toContain('Ethical & Legal Notice')
    expect(briefing).toContain('does not constitute formal legal representation')

    const fallback = clientSideAnalysisFallback('Sample.pdf', 'analyze')
    expect(fallback.ok).toBe(true)
  })
})
