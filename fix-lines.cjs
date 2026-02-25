const fs = require('fs');
const file = 'src/pages/Dashboard/DashboardPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Lines 333-338 (0-indexed 332-337)
lines[332] = 'const VIEW_META: Record<ViewMode, { title: string; subtitle: (n: number) => string; emptyIcon: string; emptyMsg: string }> = {';
lines[333] = '  recent: { title: "Recent", subtitle: (n) => `${n} map${n !== 1 ? "s" : ""} edited in the last 24h`, emptyIcon: "🕐", emptyMsg: "No maps edited in the last 24 hours" },';
lines[334] = '  starred: { title: "Starred", subtitle: (n) => `${n} starred map${n !== 1 ? "s" : ""}`, emptyIcon: "⭐", emptyMsg: "No starred maps yet" },';
lines[335] = '  all: { title: "All Maps", subtitle: (n) => `${n} mind map${n !== 1 ? "s" : ""}`, emptyIcon: "🗺️", emptyMsg: "No mind maps yet" },';
lines[336] = '  trash: { title: "Trash", subtitle: (n) => `${n} deleted map${n !== 1 ? "s" : ""}`, emptyIcon: "🗑️", emptyMsg: "Trash is empty" },';
lines[337] = '};';

// Line 571 (0-indexed 570)
lines[570] = '                    {isTrash ? "🗑️" : "🗂️"}';

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed lines');
