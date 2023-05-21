import clipboard from 'clipboardy';
import { TypeAction } from './keyboardContext';

class TextControlError extends Error {
	constructor(public _cause: Error | unknown, public override message: string) {
		super(message);
	}
}

export function writeToTextFromCursorPosition(
	text: string,
	cursor: number,
	newText: string
): string {
	return text.slice(0, cursor) + newText + text.slice(cursor);
}

export function inputControlledText({
	prev,
	input,
	special,
	c,
}: {
	prev: string;
	input: string;
	special?: TypeAction;
	c: number;
}): [cursor: number, text: string] {
	if (special && special !== TypeAction.NONE) {
		let text: string = '';
		switch (special) {
			case TypeAction.SEND_MESSAGE:
				return [0, ''];
			case TypeAction.DELETE_CHAR:
				//from cursor:
				return c !== 0
					? [c - 1, prev.slice(0, c - 1).concat(prev.slice(c, prev.length))]
					: [c, prev];
			case TypeAction.DELETE_WORD:
				text = prev.trimEnd().split(' ').slice(0, -1).join(' ');
				return [text.length, text];
			case TypeAction.CLEAR_SCREEN:
				return [0, ''];
			case TypeAction.MOVE_CURSOR_LEFT_CHAR:
				return c !== 0
					? [c - 1, prev]
					: [c, prev];
			case TypeAction.MOVE_CURSOR_RIGHT_CHAR:
				return c !== prev.length
				    ? [c + 1, prev]
					: [c, prev];
			case TypeAction.MOVE_CURSOR_LEFT_WORD:
				const leftWords = prev.slice(0, c).trimEnd().split(' ');
				return [leftWords.slice(0, -1).join(' ').length, prev];
			case TypeAction.MOVE_CURSOR_RIGHT_WORD:
				const rightWords = prev.slice(c).trimStart().split(' ');
				return [c + rightWords.slice(1).join(' ').length, prev];
			case TypeAction.PASTE:
				const pasteBody = clipboard.readSync();
				return [
					c + pasteBody.length,
					writeToTextFromCursorPosition(prev, c, pasteBody),
				];
			default:
				throw new TextControlError({ input, special }, 'Unhandled key stroke');
		}
	} else {
		return [c + input.length, writeToTextFromCursorPosition(prev, c, input)];
	}
}
