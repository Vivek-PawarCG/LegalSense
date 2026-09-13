import { GoogleGenAI } from '@google/genai'

export const defaultModelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

export function aiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

export async function runGeminiContent(contents: any, customKey?: string, modelOverride?: string) {
  const ai = aiClient(customKey)
  if (!ai) throw new Error('GEMINI_API_KEY is not configured')

  const candidateModels = [
    modelOverride || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ]

  let lastError: any = null
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
      lastError = err
      console.warn(`Attempt with model ${model} failed, trying next fallback...`, err?.message || err)
    }
  }

  throw lastError || new Error('All Gemini model invocations failed.')
}
