'use client'

import { SWRConfig } from "swr";

export default function WithSWR(props: {children: React.ReactNode, fallback: any}) {
  return <SWRConfig value={{fallback: props.fallback}}>
    {props.children}
  </SWRConfig>
}
