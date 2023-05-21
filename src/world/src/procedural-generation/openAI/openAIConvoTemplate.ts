// import { promises as fs } from 'fs';

export const template = (gen: string, facts: string) => `

Hello ChatGPT, I'm doing some experimenting using you to automatically create content for a text-based game.  I'd like to try an exercise where I give you some facts about a "zone" and you give me back some textual content of the zone.  For each zone, I want you to give me three data points:

DATA POINTS:
1) [DESCRIPTION]: A full textual description of the zone, between 300 and 700 characters
2) [NAME]: A name (ultra-shortened decription) for the zone based on the DESCRIPTION you generate
3) [SHORT]: A short-description, which is a summary of the long description, ideally around 50-75 characters

However, I have some rules about the way I want you to write text, in order of importance:

RULES:
1) All text should be in the third person and not make reference to subjective judgements or knowledge.  So "A tree is here" rather than "You see a tree"-- and "The tree stands tall above the canopy", not "You are amazed by the tree's height."
2) All descriptions should be no fewer than 300 characters, and no greater than 700.
3) Do not mention anything about what the zone might evoke in the mind of a viewer
4) You should pay reference to the places adjacent to the current zone, and describe the transition between them (I will make sure to give you this information).  For example, "A riverbank to the east leads into murky depths."
5) Do not describe the temperature, wind, sunshine, or moment-to-moment conditions of the zone
6) Do not excessively begin sentences with "The" or "This" or "To the"
7) Do not simply rephrase my "facts"

FORMAT:
Please return the data to me in the format as follows:
\`\`\`typescript:
{
    "description": [DESCRIPTION],
    "shortDescription": [SHORT],
    "name": [NAME]
}
\`\`\`

All facts will be separated by bullet points.  Here is a set for you to translate to a zone description:

- This is ${gen}
${facts}
`;

// insert();
