export default function bindScroll(el1: HTMLElement, el2: HTMLElement) {
  let ticking = false

  const handler = (e: Event) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        el2.scrollTo((e.target as HTMLElement).scrollLeft, window.scrollY)
        ticking = false
      })
      ticking = true
    }
  }

  el1.addEventListener('scroll', handler)

  return () => {
    el1.removeEventListener('scroll', handler)
  }
}
