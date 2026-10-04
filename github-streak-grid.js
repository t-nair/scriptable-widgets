// GitHub streak grid: Lock Screen (accessoryRectangular)
const USER = "t-nair"
const COLS = 13, CELL = 7, GAP = 2   // weeks shown, cell size, spacing
const ALPHA = [0.18, 0.4, 0.6, 0.8, 1] // lock screen is monochrome, so levels use opacity

const d0 = new Date()
const today = `${d0.getFullYear()}-${String(d0.getMonth()+1).padStart(2,"0")}-${String(d0.getDate()).padStart(2,"0")}`

const widget = new ListWidget()
widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000)

try {
  const html = await new Request(`https://github.com/users/${USER}/contributions`).loadString()
  const days = (html.match(/<td[^>]*data-date="[^"]+"[^>]*>/g) || [])
    .map(t => ({
      date: t.match(/data-date="([^"]+)"/)[1],
      level: parseInt((t.match(/data-level="(\d)"/) || [0, 0])[1])
    }))
    .filter(d => d.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  // draw the grid: columns = weeks, rows = weekdays
  const first = new Date(days[0].date + "T00:00:00").getDay()
  const totalCols = Math.ceil((days.length + first) / 7)
  const startCol = Math.max(0, totalCols - COLS)
  const w = COLS * (CELL + GAP) - GAP, h = 7 * (CELL + GAP) - GAP

  const ctx = new DrawContext()
  ctx.size = new Size(w, h)
  ctx.opaque = false
  ctx.respectScreenScale = true
  days.forEach((d, idx) => {
    const col = Math.floor((idx + first) / 7) - startCol
    const row = (idx + first) % 7
    if (col < 0) return
    const p = new Path()
    p.addRoundedRect(new Rect(col * (CELL + GAP), row * (CELL + GAP), CELL, CELL), 2, 2)
    ctx.addPath(p)
    ctx.setFillColor(new Color("#ffffff", ALPHA[d.level]))
    ctx.fillPath()
  })

  const img = widget.addImage(ctx.getImage())
  img.imageSize = new Size(w, h)
} catch (e) {
  widget.addText("GitHub unreachable")
}

if (config.runsInWidget) Script.setWidget(widget)
else await widget.presentAccessoryRectangular()
Script.complete()