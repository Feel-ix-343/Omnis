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

  let cookie = ctx.req.headers.get("cookie")
  if (!cookie) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing cookie"})
  }

  let jwt  = cookie.split("; ").find(s => s.indexOf("my-access-token") !== -1)?.split("=")[1]
  let refresh  = cookie.split("; ").find(s => s.indexOf("my-refresh-token") !== -1)?.split("=")[1]
  //console.log("jwt", jwt)
  //console.log("refresh", refresh)

  if (!jwt) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing JWT"})
  }

  if (!refresh) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing refresh token"})
  }


  const supabaseURL = process.env.SERVER_SUPABASE_URL!
  const supabaseKey = process.env.SERVER_SUPABASE_KEY!

  // test fetch
  // headers: 
  // apiKey: SUPABSE_KEY
  // Authorization: Bearer JWT
  // remove connection header
  const res = await fetch(supabaseURL + "/auth/v1/user", {
    headers: {
      "apiKey": supabaseKey,
      "Authorization": "Bearer " + jwt,
    }
  })

  const user: User = await res.json() as User
  console.log(user)

  if (user.aud !== "authenticated") {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Auth error"})
  }

  return opts.next()
})

export const protectedProcedure = t.procedure.use(isAuthed)
