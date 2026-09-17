
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chip: {
					'open-bg': 'hsl(var(--chip-open-bg))',
					'open-fg': 'hsl(var(--chip-open-fg))',
					'closed-bg': 'hsl(var(--chip-closed-bg))',
					'closed-fg': 'hsl(var(--chip-closed-fg))',
					'fast-bg': 'hsl(var(--chip-fast-bg))',
					'fast-fg': 'hsl(var(--chip-fast-fg))',
					'medium-bg': 'hsl(var(--chip-medium-bg))',
					'medium-fg': 'hsl(var(--chip-medium-fg))',
					'slow-bg': 'hsl(var(--chip-slow-bg))',
					'slow-fg': 'hsl(var(--chip-slow-fg))',
					'warning-bg': 'hsl(var(--chip-warning-bg))',
					'warning-fg': 'hsl(var(--chip-warning-fg))',
				},
				agent: {
					'a-bg': 'hsl(var(--agent-a-bg))', 'a-fg': 'hsl(var(--agent-a-fg))',
					'b-bg': 'hsl(var(--agent-b-bg))', 'b-fg': 'hsl(var(--agent-b-fg))',
					'c-bg': 'hsl(var(--agent-c-bg))', 'c-fg': 'hsl(var(--agent-c-fg))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				apple: {
					purple: '#9b87f5',
					blue: '#0EA5E9',
					'light-blue': '#E5F6FF',
					'light-purple': '#F5F1FF',
					gray: '#F6F6F7',
					'light-gray': '#F9FAFB',
					'dark-gray': '#333333'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				display: ['Fraunces Variable', 'Georgia', 'serif'],
				sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
				mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-slow': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-in-slow': 'fade-in-slow 0.8s ease-out'
			},
			boxShadow: {
				'apple': '0 4px 20px rgba(0, 0, 0, 0.05)',
				'apple-hover': '0 8px 30px rgba(0, 0, 0, 0.08)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
