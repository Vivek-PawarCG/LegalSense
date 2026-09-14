import {
  RiskLevel,
  ClauseItem,
  AnalysisData,
  ChatMessage,
  ChatSession,
  StoredDocument,
  ActivityItem,
  ChecklistItem,
  ContractOption,
} from '../types/legal'

export type {
  RiskLevel,
  ClauseItem,
  AnalysisData,
  ChatMessage,
  ChatSession,
  StoredDocument,
  ActivityItem,
  ChecklistItem,
  ContractOption,
}

const DOCS_STORAGE_KEY = 'legalsense_documents_v1'
const ACTIVITY_STORAGE_KEY = 'legalsense_activity_v1'

// Auto-purge stale mock data from previous prototypes so workspace starts fresh
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const existing = localStorage.getItem(DOCS_STORAGE_KEY)
    if (existing && existing.includes('doc_msa_001')) {
      localStorage.removeItem(DOCS_STORAGE_KEY)
    }
    const act = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (act && act.includes('act_1')) {
      localStorage.removeItem(ACTIVITY_STORAGE_KEY)
    }
  } catch {}
}

export const SAMPLE_DOCUMENTS: StoredDocument[] = []

export function createTemplateDocument(key: string): StoredDocument {
  const isNDA = /nda|non-disclosure|confidential/i.test(key)
  const isEmployment = /employ|executive|hiring/i.test(key)
  const isConsulting = /consult|contractor|advisory/i.test(key)

  const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const newId = `doc_${Date.now()}`

  if (isNDA) {
    return {
      id: newId,
      name: 'Mutual_Non_Disclosure_Agreement_2026.pdf',
      uploadDate: timestamp,
      size: '1.2 MB',
      fileType: 'application/pdf',
      pageCount: 4,
      overallRisk: 'Low',
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: 'I have analyzed the Mutual Non-Disclosure Agreement. The terms are standard and balanced with a 2-year survival period and standard trade secret exclusions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceReference: 'Executive Summary'
        }
      ],
      analysis: {
        overallRisk: 'Low',
        summary: 'Standard Bilateral Non-Disclosure Agreement governing preliminary commercial negotiations. Both parties agree to safeguard confidential information using at least reasonable care.',
        parties: ['Alpha Dynamics LLC (Disclosing Party)', 'Beta Partners Inc (Receiving Party)'],
        type: 'Mutual Non-Disclosure Agreement',
        effective: 'Immediate upon signature',
        duration: '2 Years Survival Period',
        takeaways: [
          'Confidentiality obligations survive for 24 months post-disclosure.',
          'Standard carve-outs for public knowledge, prior possession, and legally compelled disclosures.',
          'No non-compete or non-solicitation covenants embedded in this agreement.',
          'Injunctive relief available to prevent unauthorized leaks without proving monetary damages.'
        ],
        risks: [
          ['Confidentiality Duration', 'Low'],
          ['Equitable Remedies', 'Low'],
          ['Written Marking Requirement', 'Low']
        ],
        inconsistencies: [
          'Section 2.1 requires written marking for tangible items within 30 days, but oral disclosures do not specify a written confirmation deadline.'
        ],
        optionsAndNextSteps: [
          {
            option: 'Execute as written',
            impact: 'Standard mutual terms; minimal legal exposure for bilateral discussions.',
            effort: 'Low',
            recommendation: 'Recommended'
          },
          {
            option: 'Add specific IP ownership disclaimer',
            impact: 'Explicitly clarifies that sharing prototypes does not transfer patent or copyright licenses.',
            effort: 'Low'
          }
        ],
        actionChecklist: [
          {
            id: 'chk_1',
            task: 'Mark all sensitive slide decks and source code repositories as "Confidential" prior to disclosure.',
            phase: 'Pre-Signing',
            priority: 'High',
            completed: false
          },
          {
            id: 'chk_2',
            task: 'Verify signatory authorization for both corporate entities.',
            phase: 'Execution',
            priority: 'Medium',
            completed: false
          },
          {
            id: 'chk_3',
            task: 'Calendar 2-year expiration milestone for return or certified destruction of confidential assets.',
            phase: 'Post-Signing',
            priority: 'Low',
            completed: false
          }
        ],
        clauses: [
          {
            id: 'c_nda_1',
            section: '2.1',
            title: 'Duty of Confidentiality & Standard of Care',
            quote: 'Recipient agrees to hold Discloser’s Confidential Information in strict confidence using at least the same degree of care it uses for its own confidential materials of like nature, but in no event less than reasonable care.',
            plainEnglish: 'You must protect their private files and trade secrets just as carefully as your own valuable company records.',
            whyItMatters: 'Establishes the legal duty of care during partnership discussions and prevents unauthorized disclosure to third parties.',
            whoIsAffected: {
              partyA: 'Both Parties: obligated to maintain strict internal data safeguards.',
              partyB: 'Both Parties: protected from trade secret leaks.'
            },
            questionsToAsk: [
              'Are external subcontractors and legal advisors covered under back-to-back NDA terms?'
            ],
            risk: 'Low',
            page: 2
          },
          {
            id: 'c_nda_2',
            section: '3.4',
            title: 'Permitted Exclusions & Compelled Disclosure',
            quote: 'Confidential Information shall not include information that is publicly known through no breach, or required to be disclosed pursuant to judicial order.',
            plainEnglish: 'Information that is already publicly available or mandated by court subpoena is not confidential.',
            whyItMatters: 'Protects the receiving party from breach of contract claims if subpoenaed by regulators.',
            whoIsAffected: {
              partyA: 'Disclosing Party: must prove secrecy for protected assets.',
              partyB: 'Receiving Party: safe harbor for public data.'
            },
            questionsToAsk: [
              'Is prompt written notice required prior to complying with a court subpoena?'
            ],
            risk: 'Low',
            page: 3
          }
        ]
      }
    }
  }

  if (isEmployment) {
    return {
      id: newId,
      name: 'Executive_Employment_Agreement_2026.pdf',
      uploadDate: timestamp,
      size: '2.1 MB',
      fileType: 'application/pdf',
      pageCount: 8,
      overallRisk: 'High',
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: 'I have analyzed your Executive Employment Agreement. Note the restrictive post-employment non-compete and broad invention assignment clauses.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceReference: 'Risk Summary'
        }
      ],
      analysis: {
        overallRisk: 'High',
        summary: 'Executive Employment Agreement detailing compensation, equity vesting schedule, invention pre-assignment, 12-month post-employment non-compete, and severance conditions.',
        parties: ['Global Tech Enterprises Corp (Employer)', 'Executive Candidate (You)'],
        type: 'Executive Employment Contract',
        effective: '1 October 2026',
        duration: 'At-Will / 3-Year Initial Term',
        takeaways: [
          'Post-employment 12-month non-compete restricts working for industry competitors.',
          'Broad proprietary rights clause claims all inventions created during term of employment.',
          'Severance requires 6 months base salary payout in exchange for a full general release of claims.',
          'Double-trigger equity acceleration applies in the event of a change-in-control.'
        ],
        risks: [
          ['Post-Employment Non-Compete', 'High'],
          ['Invention Pre-Assignment Scope', 'High'],
          ['Cause Termination Definition', 'Medium'],
          ['Severance General Release', 'Low']
        ],
        inconsistencies: [
          'Section 6.2 imposes a nationwide 12-month non-compete, while Section 10.4 specifies California governing law where non-compete covenants are statutory void.',
          'Notice period for termination without Cause requires 30 days, but severance calculation starts immediately upon notice.'
        ],
        optionsAndNextSteps: [
          {
            option: 'Negotiate Non-Compete Carveout',
            impact: 'Removes unenforceable or excessive geographic restrictions and avoids livelihood barriers.',
            effort: 'Medium',
            recommendation: 'High Priority'
          },
          {
            option: 'Attach Exhibit A for Prior Inventions',
            impact: 'Protects pre-existing personal code, patents, and independent weekend projects.',
            effort: 'Low',
            recommendation: 'Essential'
          },
          {
            option: 'Request Attorney Consultation',
            impact: 'Engage employment counsel to review equity acceleration triggers and tax implications (83(b) election).',
            effort: 'High'
          }
        ],
        actionChecklist: [
          {
            id: 'chk_emp_1',
            task: 'Prepare written schedule of pre-existing intellectual property (Exhibit A) to exclude from employer assignment.',
            phase: 'Pre-Signing',
            priority: 'High',
            completed: false
          },
          {
            id: 'chk_emp_2',
            task: 'Consult attorney on Section 6.2 enforceability under applicable state law.',
            phase: 'Pre-Signing',
            priority: 'High',
            completed: false
          },
          {
            id: 'chk_emp_3',
            task: 'File Section 83(b) tax election with IRS within 30 days of equity grant if receiving restricted stock.',
            phase: 'Post-Signing',
            priority: 'High',
            completed: false
          }
        ],
        clauses: [
          {
            id: 'c_emp_1',
            section: '6.2',
            title: 'Restrictive Covenant & Non-Competition',
            quote: 'During employment and for twelve (12) months following termination for any reason, Executive shall not directly or indirectly engage in, consult for, or invest in any business competing with Employer within North America.',
            plainEnglish: 'You cannot work for, advise, or start any competing business for an entire year after leaving this company.',
            whyItMatters: 'Extremely restrictive. May severely hamper your ability to earn a living in your area of expertise if you depart.',
            whoIsAffected: {
              partyA: 'Employer: shields intellectual moat and customer relationships.',
              partyB: 'Executive: blocked from competing market employment.'
            },
            questionsToAsk: [
              'Can the non-compete be limited only to a specific list of direct named competitors?',
              'Does the company pay garden leave salary during the 12-month restriction?'
            ],
            risk: 'High',
            page: 5
          },
          {
            id: 'c_emp_2',
            section: '8.1',
            title: 'Comprehensive Invention Assignment',
            quote: 'Executive hereby assigns to Employer all rights, title, and interest in and to all inventions, software, and discoveries made, whether during working hours or using personal equipment.',
            plainEnglish: 'The company claims ownership of everything you invent or build while employed, even on your personal devices or off-hours.',
            whyItMatters: 'Overly broad and captures independent weekend side-projects. Needs a clear carve-out for prior inventions.',
            whoIsAffected: {
              partyA: 'Employer: total ownership of executive output.',
              partyB: 'Executive: forfeits personal side-projects.'
            },
            questionsToAsk: [
              'Can we attach an Exhibit A listing pre-existing personal intellectual property excluded from assignment?'
            ],
            risk: 'High',
            page: 6
          }
        ]
      }
    }
  }

  if (isConsulting) {
    return {
      id: newId,
      name: 'Independent_Consulting_Agreement_2026.pdf',
      uploadDate: timestamp,
      size: '1.5 MB',
      fileType: 'application/pdf',
      pageCount: 5,
      overallRisk: 'Medium',
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: 'I have analyzed the Independent Consulting Agreement. The contract preserves 1099 contractor autonomy but requires 30 days notice for convenience termination.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceReference: 'Contract Overview'
        }
      ],
      analysis: {
        overallRisk: 'Medium',
        summary: 'Independent Contractor Agreement defining scope of deliverables, hourly fee structure, background IP retention, and mutual convenience termination rights.',
        parties: ['Client Solutions Group Inc', 'Independent Consultant (You)'],
        type: 'Independent Consulting Agreement',
        effective: '15 October 2026',
        duration: '12 Months',
        takeaways: [
          'Contractor explicitly retains ownership of Background Tools, libraries, and pre-existing code.',
          'Invoices payable Net-30 from delivery of approved milestones.',
          'Either party may terminate upon thirty (30) days advance written notice without cause.',
          'Mutual limitation of liability capped at total consulting fees paid in previous 6 months.'
        ],
        risks: [
          ['Termination for Convenience', 'Medium'],
          ['Payment Approval Milestones', 'Medium'],
          ['Background IP Retention', 'Low']
        ],
        inconsistencies: [
          'Deliverable acceptance clause grants client 14 business days to test, but does not state that silence constitutes deemed acceptance.'
        ],
        optionsAndNextSteps: [
          {
            option: 'Insert Deemed Acceptance Language',
            impact: 'Prevents client from withholding invoice payments through passive delays.',
            effort: 'Low',
            recommendation: 'Recommended'
          },
          {
            option: 'Add Kill Fee for Convenience Cancellation',
            impact: 'Guarantees compensation for dedicated bench time if client abruptly cancels project.',
            effort: 'Medium'
          }
        ],
        actionChecklist: [
          {
            id: 'chk_con_1',
            task: 'Define clear milestone acceptance criteria in Statement of Work (SOW Exhibit 1).',
            phase: 'Pre-Signing',
            priority: 'High',
            completed: false
          },
          {
            id: 'chk_con_2',
            task: 'Submit Certificate of Insurance (COI) for Commercial General Liability.',
            phase: 'Execution',
            priority: 'Medium',
            completed: false
          },
          {
            id: 'chk_con_3',
            task: 'Implement monthly milestone invoicing cadence with Net-30 follow-up alerts.',
            phase: 'Post-Signing',
            priority: 'Medium',
            completed: false
          }
        ],
        clauses: [
          {
            id: 'c_con_1',
            section: '4.2',
            title: 'Termination for Convenience',
            quote: 'Either party may terminate this Agreement without cause upon thirty (30) calendar days prior written notice to the other party.',
            plainEnglish: 'Either side can walk away from the engagement at any time by giving one month written advance notice.',
            whyItMatters: 'Provides clean flexibility, but make sure you are compensated for all work performed and non-cancellable expenses incurred up to the termination date.',
            whoIsAffected: {
              partyA: 'Client: can cancel project if priorities shift.',
              partyB: 'Consultant: risk of sudden revenue stoppage.'
            },
            questionsToAsk: [
              'Is the client obligated to pay for all work-in-progress and committed subcontractor costs upon convenience notice?'
            ],
            risk: 'Medium',
            page: 3
          }
        ]
      }
    }
  }

  // Default: Master Services Agreement (MSA)
  return {
    id: newId,
    name: 'Master_Services_Agreement_2026.pdf',
    uploadDate: timestamp,
    size: '2.4 MB',
    fileType: 'application/pdf',
    pageCount: 11,
    overallRisk: 'Medium',
    messages: [
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        text: 'I have analyzed the Master Services Agreement. Key focal points include Section 12.1 (Indemnity obligations) and Section 14.3 (Limitation of Liability).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceReference: 'Executive Analysis'
      }
    ],
    analysis: {
      overallRisk: 'Medium',
      summary: 'Comprehensive commercial agreement governing professional software engineering, SLA commitments, milestone deliverables, indemnities, and mutual liability caps.',
      parties: ['Enterprise Client Systems Inc', 'Service Provider (You)'],
      type: 'Master Services Agreement',
      effective: '1 October 2026',
      duration: '24 Months',
      takeaways: [
        'Indemnification clause contains carve-outs that require careful review regarding IP infringement defense.',
        'Liability cap is mutual and set to 12 months trailing service fees.',
        'Deliverables vest in Client upon final written acceptance and payment in full.',
        'Net-45 day payment cycle with 5% milestone retainage.'
      ],
      risks: [
        ['Indemnification Scope', 'High'],
        ['Limitation of Liability Cap', 'Medium'],
        ['Payment Retainage & Milestones', 'Low']
      ],
      inconsistencies: [
        'Section 12.1 imposes uncapped third-party indemnification, which directly conflicts with the mutual liability ceiling in Section 14.3.',
        'Payment terms state Net-45 days, but late fee penalties begin accumulating on calendar day 31.'
      ],
      optionsAndNextSteps: [
        {
          option: 'Harmonize Indemnity with Liability Cap',
          impact: 'Eliminates unlimited financial exposure by subjecting indemnities to a defined 2x super-cap.',
          effort: 'Medium',
          recommendation: 'Critical'
        },
        {
          option: 'Negotiate Retainage Release Schedule',
          impact: 'Ensures the 5% retainage is disbursed within 30 days of milestone sign-off.',
          effort: 'Low',
          recommendation: 'Recommended'
        },
        {
          option: 'Escalate to Legal Counsel',
          impact: 'Have attorney review IP infringement indemnification carve-outs.',
          effort: 'High'
        }
      ],
      actionChecklist: [
        {
          id: 'chk_msa_1',
          task: 'Demand mutual indemnity cap equal to trailing 12 months fees paid under applicable SOW.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false
        },
        {
          id: 'chk_msa_2',
          task: 'Verify mutual non-solicitation language is reciprocal between both parties.',
          phase: 'Pre-Signing',
          priority: 'Medium',
          completed: false
        },
        {
          id: 'chk_msa_3',
          task: 'Set up recurring billing reminders and milestone acceptance tracking.',
          phase: 'Post-Signing',
          priority: 'Medium',
          completed: false
        }
      ],
      clauses: [
        {
          id: 'c_msa_1',
          section: '12.1',
          title: 'Indemnity & Third-Party Claims Defense',
          quote: 'Service Provider shall defend, indemnify and hold harmless Client from and against any losses, liabilities, claims, and reasonable attorneys’ fees arising out of any material breach of this Agreement or infringement of third-party intellectual property rights.',
          plainEnglish: 'If someone sues the client claiming your work violated their rights or breached this agreement, you must hire lawyers and pay all their damages.',
          whyItMatters: 'Without a tight monetary cap and defense control rights, legal fees can quickly exceed the total value of your contract.',
          whoIsAffected: {
            partyA: 'Service Provider: bears financial liability and defense costs.',
            partyB: 'Client: receives full legal protection.'
          },
          questionsToAsk: [
            'Can we cap indemnity to the total fees paid under this agreement?',
            'Can we require the client to give prompt written notice of any third-party claims?'
          ],
          risk: 'High',
          page: 7
        },
        {
          id: 'c_msa_2',
          section: '14.3',
          title: 'Mutual Limitation of Liability',
          quote: 'Except for breaches of Section 9 (Confidentiality) or indemnity obligations under Section 12, neither party’s aggregate liability shall exceed the total fees paid or payable by Client in the twelve (12) months preceding the claim.',
          plainEnglish: 'The maximum financial damages either party can recover is capped at what was paid in the past 12 months, except for confidentiality leaks and indemnity.',
          whyItMatters: 'Protects your company from catastrophic unlimited liability, though indemnity carve-outs remain uncapped.',
          whoIsAffected: {
            partyA: 'Both Parties: liability exposure bounded by trailing fees.',
            partyB: 'Both Parties: subject to uncapped risk for excluded categories.'
          },
          questionsToAsk: [
            'Can we establish a "super-cap" (e.g. 2x fees) for confidentiality and indemnity carve-outs?'
          ],
          risk: 'Medium',
          page: 9
        }
      ]
    }
  }
}

