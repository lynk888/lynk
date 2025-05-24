# Real-Time Messaging Setup Guide

This guide will walk you through setting up the real-time messaging functionality in your LYNK chat app.

## Prerequisites

- A Supabase account (https://supabase.com)
- Your Supabase project URL and anon key
- Node.js and npm installed

## 1. Database Setup

### 1.1 Create Tables in Supabase

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `supabase/migrations/20240701_chat_tables.sql`
4. Run the query to create all necessary tables and policies

### 1.2 Verify Table Creation

After running the SQL script, verify that the following tables have been created:

- `conversations`
- `conversation_participants`
- `messages`
- `message_status`
- `contacts`

Also verify that Row Level Security (RLS) policies have been applied to each table.

## 2. Project Setup

### 2.1 Update Supabase Configuration

Make sure your Supabase URL and anon key are correctly set in `utils/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 2.2 Install Required Dependencies

Run the following command to install the required dependencies:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

## 3. Service and Hook Implementation

The following services and hooks have been implemented:

### 3.1 Services

- `services/messageService.ts`: Handles sending, receiving, and managing messages
- `services/conversationService.ts`: Manages conversations between users
- `services/contactService.ts`: Handles contact management
- `services/typingService.ts`: Manages typing indicators

### 3.2 Hooks

- `hooks/useMessages.ts`: React hook for real-time message functionality
- `hooks/useConversations.ts`: React hook for conversation management
- `hooks/useContacts.ts`: React hook for contact management
- `hooks/useTypingIndicator.ts`: React hook for typing indicator functionality

## 4. Screen Implementation

The following screens have been updated to use the real-time messaging functionality:

- `app/(root)/Chat/Contact/ContactScreen.tsx`: Displays contacts and navigates to chat
- `app/(root)/Chat/Contact/AddContactScreen.tsx`: Allows adding new contacts
- `app/(root)/Chat/ChatScreen2.tsx`: Real-time chat interface
- `app/(root)/Chat/ContactInfo/ContactInfo.tsx`: Contact information and management

## 5. Testing Real-Time Functionality

### 5.1 Create Test Users

1. Create at least two test users in your Supabase authentication system
2. Log in with each user on different devices or browser sessions

### 5.2 Test Contact Management

1. Add contacts using the Add Contact screen
2. Verify that contacts appear in the Contacts list
3. Test editing contact names in the Contact Info screen

### 5.3 Test Real-Time Messaging

1. Start a conversation between two users
2. Send messages from both users
3. Verify that messages appear in real-time for both users
4. Test typing indicators by typing in the message input

## 6. Troubleshooting

### 6.1 Supabase Connection Issues

If you experience connection issues with Supabase:

1. Verify your Supabase URL and anon key
2. Check that your Supabase project is active
3. Ensure that RLS policies are correctly configured

### 6.2 Real-Time Updates Not Working

If real-time updates are not working:

1. Check that you have enabled real-time functionality in your Supabase project settings
2. Verify that the channel subscriptions are correctly set up in the hooks
3. Check for any console errors related to Supabase channels

### 6.3 Authentication Issues

If you experience authentication issues:

1. Verify that users are correctly authenticated with Supabase
2. Check that the auth token is being correctly stored and retrieved
3. Ensure that RLS policies are correctly configured to allow access to authenticated users

## 7. Next Steps

### 7.1 Additional Features

Consider implementing these additional features:

- Group chat functionality
- Message attachments (images, files)
- Message reactions
- Read receipts
- Push notifications for new messages

### 7.2 Performance Optimization

For larger chat histories, consider implementing:

- Virtualized lists for better performance
- Pagination for loading older messages
- Message caching for offline access

## 8. Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)

