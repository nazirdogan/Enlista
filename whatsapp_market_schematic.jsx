import { useState } from "react";

const data = {
  globalPlatforms: [
    { name: "Gallabox", tier: "Growth", price: "$89/mo", users: "3 users", focus: "Generic", color: "#6B7280" },
    { name: "Gallabox", tier: "Scale", price: "$197/mo", users: "6 users", focus: "Generic", color: "#6B7280" },
    { name: "Respond.io", tier: "Growth", price: "$49/mo", users: "5 users", focus: "Generic", color: "#6B7280" },
    { name: "Respond.io", tier: "Pro", price: "$99/mo", users: "10 users", focus: "Generic", color: "#6B7280" },
    { name: "Wati", tier: "Standard", price: "$59/mo", users: "5 users", focus: "Generic", color: "#6B7280" },
    { name: "Wati", tier: "Pro", price: "$119/mo", users: "Unlimited", focus: "Generic", color: "#6B7280" },
  ],
  realEstatePlatforms: [
    { name: "Conversure.ae", tier: "Starter", price: "AED 150/mo", users: "5 agents", focus: "UAE RE", color: "#0EA5E9" },
    { name: "Conversure.ae", tier: "Growth", price: "AED 299/mo", users: "15 agents", focus: "UAE RE", color: "#0EA5E9" },
    { name: "Conversure.ae", tier: "Pro", price: "AED 799/mo", users: "Unlimited", focus: "UAE RE", color: "#0EA5E9" },
    { name: "PropSpace CRM", tier: "Per Agent", price: "€220/agent/mo", users: "Min 3 agents", focus: "UAE RE", color: "#0EA5E9" },
    { name: "WhatsCRM", tier: "Basic", price: "AED 69/mo", users: "1 user", focus: "UAE SMB", color: "#0EA5E9" },
    { name: "WhatsCRM", tier: "Pro", price: "AED 299/mo", users: "5 users", focus: "UAE SMB", color: "#0EA5E9" },
  ],
  enlistaAgent: {
    recommended: "AED 249/mo",
    sweet_spot: "AED 199–349/mo",
    features: [
      { icon: "🎙️", label: "Voice-to-listing", desc: "Speak property details, get full copy in <60 sec" },
      { icon: "🌐", label: "Bilingual EN+AR copy", desc: "Native Arabic — not translated" },
      { icon: "🏠", label: "Portal-ready listings", desc: "Bayut, Property Finder, Dubizzle formats" },
      { icon: "💬", label: "WhatsApp message draft", desc: "Ready-to-paste client message, auto-generated" },
      { icon: "📸", label: "Instagram caption", desc: "Scroll-stopping caption with hashtags" },
      { icon: "✅", label: "RERA compliance check", desc: "Auto-flags non-compliant language" },
      { icon: "🎯", label: "Lead scoring", desc: "Prioritise hottest leads automatically" },
    ],
    roi: "1 extra deal/month = AED 30,000+ commission. Enlista pays for itself in minutes."
  }
};

const MetaCosts = () => (
  <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📡 Meta WhatsApp API — UAE Message Costs (Effective Jul 2025)</p>
    <div className="grid grid-cols-4 gap-3">
      {[
        { type: "Marketing", cost: "AED 0.16", eg: "New listing blasts", color: "text-orange-400" },
        { type: "Utility", cost: "AED 0.084", eg: "Viewing confirmations", color: "text-blue-400" },
        { type: "Authentication", cost: "AED 0.084", eg: "OTP / login", color: "text-purple-400" },
        { type: "Inbound Reply", cost: "FREE", eg: "Client responses (24hr window)", color: "text-green-400" },
      ].map(m => (
        <div key={m.type} className="bg-gray-800 rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${m.color}`}>{m.cost}</p>
          <p className="text-white text-xs font-semibold mt-1">{m.type}</p>
          <p className="text-gray-400 text-xs mt-1">{m.eg}</p>
        </div>
      ))}
    </div>
    <p className="text-gray-500 text-xs mt-2 text-center">↑ This is the infrastructure cost every platform charges ON TOP of their subscription fee</p>
  </div>
);

const MarketLayer = ({ title, subtitle, badge, items, bg, border, textColor, badgeColor }) => (
  <div className={`rounded-xl p-5 mb-4 border ${bg} ${border}`}>
    <div className="flex items-center gap-3 mb-4">
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
      <div>
        <p className={`font-bold text-sm ${textColor}`}>{title}</p>
        <p className="text-gray-400 text-xs">{subtitle}</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-900 bg-opacity-60 rounded-lg p-3 border border-gray-700">
          <p className="text-white text-xs font-bold">{item.name}</p>
          <p className="text-gray-400 text-xs">{item.tier}</p>
          <p className={`text-sm font-bold mt-1 ${item.focus === "UAE RE" ? "text-sky-400" : "text-gray-300"}`}>{item.price}</p>
          <p className="text-gray-500 text-xs">{item.users}</p>
        </div>
      ))}
    </div>
  </div>
);

