import Link from 'next/link'
import type { ReactNode } from 'react'
import { LEGAL_DOCS, LAST_UPDATED, VERSION, SERVICE } from '@/lib/legal-data'

export function LegalShell({
  activeSlug,
  title,
  subtitle,
  children,
}: {
  activeSlug: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden>←</span> На главную
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-lg font-bold">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{SERVICE.name}</p>
              <p className="text-xs text-muted-foreground">Юридические документы</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Юридические документы" className="lg:sticky lg:top-8 lg:self-start">
          <ul className="flex flex-col gap-1">
            {LEGAL_DOCS.map((doc) => {
              const active = doc.slug === activeSlug
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/legal/${doc.slug}`}
                    aria-current={active ? 'page' : undefined}
                    className={
                      active
                        ? 'block rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground'
                        : 'block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground'
                    }
                  >
                    {doc.short}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {doc.title.split('(')[0].trim()}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="min-w-0">
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-balance text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{subtitle}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Редакция {VERSION} · Дата вступления в силу: {LAST_UPDATED}
            </p>
          </div>
          <article className="legal-prose">{children}</article>
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {SERVICE.name}. Документы размещены в открытом доступе в
          соответствии с ч. 2 ст. 18.1 Федерального закона № 152-ФЗ «О персональных данных».
        </div>
      </footer>
    </div>
  )
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-8">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-foreground/90">{children}</div>
    </section>
  )
}
