'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, User } from 'lucide-react'
import { Fragment } from 'react'

export default function UserInfo() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <Fragment>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full glass hover-lift transition-all duration-300 border-white/20"
        aria-label="User menu"
      >
        <User className="h-5 w-5 text-primary" />
      </button>

      {/* User Info Card */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-80">
          <Card className="glass border-white/10 animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {(user?.full_name || 'User')?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium">{user?.full_name || 'User'}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desktop User Info */}
      <div className="hidden md:flex fixed bottom-4 right-4 z-40 items-end">
        <div className="glass border-white/10 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {(user?.full_name || 'User')?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.full_name || 'User'}</p>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user?.email || 'No email'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
