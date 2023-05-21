import { render, Text } from "ink";
import React, { useContext, useState } from "react";
import TextInput from "ink-text-input";
import { InputBar } from "./input";
import { AppContext } from "./appContext";
import Pino from 'pino';
import { createKeyboard, KeyboardContext } from "./keyboardContext";

const testLogger = Pino({
  base: {
    module: 'rpgpt_world_gen',
  },
  transport: {
    target: 'pino-pretty',
  },
});

export function StagePrompt() {

}

export function StagePromptStep(props: {
  stepPrompt: string;
  confirmPrompt: string;
}) {

}

export function Test() {
  const [cur, set] = useState('');
  const [ctx, setContext] = useState({});
  const keyboard = createKeyboard();
  return <>
    <AppContext.Provider value={{
      height: 100, width: 100, logger: testLogger, config: {environment: 'generator'}
    }}>
      <KeyboardContext.Provider value={keyboard}>
        <Text>Hello World!</Text>
      </KeyboardContext.Provider>
    </AppContext.Provider>
  </>
}

export async function renderApp() {
  render(<Test/>);
}

renderApp().then().catch(console.error);
