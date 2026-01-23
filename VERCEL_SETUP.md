# Vercel Deployment Setup

## Important: Configure Root Directory in Vercel Dashboard

1. Go to your Vercel project settings: https://vercel.com/[your-username]/nyayneti-mvp/settings
2. Navigate to **General** → **Root Directory**
3. Set Root Directory to: `frontend`
4. Save the changes

This tells Vercel to:
- Look for `package.json` in the `frontend/` folder
- Run build commands from `frontend/` directory
- Output build files from `frontend/dist/`

## Alternative: If Root Directory Setting Doesn't Work

The `vercel.json` file I created should handle this automatically, but if you still see issues:

1. Check Vercel build logs: https://vercel.com/[your-username]/nyayneti-mvp/deployments
2. Look for any build errors
3. Common issues:
   - Missing dependencies (should be fixed by `npm ci` in vercel.json)
   - Build output not found (check that `frontend/dist` exists after build)
   - Routing issues (the rewrites in vercel.json should handle this)

## Manual Build Test

To test the build locally:

```bash
cd frontend
npm install
npm run build
```

This should create a `frontend/dist` folder with all the built files.
