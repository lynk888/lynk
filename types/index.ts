export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(root)': undefined;
  '+not-found': undefined;
  'Welcome': undefined;
  'Home': undefined;
  'Chat': undefined;
  'login': undefined;
  'register': undefined;
  'Splash': undefined;
  Terms: undefined; // Add the 'Terms' screen here
  Login: undefined;
  EmailSignup: undefined;
};

export interface UserData {
  email: string;
  username: string;
  createdAt: number;
}

export interface RegisterUserParams {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  token?: string;
  error?: string;
}