import type { CustomerDiscountRule } from './customer-discounts';

type AlegraAuthMode = 'basic' | 'bearer';

interface AlegraInvoice {
  id?: string | number;
  date?: string;
  total?: number | string;
  tax?: number | string;
  subtotal?: number | string;
  client?: {
    id?: string | number;
    identification?: string;
    name?: string;
  };
}

interface AlegraItem {
  id?: string | number;
  name?: string;
  inventory?: {
    availableQuantity?: number | string;
    averageCost?: number | string;
    unitCost?: number | string;
  };
}

interface AlegraBankAccount {
  id?: string | number;
  name?: string;
  type?: string;
  status?: string;
}

interface AlegraPaymentCategory {
  name?: string;
  behavior?: string;
  total?: number | string;
}

interface AlegraPayment {
  id?: string | number;
  date?: string;
  amount?: number | string;
  type?: string;
  bankAccount?: {
    id?: string | number;
    name?: string;
    type?: string;
  };
  client?: {
    id?: string | number;
    identification?: string;
    name?: string;
  };
  categories?: AlegraPaymentCategory[];
}

interface SalesBreakdownItem {
  name: string;
  value: number;
}

interface InventoryBreakdownItem {
  name: string;
  value: number;
}

interface RecaudoBreakdownItem {
  name: string;
  value: number;
  date: string;
}

export interface AlegraMetricsSnapshot {
  lastUpdated: string;
  ventas: {
    value: number;
    breakdown: SalesBreakdownItem[];
  };
  recaudo: {
    value: number;
    breakdown: RecaudoBreakdownItem[];
  };
  inventario: {
    value: number;
    breakdown: InventoryBreakdownItem[];
  };
}

