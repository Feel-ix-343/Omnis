'use client'
import { useState } from "react";

export default function() {
  const [count, setCount] = useState(0);

  return <>
    Count: {count}
    <button onClick={() => setCount(count + 1)}>Add</button>
  </>
}
