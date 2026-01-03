(() => {
  const STORAGE_THEME = 'tb:theme'
  const STORAGE_PALETTE = 'tb:palette'

  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  function getInitialTheme () {
    const stored = localStorage.getItem(STORAGE_THEME)
    if (stored === 'dark' || stored === 'light') return stored
    return prefersDark() ? 'dark' : 'light'
  }

  function setTheme (theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_THEME, theme)
  }

  function getInitialPalette () {
    const stored = localStorage.getItem(STORAGE_PALETTE)
    return stored || 'jazz'
  }

  function setPalette (palette) {
    document.documentElement.dataset.palette = palette
    localStorage.setItem(STORAGE_PALETTE, palette)
  }

  function syncControls () {
    const select = document.querySelector('[data-action="palette"]')
    if (select) select.value = document.documentElement.dataset.palette || 'jazz'
  }

  function toggleTheme () {
    const current = document.documentElement.dataset.theme || getInitialTheme()
    setTheme(current === 'dark' ? 'light' : 'dark')
  }

  // Initialize early
  try {
    setTheme(getInitialTheme())
    setPalette(getInitialPalette())
  } catch (_) {
    // ignore (e.g. disabled storage)
  }

  window.addEventListener('DOMContentLoaded', () => {
    syncControls()

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]')
      if (!el) return
      const action = el.getAttribute('data-action')
      if (action === 'toggle-theme') toggleTheme()
    })

    document.addEventListener('change', (e) => {
      const el = e.target.closest('[data-action="palette"]')
      if (!el) return
      setPalette(el.value)
    })
  })
})()

