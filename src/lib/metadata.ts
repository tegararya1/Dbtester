export const siteConfig = {
	name: 'Damayanti',
	logo: '/favicon.svg',
	description:
		'Damayanti',
	keywords: 'damayanti, sekolah, digital',
	url: new URL('https://damayanti.vercel.app'),
	ogImage: new URL('https://damayanti.vercel.app/og.png'),
	googleVerification: '@TODO - Replace with your Google verification code',
	yandexVerification: '@TODO - Replace with your Yandex verification code',
	home: 'https://damayanti.vercel.app'
} as const;

export type SiteConfig = typeof siteConfig;