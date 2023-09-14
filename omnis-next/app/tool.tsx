'use client'

import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function Tool() {
  const [executing, setExecuting] = useState(false)

  return(
    <div className="w-8/12 flex flex-col gap-3">
      <div className="flex flex-row gap-4 items-center">
        <Tabs defaultValue={"planning"} className="flex flex-row items-center gap-3">
          <TabsList>
            <TabsTrigger className="font-heading text-sm" value="planning">Planning</TabsTrigger>
            <TabsTrigger className="font-heading text-sm" value="executing">Executing</TabsTrigger>
          </TabsList>
          <NavigationMenu>
            <NavigationMenuList>
              <TabsContent value="planning">
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Eisenhower Matrix</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Opportunity Cost Analysis</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Reflection</NavigationMenuItem>
              </TabsContent>

              <TabsContent value="executing">
                  <NavigationMenuItem className={navigationMenuTriggerStyle()}>Calendar</NavigationMenuItem>
                  <NavigationMenuItem className={navigationMenuTriggerStyle()}>Stop Watch</NavigationMenuItem>
                  <NavigationMenuItem className={navigationMenuTriggerStyle()}>Timer</NavigationMenuItem>
              </TabsContent>
            </NavigationMenuList>
          </NavigationMenu>
          <TabsContent value="planning">

          </TabsContent>


        </Tabs>
      </div>
      <div className="bg-secondary rounded-lg h-[85vh]">
      </div>
    </div>
  )
}
