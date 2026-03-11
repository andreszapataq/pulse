import { NextResponse } from 'next/server';
import { getCustomerDiscountRules } from '@/lib/customer-discounts';
import {
  hasAlegraCredentials,
  refreshAlegraMetricsSnapshot,
} from '@/lib/alegra';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!hasAlegraCredentials()) {
    return NextResponse.json({ lastSyncedAt: null });
  }

  try {
    const customerDiscountRules = await getCustomerDiscountRules();
    const snapshot = await refreshAlegraMetricsSnapshot(customerDiscountRules);

    return NextResponse.json({
      lastSyncedAt: snapshot?.lastUpdated ?? null,
    });
  } catch (error) {
    console.error('⚠️ No fue posible sincronizar métricas de Alegra:', error);
    return NextResponse.json(
      { error: 'No fue posible sincronizar las métricas.' },
      { status: 500 }
    );
  }
}
