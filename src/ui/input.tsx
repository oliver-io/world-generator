import { Box } from 'ink';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from './appContext';
import {
	KeyboardContext,
	KeyboardEventHandler,
	Keyboard,
	TypeAction,
} from './keyboardContext';
import { inputControlledText } from './textControls';
import { CursorText } from './cursorText';

export function useKeyboard(props: {
	keyboard?: Keyboard;
	onSend?: KeyboardEventHandler;
	onType?: KeyboardEventHandler;
	onSpecials?: Partial<Record<TypeAction, KeyboardEventHandler>>;
}) {
	const keyboard = props.keyboard ?? useContext(KeyboardContext);
	useEffect(() => {
		if (props.onSend) {
			keyboard.onSpecial(TypeAction.SEND_MESSAGE, props.onSend);
		}
		if (props.onType) {
			keyboard.onInput(props.onType);
		}
		for (const special in props.onSpecials) {
			const typeAction = special as TypeAction;
			keyboard.onSpecial(typeAction, props.onSpecials[typeAction]!);
		}
		return () => {
			if (props.onSend) {
				keyboard.removeListener(TypeAction.SEND_MESSAGE, props.onSend);
			}
			if (props.onType) {
				keyboard.unListen(props.onType);
			}
			for (const special in props.onSpecials) {
				const typeAction = special as TypeAction;
				keyboard.removeListener(typeAction, props.onSpecials[typeAction]!);
			}
		};
	});
}

export function InputBar(props?: {
	onSubmit?: (message: { input: string })  => void;
	label?: string,
	hint?: string 
}) {
	const { logger } = useContext(AppContext);
	const [[cursor, inputText], updateInputBar] = useState<[number, string]>([
		0,
		'',
	]);
	useKeyboard({
		onSend: (message) => {
			if (message.input) {
				if (props?.onSubmit) {
					props.onSubmit({ input: inputText });
				}
				updateInputBar([0, '']);
			}
		},
		onType: (options: { input: string; specialStroke?: TypeAction }) => {
			updateInputBar((inputBar) => {
				const [cursor, text] = inputBar;
				return inputControlledText({
					c: cursor,
					prev: text,
					input: options.input,
					special: options.specialStroke,
				});
			});
		},
	});

	return (
		<Box width="100%" borderStyle="single">
			<CursorText cursor={cursor} inputText={inputText ?? ''} hint={props?.hint ?? undefined} label={props?.label ?? ''} />
		</Box>
	);
}
