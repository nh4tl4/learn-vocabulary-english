import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider'
import ThemeProvider from '@/components/ThemeProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Learn English Vocabulary',
  description: 'Interactive English vocabulary learning app',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VocabLearn'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} transition-colors duration-300 antialiased safe-area-padding`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navigation />
              <main className="flex-1 min-h-mobile-nav">
                <div className="nav-mobile-padding">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
          <Toaster
            position="top-center"
            gutter={8}
            containerClassName="mt-12 sm:mt-16"
            toastOptions={{
              className: '',
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                maxWidth: '90vw',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
