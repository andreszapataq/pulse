import { createClient } from '@/lib/supabase/server';

export interface ExcludedInvoice {
  alegraInvoiceId: string;
  invoiceNumber?: string;
  clientName?: string;
  reason?: string;
}

interface ExcludedInvoiceRow {
  alegra_invoice_id: string;
  invoice_number: string | null;
  client_name: string | null;
  reason: string | null;
  active: boolean;
}

export async function getExcludedInvoiceIds(): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('excluded_invoices')
      .select('alegra_invoice_id, invoice_number, client_name, reason, active')
      .eq('active', true);

    if (error) {
      console.error('⚠️ No fue posible cargar facturas excluidas:', error);
      return new Set();
    }

    return new Set(
      ((data ?? []) as ExcludedInvoiceRow[])
        .map((row) => row.alegra_invoice_id?.toString().trim())
        .filter((id): id is string => Boolean(id))
    );
  } catch (error) {
    console.error('⚠️ Error consultando facturas excluidas:', error);
    return new Set();
  }
}
