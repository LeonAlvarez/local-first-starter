import { getUserId } from "@/app/auth/actions";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: { shape: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new Response("Unauthorized", { status: 403 });
    }

    const url = new URL(request.url);
    const { shape } = params;

    const electricUrl = new URL(`${process.env.ELECTRIC_SQL_BASE_URL}/v1/shape/${shape}`);

    url.searchParams.forEach((value, key) => {
      if ([`shape_id`, `offset`, 'live', 'where'].includes(key)) {
        electricUrl.searchParams.set(key, value)
      }
    });

    let resp = await fetch(electricUrl.toString(), {
      cache: 'no-store',
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!resp.ok) {
      console.error('Error response:', resp.status, resp.statusText);
      return new Response(`Error: ${resp.status} ${resp.statusText}`, { status: resp.status });
    }

    // Check if the response is 204 No Content
    if (resp.status === 204) {
      return new Response(null, { status: 204 });
    }

    if (resp.headers.get(`content-encoding`)) {
      const headers = new Headers(resp.headers)
      headers.delete(`content-encoding`)
      headers.delete(`content-length`);
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      resp = new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers,
      })
    }

    return resp

  } catch (error) {
    const errorMessage = error instanceof Error ? `${error.name} : ${error.message}` : error
    console.error('Unexpected error:', errorMessage);
    return new Response(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}
