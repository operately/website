/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans],
			  },
			backgroundColor: {
				'operately-blue': '#3185FF',
				'operately-dark-blue': '#024FAC',
				'operately-blue-tint-1': '#E3F2FF',
				'operately-blue-tint-2': '#98C9FF',
			},
			borderColor: {
				'operately-blue': '#3185FF',
				'operately-dark-blue': '#024FAC',
				'operately-blue-tint-1': '#E3F2FF',
				'operately-blue-tint-2': '#98C9FF',
			},
			textColor: {
				'operately-blue': '#3185FF',
				'operately-dark-blue': '#024FAC',
				'operately-blue-tint-1': '#E3F2FF',
				'operately-blue-tint-2': '#98C9FF',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
