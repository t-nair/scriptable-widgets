// ISS distance: Lock Screen (accessoryInline)
let lat = 47.6163, lon = -122.0356 // fallback if location is unavailable
try {
  Location.setAccuracyToKilometer()
  const loc = await Location.current()
  lat = loc.latitude
  lon = loc.longitude
} catch (e) {}
const R = 6371, rad = Math.PI / 180
let text
try {
  const iss = await new Request("https://api.wheretheiss.at/v1/satellites/25544").loadJSON()
  const dLat = (iss.latitude - lat) * rad
  const dLon = (iss.longitude - lon) * rad
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * rad) * Math.cos(iss.latitude * rad) * Math.sin(dLon / 2) ** 2
  const d = 2 * R * Math.asin(Math.sqrt(a))
  const horizon = R * Math.acos(R / (R + iss.altitude))
  const mi = Math.round(d * 0.621371).toLocaleString()
  text = `🛰 ${d < horizon ? "↑ " : ""}${mi} mi`
} catch (e) {
  text = "🛰 offline"
}
const w = new ListWidget()
w.addText(text)
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)
if (config.runsInWidget) Script.setWidget(w)
else await w.presentAccessoryInline()
Script.complete()