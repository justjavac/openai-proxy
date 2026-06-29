export const config = {
  runtime: "edge",
};

const OPENAI_API_HOST = "api.openai.com";
const PROXY_PATH_PARAM = "__proxy_path";

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
  const incomingUrl = new URL(request.url);
  const proxyPath = incomingUrl.searchParams.get(PROXY_PATH_PARAM) ?? "";

  if (proxyPath === "") {
    return new Response(`https://${incomingUrl.hostname}/v1`, { status: 200 });
  }

  incomingUrl.searchParams.delete(PROXY_PATH_PARAM);

  const upstreamUrl = new URL(request.url);
  upstreamUrl.protocol = "https:";
  upstreamUrl.hostname = OPENAI_API_HOST;
  upstreamUrl.port = "";
  upstreamUrl.pathname = `/${proxyPath}`;
  upstreamUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const upstreamResponse = await fetch(upstreamUrl, {
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
