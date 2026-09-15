import React from "react";
import Link from "next/link";

export const metadata = {
  title: "API Documentation & Developer Guide - Caption SaaS AI",
  description: "Comprehensive documentation for Caption SaaS AI multimodal vision engine and caption generation API.",
};

const CODE_EXAMPLE_PYTHON = `import requests

API_KEY = "sk_live_sample_your_caption_api_key"
ENDPOINT = "https://api.captionsaas.ai/v1/generate"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd",
    "tone": "motivational",
    "target_platforms": ["instagram", "tiktok"],
    "max_hashtags": 10,
    "include_call_to_action": True,
    "brand_persona_id": "persona_99a8b"
}

response = requests.post(ENDPOINT, json=payload, headers=headers)
data = response.json()

print(f"Generated Caption: {data['caption']}")
print(f"Recommended Hashtags: {' '.join(data['hashtags'])}")
print(f"Estimated Engagement Score: {data['engagement_score']}/100")`;

const CODE_EXAMPLE_CURL = `curl -X POST https://api.captionsaas.ai/v1/generate \\
  -H "Authorization: Bearer sk_live_sample_your_caption_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd",
    "tone": "humorous",
    "target_platforms": ["twitter", "linkedin"],
    "audience_age_range": "20-35"
  }'`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-16 px-6 sm:px-12 lg:px-24">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Developer Documentation
            </h1>
            <p className="mt-2 text-neutral-400 text-base sm:text-lg">
              Integrate real-time vision captioning, vector similarity, and hashtag intelligence into your apps.
            </p>
          </div>
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition"
          >
            Get API Key →
          </Link>
        </div>

        {/* Quick Nav */}
        <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-400 mb-12">
          <a href="#quickstart" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:text-white">
            #quickstart
          </a>
          <a href="#authentication" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:text-white">
            #authentication
          </a>
          <a href="#endpoints" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:text-white">
            #endpoints
          </a>
          <a href="#payload-schema" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:text-white">
            #payload-schema
          </a>
          <a href="#rate-limits" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:text-white">
            #rate-limits
          </a>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Section: Overview */}
        <section id="quickstart" className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-indigo-500 pl-4">
            1. Quickstart Guide
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            The Caption SaaS API accepts image URLs, raw binary image uploads, or natural language prompts and yields
            context-rich social media captions, tailored hashtags, and engagement probability metrics. Our backend leverages
            FAISS index vector search combined with large-scale vision-language models.
          </p>
        </section>

        {/* Section: Authentication */}
        <section id="authentication" className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-indigo-500 pl-4">
            2. Authentication
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">
            All API requests must include your secret API key in the <code className="bg-neutral-900 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">Authorization</code> HTTP header:
          </p>
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl font-mono text-sm text-neutral-300 overflow-x-auto">
            Authorization: Bearer sk_live_your_secret_api_key_here
          </div>
        </section>

        {/* Section: Code Examples */}
        <section id="endpoints" className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-indigo-500 pl-4">
            3. POST /v1/generate
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">
            Generate customized social media captions from an input photo or visual reference.
          </p>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Python Integration Example
            </h3>
            <pre className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-xl font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed">
              <code>{CODE_EXAMPLE_PYTHON}</code>
            </pre>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              cURL Request Example
            </h3>
            <pre className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-xl font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed">
              <code>{CODE_EXAMPLE_CURL}</code>
            </pre>
          </div>
        </section>

        {/* Section: Schema Table */}
        <section id="payload-schema" className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-indigo-500 pl-4">
            4. Request Body Parameters
          </h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/50">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-800/80 text-xs uppercase text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 font-semibold">Field</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Required</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-xs">
                <tr>
                  <td className="px-6 py-4 text-indigo-300 font-bold">image_url</td>
                  <td className="px-6 py-4 text-neutral-400">string</td>
                  <td className="px-6 py-4 text-emerald-400 font-sans font-semibold">Yes*</td>
                  <td className="px-6 py-4 font-sans text-neutral-300">Publicly accessible image URL (JPG, PNG, WEBP).</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-indigo-300 font-bold">tone</td>
                  <td className="px-6 py-4 text-neutral-400">string</td>
                  <td className="px-6 py-4 text-neutral-500 font-sans">No</td>
                  <td className="px-6 py-4 font-sans text-neutral-300">
                    &quot;casual&quot;, &quot;professional&quot;, &quot;humorous&quot;, &quot;motivational&quot;, &quot;poetic&quot;, &quot;viral&quot;.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-indigo-300 font-bold">target_platforms</td>
                  <td className="px-6 py-4 text-neutral-400">array&lt;string&gt;</td>
                  <td className="px-6 py-4 text-neutral-500 font-sans">No</td>
                  <td className="px-6 py-4 font-sans text-neutral-300">
                    Target networks: [&quot;instagram&quot;, &quot;tiktok&quot;, &quot;linkedin&quot;, &quot;twitter&quot;].
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-indigo-300 font-bold">max_hashtags</td>
                  <td className="px-6 py-4 text-neutral-400">integer</td>
                  <td className="px-6 py-4 text-neutral-500 font-sans">No (Default: 5)</td>
                  <td className="px-6 py-4 font-sans text-neutral-300">Total hashtag tags to produce (0 to 30).</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-indigo-300 font-bold">brand_persona_id</td>
                  <td className="px-6 py-4 text-neutral-400">string</td>
                  <td className="px-6 py-4 text-neutral-500 font-sans">No</td>
                  <td className="px-6 py-4 font-sans text-neutral-300">ID of your fine-tuned brand voice preset.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Rate Limits and Errors */}
        <section id="rate-limits" className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-indigo-500 pl-4">
            5. Rate Limits &amp; Status Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-emerald-400 font-mono text-sm font-bold">200 OK</span>
              <p className="mt-2 text-xs text-neutral-400">
                The image was processed and caption generated successfully.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 font-mono text-sm font-bold">429 Too Many Requests</span>
              <p className="mt-2 text-xs text-neutral-400">
                You have reached your tier&apos;s request rate limit per minute.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-rose-400 font-mono text-sm font-bold">500 Server Error</span>
              <p className="mt-2 text-xs text-neutral-400">
                Vision embedding calculation or generation service encountered an unexpected error.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-neutral-800 flex justify-between items-center text-sm text-neutral-400">
          <Link href="/" className="hover:text-white transition">
            ← Home
          </Link>
          <Link href="/pricing" className="hover:text-white transition">
            View Pricing Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
