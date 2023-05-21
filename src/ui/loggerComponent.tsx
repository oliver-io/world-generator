import { Duplex } from 'stream'
import { Text, Box } from 'ink';
import React, { useEffect, useState } from 'react';

let logs: string[] = [];

const DefaultLoggerStream = new Duplex({
  write(chunk: string, encoding: 'utf-8', callback: (error?: (Error | null)) => void) {
    logs.push(chunk);
    callback();
  },
  read(size: number) {
    let n = 0;
    while (n < size && logs.length > 0) {
      while (logs.length) {
        const log = logs.shift();
        if (!this.push(log)) {
          break;
        }
      }
      this.push(null);
      n++;
    }
  }
});

export default (options) => {
  return DefaultLoggerStream;
};

export function LogBox(props: { logHistorySize: number }) {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    DefaultLoggerStream.on('data', (data) => {
      setLogs((logs) => [...logs, data.toString()]);
    });
  }, []);
  return (
    <Box height={15} width="100%">
      {logs.slice(-(props.logHistorySize)).map((log, index) => (
        <Text key={index}>{log}</Text>
      ))}
    </Box>
  );
}
