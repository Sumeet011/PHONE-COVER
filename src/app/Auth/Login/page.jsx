'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react'

const JersyFont = localFont({
  src: '../../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

const LoginPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!email || !password) {
        toast.error('Please fill in all fields')
        setLoading(false)
        return
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/loginemailpass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        // Store user data in USER object format
        const userId = data.userId || data.user?.id || data.id
        localStorage.setItem('USER', JSON.stringify({
          id: userId,
          email: email,
          isLogedIn: true
        }))
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        // Redirect to home
        router.push('/')
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${JersyFont.className} text-[#9AE600] text-5xl md:text-6xl mb-2`}>
              WELCOME BACK
            </h1>
            <p className="text-muted-foreground">Login to your account</p>
          </div>

          {/* Login Method Selector */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email & Password Login */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Auth/SignUp')}
              className="w-full"
            >
              Create Account
            </Button>
          </div>

          {/* Forgot Password */}
          <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => toast.info('Password reset feature coming soon!')}
                className="text-sm text-[#9AE600] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>

  )
}

export default LoginPage
