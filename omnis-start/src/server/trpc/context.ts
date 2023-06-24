import { User } from "@supabase/supabase-js";
import { inferAsyncReturnType, TRPCError } from "@trpc/server";
import type { createSolidAPIHandlerContext } from "solid-start-trpc";
import fetch from "node-fetch"

export const createContextInner = async (
  opts: createSolidAPIHandlerContext
) => {

  const {req} = opts

  let cookie = req.headers.get("cookie")
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

  return {
    ...opts,
    user
  };
};

export const createContext = async (opts: createSolidAPIHandlerContext) => {
  return await createContextInner(opts);
};

export type IContext = inferAsyncReturnType<typeof createContext>;
