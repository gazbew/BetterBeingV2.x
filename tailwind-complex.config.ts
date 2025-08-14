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
				'sm': '480px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1440px',
				'2xl': '1920px'
			}
		},
		extend: {
			fontFamily: {
				heading: ['League Spartan', 'sans-serif'],
				body: ['Playfair Display', 'serif'],
				sans: ['League Spartan', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			letterSpacing: {
				'brand': '0.088em', // 88pt as per Brand Bible
				'body': '0em', // 0pt for body text
			},
		colors: {
			// VIBRANT WELLNESS COLOR SYSTEM - Modern & Engaging
			'primary': {
				50: 'hsl(var(--primary-50))',     // Forest Green - Lightest
				100: 'hsl(var(--primary-100))',   // Very light green
				200: 'hsl(var(--primary-200))',   // Light green
				300: 'hsl(var(--primary-300))',   // Medium light green
				400: 'hsl(var(--primary-400))',   // Medium green
				500: 'hsl(var(--primary-500))',   // Base forest green
				600: 'hsl(var(--primary-600))',   // Darker green
				700: 'hsl(var(--primary-700))',   // Dark green
				800: 'hsl(var(--primary-800))',   // Very dark green
				900: 'hsl(var(--primary-900))',   // Darkest green
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			'secondary': {
				50: 'hsl(var(--secondary-50))',   // Ocean Blue - Lightest
				100: 'hsl(var(--secondary-100))', // Very light blue
				200: 'hsl(var(--secondary-200))', // Light blue
				300: 'hsl(var(--secondary-300))', // Medium light blue
				400: 'hsl(var(--secondary-400))', // Medium blue
				500: 'hsl(var(--secondary-500))', // Base ocean blue
				600: 'hsl(var(--secondary-600))', // Darker blue
				700: 'hsl(var(--secondary-700))', // Dark blue
				800: 'hsl(var(--secondary-800))', // Very dark blue
				900: 'hsl(var(--secondary-900))', // Darkest blue
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			'accent': {
				50: 'hsl(var(--accent-50))',      // Vibrant Orange - Lightest
				100: 'hsl(var(--accent-100))',    // Very light orange
				200: 'hsl(var(--accent-200))',    // Light orange
				300: 'hsl(var(--accent-300))',    // Medium light orange
				400: 'hsl(var(--accent-400))',    // Medium orange
				500: 'hsl(var(--accent-500))',    // Base vibrant orange
				600: 'hsl(var(--accent-600))',    // Darker orange
				700: 'hsl(var(--accent-700))',    // Dark orange
				800: 'hsl(var(--accent-800))',    // Very dark orange
				900: 'hsl(var(--accent-900))',    // Darkest orange
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			'success': {
				50: 'hsl(var(--success-50))',     // Emerald Green - Lightest
				100: 'hsl(var(--success-100))',   // Very light emerald
				200: 'hsl(var(--success-200))',   // Light emerald
				300: 'hsl(var(--success-300))',   // Medium light emerald
				400: 'hsl(var(--success-400))',   // Medium emerald
				500: 'hsl(var(--success-500))',   // Base emerald green
				600: 'hsl(var(--success-600))',   // Darker emerald
				700: 'hsl(var(--success-700))',   // Dark emerald
				800: 'hsl(var(--success-800))',   // Very dark emerald
				900: 'hsl(var(--success-900))',   // Darkest emerald
				DEFAULT: 'hsl(var(--success-500))',
			},
			'warning': {
				50: 'hsl(var(--warning-50))',     // Sunset Purple - Lightest
				100: 'hsl(var(--warning-100))',   // Very light purple
				200: 'hsl(var(--warning-200))',   // Light purple
				300: 'hsl(var(--warning-300))',   // Medium light purple
				400: 'hsl(var(--warning-400))',   // Medium purple
				500: 'hsl(var(--warning-500))',   // Base sunset purple
				600: 'hsl(var(--warning-600))',   // Darker purple
				700: 'hsl(var(--warning-700))',   // Dark purple
				800: 'hsl(var(--warning-800))',   // Very dark purple
				900: 'hsl(var(--warning-900))',   // Darkest purple
				DEFAULT: 'hsl(var(--warning-500))',
			},
			'error': {
				50: 'hsl(var(--error-50))',       // Warm Red - Lightest
				100: 'hsl(var(--error-100))',     // Very light red
				200: 'hsl(var(--error-200))',     // Light red
				300: 'hsl(var(--error-300))',     // Medium light red
				400: 'hsl(var(--error-400))',     // Medium red
				500: 'hsl(var(--error-500))',     // Base warm red
				600: 'hsl(var(--error-600))',     // Darker red
				700: 'hsl(var(--error-700))',     // Dark red
				800: 'hsl(var(--error-800))',     // Very dark red
				900: 'hsl(var(--error-900))',     // Darkest red
				DEFAULT: 'hsl(var(--error-500))',
			},
			'neutral': {
				50: 'hsl(var(--neutral-50))',     // Sophisticated Grays
				100: 'hsl(var(--neutral-100))',   // Very light gray
				200: 'hsl(var(--neutral-200))',   // Light gray
				300: 'hsl(var(--neutral-300))',   // Medium light gray
				400: 'hsl(var(--neutral-400))',   // Medium gray
				500: 'hsl(var(--neutral-500))',   // Base gray
				600: 'hsl(var(--neutral-600))',   // Darker gray
				700: 'hsl(var(--neutral-700))',   // Dark gray
				800: 'hsl(var(--neutral-800))',   // Very dark gray
				900: 'hsl(var(--neutral-900))',   // Almost black
				DEFAULT: 'hsl(var(--neutral-500))',
			},
			// Legacy Brand Bible Colors (for backwards compatibility)
			'bb-mahogany': {
				50: 'hsl(var(--primary-50))',
				100: 'hsl(var(--primary-100))',
				200: 'hsl(var(--primary-200))',
				300: 'hsl(var(--primary-300))',
				400: 'hsl(var(--primary-400))',
				500: 'hsl(var(--primary-500))',
				600: 'hsl(var(--primary-600))',
				700: 'hsl(var(--primary-700))',
				800: 'hsl(var(--primary-800))',
				900: 'hsl(var(--primary-900))',
				DEFAULT: 'hsl(var(--primary-600))',
			},
			'bb-citron': {
				50: 'hsl(var(--accent-50))',
				100: 'hsl(var(--accent-100))',
				200: 'hsl(var(--accent-200))',
				300: 'hsl(var(--accent-300))',
				400: 'hsl(var(--accent-400))',
				500: 'hsl(var(--accent-500))',
				600: 'hsl(var(--accent-600))',
				700: 'hsl(var(--accent-700))',
				800: 'hsl(var(--accent-800))',
				900: 'hsl(var(--accent-900))',
				DEFAULT: 'hsl(var(--accent-500))',
			},
			'bb-payne': {
				50: 'hsl(var(--secondary-50))',
				100: 'hsl(var(--secondary-100))',
				200: 'hsl(var(--secondary-200))',
				300: 'hsl(var(--secondary-300))',
				400: 'hsl(var(--secondary-400))',
				500: 'hsl(var(--secondary-500))',
				600: 'hsl(var(--secondary-600))',
				700: 'hsl(var(--secondary-700))',
				800: 'hsl(var(--secondary-800))',
				900: 'hsl(var(--secondary-900))',
				DEFAULT: 'hsl(var(--secondary-600))',
			},
			'bb-champagne': 'hsl(var(--neutral-100))',
			'bb-black-bean': 'hsl(var(--neutral-900))',
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
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
