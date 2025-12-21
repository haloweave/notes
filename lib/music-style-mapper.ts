/**
 * Music Style Mapper
 * 
 * Maps user-selected musical styles and festive sound levels to MusicGPT-compatible
 * music_style parameters and instrumentation hints for prompt generation.
 * 
 * Based on client requirements for dynamic sub-genre selection.
 */

export interface StyleMapping {
    musicStyle: string;
    instrumentation: string;
    tempo: string;
    mood: string;
}

/**
 * Get MusicGPT music_style parameter based on user selections
 */
export function getMusicStyle(formData: {
    style?: string;
    festiveSoundLevel: string;
    theme: string;
    vibe: string;
}): string {
    const { style, festiveSoundLevel, theme, vibe } = formData;

    // Base style mapping
    const styleBase = getStyleBase(style);

    // Festive instrumentation
    const festiveElements = getFestiveElements(festiveSoundLevel);

    // Combine into music_style string
    if (festiveElements) {
        return `${styleBase} with ${festiveElements}`;
    }

    return styleBase;
}

/**
 * Get base musical style description
 */
function getStyleBase(style?: string): string {
    switch (style) {
        case 'soft-heartfelt':
            return 'intimate acoustic ballad';

        case 'warm-cosy':
            return 'cozy folk';

        case 'bright-uplifting':
            return 'upbeat festive pop';

        case 'classic-timeless':
            return 'traditional Christmas carol';

        case 'romantic-heartfelt':
            return 'romantic piano ballad';

        case 'orchestral-festive':
            return 'grand orchestral Christmas';

        default:
            return 'Christmas song';
    }
}

/**
 * Get festive instrumentation elements based on sound level
 */
function getFestiveElements(festiveSoundLevel: string): string {
    switch (festiveSoundLevel) {
        case 'festive':
            return 'sleigh bells, choir, full orchestra';

        case 'lightly-festive':
            return 'light bells, strings, acoustic piano';

        case 'non-festive':
            return '';

        default:
            return 'light bells, strings';
    }
}

/**
 * Get detailed instrumentation hints for the prompt
 * These are used in the AI prompt to guide lyrical and musical tone
 */
export function getInstrumentationHints(style?: string, festiveSoundLevel?: string): string {
    const mapping = getStyleMapping(style, festiveSoundLevel);
    return `${mapping.instrumentation}. ${mapping.tempo} tempo. ${mapping.mood} mood.`;
}

/**
 * Get complete style mapping with all details
 */
export function getStyleMapping(style?: string, festiveSoundLevel?: string): StyleMapping {
    // Style-specific mappings based on client document
    const styleMap: Record<string, Omit<StyleMapping, 'musicStyle'>> = {
        'soft-heartfelt': {
            instrumentation: 'acoustic guitar, piano, soft strings',
            tempo: 'Slow to moderate',
            mood: 'Gentle, intimate, warm, soothing, tender, expressive'
        },
        'warm-cosy': {
            instrumentation: 'acoustic guitar, piano, light percussion',
            tempo: 'Moderate',
            mood: 'Cozy, homey, snuggly, relaxing, gentle but joyful, familiar'
        },
        'bright-uplifting': {
            instrumentation: 'light percussion, bells, strings',
            tempo: 'Upbeat',
            mood: 'Joyful, celebratory, optimistic, feel-good, energetic'
        },
        'classic-timeless': {
            instrumentation: 'strings, brass, choir',
            tempo: 'Slow to moderate',
            mood: 'Elegant, majestic, reverent, traditional, timeless'
        },
        'romantic-heartfelt': {
            instrumentation: 'soft piano, strings, guitar',
            tempo: 'Slow to moderate',
            mood: 'Intimate, heartfelt, romantic, tender, sincere, personal'
        },
        'orchestral-festive': {
            instrumentation: 'strings, brass, timpani, choir, piano',
            tempo: 'Slow to moderate with powerful crescendos',
            mood: 'Majestic, elegant, celebratory, grand, formal'
        }
    };

    const baseMapping = styleMap[style || 'soft-heartfelt'] || styleMap['soft-heartfelt'];

    // Add festive instrumentation if applicable
    let instrumentation = baseMapping.instrumentation;
    if (festiveSoundLevel === 'festive') {
        instrumentation += ', sleigh bells, choir elements';
    } else if (festiveSoundLevel === 'lightly-festive') {
        instrumentation += ', subtle bells';
    }

    return {
        musicStyle: getMusicStyle({ style, festiveSoundLevel: festiveSoundLevel || 'lightly-festive', theme: '', vibe: '' }),
        instrumentation,
        tempo: baseMapping.tempo,
        mood: baseMapping.mood
    };
}

/**
 * Get style-specific lyrical guidance for the AI
 */
export function getStyleLyricalGuidance(style?: string): string {
    switch (style) {
        case 'soft-heartfelt':
            return 'Focus on intimate, heartfelt lyrics with minimal use of literal festive references. Emphasize warmth and tenderness.';

        case 'warm-cosy':
            return 'Create lyrics with a homely, familiar feeling. Include cozy imagery like fireside moments and family gatherings.';

        case 'bright-uplifting':
            return 'Write upbeat, playful lyrics with feel-good energy. Keep the tone celebratory and optimistic.';

        case 'classic-timeless':
            return 'Craft elegant, reverent lyrics inspired by classic Christmas carols. Use poetic, timeless language.';

        case 'romantic-heartfelt':
            return 'Write deeply emotional, romantic lyrics that feel personal and sincere. Focus on love and togetherness.';

        case 'orchestral-festive':
            return 'Create majestic, grand lyrics suitable for a formal celebration. Use rich, elegant language.';

        default:
            return 'Create heartfelt, personalized lyrics that feel authentic and meaningful.';
    }
}
