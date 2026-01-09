'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BadgePendencias } from './badge-pendencias'
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Page title area - can be dynamic based on route */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Sistema de Gestão
          </h1>
          <p className="text-sm text-slate-500">Programa Acelera AI</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/inbox">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <BadgePendencias />
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-violet-100 text-violet-600">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">
                  Admin
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
