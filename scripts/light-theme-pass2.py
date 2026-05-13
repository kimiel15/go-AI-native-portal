import os, sys

BASE = r'C:\AI Workstream Projects\synapse-portal'
files = [
    r'components\NavBar.tsx',
    r'app\page.tsx',
    r'app\assessment\page.tsx',
    r'app\register\page.tsx',
    r'app\submit\page.tsx',
    r'app\admin\page.tsx',
    r'app\admin\dashboard\page.tsx',
]

replacements = [
    # ── Input / textarea / select fields (white bg → need dark text) ──────────
    # Full input className patterns
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors">',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-rose-500 transition-colors">'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 transition-colors">'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors">',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-red-500 transition-colors">'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none leading-relaxed" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none leading-relaxed" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"'),
    # submit page mono input
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed text-sm"',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed text-sm"'),
    # register small inputs
    ('bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />',
     'bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />'),
    # admin dashboard validation inputs
    ('bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors">',
     'bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-red-500 transition-colors">'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none" />'),
    ('bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-red-500" />',
     'bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500" />'),
    # admin login password input
    ('bg-white border border-gray-200 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"',
     'bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"'),

    # ── Section headings (no text-size class) ────────────────────────────────
    # These are inside section cards — not buttons
    ('<h2 className="text-white font-semibold">',  '<h2 className="text-slate-900 font-semibold">'),
    # dashboard card names
    ('<p className="text-white font-semibold">',   '<p className="text-slate-900 font-semibold">'),
    ('<p className="text-white text-sm font-medium">', '<p className="text-slate-900 text-sm font-medium">'),

    # ── Strong highlights in body text ────────────────────────────────────────
    ('<strong className="text-white">',            '<strong className="text-slate-900">'),

    # ── Admin overview tab team name row ─────────────────────────────────────
    # dashboard line 509: `text-white text-sm font-medium` on overview tab
    ('"text-white text-sm font-medium"',           '"text-slate-900 text-sm font-medium"'),

    # ── Dashboard team card initial letter (keep white — on gradient bg) ─────
    # No change needed: `bg-gradient-to-br from-red-500 to-rose-600 ... text-white font-bold text-sm`
    # That's an initial avatar on a colored bg — white is correct

    # ── page.tsx date highlight ───────────────────────────────────────────────
    ('<strong className="text-slate-900">Saturday, June 27, 2026</strong>',
     '<strong className="text-red-600">Saturday, June 27, 2026</strong>'),
]

total = 0
for rel in files:
    path = os.path.join(BASE, rel)
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    out = src
    for old, new in replacements:
        count = out.count(old)
        if count:
            out = out.replace(old, new)
            total += count
    if out != src:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(out)
        print('changed: ' + rel)
    else:
        print('no-op:   ' + rel)

print('Total replacements: ' + str(total))
