//copy this to cloudflare workers
export default {
    async fetch(request) {
        try {
            const OPENAI_API_HOST = "api.openai.com";
            const proxy = new URL(request.url);

            if (proxy.hostname === "/") {
                return new Response(`https://${proxy.hostname}/v1`, {status: 200});
            }

            proxy.hostname = OPENAI_API_HOST;

            const modifiedRequest = new Request(proxy, {
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
