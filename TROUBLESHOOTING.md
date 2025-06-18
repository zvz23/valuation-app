# Troubleshooting Guide

## "Failed to fetch" Error - Quick Fixes

### 1. Google Maps API Key Setup

The most common cause of "Failed to fetch" errors is missing or incorrect Google Maps API key configuration.

**Step 1: Create `.env.local` file**
Create a file named `.env.local` in the root directory (same level as `package.json`):

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Step 2: Get Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Create credentials (API Key)
5. Copy the API key to your `.env.local` file

**Step 3: Restart Development Server**
After creating `.env.local`, restart the server:
```bash
npm run dev
```

### 2. Network Connectivity Issues

**Check 1: Test API Connectivity**
- Use the "Test API" button in the Location section
- Check the browser console for detailed error messages

**Check 2: Browser Network Tab**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try fetching location data
4. Look for failed requests in red

**Check 3: Firewall/Proxy**
- Ensure your firewall allows connections to `maps.googleapis.com`
- If behind corporate proxy, check proxy settings

### 3. Development Server Issues

**Fix 1: Clear Next.js Cache**
```bash
rm -rf .next
npm run build
npm run dev
```

**Fix 2: Check Port Conflicts**
- Default port is 3000
- Try different port: `npm run dev -- --port 3001`

### 4. Browser Issues

**Fix 1: Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies

**Fix 2: Try Different Browser**
- Test in Chrome, Firefox, or Edge
- Try incognito/private mode

### 5. Console Error Messages

**Error: "Google Maps API key not configured"**
- Solution: Set up `.env.local` file (see step 1)

**Error: "Network error - unable to connect to server"**
- Solution: Check internet connection and firewall settings

**Error: "Request timeout"**
- Solution: Server might be slow, try again or check network

**Error: "Google API quota exceeded"**
- Solution: Check Google Cloud Console for API usage limits

### 6. API Testing URLs

You can test the API endpoints directly in your browser:

- **Geocoding Test**: `http://localhost:3000/api/google-maps/geocode?address=Sydney+NSW+Australia`
- **Places Test**: `http://localhost:3000/api/google-maps/places?lat=-33.8688&lng=151.2093&type=train_station`

Expected responses should contain `status: "OK"` and relevant data.

### 7. Environment Variables Check

Add this to verify your environment setup:

```javascript
console.log('API Key configured:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
console.log('API Key length:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length);
```

### 8. Common Next.js Issues

**Issue: Environment variables not loading**
- Ensure `.env.local` is in root directory
- Variable names must start with `NEXT_PUBLIC_` for client-side access
- Restart development server after changes

**Issue: API routes not working**
- Check file structure: `src/app/api/google-maps/*/route.ts`
- Ensure proper exports: `export async function GET()`

### 9. Google Cloud Console Setup

1. **Enable Required APIs**:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
   - Distance Matrix API

2. **API Key Restrictions** (Recommended):
   - HTTP referrers: `localhost:3000/*`, `your-domain.com/*`
   - API restrictions: Select only the APIs you need

3. **Billing**: Ensure billing is enabled (Google requires it even for free tier)

### 10. Quick Test Script

Add this to your browser console for quick testing:

```javascript
fetch('/api/google-maps/geocode?address=Sydney+NSW+Australia')
  .then(res => res.json())
  .then(data => console.log('API Test Result:', data))
  .catch(err => console.error('API Test Error:', err));
```

---

## Getting Help

If the issue persists:

1. **Check Browser Console**: Look for specific error messages
2. **Use Test API Button**: Click the "Test API" button for diagnostic information
3. **Check Network Tab**: Look for failed HTTP requests
4. **Verify Environment**: Ensure `.env.local` file exists and contains valid API key

The enhanced error messages will now provide more specific guidance on what went wrong. 