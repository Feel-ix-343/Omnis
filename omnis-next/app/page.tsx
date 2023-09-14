
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import Tool from './tool'
import Todos from './todos'
import { Suspense, cache } from 'react'
import TodosSkeleton from '@/components/todos-skeleton'


export const dynamic = 'force-dynamic'

export default async function Index() {

  return (<>
    <div className="w-full flex flex-row px-12 gap-8 mt-10 h-[85vh]">

      <Suspense fallback={<TodosSkeleton />}>
        <Todos />
      </Suspense>
      <Tool />


    </div>
  </>
  )
}