export function createSampleComparePair(): [StoredDocument, StoredDocument] {
  const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const docA: StoredDocument = {
    id: `doc_cmp_v1_${Date.now()}`,
    name: 'Master_Services_Agreement_v1_Baseline.pdf',
    uploadDate: timestamp,
    size: '1.8 MB',
    fileType: 'application/pdf',
    pageCount: 9,
    overallRisk: 'Low',
    messages: [],
    analysis: {
      overallRisk: 'Low',
      summary: 'Baseline Draft Version 1. Contains mutual 1x fee liability cap, Delaware jurisdiction, and 45-day convenience termination.',
      parties: ['Company Inc', 'Vendor Solutions LLC'],
      type: 'Master Services Agreement',
      effective: '1 Nov 2026',
      duration: '12 Months',
      takeaways: ['Liability capped at 1x contract value', 'Mutual confidentiality and IP protection'],
      risks: [['Liability Cap', 'Low']],
      inconsistencies: [],
      optionsAndNextSteps: [
        {
          option: 'Adopt Baseline Draft',
          impact: 'Symmetrical protections and predictable liability ceiling.',
          effort: 'Low',
          recommendation: 'Preferred'
        }
      ],
      actionChecklist: [
        {
          id: 'chk_cmp_a',
          task: 'Ensure baseline draft is shared as reference baseline for counterparty review.',
          phase: 'Pre-Signing',
          priority: 'Medium',
          completed: false
        }
      ],
      clauses: [
        {
          id: 'c1',
          section: '12.1',
          title: 'Limitation of Liability Cap',
          quote: 'Total aggregate liability shall not exceed 1x annual fees paid.',
          plainEnglish: 'Neither party can be sued for more than the contract value.',
          whyItMatters: 'Strict liability ceiling.',
          whoIsAffected: { partyA: 'Protected', partyB: 'Protected' },
          questionsToAsk: [],
          risk: 'Low',
          page: 6
        }
      ]
    }
  }

  const docB: StoredDocument = {
    id: `doc_cmp_v2_${Date.now()}`,
    name: 'Master_Services_Agreement_v2_Counterparty_Redline.pdf',
    uploadDate: timestamp,
    size: '1.9 MB',
    fileType: 'application/pdf',
    pageCount: 10,
    overallRisk: 'High',
    messages: [],
    analysis: {
      overallRisk: 'High',
      summary: 'Counterparty Redline Version 2. Introduces uncapped indemnity, non-solicitation restrictions, and shifts jurisdiction to London, UK.',
      parties: ['Company Inc', 'Vendor Solutions LLC'],
      type: 'Master Services Agreement (Redline)',
      effective: '1 Nov 2026',
      duration: '12 Months',
      takeaways: ['Uncapped third-party indemnity', '18-month non-solicitation covenant added'],
      risks: [
        ['Uncapped Indemnity', 'High'],
        ['Non-Solicitation', 'Medium']
      ],
      inconsistencies: [
        'Version B removes the liability ceiling for Vendor but retains liability limitation for Client.'
      ],
      optionsAndNextSteps: [
        {
          option: 'Reject Uncapped Indemnity Redline',
          impact: 'Insists on restoring the 1x annual fees liability cap from Version 1.',
          effort: 'Medium',
          recommendation: 'Critical'
        },
        {
          option: 'Propose Compromise Super-Cap',
          impact: 'Offers a 2x contract value cap for third-party IP indemnity.',
          effort: 'Low'
        }
      ],
      actionChecklist: [
        {
          id: 'chk_cmp_b1',
          task: 'Mark redline rejection on Section 12.1 in revision document.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false
        }
      ],
      clauses: [
        {
          id: 'c1',
          section: '12.1',
          title: 'Uncapped Indemnification',
          quote: 'Vendor indemnifies Client for all third-party claims without limitation.',
          plainEnglish: 'Unlimited liability exposure for vendor.',
          whyItMatters: 'Exposes organization to catastrophic financial loss.',
          whoIsAffected: { partyA: 'Uncapped risk', partyB: 'Full indemnity' },
          questionsToAsk: ['Can we restore the 1x trailing fee cap?'],
          risk: 'High',
          page: 6
        }
      ]
    }
  }

  return [docA, docB]
}

