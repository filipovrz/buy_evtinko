import type { LocaleCode } from "./config";

export type ContentFields = {
  name: string;
  shortDesc?: string | null;
  description?: string | null;
  features?: string | null;
  requirements?: string | null;
  translations?: string | null;
};

type LocalePack = {
  name?: string;
  shortDesc?: string;
  description?: string;
  features?: string[] | string;
  requirements?: string;
};

/**
 * English fields on the model are canonical.
 * Other locales come from `translations` JSON: { "bg": { name, shortDesc, ... }, "de": {...} }
 */
export function localizeContent<T extends ContentFields>(item: T, locale: LocaleCode) {
  if (locale === "en" || !item.translations) {
    return {
      name: item.name,
      shortDesc: item.shortDesc || "",
      description: item.description || "",
      features: item.features,
      requirements: item.requirements || "",
    };
  }

  try {
    const map = JSON.parse(item.translations) as Record<string, LocalePack>;
    const pack = map[locale];
    if (!pack) {
      return {
        name: item.name,
        shortDesc: item.shortDesc || "",
        description: item.description || "",
        features: item.features,
        requirements: item.requirements || "",
      };
    }
    return {
      name: pack.name || item.name,
      shortDesc: pack.shortDesc || item.shortDesc || "",
      description: pack.description || item.description || "",
      features:
        pack.features == null
          ? item.features
          : Array.isArray(pack.features)
            ? JSON.stringify(pack.features)
            : pack.features,
      requirements: pack.requirements || item.requirements || "",
    };
  } catch {
    return {
      name: item.name,
      shortDesc: item.shortDesc || "",
      description: item.description || "",
      features: item.features,
      requirements: item.requirements || "",
    };
  }
}
