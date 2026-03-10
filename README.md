This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Integracion con Alegra y Supabase

Pulse carga su configuracion base desde Supabase:

- `settings`: configuracion general como `company_name`
- `metrics`: configuracion y valores base de cada metrica

Si configuras credenciales de Alegra, Pulse reemplaza automaticamente estas metricas:

- `ventas`: total facturado del mes en curso y top 3 clientes del periodo
- `recaudo`: pagos del mes en la cuenta `Bancos` que correspondan a entradas de clientes y ultimas 3 entradas del periodo
- `inventario`: valor total del inventario y top 3 items por valor en stock

### Variables de entorno

Crea tu `.env.local` a partir de `.env.example` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

ALEGRA_AUTH_MODE=basic
ALEGRA_EMAIL=tu-correo@empresa.com
ALEGRA_API_TOKEN=tu-token
ALEGRA_BASE_URL=https://api.alegra.com/api/v1
```

Notas:

- La documentacion de `GET /invoices` y `GET /items` muestra autenticacion `Basic`.
- Si tu cuenta de Alegra usa bearer token, cambia `ALEGRA_AUTH_MODE=bearer`.
- Si no configuras `ALEGRA_API_TOKEN`, la app usa solo los datos almacenados en Supabase.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
