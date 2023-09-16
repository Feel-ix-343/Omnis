
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import Tool from './tool'
import { Suspense, cache } from 'react'
import TodosSkeleton from '@/components/todos-skeleton'
import Todos from '@/components/todos'


export const dynamic = 'force-dynamic'

export default async function Index() {

  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser() // figure out to use a better api for this. There should always be a user when this page loads. 

  return (<>
    <div className="w-full flex flex-row px-12 gap-8 mt-10 h-[85vh]">

      <Todos user={user!} />
      <Tool />


    </div>
  </>
  )
}
