const OPENAI_API_HOST = "api.openai.com";

Deno.serve(async (request) => {
  const url = new URL(request.url);
  url.host = OPENAI_API_HOST;

  const newRequest = new Request(url.toString(), {
    headers: request.headers,
    method: request.method,
    body: request.body,
    redirect: "follow",
  });
  return await fetch(newRequest);
});
