import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runGeminiContent } from './gemini.js'

const maxBytes = 4 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { mode = 'analyze', fileName, mimeType = 'application/pdf', data, dataA, dataB, mimeTypeA = 'application/pdf', mimeTypeB = 'application/pdf', prompt, customApiKey } = body
    if (!data && !dataA && !prompt) return res.status(400).json({ error: 'Document data or prompt is required.' })
    if ((data && Buffer.byteLength(data, 'base64') > maxBytes) || (dataA && Buffer.byteLength(dataA, 'base64') > maxBytes) || (dataB && Buffer.byteLength(dataB, 'base64') > maxBytes)) {
      return res.status(413).json({ error: 'File is too large. Please keep uploads under 4 MB for this path.' })
    }

    const system = `You are LegalSense, an elite AI legal-information assistant. You analyze contracts and explain complex legal terms in plain English.
Never invent clauses, citations, dates, parties, or obligations. Base analysis strictly on the supplied document.
Always respond in strictly valid JSON without codeblocks or enclosing formatting where requested. For risks, use only "Low", "Medium", or "High".`

    const modePrompt = mode === 'clause'
      ? `Explain the selected legal clause in plain English. Return JSON with:
{
  "title": "...",
  "plainEnglish": "...",
  "whyItMatters": "...",
  "whoIsAffected": { "partyA": "...", "partyB": "..." },
  "questionsToAsk": ["...", "..."],
  "risk": "Low"|"Medium"|"High",
  "sourceReference": "Section X.X (Page Y)"
}`
      : mode === 'compare'
        ? `Compare the two supplied documents. Identify modified, added, and removed clauses. Return JSON with:
{
  "total": 12,
  "unchanged": 8,
  "modified": 3,
  "added": 1,
  "removed": 0,
  "changedClauses": [
    { "title": "...", "type": "Modified"|"Added"|"Removed", "risk": "Low"|"Medium"|"High", "documentA": "...", "documentB": "...", "explanation": "..." }
  ]
}`
        : `Analyze this legal document thoroughly and return valid JSON with:
{
  "summary": "Detailed 2-3 paragraph plain-English executive summary...",
  "overallRisk": "Low"|"Medium"|"High",
  "parties": ["Party 1 name and role", "Party 2 name and role"],
  "documentType": "e.g. Non-Disclosure Agreement / Master Services Agreement",
  "effectiveDate": "e.g. 1 Oct 2026",
  "duration": "e.g. 24 Months",
  "keyTakeaways": ["Key bullet 1", "Key bullet 2", "Key bullet 3", "Key bullet 4"],
  "risks": [
    { "category": "Indemnification", "level": "High", "detail": "..." },
    { "category": "Termination", "level": "Medium", "detail": "..." }
  ],
  "keyClauses": [
    {
      "id": "c1",
      "section": "8.2",
      "title": "...",
      "quote": "Exact contract excerpt...",
      "plainEnglish": "Simple explanation...",
      "whyItMatters": "Why this matters to the user...",
      "whoIsAffected": { "partyA": "Impact on Party A", "partyB": "Impact on Party B" },
      "questionsToAsk": ["Question 1", "Question 2"],
      "risk": "High",
      "page": 1
    }
  ]
}`

    const parts: any[] = [
      { text: `${system}\n\n${modePrompt}\n\n${prompt || ''}` }
    ]

    if (mode === 'compare') {
      if (dataA) parts.push({ text: 'DOCUMENT A:' }, { inlineData: { data: dataA, mimeType: mimeTypeA } })
      if (dataB) parts.push({ text: 'DOCUMENT B:' }, { inlineData: { data: dataB, mimeType: mimeTypeB } })
    } else if (data) {
      parts.push({ inlineData: { data, mimeType } })
    }

    const result = await runGeminiContent(parts, customApiKey)
    res.status(200).json({
      ok: true,
      mode,
      fileName,
      model: result.model,
      interactionId: result.id,
      text: result.output_text,
    })
  } catch (error: any) {
    console.error('API Analyze Error:', error)
    res.status(500).json({ error: error?.message || 'Gemini analysis failed.' })
  }
}
