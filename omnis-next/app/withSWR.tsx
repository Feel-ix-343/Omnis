'use client'

import { SWRConfig } from "swr";

export default function WithSWR(props: {children: React.ReactNode, fallback: any}) {
  console.log(props.fallback)
  return <SWRConfig >
    {props.children}
  </SWRConfig>
}
