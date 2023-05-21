import { EventEmitter } from 'events';
import { Key, useInput } from 'ink';
import { createContext } from 'react';

class InputError extends Error {
	constructor(public _cause: Error | unknown, public override message: string) {
		super(message);
	}
}

const PLATFORM = process.platform

enum OS {
	AIX = 'aix',
	DARWIN = 'darwin',
	FREEBSD = 'freebsd',
	LINUX = 'linux',
	OPENBSD = 'openbsd',
	SUNOS = 'sunos',
	WIN32 = 'win32'
}

export enum TypeAction {
	SEND_MESSAGE = 'SEND_MESSAGE',
	DELETE_CHAR = 'DELETE_CHAR',
	DELETE_WORD = 'DELETE_WORD',
	DELETE_AHEAD_CHAR = 'DELETE_AHEAD_CHAR',
	DELETE_AHEAD_WORD = 'DELETE_AHEAD_WORD',
	MOVE_CURSOR_LEFT_WORD = 'MOVE_CURSOR_LEFT_WORD',
	MOVE_CURSOR_LEFT_CHAR = 'MOVE_CURSOR_LEFT_CHAR',
	SELECT_CURSOR_LEFT_WORD = 'SELECT_CURSOR_LEFT_WORD',
	SELECT_CURSOR_LEFT_CHAR = 'SELECT_CURSOR_LEFT_CHAR',
	MOVE_CURSOR_RIGHT_WORD = 'MOVE_CURSOR_RIGHT_WORD',
	MOVE_CURSOR_RIGHT_CHAR = 'MOVE_CURSOR_RIGHT_CHAR',
	SELECT_CURSOR_RIGHT_WORD = 'SELECT_CURSOR_RIGHT_WORD',
	SELECT_CURSOR_RIGHT_CHAR = 'SELECT_CURSOR_RIGHT_CHAR',
	MOVE_CURSOR_UP_CHAR = 'MOVE_CURSOR_UP_CHAR',
	MOVE_CURSOR_UP_WORD = 'MOVE_CURSOR_UP_WORD',
	MOVE_CURSOR_DOWN_CHAR = 'MOVE_CURSOR_DOWN_CHAR',
	MOVE_CURSOR_DOWN_WORD = 'MOVE_CURSOR_DOWN_WORD',
	CLEAR_SCREEN = 'CLEAR_SCREEN',
	PASTE = 'PASTE',
	TAB = 'TAB',
	NONE = 'NONE',
}

function translateInputFlagsToTypeActions(
	key: Key,
	os: string,
	input?: string
): TypeAction {
	switch (PLATFORM) {
		case OS.WIN32:
			return translateInputFlagsToTypeActionsWin32(key, input)
		case OS.DARWIN:
			return translateInputFlagsToTypeActionsDarwin(key, input)
		default: throw Error(`No translateInputFlagsToTypeActions() function created for OS ${PLATFORM}`)

	}
}

function translateInputFlagsToTypeActionsDarwin(
	key: Key,
	input?: string
): TypeAction {
	if (key.meta) {
		// CTRL + DEL
		switch (input) {
			case '[3;5~':
				return TypeAction.DELETE_AHEAD_WORD;
			case '[1;5D':
				return TypeAction.MOVE_CURSOR_LEFT_WORD;
			case '[1;2D':
				return TypeAction.SELECT_CURSOR_LEFT_CHAR;
			case '[1;5C':
				return TypeAction.MOVE_CURSOR_RIGHT_WORD;
			case '[1;2C':
				return TypeAction.SELECT_CURSOR_RIGHT_CHAR;
		}
		if (input === '[3;5~') {
			return TypeAction.DELETE_AHEAD_WORD;
		}
	}

	if (key.delete) {
		if (key.meta) {
			return TypeAction.DELETE_CHAR;
		} else {
			return TypeAction.DELETE_CHAR;
		}
	}

	if (key.ctrl) {
		if (input === 'v') {
			return TypeAction.PASTE;
		}
	}

	if (key.backspace) {
		return TypeAction.DELETE_CHAR;
	}

	if (key.return) {
		return TypeAction.SEND_MESSAGE;
	}

	if (key.leftArrow) {
		return TypeAction.MOVE_CURSOR_LEFT_CHAR;
	}

	if (key.rightArrow) {
		return TypeAction.MOVE_CURSOR_RIGHT_CHAR;
	}

	if (key.downArrow) {
		return TypeAction.MOVE_CURSOR_DOWN_CHAR;
	}

	if (key.upArrow) {
		return TypeAction.MOVE_CURSOR_UP_CHAR;
	}

	if (key.tab) {
		return TypeAction.TAB;
	}

	return TypeAction.NONE;
}

