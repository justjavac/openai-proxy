Deno.serve(() => {
  return fetch(new URL("./Readme.md", import.meta.url));
});
