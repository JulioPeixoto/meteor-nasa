'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('auth')

  const publicRoutes = [
    '/login', '/en/login', '/pt/login',
    '/presentation', '/en/presentation', '/pt/presentation', '/es/presentation', '/fr/presentation', '/zh/presentation'
  ]
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  useEffect(() => {
    if (status === 'loading') return 

    if (!session && !isPublicRoute) {
      console.log('🔒', t('unauthorized'))
      router.push('/login')
      return
    }

    if (session && isPublicRoute) {
      console.log('✅', t('redirecting'))
      router.push('/')
      return
    }
  }, [session, status, isPublicRoute, router, t])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!session && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
