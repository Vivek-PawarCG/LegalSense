import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ActionPlanView } from '../src/components/views/ActionPlanView'
import { AttorneyPacketView } from '../src/components/views/AttorneyPacketView'
import { AuthModal } from '../src/components/AuthModal'
import { createTemplateDocument } from '../src/lib/storage'

describe('Accessibility (a11y) & Usable Design', () => {
  const doc = createTemplateDocument('Master Services Agreement')

  it('ActionPlanView renders accessible landmarks and interactive checkboxes', () => {
    render(
      <ActionPlanView
        doc={doc}
        onDocUpdated={() => {}}
      />
    )

    // Check region landmark
    const region = screen.getByRole('region', { name: /Action Plan and Legal Checklists/i })
    expect(region).toBeDefined()

    // Check progressbar role
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeDefined()
    expect(progressbar.getAttribute('aria-valuenow')).toBeDefined()

    // Check checkboxes have accessible labels
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    checkboxes.forEach(cb => {
      expect(cb.getAttribute('aria-label')).toBeDefined()
      expect(cb.getAttribute('aria-checked')).toBeDefined()
    })
  })

  it('AttorneyPacketView renders with accessible print and back controls', () => {
    render(
      <AttorneyPacketView
        doc={doc}
        onBack={() => {}}
      />
    )

    const region = screen.getByRole('region', { name: /Attorney Consultation Briefing Packet/i })
    expect(region).toBeDefined()

    const backButton = screen.getByRole('button', { name: /Back to document analysis/i })
    expect(backButton).toBeDefined()

    const printButton = screen.getByRole('button', { name: /Print briefing packet/i })
    expect(printButton).toBeDefined()
  })

  it('AuthModal renders accessible dialog attributes with aria-modal and aria-labelledby', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeDefined()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('auth-modal-title')

    const closeBtn = screen.getByRole('button', { name: /Close authentication dialog/i })
    expect(closeBtn).toBeDefined()
  })
})
