# Prompt Generation Fix

## Problem
The song prompt generation was failing with empty responses from the Groq API. The backend logs showed:
```
[CREATE-SONG-PROMPT] Groq raw response: 
[CREATE-SONG-PROMPT] Initial length: 0
[CREATE-SONG-PROMPT] ✅ Final prompt: 
[CREATE-SONG-PROMPT] ✅ Final length: 0
```

The frontend was throwing the error:
```
Error generating prompt: Error: Failed to generate prompt for song 1
```

## Root Cause
The Groq model `llama-3.1-70b-versatile` has been **decommissioned** and is no longer supported by Groq. When the API was called with this model, it returned a 400 error:

```json
{
  "error": {
    "message": "The model `llama-3.1-70b-versatile` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.",
    "type": "invalid_request_error",
    "code": "model_decommissioned"
  }
}
```

## Solution
Updated the model to the recommended replacement: **`llama-3.3-70b-versatile`**

### Changes Made
1. **File**: `/app/api/create-song-prompt/route.ts`
   - Updated both instances of the model name (initial generation and regeneration)
   - Added better error handling to catch and log API failures
   - Added validation to throw an error if the prompt is empty

### Code Changes
```typescript
// Before
model: 'llama-3.1-70b-versatile'

// After
model: 'llama-3.3-70b-versatile'
```

### Additional Improvements
Added comprehensive error handling:
- Check for HTTP response status before parsing JSON
- Log full Groq API response for debugging
- Validate that the generated prompt is not empty
- Throw descriptive errors with status codes

## Testing
To verify the fix works, try submitting the form again. The prompt generation should now succeed with the new model.

## References
- Groq deprecations: https://console.groq.com/docs/deprecations
- Llama 3.3 was released in December 2024 as a replacement for Llama 3.1
- The new model offers significant quality improvements over the previous version
