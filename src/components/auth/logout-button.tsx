'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/temp-button'

export function LogoutButton() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-white text-sm">
        Olá, {session.user?.name || session.user?.email}
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        Logout
      </Button>
    </div>
  )
}
