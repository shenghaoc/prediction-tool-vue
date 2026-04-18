import en from '@@/locales/en.json';
import zh from '@@/locales/zh.json';

export type Language = 'en' | 'zh';

const dictionaries = { en, zh } as const;

function getValue(language: Language, key: string) {
	let current: unknown = dictionaries[language];

	for (const segment of key.split('.')) {
		if (!current || typeof current !== 'object' || !(segment in current)) {
			return undefined;
		}

		current = (current as Record<string, unknown>)[segment];
	}

	return typeof current === 'string' ? current : undefined;
}

export function translate(language: Language, key: string) {
	return getValue(language, key) ?? getValue('en', key) ?? key;
}
