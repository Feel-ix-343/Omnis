import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import { supabase } from "../supabase";
import type { IContext } from "./context";

export const t = initTRPC.context<IContext>().create();

export const router = t.router;
export const procedure = t.procedure;


const isAuthed = t.middleware(async (opts) => {
  const {ctx} = opts


  return opts.next()

  let cookie = ctx.req.headers.get("cookie")
  if (!cookie) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing cookie"})
  }

  let jwt  = cookie.split("; ").find(s => s.indexOf("my-access-token") !== -1)?.split("=")[1]
  let refresh  = cookie.split("; ").find(s => s.indexOf("my-refresh-token") !== -1)?.split("=")[1]
  console.log("jwt", jwt)
  console.log("refresh", refresh)

  if (!jwt) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing JWT"})
  }

  if (!refresh) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Missing refresh token"})
  }


  const supabase = createClient(process.env.SERVER_SUPABASE_URL!, process.env.SERVER_SUPABASE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  await supabase.auth.setSession({
    access_token: jwt,
    refresh_token: refresh,
  })

  const client = await supabase.auth.getUser(jwt)
  console.log("Client", client)

  if (client.error) {
    throw new TRPCError({code: "UNAUTHORIZED", message: "Auth error: " + client.error})
  }

  return opts.next()
})

export const protectedProcedure = t.procedure.use(isAuthed)
