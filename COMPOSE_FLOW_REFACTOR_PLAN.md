# Compose Flow Refactor: Database-First Architecture

## 🎯 Objective

Move from localStorage-heavy to **database-first** approach with minimal client-side storage.

---

## 🏗️ New Architecture

### **Session Management (No Login Required)**

```typescript
// When user starts compose flow
1. User clicks package → Create anonymous session
2. Generate sessionId (stored in cookie/localStorage)
3. All data tied to this sessionId
4. Session expires after 7 days (or after payment)
```

### **Data Storage Strategy**

| Data | Current | New Approach |
|------|---------|--------------|
| Form data | localStorage + DB | **DB only** (fetch on load) |
| Generated prompts | localStorage + DB | **DB only** |
| Variation task IDs | localStorage + DB | **DB only** |
| Audio URLs | localStorage + DB | **DB only** |
| Lyrics | localStorage + DB | **DB only** |
| Selections | localStorage only | **DB only** |
| Payment status | DB only | **DB only** |
| **Session ID** | sessionStorage | **localStorage** (persistent) |
| **Active tab** | React state | **localStorage** (UI state) |

---

## 📋 Implementation Steps

### **Step 1: Add Session Management**

#### 1.1 Update Database Schema

Add session tracking to `compose_forms`:

```typescript
// lib/db/schema.ts
export const composeForms = pgTable('compose_forms', {
  // ... existing fields ...
  
  // NEW: Session management
  sessionId: text('session_id').notNull().unique(), // Anonymous session ID
  sessionCreatedAt: timestamp('session_created_at').notNull().defaultNow(),
  sessionExpiresAt: timestamp('session_expires_at').notNull(), // 7 days from creation
  
  // NEW: Better status tracking
  currentStep: varchar('current_step', { length: 50 }), 
  // 'package_selected' | 'form_filling' | 'prompts_generated' | 
  // 'variations_generating' | 'variations_ready' | 'selections_made' | 
  // 'payment_initiated' | 'payment_completed'
  
  // ... rest of fields ...
});
```

#### 1.2 Create Session API

```typescript
// app/api/compose/session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

// POST /api/compose/session - Create new session
export async function POST(request: NextRequest) {
  const { packageType } = await request.json();
  
  const sessionId = randomUUID();
  const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  const newSession = await db.insert(composeForms).values({
    id: formId,
    sessionId,
    packageType,
    songCount: packageType === 'holiday-hamper' ? 3 : 1,
    formData: {}, // Empty initially
    generatedPrompts: [],
    status: 'created',
    currentStep: 'package_selected',
    sessionCreatedAt: new Date(),
    sessionExpiresAt: expiresAt,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  
  return NextResponse.json({
    success: true,
    sessionId,
    formId,
    session: newSession[0]
  });
}

// GET /api/compose/session?sessionId=xxx - Get session data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: 'sessionId required' },
      { status: 400 }
    );
  }
  
  const session = await db.query.composeForms.findFirst({
    where: eq(composeForms.sessionId, sessionId),
  });
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Session not found or expired' },
      { status: 404 }
    );
  }
  
  // Check if expired
  if (session.sessionExpiresAt && session.sessionExpiresAt < new Date()) {
    return NextResponse.json(
      { success: false, message: 'Session expired' },
      { status: 410 }
    );
  }
  
  return NextResponse.json({
    success: true,
    session
  });
}
```

---

### **Step 2: Refactor Package Selection**

```typescript
// app/compose/select-package/page.tsx

const handleSelectPackage = async (packageId: string) => {
  setLoading(true);
  
  try {
    // Create new session in database
    const response = await fetch('/api/compose/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageType: packageId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store ONLY session ID in localStorage
      localStorage.setItem('composeSessionId', data.sessionId);
      localStorage.setItem('composeFormId', data.formId);
      
      // Navigate to create page
      router.push('/compose/create');
    }
  } catch (error) {
    console.error('Failed to create session:', error);
    alert('Failed to start. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

### **Step 3: Refactor Form Creation Page**

```typescript
// app/compose/create/page.tsx