const EnlistaAgentCard = () => {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="rounded-xl border-2 border-emerald-500 bg-gray-900 p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">YOUR PRODUCT</div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white text-lg font-bold">Enlista — Individual Agent Plan</p>
          <p className="text-gray-400 text-sm">Content generation + AI listing workflow</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 text-2xl font-bold">AED 249<span className="text-sm font-normal text-gray-400">/mo</span></p>
          <p className="text-gray-500 text-xs">Sweet spot: AED 199–349</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.enlistaAgent.features.map((f, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 border transition-all cursor-default ${hovered === i ? "border-emerald-500 bg-emerald-950" : "border-gray-700 bg-gray-800"}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <p className="text-sm">{f.icon} <span className="text-white font-semibold">{f.label}</span></p>
            <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-950 border border-emerald-700 rounded-lg p-3 text-center">
        <p className="text-emerald-300 text-xs font-semibold">💰 ROI Anchor</p>
        <p className="text-white text-sm mt-1">{data.enlistaAgent.roi}</p>
      </div>
    </div>
  );
};

const CompetitorBar = () => {
  const competitors = [
    { name: "WhatsCRM (Basic)", price: 69, currency: "AED", color: "bg-gray-600" },
    { name: "Conversure Starter", price: 150, currency: "AED", color: "bg-sky-700" },
    { name: "Respond.io Growth", price: 180, currency: "AED", note: "≈$49", color: "bg-gray-600" },
    { name: "Conversure Growth", price: 299, currency: "AED", color: "bg-sky-700" },
    { name: "Wati Pro", price: 437, currency: "AED", note: "≈$119", color: "bg-gray-600" },
    { name: "Enlista Agent (rec.)", price: 249, currency: "AED", color: "bg-emerald-500", highlight: true },
    { name: "Conversure Pro", price: 799, currency: "AED", color: "bg-sky-700" },
    { name: "Gallabox Scale", price: 724, currency: "AED", note: "≈$197", color: "bg-gray-600" },
  ].sort((a, b) => a.price - b.price);

  const max = Math.max(...competitors.map(c => c.price));

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-700 mb-6">
      <p className="text-white font-bold text-sm mb-1">Pricing Landscape — Monthly Subscription (AED)</p>
      <p className="text-gray-400 text-xs mb-4">All converted to AED at 1 USD ≈ AED 3.67 | <span className="text-sky-400">Sky blue = UAE Real Estate specific</span> | <span className="text-emerald-400">Green = Enlista</span></p>
      <div className="space-y-2">
        {competitors.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <p className={`text-xs w-40 flex-shrink-0 ${c.highlight ? "text-emerald-400 font-bold" : "text-gray-400"}`}>{c.name}</p>
            <div className="flex-1 bg-gray-800 rounded-full h-6 relative">
              <div
                className={`${c.color} h-6 rounded-full flex items-center justify-end pr-2 transition-all`}
                style={{ width: `${(c.price / max) * 100}%` }}
              >
                <span className={`text-xs font-bold ${c.highlight ? "text-black" : "text-white"}`}>
                  AED {c.price}{c.note ? ` (${c.note})` : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DifferentiatorTable = () => {
  const rows = [
    { feature: "WhatsApp message drafting", enlista: true, conversure: true, gallabox: false, wati: false },
    { feature: "Auto-send / broadcast", enlista: false, conversure: true, gallabox: true, wati: true },
    { feature: "Bilingual EN+AR (native)", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "Voice-to-listing input", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "Bayut / PF / Dubizzle copy", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "RERA compliance check", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "Instagram caption", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "Lead scoring", enlista: true, conversure: false, gallabox: false, wati: false },
    { feature: "CRM sync (Bitrix24 etc.)", enlista: false, conversure: true, gallabox: true, wati: false },
    { feature: "Chatbot / auto-reply AI", enlista: false, conversure: true, gallabox: true, wati: true },
  ];

  const Check = ({ val }) => (
    <span className={`text-base font-bold ${val ? "text-emerald-400" : "text-gray-600"}`}>{val ? "✓" : "—"}</span>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-700 mb-6">
      <p className="text-white font-bold text-sm mb-4">Feature Differentiation Map</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 pb-2 font-normal">Feature</th>
            <th className="text-center text-emerald-400 pb-2 font-bold">Enlista</th>
            <th className="text-center text-sky-400 pb-2 font-normal">Conversure</th>
            <th className="text-center text-gray-400 pb-2 font-normal">Gallabox</th>
            <th className="text-center text-gray-400 pb-2 font-normal">Wati</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-gray-800 ${i % 2 === 0 ? "bg-gray-800 bg-opacity-30" : ""}`}>
              <td className="py-2 text-gray-300">{r.feature}</td>
              <td className="py-2 text-center"><Check val={r.enlista} /></td>
              <td className="py-2 text-center"><Check val={r.conversure} /></td>
              <td className="py-2 text-center"><Check val={r.gallabox} /></td>
              <td className="py-2 text-center"><Check val={r.wati} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 p-3 bg-amber-950 border border-amber-700 rounded-lg">
        <p className="text-amber-300 text-xs font-semibold">⚡ Opportunity Gap</p>
        <p className="text-gray-300 text-xs mt-1">No competitor offers bilingual content generation + RERA compliance + multi-portal formatting. Enlista owns this space entirely. Adding WhatsApp auto-send (Business API) would make it unbeatable.</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="bg-gray-950 min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Enlista Strategic Analysis</p>
          <h1 className="text-white text-2xl font-bold">WhatsApp Automation Market</h1>
          <p className="text-gray-400 text-sm mt-1">Global → Real Estate → Dubai → Where Enlista sits</p>
        </div>

        {/* Meta API costs */}
        <MetaCosts />

        {/* Market Layers */}
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Market Layers — Monthly Platform Fees</p>
        <MarketLayer
          title="Global WhatsApp Automation Platforms"
          subtitle="No industry specialisation — horizontal tools for any business"
          badge="🌍 GLOBAL"
          items={data.globalPlatforms}
          bg="bg-gray-800 bg-opacity-40"
          border="border-gray-700"
          textColor="text-gray-300"
          badgeColor="bg-gray-700 text-gray-300"
        />
        <div className="flex justify-center my-1"><p className="text-gray-600 text-xs">▼ specialisation premium increases ▼</p></div>
        <MarketLayer
          title="UAE Real Estate WhatsApp / CRM Tools"
          subtitle="Dubai-specific, real estate focused — higher willingness to pay"
          badge="🇦🇪 DUBAI RE"
          items={data.realEstatePlatforms}
          bg="bg-sky-950 bg-opacity-40"
          border="border-sky-800"
          textColor="text-sky-300"
          badgeColor="bg-sky-800 text-sky-200"
        />
        <div className="flex justify-center my-1"><p className="text-gray-600 text-xs">▼ deepest specialisation = highest pricing power ▼</p></div>

        {/* Enlista Agent Card */}
        <EnlistaAgentCard />

        <div className="my-6 border-t border-gray-800" />

        {/* Competitor bar chart */}
        <CompetitorBar />

        {/* Feature diff table */}
        <DifferentiatorTable />

        {/* Pricing Recommendation Box */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Floor Price",
              price: "AED 199/mo",
              note: "Compete with Conversure Starter (AED 150) while offering 4× more value. Only if heavy discounting needed for early adopters.",
              color: "border-gray-600 bg-gray-800"
            },
            {
              label: "Recommended",
              price: "AED 249/mo",
              note: "Sweet spot. Comfortable premium over generic tools. Easy ROI story. ≈ AED 8/day for unlimited AI listing generation.",
              color: "border-emerald-500 bg-emerald-950",
              highlight: true
            },
            {
              label: "Ceiling Price",
              price: "AED 349/mo",
              note: "Justified once brand is established. Positions Enlista firmly above Conversure Starter and near Growth tier.",
              color: "border-gray-600 bg-gray-800"
            },
          ].map((p, i) => (
            <div key={i} className={`rounded-xl p-4 border ${p.color}`}>
              <p className={`text-xs font-bold uppercase mb-2 ${p.highlight ? "text-emerald-400" : "text-gray-400"}`}>{p.label}</p>
              <p className={`text-2xl font-bold mb-2 ${p.highlight ? "text-emerald-300" : "text-white"}`}>{p.price}</p>
              <p className="text-gray-400 text-xs">{p.note}</p>
            </div>
          ))}
        </div>

        {/* Unlock card */}
        <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-700 rounded-xl p-5">
          <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">🚀 Unlock: Add WhatsApp Business API Sending</p>
          <p className="text-white text-sm mb-3">If Enlista added actual WhatsApp sending (auto-follow-ups, broadcast new listings to opted-in contacts, chatbot for Bayut/PF lead routing), it would become the only tool in Dubai that handles the full loop: <strong>create listing → auto-draft WhatsApp → send WhatsApp → nurture lead</strong>. This unlocks a completely different price ceiling.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-3">
              <p className="text-purple-300 text-xs font-bold">Agent Plan with API</p>
              <p className="text-white text-xl font-bold">AED 399–499/mo</p>
              <p className="text-gray-400 text-xs">Content gen + auto-send + follow-ups</p>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-3">
              <p className="text-purple-300 text-xs font-bold">Agency Plan (10+ agents)</p>
              <p className="text-white text-xl font-bold">AED 999–2,499/mo</p>
              <p className="text-gray-400 text-xs">Replaces both PropSpace WA add-on + Conversure Pro</p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-xs text-center mt-4">Data: Conversure.ae, Gallabox, Wati, Respond.io, PropSpace, Meta WABA UAE pricing — April 2026</p>
      </div>
    </div>
  );
}
