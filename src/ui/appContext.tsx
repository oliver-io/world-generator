import { Logger } from '../../types';
import pino from 'pino';
import { createContext } from 'react';

export const AppContext = createContext({
	height: 100,
	width: 100,
	config: { environment: 'none' },
	logger: (pino() as Logger)
});
