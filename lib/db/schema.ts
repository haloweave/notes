import { pgTable, text, timestamp, jsonb, varchar, integer } from 'drizzle-orm/pg-core';

export const musicGenerations = pgTable('music_generations', {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull().unique(),

    // Form data
    recipient: text('recipient'),
    relationship: text('relationship'),
    tone: text('tone'),
    vibe: text('vibe'),
    style: text('style'),
    story: text('story'),
    personalization: text('personalization'),
    length: text('length'),
    includeName: text('include_name'),

    // Generated prompt
    generatedPrompt: text('generated_prompt'),

    // MusicGPT response data
    conversionId1: text('conversion_id_1'),
    conversionId2: text('conversion_id_2'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),

    // Audio URLs
    audioUrl1: text('audio_url_1'),
    audioUrl2: text('audio_url_2'),
    audioUrlWav1: text('audio_url_wav_1'),
    audioUrlWav2: text('audio_url_wav_2'),

    // Metadata
    title1: text('title_1'),
    title2: text('title_2'),
    lyrics1: text('lyrics_1'),
    lyrics2: text('lyrics_2'),
    duration1: integer('duration_1'),
    duration2: integer('duration_2'),
    albumCoverUrl: text('album_cover_url'),

    // Full API responses (for debugging)
    musicGptResponse: jsonb('musicgpt_response'),
    statusResponse: jsonb('status_response'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
});

export type MusicGeneration = typeof musicGenerations.$inferSelect;
export type NewMusicGeneration = typeof musicGenerations.$inferInsert;