export function ensureDocumentActionPlan(doc: StoredDocument): StoredDocument {
  if (!doc.analysis) return doc

  const nameAndType = `${doc.name} ${doc.analysis.type || ''}`.toLowerCase()
  const isLease = /lease|rent|tenant|landlord/i.test(nameAndType)
  const isEmployment = /employ|hire|job|executive|salary/i.test(nameAndType)
  const isNDA = /nda|non-disclosure|confidential/i.test(nameAndType)

  if (!doc.analysis.actionChecklist || doc.analysis.actionChecklist.length === 0) {
    if (isLease) {
      doc.analysis.actionChecklist = [
        {
          id: `chk_${doc.id}_1`,
          task: 'Document pre-existing premises condition and photo-catalog fixtures before signing.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_2`,
          task: 'Verify security deposit escrow conditions and interest accrual terms under local housing law.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_3`,
          task: 'Confirm landlord maintenance response windows for essential utilities (heating, water, electrical).',
          phase: 'Execution',
          priority: 'Medium',
          completed: false,
        },
        {
          id: `chk_${doc.id}_4`,
          task: 'Calendar 60-day lease renewal or non-renewal formal notice deadline.',
          phase: 'Post-Signing',
          priority: 'Low',
          completed: false,
        },
      ]
    } else if (isEmployment) {
      doc.analysis.actionChecklist = [
        {
          id: `chk_${doc.id}_1`,
          task: 'Prepare written schedule of pre-existing personal IP (Exhibit A) to exclude from company assignment.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_2`,
          task: 'Verify post-termination non-compete duration and geographic restrictions with local employment counsel.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_3`,
          task: 'Confirm equity vesting schedule and change-of-control acceleration protections.',
          phase: 'Execution',
          priority: 'Medium',
          completed: false,
        },
        {
          id: `chk_${doc.id}_4`,
          task: 'File Section 83(b) tax election with IRS within 30 days of equity grant if receiving restricted stock.',
          phase: 'Post-Signing',
          priority: 'High',
          completed: false,
        },
      ]
    } else if (isNDA) {
      doc.analysis.actionChecklist = [
        {
          id: `chk_${doc.id}_1`,
          task: 'Mark all sensitive presentations, data rooms, and repositories as "Confidential" prior to disclosure.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_2`,
          task: 'Verify signatory authorization and confirm standard trade secret carveouts are reciprocal.',
          phase: 'Execution',
          priority: 'Medium',
          completed: false,
        },
        {
          id: `chk_${doc.id}_3`,
          task: 'Calendar 2-year survival milestone for certified return or destruction of proprietary records.',
          phase: 'Post-Signing',
          priority: 'Low',
          completed: false,
        },
      ]
    } else {
      doc.analysis.actionChecklist = [
        {
          id: `chk_${doc.id}_1`,
          task: 'Demand mutual liability ceiling equal to 1x annual trailing contract value.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_2`,
          task: 'Verify mutual indemnity carveouts and reciprocal intellectual property infringement defense.',
          phase: 'Pre-Signing',
          priority: 'High',
          completed: false,
        },
        {
          id: `chk_${doc.id}_3`,
          task: 'Confirm signatory credentials and corporate board approval resolutions.',
          phase: 'Execution',
          priority: 'Medium',
          completed: false,
        },
        {
          id: `chk_${doc.id}_4`,
          task: 'Set up automated Net-30 invoice milestone alerts and contract renewal reminders.',
          phase: 'Post-Signing',
          priority: 'Low',
          completed: false,
        },
      ]
    }
  }

  if (!doc.analysis.optionsAndNextSteps || doc.analysis.optionsAndNextSteps.length === 0) {
    if (isLease) {
      doc.analysis.optionsAndNextSteps = [
        {
          option: 'Request Grace Period for Rent Payment',
          impact: 'Adds a standard 5-day grace window before late penalty fees can be assessed.',
          effort: 'Low',
          recommendation: 'Recommended',
        },
        {
          option: 'Negotiate Early Termination Break-Clause',
          impact: 'Establishes a defined 2-month penalty fee if forced to relocate for employment.',
          effort: 'Medium',
          recommendation: 'High Value',
        },
        {
          option: 'Consult Tenant Rights Advisor',
          impact: 'Validates security deposit limits and repair obligations against local municipal statutes.',
          effort: 'Medium',
        },
      ]
    } else {
      doc.analysis.optionsAndNextSteps = [
        {
          option: 'Negotiate Reciprocal Liability Protections',
          impact: 'Ensures caps on damages apply symmetrically to both contracting entities.',
          effort: 'Medium',
          recommendation: 'High Priority',
        },
        {
          option: 'Clarify Milestone Acceptance Window',
          impact: 'Establishes a 14-day deemed acceptance period to eliminate indefinite payment withholdings.',
          effort: 'Low',
          recommendation: 'Recommended',
        },
        {
          option: 'Prepare Attorney Consultation Brief',
          impact: 'Generates structured legal inquiries to minimize attorney consultation fees.',
          effort: 'Low',
        },
      ]
    }
  }

  if (!doc.analysis.inconsistencies || doc.analysis.inconsistencies.length === 0) {
    if (isLease) {
      doc.analysis.inconsistencies = [
        'Notice period specifies 30 days for tenant vacating, but grants landlord 60 days to return security deposits.',
        'Tenant is required to insure the premises, but landlord retains sole discretion over insurance claim settlements.'
      ]
    } else if (isEmployment) {
      doc.analysis.inconsistencies = [
        'Section 6.2 restricts employment across North America, which may exceed reasonable geographic scope under local law.',
        'Invention assignment captures discoveries created on personal equipment without explicit hobby carveouts.'
      ]
    } else {
      doc.analysis.inconsistencies = [
        'Indemnification obligations are unilateral and uncapped, creating tension with the general contract liability ceiling.',
        'Payment terms define Net-45 calendar days, but late penalties accrue from day 30.'
      ]
    }
  }

  return doc
}

