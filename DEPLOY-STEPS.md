# Quick Deployment Steps

## Step 1: Run the minimal schema in Supabase
1. Go to https://supabase.com/dashboard/project/ohhgmkiwkyntanzgetxv
2. Click "SQL Editor" → "New Query"
3. Copy and paste the contents of `database/minimal-schema.sql`
4. Click "Run"

## Step 2: Configure Supabase Auth
1. In Supabase dashboard, go to "Authentication" → "Settings"
2. Under "Site URL", set: `https://your-netlify-url.netlify.app` (you'll get this after deployment)
3. Under "Redirect URLs", add: `https://your-netlify-url.netlify.app/*`
4. Make sure "Enable email confirmations" is checked

## Step 3: Deploy to Netlify
Since CLI might have issues, use manual deployment:

### Option A: Drag & Drop (Recommended)
1. Go to https://netlify.com and sign into your account
2. Find your existing site (should be there since you have .netlify folder)
3. Drag the entire `cyril` folder to the deployment area
4. Wait for deployment to complete

### Option B: Manual Upload
1. Zip your `cyril` folder
2. Go to your Netlify site dashboard
3. Click "Deploys" → "Deploy manually"
4. Upload your zip file

## Step 4: Test the integration
1. Open your deployed site URL
2. You should see the Supabase test panel at the top
3. Enter your email and click "Sign in (magic link)"
4. Check your email and click the magic link
5. Come back to your site and click "Add test item & list"
6. You should see JSON data with your test items

## Current file to test: 
Use `index-test.html` - this has the smoke test integrated with your original game below it.

If the smoke test works, we can then integrate it properly into your main app!