export default function CreatePage() {
  const [sessionData, setSessionData] = useState<ComposeForm | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load session from database on mount
  useEffect(() => {
    const loadSession = async () => {
      const sessionId = localStorage.getItem('composeSessionId');
      
      if (!sessionId) {
        // No session - redirect to package selection
        router.push('/compose/select-package');
        return;
      }
      
      try {
        const response = await fetch(`/api/compose/session?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setSessionData(data.session);
          
          // Restore form data if exists
          if (data.session.formData && data.session.formData.songs) {
            form.reset(data.session.formData);
          }
        } else {
          // Session expired or not found
          localStorage.removeItem('composeSessionId');
          localStorage.removeItem('composeFormId');
          router.push('/compose/select-package');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, []);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setStatus('Initializing your masterpiece...');
    
    try {
      const formId = localStorage.getItem('composeFormId');
      const generatedPrompts = [];
      
      // Generate prompts (same as before)
      for (let i = 0; i < values.songs.length; i++) {
        const song = values.songs[i];
        setStatus(`Composing song ${i + 1} of ${values.songs.length}...`);
        
        const response = await fetch('/api/create-song-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...song,
            senderName: values.senderName,
            senderEmail: values.senderEmail,
            senderPhone: values.senderPhone,
          })
        });
        
        const data = await response.json();
        if (data.success && data.prompt) {
          generatedPrompts.push(data.prompt);
        }
      }
      
      // Save EVERYTHING to database (NO localStorage)
      setStatus('Saving to database...');
      const dbResponse = await fetch('/api/compose/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          formData: values,
          generatedPrompts: generatedPrompts,
          status: 'prompts_generated',
          currentStep: 'prompts_generated'
        })
      });
      
      if (!dbResponse.ok) {
        throw new Error('Failed to save to database');
      }
      
      // Navigate to variations
      router.push(`/compose/variations`);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error generating song prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // ... rest of component
}
```

---

### **Step 4: Refactor Variations Page**

```typescript
// app/compose/variations/page.tsx

function VariationsContent() {
  const [sessionData, setSessionData] = useState<ComposeForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Load session from database
  useEffect(() => {
    const loadSession = async () => {
      const sessionId = localStorage.getItem('composeSessionId');
      
      if (!sessionId) {
        router.push('/compose/select-package');
        return;
      }
      
      try {
        const response = await fetch(`/api/compose/session?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setSessionData(data.session);
          
          // Restore UI state from localStorage (minimal)
          const savedTab = localStorage.getItem('composeActiveTab');
          if (savedTab) setActiveTab(parseInt(savedTab));
          
          // Check if we need to generate variations
          if (!data.session.variationTaskIds || 
              Object.keys(data.session.variationTaskIds).length === 0) {
            // Start generating
            generateVariations(data.session);
          } else {
            // Already generating or ready - start polling
            pollForAudio(data.session);
          }
        } else {
          router.push('/compose/select-package');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, []);
  
  // Save active tab to localStorage (UI state only)
  useEffect(() => {
    localStorage.setItem('composeActiveTab', activeTab.toString());
  }, [activeTab]);
  
  const generateVariations = async (session: ComposeForm) => {
    // Generate variations and save to DB
    const newTaskIds: Record<number, string[]> = {};
    
    for (let songIndex = 0; songIndex < session.songCount; songIndex++) {
      const prompt = session.generatedPrompts[songIndex];
      const taskIds = [];
      
      for (let i = 0; i < 3; i++) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `${prompt} ${variations[i].modifier}`,
            preview_mode: true
          })
        });
        
        const data = await response.json();
        if (data.task_id) taskIds.push(data.task_id);
      }
      
      newTaskIds[songIndex] = taskIds;
    }
    
    // Save to database (BLOCKING)
    const response = await fetch('/api/compose/forms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: session.id,
        variationTaskIds: newTaskIds,
        status: 'variations_generating',
        currentStep: 'variations_generating'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save variations to database');
    }
    
    // Refresh session data
    const updatedSession = await response.json();
    setSessionData(updatedSession.form);
    
    // Start polling
    pollForAudio(updatedSession.form);
  };
  
  const pollForAudio = async (session: ComposeForm) => {
    // Poll for audio and save to DB when ready
    const checkStatus = async () => {
      const taskIds = session.variationTaskIds;
      const newAudioUrls: Record<number, Record<number, string>> = {};
      const newLyrics: Record<number, Record<number, string>> = {};
      
      // Check each task
      for (const [songIndexStr, songTaskIds] of Object.entries(taskIds)) {
        const songIndex = parseInt(songIndexStr);
        newAudioUrls[songIndex] = {};
        newLyrics[songIndex] = {};
        
        for (let i = 0; i < songTaskIds.length; i++) {
          const taskId = songTaskIds[i];
          const variationId = i + 1;
          
          const response = await fetch(`/api/status/${taskId}`);
          const data = await response.json();
          
          if (data.status === 'COMPLETED' && data.conversion?.conversion_path_1) {
            newAudioUrls[songIndex][variationId] = data.conversion.conversion_path_1;
            if (data.conversion?.lyrics_1) {
              newLyrics[songIndex][variationId] = data.conversion.lyrics_1;
            }
          }
        }
      }
      
      // Save to database (BLOCKING)
      const response = await fetch('/api/compose/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: session.id,
          variationAudioUrls: newAudioUrls,
          variationLyrics: newLyrics,
          status: 'variations_ready',
          currentStep: 'variations_ready'
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save audio URLs');
        // Retry after 5 seconds
        setTimeout(checkStatus, 5000);
        return;
      }
      
      // Refresh session data
      const updatedSession = await response.json();
      setSessionData(updatedSession.form);
      
      // Check if all ready
      const allReady = Object.values(newAudioUrls).every(
        urls => Object.keys(urls).length === 3
      );
      
      if (!allReady) {
        setTimeout(checkStatus, 10000);
      }
    };
    
    setTimeout(checkStatus, 5000);
  };
  
  const handleSelectVariation = async (variationId: number) => {
    const formId = localStorage.getItem('composeFormId');
    
    // Update selections in database immediately
    const newSelections = {
      ...sessionData?.selectedVariations,
      [activeTab]: variationId
    };
    
    const response = await fetch('/api/compose/forms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId,
        selectedVariations: newSelections,
        currentStep: 'selections_made'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      setSessionData(data.form);
    }
  };
  
  const handleContinue = async () => {
    const formId = localStorage.getItem('composeFormId');
    
    // Update status to payment_initiated
    await fetch('/api/compose/forms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId,
        status: 'payment_initiated',
        currentStep: 'payment_initiated'
      })
    });
    
    // Call Stripe checkout (same as before)
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId,
        packageId: sessionData?.packageType,
        selections: sessionData?.selectedVariations
      })
    });
    
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };
  
  // ... rest of component
}
```

---

### **Step 5: Update Stripe Webhook**

```typescript
// app/api/stripe/webhook/route.ts