interface AlegraConfig {
  authMode: AlegraAuthMode;
  email?: string;
  token: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = 'https://api.alegra.com/api/v1';
const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGES = 10;
const PAYMENTS_MAX_PAGES = 20;
const ALEGRA_TIMEZONE = 'America/Bogota';
const RECAUDO_BEHAVIORS = new Set([
  'ADVANCE_IN',
  'RECEIVABLE_ACCOUNTS',
  'SALES',
]);

interface CustomerDiscountLookup {
  byAlegraContactId: Map<string, number>;
  byIdentification: Map<string, number>;
}

function parseNumber(value: number | string | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}

function getNetSalesAmount(invoice: AlegraInvoice): number {
  const total = parseNumber(invoice.total);
  const tax = parseNumber(invoice.tax);
  const subtotal = parseNumber(invoice.subtotal);

  const totalWithoutTax = total - tax;

  if (totalWithoutTax > 0) {
    return totalWithoutTax;
  }

  if (subtotal > 0) {
    return subtotal;
  }

  return total;
}

function buildCustomerDiscountLookup(
  rules: CustomerDiscountRule[]
): CustomerDiscountLookup {
  const byAlegraContactId = new Map<string, number>();
  const byIdentification = new Map<string, number>();

  for (const rule of rules) {
    if (!rule.active) {
      continue;
    }

    const normalizedDiscount = Math.min(
      100,
      Math.max(0, Number(rule.discountPercent) || 0)
    );

    byAlegraContactId.set(rule.alegraContactId, normalizedDiscount);

    if (rule.clientIdentification) {
      byIdentification.set(rule.clientIdentification, normalizedDiscount);
    }
  }

  return { byAlegraContactId, byIdentification };
}

function getCustomerDiscountPercent(
  invoice: AlegraInvoice,
  lookup: CustomerDiscountLookup
): number {
  const contactId = invoice.client?.id?.toString();

  if (contactId && lookup.byAlegraContactId.has(contactId)) {
    return lookup.byAlegraContactId.get(contactId) ?? 0;
  }

  const identification = invoice.client?.identification?.trim();

  if (identification && lookup.byIdentification.has(identification)) {
    return lookup.byIdentification.get(identification) ?? 0;
  }

  return 0;
}

function applyDiscount(amount: number, discountPercent: number): number {
  if (discountPercent <= 0) {
    return amount;
  }

  return Math.round(amount * (1 - discountPercent / 100));
}

function getAdjustedNetSalesAmount(
  invoice: AlegraInvoice,
  lookup: CustomerDiscountLookup
): number {
  const netSalesAmount = getNetSalesAmount(invoice);
  const discountPercent = getCustomerDiscountPercent(invoice, lookup);

  return applyDiscount(netSalesAmount, discountPercent);
}

function getDatePartsInBogota(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ALEGRA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return { year, month, day };
}

function getMonthToDateRange() {
  const { year, month, day } = getDatePartsInBogota();

  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${day}`,
  };
}

function isDateWithinRange(
  date: string | undefined,
  startDate: string,
  endDate: string
): boolean {
  if (!date) {
    return false;
  }

  return date >= startDate && date <= endDate;
}

function getAlegraConfig(): AlegraConfig | null {
  const token = process.env.ALEGRA_API_TOKEN?.trim();

  if (!token) {
    return null;
  }

  const authMode = (process.env.ALEGRA_AUTH_MODE?.trim().toLowerCase() ??
    'basic') as AlegraAuthMode;

  if (authMode !== 'basic' && authMode !== 'bearer') {
    throw new Error('ALEGRA_AUTH_MODE debe ser "basic" o "bearer".');
  }

  const email = process.env.ALEGRA_EMAIL?.trim();

  if (authMode === 'basic' && !email) {
    throw new Error(
      'ALEGRA_EMAIL es obligatorio cuando ALEGRA_AUTH_MODE="basic".'
    );
  }

  return {
    authMode,
    email,
    token,
    baseUrl: process.env.ALEGRA_BASE_URL?.trim() || DEFAULT_BASE_URL,
  };
}

function buildAuthorizationHeader(config: AlegraConfig): string {
  if (config.authMode === 'bearer') {
    return `Bearer ${config.token}`;
  }

  return `Basic ${Buffer.from(`${config.email}:${config.token}`).toString('base64')}`;
}

function normalizeCollectionResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const maybeData = (payload as { data?: unknown }).data;

    if (Array.isArray(maybeData)) {
      return maybeData as T[];
    }
  }

  return [];
}

async function fetchAlegraPage<T>(
  config: AlegraConfig,
  resourcePath: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const searchParams = new URLSearchParams(params);

  const response = await fetch(
    `${config.baseUrl}${resourcePath}?${searchParams.toString()}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: buildAuthorizationHeader(config),
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Alegra respondió ${response.status} al consultar ${resourcePath}: ${message}`
    );
  }

  const payload = (await response.json()) as unknown;
  return normalizeCollectionResponse<T>(payload);
}

async function fetchAlegraCollection<T>(
  config: AlegraConfig,
  resourcePath: string,
  extraParams: Record<string, string> = {},
  maxPages = MAX_PAGES
): Promise<T[]> {
  const allItems: T[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const pageItems = await fetchAlegraPage<T>(config, resourcePath, {
      start: String(page * DEFAULT_PAGE_SIZE),
      limit: String(DEFAULT_PAGE_SIZE),
      ...extraParams,
    });

    allItems.push(...pageItems);

    if (pageItems.length < DEFAULT_PAGE_SIZE) {
      break;
    }
  }

  return allItems;
}

async function fetchMonthlyInvoices(
  config: AlegraConfig,
  startDate: string,
  endDate: string
): Promise<AlegraInvoice[]> {
  const monthlyInvoices: AlegraInvoice[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const currentPage = await fetchAlegraPage<AlegraInvoice>(config, '/invoices', {
      limit: String(DEFAULT_PAGE_SIZE),
      start: String(page * DEFAULT_PAGE_SIZE),
    });

    if (currentPage.length === 0) {
      break;
    }

    monthlyInvoices.push(
      ...currentPage.filter((invoice) =>
        isDateWithinRange(invoice.date, startDate, endDate)
      )
    );

    const oldestInvoiceDateOnPage = currentPage.reduce<string | null>(
      (oldestDate, invoice) => {
        if (!invoice.date) {
          return oldestDate;
        }

        if (!oldestDate || invoice.date < oldestDate) {
          return invoice.date;
        }

        return oldestDate;
      },
      null
    );

    if (currentPage.length < DEFAULT_PAGE_SIZE) {
      break;
    }

    if (oldestInvoiceDateOnPage && oldestInvoiceDateOnPage < startDate) {
      break;
    }
  }

  return monthlyInvoices;
}

function normalizeText(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function getRecaudoBankAccountIds(accounts: AlegraBankAccount[]): Set<string> {
  const activeAccounts = accounts.filter(
    (account) => normalizeText(account.status) !== 'inactive'
  );

  const exactMatchIds = activeAccounts
    .filter((account) => normalizeText(account.name) === 'bancos')
    .map((account) => account.id?.toString())
    .filter((id): id is string => Boolean(id));

  if (exactMatchIds.length > 0) {
    return new Set(exactMatchIds);
  }

  return new Set(
    activeAccounts
      .filter((account) => normalizeText(account.type) === 'bank')
      .map((account) => account.id?.toString())
      .filter((id): id is string => Boolean(id))
  );
}

function isCustomerRecaudoPayment(
  payment: AlegraPayment,
  bankAccountIds: Set<string>,
  startDate: string,
  endDate: string
): boolean {
  if (normalizeText(payment.type) !== 'in') {
    return false;
  }

  if (!isDateWithinRange(payment.date, startDate, endDate)) {
    return false;
  }

  const bankAccountId = payment.bankAccount?.id?.toString();

  if (!bankAccountId || !bankAccountIds.has(bankAccountId)) {
    return false;
  }

  if (!payment.client?.name?.trim()) {
    return false;
  }

  return (payment.categories ?? []).some((category) =>
    RECAUDO_BEHAVIORS.has(category.behavior?.trim().toUpperCase() ?? '')
  );
}

function buildRecaudoBreakdown(payments: AlegraPayment[]): RecaudoBreakdownItem[] {
  return payments
    .filter((payment) => Boolean(payment.date))
    .map((payment) => ({
      name: payment.client?.name?.trim() || 'Cliente sin nombre',
      value: parseNumber(payment.amount),
      date: payment.date as string,
    }))
    .sort((a, b) => {
      if (a.date === b.date) {
        return b.value - a.value;
      }

      return b.date.localeCompare(a.date);
    })
    .slice(0, 3);
}

function buildSalesBreakdown(
  invoices: AlegraInvoice[],
  discountLookup: CustomerDiscountLookup
): SalesBreakdownItem[] {
  const totalsByClient = new Map<string, number>();

  for (const invoice of invoices) {
    const clientName = invoice.client?.name?.trim() || 'Cliente sin nombre';
    const currentTotal = totalsByClient.get(clientName) ?? 0;
    totalsByClient.set(
      clientName,
      currentTotal + getAdjustedNetSalesAmount(invoice, discountLookup)
    );
  }

  return Array.from(totalsByClient.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

function getItemInventoryCost(item: AlegraItem): number {
  const averageCost = parseNumber(item.inventory?.averageCost);

  if (averageCost > 0) {
    return averageCost;
  }

  return parseNumber(item.inventory?.unitCost);
}

function buildInventoryBreakdown(items: AlegraItem[]): InventoryBreakdownItem[] {
  return items
    .map((item) => {
      const availableQuantity = parseNumber(item.inventory?.availableQuantity);

      return {
        name: item.name?.trim() || 'Ítem sin nombre',
        value: availableQuantity * getItemInventoryCost(item),
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

export function hasAlegraCredentials(): boolean {
  return Boolean(process.env.ALEGRA_API_TOKEN?.trim());
}

export async function getAlegraMetricsSnapshot(
  customerDiscountRules: CustomerDiscountRule[] = []
): Promise<AlegraMetricsSnapshot | null> {
  const config = getAlegraConfig();

  if (!config) {
    return null;
  }

  const discountLookup = buildCustomerDiscountLookup(customerDiscountRules);

  const { startDate, endDate } = getMonthToDateRange();

  const [invoices, items, bankAccounts, payments] = await Promise.all([
    fetchMonthlyInvoices(config, startDate, endDate),
    fetchAlegraCollection<AlegraItem>(config, '/items', {
      fields: 'averageCost',
    }),
    fetchAlegraCollection<AlegraBankAccount>(config, '/bank-accounts'),
    fetchAlegraCollection<AlegraPayment>(
      config,
      '/payments',
      {},
      PAYMENTS_MAX_PAGES
    ),
  ]);

  const recaudoBankAccountIds = getRecaudoBankAccountIds(bankAccounts);
  const recaudoPayments = payments.filter((payment) =>
    isCustomerRecaudoPayment(payment, recaudoBankAccountIds, startDate, endDate)
  );

  const ventasValue = invoices.reduce(
    (sum, invoice) => sum + getAdjustedNetSalesAmount(invoice, discountLookup),
    0
  );

  const recaudoValue = recaudoPayments.reduce(
    (sum, payment) => sum + parseNumber(payment.amount),
    0
  );

  const inventarioValue = items.reduce((sum, item) => {
    const availableQuantity = parseNumber(item.inventory?.availableQuantity);
    return sum + availableQuantity * getItemInventoryCost(item);
  }, 0);

  return {
    lastUpdated: new Date().toISOString(),
    ventas: {
      value: ventasValue,
      breakdown: buildSalesBreakdown(invoices, discountLookup),
    },
    recaudo: {
      value: recaudoValue,
      breakdown: buildRecaudoBreakdown(recaudoPayments),
    },
    inventario: {
      value: inventarioValue,
      breakdown: buildInventoryBreakdown(items),
    },
  };
}
