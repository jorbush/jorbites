import './globals.css'
import { Inter } from 'next/font/google'
import { Nunito } from 'next/font/google'
import Navbar from './components/navbar/Navbar'

const inter = Inter({ subsets: ['latin'] })
const font = Nunito({ subsets: ["latin"] })

export const metadata = {
  title: 'Jorbites',
  description: 'a web to create and share receipts',
  icons: {
    icon: '/advocado.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
