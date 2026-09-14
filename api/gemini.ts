import { GoogleGenAI } from '@google/genai'

export const defaultModelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

const API_KEY_REGEX = /^[A-Za-z0-9_\-]{20,100}$/

export function sanitizeApiKey(key?: string): string | null {
  if (!key || typeof key !== 'string') return null
  const trimmed = key.trim()
  if (!API_KEY_REGEX.test(trimmed)) return null
  return trimmed
}

export function aiClient(customKey?: string) {
  const safeCustomKey = sanitizeApiKey(customKey)
  const apiKey = safeCustomKey || process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

export async function runGeminiContent(contents: any, customKey?: string, modelOverride?: string) {
  const ai = aiClient(customKey)
  if (!ai) {
    throw new Error('AI analysis service is currently unconfigured. Please provide a valid Gemini API key.')
  }

  const sanitizedModelOverride = typeof modelOverride === 'string' && /^[a-z0-9\.\-]+$/.test(modelOverride)
    ? modelOverride
    : undefined

  const candidateModels = [
    sanitizedModelOverride || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ]

  let lastErrorMessage = 'AI model invocation failed.'
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      })
      const outputText = response.text || ''
      return {
        id: `gen_${Date.now()}`,
        model,
        output_text: outputText,
      }
    } catch (err: any) {
      lastErrorMessage = err?.message || 'Model execution error'
      // Mask any API key that might accidentally appear in error message
      const maskedError = lastErrorMessage.replace(/[A-Za-z0-9_\-]{30,}/g, '[REDACTED_TOKEN]')
      console.warn(`Attempt with model ${model} failed, trying next fallback: ${maskedError}`)
    }
  }

  throw new Error(`All Gemini candidate models failed to respond: ${lastErrorMessage.replace(/[A-Za-z0-9_\-]{30,}/g, '[REDACTED_TOKEN]')}`)
}
