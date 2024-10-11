import { PGliteWorkerOptions, worker } from '@electric-sql/pglite/worker'
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { runMigrations, syncTables } from '@/lib/electric'



worker({
  async init(options: PGliteWorkerOptions) {
    const pg = await PGlite.create({
      dataDir: 'idb://split-stream',
      relaxedDurability: true,
      extensions: {
        sync: electricSync(),
      },
    })
    await runMigrations(pg, options.meta.dbName);
    await syncTables(pg, options.meta.electricBaseUrl);

    await runMigrations(pg, options.meta.dbName);
    
    return pg
  },
})