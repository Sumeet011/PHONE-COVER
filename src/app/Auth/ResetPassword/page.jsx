'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { getBackendUrl } from '@/lib/config'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

const JersyFont = localFont({
  src: '../../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const BACKEND_URL = getBackendUrl()

const ResetPasswordPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent to your email!')
        setStep(2)
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

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password reset successfully!')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/Auth/Login')
        }, 2000)
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.message?.includes('timed out') ? 'Reset request timed out. Please try again.' : 'An error occurred. Please try again.')
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
              RESET PASSWORD
            </h1>
            <p className="text-muted-foreground">
              {step === 1 
                ? 'Enter your email to receive OTP' 
                : 'Enter OTP and new password'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            )}

            {/* Step 2: OTP & New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    OTP has been sent to <strong>{email}</strong>
                  </p>
                </div>

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

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setOtp('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change email
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Remember your password?
                </span>
              </div>
            </div>

            {/* Back to Login Link */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Auth/Login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
