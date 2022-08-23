export default function Pending({
	height = 40,
	width = 40,
	color = '#000000'
}) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style={{ backgroundColor: '#43ff6400' }} height={height + 'px'} width={width + 'px'} >
			<path style={{ fill: color, fillOpacity: 1, stroke: 'none' }}
				d="M 7.5 2 C 5.0147186 2 3 4.0147186 3 6.5 C 3.0015312 6.7197442 3.0191564 6.939081 3.0527344 7.15625 C 1.8279505 7.563833 1.0011929 8.7091793 1 10 C 1 11.656854 2.3431458 13 4 13 L 11.5 13 C 13.432997 13 15 11.432997 15 9.5 C 14.656395 8.322754 13.437922 6.8177523 11.982422 6.1835938 C 11.952541 6.1705745 12.000846 6.047336 11.970703 6.0351562 C 11.732775 3.7441623 9.803314 2.0026739 7.5 2 z M 7.5 3 C 9.4329966 3 11 4.5670034 11 6.5 C 10.998359 6.6892144 10.981376 6.8779841 10.949219 7.0644531 C 11.129854 7.0226102 11.314584 7.0009929 11.5 7 C 12.880712 7 14 8.1192881 14 9.5 C 14 10.880712 12.880712 12 11.5 12 L 4 12 C 2.8954305 12 2 11.104569 2 10 C 2 8.8954305 2.8954305 8 4 8 C 4.119895 8.000332 4.2395173 8.0114445 4.3574219 8.0332031 C 4.1233957 7.5559094 4.0011632 7.031579 4 6.5 C 4 4.5670034 5.5670034 3 7.5 3 z "
				className="ColorScheme-Text"></path>
			<path style={{ fill: '#3daee9', fillOpacity: 1, stroke: 'none' }}
				d="M 11 6 C 8.784 6 7 7.784 7 10 C 7 12.216 8.784 14 11 14 C 13.216 14 15 12.216 15 10 C 15 7.784 13.216 6 11 6 z "
				className="ColorScheme-Highlight"></path>
			<path style={{ opacity: 1, fill: '#ffffff' }}
				d="M 11.050781 7.0039062 A 3 3 0 0 0 8.8789062 7.8789062 A 3 3 0 0 0 8.5546875 11.738281 L 9.2792969 11.013672 A 2 2 0 0 1 9.5859375 8.5859375 A 2 2 0 0 1 12.015625 8.2773438 L 12.734375 7.5585938 A 3 3 0 0 0 11.050781 7.0039062 z M 13.445312 8.2617188 L 12.720703 8.9863281 A 2 2 0 0 1 12.414062 11.414062 A 2 2 0 0 1 9.984375 11.722656 L 9.265625 12.441406 A 3 3 0 0 0 13.121094 12.121094 A 3 3 0 0 0 13.445312 8.2617188 z "></path>
		</svg>
	);
}
