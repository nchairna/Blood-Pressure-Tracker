# Testing Guide for Performance Fixes

## Quick Start

```bash
cd "/Users/nicholaschairnando/Projects/blood pressure tracker"
npm run dev
```

## Test Scenarios

### Test 1: New User Registration
**Goal**: Verify registration completes and navigates smoothly to dashboard

1. Clear browser storage (Application > Clear site data in DevTools)
2. Navigate to registration page
3. Fill in registration form:
   - Nama: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
4. Click "Buat Akun"

**Expected Behavior**:
- Button shows "Membuat Akun..." while processing
- NO stuck loading screen
- Smooth transition to dashboard within 1-2 seconds
- Dashboard shows skeleton screens briefly, then loads with empty state

**Red Flags**:
- If stuck showing "Membuat Akun..." for >3 seconds
- If redirected back to registration page
- If shows blank/white screen

### Test 2: Login Flow
**Goal**: Verify login works and dashboard loads efficiently

1. If still logged in from Test 1, logout first
2. Navigate to login page
3. Enter credentials:
   - Email: test@example.com
   - Password: test123
4. Click "Masuk"

**Expected Behavior**:
- Button shows "Masuk..." briefly
- Smooth navigation to dashboard
- Dashboard shows skeleton screens (grid layout visible immediately)
- Data populates after ~500ms

**Red Flags**:
- Extended "Masuk..." button state
- Blank screen between login and dashboard
- Flash of "Memuat..." text

### Test 3: Protected Route Access
**Goal**: Verify auth guards work correctly

1. Logout if logged in
2. Manually navigate to: `http://localhost:5173/dashboard`

**Expected Behavior**:
- Brief branded loading screen (app logo + spinner) OR immediate redirect
- Redirects to `/login`
- NO white/blank screen

**Red Flags**:
- Long loading screen (>1 second)
- Error messages
- Can access dashboard while logged out

### Test 4: Already Logged In Navigation
**Goal**: Verify logged-in users can't access auth pages

1. Ensure you're logged in
2. Navigate to: `http://localhost:5173/login`

**Expected Behavior**:
- Immediate redirect to `/dashboard`
- NO flash of login form

3. Navigate to: `http://localhost:5173/register`

**Expected Behavior**:
- Immediate redirect to `/dashboard`
- NO flash of registration form

### Test 5: Dashboard Loading States
**Goal**: Verify skeleton screens provide good UX

1. Login with a test account that has data
2. Observe dashboard loading

**Expected Behavior**:
- Skeleton screens match layout:
  - Greeting area placeholder
  - Blue gradient card placeholder (daily progress)
  - Latest reading card placeholder
  - 2x2 stats grid placeholders
- Smooth transition from skeleton to actual data
- NO layout shift (elements don't jump around)

**Red Flags**:
- Content jumps/shifts when data loads
- Skeleton doesn't match final layout
- Long skeleton duration (>2 seconds on good connection)

### Test 6: Network Conditions
**Goal**: Verify app handles slow connections gracefully

1. Open DevTools > Network tab
2. Throttle to "Slow 3G"
3. Refresh dashboard

**Expected Behavior**:
- Skeleton screens visible longer
- NO error messages
- NO infinite loading
- Eventually loads data or shows error

### Test 7: Logout Flow
**Goal**: Verify logout clears state properly

1. While logged in, click user menu (top right)
2. Click "Keluar"

**Expected Behavior**:
- Immediate redirect to `/login`
- Subsequent navigation to `/dashboard` redirects back to login

## Performance Benchmarks

Use DevTools > Performance tab to verify:

### Initial Page Load (First Visit)
- **Target**: <3 seconds to interactive
- **Measure**: Time from navigation to dashboard fully loaded

### Login Flow
- **Target**: <2 seconds from submit to dashboard visible
- **Measure**: Click "Masuk" to skeleton screens appearing

### Registration Flow
- **Target**: <3 seconds from submit to dashboard visible
- **Measure**: Click "Buat Akun" to dashboard loaded (includes Firestore writes)

### Protected Route Check
- **Target**: <200ms decision time
- **Measure**: Time from URL change to redirect (if unauthenticated)

## Chrome DevTools Tips

### Check Network Activity
```
DevTools > Network tab
- Filter by "firebase" to see Firebase API calls
- Look for slow requests (>500ms)
- Check if requests are cached properly
```

### Check Console for Errors
```
DevTools > Console tab
- Should see NO red errors
- Firebase config warnings are OK (if using .env.local.example)
```

### Check Performance
```
DevTools > Performance tab
1. Click record
2. Perform action (login, navigate, etc.)
3. Stop recording
4. Look for:
   - Long tasks (>50ms)
   - Layout shifts
   - Unnecessary re-renders
```

## Common Issues and Fixes

### Issue: "Stuck on loading after registration"
**Cause**: Auth state not waiting before navigation
**Check**: Verify `waitForAuth()` is called in Register.tsx line 32
**Fix**: Should be fixed by performance patches

### Issue: "Login redirects back to login page"
**Cause**: Race condition in ProtectedRoute
**Check**: Console for auth state logs
**Fix**: Should be fixed by performance patches

### Issue: "Dashboard takes forever to load"
**Cause**: Firestore query performance or network
**Check**: Network tab for slow Firestore queries
**Possible Fix**:
- Check Firestore indexes
- Consider pagination for large datasets

### Issue: "White flash between pages"
**Cause**: React Router loading states
**Check**: If ProtectedRoute shows loading too early
**Fix**: 200ms delay before showing loading (already implemented)

## Manual Performance Testing

### Using Chrome Lighthouse
1. Open DevTools > Lighthouse tab
2. Select "Performance" category
3. Click "Analyze page load"
4. Look for:
   - Performance score >80
   - First Contentful Paint <2s
   - Time to Interactive <3.5s

### Using React DevTools Profiler
1. Install React DevTools extension
2. Open Profiler tab
3. Click record
4. Perform navigation (login, go to dashboard)
5. Stop recording
6. Analyze:
   - Which components re-render
   - How long renders take
   - Unnecessary renders

## Automated Testing (Future)

Consider adding:
```bash
# E2E tests with Playwright
npm install -D @playwright/test

# Test file example: e2e/auth.spec.ts
test('user can register and see dashboard', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'test123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Halo')
})
```

## Success Criteria

All tests pass when:
- ✅ Registration completes within 3 seconds
- ✅ Login completes within 2 seconds
- ✅ NO navigation loops or stuck states
- ✅ Skeleton screens show proper layout
- ✅ Protected routes redirect correctly
- ✅ Already-logged-in users redirect from auth pages
- ✅ NO console errors during normal flow
- ✅ Good UX even on slow 3G

## Need Help?

If issues persist after these fixes:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify Firebase configuration in .env.local
4. Check Firestore security rules allow reads/writes
5. Verify Firestore indexes are deployed
