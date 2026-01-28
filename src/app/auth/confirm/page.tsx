'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { Brain, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function Confirm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Get email from localStorage or query params
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message || 'Failed to sign in')
      } else {
        setSuccess(true)
        setMessage('Successfully signed in! Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    
    try {
      // In development mode, just show success
      setSuccess(true)
      setMessage('Confirmation email resent successfully! (Development mode)')
    } catch (err) {
      setError('Failed to resend confirmation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <Card className="w-full max-w-md glass border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {success ? 'Success!' : 'Complete Your Signup'}
          </CardTitle>
          <p className="text-gray-400">
            {success 
              ? message
              : 'Sign in with your email and password to activate your account'}
          </p>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-green-400 text-sm">Account verified and ready to use!</p>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-muted/50 border-border/50 text-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-muted/50 border-border/50 text-white placeholder-gray-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/20 border border-destructive/50 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Didn't receive verification?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Resending...' : 'Resend Confirmation'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-primary hover:underline text-sm">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
