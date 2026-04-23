This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Setup (Prisma + PostgreSQL)

1. Create local env file:

```bash
cp .env.example .env.local
```

2. Set your Aliyun PostgreSQL connection string in `.env.local`:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@YOUR_ALIYUN_HOST:5432/DATABASE_NAME?schema=public&sslmode=disable"
```

3. Generate Prisma Client:

```bash
bunx prisma generate
```

4. Sync schema from an existing database (keep all current data):

```bash
cp .env.local .env
bunx prisma db pull
```

5. Generate Prisma Client:

```bash
bunx prisma generate
```

6. Verify connection after starting dev server:

```bash
curl http://localhost:3000/api/health/db
```

## Authentication Setup (OAuth)

1. Add auth env vars in `.env`（至少配置 GitHub 或 Google 其一）：

```bash
AUTH_SECRET="replace-with-a-random-long-secret"
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

- GitHub：`http://localhost:3000/api/auth/callback/github`
- Google：`http://localhost:3000/api/auth/callback/google`

2. Push auth tables to the current database (without resetting existing data):

```bash
bunx prisma db push
```

3. Open `/login` and sign in with GitHub or Google.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
