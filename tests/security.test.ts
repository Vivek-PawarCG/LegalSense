import { describe, it, expect } from 'vitest'
import { sanitizeApiKey } from '../api/gemini'
import vercelConfig from '../vercel.json'

describe('Security & Vulnerability Defenses', () => {
  describe('API Key Sanitization & Injection Defense', () => {
    it('accepts legitimate alphanumeric API keys', () => {
      const valid = 'AIzaSyC2MFhL7dXETrAjJaOW4TMpuo47omvBMcY'
      expect(sanitizeApiKey(valid)).toBe(valid)
    })

    it('sanitizes and rejects keys with shell injection characters', () => {
      const malicious = 'AIzaSy; rm -rf /; echo hack'
      expect(sanitizeApiKey(malicious)).toBeNull()
    })

    it('rejects keys containing HTML or script tags', () => {
      const malicious = '<script>alert("xss")</script>'
      expect(sanitizeApiKey(malicious)).toBeNull()
    })

    it('rejects keys that are too short or empty', () => {
      expect(sanitizeApiKey('')).toBeNull()
      expect(sanitizeApiKey('abc')).toBeNull()
      expect(sanitizeApiKey(undefined)).toBeNull()
    })
  })

  describe('HTTP Security Headers Configuration (vercel.json)', () => {
    it('configures strict Content-Security-Policy', () => {
      const headers = vercelConfig.headers[0].headers
      const csp = headers.find(h => h.key === 'Content-Security-Policy')
      expect(csp).toBeDefined()
      expect(csp?.value).toContain("default-src 'self'")
    })

    it('enforces X-Content-Type-Options: nosniff to prevent MIME confusion', () => {
      const headers = vercelConfig.headers[0].headers
      const nosniff = headers.find(h => h.key === 'X-Content-Type-Options')
      expect(nosniff?.value).toBe('nosniff')
    })

    it('enforces X-Frame-Options: DENY to prevent clickjacking', () => {
      const headers = vercelConfig.headers[0].headers
      const frame = headers.find(h => h.key === 'X-Frame-Options')
      expect(frame?.value).toBe('DENY')
    })

    it('enforces Strict-Transport-Security (HSTS) with preload', () => {
      const headers = vercelConfig.headers[0].headers
      const hsts = headers.find(h => h.key === 'Strict-Transport-Security')
      expect(hsts?.value).toContain('max-age=63072000')
      expect(hsts?.value).toContain('includeSubDomains')
    })

    it('configures restrictive Permissions-Policy', () => {
      const headers = vercelConfig.headers[0].headers
      const perm = headers.find(h => h.key === 'Permissions-Policy')
      expect(perm?.value).toContain('camera=()')
      expect(perm?.value).toContain('microphone=()')
    })
  })
})
