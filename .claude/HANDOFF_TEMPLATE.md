# HANDOFF BLOCK — Claude Desktop → Claude Code

## Context
Desktop Claude analyzed the current project state and designed improvements for the Cyrillic Alphabet Game. Current schema has basic profiles/items tables. Need to add comprehensive user sessions and progress tracking.

## Files to Create/Update

### 1. `supabase/migrations/20250927170000_add_sessions.sql`
```sql
-- Add user sessions table for progress tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  letters_completed int DEFAULT 0,
  xp_earned int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_date ON public.user_sessions(session_start);
```

### 2. `src/sessions.js` (new file)
```javascript
import { supa } from './supa.js';

export class SessionManager {
  constructor(userId) {
    this.userId = userId;
    this.currentSession = null;
  }

  async startSession() {
    const { data, error } = await supa
      .from('user_sessions')
      .insert({ user_id: this.userId })
      .select()
      .single();
    
    if (error) throw error;
    this.currentSession = data;
    return data;
  }

  async endSession(lettersCompleted, xpEarned) {
    if (!this.currentSession) return null;
    
    const { data, error } = await supa
      .from('user_sessions')
      .update({
        session_end: new Date(),
        letters_completed: lettersCompleted,
        xp_earned: xpEarned
      })
      .eq('id', this.currentSession.id)
      .select()
      .single();
    
    if (error) throw error;
    this.currentSession = null;
    return data;
  }
}
```

## Verification Tasks
1. Run `/local-smoke` to test database connection
2. Execute: `npx supabase db reset` to apply new migration
3. Test session creation: `curl -X POST http://127.0.0.1:54321/rest/v1/user_sessions -H "apikey: [ANON_KEY]" -H "Content-Type: application/json" -d '{"user_id": "[TEST_UUID]"}'`
4. Verify with: `make db-shell` then `SELECT * FROM user_sessions;`

## Expected Results
- New user_sessions table created with proper indexes
- REST API responds 201 for session creation
- Foreign key constraint enforces valid user_id references

## Log Entry Template
```
## [TIMESTAMP] Code Run
**Commands**
```bash
npx supabase db reset
curl -X POST [session test]
make db-shell
```
**Results (truncated)**
```
✅ Migration applied successfully
✅ Session creation returns 201
✅ Database shows new session record
```
**Artifacts**
- supabase/migrations/20250927170000_add_sessions.sql: Created
- src/sessions.js: New session management module
```
