export type PositiveMoodTraits =
    | 'adventurous'
    | 'amused'
    | 'blissful'
    | 'bouncy'
    | 'calm'
    | 'carefree'
    | 'cheerful'
    | 'confident'
    | 'content'
    | 'ecstatic'
    | 'euphoric'
    | 'excited'
    | 'free'
    | 'grateful'
    | 'happy'
    | 'jovial'
    | 'joyful'
    | 'lively'
    | 'optimistic'
    | 'peaceful'
    | 'playful'
    | 'radiant'
    | 'relaxed'
    | 'serene'
    | 'soothing'
    | 'spirited'
    | 'thrilled'
    | 'upbeat'
    | 'vibrant'
    | 'zestful';


export type NegativeMoodTraits =
    | 'anxious'
    | 'bitter'
    | 'defeated'
    | 'depressed'
    | 'despairing'
    | 'disappointed'
    | 'discouraged'
    | 'disheartened'
    | 'dismayed'
    | 'dreadful'
    | 'enraged'
    | 'frustrated'
    | 'gloomy'
    | 'hopeless'
    | 'insecure'
    | 'irritable'
    | 'lonely'
    | 'melancholy'
    | 'miserable'
    | 'pessimistic'
    | 'powerless'
    | 'rejected'
    | 'restless'
    | 'sad'
    | 'sorrowful'
    | 'stressed'
    | 'tense'
    | 'unhappy'
    | 'upset'
    | 'worried';

export type MoodTraits = PositiveMoodTraits | NegativeMoodTraits;
export type MoodTraitsCSV = string;

export const possibleGoodMoodTraits: PositiveMoodTraits[] = [
    'adventurous',
    'amused',
    'blissful',
    'bouncy',
    'calm',
    'carefree',
    'cheerful',
    'confident',
    'content',
    'ecstatic',
    'euphoric',
    'excited',
    'free',
    'grateful',
    'happy',
    'jovial',
    'joyful',
    'lively',
    'optimistic',
    'peaceful',
    'playful',
    'radiant',
    'relaxed',
    'serene',
    'soothing',
    'spirited',
    'thrilled',
    'upbeat',
    'vibrant',
    'zestful',
]

export const possibleBadMoodTraits: NegativeMoodTraits[] = [
    'anxious',
    'bitter',
    'defeated',
    'depressed',
    'despairing',
    'disappointed',
    'discouraged',
    'disheartened',
    'dismayed',
    'dreadful',
    'enraged',
    'frustrated',
    'gloomy',
    'hopeless',
    'insecure',
    'irritable',
    'lonely',
    'melancholy',
    'miserable',
    'pessimistic',
    'powerless',
    'rejected',
    'restless',
    'sad',
    'sorrowful',
    'stressed',
    'tense',
    'unhappy',
    'upset',
    'worried'
];

export const possibleMoodTraits: MoodTraits[] = [
    ...possibleGoodMoodTraits,
    ...possibleBadMoodTraits
];
