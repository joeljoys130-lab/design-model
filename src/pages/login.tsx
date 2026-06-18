import LoginView from '@/components/login-view';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const handleSuccess = (user: any) => {
    // In this mock, simply redirect after successful login
    router.push('/dashboard');
  };

  return <LoginView onLoginSuccess={handleSuccess} />;
}

