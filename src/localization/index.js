import en from './en';
import ja from './ja';

const localizations = [
  en,
  ja,
];

export const defaultLanguage = 'en-us';

export default (...languages) => {
  languages = languages.concat(defaultLanguage)
    .map(lang => lang.toLowerCase());

  for (const lang of languages) {
    const hit = localizations.find(loc => loc.accept.includes(lang));
    if (hit) {
      return hit;
    }
  }

  return null;
};

export const acceptedLanguages =
  localizations.map(({ accept, native }) => ({ accept, native }));
