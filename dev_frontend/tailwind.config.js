module.exports = {
	content: ["./src/**/*.{html,js, css, ts, png}"],
	corePlugins: {
		preflight: true,
	},
	theme: {
	  extend: {
		translate:
		{
			'9/10': '90%',
			'-9/10': '-90%',
		},
		fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      	},
		backgroundImage: {
        'door-left': "url('/src/assets/door_left.png')",
        'door-right': "url('/src/assets/door_left.png')",
		}
	  },
	},
	plugins: [require('@tailwindcss/aspect-ratio')],
  }
