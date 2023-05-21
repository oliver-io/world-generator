import levenshtein from 'fast-levenshtein';

export class CommandValidationError extends Error { }

export interface Command {
    name: string;
    params?: boolean;
    description?: string;
    syntax?: string;
    extraSyntax?: string | string[];
    examples?: [string, string][];
}

export enum CommandVerb {
    // comms:
    ACT = 'act',
    SAY = 'say',

    // items:
    GET = 'get',
    DROP = 'drop',
    EQUIP = 'equip',
    UNEQUIP = 'unequip',
    TRANSFER = 'give',
    // movement:
    NORTH = 'north',
    EAST = 'east',
    SOUTH = 'south',
    WEST = 'west',
    UP = 'up',
    DOWN = 'down',
}

// export const x: Record<CommandVerb, string> = {
// 	SAY: '',
// }

export const movementCommands: Command[] = [
    { name: CommandVerb.NORTH, description: 'Travel northward' },
    { name: CommandVerb.EAST, description: 'Travel eastward' },
    { name: CommandVerb.SOUTH, description: 'Travel southward' },
    { name: CommandVerb.WEST, description: 'Travel westward' },
    { name: CommandVerb.UP, description: 'Travel upward, climb stairs/other objects' },
    { name: CommandVerb.DOWN, description: 'Travel downward, descend stairs/other objects' },
];

export const itemCommands: Command[] = [
    { name: CommandVerb.GET, params: true, description: 'Pick up an item', syntax: `${CommandVerb.GET} <keyword>` },
    { name: CommandVerb.DROP, params: true, description: 'Drop an item', syntax: `${CommandVerb.DROP} <keyword>` },
    { name: CommandVerb.EQUIP, params: true, description: 'Equip an item', syntax: `${CommandVerb.EQUIP} <keyword>` },
    { name: CommandVerb.UNEQUIP, params: true, description: 'Unequip an item', syntax: `${CommandVerb.UNEQUIP} <keyword>` },
    {
        name: CommandVerb.TRANSFER,
        params: true,
        description: 'Give someone an item',
        syntax: `${CommandVerb.TRANSFER} <item keyword> <target keyword>`
    },
];

export const communicationCommands: Command[] = [
    { name: CommandVerb.SAY, params: true, description: 'Speak aloud to the room', syntax: 'say [to <target>] "<any sentence>"' },
    {
        name: CommandVerb.ACT,
        params: true,
        description: 'Perform an action in the current room',
        syntax: 'act <any action that people will see>',
        extraSyntax: [
            `You can refer to entities and objects with a '@keyword' or '@me' for yourself`,
            `Any dialogue in "quotes" will be shown as speech to the room`
        ],
        examples: [
            ["act @me waves", "You wave."],
            [`act @me says, "Hello, world!`, `You say, \"Hello, world!\"`],
            [`act wave at @dude`, `You wave at the dude.`]
        ]
    },
];

export const commands = [...movementCommands, ...itemCommands, ...communicationCommands];

export function describeCommands() {
    return commands.map(c => {
        let template = `${c.name} - ${c.description}`;
        if (c.syntax) {
            template += `\n\tSyntax: ${c.syntax}`;
        }
        if (c.extraSyntax) {
            template += `\n\t${Array.isArray(c.extraSyntax) ? c.extraSyntax.join('\n\t') : c.extraSyntax}`;
        }
        if (c.examples) {
            template += `\n\tExamples:`;
            c.examples.forEach(([input, output]) => {
                template += `\n\t\t${input} -> ${output}`;
            });
        }
        return template;
    });
}

export function validateCommandArguments(options: {
    command: CommandVerb;
    args: string[];
}) {
    return {
        valid: true,
        error: undefined,
        command: options.command,
        args: options.args,
    };
}

export function validateCommand(input: string) {
    const [commandName, ...args] = input.split(' ');
    const command = commands.find((c: any) => c.name === commandName);

    if (!commandName) {
        return {
            valid: false,
            command: commandName,
            args,
            error: 'No command provided',
        };
    }

    if (command) {
        if (command.params) {
            return validateCommandArguments({
                command: commandName as CommandVerb,
                args,
            });
        }
        return { valid: true, command: commandName, args };
    } else {
        const closestCommand = commands.reduce((prev: any, curr: any) => {
            const prevDistance = levenshtein.get(commandName, prev.name);
            const currDistance = levenshtein.get(commandName, curr.name);
            return prevDistance < currDistance ? prev : curr;
        });

        const dym =
            closestCommand && commandName.charAt(0) === closestCommand.name.charAt(0)
                ? `Did you mean '${closestCommand.name}'?`
                : '';

        return {
            valid: false,
            command: commandName,
            args,
            error: `Unknown command '${commandName}'. ${dym}`,
        };
    }
};