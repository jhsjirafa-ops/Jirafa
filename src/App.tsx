import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  Palette, 
  Type as TypeIcon, 
  Image as ImageIcon,
  Layout, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  Download, 
  Share2, 
  ArrowLeft,
  Info
} from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/src/lib/utils";
import { BrandBible, BrandColor, FontPairing } from "@/src/types";
import LogoGenerator from "@/src/components/LogoGenerator";
import BrandChatbot from "@/src/components/BrandChatbot";

export default function App() {
  const [mission, setMission] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [logoSize, setLogoSize] = useState<"1K" | "2K" | "4K">("1K");

  const generateBrandStrategy = async () => {
    if (!mission.trim() || !brandName.trim()) return;
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a comprehensive brand identity strategy for a company named "${brandName}" with the following mission: "${mission}".
        The output must be a JSON object with the following structure:
        {
          "name": string,
          "mission": string,
          "tagline": string,
          "palette": Array<{ hex: string, name: string, usage: string }>,
          "typography": {
            "header": { "family": string, "weight": string, "source": "Google Fonts" },
            "body": { "family": string, "weight": string, "source": "Google Fonts" },
            "rationale": string
          },
          "usageNotes": string,
          "logoPrompt": string,
          "secondaryMarkPrompt": string
        }
        The logoPrompt and secondaryMarkPrompt should be detailed, artistic, and suitable for an AI image generator. They should focus on minimalism, modern aesthetics, and the brand's core values.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              mission: { type: Type.STRING },
              tagline: { type: Type.STRING },
              palette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                    usage: { type: Type.STRING },
                  },
                  required: ["hex", "name", "usage"],
                },
              },
              typography: {
                type: Type.OBJECT,
                properties: {
                  header: {
                    type: Type.OBJECT,
                    properties: {
                      family: { type: Type.STRING },
                      weight: { type: Type.STRING },
                      source: { type: Type.STRING },
                    },
                    required: ["family", "weight", "source"],
                  },
                  body: {
                    type: Type.OBJECT,
                    properties: {
                      family: { type: Type.STRING },
                      weight: { type: Type.STRING },
                      source: { type: Type.STRING },
                    },
                    required: ["family", "weight", "source"],
                  },
                  rationale: { type: Type.STRING },
                },
                required: ["header", "body", "rationale"],
              },
              usageNotes: { type: Type.STRING },
              logoPrompt: { type: Type.STRING },
              secondaryMarkPrompt: { type: Type.STRING },
            },
            required: ["name", "mission", "tagline", "palette", "typography", "usageNotes", "logoPrompt", "secondaryMarkPrompt"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}") as BrandBible;
      
      // Load fonts dynamically
      const headerFont = data.typography.header.family.replace(/\s+/g, "+");
      const bodyFont = data.typography.body.family.replace(/\s+/g, "+");
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${headerFont}:wght@400;700&family=${bodyFont}:wght@400;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);

      setBrandBible(data);
    } catch (error) {
      console.error("Error generating brand strategy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setBrandBible(null);
    setMission("");
    setBrandName("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>BrandForge</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          </button>
          {brandBible && (
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              New Brand
            </button>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!brandBible ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center space-y-12 py-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                  Forge your brand's <br />
                  <span className="text-gray-400">digital soul.</span>
                </h1>
                <p className="text-lg text-gray-500 max-w-md mx-auto">
                  Describe your mission, and we'll craft a complete visual identity, from logos to palettes.
                </p>
              </div>

              <div className="space-y-6 text-left bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Luminara, EcoStream, Nexus"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company Mission</label>
                  <textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    placeholder="Describe what you do and why it matters..."
                    rows={4}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Logo Resolution</label>
                  <div className="flex gap-2">
                    {(["1K", "2K", "4K"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setLogoSize(size)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          logoSize === size ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateBrandStrategy}
                  disabled={isLoading || !mission.trim() || !brandName.trim()}
                  className="w-full py-5 bg-black text-white rounded-2xl text-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Forging Identity...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate Brand Bible
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
                    <Layout className="w-4 h-4" />
                    Brand Bible 2026
                  </div>
                  <h1 className="text-6xl font-bold tracking-tighter">{brandBible.name}</h1>
                  <p className="text-2xl text-gray-400 font-medium italic">"{brandBible.tagline}"</p>
                </div>
                <div className="flex gap-3">
                  <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Assets
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Visuals */}
                <div className="lg:col-span-8 space-y-12">
                  {/* Logos */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                      <ImageIcon className="w-4 h-4" />
                      Visual Identity
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <LogoGenerator
                        label="Primary Logo"
                        prompt={brandBible.logoPrompt}
                        size={logoSize}
                        onLogoGenerated={() => {}}
                      />
                      <LogoGenerator
                        label="Secondary Mark"
                        prompt={brandBible.secondaryMarkPrompt}
                        size={logoSize}
                        onLogoGenerated={() => {}}
                      />
                    </div>
                  </section>

                  {/* Color Palette */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                      <Palette className="w-4 h-4" />
                      Color Strategy
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {brandBible.palette.map((color, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group space-y-3"
                        >
                          <div
                            className="aspect-square rounded-2xl shadow-inner border border-black/5 flex items-end p-3 relative overflow-hidden"
                            style={{ backgroundColor: color.hex }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                              {color.hex}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-900">{color.name}</h4>
                            <p className="text-[10px] text-gray-400 leading-tight">{color.usage}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Usage Notes */}
                  <section className="p-8 bg-white border border-gray-100 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                      <Info className="w-4 h-4" />
                      Brand Voice & Usage
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <Markdown>{brandBible.usageNotes}</Markdown>
                    </div>
                  </section>
                </div>

                {/* Right Column: Typography & Mission */}
                <div className="lg:col-span-4 space-y-12">
                  {/* Mission Card */}
                  <section className="p-8 bg-black text-white rounded-3xl space-y-6 shadow-2xl shadow-black/10">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">The Mission</h3>
                      <p className="text-lg font-medium leading-relaxed">
                        {brandBible.mission}
                      </p>
                    </div>
                  </section>

                  {/* Typography */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                      <TypeIcon className="w-4 h-4" />
                      Typography
                    </div>
                    <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Header</span>
                          <span className="text-[10px] font-medium text-gray-300">{brandBible.typography.header.source}</span>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: brandBible.typography.header.family }}>
                            {brandBible.typography.header.family}
                          </h2>
                          <p className="text-xs text-gray-400">{brandBible.typography.header.weight} Weight</p>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Body</span>
                          <span className="text-[10px] font-medium text-gray-300">{brandBible.typography.body.source}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg leading-relaxed text-gray-600" style={{ fontFamily: brandBible.typography.body.family }}>
                            The quick brown fox jumps over the lazy dog. A brand is more than just a logo; it's the emotional connection between a company and its audience.
                          </p>
                          <p className="text-xs text-gray-400">{brandBible.typography.body.weight} Weight</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                          <span className="font-bold text-gray-700 not-italic">Rationale:</span> {brandBible.typography.rationale}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chatbot */}
      <BrandChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        brandContext={brandBible ? `Brand: ${brandBible.name}, Mission: ${brandBible.mission}, Tagline: ${brandBible.tagline}` : ""}
      />

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400">
          &copy; 2026 BrandForge AI. Crafted for visionaries.
        </p>
      </footer>
    </div>
  );
}
