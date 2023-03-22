import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_HOST = "api.openai.com";

serve(async (request) => {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return new Response(await Deno.readTextFile("./Readme.md"), {
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
    });
  }

  url.host = OPENAI_API_HOST;
  return await fetch(url, request);
});