export function getUserDocuments(_userId?: string): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY)
    if (!raw) return []
    const docs: StoredDocument[] = JSON.parse(raw)
    if (!Array.isArray(docs)) return []

    let updatedAny = false
    const enriched = docs.map(d => {
      const hadChecklist = d.analysis?.actionChecklist && d.analysis.actionChecklist.length > 0
      const hadOptions = d.analysis?.optionsAndNextSteps && d.analysis.optionsAndNextSteps.length > 0
      const enrichedDoc = ensureDocumentActionPlan(d)
      if (!hadChecklist || !hadOptions) updatedAny = true
      return enrichedDoc
    })

    if (updatedAny) {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(enriched))
    }

    return enriched
  } catch {
    return []
  }
}

export function getDocumentById(id: string): StoredDocument | null {
  const docs = getUserDocuments()
  return docs.find(d => d.id === id) || null
}

export function saveDocument(doc: StoredDocument, skipLog = false): void {
  ensureDocumentActionPlan(doc)
  const docs = getUserDocuments()
  const idx = docs.findIndex(d => d.id === doc.id)
  const isNew = idx < 0
  if (idx >= 0) {
    docs[idx] = doc
  } else {
    docs.unshift(doc)
  }
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs))
  if (isNew && !skipLog) {
    logActivity('analyze', `Analyzed "${doc.name}" with ${doc.overallRisk} risk score`)
  }
}

