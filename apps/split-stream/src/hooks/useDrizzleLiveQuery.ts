import { ExtendedPGlite } from "@/components/providers/pglite";
import { Results } from "@electric-sql/pglite";
import { usePGlite } from "@electric-sql/pglite-react";
import { AnyPgSelect, DbType } from "db/client";
import { mapResultRow, orderSelectedFields } from "db/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useNewDrizzleLiveQuery = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (AnyPgSelect | Omit<AnyPgSelect, any>),
  E = undefined
>({
  queryFn,
  key,
  data,
  defaultValue = [],
  debug = false,
}: {
  queryFn: (db: DbType, data?: E) => T,
  key: string;
  data?: E;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  debug?: boolean;
}): Awaited<T> => {
  const db = usePGlite() as ExtendedPGlite;
  const [results, setResults] = useState<Awaited<T>>();

  const query = useMemo(
    () => {
      if (!db._db) return null;
      return queryFn(db._db, data)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db._db, ...Object.values(data || {})]
  );

  const fields = useMemo(() => {
    if (!query) return [];
    const selectedFields = (query as AnyPgSelect)._.selectedFields;
    const orderedFields = orderSelectedFields(selectedFields);

    return orderedFields;
  }, [query]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapResults = useCallback((results: any) => {
    try {
      return (results.rows.map((row: unknown) =>
        mapResultRow(
          fields,
          Object.values(row as unknown as object),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (query as any).joinsNotNullableMap
        )
      ) ?? []) as Awaited<ReturnType<typeof queryFn>>;
    } catch (err) {
      console.error("Error in mapResults:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return [] as Awaited<T>;
    }
  }, [fields, query]);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    const cb = (results: Results<T>) => {
      if (cancelled) return;
      setResults(mapResults(results))
    };

    //@ts-expect-error toSQL exist in Omit<PgSelect>
    const { sql, params } = query.toSQL();

    if (debug) {
      console.log(key);
      console.log(data);
      console.log(sql, params);
    }
    const ret = db.live.query<T>(sql, params, cb);

    return () => {
      cancelled = true;
      ret.then(({ unsubscribe }) => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, debug, key, query, mapResults]);

  return results || defaultValue as Awaited<T>;
};
