export interface CustomAuthProps {
  signOut: () => void;
  user: User;
}

type User = {
    signInDetails: {
        authFlowType: string;
        loginId: string;
    }
    userId: string;
    username: string;
}