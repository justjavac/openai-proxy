"use strict";

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

function createUpstreamUrl(request) {
  const headers = request.headers || {};
  const host = headers.host || headers.Host || OPENAI_API_HOST;
  const rawUrl = request.url || request.originalUrl || request.path || "/";
  const url = new URL(rawUrl, `https://${host}`);

  url.protocol = "https:";
  url.hostname = OPENAI_API_HOST;
  url.port = "";

  return url;
}

function createRequestHeaders(headers) {
  const requestHeaders = new Headers(headers || {});
  requestHeaders.delete("host");
  return requestHeaders;
}

function sendUpstreamHeaders(response, upstreamHeaders) {
  upstreamHeaders.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });
}

exports.handler = async function handler(request, response) {
  try {
    const upstreamUrl = createUpstreamUrl(request);

    if (upstreamUrl.pathname === "/") {
      const headers = request.headers || {};
      const host = headers.host || headers.Host || "example.com";
      response.setStatusCode(200);
      response.send(`https://${host}/v1`);
      return;
    }

    const method = (request.method || "GET").toUpperCase();
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: createRequestHeaders(request.headers),
      body: method === "GET" || method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    });

    response.setStatusCode(upstreamResponse.status);
    sendUpstreamHeaders(response, upstreamResponse.headers);
    response.send(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch (error) {
    response.setStatusCode(500);
    response.send(error && error.stack ? error.stack : String(error));
  }
};
