import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PDFReaderPage from './pages/PDFReaderPage';
import TextReaderPage from './pages/TextReaderPage';
import SettingsPage from './pages/SettingsPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Sign Up',
    path: '/signup',
    element: <SignUpPage />,
    visible: false
  },
  {
    name: 'Log In',
    path: '/login',
    element: <LogInPage />,
    visible: false
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    visible: false
  },
  {
    name: 'PDF Reader',
    path: '/pdf-reader/:id',
    element: <PDFReaderPage />,
    visible: false
  },
  {
    name: 'Text Reader',
    path: '/text-reader/:id',
    element: <TextReaderPage />,
    visible: false
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <SettingsPage />
  }
];

export default routes;
