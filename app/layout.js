import './globals.css'
import { Inter } from 'next/font/google'
import ChatWidget from '../components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'LocalCollab - Connect Local Businesses with Micro Influencers',
    description: 'Affordable, Transparent, AI-Powered influencer marketing platform',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                
                {children}

                {/* 👇 GLOBAL CHATBOT */}
                <ChatWidget />

            </body>
        </html>
    )
}