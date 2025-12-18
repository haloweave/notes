# Payment Flow & Error Handling

## Question: Do users see `/share` page if payment fails?

**Short Answer**: No, they shouldn't - but they could if they manually type the URL.

## Payment Flow

### ✅ Successful Payment Flow:
```
1. User completes payment on Stripe
   ↓
2. Stripe redirects to: /success?session_id=XXX
   ↓
3. User sees "Payment Successful!" page
   ↓
4. User clicks "View & Share Your Song" button
   ↓
5. Redirects to: /share?session_id=XXX
   ↓
6. Webhook updates database with stripeSessionId
   ↓
7. /share page finds the form and displays the gift
```

### ❌ Failed/Canceled Payment Flow:
```
1. User cancels payment or payment fails
   ↓
2. Stripe redirects to: /create?canceled=true
   ↓
3. User sees the create form again (NOT /share)
```

## Edge Cases

### Case 1: User manually types `/share` URL without payment
**Before fix**: Shows generic "song is being prepared" message
**After fix**: Shows clear error message:
```
❌ Oops! Something Went Wrong

We couldn't find your order. The payment may not have completed, 
or the link may be invalid. Please check your email for the 
correct link or contact support.

[Return Home]
```

### Case 2: Webhook hasn't arrived yet
**Scenario**: User clicks "View & Share" immediately after payment, but webhook is delayed

**Before fix**: 404 error, confusing message
**After fix**: Same error message as above, but webhook will eventually update the database

**Solution**: User can:
- Wait a few seconds and refresh
- Check their email for the link (email is sent after webhook)
- Contact support if issue persists

### Case 3: Webhook failed completely
**Scenario**: Payment succeeded but webhook never arrived (like session `cs_test_a1DeNGyddevCOZzmDvGWV6uA7dv9ZDHvSak3UjEWWNvweUzuVxwaS6blN7`)

**Detection**: Enhanced logging now shows:
```
[SHARE] Fetching form for session ID: cs_test_a...
[SHARE] API response status: 404
[SHARE] No form found for session: cs_test_a...
```

**Resolution**:
1. Check Stripe Dashboard for webhook delivery status
2. Resend webhook manually
3. Or manually update database (see MISSING_SESSION_DIAGNOSIS.md)

## Changes Made

### 1. Added Error State (`/app/share/page.tsx`)
```typescript
const [error, setError] = useState<string | null>(null);
```

### 2. Set Error When Form Not Found
```typescript
if (!data.success || !data.form) {
    setError('We couldn\'t find your order. The payment may not have completed...');
    setLoading(false);
    return;
}
```

### 3. Display Error UI
```tsx
if (error) {
    return (
        <div className="...">
            <div className="text-6xl mb-4">❌</div>
            <h1>Oops! Something Went Wrong</h1>
            <p>{error}</p>
            <button onClick={() => router.push('/')}>
                Return Home
            </button>
        </div>
    );
}
```

## Testing

### Test Case 1: Failed Payment
1. Go to `/compose/variations`
2. Click "Continue to Payment"
3. On Stripe checkout, click "Cancel"
4. Should redirect to `/create?canceled=true` ✅
5. Should NOT see `/share` page ✅

### Test Case 2: Manual URL Access
1. Type `/share?session_id=invalid_session` in browser
2. Should see error message ✅
3. Should have "Return Home" button ✅

### Test Case 3: Successful Payment
1. Complete payment on Stripe
2. Should see `/success` page ✅
3. Click "View & Share Your Song"
4. Should see `/share` with gift UI ✅

## Monitoring

Enhanced logging now tracks:
- ✅ Session ID being queried
- ✅ API response status
- ✅ Whether form was found
- ✅ Error details

Check browser console for:
```
[SHARE] Fetching form for session ID: ...
[SHARE] API response status: ...
[SHARE] API response data: ...
```

## Summary

**Before**: Users could access `/share` with invalid sessions and see confusing messages
**After**: Clear error handling with helpful messages and "Return Home" option
