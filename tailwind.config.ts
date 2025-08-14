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
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					50: 'hsl(19 75% 95%)',   // Very light orange
					100: 'hsl(19 75% 88%)',  // Light orange
					200: 'hsl(19 75% 75%)',  // Soft orange
					300: 'hsl(19 75% 65%)',  // Medium light orange
					400: 'hsl(19 75% 55%)',  // Medium orange
					500: 'hsl(19 75% 45%)',  // Better Being brand orange #C1581B
					600: 'hsl(19 75% 35%)',  // Darker orange
					700: 'hsl(19 75% 28%)',  // Deep orange
					800: 'hsl(19 75% 22%)',  // Very deep orange
					900: 'hsl(19 75% 15%)',  // Darkest orange
					DEFAULT: '#C1581B',       // Brand orange
					foreground: '#FFFFFF'     // White text on orange
				},
				secondary: {
					50: 'hsl(45 25% 95%)',   // Champagne light
					100: 'hsl(45 25% 88%)',  // Light champagne
					200: 'hsl(45 25% 75%)',  // Soft champagne
					300: 'hsl(45 25% 65%)',  // Medium champagne
					400: 'hsl(45 25% 55%)',  // Champagne
					500: 'hsl(45 25% 45%)',  // Medium champagne
					600: 'hsl(45 25% 35%)',  // Darker champagne
					700: 'hsl(45 25% 28%)',  // Deep champagne
					800: 'hsl(45 25% 22%)',  // Very deep
					900: 'hsl(45 25% 15%)',  // Darkest
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
					50: 'hsl(82 35% 95%)',   // Very light green
					100: 'hsl(82 35% 88%)',  // Light green
					200: 'hsl(82 35% 75%)',  // Soft green
					300: 'hsl(82 35% 65%)',  // Medium light green
					400: 'hsl(82 35% 55%)',  // Medium green
					500: 'hsl(82 35% 45%)',  // Fresh green accent
					600: 'hsl(82 35% 35%)',  // Darker green
					700: 'hsl(82 35% 28%)',  // Deep green
					800: 'hsl(82 35% 22%)',  // Very deep green
					900: 'hsl(82 35% 15%)',  // Darkest green
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
				// Better Being brand specific colors
				'bb-orange': {
					DEFAULT: '#C1581B',
					light: '#E6A373',
					dark: '#8A3C12'
				},
				'bb-champagne': {
					DEFAULT: '#F5F0E8',
					light: '#FEFCFA',
					dark: '#E8DDD0'
				},
				'bb-patsy': {
					DEFAULT: '#6B7280',
					light: '#9CA3AF',
					dark: '#4B5563'
				},
				'bb-black-bean': {
					DEFAULT: '#1F2937',
					light: '#374151',
					dark: '#111827'
				},
				'bb-fresh-green': {
					DEFAULT: '#84CC16',
					light: '#A3E635',
					dark: '#65A30D'
				}
			},
			backgroundImage: {
				'gradient-wellness': 'var(--gradient-wellness)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-premium': 'var(--gradient-premium)',
			},
			boxShadow: {
				'wellness': 'var(--shadow-wellness)',
				'premium': 'var(--shadow-premium)',
				'floating': 'var(--shadow-floating)',
			},
			transitionTimingFunction: {
				'wellness': 'var(--transition-wellness)',
				'bounce-gentle': 'var(--bounce-gentle)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(50px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.8s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;