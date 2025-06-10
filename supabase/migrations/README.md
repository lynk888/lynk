# Database Migration Guide

## ⚠️ IMPORTANT: Function Conflicts Fix

If you're getting function errors like:
- `ERROR: 42725: function name "is_user_blocked" is not unique`
- `ERROR: 42P13: cannot change return type of existing function`

Follow this **exact order**:

## Step-by-Step Migration Process

### Step 1: Clean up existing functions
```sql
-- Run this first to remove all conflicting functions
\i cleanup_functions.sql
```

### Step 2: Run the function fix migration
```sql
-- This will recreate the search_users function with the correct signature
\i supabase/migrations/20240706_fix_search_function.sql
```

### Step 3: Run the main feature migration
```sql
-- This adds all the new tables and features
\i supabase/migrations/20240706_add_blocking_and_profile_features.sql
```

## Alternative: Manual Function Drop

If you're still getting function errors, run these commands manually in your Supabase SQL editor:

```sql
-- Drop all conflicting functions
DROP FUNCTION IF EXISTS search_users(text);
DROP FUNCTION IF EXISTS search_users(text, integer);
DROP FUNCTION IF EXISTS search_users(text, integer, integer);
DROP FUNCTION IF EXISTS search_users_basic(text, integer, integer);
DROP FUNCTION IF EXISTS is_user_blocked(UUID);
DROP FUNCTION IF EXISTS is_user_blocked(target_user_id UUID);
DROP FUNCTION IF EXISTS update_user_last_seen();
```

Then run the migrations normally.

## Quick Fix Option

For immediate resolution, you can also run:
```sql
\i fix_search_function_error.sql
```

This creates a minimal working version of the search function.

## What Each Migration Does

### 20240706_fix_search_function.sql
- Drops existing search_users function (all versions)
- Creates new search_users function with enhanced return type
- Creates fallback search_users_basic function
- Grants proper permissions

### 20240706_add_blocking_and_profile_features.sql
- Creates blocked_users table with RLS policies
- Adds bio, interests, is_online, last_seen to profiles table
- Adds archiving support to conversation_participants
- Creates helper functions for blocking checks
- Adds indexes for performance

## Verification

After running migrations, verify they worked:

```sql
-- Check if blocked_users table exists
SELECT * FROM information_schema.tables WHERE table_name = 'blocked_users';

-- Check if new profile columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('bio', 'interests', 'is_online', 'last_seen');

-- Test search function
SELECT * FROM search_users('test', 1, 5);
```

## Rollback (if needed)

If you need to rollback the changes:

```sql
-- Drop new tables
DROP TABLE IF EXISTS blocked_users;

-- Remove new columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
ALTER TABLE profiles DROP COLUMN IF EXISTS interests;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_online;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_seen;

-- Remove archiving columns
ALTER TABLE conversation_participants DROP COLUMN IF EXISTS is_archived;
ALTER TABLE conversation_participants DROP COLUMN IF EXISTS archived_at;

-- Drop functions
DROP FUNCTION IF EXISTS search_users(text, integer, integer);
DROP FUNCTION IF EXISTS search_users_basic(text, integer, integer);
DROP FUNCTION IF EXISTS is_user_blocked(uuid);
DROP FUNCTION IF EXISTS update_user_last_seen();
```
