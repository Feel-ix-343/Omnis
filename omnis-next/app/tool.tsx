'use client'

import { Card } from "@/components/ui/card"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useTodos from "@/hooks/useTodos"
import { PlusCircle } from "lucide-react"
import { useMemo, useState } from "react"

export default function Tool() {
  const [executing, setExecuting] = useState(false)

  const {data: todos} = useTodos()

  console.log("tool", todos)

  const doNow = useMemo(() => todos?.filter(t => t.importance == 0 && t.urgency == 0), [todos])


  const [items, setItems] = useState([0, 1, 2, 3])

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


      <div className="grid grid-cols-2 gap-10 h-[75vh]">
        <div className="flex flex-col gap-2 items-center">
          <h4>Do Now</h4>
          <div className="bg-primary-foreground w-full h-full rounded-xl flex flex-col gap-2 p-3">
            {doNow?.map(t => t && 
            <Card className="py-1 px-3">
              <p>{t.title}</p>
            </Card>
            )
            }
            <p className="mt-auto flex flex-row gap-2"><PlusCircle size={23} />Add a comment</p>
          </div>

        </div>
      <div>
        <h4>Do Later</h4>
      </div>
      <div>
        <h4>Avoid</h4>
      </div>
      <div>
        <h4>Do later or delete</h4>
      </div>

      </div>
    </div>
  )
}