function translateInputFlagsToTypeActionsWin32(
	key: Key,
	input?: string
): TypeAction {
	if (key.meta) {
		// CTRL + DEL
		switch (input) {
			case '[3;5~':
				return TypeAction.DELETE_AHEAD_WORD;
			case '[1;5D':
				return TypeAction.SELECT_CURSOR_LEFT_WORD;
			case '[1;2D':
				return TypeAction.SELECT_CURSOR_LEFT_CHAR;
			case '[1;5C':
				return TypeAction.SELECT_CURSOR_RIGHT_WORD;
			case '[1;2C':
				return TypeAction.SELECT_CURSOR_RIGHT_CHAR;
		}
		if (input === '[3;5~') {
			return TypeAction.DELETE_AHEAD_WORD;
		}
	}

	if (key.delete) {
		if (key.meta) {
			return TypeAction.DELETE_AHEAD_CHAR;
		} else {
			return TypeAction.DELETE_WORD;
		}
	}

	if (key.ctrl) {
		if (input === 'v') {
			return TypeAction.PASTE;
		}
	}

	if (key.backspace) {
		return TypeAction.DELETE_CHAR;
	}

	if (key.return) {
		return TypeAction.SEND_MESSAGE;
	}

	if (key.leftArrow) {
		return TypeAction.MOVE_CURSOR_LEFT_CHAR;
	}

	if (key.rightArrow) {
		return TypeAction.MOVE_CURSOR_RIGHT_CHAR;
	}
	
	if (key.downArrow) {
		return TypeAction.MOVE_CURSOR_DOWN_CHAR;
	}

	if (key.upArrow) {
		return TypeAction.MOVE_CURSOR_UP_CHAR;
	}


	if (key.tab) {
		return TypeAction.TAB;
	}

	return TypeAction.NONE;
}

export type KeyboardEvent = {
	input: string;
	specialStroke?: TypeAction;
};

export type KeyboardEventHandler<T = void> = (
	event: KeyboardEvent
) => T | Promise<T>;

export class Keyboard extends EventEmitter {
	constructor(options?: any) {
		super(options);
		useInput((input, key) => {
			const specialStroke = translateInputFlagsToTypeActions(key, input);
			if (specialStroke && specialStroke !== TypeAction.NONE) {
				if (this.listenerCount(specialStroke) > 0) {
					this.emit(specialStroke, { input, specialStroke });
					return;
				}
			}

			this.emit('KEYSTROKE', { input, specialStroke });
		});
	}
	onInput(handler: (keystroke: KeyboardEvent) => void | Promise<void>) {
		return this.addListener('KEYSTROKE', handler);
	}
	unListen(handler: (keystroke: KeyboardEvent) => void | Promise<void>) {
		return this.removeListener('KEYSTROKE', handler);
	}
	onSpecial(
		stroke: TypeAction,
		handler: (keystroke: KeyboardEvent) => void | Promise<void>
	) {
		return this.addListener(stroke, handler);
	}
}

export const KeyboardContext = createContext({} as Keyboard);

export function createKeyboard() {
	return new Keyboard();
}
