import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Frogtales',
  description: 'Sign in or create an account to access Frogtales academic content platform.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}