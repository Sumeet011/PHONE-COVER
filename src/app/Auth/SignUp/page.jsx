'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { Eye, EyeOff, Mail, Phone, User, Lock } from 'lucide-react'

const JersyFont = localFont({
  src: '../../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const SignUpPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter your full name')
      return false
    }

    if (!email && !phone) {
      toast.error('Please provide either email or phone number')
      return false
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    if (phone && !/^[\d\s+()-]{10,}$/.test(phone)) {
      toast.error('Please enter a valid phone number')
      return false
    }

    if (!password) {
      toast.error('Please enter a password')
      return false
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signupemailpass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully!')
        // Store user data
        localStorage.setItem('USER', JSON.stringify({
          id: data.userId,
          email: email,
          isLogedIn: true
        }))
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        // Redirect to home
        router.push('/')
      } else {
        toast.error(data.message || 'Sign up failed')
      }
    } catch (error) {
      console.error('Sign up error:', error)
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
              JOIN US
            </h1>
            <p className="text-muted-foreground">Create your account</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email {!phone && <span className="text-destructive">*</span>}
                  <span className="text-xs text-muted-foreground ml-2">
                    (Email or Phone required)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Providing both email and phone is recommended for better account security
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold mt-6"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Auth/Login')}
              className="w-full"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
