import './globals.css'
import { Inter } from 'next/font/google'
import { Nunito } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const font = Nunito({ subsets: ["latin"] })

export const metadata = {
  title: 'Jorbites',
  description: 'a web to create and share receipts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  )
}
