// Linear tickets: Home Screen (large)
// First run inside Scriptable to paste your API key (Linear > Settings > Security & access > Personal API keys).
const KEY = "linear_api_key"
const MAX_ROWS = 9
const TYPES = [ // order = bar order
  ["started", "In progress", "#f2c94c"],
  ["unstarted", "Todo", "#9aa0a6"],
  ["backlog", "Backlog", "#5a5f66"],
  ["triage", "Triage", "#eb5757"],
]
const FG = new Color("#ffffff"), DIM = new Color("#ffffff", 0.55)

if (!Keychain.contains(KEY) && !config.runsInWidget) {
  const a = new Alert()
  a.title = "Linear API key"
  a.addSecureTextField("lin_api_...")
  a.addAction("Save")
  await a.present()
  Keychain.set(KEY, a.textFieldValue(0).trim())
}

const w = new ListWidget()
w.backgroundColor = new Color("#14151a")
w.setPadding(16, 16, 16, 16)
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)

try {
  const req = new Request("https://api.linear.app/graphql")
  req.method = "POST"
  req.headers = { "Content-Type": "application/json", Authorization: Keychain.get(KEY) }
  req.body = JSON.stringify({ query: `{
    viewer {
      active: assignedIssues(first: 100, filter: { state: { type: { nin: ["completed", "canceled"] } } }) {
        nodes { identifier title priority state { name type color } }
      }
      done: assignedIssues(first: 100, filter: { completedAt: { gte: "-P1W" } }) { nodes { id } }
    }
  }` })
  const res = await req.loadJSON()
  if (res.errors) throw new Error(res.errors[0].message)
  const { active, done } = res.data.viewer
  const issues = active.nodes
  const count = t => issues.filter(i => i.state.type === t).length

  // header
  const head = w.addStack()
  head.centerAlignContent()
  const t = head.addText("Linear")
  t.font = Font.boldSystemFont(15)
  t.textColor = FG
  head.addSpacer()
  const d = head.addText(`✓ ${done.nodes.length} this week`)
  d.font = Font.mediumSystemFont(12)
  d.textColor = new Color("#6fcf97")
  w.addSpacer(10)

  // stacked status bar
  const BW = 297, BH = 10
  const ctx = new DrawContext()
  ctx.size = new Size(BW, BH)
  ctx.opaque = false
  ctx.respectScreenScale = true
  let x = 0
  for (const [type, , color] of TYPES) {
    const wd = BW * count(type) / (issues.length || 1)
    if (!wd) continue
    ctx.setFillColor(new Color(color))
    ctx.fillRect(new Rect(x, 0, wd, BH))
    x += wd
  }
  const bar = w.addImage(ctx.getImage())
  bar.imageSize = new Size(BW, BH)
  bar.cornerRadius = 5
  w.addSpacer(10)

  // legend with counts
  const legend = w.addStack()
  for (const [type, label, color] of TYPES) {
    if (!count(type)) continue
    const c = legend.addStack()
    c.layoutVertically()
    const n = c.addText(String(count(type)))
    n.font = Font.boldSystemFont(24)
    n.textColor = new Color(color)
    const l = c.addText(label)
    l.font = Font.systemFont(10)
    l.textColor = DIM
    legend.addSpacer()
  }
  w.addSpacer(12)

  // ticket list: in progress first, then highest priority (Linear: 1 urgent ... 4 low, 0 none)
  const rank = i => (i.state.type === "started" ? 0 : 1000) + (i.priority || 5)
  issues.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_ROWS).forEach(i => {
    const r = w.addStack()
    r.centerAlignContent()
    const dot = r.addText("●")
    dot.font = Font.systemFont(9)
    dot.textColor = new Color(i.state.color)
    r.addSpacer(6)
    const id = r.addText(i.identifier)
    id.font = Font.mediumMonospacedSystemFont(11)
    id.textColor = DIM
    r.addSpacer(6)
    const title = r.addText(i.title)
    title.font = Font.systemFont(13)
    title.textColor = FG
    title.lineLimit = 1
    w.addSpacer(6)
  })
  if (issues.length > MAX_ROWS) {
    const m = w.addText(`+${issues.length - MAX_ROWS} more`)
    m.font = Font.systemFont(11)
    m.textColor = DIM
  }
  w.addSpacer()
} catch (e) {
  const m = w.addText("Linear: " + e.message)
  m.textColor = FG
  m.font = Font.systemFont(13)
}

if (config.runsInWidget) Script.setWidget(w)
else await w.presentLarge()
Script.complete()
