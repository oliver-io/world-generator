import { render, Text, Box, Newline } from "ink";
import React, { useState, useEffect } from "react";
import { AppContext, createKeyboard, KeyboardContext, useKeyboard } from '../../../ui';
import pino from 'pino';
import { sanitizeFilename } from "../../util/files";
import { LoggerContext } from "@curiecode/lamechain";
import parseArgs from 'minimist';
import { Direction, Room } from "../../../types";
import { readFileSync } from 'fs';
import { RoomSkeleton } from "../procedural-generation/types";

function exitsToExitString(exits: Room['exitData']) {
    const exitKeys = Object.keys(exits).filter((exitName) => {
        return (
            !exitName.endsWith('.closed') &&
            !exitName.endsWith('.locked') &&
            !exitName.endsWith('.diff')
        );
    });
    if (!exitKeys.length) {
        return 'none';
    }
    return `[${exitKeys
        .map((exitName) => {
            let name = exitName;
            const ex = exits[exitName as Direction]!;
            if (exits[`${ex as Direction}.closed`]) {
                name = `(${name})`;
            }
            return name;
        })
        .join(', ')}]`;
}

function fauxNavigate(rooms: Room[], currentIndex: number, direction: Direction): [ReturnType<typeof roomToHydratedRoom>, number] | null {
    const currentRoom = rooms[currentIndex];
    const targetRoomId = currentRoom.exitData[direction];
    if (!targetRoomId) {
        return null;
    }
    let i = 0;
    for (i = 0; i < rooms.length; i++) {
        if (rooms[i].id === targetRoomId) {
            return [roomToHydratedRoom(rooms, i), i];
        }
    }
    return null;
}

const roomToHydratedRoom = (rooms?: Room[] | null, currentIndex: number = 0):(RoomSkeleton & Room) | undefined => {
    return rooms?.[currentIndex] ? {
        ...(rooms[currentIndex] as unknown as RoomSkeleton & Room),
    } : undefined;
}

export function Explorer() {
    const cliArgs = parseArgs(process.argv);
    const folderName = sanitizeFilename(cliArgs.name || Date.now().toString())
    const [rooms, setRooms] = useState<Room[] | null>(null);
    const [skeletons, setSkeletons] = useState<RoomSkeleton[] | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [[room, currentIndex], setLocation] = useState<[ReturnType<typeof roomToHydratedRoom>, number]>([roomToHydratedRoom(rooms, 0), 0]);
    const logger = pino(
        pino.transport({
            target: 'pino/file',
            options: { destination: `.generated_content/${folderName}.area/EXPLORER.LOG.txt`, mkdir: true },
        })
    );
    const loggerContext: LoggerContext = {
        logger
    };

    const keyboard = createKeyboard();

    useKeyboard({
        keyboard,
        onSpecials: {
            MOVE_CURSOR_RIGHT_CHAR: ()=>{
                if (!rooms) {
                    return;
                }
                const navAttempt = fauxNavigate(rooms, currentIndex, 'east');
                if (navAttempt) {
                    setLocation(navAttempt);
                }
            },
            MOVE_CURSOR_LEFT_CHAR: ()=>{
                if (!rooms) {
                    return;
                }
                const navAttempt = fauxNavigate(rooms, currentIndex, 'west');
                if (navAttempt) {
                    setLocation(navAttempt);
                }
            },
            MOVE_CURSOR_UP_CHAR: ()=>{
                if (!rooms) {
                    return;
                }
                const navAttempt = fauxNavigate(rooms, currentIndex, 'north');
                if (navAttempt) {
                    setLocation(navAttempt);
                }
            },
            MOVE_CURSOR_DOWN_CHAR: ()=>{
                if (!rooms) {
                    return;
                }
                const navAttempt = fauxNavigate(rooms, currentIndex, 'south');
                if (navAttempt) {
                    setLocation(navAttempt);
                }
            }
        }
    });

    useEffect(() => {
        const roomText = readFileSync(`.generated_content/${folderName}.area/rooms.json`, 'utf-8');
        const roomSkeletonText = readFileSync(`.generated_content/${folderName}.area/skeleton.json`, 'utf-8');
        const roomJson = JSON.parse(roomText.toString());
        const roomSkeleton = JSON.parse(roomSkeletonText.toString());
        setSkeletons(roomSkeleton.flat());
        setRooms(roomJson);
        setLocation([roomToHydratedRoom(roomJson, 0), 0]);
        setLoaded(true);
    }, []);

    if (!loaded) {
        return <Text>Loading...</Text>;
    }
    const exitText = exitsToExitString(room?.exitData ?? {});
    const entityText = /*room?.entityData ? Object.keys(room.entityData).map((id) => {
        return <Text><Newline /> - {room.entityStaticData?.[id]?.name ?? id}</Text>
    }) : */'none';
    const roomFlora = room ? skeletons?.find(({id})=> id===room.id!)?.flora : undefined;
    const objectText = roomFlora && Object.keys(roomFlora ?? {}).length ? Object.keys(roomFlora).map((floraKey) => {
        return <Text><Newline /> - {roomFlora[floraKey].name} ({roomFlora[floraKey].type})</Text>
    }) : 'none';

    return <>
        <AppContext.Provider value={{
            height: 10, width: 100, logger: loggerContext.logger, config: { environment: 'generator' }
        }}>
            <KeyboardContext.Provider value={keyboard}>
                <Box height="95%" borderStyle="single" marginLeft={2} marginRight={2}>
                    <Box height="100%" width="100%" flexDirection="column">
                        <Box height={1}>
                            <Text color="grey"> {room?.staticData?.name}</Text>
                        </Box>
                        <Box
                            width="100%"
                            paddingLeft={1}
                            height={8}
                            borderStyle="single"
                            borderColor="grey"
                            flexDirection="column"
                        >
                            <Text color="white">{room?.staticData?.description}</Text>
                        </Box>
                        <Box margin={1}>
                            <Text color="white"> Entities: {entityText}</Text>
                        </Box>
                        <Box margin={1}>
                            <Text color="white"> Objects: {objectText}</Text>
                        </Box>
                        <Box margin={1}>
                            <Text color="white"> Exits: {exitText}</Text>
                        </Box>
                    </Box>
                </Box>
            </KeyboardContext.Provider>
        </AppContext.Provider>
    </>
}

export async function renderApp() {
    render(<Explorer />);
}

renderApp().then().catch(console.error);