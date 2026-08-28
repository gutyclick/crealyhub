export type BrandRecord = {
  name: string; description: string; product_service: string; website: string | null;
  audience: string; objectives: string; tone: string; personality: string;
  default_cta: string; language: string; allowed_phrases: string[];
  forbidden_phrases: string[]; hashtag_rules: string; editorial_rules: string;
};

export type BrandContext = {
  identity: string; offer: string; audience: string; objectives: string;
  voice: string; language: string; guardrails: { allowed: string[]; forbidden: string[] };
  defaultCta: string; hashtagRules: string; editorialRules: string; visualAssets: string[];
};

export function buildBrandContext(brand: BrandRecord): BrandContext {
  return {
    identity: [brand.name, brand.description].filter(Boolean).join(" — "),
    offer: [brand.product_service, brand.website].filter(Boolean).join(" · "),
    audience: brand.audience,
    objectives: brand.objectives,
    voice: [brand.tone, brand.personality].filter(Boolean).join("; "),
    language: brand.language,
    guardrails: { allowed: brand.allowed_phrases, forbidden: brand.forbidden_phrases },
    defaultCta: brand.default_cta,
    hashtagRules: brand.hashtag_rules,
    editorialRules: brand.editorial_rules,
    visualAssets: [],
  };
}
