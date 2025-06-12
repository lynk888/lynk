export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  EmailVerification: undefined;
  Chat: {
    conversationId: string;
    contactId: string;
  };
  ContactInfo: {
    contactId: string;
  };
  Settings: undefined;
  UserProfile: {
    userId: string;
  };
  Privacy: undefined;
  Notifications: undefined;
  Calls: undefined;
  Contacts: undefined;
  Search: undefined;
  AddContact: undefined;
  NewConversation: undefined;
  ResetPassword: undefined;
  EmailSignup: undefined;
};
