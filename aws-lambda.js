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

function appendQueryParams(searchParams, params) {
  for (const [key, value] of Object.entries(params || {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
}

function createUpstreamUrl(event) {
  const path = event.rawPath || event.path || "/";
  const url = new URL(path, "https://example.com");

  if (typeof event.rawQueryString === "string" && event.rawQueryString !== "") {
    url.search = event.rawQueryString;
  } else if (event.multiValueQueryStringParameters) {
    appendQueryParams(url.searchParams, event.multiValueQueryStringParameters);
  } else {
    appendQueryParams(url.searchParams, event.queryStringParameters);
  }

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

function getRequestMethod(event) {
  return (
    event.requestContext?.http?.method ||
    event.httpMethod ||
    "GET"
  ).toUpperCase();
}

function getRequestBody(event) {
  if (!event.body) {
    return undefined;
  }

  return event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : event.body;
}

exports.handler = async function handler(event) {
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

    const method = getRequestMethod(event);
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
