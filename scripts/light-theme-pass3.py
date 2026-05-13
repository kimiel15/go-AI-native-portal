import os

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
    # ── Error / info callout boxes ───────────────────────────────
    ('bg-red-500/10 border border-red-500/20',    'bg-red-50 border border-red-200'),
    ('bg-red-500/5 border border-red-500/10',     'bg-red-50 border border-red-100'),
    ('bg-amber-500/10 border border-amber-500/20','bg-amber-50 border border-amber-200'),
    ('bg-orange-500/10 border border-orange-500/20','bg-orange-50 border border-orange-200'),
    ('bg-emerald-500/10 border border-emerald-500/20','bg-emerald-50 border border-emerald-200'),

    # ── Success icon circles ─────────────────────────────────────
    ('bg-emerald-500/20 flex items-center justify-center mx-auto',
     'bg-emerald-100 flex items-center justify-center mx-auto'),

    # ── Assessment section badges ────────────────────────────────
    ('bg-red-500/20 text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full',
     'bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full'),
    ('bg-rose-500/20 text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full',
     'bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full'),
    ('bg-pink-500/20 text-pink-300 text-xs font-semibold px-2.5 py-1 rounded-full',
     'bg-pink-100 text-pink-700 text-xs font-semibold px-2.5 py-1 rounded-full'),
    ('bg-orange-500/20 text-orange-300 text-xs font-semibold px-2.5 py-1 rounded-full',
     'bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full'),

    # ── Assessment selected radio option ─────────────────────────
    ("'border-red-500/60 bg-red-500/10'",
     "'border-red-400 bg-red-50'"),

    # ── Assessment result callouts ────────────────────────────────
    ('text-amber-300 text-xs font-semibold uppercase tracking-widest mb-1',
     'text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1'),
    ('text-amber-200/70 text-sm',   'text-amber-700 text-sm'),
    ('text-orange-300 text-sm',     'text-orange-700 text-sm'),
    ('text-red-300 text-sm',        'text-red-700 text-sm'),

    # ── Admin login error box text ───────────────────────────────
    ('text-red-400 flex-shrink-0',  'text-red-500 flex-shrink-0'),
    ('text-red-300 text-sm',        'text-red-700 text-sm'),

    # ── Admin dashboard – submitted/pending pills ─────────────────
    ('text-emerald-400 bg-emerald-500/10',  'text-emerald-700 bg-emerald-100'),
    ('text-amber-400 bg-amber-500/10 border border-amber-500/20',
     'text-amber-700 bg-amber-100 border border-amber-200'),
    ('text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
     'text-emerald-700 bg-emerald-100 border border-emerald-200'),

    # ── Admin dashboard – essay/score callout boxes ───────────────
    ('bg-emerald-500/10 border border-emerald-200 rounded-xl p-4',
     'bg-emerald-50 border border-emerald-200 rounded-xl p-4'),

    # ── Admin validation action buttons ──────────────────────────
    ("'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'",
     "'border-emerald-400 bg-emerald-50 text-emerald-700'"),
    ("'border-red-500/40 bg-red-500/10 text-red-300'",
     "'border-red-400 bg-red-50 text-red-700'"),
    ("'border-orange-500/40 bg-orange-500/10 text-orange-300'",
     "'border-orange-400 bg-orange-50 text-orange-700'"),

    # ── Admin validation pending indicator ────────────────────────
    ("'bg-amber-500/30 text-amber-300'",  "'bg-amber-100 text-amber-700'"),
    ('bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full',
     'bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full'),

    # ── Admin flag icon colors ────────────────────────────────────
    ('text-emerald-400', 'text-emerald-600'),
    ('text-amber-400',   'text-amber-600'),

    # ── Admin login shadow (keep) & admin page error text ─────────
    ('text-red-400 flex-shrink-0', 'text-red-500 flex-shrink-0'),
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
