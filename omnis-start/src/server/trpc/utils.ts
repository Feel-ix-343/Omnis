import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import { createClient, User } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import { Database } from "~/utils/database/database.types";
import type { IContext } from "./context";

export const t = initTRPC.context<IContext>().create();

export const router = t.router;
export const procedure = t.procedure;


const isAuthed = t.middleware(async (opts) => {
  const {ctx} = opts

  if (ctx.user.aud !== "authenticated") {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Auth error"})
  }

  return opts.next()
})

export const protectedProcedure = t.procedure.use(isAuthed)
