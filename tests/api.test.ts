import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCustomApiKey,
  setCustomApiKey,
  fileToBase64,
  clientSideAnalysisFallback,
  analyzeDocument,
  askGemini,
  compareDocuments,
} from '../src/lib/api'

describe('API Client & Key Management', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('validates and stores a valid custom API key', () => {
    const validKey = 'AIzaSyC2MFhL7dXETrAjJaOW4TMpuo47omvBMcY'
    const success = setCustomApiKey(validKey)
    expect(success).toBe(true)
    expect(getCustomApiKey()).toBe(validKey)
  })

  it('rejects invalid or suspicious API key formats', () => {
    const invalidKey = '<script>alert(1)</script>'
    const success = setCustomApiKey(invalidKey)
    expect(success).toBe(false)
    expect(getCustomApiKey()).toBeNull()
  })

  it('clears API key when setting an empty string', () => {
    setCustomApiKey('AIzaSyC2MFhL7dXETrAjJaOW4TMpuo47omvBMcY')
    expect(getCustomApiKey()).not.toBeNull()
    setCustomApiKey('   ')
    expect(getCustomApiKey()).toBeNull()
  })

  it('fileToBase64 throws error when file exceeds 4MB cap', async () => {
    const largeFile = new File(['a'.repeat(4_500_000)], 'large.pdf', { type: 'application/pdf' })
    await expect(fileToBase64(largeFile)).rejects.toThrow('File exceeds upload limit')
  })

  it('clientSideAnalysisFallback returns complete structured intelligence for analyze mode', () => {
    const result = clientSideAnalysisFallback('Test_NDA.pdf', 'analyze')
    expect(result.ok).toBe(true)
    expect(result.model).toBeDefined()
    const parsed = JSON.parse(result.text)
    expect(parsed.summary).toBeDefined()
    expect(parsed.overallRisk).toMatch(/Low|Medium|High/)
    expect(parsed.parties).toBeInstanceOf(Array)
    expect(parsed.keyTakeaways.length).toBeGreaterThan(0)
    expect(parsed.keyClauses.length).toBeGreaterThan(0)
    expect(parsed.optionsAndNextSteps).toBeInstanceOf(Array)
    expect(parsed.actionChecklist).toBeInstanceOf(Array)
  })

  it('clientSideAnalysisFallback returns redline diff comparison for compare mode', () => {
    const result = clientSideAnalysisFallback('ContractA vs ContractB', 'compare')
    expect(result.ok).toBe(true)
    const parsed = JSON.parse(result.text)
    expect(parsed.total).toBeGreaterThan(0)
    expect(parsed.changedClauses).toBeInstanceOf(Array)
    expect(parsed.changedClauses[0].type).toMatch(/Modified|Added|Removed/)
  })

  it('askGemini handles network degradation gracefully with grounded fallback', async () => {
    // Mock fetch to simulate network error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'))
    const response = await askGemini('What is the liability cap?', 'Context: Section 14.1')
    expect(response.ok).toBe(true)
    expect(response.text).toContain('liability')
    expect(response.interactionId).toBeDefined()
  })
})
