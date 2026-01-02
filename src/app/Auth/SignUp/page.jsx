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
  const [signupMethod, setSignupMethod] = useState('email-password') // 'email-password' or 'phone-otp'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
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

    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
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

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)
    try {
      // Add + prefix if not present
      let cleanPhone = phone.replace(/\s+/g, '')
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone
      }
      
      const response = await fetch(`${BACKEND_URL}/api/auth/signupphoneotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          phone: cleanPhone 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        toast.success('OTP sent successfully to your phone!')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {

      toast.error('Error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      // Add + prefix if not present
      let cleanPhone = phone.replace(/\s+/g, '')
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone
      }
      
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully!')
        // Store user data
        localStorage.setItem('User', JSON.stringify({storedUserId: data.userId,Logged:true}))
        localStorage.setItem('token', data.token)
        // Redirect to home
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toast.error(data.message || 'OTP verification failed')
      }
    } catch (error) {

      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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

        localStorage.setItem('User', JSON.stringify({storedUserId: data.userId,Logged:true}))
        localStorage.setItem('token', data.token)
        // Redirect to home
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toast.error(data.message || 'Sign up failed')
      }
    } catch (error) {

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
            {/* Method Selection */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSignupMethod('email-password')
                  setOtpSent(false)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === 'email-password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupMethod('phone-otp')
                  setOtpSent(false)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === 'phone-otp'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Phone OTP
              </button>
            </div>

            <form onSubmit={signupMethod === 'email-password' ? handleSignUp : handleVerifyOTP} className="space-y-4">
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

              {signupMethod === 'email-password' ? (
                <>
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
                    <label className="text-sm font-medium">
                      Phone Number {!email && <span className="text-destructive">*</span>}
                      <span className="text-xs text-muted-foreground ml-2">
                        (Email or Phone required)
                      </span>
                    </label>
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
                </>
              ) : (
                <>
                  {/* Phone OTP Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
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
                      className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  ) : (
                    <>
                      {/* OTP Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Enter OTP <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          required
                        />
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="text-xs text-[#9AE600] hover:underline"
                          >
                            Resend OTP
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Change number
                          </button>
                        </div>
                      </div>

                      {/* Verify Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                      >
                        {loading ? 'Verifying...' : 'Verify & Sign Up'}
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                By signing up, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => toast.info('Terms & Conditions page coming soon!')}
                  className="text-[#9AE600] hover:underline"
                >
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => toast.info('Privacy Policy page coming soon!')}
                  className="text-[#9AE600] hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
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
              Login Instead
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
