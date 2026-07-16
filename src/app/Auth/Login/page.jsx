'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { Eye, EyeOff, Mail, Phone, Lock, KeyRound } from 'lucide-react'
import { getBackendUrl } from '@/lib/config'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

const JersyFont = localFont({
  src: '../../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const BACKEND_URL = getBackendUrl()

const LoginPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState('password') // 'password', 'emailOtp', or 'phoneOtp'
  const [otpSent, setOtpSent] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!email || !password) {
        toast.error('Please fill in all fields')
        setLoading(false)
        return
      }

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/loginemailpass`, {
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
      toast.error(error.message?.includes('timed out') ? 'Server timeout. Please try again.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent to your email!')
        setOtpSent(true)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error(error.message?.includes('timed out') ? 'OTP request timed out. Please try again.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendPhoneOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent to your phone!')
        setOtpSent(true)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send phone OTP error:', error)
      toast.error(error.message?.includes('timed out') ? 'OTP request timed out. Please try again.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!email || !otp) {
        toast.error('Please fill in all fields')
        setLoading(false)
        return
      }

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
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
      console.error('OTP Login error:', error)
      toast.error(error.message?.includes('timed out') ? 'Verification timed out. Please try again.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneOTPLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!phone || !otp) {
        toast.error('Please fill in all fields')
        setLoading(false)
        return
      }

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        // Store user data in USER object format
        const userId = data.userId || data.user?.id || data.id
        localStorage.setItem('USER', JSON.stringify({
          id: userId,
          phone: phone,
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
      console.error('Phone OTP Login error:', error)
      toast.error(error.message?.includes('timed out') ? 'Verification timed out. Please try again.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 py-12 md:pt-32 pb-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
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
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setOtpSent(false)
                  setOtp('')
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all text-xs md:text-sm ${
                  loginMethod === 'password'
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2 mb-1" />
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('emailOtp')
                  setPassword('')
                  setOtpSent(false)
                  setOtp('')
                  setPhone('')
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all text-xs md:text-sm ${
                  loginMethod === 'emailOtp'
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2 mb-1" />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phoneOtp')
                  setPassword('')
                  setOtpSent(false)
                  setOtp('')
                  setEmail('')
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all text-xs md:text-sm ${
                  loginMethod === 'phoneOtp'
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2 mb-1" />
                Phone
              </button>
            </div>

            {/* Password Login Form */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            )}

            {/* Email OTP Login Form */}
            {loginMethod === 'emailOtp' && (
              <form onSubmit={handleOTPLogin} className="space-y-4">
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
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !email}
                    className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP *</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change email
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Phone OTP Login Form */}
            {loginMethod === 'phoneOtp' && (
              <form onSubmit={handlePhoneOTPLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+919876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                      disabled={otpSent}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Format: +[country code][number]</p>
                </div>

                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendPhoneOTP}
                    disabled={loading || !phone}
                    className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP *</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change phone number
                    </button>
                  </>
                )}
              </form>
            )}

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
              onClick={() => router.push('/Auth/ResetPassword')}
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
