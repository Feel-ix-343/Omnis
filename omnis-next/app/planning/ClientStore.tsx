'use client'

import {create} from 'zustand'
import type {Data}  from './page'

export const useStore = create<{data: Data | null}>((set) => ({
  data: null,
}))

export default function (props: {data: Data}) {

  useStore.setState({data: props.data})
  
  return <></>
}
