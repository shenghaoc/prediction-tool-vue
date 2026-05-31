const LOCALE_BY_CODE: Record<string, string> = {
	en: 'en-SG',
	zh: 'zh-Hans-SG'
};

export function resolveNumberLocale(localeCode: string) {
	return LOCALE_BY_CODE[localeCode] ?? 'en-SG';
}

export function formatCurrency(value: number, localeCode = 'en') {
	const locale = resolveNumberLocale(localeCode);

	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'SGD',
			maximumFractionDigits: 0
		}).format(value);
	} catch {
		return `$${Math.round(value)}`;
	}
}
