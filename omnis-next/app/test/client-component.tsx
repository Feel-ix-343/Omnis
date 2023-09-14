'use client'
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function() {
  const [count, setCount] = useState(0);

  return <>
    Count: {count}
    <Button onClick={() => setCount(count + 1)}>Add</Button>
  </>
}
