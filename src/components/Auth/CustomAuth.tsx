import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import {
  useTheme,
  View,
  Text,
  Heading,
  Button,
} from "@aws-amplify/ui-react";
import { ReactNode } from "react";

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        {/* Replace the Amplify logo with your branding */}
        <Text fontSize={tokens.fontSizes.xl} fontWeight="bold">
          PolyBara
        </Text>
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Text color={tokens.colors.neutral[80]}>
          &copy; {new Date().getFullYear()} PolyBara. All Rights Reserved.
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Heading level={3}>Sign in to PolyBara</Heading>
        </View>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button onClick={toForgotPassword} size="small" variation="link">
            Forgot your password?
          </Button>
        </View>
      );
    },
  },

  SignUp: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Create your PolyBara account
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
          >
            Already have an account? Sign In
          </Button>
        </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Confirm your account
        </Heading>
      );
    },
  },
  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Set up two-factor authentication
        </Heading>
      );
    },
    Footer() {
      return (
        <Text textAlign="center">
          Scan the QR code with your authenticator app.
        </Text>
      );
    },
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Confirm your sign-in
        </Heading>
      );
    },
    Footer() {
      return <Text textAlign="center">Enter the code sent to your email.</Text>;
    },
  },
  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Reset your password
        </Heading>
      );
    },
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Set a new password
        </Heading>
      );
    },
    Footer() {
      return (
        <Text textAlign="center">
          Your password has been reset successfully.
        </Text>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      label: "Email",
      placeholder: "Enter your email",
    },
  },
  signUp: {
    username: {
      label: "Email:",
      placeholder: "Enter your email",
      order: 1,
    },
    password: {
      label: "Password:",
      placeholder: "Enter your password",
      isRequired: true,
      order: 2,
    },
    confirm_password: {
      label: "Confirm Password:",
      placeholder: "Confirm your password",
      isRequired: true,
      order: 3,
    },
  },
  forceNewPassword: {
    password: {
      placeholder: "Enter your new password",
    },
  },
  forgotPassword: {
    username: {
      label: "Email:",
      placeholder: "Enter your email",
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: "Enter your confirmation code",
      label: "Confirmation Code:",
    },
    confirm_password: {
      placeholder: "Enter your new password",
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: "PolyBara",
      totpUsername: "polybara_user",
    },
    confirmation_code: {
      label: "Confirmation Code:",
      placeholder: "Enter your confirmation code",
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: "Confirmation Code:",
      placeholder: "Enter your confirmation code",
    },
  },
};

export default function CustomAuth({ children }: { children: ReactNode }) {
  return (
    <Authenticator
      socialProviders={['google']} formFields={formFields}
      components={components}
    >
      {children}
    </Authenticator>
  );
}
