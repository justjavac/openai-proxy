const OPENAI_API_HOST = "api.openai.com";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return new Response(`https://${url.hostname}/v1`, { status: 200 });
  }

  url.protocol = "https:";
  url.hostname = OPENAI_API_HOST;
  url.port = "";

  const headers = new Headers(request.headers);
  headers.delete("host");

  const upstreamResponse = await fetch(url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
