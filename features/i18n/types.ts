export type SupportedLocale = 'en' | 'ru' | 'fr' | 'de' | 'es' | 'pt';

export type MessageDictionary = Record<string, string>;

export type LocaleBundle = {
  locale: SupportedLocale;
  messages: MessageDictionary;
  displayName: string;
};

