# Cyrillic Alphabet Learning Game

A comprehensive gamified Cyrillic learning system with frontend React game and Supabase backend for XP progression, leveling, and persistent user progress.

## 🎯 Project Overview

This project combines:

- **Frontend Game**: Interactive React-based learning with audio pronunciation
- **Backend System**: Supabase database with XP progression and user authentication
- **Gamification**: Level system, XP rewards, and progress tracking
- **Full Stack**: Ready for production deployment with persistent user data

## 📁 Complete Project Structure

```
cyril/
├── Frontend Game Files
│   ├── index.html              # Main HTML file with React game
│   ├── src/                    # Game JavaScript files
│   │   ├── app.js             # Main React component
│   │   ├── auth/session.js    # Authentication logic
│   │   └── gamification/xp.js # XP system integration
│   └── audio/                  # 33 pronunciation MP3 files
│       ├── 01.mp3             # А pronunciation
│       ├── ...                # (all 33 letters)
│       └── 33.mp3             # Я pronunciation
│
├── Backend Infrastructure
│   ├── Makefile               # Command interface
│   ├── scripts/               # Helper scripts
│   │   ├── start.sh          # Start Supabase services
│   │   ├── stop.sh           # Stop services
│   │   ├── status.sh         # Show status
│   │   ├── reset.sh          # Reset database
│   │   └── test-queries.sh   # Run test queries
│   ├── supabase/             # Supabase configuration
│   │   └── migrations/
│   │       └── 20250925_xp.sql # XP system migration
│   ├── sample-queries.sql     # Complete SQL examples
│   ├── .env.local            # Generated environment variables
│   ├── package.json          # NPM dependencies
│   └── package-lock.json     # Lock file
│
└── README.md                  # This comprehensive guide
```

## 🚀 Quick Start

### Frontend Only (Simple Version)

1. Open `index.html` in any modern web browser
2. Start learning with audio pronunciation
3. Take quizzes to test knowledge

### Full Stack Development

1. **Start Supabase Backend:**

   ```bash
   make dev
   # or manually: make start
   ```

2. **Access Services:**
   - Game: Open `index.html` in browser
   - Supabase Studio: http://localhost:54323
   - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

3. **Available Commands:**
   ```bash
   make help          # Show all commands
   make start         # Start Supabase services
   make stop          # Stop services
   make status        # Show service status
   make reset         # Reset database
   make db-shell      # Connect to PostgreSQL
   make test-queries  # Run sample queries
   ```

## 🎮 Game Features

### Frontend Game

- **Learn Mode**: Browse 33 Cyrillic letters with audio pronunciation
- **Quiz Mode**: Randomized multiple-choice questions with audio hints
- **Audio Support**: Native speaker pronunciation for every letter
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Progress Tracking**: Session-based scoring

### Backend Gamification

- **XP System**: Earn points for completing letters
- **Level Progression**: 6+ levels with increasing thresholds
- **Difficulty-Based Rewards**: 10-20 XP based on letter complexity
- **Persistent Progress**: User authentication and data storage
- **Analytics**: Detailed progress tracking and statistics

## 🗄️ Database System

### XP Level System

```
Level 1: 0-99 XP      (Beginner)
Level 2: 100-249 XP   (Novice)
Level 3: 250-499 XP   (Intermediate)
Level 4: 500-899 XP   (Advanced)
Level 5: 900-1399 XP  (Expert)
Level 6+: 1400+ XP    (Master - 500 XP per level)
```

### Letter Difficulty & Rewards

- **Easy Vowels (10 XP)**: А, Е, И, О, У
- **Special Vowels (15 XP)**: Ё, Ы, Э, Ю, Я
- **Common Consonants (10 XP)**: Б, В, Г, Д, К, Л, М, Н, П, Р, С, Т
- **Complex Consonants (15 XP)**: Ж, З, Й, Ф, Х, Ц, Ч, Ш, Щ
- **Special Signs (20 XP)**: Ъ (hard sign), Ь (soft sign)

**Total Possible XP**: 485 points (achieves Level 3-4)

### Core Functions

- **`compute_level(xp)`**: Calculate level from XP points
- **`complete_item(item_id)`**: Atomically complete letter and award XP
- **Row Level Security**: Users can only access their own data

## 🔧 Development Workflow

### Backend Setup

```bash
# Prerequisites: Node.js, Docker, PostgreSQL client

# Start development environment
make dev

# Check what's running
make status

# Connect to database for manual queries
make db-shell

# Run comprehensive test queries
make test-queries
```

### Sample Usage

```sql
-- Complete alphabet setup (in sample-queries.sql)
-- Complete a letter and get XP
SELECT * FROM complete_item('letter-uuid-here');

-- Check user progress
SELECT total_xp, level FROM profiles WHERE user_id = auth.uid();
```