export function deleteDocument(id: string): StoredDocument[] {
  const docs = getUserDocuments()
  const target = docs.find(d => d.id === id)
  const remaining = docs.filter(d => d.id !== id)
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(remaining))
  if (target) {
    logActivity('delete', `Deleted document "${target.name}"`)
  }
  return remaining
}

export function toggleChecklistItem(docId: string, checklistId: string): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc || !doc.analysis?.actionChecklist) return null

  doc.analysis.actionChecklist = doc.analysis.actionChecklist.map(item => {
    if (item.id === checklistId) {
      return { ...item, completed: !item.completed }
    }
    return item
  })

  saveDocument(doc, true)
  return doc
}

export function generateAttorneyBriefing(doc: StoredDocument): string {
  const highRiskClauses = (doc.analysis?.clauses || []).filter(c => c.risk === 'High')
  const questions = (doc.analysis?.clauses || []).flatMap(c => c.questionsToAsk || [])

  return `# ClariLegal Attorney Consultation Briefing Packet
**Document:** ${doc.name}
**Assessed Document Type:** ${doc.analysis?.type || 'Contract'}
**Overall Risk Assessment:** ${doc.overallRisk} Risk
**Analysis Date:** ${doc.uploadDate || new Date().toLocaleDateString('en-GB')}
**Prepared By:** ClariLegal AI Intelligence Workspace

---

### ⚠️ Ethical & Legal Notice
*This briefing packet is generated by an artificial intelligence productivity engine for informational, preparatory, and organizational purposes. It is designed to assist you in preparing for a consultation with a licensed attorney and does not constitute formal legal representation or attorney-client privileged advice.*

---

## 1. Executive Summary
${doc.analysis?.summary || 'No summary available.'}

* **Identified Parties:** ${(doc.analysis?.parties || []).join(' & ')}
* **Term / Effective Period:** ${doc.analysis?.effective || 'Upon execution'} (${doc.analysis?.duration || 'Standard term'})

---

## 2. Critical & High-Risk Provisions Requiring Counsel Review
${
  highRiskClauses.length > 0
    ? highRiskClauses
        .map(
          c => `### Section ${c.section}: ${c.title} [${c.risk} Risk]
* **Contract Excerpt:** "${c.quote}"
* **Plain-English Impact:** ${c.plainEnglish}
* **Why Counsel Should Review:** ${c.whyItMatters}
* **Parties Affected:** Party A: ${c.whoIsAffected?.partyA} | Party B: ${c.whoIsAffected?.partyB}`
        )
        .join('\n\n')
    : 'No critical high-risk clauses were flagged in the automated scan.'
}

---

## 3. Potential Inconsistencies & Asymmetric Obligations
${
  (doc.analysis?.inconsistencies && doc.analysis.inconsistencies.length > 0)
    ? doc.analysis.inconsistencies.map(inc => `* ⚠️ ${inc}`).join('\n')
    : '* No obvious structural inconsistencies detected in preliminary audit.'
}

---

## 4. Prioritized Questions to Ask Your Attorney
${
  questions.length > 0
    ? questions.map((q, i) => `${i + 1}. **${q}**`).join('\n')
    : '1. What are the standard market carve-outs for this contract category?\n2. Are the indemnification and liability provisions mutual and capped?'
}

---

## 5. Recommended Next Steps & Options
${
  (doc.analysis?.optionsAndNextSteps && doc.analysis.optionsAndNextSteps.length > 0)
    ? doc.analysis.optionsAndNextSteps
        .map(opt => `* **${opt.option}** (${opt.effort} Effort${opt.recommendation ? ` — ${opt.recommendation}` : ''}): ${opt.impact}`)
        .join('\n')
    : '* Request redlines on high-risk provisions.\n* Escalate to legal counsel for definitive signature approval.'
}
`
}

