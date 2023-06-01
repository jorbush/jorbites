import './globals.css'
import { Inter } from 'next/font/google'
import { Nunito } from 'next/font/google'
import Navbar from './components/navbar/Navbar'
import ClientOnly from './components/ClientOnly'
import RegisterModal from './components/modals/RegisterModal'
import ToasterProvider from './providers/ToasterProvider'
import LoginModal from './components/modals/LoginModal'
import getCurrentUser from './actions/getCurrentUser'

const inter = Inter({ subsets: ['latin'] })
const font = Nunito({ subsets: ["latin"] })

export const metadata = {
  title: 'Jorbites',
  description: 'a web to create and share receipts',
  icons: {
    icon: '/advocado.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  return (
    <html lang="en">
      <body className={font.className}>
        <ClientOnly>
          <ToasterProvider/>
          <LoginModal/>
          <RegisterModal />
          <Navbar currentUser={currentUser}/>
        </ClientOnly>
        {children}
      </body>
    </html>
  )
}
