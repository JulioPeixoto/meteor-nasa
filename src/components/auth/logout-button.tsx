'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/temp-button'
import { ExitIcon } from '@/components/custom/icons'

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
          variant="ghost"
          className="hover:bg-white/20"
      >
        <ExitIcon size={20} />
      </Button>
    </div>
  )
}
