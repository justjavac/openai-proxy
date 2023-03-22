import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_HOST = "api.openai.com";

serve(async (request) => {
  const url = new URL(request.url);
  url.host = OPENAI_API_HOST;

  request.headers.delete("x-forwarded-for");
  request.headers.delete("x-real-ip");

  return await fetch(url, request);
});
