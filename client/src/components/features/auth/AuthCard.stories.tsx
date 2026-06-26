import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { AuthCard } from './AuthCard';

const meta: Meta<typeof AuthCard> = {
  title: 'Features/Auth/AuthCard',
  component: AuthCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    onSignIn: fn(),
    onSignUp: fn(),
    onGoogleAuth: fn(),
    onForgotPassword: fn(),
    onModeChange: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AuthCard>;

export const SignIn: Story = {
  args: {
    mode: 'signin',
  },
};

export const SignUp: Story = {
  args: {
    mode: 'signup',
  },
};

export const SignInLoading: Story = {
  name: 'Sign In — Loading',
  args: {
    mode: 'signin',
    isLoading: true,
  },
};

export const SignUpLoading: Story = {
  name: 'Sign Up — Loading',
  args: {
    mode: 'signup',
    isLoading: true,
  },
};

export const WithError: Story = {
  name: 'Sign In — With Error',
  args: {
    mode: 'signin',
    error: 'Invalid email or password. Please try again.',
  },
};

export const SignUpWithError: Story = {
  name: 'Sign Up — With Error',
  args: {
    mode: 'signup',
    error: 'An account with this email already exists.',
  },
};
