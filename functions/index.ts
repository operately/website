interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const url = new URL(context.request.url);
  url.pathname = "/home/";

  return context.env.ASSETS.fetch(new Request(url, context.request));
};
