"use client";

import React, { useState, useEffect } from "react";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { live, PGliteWithLive } from "@electric-sql/pglite/live";
import createPgLiteClient, { PgDatabase, PgQueryResultHKT, schema } from "db/client";
import { DebugLevel } from "@electric-sql/pglite";

const dbName = "test";

export interface ExtendedPGlite extends PGliteWithLive {
  _db: PgDatabase<PgQueryResultHKT, typeof schema>;
}

// const ELECTRIC_SQL_BASE_URL =
//   process.env.NEXT_PUBLIC_ELECTRIC_SQL_BASE_URL ||
//   (typeof window !== "undefined"
//     ? new URL("/api/sync/", window.location.origin).toString()
//     : "/api/sync/");

export function PgLiteWorkerProvider({
  children,
  debug,
}: {
  debug?: DebugLevel,
  children: React.ReactNode;
}): React.ReactNode {
  const [pg, setPg] = useState<ExtendedPGlite>();

  const setPglite = async () => {
    const pglite = (await PGliteWorker.create(
      new Worker(new URL("../../workers/pglite.ts", import.meta.url), {
        type: "module",
      }),
      {
        relaxedDurability: true,
        extensions: {
          live,
        },
        debug,
        meta: {
          dbName,
          electricBaseUrl:
            process.env.NEXT_PUBLIC_ELECTRIC_SQL_BASE_URL ||
            (typeof window !== 'undefined' ? new URL('/api/sync', window.location.origin).toString() : ''),
        },
      }
    ));

    const _db = createPgLiteClient(pglite);

    Object.defineProperty(pglite, '_db', {
      value: _db,
      writable: false,
    });

    setPg(pglite as unknown as ExtendedPGlite);
  };

  useEffect(() => {
    if (pg) return;
    setPglite();
  }, [pg]);

  if (!pg?._db) return <div>Loading</div>;
  return <PGliteProvider db={pg as PGliteWithLive}>{children}</PGliteProvider>;
}
