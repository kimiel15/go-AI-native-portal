'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X, Building2, Github, Lightbulb } from 'lucide-react';

export default function GetStartedModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-tl-red/25 hover:shadow-tl-red/40"
      >
        Get Started <ArrowRight className="w-4 h-4" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">

            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-tl-teal text-xs font-semibold uppercase tracking-widest">Before You Start</span>
                  <h2 className="text-slate-900 font-bold text-xl mt-0.5">Set up your tools</h2>
                  <p className="text-slate-400 text-sm mt-1">Complete both before the build phase begins.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="px-7 py-6 space-y-5 flex-1">

              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-tl-red flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-sm mb-1">
                    Install Claude for Enterprise (C4E) via the Company Portal
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">
                    Search for <strong className="text-slate-700">Claude for Enterprise</strong> in the Company Portal and install from there. Do not install directly from the web.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-amber-700 text-xs font-semibold mb-0.5">Previously installed C4E by bypassing admin?</p>
                    <p className="text-amber-600 text-xs leading-relaxed">Uninstall and reinstall via the Company Portal — some required components may be missing. Your existing chats will be saved.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-tl-red flex items-center justify-center">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-sm mb-1">
                    Request your GitHub EMU account via Jarvis
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">
                    Processing takes approximately <strong className="text-slate-700">30 minutes</strong> — request early.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <p className="text-tl-red text-xs font-semibold uppercase tracking-wide mb-1.5">How to Request</p>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Go to <strong>jarvis.trendmicro.com</strong><br />
                        Category: <strong>Systems &amp; Applications</strong><br />
                        Subcategory: <strong>RDSec</strong> · Service: <strong>GitHub</strong>
                      </p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <p className="text-tl-red text-xs font-semibold uppercase tracking-wide mb-1.5">Select the Correct Action</p>
                      <div className="space-y-1">
                        <p className="text-slate-600 text-xs">New access → <strong>Request GitHub Cloud EMU Permission</strong></p>
                        <p className="text-slate-600 text-xs">Suspended → <strong>Re-activate GitHub Cloud EMU Permission</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Use Claude First */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-tl-teal flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-sm mb-1">Use Claude First — for everything</p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Before reaching for a search engine or a colleague, ask Claude. Research, brainstorming, drafting, debugging, writing your README, preparing your impact analysis — Claude should be your <strong className="text-slate-700">first move</strong> on every task.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-7 pb-7 pt-2">
              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/register'); }}
                className="w-full flex items-center justify-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-tl-red/20"
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
