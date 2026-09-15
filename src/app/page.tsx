import { env } from '@/config/env';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section aria-labelledby="page-title" className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Foundation ready
        </p>
        <h1
          id="page-title"
          className="text-5xl font-bold tracking-tight sm:text-6xl"
        >
          {env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          A roster-aware fantasy football trade analyzer. The analytical engine
          is the next stage of development.
        </p>
      </section>
    </main>
  );
}