export function appendDocMessage(docId: string, msg: ChatMessage): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc) return null

  if (!doc.messages) doc.messages = []
  doc.messages = [...doc.messages, msg]

  if (!doc.activeSessionId) {
    doc.activeSessionId = `session_${Date.now()}`
  }
  if (!doc.chatSessions) {
    doc.chatSessions = []
  }

  const userMessages = doc.messages.filter(m => m.role === 'user')
  const sessionTitle = userMessages[0]?.text.slice(0, 48) || 'Contract Q&A'
  const sessionIdx = doc.chatSessions.findIndex(s => s.id === doc.activeSessionId)

  const updatedSession: ChatSession = {
    id: doc.activeSessionId,
    title: sessionTitle,
    timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: doc.messages
  }

  if (sessionIdx >= 0) {
    doc.chatSessions[sessionIdx] = updatedSession
  } else {
    doc.chatSessions.unshift(updatedSession)
  }

  saveDocument(doc, true)
  return doc
}

export function startNewDocChat(docId: string): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc) return null

  if (!doc.chatSessions) doc.chatSessions = []

  const currentMessages = doc.messages || []
  const userMessages = currentMessages.filter(m => m.role === 'user')

  if (userMessages.length > 0) {
    const sessionTitle = userMessages[0]?.text.slice(0, 48) || 'Contract Q&A'
    const currentId = doc.activeSessionId || `session_${Date.now()}`
    const existingIdx = doc.chatSessions.findIndex(s => s.id === currentId)
    const sessionData: ChatSession = {
      id: currentId,
      title: sessionTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: currentMessages
    }

    if (existingIdx >= 0) {
      doc.chatSessions[existingIdx] = sessionData
    } else {
      doc.chatSessions.unshift(sessionData)
    }
  }

  const newSessionId = `session_${Date.now()}`
  doc.activeSessionId = newSessionId
  doc.messages = []

  const newSession: ChatSession = {
    id: newSessionId,
    title: 'New Chat',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: []
  }
  doc.chatSessions.unshift(newSession)

  saveDocument(doc, true)
  return doc
}

