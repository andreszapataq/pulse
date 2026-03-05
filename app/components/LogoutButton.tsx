'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <motion.button
      type="button"
      onClick={handleLogout}
      whileHover={{ opacity: 0.7 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 25 }}
      className="text-[11px] text-gray-500 underline underline-offset-2 cursor-pointer"
    >
      Cerrar sesion
    </motion.button>
  );
}
