import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
      <div className="mb-[50px]">
        <div>
          <img src="/logo.svg" alt="Pulse Logo" className="h-4 w-auto ml-px mb-px" />
        </div>
        <h1 className="text-sm font-semibold">Pulse</h1>
      </div>

      <LoginForm initialError={params.error} />
    </main>
  );
}
