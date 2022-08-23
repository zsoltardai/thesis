export default function Error({
	height = 40, 
	width = 40,
	color = '#000000'
}) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style={{ backgroundColor: '#43ff6400' }} height={height + 'px'} width={width + 'px'}>
			<g transform="translate(0,-1036.3622)">
				<path style={{ fill: color, fillOpacity: 1, stroke: 'none' }}
					d="M 7.5,2 C 5.0147186,2 3,4.0147186 3,6.5 3.0015312,6.7197442 3.0191564,6.939081 3.0527344,7.15625 1.8279505,7.563833 1.0011929,8.7091793 1,10 c 0,1.656854 1.3431458,3 3,3 l 7.5,0 c 1.932997,0 3.321429,-1.477717 3.321429,-3.4107143 -0.343605,-1.177246 -1.384105,-2.7716808 -2.839605,-3.4058395 -0.02988,-0.013019 0.01902,-0.1361103 -0.01112,-0.14829 C 11.732775,3.7441623 9.803314,2.0026739 7.5,2 Z m 0,1 C 9.4329966,3 11,4.5670034 11,6.5 10.998359,6.6892144 10.981376,6.8779841 10.949219,7.0644531 11.129854,7.0226102 11.314584,7.0009929 11.5,7 12.880712,7 14,8.1192881 14,9.5 14,10.880712 12.880712,12 11.5,12 L 4,12 C 2.8954305,12 2,11.104569 2,10 2,8.8954305 2.8954305,8 4,8 4.119895,8.000332 4.2395173,8.0114445 4.3574219,8.0332031 4.1233957,7.5559094 4.0011632,7.031579 4,6.5 4,4.5670034 5.5670034,3 7.5,3 Z"
					transform="translate(0,1036.3622)" id="path4139" className="ColorScheme-Text"></path>
				<path style={{ fill: '#da4453', fillOpacity: 1, stroke: 'none' }}
					d="m 8.0000348,1042.3622 5.9999302,0 c 0.554019,0 1.000035,0.446 1.000035,1 l 0,5.9999 c 0,0.5541 -0.446016,1.0001 -1.000035,1.0001 l -5.9999302,0 C 7.4460155,1050.3622 7,1049.9162 7,1049.3621 l 0,-5.9999 c 0,-0.554 0.4460155,-1 1.0000348,-1 z"
					id="rect4153-8"></path>
				<path style={{ fill: '#ffffff', strokeOpacity: 1 }}
					d="m 9,1043.3622 -1,1 2,2 -2,2 1,1 2,-2 2,2 1,-1 -2,-2 2,-2 -1,-1 -2,2 -2,-2 z"
					id="path4141"></path>
			</g>
		</svg>
	);
}
