# 🚀 Setup & Deployment Guide

This guide will walk you through setting up your gamified Cyrillic learning app from scratch.

## 📋 Prerequisites

- A Supabase account (free tier works great)
- A Netlify account (or any static hosting service)
- Basic familiarity with copying/pasting code

## 🔧 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `cyrillic-learning-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (this will take 30-60 seconds)
6. You should see "Success. No rows returned" - this is correct!

### Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 4: Configure Your App

1. Open `index.html` (or use the enhanced version from the artifacts)
2. Find these lines near the top of the script section:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://abcdefgh.supabase.co'; // Your actual URL
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual key
   ```

### Step 5: Test Locally (Optional)

1. Open `index.html` in your browser
2. You should see the authentication screen (not the setup warning)
3. Try creating an account and signing in
4. You should see the main app with user stats

### Step 6: Deploy to Netlify

#### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up/sign in
2. Drag your entire project folder to the Netlify dashboard
3. Your site will be deployed automatically!

#### Option B: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. In Netlify, click "New site from Git"
3. Connect your repository
4. Deploy settings:
   - **Build command**: Leave empty
   - **Publish directory**: Leave empty or use `.`
5. Click "Deploy site"

#### Option C: Netlify CLI (Advanced)
```bash
# If you have netlify CLI installed
netlify deploy --prod --dir="."
```

### Step 7: Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if desired (optional)
4. Set **Site URL** to your Netlify domain (e.g., `https://amazing-app-123.netlify.app`)

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] App loads without setup warnings
- [ ] User can sign up with email
- [ ] User receives confirmation email
- [ ] User can sign in after confirming email
- [ ] User sees their profile with Level 1, 0 XP
- [ ] User can add tasks and complete them for XP
- [ ] User can access Cyrillic learning game
- [ ] Completing tasks and quizzes awards XP correctly

## 🔍 Troubleshooting

### "Setup Required" Screen Still Showing
- Check that you replaced both `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Redeploy your site after making changes

### User Can't Sign Up
- Check Supabase **Authentication** → **Settings**
- Ensure **Email** provider is enabled
- Verify **Site URL** matches your deployed domain

### Database Errors
- Make sure you ran the complete `schema.sql` file
- Check **Supabase** → **Database** → **Tables** to see if tables were created
- Look for errors in **Logs** section of Supabase

### XP Not Updating
- Check **Row Level Security** is properly set up (included in schema.sql)
- Verify user is properly authenticated
- Look at **Supabase** → **Database** → **xp_ledger** table for XP transactions

## 🔄 Updates and Maintenance

### Adding New Features
1. Update your local files
2. Test locally
3. Deploy to Netlify (automatic if using Git integration)

### Database Updates
1. Create new SQL migration file
2. Run in Supabase SQL Editor
3. Update application code as needed

### Monitoring Usage
- **Supabase Dashboard**: Check user count, database usage
- **Netlify Analytics**: See page views and traffic
- **Supabase Logs**: Debug any issues

## 📊 Understanding Your Data

### Key Tables to Monitor
- `profiles`: User stats (XP, levels, streaks)
- `items`: Tasks created by users
- `quiz_sessions`: Learning activity
- `xp_ledger`: All XP transactions
- `events`: Complete activity log

### Useful Queries
```sql
-- Top users by XP
SELECT display_name, total_xp, level 
FROM profiles 
ORDER BY total_xp DESC 
LIMIT 10;

-- Daily activity
SELECT date, COUNT(*) as active_users
FROM events 
WHERE occurred_at >= NOW() - INTERVAL '7 days'
GROUP BY date
ORDER BY date;

-- Most popular features
SELECT domain, COUNT(*) as usage_count
FROM events 
GROUP BY domain
ORDER BY usage_count DESC;
```

## 🎯 Next Steps

Once your app is live:

1. **Share with friends** to get initial users
2. **Monitor usage** through Supabase dashboard  
3. **Gather feedback** on features and UX
4. **Add new features** from the roadmap
5. **Consider custom domain** (Netlify Pro feature)

## 💡 Pro Tips

- **Free tiers**: Supabase free tier supports up to 50MB storage and 500MB bandwidth
- **Custom domain**: Set up a custom domain in Netlify for better branding
- **Analytics**: Add Google Analytics for deeper insights
- **PWA**: The app can be installed on mobile devices
- **Performance**: Images and audio files are cached by Netlify
- **Security**: All data is protected by Row Level Security policies

---

**Need help?** Create an issue in the GitHub repository or check the troubleshooting section above! 🤝
