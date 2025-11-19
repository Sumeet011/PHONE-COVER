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
  const [loginMethod, setLoginMethod] = useState('email-password')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOTP = async () => {
    if (loginMethod === 'email-otp' && !email) {
      toast.error('Please enter your email')
      return
    }
    if (loginMethod === 'phone-otp' && !phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      if (loginMethod === 'phone-otp') {
        // Format phone number
        let cleanPhone = phone.replace(/\s+/g, '')
        if (!cleanPhone.startsWith('+')) {
          cleanPhone = '+' + cleanPhone
        }
        
        const response = await fetch(`${BACKEND_URL}/api/auth/send-phone-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: cleanPhone })
        })

        const data = await response.json()
        
        if (response.ok) {
          setOtpSent(true)
          toast.success('OTP sent successfully to your phone!')
        } else {
          toast.error(data.message || 'Failed to send OTP')
        }
      } else if (loginMethod === 'email-otp') {
        // Email OTP (using your backend)
        const response = await fetch(`${BACKEND_URL}/api/auth/send-email-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const data = await response.json()

        if (response.ok) {
          setOtpSent(true)
          toast.success('OTP sent successfully to your email!')
        } else {
          toast.error(data.message || 'Failed to send OTP')
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('Error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    await handleSendOTP()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let endpoint = ''
      let body = {}

      if (loginMethod === 'email-password') {
        if (!email || !password) {
          toast.error('Please fill in all fields')
          setLoading(false)
          return
        }
        endpoint = `${BACKEND_URL}/api/auth/loginemailpass`
        body = { email, password }
      } else if (loginMethod === 'email-otp') {
        if (!email || !otp) {
          toast.error('Please enter email and OTP')
          setLoading(false)
          return
        }
        endpoint = `${BACKEND_URL}/api/auth/verify-email-otp`
        body = { email, otp }
      } else if (loginMethod === 'phone-otp') {
        if (!phone || !otp) {
          toast.error('Please enter phone number and OTP')
          setLoading(false)
          return
        }
        
        // Format phone number
        let cleanPhone = phone.replace(/\s+/g, '')
        if (!cleanPhone.startsWith('+')) {
          cleanPhone = '+' + cleanPhone
        }
        
        // Use backend to verify phone OTP
        endpoint = `${BACKEND_URL}/api/auth/verify-phone-otp`
        body = { phone: cleanPhone, otp }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        // Store user data in USER object format
        localStorage.setItem('USER', JSON.stringify({
          id: data.userId || data.id,
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
            <div className="flex gap-2 mb-6">
              <Button
                variant={loginMethod === 'email-password' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setLoginMethod('email-password')
                  setOtpSent(false)
                }}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant={loginMethod === 'email-otp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setLoginMethod('email-otp')
                  setOtpSent(false)
                }}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email OTP
              </Button>
              <Button
                variant={loginMethod === 'phone-otp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setLoginMethod('phone-otp')
                  setOtpSent(false)
                }}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone OTP
              </Button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email & Password Login */}
              {loginMethod === 'email-password' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
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
                    <label className="text-sm font-medium">Password</label>
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
                </>
              )}

              {/* Email OTP Login */}
              {loginMethod === 'email-otp' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={otpSent}
                        required
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP</label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleResendOTP}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        disabled={loading}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Phone OTP Login */}
              {loginMethod === 'phone-otp' && (
                <>
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
                        disabled={otpSent}
                        required
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP</label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleResendOTP}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        disabled={loading}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              {(loginMethod === 'email-password' || otpSent) && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              )}
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
          {loginMethod === 'email-password' && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => toast.info('Password reset feature coming soon!')}
                className="text-sm text-[#9AE600] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
