import { pgTable, text, timestamp, jsonb, varchar, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

    // Custom message from user (optional, displayed on public play page)
    customMessage: text('custom_message'),

    // Custom title from user (optional, applies to both versions)
    customTitle: text('custom_title'),

    // MusicGPT response data
    conversionId1: text('conversion_id_1'),
    conversionId2: text('conversion_id_2'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),

    // Audio URLs
    audioUrl1: text('audio_url_1'),
    audioUrl2: text('audio_url_2'),
    audioUrlWav1: text('audio_url_wav_1'),
    audioUrlWav2: text('audio_url_wav_2'),

    // Shareable URL slugs for public playback
    shareSlugV1: text('share_slug_v1').unique(),
    shareSlugV2: text('share_slug_v2').unique(),

    // Metadata
    title1: text('title_1'),
    title2: text('title_2'),
    lyrics1: text('lyrics_1'),
    lyrics2: text('lyrics_2'),
    lyricsTimestamped1: text('lyrics_timestamped_1'), // LRC format with timestamps
    lyricsTimestamped2: text('lyrics_timestamped_2'), // LRC format with timestamps
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

    // User relation
    userId: text('user_id').references(() => user.id),
});

export type MusicGeneration = typeof musicGenerations.$inferSelect;
export type NewMusicGeneration = typeof musicGenerations.$inferInsert;

// Orders table for payment history
export const orders = pgTable('orders', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    amount: integer('amount').notNull(), // Amount in cents
    currency: text('currency').notNull().default('usd'),
    status: varchar('status', { length: 50 }).notNull(), // succeeded, pending, failed
    credits: integer('credits').notNull(),
    stripeSessionId: text('stripe_session_id').unique(),
    packageId: text('package_id'), // 'single' or 'bundle'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Compose Forms table for /compose flow (try before you buy)
export const composeForms = pgTable('compose_forms', {
    id: text('id').primaryKey(), // formId

    // Package type
    packageType: varchar('package_type', { length: 50 }).notNull(), // 'solo-serenade' | 'holiday-hamper'
    songCount: integer('song_count').notNull(), // 1 or 3

    // Complete form data (JSONB for flexibility)
    formData: jsonb('form_data').notNull(),

    // Generated prompts and styles
    generatedPrompts: jsonb('generated_prompts').notNull(), // Array of prompts
    musicStyles: jsonb('music_styles'), // NEW: Array of music styles for each song
    variationStyles: jsonb('variation_styles'), // NEW: Array of arrays - 3 variation styles per song

    // Variation tracking
    variationTaskIds: jsonb('variation_task_ids'), // { "0": ["task1", "task2", "task3"], ... }
    variationAudioUrls: jsonb('variation_audio_urls'), // { "0": { "1": "url", "2": "url", "3": "url" }, ... }
    variationLyrics: jsonb('variation_lyrics'), // { "0": { "1": "lyrics", "2": "lyrics", "3": "lyrics" }, ... }
    selectedVariations: jsonb('selected_variations'), // { "0": 2, "1": 1, "2": 3 }

    // Status tracking
    status: varchar('status', { length: 50 }).notNull().default('created'),
    // Possible statuses: 'created', 'prompts_generated', 'variations_generating', 
    // 'variations_ready', 'payment_initiated', 'payment_completed', 'delivered'

    // Payment info
    stripeSessionId: text('stripe_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    amountPaid: integer('amount_paid'), // in cents
    paidAt: timestamp('paid_at'),

    // User info (nullable for guests)
    userId: text('user_id').references(() => user.id),
    guestEmail: text('guest_email'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'), // Auto-delete after 7 days if not paid
}, (table) => [
    index('compose_forms_user_id_idx').on(table.userId),
    index('compose_forms_status_idx').on(table.status),
    index('compose_forms_stripe_session_idx').on(table.stripeSessionId),
]);

export type ComposeForm = typeof composeForms.$inferSelect;
export type NewComposeForm = typeof composeForms.$inferInsert;

// Better Auth tables (generated by @better-auth/cli)
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    credits: integer("credits").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    musicGenerations: many(musicGenerations),
    orders: many(orders),
    composeForms: many(composeForms),
}));

export const musicGenerationsRelations = relations(musicGenerations, ({ one }) => ({
    user: one(user, {
        fields: [musicGenerations.userId],
        references: [user.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
    user: one(user, {
        fields: [orders.userId],
        references: [user.id],
    }),
}));

export const composeFormsRelations = relations(composeForms, ({ one }) => ({
    user: one(user, {
        fields: [composeForms.userId],
        references: [user.id],
    }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Account = typeof account.$inferSelect;
export type Session = typeof session.$inferSelect;
