import { createEffect } from "solid-js"
import { useRouteData } from "solid-start"
import { routeData } from "../planning"

export default function () {
  const {session} = useRouteData<typeof routeData> ()


  return <>
    Hello {session()?.user.user_metadata.full_name}
  </>
}
