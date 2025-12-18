# Optimized Auto-Sync - Only Sync Once Per Session

## Problem
The current implementation syncs localStorage to database every time the history menu opens, which is wasteful.

## Solution
Use `sessionStorage` to track if we've already synced in this browser session.

## Implementation

Add this to the `loadSessions` function in `/components/compose/history-menu.tsx`:

```typescript
const loadSessions = async () => {
    setIsLoading(true);
    const sessionMap = new Map<string, SongSession>();

    // 1. Load from localStorage first
    const localSessions: SongSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('songForm_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                const formId = key.replace('songForm_', '');

                const session = {
                    formId,
                    formData: data.formData || {},
                    variationTaskIds: data.variationTaskIds,
                    variationAudioUrls: data.variationAudioUrls,
                    status: data.status,
                    timestamp: data.timestamp || Date.now(),
                    source: 'local' as const
                };

                sessionMap.set(formId, session);
                localSessions.push(session);
            } catch (e) {
                console.error('Error parsing session:', key, e);
            }
        }
    }

    // 2. If user is logged in, sync local sessions to database (ONLY ONCE PER SESSION)
    if (session?.user?.id) {
        const syncKey = `synced_${session.user.id}`;
        const alreadySynced = sessionStorage.getItem(syncKey);
        
        if (!alreadySynced && localSessions.length > 0) {
            console.log('[HISTORY_MENU] Syncing', localSessions.length, 'local sessions to database...');
            
            for (const localSession of localSessions) {
                try {
                    // Check if form exists in database
                    const checkResponse = await fetch(`/api/compose/forms?formId=${localSession.formId}`);
                    
                    if (checkResponse.status === 404) {
                        // Create new form in database
                        await fetch('/api/compose/forms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                formId: localSession.formId,
                                packageType: localSession.formData.songs?.length > 1 ? 'holiday-hamper' : 'solo-serenade',
                                songCount: localSession.formData.songs?.length || 1,
                                formData: localSession.formData,
                                generatedPrompts: [],
                            })
                        });
                        console.log('[HISTORY_MENU] ✅ Synced form', localSession.formId, 'to database');
                    } else if (checkResponse.ok) {
                        // Update existing form with userId
                        await fetch('/api/compose/forms', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                formId: localSession.formId,
                                userId: session.user.id,
                                variationTaskIds: localSession.variationTaskIds,
                                variationAudioUrls: localSession.variationAudioUrls,
                                status: localSession.status,
                            })
                        });
                        console.log('[HISTORY_MENU] ✅ Updated form', localSession.formId, 'with user ID');
                    }
                } catch (syncError) {
                    console.error('[HISTORY_MENU] Error syncing form:', syncError);
                }
            }
            
            // Mark as synced for this session
            sessionStorage.setItem(syncKey, 'true');
            console.log('[HISTORY_MENU] ✅ Sync complete, marked as synced for this session');
        } else if (alreadySynced) {
            console.log('[HISTORY_MENU] Already synced in this session, skipping sync');
        }

        // 3. Fetch from database (primary source for logged-in users)
        try {
            const response = await fetch('/api/compose/forms/list');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.forms) {
                    // Clear map and use database as primary source
                    sessionMap.clear();
                    
                    data.forms.forEach((form: any) => {
                        sessionMap.set(form.id, {
                            formId: form.id,
                            formData: form.formData || {},
                            variationTaskIds: form.variationTaskIds,
                            variationAudioUrls: form.variationAudioUrls,
                            status: form.status,
                            timestamp: new Date(form.createdAt).getTime(),
                            source: 'database' as const
                        });
                    });
                    
                    console.log('[HISTORY_MENU] Loaded', data.forms.length, 'sessions from database');
                }
            }
        } catch (error) {
            console.error('[HISTORY_MENU] Error fetching from database:', error);
            // Fallback to localStorage if database fails
        }
    }

    // Convert map to array and sort
    const sessionsArray = Array.from(sessionMap.values());
    sessionsArray.sort((a, b) => b.timestamp - a.timestamp);
    setSessions(sessionsArray);
    setIsLoading(false);
};
```

## How It Works

### First Time Opening History Menu (After Login):
1. Load from localStorage
2. Check `sessionStorage` for sync flag
3. **Not found** → Sync all local sessions to database
4. Mark as synced in `sessionStorage`
5. Fetch from database

### Subsequent Opens (Same Browser Session):
1. Load from localStorage
2. Check `sessionStorage` for sync flag
3. **Found** → Skip sync
4. Fetch from database directly

### After Page Refresh:
1. `sessionStorage` is cleared (browser behavior)
2. Sync happens again (but only once per new session)
3. This ensures any new local data is synced

### After Creating New Song:
1. New song saved to localStorage
2. Next time menu opens → sync flag still exists
3. **Won't sync** until page refresh or new browser session
4. **But** the variations page already associates the form with user when they log in!

## Benefits

1. **Efficient**: Only syncs once per browser session
2. **No Duplication**: Checks before creating/updating
3. **Automatic**: Happens transparently
4. **Fallback**: If database fails, still shows localStorage
5. **Fresh Data**: Page refresh triggers re-sync

## Alternative: Sync Only on Login

If you want to sync **only when user logs in** (not on every page refresh), use `localStorage` instead:

```typescript
const syncKey = `synced_${session.user.id}_v1`;
const alreadySynced = localStorage.getItem(syncKey);

// ... sync logic ...

// Mark as synced permanently
localStorage.setItem(syncKey, new Date().toISOString());
```

This will sync only once ever (until localStorage is cleared).

## Recommended Approach

Use **sessionStorage** (syncs once per browser session) because:
- Ensures new local data is eventually synced
- Not too aggressive (once per session is reasonable)
- Clears on browser close (fresh start next time)
