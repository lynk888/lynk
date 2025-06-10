# Database Setup Guide - Complete Solution

## 🚨 **Current Error Fix**

You're getting this error:
```
ERROR: 42883: function search_users(unknown, integer, integer) does not exist
```

This means the search function doesn't exist or has wrong parameter types.

## 🔧 **Step-by-Step Fix**

### **Step 1: Create Basic Search Function**
Run this SQL script first to create a working search function:
```sql
\i create_basic_search_function.sql
```

### **Step 2: Test the Function**
Verify it works:
```sql
\i test_database_functions.sql
```

### **Step 3: (Optional) Add Enhanced Features**
If you want blocking and enhanced profiles:
```sql
\i cleanup_functions.sql
\i supabase/migrations/20240706_add_blocking_and_profile_features.sql
```

## 📋 **What Each Script Does**

### `create_basic_search_function.sql`
- ✅ Drops any conflicting functions
- ✅ Creates a simple `search_users` function that works with existing schema
- ✅ Uses only basic profile fields (id, username, email, avatar_url)
- ✅ Includes proper type casting to avoid parameter errors

### `test_database_functions.sql`
- ✅ Verifies the search function exists and works
- ✅ Tests function calls with proper parameters
- ✅ Checks for optional enhanced features
- ✅ Provides a complete status report

### Enhanced Migration (Optional)
- ✅ Adds user blocking functionality
- ✅ Adds enhanced profile fields (bio, interests, online status)
- ✅ Adds chat archiving capabilities

## 🚀 **Quick Start (Minimum Required)**

If you just want to get the app working immediately:

1. **Run the basic search function:**
   ```sql
   \i create_basic_search_function.sql
   ```

2. **Test it works:**
   ```sql
   SELECT * FROM search_users('test'::text, 1, 5);
   ```

3. **Start your app** - it should work now!

## 🔍 **Verification Commands**

After running the setup, verify everything works:

```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'search_users';

-- Test function call
SELECT * FROM search_users('a'::text, 1, 3);

-- Check profiles table
SELECT id, username, email FROM profiles LIMIT 3;
```

## 🎯 **App Features Status**

### ✅ **Working Immediately (Basic Setup)**
- User search functionality
- Contact management with persistent state
- Message count indicators
- Chat deletion options
- Profile viewing (basic fields)
- Proper navigation and logout

### ✅ **Working After Enhanced Setup**
- User blocking system
- Enhanced profiles with bio/interests
- Advanced search with blocking filters
- Chat archiving
- Online status tracking

## 🛠 **Troubleshooting**

### **If search function still doesn't work:**
```sql
-- Manual cleanup
DROP FUNCTION IF EXISTS search_users(text, integer, integer);

-- Recreate manually
CREATE OR REPLACE FUNCTION search_users(
  search_term TEXT,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.email, p.avatar_url
  FROM profiles p
  WHERE p.username ILIKE '%' || search_term || '%'
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_users TO authenticated;
```

### **If profiles table doesn't exist:**
The app will fall back to direct table queries and still work.

### **If you get permission errors:**
Make sure you're running the SQL as a database admin or service role.

## 📱 **App Compatibility**

The React Native app includes fallback mechanisms:

- **No search function?** → Falls back to direct table queries
- **Missing profile fields?** → Shows "Recently active" instead of specific times
- **No blocking table?** → Blocking features are disabled but app still works
- **Function errors?** → Graceful error handling with user feedback

## 🎉 **Success Indicators**

You'll know everything is working when:

1. ✅ `test_database_functions.sql` runs without errors
2. ✅ You can call `SELECT * FROM search_users('test'::text, 1, 5);`
3. ✅ Your React Native app starts without database errors
4. ✅ User search works in the app
5. ✅ Contact management functions properly

## 📞 **Support**

If you're still having issues:

1. Run `test_database_functions.sql` and share the output
2. Check your Supabase logs for any RLS policy errors
3. Verify your database user has the correct permissions
4. Make sure you're connected to the right database/project

The app is designed to be resilient - even if some advanced features don't work, the core functionality will continue to operate.
