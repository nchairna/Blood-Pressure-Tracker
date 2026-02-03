# Deployment Guide

This guide explains how to deploy the Blood Pressure Tracker to the internet so you can access it from any device.

---

## Build for Production

Before deploying, create a production build:

```bash
npm run build
```

This creates a `dist/` folder with optimized files:
- HTML, CSS, and JavaScript are minified
- Assets are hashed for cache busting
- Code is split for better loading

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option with automatic deployments.

#### First Time Setup

1. **Create a Vercel account**
   - Go to https://vercel.com
   - Sign up with GitHub, GitLab, or email

2. **Install Vercel CLI** (optional, for command line deployment)
   ```bash
   npm install -g vercel
   ```

3. **Deploy from command line**
   ```bash
   cd "/Users/nicholaschairnando/Projects/blood pressure tracker"
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? → No
   - Project name? → blood-pressure-tracker
   - Directory? → ./
   - Override settings? → No

5. **Set environment variables**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   # Enter your API key when prompted
   # Repeat for all VITE_FIREBASE_* variables
   ```

   Or set them in the Vercel dashboard:
   - Go to your project
   - Settings → Environment Variables
   - Add each `VITE_FIREBASE_*` variable

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

#### Automatic Deployments with Git

1. Push your code to GitHub/GitLab
2. In Vercel dashboard, click "Import Project"
3. Select your repository
4. Vercel will auto-deploy on every push to main

---

### Option 2: Netlify

Netlify is another excellent free option.

#### First Time Setup

1. **Create a Netlify account**
   - Go to https://netlify.com
   - Sign up with GitHub, GitLab, or email

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Login to Netlify**
   ```bash
   netlify login
   ```

4. **Deploy**
   ```bash
   cd "/Users/nicholaschairnando/Projects/blood pressure tracker"
   netlify deploy
   ```

5. **Follow the prompts**:
   - Create & configure a new site? → Yes
   - Team? → Select your team
   - Site name? → blood-pressure-tracker (or leave blank for random)
   - Publish directory? → dist

6. **Set environment variables**

   In Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add each `VITE_FIREBASE_*` variable

7. **Deploy to production**
   ```bash
   netlify deploy --prod
   ```

#### Automatic Deployments with Git

1. In Netlify dashboard, click "Add new site" → "Import an existing project"
2. Connect to GitHub/GitLab
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy!

---

### Option 3: Firebase Hosting

Deploy directly to Firebase (same service as your database).

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   cd "/Users/nicholaschairnando/Projects/blood pressure tracker"
   firebase init hosting
   ```

4. **Follow the prompts**:
   - Select existing project or create new
   - Public directory? → dist
   - Single-page app? → Yes
   - GitHub deploys? → No (or Yes for auto-deploy)

5. **Build and deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## Environment Variables

All deployment platforms need your Firebase configuration as environment variables.

### Required Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g., `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g., `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID number |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Security Note

Environment variables prefixed with `VITE_` are embedded in the client-side JavaScript. This is fine for Firebase config because:

1. Firebase is designed to work from the browser
2. Security is handled by Firebase security rules, not by hiding the config
3. The config values are not secret - they identify your project, not authenticate it

---

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `bp.yourdomain.com`)
3. Update DNS records as instructed

### Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

### Firebase Hosting

1. In Firebase console, go to Hosting
2. Click "Add custom domain"
3. Follow the verification steps

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] App loads without errors
- [ ] Can register a new account
- [ ] Can log in with existing account
- [ ] Can add a BP reading
- [ ] Dashboard shows data
- [ ] Can export to PDF
- [ ] Can export to CSV
- [ ] Works on mobile browser

---

## Troubleshooting

### "Firebase not initialized" error

- Check that environment variables are set in your deployment platform
- Variables must be set BEFORE building
- Redeploy after adding environment variables

### Blank page after deploy

- Check browser console for errors (F12)
- Verify build completed successfully
- Check that `dist/` folder contains files

### "Permission denied" in production

- Verify Firestore security rules are published
- Check that the user is properly authenticated
- Environment variables may be missing or incorrect

### Assets not loading (404)

- Check that the build output path is correct
- For Vite, the publish directory should be `dist`

---

## Updating Your Deployed App

### Manual Deployment

```bash
npm run build
vercel --prod    # or netlify deploy --prod
```

### Automatic Deployment (Git-connected)

Just push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

The platform will automatically build and deploy.

---

## Cost

All three platforms have generous free tiers:

| Platform | Free Tier |
|----------|-----------|
| Vercel | 100GB bandwidth/month, unlimited deployments |
| Netlify | 100GB bandwidth/month, 300 build minutes/month |
| Firebase Hosting | 10GB storage, 360MB/day transfer |

For a personal BP tracker app, you'll never exceed these limits.

---

## Recommended: Vercel + GitHub

For the simplest workflow:

1. Create a GitHub repository
2. Push your code to GitHub
3. Connect Vercel to your GitHub repo
4. Set environment variables in Vercel
5. Every push to `main` automatically deploys

This gives you:
- Automatic deployments
- Preview deployments for pull requests
- Easy rollbacks if something breaks
- Free SSL certificate
- Global CDN for fast loading
