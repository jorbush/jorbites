import './globals.css'
import { Inter } from 'next/font/google'
import { Nunito } from 'next/font/google'
import Navbar from './components/navbar/Navbar'
import ClientOnly from './components/ClientOnly'
import Modal from './components/modals/Modal'

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
        <ClientOnly>
          {/*<Modal title="Hello World" actionLabel='Submit' isOpen/>*/}
          <Navbar />
        </ClientOnly>
        {children}
      </body>
    </html>
  )
}
