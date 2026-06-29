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

function getHeader(headers, name) {
  const lowerName = name.toLowerCase();

  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  return undefined;
}

function getQueryString(event) {
  if (typeof event.queryString === "string") {
    return event.queryString.replace(/^\?/, "");
  }

  if (event.queryStringParameters) {
    return new URLSearchParams(event.queryStringParameters).toString();
  }

  return "";
}

function createUpstreamUrl(event) {
  const path = event.path || event.requestContext?.path || "/";
  const queryString = getQueryString(event);
  const url = new URL(`${path}${queryString ? `?${queryString}` : ""}`, "https://example.com");

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

function createResponseHeaders(upstreamHeaders) {
  const headers = {};

  upstreamHeaders.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  return headers;
}

function getRequestBody(event) {
  if (!event.body) {
    return undefined;
  }

  return event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : event.body;
}

exports.main_handler = async function mainHandler(event) {
  try {
    const upstreamUrl = createUpstreamUrl(event);

    if (upstreamUrl.pathname === "/") {
      const host = getHeader(event.headers, "host") || "example.com";
      return {
        statusCode: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
        body: `https://${host}/v1`,
      };
    }

    const method = (event.httpMethod || event.requestContext?.httpMethod || "GET").toUpperCase();
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: createRequestHeaders(event.headers),
      body: method === "GET" || method === "HEAD" ? undefined : getRequestBody(event),
      redirect: "follow",
    });

    const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());

    return {
      isBase64Encoded: true,
      statusCode: upstreamResponse.status,
      headers: createResponseHeaders(upstreamResponse.headers),
      body: responseBody.toString("base64"),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: error && error.stack ? error.stack : String(error),
    };
  }
};
