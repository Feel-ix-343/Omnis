import Link from "next/link"
import ClientComponent from "./client-component"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
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
      <div><h1 className="font-heading text-3xl">This my nav!!</h1>


        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/test">Test</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/test/subtest">Subtest</Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>


        <div>Client compoenent: <ClientComponent /></div>

      </div>
      {/* <p>{count}</p> */}
      {/* <button onClick={() => setCount(count + 1)}>Add</button> */}

      {children}
    </section>
  )
}
