'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { KeyRound, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { getBackendUrl } from '@/lib/config'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

const JersyFont = localFont({
  src: '../../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const BACKEND_URL = getBackendUrl()

const ChangePasswordPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('current') // 'current' or 'otp'
  const [otpSent, setOtpSent] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    // Get user email from localStorage
    const userStr = localStorage.getItem('USER')
    if (!userStr) {
      toast.error('Please login first')
      router.push('/Auth/Login')
      return
    }
    
    const user = JSON.parse(userStr)
    if (user.email) {
      setEmail(user.email)
    } else {
      toast.error('Email not found. Please login again.')
      router.push('/Auth/Login')
    }
  }, [router])

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Email not found')
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

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (method === 'current' && !currentPassword) {
      toast.error('Please enter your current password')
      return
    }

    if (method === 'otp' && !otp) {
      toast.error('Please enter OTP')
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
      const requestBody = {
        email,
        newPassword
      }

      if (method === 'current') {
        requestBody.currentPassword = currentPassword
      } else {
        requestBody.otp = otp
      }

      const response = await fetchWithTimeout(`${BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully!')
        // Clear form
        setCurrentPassword('')
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setOtpSent(false)
        
        // Redirect to profile or home after 2 seconds
        setTimeout(() => {
          router.push('/Profile')
        }, 2000)
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.message?.includes('timed out') ? 'Password change request timed out. Please try again.' : 'An error occurred. Please try again.')
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
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-[#9AE600]" />
            <h1 className={`${JersyFont.className} text-[#9AE600] text-4xl md:text-5xl mb-2`}>
              CHANGE PASSWORD
            </h1>
            <p className="text-muted-foreground">Update your account password</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            {/* Method Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMethod('current')
                  setOtp('')
                  setOtpSent(false)
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all text-sm ${
                  method === 'current'
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Current Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('otp')
                  setCurrentPassword('')
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all text-sm ${
                  method === 'otp'
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <KeyRound className="w-4 h-4 inline mr-2" />
                Use OTP
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password Method */}
              {method === 'current' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Method */}
              {method === 'otp' && (
                <>
                  {!otpSent ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          An OTP will be sent to: <strong>{email}</strong>
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="w-full bg-[#9AE600] hover:bg-[#8BD500] text-black font-bold"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </div>
                  ) : (
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
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Didn't receive? Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* New Password Fields - Show only after OTP is sent or in current password mode */}
              {(method === 'current' || (method === 'otp' && otpSent)) && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password *</label>
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
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
            </div>

            {/* Back to Profile Link */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Profile')}
              className="w-full"
            >
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
