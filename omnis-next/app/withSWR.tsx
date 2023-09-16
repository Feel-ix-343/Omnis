'use client'

import { SWRConfig } from "swr";

export default function WithSWR(props: {children: React.ReactNode, fallback: any}) {
  console.log(props.fallback)
  return <SWRConfig value={{fallback: props.fallback}}>
    {props.children}
  </SWRConfig>
}
