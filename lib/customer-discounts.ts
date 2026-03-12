import { createClient } from '@/lib/supabase/server';

export interface CustomerDiscountRule {
  alegraContactId: string;
  clientIdentification?: string;
  clientName: string;
  discountPercent: number;
  active: boolean;
}

interface CustomerDiscountRow {
  alegra_contact_id: string;
  client_identification: string | null;
  client_name: string;
  discount_percent: number | string;
  active: boolean;
}

export async function getCustomerDiscountRules(): Promise<CustomerDiscountRule[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('discounts')
      .select(
        'alegra_contact_id, client_identification, client_name, discount_percent, active'
      )
      .eq('active', true);

    if (error) {
      console.error('⚠️ No fue posible cargar descuentos de clientes:', error);
      return [];
    }

    return ((data ?? []) as CustomerDiscountRow[]).map((row) => ({
      alegraContactId: row.alegra_contact_id,
      clientIdentification: row.client_identification ?? undefined,
      clientName: row.client_name,
      discountPercent: Number(row.discount_percent) || 0,
      active: row.active,
    }));
  } catch (error) {
    console.error('⚠️ Error consultando descuentos de clientes:', error);
    return [];
  }
}