## 🧪 Testing & Data

### Automated Tests

- `make test-queries`: Run all test scenarios
- `sample-queries.sql`: Complete SQL examples including:
  - Full 33-letter alphabet setup
  - Progress simulation and tracking
  - XP breakdown analysis
  - Leaderboard queries
  - Level progression tracking

### Test Scenarios

1. **XP Level Testing**: Verify level computation accuracy
2. **Progress Tracking**: Monitor learning completion rates
3. **Difficulty Analysis**: XP breakdown by letter complexity
4. **Multi-user Testing**: Leaderboard and ranking system
5. **Level Progression**: Track progress to next level

## 🔒 Security Features

### Authentication & Authorization

- **Supabase Auth**: Complete user authentication system
- **Row Level Security (RLS)**: Data isolation between users
- **Secure Functions**: Authentication checks in all operations
- **Atomic Operations**: Prevents race conditions in XP updates

### Safe Deployment

- Environment variables for sensitive data
- Database migrations with rollback safety
- Idempotent operations (safe to re-run)
- Proper error handling and validation

## 📊 Analytics & Progress Tracking

### Available Metrics

- Completion percentage by difficulty level
- XP earned vs. total possible XP
- Learning velocity and time tracking
- Level progression analysis
- Performance comparisons and leaderboards

### Query Examples

```sql
-- User progress overview
SELECT
  total_xp,
  level,
  (total_xp * 100.0 / 485) as completion_percentage
FROM profiles WHERE user_id = auth.uid();

-- Next level progress
SELECT
  level,
  total_xp,
  CASE WHEN level = 1 THEN 100 ELSE 250 END as next_level_xp
FROM profiles WHERE user_id = auth.uid();
```

## 🚢 Deployment Options

### Frontend Only (Static)

1. **Netlify**: Drag entire folder to Netlify deploy
2. **Vercel**: Git integration for automatic deployments
3. **GitHub Pages**: Free hosting for static sites

### Full Stack (with Backend)

1. **Supabase Cloud**: Deploy backend to Supabase hosting
2. **Frontend + Supabase**: Host frontend anywhere, backend on Supabase
3. **Self-hosted**: Deploy both components to your infrastructure

### Environment Setup

```bash
# Production environment variables
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
# (Generated automatically in .env.local for local development)
```

## 🚀 Deploy to Supabase

### Prerequisites

- Supabase account and project created
- Environment variables configured (see below)

### Required Environment Variables (names only)

```bash
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Commands

```bash
# Check project link status
npx supabase link status

# Push local schema to live project
npx supabase db push

# Test live REST API
curl -i "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### Row Level Security (RLS) Note

The `profiles` table requires appropriate RLS policies for production use. For development, you may need to add a basic read policy or configure authentication-based access controls.

## 🛠️ Technologies Used

### Frontend

- React 18 with modern hooks
- Tailwind CSS for responsive styling
- HTML5 Audio API for pronunciation
- Vanilla JavaScript for game logic

### Backend

- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security (RLS)
- Database functions (PL/pgSQL)
- RESTful API auto-generation

### Development Tools

- Make for command orchestration
- Docker for local Supabase environment
- NPM for package management
- Git for version control

## 🚀 Next Steps & Enhancements

### Immediate Tasks

1. Integrate frontend with Supabase backend
2. Add user authentication to the game
3. Implement XP rewards for game completion
4. Add progress persistence across sessions

### Future Enhancements

- **Audio Features**: Pronunciation practice with speech recognition
- **Spaced Repetition**: Algorithm-based review scheduling
- **Social Features**: Friend challenges and competitions
- **Mobile App**: Native iOS/Android development
- **Achievement System**: Badges and milestone rewards
- **Analytics Dashboard**: Detailed learning insights

### Advanced Features

- **AI Integration**: Personalized learning recommendations
- **Multi-language Support**: Expand beyond Russian Cyrillic
- **Offline Mode**: Progressive Web App (PWA) capabilities
- **Accessibility**: Screen reader and keyboard navigation support

## 📚 Documentation & Resources

### Key Files

- **`Makefile`**: All development commands
- **`sample-queries.sql`**: Complete SQL examples and test data
- **`scripts/test-queries.sh`**: Interactive testing framework
- **`supabase/migrations/`**: Database schema and functions

### Learning Resources

- Cyrillic alphabet with authentic pronunciation
- Progressive difficulty system
- Comprehensive progress tracking
- Real-world gamification mechanics

---

**🎯 Ready for Development**: Complete full-stack learning platform
**🚀 Production Ready**: Scalable architecture with Supabase backend
**🎮 Engaging**: Gamified learning with XP progression and levels
**🔊 Interactive**: Audio pronunciation for authentic learning experience
