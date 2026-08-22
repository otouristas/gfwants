import { createFileRoute } from "@tanstack/react-router";
import { resolveOutbound } from "@/lib/fund-api";

export const Route = createFileRoute("/go/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const id = Number(params.id);
        const url =
          Number.isFinite(id) && id > 0
            ? await resolveOutbound(id)
            : null;
        if (!url) {
          return Response.redirect(new URL("/", request.url), 302);
        }
        return Response.redirect(url, 302);
      },
    },
  },
});
