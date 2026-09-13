import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runGeminiContent } from './gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { message, context, customApiKey } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    if (!message) return res.status(400).json({ error: 'message is required' })

    const prompt = `You are LegalSense, an expert AI legal assistant. Answer the user's question clearly, concisely, and in plain English.
Ground your response strictly in the document context provided below. If the context does not contain enough information to answer, state so honestly.
Always cite the specific section or clause if identifiable. Remind the user that this is legal information, not definitive legal representation.

DOCUMENT CONTEXT:
${context || 'No specific document context provided.'}

USER QUESTION:
${message}`

    const result = await runGeminiContent([{ text: prompt }], customApiKey)
    res.status(200).json({
      ok: true,
      text: result.output_text,
      interactionId: result.id,
      model: result.model,
    })
  } catch (error: any) {
    console.error('API Chat Error:', error)
    res.status(500).json({ error: error?.message || 'Gemini chat failed.' })
  }
}
