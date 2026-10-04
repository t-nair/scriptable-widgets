// Linear tickets: Lock Screen (accessoryInline)
// run this once with ur api key in there, then remove the line below
Keychain.set("linear_key", "lin_api_YOUR_KEY_HERE")
const query = `{
  viewer {
    doing: assignedIssues(first: 100, filter: {state: {type: {eq: "started"}}}) { nodes { id } }
    todo: assignedIssues(first: 100, filter: {state: {type: {eq: "unstarted"}}}) { nodes { id } }
  }
}`
let text
try {
  const req = new Request("https://api.linear.app/graphql")
  req.method = "POST"
  req.headers = {
    "Content-Type": "application/json",
    "Authorization": Keychain.get("linear_key") // personal keys go in raw, no "Bearer"
  }
  req.body = JSON.stringify({ query })
  const res = await req.loadJSON()
  const v = res.data.viewer
  text = `LIN ${v.doing.nodes.length} doing · ${v.todo.nodes.length} todo`
} catch (e) {
  text = "LIN offline"
}
const w = new ListWidget()
w.addText(text)
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)
if (config.runsInWidget) Script.setWidget(w)
else await w.presentAccessoryInline()
Script.complete()