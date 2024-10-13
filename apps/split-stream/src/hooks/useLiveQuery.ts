"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AnyPgSelect, PgRelationalQuery } from "db/client";
import { mapResultRow, orderSelectedFields } from "db/utils";
import { usePGlite } from "@electric-sql/pglite-react";
import { ExtendedPGlite } from "../components/providers/pglite";
import { Results } from "@electric-sql/pglite";

export function useDrizzleLiveQuery<
  T extends AnyPgSelect | PgRelationalQuery<unknown>
>(query: T): Awaited<T> {
  const [results, setResults] = useState([] as Awaited<T>);
  const [error, setError] = useState<Error | null>(null);
  const pglite = usePGlite() as ExtendedPGlite;

  const queryMemo = useMemo(() => {
    try {
      // @ts-expect-error use private field of drizzle
      const selectedFields = query._.selectedFields;
      const orderedFields = orderSelectedFields(selectedFields);

      return {
        ...query.toSQL(),
        fields: orderedFields,
        key:
          (
            Object.values(orderedFields).filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (x) => (x as any).primary
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            )[0] as any
          )?.name ?? "id",
      };
    } catch (err) {
      console.error("Error in queryMemo:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return { sql: "", params: [], fields: {}, key: "id" };
    }
  }, [query]);

  const { sql, params, fields, key } = queryMemo;


  const mapResults = useCallback((results: Results<Awaited<T>>) => {
    try {
      return (results.rows.map((row) =>
        mapResultRow(
          fields,
          Object.values(row as unknown as object),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (query as any).joinsNotNullableMap
        )
      ) ?? []) as Awaited<T>;
    } catch (err) {
      console.error("Error in mapResults:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [] as Awaited<T>;
    }
  }, [fields, query]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function createLiveQuery() {
      try {
        const liveQuery = await pglite.live.incrementalQuery<Awaited<T>>(
          sql,
          params,
          key,
          (results) => setResults(mapResults(results))
        );

        unsubscribe = liveQuery.unsubscribe;

        setResults(mapResults(liveQuery.initialResults));
      } catch (err) {
        console.error("Error in createLiveQuery:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    createLiveQuery();

    return () => {
      if (unsubscribe != null) {
        unsubscribe();
      }
    };
  }, [pglite, sql, params, key, mapResults]);

  if (error) {
    console.error("useDrizzleLiveQuery error:", error);
    throw error; // or handle it in a way that fits your error handling strategy
  }

  return results;
}