export function loadDocChatSession(docId: string, sessionId: string): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc || !doc.chatSessions) return null

  const currentMessages = doc.messages || []
  const userMessages = currentMessages.filter(m => m.role === 'user')
  if (userMessages.length > 0 && doc.activeSessionId && doc.activeSessionId !== sessionId) {
    const existingIdx = doc.chatSessions.findIndex(s => s.id === doc.activeSessionId)
    const sessionTitle = userMessages[0]?.text.slice(0, 48) || 'Contract Q&A'
    const sessionData: ChatSession = {
      id: doc.activeSessionId,
      title: sessionTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: currentMessages
    }
    if (existingIdx >= 0) {
      doc.chatSessions[existingIdx] = sessionData
    } else {
      doc.chatSessions.unshift(sessionData)
    }
  }

  const targetSession = doc.chatSessions.find(s => s.id === sessionId)
  if (targetSession) {
    doc.messages = [...targetSession.messages]
    doc.activeSessionId = targetSession.id
    saveDocument(doc, true)
  }
  return doc
}

export function deleteDocChatSession(docId: string, sessionId: string): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc || !doc.chatSessions) return null

  doc.chatSessions = doc.chatSessions.filter(s => s.id !== sessionId)

  if (doc.activeSessionId === sessionId) {
    if (doc.chatSessions.length > 0) {
      doc.activeSessionId = doc.chatSessions[0].id
      doc.messages = [...doc.chatSessions[0].messages]
    } else {
      doc.activeSessionId = `session_${Date.now()}`
      doc.messages = []
    }
  }

  saveDocument(doc, true)
  return doc
}

