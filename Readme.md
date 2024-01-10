# OpenAI/ChatGPT 免翻墙代理

据很多网友反应，**OpenAI 检测到中国的 API
访问时，会直接封号**。所以我在国外的服务器上搭建了一个代理，用于访问
OpenAI/ChatGPT 的 API。

---

**⚠️⚠️⚠️⚠️⚠️⚠️\
由于 https://closeai.deno.dev 访问量巨大，已经超过了 Deno Deploy
的额度，本代理暂时关闭，请大家参照教程自行部署。\
⚠️⚠️⚠️⚠️⚠️⚠️**

## 自己部署

### Deno

点击[这个链接][1]，可以快速一键部署到 Deno Deploy 上。

然后在 Settings 选项卡里可以设置自定义二级域名，或者绑定自己的域名。

或者，访问 https://deno.new 域名，把 deno.ts 复制到 Playground 中，点击 Play
按钮。

### CloudFlare

将 cloudflare.ts 复制到 CloudFlare Workers 中。

## 使用

使用 OpenAI/ChatGPT 官方 npm 包：

```diff
import { Configuration } from "openai";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
+ basePath: "https://xxxxx.deno.dev/v1",
});
```

使用 OpenAI/ChatGPT 官方 Python 包：

```diff
  import openai

  openai.api_key = os.getenv("OPENAI_API_KEY")
+ openai.api_base = "https://xxxxx.deno.dev/v1"
```

## 相关仓库

- [ChatGPT 从入门到精通](https://github.com/justjavac/chatgpt)

## 本地开发

```bash
deno run --allow-net --allow-read --allow-env --watch deno.ts
```

[1]: https://dash.deno.com/new?url=https://raw.githubusercontent.com/justjavac/openai-proxy/main/deno.ts
