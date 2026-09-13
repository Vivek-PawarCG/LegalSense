import { driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startTour(onComplete?: () => void) {
  // Wait a moment for DOM elements to mount if called right after screen change
  setTimeout(() => {
    let scrollListenerCleanup: (() => void) | null = null
    let activeRafId: number | null = null

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      smoothScroll: false, // Handled manually with continuous RAF tracking to prevent desync
      overlayColor: '#020617', // Deep slate-950 obsidian dark focus
      overlayOpacity: 0.88, // Significantly darker focus (was 0.5 - 0.7)
      stagePadding: 8,
      stageRadius: 14,
      popoverClass: 'legalsense-driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get Started 🚀',
      progressText: '{{current}} of {{total}}',
      onHighlightStarted: (element) => {
        if (element) {
          // Scroll target element smoothly into center view
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
        }

        // Run a continuous 60fps tracking loop during smooth scrolling so the popover and highlight move together
        const startTime = performance.now()
        function trackFrame() {
          driverObj.refresh()
          if (performance.now() - startTime < 650) {
            activeRafId = requestAnimationFrame(trackFrame)
          }
        }
        if (activeRafId) cancelAnimationFrame(activeRafId)
        activeRafId = requestAnimationFrame(trackFrame)
      },
      onHighlighted: () => {
        // Ensure final precise snap after animation
        driverObj.refresh()
        setTimeout(() => driverObj.refresh(), 80)
        setTimeout(() => driverObj.refresh(), 250)
      },
      onDestroyed: () => {
        if (scrollListenerCleanup) scrollListenerCleanup()
        if (activeRafId) cancelAnimationFrame(activeRafId)
        try {
          localStorage.setItem('legalsense_tour_completed', 'true')
        } catch {}
        onComplete?.()
      },
      steps: [
        {
          element: '#tour-topbar',
          popover: {
            title: '✨ Welcome to LegalSense!',
            description: 'Your intelligent legal copilot for automated agreement analysis, risk evaluation, and clause translation.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-metrics',
          popover: {
            title: '📊 Executive KPI Dashboard',
            description: 'Track audited contracts, high-risk flags requiring attention, and estimated review hours saved.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-actions',
          popover: {
            title: '⚡ Quick Action Suite',
            description: 'Jump directly into contract deep-dives, two-document redline comparison, or the grounded AI Legal Copilot.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-dropzone',
          popover: {
            title: '📄 Upload Your Agreement',
            description: 'Drop or select your contract (PDF, TXT, or MD) here to trigger instant Gemini AI clause extraction and risk auditing.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-sidebar-nav',
          popover: {
            title: '🧭 Navigation Hub',
            description: 'Easily navigate between your Document Library, Clause Inspector, Diff Engine, Copilot Q&A, and Workspace Settings.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '#tour-quick-tour-btn',
          popover: {
            title: '💡 Tour Anytime',
            description: 'You can replay this quick guided walkthrough anytime by clicking this "Quick Tour" button.',
            side: 'bottom',
            align: 'end',
          },
        },
      ] as DriveStep[],
    })

    // Capture scroll events on ANY scroll container (including <main className="overflow-y-auto">)
    // so the popover immediately tracks any manual or programmatic scroll in real-time
    const handleCaptureScroll = () => {
      driverObj.refresh()
    }

    window.addEventListener('scroll', handleCaptureScroll, { capture: true, passive: true })
    scrollListenerCleanup = () => {
      window.removeEventListener('scroll', handleCaptureScroll, { capture: true } as any)
    }

    driverObj.drive()
  }, 100)
}
