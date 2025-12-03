import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    // Explicitly exclude shadcn-io directory
    '!./components/ui/shadcn-io/**/*'
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			playfair: [
  				'var(--font-playfair)',
  				'serif'
  			]
  		},
  		fontSize: {
  			'display-xl': [
  				'4.5rem',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.02em',
  					fontWeight: '700'
  				}
  			],
  			'display-lg': [
  				'3.75rem',
  				{
  					lineHeight: '1.15',
  					letterSpacing: '-0.02em',
  					fontWeight: '700'
  				}
  			],
  			'display-md': [
  				'3rem',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.01em',
  					fontWeight: '600'
  				}
  			],
  			'display-sm': [
  				'2.25rem',
  				{
  					lineHeight: '1.25',
  					letterSpacing: '-0.01em',
  					fontWeight: '600'
  				}
  			],
  			'heading-xl': [
  				'1.875rem',
  				{
  					lineHeight: '1.3',
  					letterSpacing: '-0.01em',
  					fontWeight: '600'
  				}
  			],
  			'heading-lg': [
  				'1.5rem',
  				{
  					lineHeight: '1.4',
  					letterSpacing: '-0.005em',
  					fontWeight: '600'
  				}
  			],
  			'heading-md': [
  				'1.25rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '500'
  				}
  			],
  			'heading-sm': [
  				'1.125rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '500'
  				}
  			],
  			'body-lg': [
  				'1.125rem',
  				{
  					lineHeight: '1.7',
  					fontWeight: '400'
  				}
  			],
  			'body-md': [
  				'1rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			'body-sm': [
  				'0.875rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			'body-xs': [
  				'0.75rem',
  				{
  					lineHeight: '1.4',
  					fontWeight: '400'
  				}
  			],
  			label: [
  				'0.75rem',
  				{
  					lineHeight: '1.4',
  					letterSpacing: '0.05em',
  					fontWeight: '500'
  				}
  			],
  			caption: [
  				'0.6875rem',
  				{
  					lineHeight: '1.3',
  					letterSpacing: '0.02em',
  					fontWeight: '400'
  				}
  			]
  		},
  		lineHeight: {
  			tight: '1.2',
  			snug: '1.4',
  			normal: '1.5',
  			relaxed: '1.6',
  			loose: '1.8'
  		},
  		letterSpacing: {
  			tighter: '-0.02em',
  			tight: '-0.01em',
  			normal: '0',
  			wide: '0.01em',
  			wider: '0.05em',
  			widest: '0.1em'
  		},
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
  			warning: 'var(--color-warning)',
  			neutral: 'var(--color-neutral)',
  			text: 'var(--color-text)',
  			highlight: 'var(--color-highlight)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '0.8',
  					transform: 'scale(1.05)'
  				}
  			},
			'accordion-down': {
				from: {
					height: '0',
					opacity: '0',
					transform: 'translate3d(0, -10px, 0)'
				},
				to: {
					height: 'var(--radix-accordion-content-height)',
					opacity: '1',
					transform: 'translate3d(0, 0, 0)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)',
					opacity: '1',
					transform: 'translate3d(0, 0, 0)'
				},
				to: {
					height: '0',
					opacity: '0',
					transform: 'translate3d(0, -10px, 0)'
				}
			}
  		},
		animation: {
			shimmer: 'shimmer 2s infinite',
			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			'accordion-down': 'accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			'accordion-up': 'accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
		}
  	}
  },
  plugins: []
};

export default config;

