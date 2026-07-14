import { cn } from '@/lib/utils'

export function PulseLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none">
          <path d="M6.5 7.25h11a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3h-5.2l-3.6 2.5v-2.5H6.5a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M6.5 12h2l1.2-2.1 2.1 4.2 1.7-3.1 1.1 1h2.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">pulse</span>
    </div>
  )
}
