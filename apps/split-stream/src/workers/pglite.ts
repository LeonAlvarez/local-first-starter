import { PGliteWorkerOptions, worker } from '@electric-sql/pglite/worker'
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { dropFks, runMigrations, syncTables, waterFallingSync } from '@/lib/electric'

worker({
  async init(options: PGliteWorkerOptions) {
    const pg = await PGlite.create({
      dataDir: 'idb://split-stream',
      //dataDir: 'memory://myDBName',
      relaxedDurability: true,
      extensions: {
        electric: electricSync({ debug: options?.debug !== undefined }),
      },
    })
    await runMigrations(pg, options.meta.dbName);
    await dropFks(pg)
    //await syncTables(pg, options.meta.electricBaseUrl);
    await waterFallingSync(pg, options.meta.electricBaseUrl, options.meta.userId);

    return pg
  },
})
