module.exports = {
	content: ["./src/**/*.{html,js, css, ts, png}, ./fonts/*"],
	theme: {
	  extend: {
		keyframes: {
        hologramWaves: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4%)' },
        },
        hologramScan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        hologramPulse: {
          '0%, 100%': {
            opacity: '0.95',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)',
          },
        },
      },
      animation: {
        'hologram-waves': 'hologramWaves 4s ease-in-out infinite',
        'hologram-scan': 'hologramScan 3s linear infinite',
        'hologram-pulse': 'hologramPulse 2s ease-in-out infinite',
      },
		translate:
		{
			'9/10': '90%',
			'-9/10': '-90%',
		},
		fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      	},
		backgroundImage: {
        'door-left': "url('/public/assets/door_left.png')",
        'door-right': "url('/public/assets/door_left.png')",
		}
	  },
	},
	plugins: [require('@tailwindcss/aspect-ratio')],
  }
