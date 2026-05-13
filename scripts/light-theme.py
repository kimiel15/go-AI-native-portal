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
    # Page backgrounds
    ('from-slate-950 via-red-950 to-slate-950', 'from-red-50 via-white to-red-50'),

    # NavBar borders
    ('border-b border-white/10 backdrop-blur-sm bg-white/5', 'border-b border-red-100 bg-white shadow-sm'),
    ('border-white/10 backdrop-blur-sm bg-white/5',           'border-red-100 bg-white shadow-sm'),

    # Text opacity variants
    ('text-white/10', 'text-slate-200'),
    ('text-white/20', 'text-slate-300'),
    ('text-white/30', 'text-slate-400'),
    ('text-white/40', 'text-slate-400'),
    ('text-white/50', 'text-slate-500'),
    ('text-white/60', 'text-slate-500'),
    ('text-white/70', 'text-slate-600'),
    ('text-white/80', 'text-slate-700'),
    ('text-white/90', 'text-slate-800'),
    ('hover:text-white',  'hover:text-slate-900'),

    # Background opacities
    ('bg-white/5',         'bg-white'),
    ('bg-white/8',         'bg-gray-50'),
    ('bg-white/10',        'bg-gray-100'),
    ('bg-white/20',        'bg-gray-200'),
    ('hover:bg-white/8',   'hover:bg-gray-50'),
    ('hover:bg-white/10',  'hover:bg-gray-100'),
    ('hover:bg-white/20',  'hover:bg-gray-200'),

    # Borders
    ('border-white/10', 'border-gray-200'),
    ('border-white/20', 'border-gray-300'),
    ('border-t border-white/10', 'border-t border-gray-200'),  # footer/dividers

    # Inputs / placeholders
    ('placeholder-white/30', 'placeholder-slate-400'),
    ('"bg-slate-900"', '"bg-white"'),

    # Ghost buttons (after bg-white/10 -> bg-gray-100 applied above)
    ('bg-gray-100 hover:bg-gray-200 text-white font-semibold px-8 py-3.5 rounded-xl transition-all border border-gray-200',
     'bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all border border-gray-200'),
    ('bg-gray-100 hover:bg-gray-200 text-white font-semibold py-3 rounded-xl transition-all',
     'bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all'),

    # Heading / label text-white (buttons use font-semibold + py-*, not these)
    ('text-white font-extrabold', 'text-slate-900 font-extrabold'),
    ('text-white font-bold',      'text-slate-900 font-bold'),
    ('text-white font-mono',      'text-slate-900 font-mono'),
    ('text-white font-semibold text-sm uppercase', 'text-slate-900 font-semibold text-sm uppercase'),
    ('text-white font-semibold text-sm',           'text-slate-900 font-semibold text-sm'),
    ('text-white font-semibold text-lg',           'text-slate-900 font-semibold text-lg'),
    ('text-white font-semibold text-xl',           'text-slate-900 font-semibold text-xl'),
    ('text-white font-semibold text-2xl',          'text-slate-900 font-semibold text-2xl'),
    ('text-white font-semibold text-3xl',          'text-slate-900 font-semibold text-3xl'),

    # Alt ordering: size class first, text-white last
    ('text-2xl font-bold text-white',  'text-2xl font-bold text-slate-900'),
    ('text-xl font-bold text-white',   'text-xl font-bold text-slate-900'),
    ('text-lg font-bold text-white',   'text-lg font-bold text-slate-900'),
    ('text-3xl font-bold text-white',  'text-3xl font-bold text-slate-900'),
    ('text-5xl md:text-7xl font-extrabold text-white', 'text-5xl md:text-7xl font-extrabold text-slate-900'),

    # Nav brand / misc trailing
    ('font-bold text-lg tracking-tight text-white', 'font-bold text-lg tracking-tight text-slate-900'),
    ('font-bold text-sm tracking-tight leading-none text-white', 'font-bold text-sm tracking-tight leading-none text-slate-900'),

    # Stat card value
    ('text-3xl font-bold text-slate-900', 'text-3xl font-bold text-slate-900'),  # no-op guard already done
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
