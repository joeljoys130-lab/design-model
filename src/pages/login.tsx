import LoginView from '@/components/login-view';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const handleSuccess = (user: any) => {
    // Redirect directly to the dashboard root and replace history
    router.replace('/');
  };

  return <LoginView onLoginSuccess={handleSuccess} />;
}