// After successful payment
await db.update(composeForms)
  .set({
    status: 'payment_completed',
    currentStep: 'payment_completed',
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    amountPaid: session.amount_total,
    paidAt: new Date(),
    updatedAt: new Date()
  })
  .where(eq(composeForms.id, formId));
```

---

## 📦 localStorage Usage (Minimal)

**Only store:**
```typescript
localStorage.setItem('composeSessionId', sessionId);  // To resume session
localStorage.setItem('composeFormId', formId);        // Quick access
localStorage.setItem('composeActiveTab', '0');        // UI state only
```

**Remove all:**
- ❌ `songForm_${formId}` (full form data)
- ❌ `songFormIds` (list of forms)
- ❌ `variationTaskIds`
- ❌ `variationAudioUrls`
- ❌ `variationLyrics`
- ❌ `selections`

---

## ✅ Benefits

1. **Single Source of Truth** - Database is authoritative
2. **No Data Loss** - Everything persisted immediately
3. **Resume Anywhere** - User can refresh/close tab and resume
4. **Better Analytics** - Track user journey in database
5. **Easier Debugging** - All data in one place
6. **Guest Support** - Works without login via sessionId
7. **Automatic Cleanup** - Can delete expired sessions

---

## 🔄 Migration Strategy

1. **Add session fields** to database schema
2. **Create session API** endpoints
3. **Refactor pages** one by one (package → create → variations)
4. **Test thoroughly** with both solo and bundle
5. **Deploy** and monitor
6. **Remove old localStorage** code after 1 week

---

## 🚀 Next Steps

1. Run database migration to add session fields
2. Create `/api/compose/session` endpoints
3. Refactor package selection page
4. Refactor create page
5. Refactor variations page
6. Test end-to-end flow
7. Deploy

Ready to start implementation?
