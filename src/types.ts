export interface BrandColor {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  header: {
    family: string;
    weight: string;
    source: string;
  };
  body: {
    family: string;
    weight: string;
    source: string;
  };
  rationale: string;
}

export interface BrandBible {
  name: string;
  mission: string;
  tagline: string;
  palette: BrandColor[];
  typography: FontPairing;
  usageNotes: string;
  logoPrompt: string;
  secondaryMarkPrompt: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}
