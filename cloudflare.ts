//copy this to cloudflare workers
export default {
    async fetch(request, env) {
        try {
            const OPENAI_API_HOST = "api.openai.com";
            const oldUrl = new URL(request.url);


            if (oldUrl.pathname === "/") {
                return new Response(`https://${oldUrl.hostname}/v1`, {status: 200});
            }

            const newUrl = new URL(request.url);
            newUrl.hostname = OPENAI_API_HOST;

            const modifiedRequest = new Request(newUrl, {
                method: request.method,
                headers: request.headers,
                body: request.body
            });

            return await fetch(modifiedRequest);
        } catch (e) {
            return new Response(e.stack, {status: 500});
        }
    }
}

