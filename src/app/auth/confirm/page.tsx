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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Get email from localStorage or query params
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const handleResend = async () => {
    setLoading(true)
    setError('')
    
    // This would typically call a function to resend the confirmation email
    // For now, we'll just show a success message
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1000)
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
          <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
          <p className="text-gray-400">
            We've sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-green-400">Confirmation email resent successfully!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-gray-400 mt-2 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Return to sign in</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Resending...' : 'Resend Confirmation'}
                </Button>
              </div>

              {error && (
                <div className="bg-destructive/20 border border-destructive/50 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
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
