import { getUserId } from "@/lib/auth";
import { getTableColumns, getTableName } from "db";
import { schema, PgColumn, PgTableWithColumns } from "db/client";

export const revalidate = 0;
export const maxDuration = 60;

const ALLOWED_SHAPES: Set<string> = new Set(
  Object.values(schema).map((table) => getTableName(table))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTableColumnsNames = (table: PgTableWithColumns<any>) =>
  (Object.values(getTableColumns(table)) as PgColumn[]).map(
    (x: PgColumn) => x.name
  );

const getShapeUrl = (request: Request, shape: string) => {
  if (!ALLOWED_SHAPES.has(shape)) {
    return;
  }

  const url = new URL(request.url);

  const shapeUrl = new URL(
    `${process.env.ELECTRIC_SQL_BASE_URL}/v1/shape/${shape}`
  );

  url.searchParams.forEach((value, key) => {
    if ([`shape_id`, `offset`, "live", "where"].includes(key)) {
      shapeUrl.searchParams.set(key, value);
    }
  });

  if (shape == getTableName(schema.users)) {
    shapeUrl.searchParams.set(
      "columns",
      `${getTableColumnsNames(schema.users).join(",")}`
    );
  }

  return shapeUrl;
};

export async function GET(
  request: Request,
  { params }: { params: { shape: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new Response("Unauthorized", { status: 403 });
    }

    const { shape } = params;
    const shapeUrl = getShapeUrl(request, shape);

    if (!shapeUrl) {
      return new Response(null, { status: 403 });
    }

    console.log(shapeUrl.toString());

    let resp = await fetch(shapeUrl.toString(), {
      cache: "no-store",
      headers: {
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    // Check if the response is 204 No Content
    if (resp.status === 204) {
      return new Response(null, { status: 204 });
    }

    if (resp.headers.get(`content-encoding`)) {
      const headers = new Headers(resp.headers);
      headers.delete(`content-encoding`);
      headers.delete(`content-length`);
      headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      resp = new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers,
      });
    }

    return resp;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? `${error.name} : ${error.message}` : error;
    console.error("Unexpected error:", errorMessage);
    return new Response(`Internal Server Error: ${errorMessage}`, {
      status: 500,
    });
  }
}
