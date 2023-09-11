import Link from "next/link"
import ClientComponent from "./client-component"
// import { useState } from "react";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {

  // const [count, setCount] = useState(0);

  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <div>This my nav!!
        <Link href="/test">Test</Link>
        <Link href="/test/subtest">Subtest</Link>
        <div>Client compoenent: <ClientComponent /></div>
      </div>
      {/* <p>{count}</p> */}
      {/* <button onClick={() => setCount(count + 1)}>Add</button> */}
 
      {children}
    </section>
  )
}
