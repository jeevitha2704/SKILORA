'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, X, Brain, TrendingUp, User, Target, BookOpen, Target as TargetIcon, Award, Palette } from 'lucide-react'
import { Fragment } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: Brain },
    { name: 'JD Analyzer', href: '/analyzer', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Skill Gap', href: '/skill-gap', icon: Target },
    { name: 'Roadmap', href: '/roadmap', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: TargetIcon },
    { name: 'Progress', href: '/progress', icon: Award },
  ]

  return (
    <Fragment>
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="SKILORA Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold skilora-text">
                SKILORA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 glass">
          <div className="flex flex-col space-y-4 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Menu */}
      {user && (
        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
                  <AvatarFallback className="bg-white text-gray-900 text-lg">
                    {(user?.full_name || 'User')?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1 p-2">
                  <div className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.email || 'No email'}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Auth Buttons */}
      {!user && (
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      )}
    </Fragment>
  )
}
