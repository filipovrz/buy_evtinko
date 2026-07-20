import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./config";
import { getDictionary, resolveLocale, type Dictionary, type LocaleCode } from "./get-dictionary";

export async function getServerLocale(): Promise<LocaleCode> {
  const jar = await cookies();
  return resolveLocale(jar.get(LOCALE_COOKIE)?.value);
}

export async function getServerDictionary(): Promise<{ locale: LocaleCode; t: Dictionary }> {
  const locale = await getServerLocale();
  return { locale, t: getDictionary(locale) };
}
