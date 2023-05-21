import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

export function CursorText(props: {
	cursor: number;
	label: string;
	inputText?: string;
	hint?: string;
	blink?: boolean;
}) {
	const { cursor, label = ' ', inputText = props.hint ?? '' } = props;
	const [isBlinking, setBlink] = useState(false);
	if (props.blink) {
		useEffect(() => {
			const interval = setInterval(() => {
				setBlink(!isBlinking);
			}, 500);
			return () => {
				clearInterval(interval);
			};
		});
	}

	const isHint = !props.inputText && props.hint;
	const color = isHint ? 'gray' : undefined;
	const italics = isHint ? true : false;

	return (
		<>
			<Text>{isHint ? null : label} </Text>
			<Text italic={italics} color={color}>{isHint ? props.hint : inputText.slice(0, cursor)}</Text>
			<Text underline={isBlinking}>{cursor < inputText.length ? inputText.charAt(cursor) : ' '}</Text>
			<Text>{inputText.slice(cursor + 1)}</Text>
		</>
	);
}
