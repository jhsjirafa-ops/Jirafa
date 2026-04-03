import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Loader2, Image as ImageIcon, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LogoGeneratorProps {
  prompt: string;
  size: "1K" | "2K" | "4K";
  onLogoGenerated: (url: string) => void;
  label: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function LogoGenerator({ prompt, size, onLogoGenerated, label }: LogoGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const checkApiKey = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    setNeedsApiKey(!hasKey);
    return hasKey;
  };

  const generateLogo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hasKey = await checkApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Assume success after opening dialog as per guidelines
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size,
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const url = `data:image/png;base64,${base64Data}`;
          setImageUrl(url);
          onLogoGenerated(url);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image data found in response.");
      }
    } catch (err: any) {
      console.error("Logo generation error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setNeedsApiKey(true);
        setError("API key issue. Please re-select your key.");
      } else {
        setError(err.message || "Failed to generate logo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prompt && !imageUrl && !isLoading) {
      generateLogo();
    }
  }, [prompt]);

  return (
    <div className="flex flex-col gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
        {imageUrl && <CheckCircle className="w-5 h-5 text-green-500" />}
      </div>

      <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative group">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-xs text-gray-400 font-medium animate-pulse">Forging Identity...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-contain p-4"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-300">
            <ImageIcon className="w-12 h-12" />
            <p className="text-xs font-medium">No logo generated yet</p>
          </div>
        )}

        {imageUrl && !isLoading && (
          <button
            onClick={generateLogo}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Regenerate
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {needsApiKey && !isLoading && (
        <button
          onClick={() => window.aistudio.openSelectKey()}
          className="w-full py-2 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Select API Key to Generate
        </button>
      )}

      <div className="text-[10px] text-gray-400 leading-relaxed italic">
        Prompt: {prompt}
      </div>
    </div>
  );
}
