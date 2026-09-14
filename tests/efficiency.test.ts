import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getUserDocuments,
  saveDocument,
  deleteDocument,
  invalidateDocsCache,
  createTemplateDocument
} from '../src/lib/storage'
import { analyzeDocument, askGemini } from '../src/lib/api'

describe('Efficiency & Resource Utilization Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    invalidateDocsCache()
    vi.restoreAllMocks()
  })

  it('memoizes getUserDocuments and eliminates redundant JSON.parse calls', () => {
    const doc = createTemplateDocument('Mutual Non-Disclosure Agreement')
    doc.id = 'doc_efficiency_01'
    doc.name = 'Efficiency_NDA.pdf'

    saveDocument(doc)

    const parseSpy = vi.spyOn(JSON, 'parse')

    // First call may parse or utilize the in-memory cache
    const firstCall = getUserDocuments()
    expect(firstCall.length).toBeGreaterThanOrEqual(1)

    const initialParseCount = parseSpy.mock.calls.length

    // Subsequent calls with unchanged raw storage should hit memory pointer cache
    const secondCall = getUserDocuments()
    const thirdCall = getUserDocuments()

    expect(secondCall).toBe(firstCall) // Exact memory reference identity
    expect(thirdCall).toBe(firstCall)
    expect(parseSpy.mock.calls.length).toBe(initialParseCount) // Zero additional JSON.parse overhead
  })

  it('invalidates and updates storage cache on mutation without leaking stale references', () => {
    const doc1 = createTemplateDocument('Mutual Non-Disclosure Agreement')
    doc1.id = 'doc_101'
    doc1.name = 'Contract_A.pdf'

    saveDocument(doc1)
    const initialDocs = getUserDocuments()
    expect(initialDocs.some(d => d.id === 'doc_101')).toBe(true)

    // Save a new document
    const doc2 = createTemplateDocument('Executive Employment Agreement')
    doc2.id = 'doc_102'
    doc2.name = 'Contract_B.pdf'

    saveDocument(doc2)
    const updatedDocs = getUserDocuments()
    expect(updatedDocs.length).toBe(initialDocs.length + 1)
    expect(updatedDocs.some(d => d.id === 'doc_102')).toBe(true)

    // Delete document
    deleteDocument('doc_101')
    const remainingDocs = getUserDocuments()
    expect(remainingDocs.some(d => d.id === 'doc_101')).toBe(false)
  })

  it('serves repeated askGemini requests from the in-memory response cache', async () => {
    let networkFetchCount = 0
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      networkFetchCount++
      return {
        ok: true,
        json: async () => ({
          ok: true,
          text: 'The indemnity clause caps damages at fees paid in past 12 months.',
          interactionId: 'gen_cache_001',
          model: 'gemini-3.5-flash-lite'
        })
      } as any
    })

    const question = 'What is the liability cap under this agreement?'
    const context = 'Clause 12: Total liability shall not exceed fees paid.'

    // First call - triggers network request
    const response1 = await askGemini(question, context)
    expect(response1.ok).toBe(true)
    expect(response1.text).toContain('indemnity clause')
    expect(networkFetchCount).toBe(1)

    // Second call with identical arguments - served from memory cache in < 1ms
    const response2 = await askGemini(question, context)
    expect(response2.ok).toBe(true)
    expect(response2.text).toEqual(response1.text)
    expect(networkFetchCount).toBe(1) // No duplicate network request!
  })

  it('caches analyzeDocument results and prevents duplicate processing for identical files', async () => {
    let networkFetchCount = 0
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      networkFetchCount++
      return {
        ok: true,
        json: async () => ({
          ok: true,
          text: JSON.stringify({
            summary: 'Cached analysis output',
            clauses: [],
            overallRisk: 'Low'
          })
        })
      } as any
    })

    const fileContent = 'THIS IS AN AGREEMENT between Party A and Party B.'
    const file = new File([fileContent], 'NDA_Test.txt', { type: 'text/plain' })

    const result1 = await analyzeDocument(file, 'analyze')
    expect(result1.ok).toBe(true)
    expect(networkFetchCount).toBe(1)

    // Repeat analyze call for the exact same file
    const result2 = await analyzeDocument(file, 'analyze')
    expect(result2.ok).toBe(true)
    expect(networkFetchCount).toBe(1) // Saved!
  })
})
