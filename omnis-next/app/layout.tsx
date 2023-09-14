import { Metadata } from 'next'
import './globals.css'

import 'cal-sans'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import WithAuth from './withAuth'
import { Toast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'

const fontSans = Montserrat({
  subsets: ['latin'],
  display: "swap",
  variable: "--font-sans"
})

const fontHeading = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: 'Omnis',
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {



  return (
    <html lang="en">
      <body>
        <main className={"min-h-screen bg-background flex flex-col items-center " + fontHeading.variable + " " + fontSans.variable}>
          <Toaster />
          <WithAuth>
            {children}
          </WithAuth>
        </main>
      </body>
    </html>
  )
}
