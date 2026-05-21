export function parseRangePins(str) {
  const pins = []
  for (const seg of str.split(',')) {
    const s = seg.trim()
    if (!s) continue
    const m = s.match(/^(\d+)-(\d+)$/)
    if (m) {
      const [from, to] = [parseInt(m[1], 10), parseInt(m[2], 10)]
      for (let i = from; i <= to; i++) pins.push(i)
    } else {
      const n = parseInt(s, 10)
      if (!isNaN(n)) pins.push(n)
    }
  }
  return pins
}

export function pinsToRangeStr(pins) {
  if (!pins?.length) return ''
  const sorted = [...new Set(pins)].sort((a, b) => a - b)
  const parts = []
  let start = sorted[0], end = sorted[0]
  for (let i = 1; i <= sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; continue }
    parts.push(start === end ? `${start}` : `${start}-${end}`)
    start = end = sorted[i]
  }
  return parts.join(', ')
}