export function ensureDocChatSessions(doc: StoredDocument): ChatSession[] {
  if (!doc.chatSessions) {
    doc.chatSessions = []
  }

  const filtered = doc.chatSessions.filter(s => !s.id.startsWith('preset_'))
  if (filtered.length !== doc.chatSessions.length) {
    doc.chatSessions = filtered
    saveDocument(doc, true)
  }

  if (doc.messages && doc.messages.length > 0) {
    const userMessages = doc.messages.filter(m => m.role === 'user')
    if (userMessages.length > 0) {
      const currentId = doc.activeSessionId || `session_${Date.now()}`
      doc.activeSessionId = currentId
      const sessionTitle = userMessages[0]?.text.slice(0, 48) || 'Contract Q&A'
      const existing = doc.chatSessions.find(s => s.id === currentId)

      if (!existing) {
        doc.chatSessions.unshift({
          id: currentId,
          title: sessionTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: doc.messages
        })
        saveDocument(doc, true)
      } else {
        existing.messages = doc.messages
        existing.title = sessionTitle
        saveDocument(doc, true)
      }
    }
  }

  return doc.chatSessions
}

export function clearDocMessages(docId: string): StoredDocument | null {
  const docs = getUserDocuments()
  const doc = docs.find(d => d.id === docId)
  if (!doc) return null
  doc.messages = []
  doc.chatSessions = []
  doc.activeSessionId = `session_${Date.now()}`
  saveDocument(doc, true)
  return doc
}

export function getUserActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    let items: ActivityItem[] = []
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) items = parsed
    }

    if (items.length === 0) {
      const docs = getUserDocuments()
      if (docs.length > 0) {
        items = docs.map((d, i) => ({
          id: `act_doc_${d.id}`,
          type: 'analyze' as const,
          title: `Analyzed "${d.name}" with ${d.overallRisk} risk score`,
          time: d.uploadDate || 'Recent',
          timestamp: Date.now() - i * 60000,
        }))
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(items))
      }
    }
    return items
  } catch {
    return []
  }
}

export function logActivity(type: ActivityItem['type'], title: string): void {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    let items: ActivityItem[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) items = parsed
      } catch {}
    }
    const now = new Date()
    const timeStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    const newItem: ActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      time: timeStr,
      timestamp: Date.now(),
    }
    items.unshift(newItem)
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(items.slice(0, 30)))
  } catch {}
}

export function getDashboardMetrics(docs: StoredDocument[]) {
  const totalDocs = docs.length
  let highRiskCount = 0
  let mediumRiskCount = 0
  let lowRiskCount = 0
  let totalClauses = 0

  for (const d of docs) {
    if (d.overallRisk === 'High') highRiskCount++
    else if (d.overallRisk === 'Medium') mediumRiskCount++
    else lowRiskCount++

    totalClauses += (d.analysis?.clauses?.length || 0)
  }

  const timeSavedHours = totalDocs > 0 ? Math.round(totalDocs * 2.5) : 0
  const riskIndex = totalDocs > 0 ? Math.round(((highRiskCount * 3 + mediumRiskCount * 2 + lowRiskCount * 1) / (totalDocs * 3)) * 100) : 0

  return {
    totalDocs,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    totalClauses,
    timeSavedHours,
    riskIndex,
  }
}
