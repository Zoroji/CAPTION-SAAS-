import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Pricing Plans - Caption SaaS AI",
  description: "Flexible, scalable pricing plans tailored for creators, marketers, and enterprise teams.",
};

const PRICING_TIERS = [
  {
    name: "Starter Creator",
    id: "tier-starter",
    priceMonthly: "$19",
    priceAnnual: "$190",
    description: "Perfect for independent creators and emerging influencers building an audience.",
    features: [
      "Up to 250 AI caption generations per month",
      "5 Tone of Voice presets (Casual, Professional, Witty, Storyteller, Viral)",
      "Standard hashtag generation & trending insights",
      "Export to Instagram, TikTok, LinkedIn, and X",
      "Single user seat",
      "Community Discord support",
      "7-day caption archive history",
    ],
    highlight: false,
    cta: "Start Free 7-Day Trial",
  },
  {
    name: "Pro Marketer",
    id: "tier-pro",
    priceMonthly: "$49",
    priceAnnual: "$490",
    description: "Designed for power creators, social media managers, and growing brands.",
    features: [
      "Unlimited AI caption generations",
      "Custom Brand Voice training (upload up to 10 past posts or style guides)",
      "Multi-modal image context awareness (vision captioning)",
      "Advanced SEO & algorithmic engagement optimizer",
      "Bulk CSV / spreadsheet caption generation (up to 500 at once)",
      "3 team member seats with workspace collaboration",
      "Priority API access with 60 req/min rate limit",
      "Dedicated email & chat support within 4 hours",
    ],
    highlight: true,
    cta: "Claim Pro Plan",
  },
  {
    name: "Enterprise Studio",
    id: "tier-enterprise",
    priceMonthly: "$199",
    priceAnnual: "$1,990",
    description: "Built for agencies, marketing studios, and high-velocity digital brands.",
    features: [
      "Unlimited AI generations with fine-tuned private models",
      "Unlimited team seats and custom role-based permissions",
      "Direct API integrations & Webhook dispatch pipelines",
      "Automated image & video ingestion via S3 / GCS cloud buckets",
      "Custom compliance and profanity filtering guards",
      "Dedicated account manager & quarterly strategy reviews",
      "99.9% uptime SLA guarantee",
      "Custom billing terms, invoicing, and vendor onboarding",
    ],
    highlight: false,
    cta: "Contact Enterprise Sales",
  },
];

const FAQS = [
  {
    q: "How does the AI understand the context of my images?",
    a: "Our multimodal engine combines high-dimensional vector embeddings with state-of-the-art vision models to interpret visual elements, mood, lighting, cultural tropes, and scenery before generating tailored captions.",
  },
  {
    q: "Can I switch or cancel my plan at any time?",
    a: "Yes, you can upgrade, downgrade, or cancel your subscription at any point right from your billing dashboard with zero cancellation penalties.",
  },
  {
    q: "Is there an API available for programmatic captioning?",
    a: "Yes! Pro and Enterprise tiers include direct access to our REST API and SDKs for Python, Node.js, and Go.",
  },
  {
    q: "Do you offer discounts for educational or non-profit organizations?",
    a: "We offer a 30% lifetime discount for certified educational institutions, open-source initiatives, and registered non-profits.",
  },
  {
    q: "What platforms are supported for direct export?",
    a: "We currently support direct copy-formatting and webhook dispatches for Instagram (Reels & Feed), TikTok, LinkedIn, YouTube Shorts, Pinterest, and Twitter/X.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-16 px-6 sm:px-12 lg:px-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-xs font-medium text-neutral-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Transparent Pricing • No Hidden Fees
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Supercharge Your Content Pipeline
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
          Produce viral, audience-tested captions in seconds. Choose the tier that matches your publishing velocity.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
              tier.highlight
                ? "bg-neutral-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10"
                : "bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-xs font-semibold uppercase tracking-wider rounded-full text-white shadow">
                Most Popular
              </span>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">{tier.name}</h2>
              <p className="mt-2 text-sm text-neutral-400 min-h-[40px]">{tier.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">{tier.priceMonthly}</span>
              <span className="text-sm font-medium text-neutral-400"> / month</span>
              <p className="text-xs text-neutral-500 mt-1">or {tier.priceAnnual}/year billed annually</p>
            </div>

            <button
              type="button"
              className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-150 mb-8 ${
                tier.highlight
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              }`}
            >
              {tier.cta}
            </button>

            <div className="flex-1 space-y-3 border-t border-neutral-800 pt-6">
              <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                What&apos;s included
              </h3>
              <ul className="space-y-3 text-sm text-neutral-300">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-5xl mx-auto mb-24">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Detailed Feature Comparison
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-800/60 text-xs uppercase text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Capability</th>
                <th className="px-6 py-4 font-semibold">Starter</th>
                <th className="px-6 py-4 font-semibold">Pro</th>
                <th className="px-6 py-4 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr>
                <td className="px-6 py-4 font-medium text-white">Monthly Generations</td>
                <td className="px-6 py-4">250</td>
                <td className="px-6 py-4 text-indigo-400 font-semibold">Unlimited</td>
                <td className="px-6 py-4 text-indigo-400 font-semibold">Unlimited (Private Model)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">Multimodal Vision Processing</td>
                <td className="px-6 py-4">Standard</td>
                <td className="px-6 py-4">High Definition</td>
                <td className="px-6 py-4">Ultra HD / Multi-Frame</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">Brand Voice Customization</td>
                <td className="px-6 py-4">Preset Only</td>
                <td className="px-6 py-4">Up to 10 Personas</td>
                <td className="px-6 py-4">Unlimited Fine-tuned</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">API Access</td>
                <td className="px-6 py-4 text-neutral-500">Not Included</td>
                <td className="px-6 py-4">Included (60 req/min)</td>
                <td className="px-6 py-4">Dedicated High-Throughput</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">Support SLA</td>
                <td className="px-6 py-4">Discord Community</td>
                <td className="px-6 py-4">4h Email/Chat</td>
                <td className="px-6 py-4">Dedicated Slack + SLA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="font-semibold text-white text-base mb-2">{faq.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center pt-8 border-t border-neutral-800">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
