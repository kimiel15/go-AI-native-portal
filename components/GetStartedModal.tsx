'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';

export default function GetStartedModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-tl-red/25 hover:shadow-tl-red/40"
      >
        Get Started <ArrowRight className="w-4 h-4" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-tl-cream border border-tl-teal-light rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-8 pb-5">
              <div>
                <p className="text-tl-teal text-xs font-semibold uppercase tracking-widest mb-1">Before You Start</p>
                <h2 className="text-slate-900 font-bold text-xl">Set up your tools</h2>
                <p className="text-slate-500 text-sm mt-1">Two things to complete before the build phase begins.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-8 pb-8 space-y-4">
              {/* Step 1 — C4E */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-tl-red flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-slate-900 font-semibold text-sm">Install Claude for Enterprise (C4E) via the Company Portal</p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed ml-8">
                  Search for <strong>Claude for Enterprise</strong> in the Company Portal and install from there. Do not install directly from the web.
                </p>
                <div className="mt-3 ml-8 bg-tl-cream border border-tl-teal-light/60 rounded-lg px-3 py-2">
                  <p className="text-tl-teal text-xs font-semibold mb-0.5">Previously installed C4E by bypassing admin?</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Uninstall and reinstall via the Company Portal — some required components may be missing. Your existing chats will be saved.</p>
                </div>
              </div>

              {/* Step 2 — GitHub EMU */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-tl-red flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-slate-900 font-semibold text-sm">Request your GitHub EMU account via Jarvis</p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed ml-8 mb-3">Processing takes approximately 30 minutes. Request early.</p>
                <div className="ml-8 space-y-2">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    <p className="text-tl-red text-xs font-semibold uppercase tracking-wide mb-1">How to Request</p>
                    <p className="text-slate-600 text-xs">Go to <strong>jarvis.trendmicro.com</strong> → Category: <strong>Systems &amp; Applications</strong> · Subcategory: <strong>RDSec</strong> · Service: <strong>GitHub</strong></p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    <p className="text-tl-red text-xs font-semibold uppercase tracking-wide mb-1">Select the Correct Action</p>
                    <p className="text-slate-600 text-xs">
                      New access → <strong>Request GitHub Cloud EMU Permission</strong><br />
                      Suspended → <strong>Re-activate GitHub Cloud EMU Permission</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Use Claude First banner */}
              <div className="border border-tl-teal-light bg-white rounded-xl px-5 py-3">
                <p className="text-tl-teal text-xs font-semibold uppercase tracking-wide mb-1">Use Claude First — For Everything</p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Before reaching for a search engine or a colleague, ask Claude. Research, brainstorming, drafting, debugging, writing your README, preparing your impact analysis — Claude should be your <strong>first move</strong> on every task. This is what working AI-Native looks like in practice.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => { setOpen(false); router.push('/register'); }}
                className="w-full flex items-center justify-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-tl-red/20 mt-2"
              >
                I&apos;m ready — Register my team <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
