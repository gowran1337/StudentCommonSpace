# Flat Code System - Implementation Guide

## Overview

The StudentCommonSpace application now includes a **Flat Code System** that allows students to organize themselves into separate groups (flats/classrooms). Each group shares a unique code, and users can only see content from people in their own flat.

## What's Changed

### 1. User Registration
- Added a **Flat Code** input field during registration
- Users must enter a code (minimum 3 characters) to create an account
- The code is automatically converted to uppercase for consistency
- All users with the same flat code will share the same data space

### 2. Data Isolation
All features are now isolated by flat code:
- ✅ **Direct Messages** - Only see flatmates in contacts list
- ✅ **Bulletin Board** - Post-its, drawings, and text are flat-specific
- ✅ **Task Board** - Cleaning tasks and shopping lists per flat
- ✅ **Expenses/Splitwise** - Expenses and settlements per flat
- ✅ **Cleaning Schedule** - Schedules are flat-specific
- ✅ **Draw Board** - Shared drawing board per flat

### 3. Profile Page
- Users can view their flat code in their profile
- Clear instructions to share the code with flatmates
- The flat code is prominently displayed with a helpful message

## How to Use

### For Students

1. **First User in a Flat**:
   - Register with a unique flat code (e.g., "FLAT101", "ROOM5A")
   - Share this code with your flatmates

2. **Joining an Existing Flat**:
   - Get the flat code from someone already in the flat
   - Use the same code during registration
   - You'll immediately see all shared content

3. **Viewing Your Code**:
   - Go to Profile page
   - Your flat code is displayed in a highlighted section
   - Share it with new flatmates

### For Developers/Admins

#### Database Migration

Run the SQL migration script to add flat_code support to your Supabase database:

```bash
# Execute the migration file in Supabase SQL Editor
# File: supabase_flat_code_migration.sql
```

The migration will:
- Add `flat_code` column to all data tables
- Create indexes for performance
- Enable Row Level Security (RLS)
- Set up policies to enforce data isolation
- Create triggers for new user setup

#### Environment Variables

No additional environment variables are needed. The system uses existing Supabase configuration.

#### Testing

1. **Test Data Isolation**:
   ```
   1. Register user A with flat code "TEST1"
   2. Register user B with flat code "TEST2"
   3. Add data as user A
   4. Login as user B - should not see user A's data
   5. Register user C with flat code "TEST1"
   6. Login as user C - should see user A's data but not B's
   ```

2. **Test Features**:
   - Direct Messages: Should only show flatmates
   - Bulletin Board: Items should be isolated
   - Task Board: Tasks should be isolated
   - Expenses: Should be isolated

## Technical Details

### Frontend Changes

1. **Register.tsx**
   - Added flat code input field
   - Validation for minimum 3 characters
   - Stores flat_code in localStorage and user object

2. **AuthContext.tsx**
   - Fetches flat_code from Supabase profiles
   - Stores in context and localStorage
   - Available to all components

3. **DirectMessages.tsx**
   - Filters user list by flat_code
   - Only shows contacts from same flat

4. **services/api.ts**
   - All API methods now filter by flat_code
   - getUserFlatCode() helper function
   - Automatic flat_code injection on create operations

5. **Profile.tsx**
   - Displays current flat code
   - Instructions for sharing with flatmates

### Database Schema

Each data table now includes:
- `flat_code` column (TEXT)
- Index on flat_code for performance
- RLS policies to enforce isolation

### Security

Row Level Security (RLS) ensures:
- Users can only SELECT data from their flat
- Users can only INSERT data for their flat
- Users can only UPDATE/DELETE data from their flat
- Enforced at database level for maximum security

## Migration from Existing Data

If you have existing data without flat_codes:

1. **Option A - Assign Default Code**:
   ```sql
   UPDATE cleaning_tasks SET flat_code = 'DEFAULT' WHERE flat_code IS NULL;
   UPDATE shopping_list SET flat_code = 'DEFAULT' WHERE flat_code IS NULL;
   -- Repeat for all tables
   ```

2. **Option B - Manual Assignment**:
   - Contact each user to provide their flat code
   - Update their profile with correct flat_code
   - Reassign existing data to appropriate flats

## Troubleshooting

### "No flat code found" Error
- **Cause**: User doesn't have flat_code set in localStorage
- **Fix**: Log out and log in again, or re-register

### Can't See Flatmate's Messages
- **Cause**: Different flat codes
- **Fix**: Verify both users have identical flat codes (case-sensitive)

### Data Not Loading
- **Cause**: Database migration not run
- **Fix**: Execute the SQL migration script in Supabase

### RLS Policy Errors
- **Cause**: Policies not set up correctly
- **Fix**: Re-run the policy creation section of migration script

## Future Enhancements

Potential improvements:
- [ ] Allow users to change flat code (with admin approval)
- [ ] Flat admin/moderator roles
- [ ] Flat statistics and analytics
- [ ] Invite system with unique invite links
- [ ] Flat settings and customization
- [ ] Multi-flat support (users in multiple flats)

## Support

For issues or questions:
1. Check this documentation
2. Review the migration script
3. Check browser console for errors
4. Verify Supabase RLS policies are active
5. Ensure all tables have flat_code column

## Version History

- **v1.0** (2026-01-27): Initial flat code system implementation
  - Added flat_code to user profiles
  - Implemented data isolation for all features
  - Created database migration script
  - Updated UI to display and manage flat codes
