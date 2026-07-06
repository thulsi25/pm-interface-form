;(function () {
  try {
    var k = localStorage.getItem('theme') || 'system'
    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    var r = k === 'system' ? sys : k
    var t = r === 'dark' ? 'modus-modern-dark' : 'modus-modern-light'
    var e = document.documentElement
    e.dataset.theme = t
    e.dataset.mode = k
    e.classList.add(r)
    try {
      localStorage.setItem('modus-theme-config', JSON.stringify({ theme: t }))
    } catch (err) {
      /* ignore */
    }
  } catch (err) {
    /* ignore */
  }
})()
