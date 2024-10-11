"use client"

import { cn } from '@/lib/utils';
import { usePGlite } from '@electric-sql/pglite-react'
import { Repl } from '@electric-sql/pglite-repl'

interface PgReplProps {
  className?: string;
}

export function PgRepl({ className = '' }: PgReplProps) {
  const pg = usePGlite()

  return (
    <div className={cn(`h-full w-full`, className)}>
      <Repl pg={pg} />
    </div>
  )
}