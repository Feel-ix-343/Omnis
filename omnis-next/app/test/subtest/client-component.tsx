'use client'
import { useState } from "react";
import { revalidate } from "./revalidate";

export default function({children}: {children: React.ReactNode}) {
  const [count, setCount] = useState(0);

  return <>
    Another count: {count}
    <button onClick={() => setCount(count + 1)}>Add</button>
    <button onClick={async () => {
      console.log('reval')
      await revalidate()
    }}>Reval</button>
    Children: {children}
  </>
}
