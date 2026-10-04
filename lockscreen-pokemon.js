// Random pixel Pokémon: Lock Screen (accessoryRectangular)
const MAX_ID = 649 // Gen 1-5 have true pixel sprites

// Seed by 30-min block so it doesn't reshuffle on every redraw
const seed = Math.floor(Date.now() / (30 * 60 * 1000))
const id = (seed * 7919 % MAX_ID) + 1
// For fully random each time, use: Math.floor(Math.random() * MAX_ID) + 1

const widget = new ListWidget()
widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000)

try {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`
  const img = await new Request(spriteUrl).loadImage()
  const data = await new Request(`https://pokeapi.co/api/v2/pokemon/${id}`).loadJSON()
  const name = data.name.replace(/-/g, " ").toUpperCase()
  const dex = "#" + String(id).padStart(3, "0")

  const row = widget.addStack()
  row.centerAlignContent()
  const pic = row.addImage(img)
  pic.imageSize = new Size(44, 44)
  row.addSpacer(8)

  const col = row.addStack()
  col.layoutVertically()
  const n = col.addText(name)
  n.font = Font.boldSystemFont(11)
  n.lineLimit = 1
  n.minimumScaleFactor = 0.6
  const d = col.addText(dex)
  d.font = Font.systemFont(9)
  col.addSpacer(3)
  const hp = Math.round(Device.batteryLevel() * 100)
  const h = col.addText(`HP ${hp}%`)
  h.font = Font.systemFont(9)
} catch (e) {
  widget.addText("Pokédex offline")
}

if (config.runsInWidget) Script.setWidget(widget)
else await widget.presentAccessoryRectangular()
Script.complete()