import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Await the locale promise
  let locale = await requestLocale;

  // 2. Validate the locale. If invalid (or undefined), fallback to default.
  // We cast 'as any' to avoid strict string literal checks against the routing array.
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    // [FIX] You must return the valid locale here
    locale,
    // 3. Load the corresponding message file
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});