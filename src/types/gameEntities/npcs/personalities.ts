export type PositivePersonalityTraits =
    | 'agreeable'
    | 'ambitious'
    | 'brave'
    | 'calm'
    | 'cheerful'
    | 'considerate'
    | 'courteous'
    | 'courageous'
    | 'creative'
    | 'decisive'
    | 'determined'
    | 'diligent'
    | 'empathetic'
    | 'energetic'
    | 'enthusiastic'
    | 'fair-minded'
    | 'faithful'
    | 'fearless'
    | 'friendly'
    | 'generous'
    | 'gentle'
    | 'honest'
    | 'humorous'
    | 'imaginative'
    | 'impartial'
    | 'independent'
    | 'intellectual'
    | 'intelligent'
    | 'intuitive'
    | 'kind'
    | 'loving'
    | 'loyal'
    | 'modest'
    | 'neat'
    | 'optimistic'
    | 'passionate'
    | 'patient'
    | 'persistent'
    | 'pioneering'
    | 'philosophical'
    | 'placid'
    | 'planning'
    | 'plucky'
    | 'polite'
    | 'powerful'
    | 'practical'
    | 'pro-active'
    | 'quick-witted'
    | 'quiet'
    | 'rational'
    | 'reliable'
    | 'reserved'
    | 'resourceful'
    | 'romantic'
    | 'self-confident'
    | 'self-disciplined'
    | 'sensible'
    | 'sensitive'
    | 'shy'
    | 'silly'
    | 'sincere'
    | 'sociable'
    | 'straightforward'
    | 'sympathetic'
    | 'thoughtful'
    | 'tidy'
    | 'tough'
    | 'unassuming'
    | 'understanding'
    | 'versatile'
    | 'warmhearted'
    | 'willing'
    | 'witty';

export type NegativePersonalityTraits =
    | 'aggressive'
    | 'arrogant'
    | 'bossy'
    | 'cruel'
    | 'deceitful'
    | 'demanding'
    | 'dependent'
    | 'dishonest'
    | 'disobedient'
    | 'distrustful'
    | 'domineering'
    | 'foolhardy'
    | 'greedy'
    | 'grumpy'
    | 'impulsive'
    | 'inconsiderate'
    | 'indecisive'
    | 'inflexible'
    | 'irresponsible'
    | 'lazy'
    | 'moody'
    | 'narrow-minded'
    | 'nasty'
    | 'obnoxious'
    | 'opinionated'
    | 'overcritical'
    | 'overemotional'
    | 'overimaginative'
    | 'overprotective'
    | 'paranoid'
    | 'passive'
    | 'pessimistic'
    | 'reckless'
    | 'resentful'
    | 'secretive'
    | 'selfish'
    | 'suspicious'
    | 'thoughtless'
    | 'uncooperative'
    | 'unfriendly'
    | 'ungrateful'
    | 'unimaginative'
    | 'uninhibited'
    | 'unpredictable'
    | 'unreliable'
    | 'unself-critical'
    | 'vague'
    | 'weak-willed'
    | 'withdrawn';

export type PersonalityTraits = PositivePersonalityTraits | NegativePersonalityTraits;

export type PersonalityTraitsCSV = string;

export const possibleGoodPersonalityTraits: PositivePersonalityTraits[] = [
    'agreeable',
    'ambitious',
    'brave',
    'calm',
    'cheerful',
    'considerate',
    'courteous',
    'courageous',
    'creative',
    'decisive',
    'determined',
    'diligent',
    'empathetic',
    'energetic',
    'enthusiastic',
    'fair-minded',
    'faithful',
    'fearless',
    'friendly',
    'generous',
    'gentle',
    'honest',
    'humorous',
    'imaginative',
    'impartial',
    'independent',
    'intellectual',
    'intelligent',
    'intuitive',
    'kind',
    'loving',
    'loyal',
    'modest',
    'neat',
    'optimistic',
    'passionate',
    'patient',
    'persistent',
    'pioneering',
    'philosophical',
    'placid',
    'planning',
    'plucky',
    'polite',
    'powerful',
    'practical',
    'pro-active',
    'quick-witted',
    'quiet',
    'rational',
    'reliable',
    'reserved',
    'resourceful',
    'romantic',
    'self-confident',
    'self-disciplined',
    'sensible',
    'sensitive',
    'shy',
    'silly',
    'sincere',
    'sociable',
    'straightforward',
    'sympathetic',
    'thoughtful',
    'tidy',
    'tough',
    'unassuming',
    'understanding',
    'versatile',
    'warmhearted',
    'willing',
    'witty',
]

export const possibleBadPersonalityTraits: PersonalityTraits[] = [
    'aggressive',
    'arrogant',
    'bossy',
    'cruel',
    'deceitful',
    'demanding',
    'dependent',
    'dishonest',
    'disobedient',
    'distrustful',
    'domineering',
    'foolhardy',
    'greedy',
    'grumpy',
    'impulsive',
    'inconsiderate',
    'indecisive',
    'inflexible',
    'irresponsible',
    'lazy',
    'moody',
    'narrow-minded',
    'nasty',
    'obnoxious',
    'opinionated',
    'overcritical',
    'overemotional',
    'overimaginative',
    'overprotective',
    'paranoid',
    'passive',
    'pessimistic',
    'reckless',
    'resentful',
    'secretive',
    'selfish',
    'suspicious',
    'thoughtless',
    'uncooperative',
    'unfriendly',
    'ungrateful',
    'unimaginative',
    'uninhibited',
    'unpredictable',
    'unreliable',
    'unself-critical',
    'vague',
    'weak-willed',
    'withdrawn'
];

export const possiblePersonalityTraits = [...possibleGoodPersonalityTraits, ...possibleBadPersonalityTraits];