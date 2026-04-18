export function formatCurrency(value: number) {
	try {
		return new Intl.NumberFormat('en-SG', {
			style: 'currency',
			currency: 'SGD',
			maximumFractionDigits: 0
		}).format(value);
	} catch {
		return `$${Math.round(value)}`;
	}
}
