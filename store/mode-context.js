import {createContext, useEffect, useState} from 'react';
import { getCookie, setCookie } from 'cookies-next';

const ModeContext = createContext({
	mode: '',
	toggleMode: () => {}
});

export function ModeContextProvider({ children }) {
	const [mode, setMode] = useState('light');

	useEffect(() => {
		const _mode = (getCookie('mode') !== undefined) ? getCookie('mode') : 'light';
		setMode(_mode);
	}, []);

	const toggleModeHandler = () => {
		const _new = (mode === 'light') ? 'dark' : 'light';
		setCookie('mode', _new);
		setMode(_new);
	};

	const context = {
		mode: mode,
		toggleMode: toggleModeHandler
	};

	return (
		<ModeContext.Provider value={context}>
			{children}
		</ModeContext.Provider>
	);
}


export default ModeContext;
