# OpenAI/ChatGPT 免翻墙代理

据很多网友反应，**OpenAI 检测到中国的 API
访问时，会直接封号**。所以我在国外的服务器上搭建了一个代理，用于访问
OpenAI/ChatGPT 的 API。

## 使用

使用 OpenAI/ChatGPT 官方 npm 包：

```diff
import { Configuration } from "openai";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
+ basePath: "https://closeai.deno.dev/v1",
});
```

## 相关仓库

- [ChatGPT 从入门到精通](https://github.com/justjavac/chatgpt)
