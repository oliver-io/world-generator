export * from './config';

export function shuffle<T>(array: T[]):Array<T> {
	return array
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
}
