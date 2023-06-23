import { QueryClient } from "@tanstack/solid-query";
import type { IAppRouter } from "~/server/trpc/router/_app";
import { createTRPCSolid } from "solid-trpc";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const solidtRPC = createTRPCSolid<IAppRouter>();

export const trpc = createTRPCProxyClient<IAppRouter>({
  links: [loggerLink(), httpBatchLink({ url: "/api/trpc" })],
});

export const client = solidtRPC.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export const queryClient = new QueryClient();
