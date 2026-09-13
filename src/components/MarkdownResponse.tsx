import React from 'react'

interface MarkdownResponseProps {
  content: string
  className?: string
}

export function MarkdownResponse({ content, className = '' }: MarkdownResponseProps) {
  if (!content) return null

  // Split lines while preserving blocks
  const rawLines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []

  function flushList(key: string) {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="my-2.5 space-y-2 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-xs" />
              <div className="flex-1 min-w-0">
                {parseInlineMarkdown(item)}
              </div>
            </li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  rawLines.forEach((line, index) => {
    const trimmed = line.trim()

    // Empty line separates blocks
    if (!trimmed) {
      flushList(`list-flush-${index}`)
      return
    }

    // Skip stray single markdown symbols like '*' or '-' or '***'
    if (trimmed === '*' || trimmed === '-' || trimmed === '•' || trimmed === '***' || trimmed === '---' || trimmed === '___') {
      flushList(`list-flush-sep-${index}`)
      return
    }

    // Disclaimer line detection (renders as small, muted font distinct from original response)
    if (isDisclaimerText(trimmed)) {
      flushList(`list-flush-disc-${index}`)
      elements.push(
        <div
          key={`disclaimer-${index}`}
          className="mt-3 pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-normal leading-normal italic select-none [&_strong]:text-slate-500 [&_strong]:font-semibold [&_em]:text-slate-400"
        >
          {parseInlineMarkdown(trimmed)}
        </div>
      )
      return
    }

    // Check if disclaimer is appended to the end of a sentence on the same line
    const disclaimerSplit = trimmed.match(/^(.*?)(\s*(?:[\*\_\(\[]*\s*(?:Disclaimer:|Please note:\s*This is legal information|I am ClariLegal)[\s\S]*))$/i)
    if (disclaimerSplit && disclaimerSplit[1].trim() && isDisclaimerText(disclaimerSplit[2])) {
      flushList(`list-flush-inline-disc-${index}`)
      elements.push(
        <p key={`p-${index}`} className="text-xs leading-relaxed text-slate-800 my-1.5">
          {parseInlineMarkdown(disclaimerSplit[1].trim())}
        </p>
      )
      elements.push(
        <div
          key={`disclaimer-split-${index}`}
          className="mt-3 pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-normal leading-normal italic select-none [&_strong]:text-slate-500 [&_strong]:font-semibold [&_em]:text-slate-400"
        >
          {parseInlineMarkdown(disclaimerSplit[2].trim())}
        </div>
      )
      return
    }

    // Bullet point: "* ", "- ", "• "
    const bulletMatch = trimmed.match(/^[\*\-\•]\s+(.*)$/)
    if (bulletMatch) {
      // If the bullet item itself is a disclaimer, render it as disclaimer instead of a bullet
      if (isDisclaimerText(bulletMatch[1])) {
        flushList(`list-flush-disc-bullet-${index}`)
        elements.push(
          <div
            key={`disclaimer-${index}`}
            className="mt-3 pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-normal leading-normal italic select-none [&_strong]:text-slate-500 [&_strong]:font-semibold [&_em]:text-slate-400"
          >
            {parseInlineMarkdown(bulletMatch[1].trim())}
          </div>
        )
        return
      }
      currentList.push(bulletMatch[1])
      return
    }

    // Numbered list: "1. ", "2. "
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      flushList(`list-flush-num-${index}`)
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-2.5 my-2 text-xs leading-relaxed text-slate-800">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 shadow-xs">
            {numberedMatch[1]}
          </span>
          <div className="flex-1 min-w-0">
            {parseInlineMarkdown(numberedMatch[2])}
          </div>
        </div>
      )
      return
    }

    // Flushes pending list items if encountering a normal paragraph or heading
    flushList(`list-flush-block-${index}`)

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="text-xs font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">
          {parseInlineMarkdown(trimmed.slice(4))}
        </h4>
      )
      return
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-sm font-black text-slate-900 mt-4 mb-2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h3>
      )
      return
    }

    // Check if the line is a summary or alert line like "**Summary:** ..."
    const isSummaryLine = trimmed.startsWith('**Summary:**') || trimmed.startsWith('**Important:**') || trimmed.startsWith('**Recommendation:**')
    if (isSummaryLine) {
      elements.push(
        <div key={`alert-${index}`} className="my-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs leading-relaxed text-slate-800">
          {parseInlineMarkdown(trimmed)}
        </div>
      )
      return
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${index}`} className="text-xs leading-relaxed text-slate-800 my-1.5">
        {parseInlineMarkdown(trimmed)}
      </p>
    )
  })

  // Flush remaining list
  flushList('list-flush-end')

  return (
    <div className={`prose-legal text-xs leading-relaxed ${className}`}>
      {elements}
    </div>
  )
}

// Inline parser for bold, italics, code, and highlights
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null

  // Regex matches: **bold**, *italic*, `code`
  // We use capture groups to split while keeping tokens
  const tokenRegex = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g
  const tokens = text.split(tokenRegex)

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null

        // Bold: **text**
        if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
          const inner = token.slice(2, -2)
          // Highlight high risk terms in bold red/amber if critical
          const isHighRisk = /high|critical|severe|warning|danger/i.test(inner)
          return (
            <strong
              key={i}
              className={`font-extrabold ${isHighRisk ? 'text-rose-700 bg-rose-50 px-1 py-0.5 rounded' : 'text-slate-900'}`}
            >
              {inner}
            </strong>
          )
        }

        // Inline Code: `code`
        if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
          return (
            <code
              key={i}
              className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200"
            >
              {token.slice(1, -1)}
            </code>
          )
        }

        // Italic: *text*
        if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
          return (
            <em key={i} className="italic text-slate-700 font-medium">
              {token.slice(1, -1)}
            </em>
          )
        }

        // Normal text
        return <span key={i}>{token}</span>
      })}
    </>
  )
}

function isDisclaimerText(text: string): boolean {
  if (!text) return false
  const clean = text.replace(/^[\*\_\(\[\>\s\-]+|[\*\_\)\]\>\s]+$/g, '').trim().toLowerCase()
  return (
    clean.startsWith('disclaimer:') ||
    clean.startsWith('disclaimer -') ||
    clean.startsWith('please note: this is legal information') ||
    clean.startsWith('note: this is legal information') ||
    clean.startsWith('please note: this response') ||
    clean.startsWith('i am clarilegal') ||
    clean.includes('does not constitute definitive legal representation') ||
    clean.includes('does not constitute formal legal advice') ||
    clean.includes('informational purposes only and does not constitute') ||
    clean.includes('this is legal information, not definitive legal representation') ||
    clean.includes('an ai legal analyst')
  )
}

