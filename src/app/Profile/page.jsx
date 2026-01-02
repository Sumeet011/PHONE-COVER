'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import SwipeCard from '@/components/homeCards/SwipeCard';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'
import localFont from 'next/font/local'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  User,
  Trophy,
  Edit2,
  Check,
  X,
  Package
} from 'lucide-react'
import Image from 'next/image'

const JersyFont = localFont({
  src: '../../../public/fonts/jersey-10-latin-400-normal.woff2',
  display: 'swap',
})

const ProfilePage = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  // User data states
  const [userId, setUserId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRank, setUserRank] = useState(0)
  const [profileImage, setProfileImage] = useState(null)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Verification states
  const [isVerified, setIsVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState('password') // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  // Collections states
  const [collections, setCollections] = useState([])
  const [standardCards, setStandardCards] = useState([])
  
  // Mock collections data - Replace with API call
  const mockCollections = [
    { src: '/images/1.webp', alt: 'Collection 1' },
    { src: '/images/2.webp', alt: 'Collection 2' },
    { src: '/images/3.webp', alt: 'Collection 3' },
  ]
  
  const mockStandardCards = [
    { src: '/images/1.webp', alt: 'Card 1' },
    { src: '/images/2.webp', alt: 'Card 2' },
    { src: '/images/3.webp', alt: 'Card 3' },
    { src: '/images/1.webp', alt: 'Card 4' },
  ]

  // Edit states
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false
  })
  const [editValues, setEditValues] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Initialize user data
  useEffect(() => {
    const storedUser = localStorage.getItem('USER')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserId(user.id)
      setIsLoggedIn(true)
      
      if (!user.isLogedIn) {
        toast.error('Please login to access your profile')
        router.push('/Auth/Login')
      }
    } else {
      router.push('/Auth/Login')
    }

    // Fetch user profile data
    fetchUserProfile()
  }, [router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile/${userId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const profile = data.data
        setUserData({
          name: profile.username || profile.name || '',
          email: profile.email || '',
          phone: profile.phoneNumber || profile.phone || ''
        })
        setEditValues({
          name: profile.username || profile.name || '',
          email: profile.email || '',
          phone: profile.phoneNumber || profile.phone || ''
        })
        setUserRank(profile.rank || profile.score || 0)
        setProfileImage(profile.profilePicture || null)
      }
    } catch (error) {
      toast.error('Failed to load profile data')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        // TODO: Upload to server
        uploadProfileImage(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('profileImage', file)
      formData.append('userId', userId)

      const response = await fetch(`${BACKEND_URL}/api/users/upload-profile-picture`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile image updated successfully!')
        // Update user data with new profile picture
        setUserData(prev => ({
          ...prev,
          profilePicture: data.data.profilePicture
        }))
      } else {
        toast.error(data.message || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      // TODO: Implement OTP sending API
      const response = await fetch(`${BACKEND_URL}/api/auth/send-verification-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          email: userData.email 
        })
      })

      // if (response.ok) {
        setOtpSent(true)
        toast.success('OTP sent to your email!')
      // } else {
      //   toast.error('Failed to send OTP')
      // }
    } catch (error) {
      toast.error('Error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      if (verificationMethod === 'password') {
        if (!password) {
          toast.error('Please enter your password')
          setLoading(false)
          return
        }

        // TODO: Verify password
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, password })
        })

        // if (response.ok) {
          setIsVerified(true)
          toast.success('Verification successful!')
        // } else {
        //   toast.error('Invalid password')
        // }
      } else {
        if (!otp) {
          toast.error('Please enter the OTP')
          setLoading(false)
          return
        }

        // TODO: Verify OTP
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, otp })
        })

        // if (response.ok) {
          setIsVerified(true)
          toast.success('Verification successful!')
        // } else {
        //   toast.error('Invalid OTP')
        // }
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = (field) => {
    if (isEditing[field]) {
      // Cancel edit
      setEditValues(prev => ({
        ...prev,
        [field]: userData[field]
      }))
    }
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSaveField = async (field) => {
    if (editValues[field] === userData[field]) {
      setIsEditing(prev => ({ ...prev, [field]: false }))
      return
    }

    setLoading(true)
    try {
      // TODO: Update field on server
      const response = await fetch(`${BACKEND_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          field,
          value: editValues[field]
        })
      })

      // if (response.ok) {
        setUserData(prev => ({
          ...prev,
          [field]: editValues[field]
        }))
        setIsEditing(prev => ({ ...prev, [field]: false }))
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
      // } else {
      //   toast.error('Failed to update')
      // }
    } catch (error) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const getRankBadgeColor = (rank) => {
    if (rank <= 10) return 'from-yellow-400 to-yellow-600'
    if (rank <= 50) return 'from-gray-300 to-gray-500'
    if (rank <= 100) return 'from-orange-400 to-orange-600'
    return 'from-blue-400 to-blue-600'
  }

  return (
    <div className="min-h-screen bg-[#090701] overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto pt-8 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className={`${JersyFont.className} text-[#9AE600] text-5xl sm:text-7xl text-center mb-12`}>
          MY PROFILE
        </h1>

        {/* Main Grid: Left Side (Details) + Right Side (Collections) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT SIDE: Profile Details */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#131313] rounded-2xl p-8 border border-gray-800">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center border-4 border-lime-400/20">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#9AE600] rounded-full flex items-center justify-center shadow-lg hover:bg-[#8BD500] transition-all"
                  >
                    <Camera className="w-5 h-5 text-black" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Rank Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-[#9AE600] text-lg font-bold">Rank #{userRank}</span>
                </div>
              </div>

              {/* Verification Section */}
              {!isVerified && (
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-gray-800">
                  <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#9AE600]" />
                    Verify to Edit
                  </h3>
                  
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={() => setVerificationMethod('password')}
                      variant={verificationMethod === 'password' ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 ${verificationMethod === 'password' ? 'bg-[#9AE600] text-black hover:bg-[#8BD500]' : 'bg-transparent border-gray-700 text-white hover:bg-gray-800'}`}
                    >
                      Password
                    </Button>
                    <Button
                      onClick={() => {
                        setVerificationMethod('otp')
                        setOtpSent(false)
                      }}
                      variant={verificationMethod === 'otp' ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 ${verificationMethod === 'otp' ? 'bg-[#9AE600] text-black hover:bg-[#8BD500]' : 'bg-transparent border-gray-700 text-white hover:bg-gray-800'}`}
                    >
                      OTP
                    </Button>
                  </div>

                  {verificationMethod === 'password' && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="pr-10 bg-[#131313] border-gray-700 text-white placeholder:text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Button 
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full bg-[#9AE600] text-black hover:bg-[#8BD500]"
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  )}

                  {verificationMethod === 'otp' && (
                    <div className="space-y-3">
                      {!otpSent ? (
                        <Button 
                          onClick={handleSendOTP}
                          disabled={loading}
                          className="w-full bg-[#9AE600] text-black hover:bg-[#8BD500]"
                        >
                          {loading ? 'Sending...' : 'Send OTP'}
                        </Button>
                      ) : (
                        <>
                          <Input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="bg-[#131313] border-gray-700 text-white placeholder:text-gray-500"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleVerify}
                              disabled={loading}
                              className="flex-1 bg-[#9AE600] text-black hover:bg-[#8BD500]"
                            >
                              Verify
                            </Button>
                            <Button 
                              onClick={handleSendOTP}
                              variant="outline"
                              disabled={loading}
                              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                            >
                              Resend
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Fields */}
              <div className="space-y-4">
                {/* Name */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase">Full Name</span>
                    {isVerified && (
                      <div className="flex gap-2">
                        {isEditing.name ? (
                          <>
                            <button onClick={() => handleSaveField('name')} className="text-green-400 hover:text-green-300">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditToggle('name')} className="text-red-400 hover:text-red-300">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEditToggle('name')} className="text-gray-400 hover:text-[#9AE600]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isVerified && isEditing.name ? (
                    <Input
                      value={editValues.name}
                      onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-[#131313] border-gray-700 text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-white">{userData.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase">Email</span>
                    {isVerified && (
                      <div className="flex gap-2">
                        {isEditing.email ? (
                          <>
                            <button onClick={() => handleSaveField('email')} className="text-green-400 hover:text-green-300">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditToggle('email')} className="text-red-400 hover:text-red-300">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEditToggle('email')} className="text-gray-400 hover:text-[#9AE600]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isVerified && isEditing.email ? (
                    <Input
                      value={editValues.email}
                      onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[#131313] border-gray-700 text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-white">{userData.email || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase">Phone</span>
                    {isVerified && (
                      <div className="flex gap-2">
                        {isEditing.phone ? (
                          <>
                            <button onClick={() => handleSaveField('phone')} className="text-green-400 hover:text-green-300">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditToggle('phone')} className="text-red-400 hover:text-red-300">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEditToggle('phone')} className="text-gray-400 hover:text-[#9AE600]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isVerified && isEditing.phone ? (
                    <Input
                      value={editValues.phone}
                      onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-[#131313] border-gray-700 text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-white">{userData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="destructive"
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={() => {
                  localStorage.removeItem('USER')
                  toast.success('Logged out successfully')
                  router.push('/Auth/Login')
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: Collections */}
          <div className="space-y-6">
            {/* Collections Section */}
            <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[#9AE600]" />
                <h2 className="text-white text-xl font-bold">My Collections</h2>
              </div>
              
              {/* Horizontal Scrollable Collections */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4">
                  {mockCollections.map((img, index) => (
                    <div key={index} className="flex-shrink-0">
                      <SwipeCard images={[img]} slideShadows={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Cards Section */}
            <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center text-[#9AE600]">🃏</div>
                <h2 className="text-white text-xl font-bold">Standard Cards</h2>
              </div>
              
              {/* Horizontal Scrollable Standard Cards */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4">
                  {mockStandardCards.map((img, index) => (
                    <div key={index} className="flex-shrink-0">
                      <SwipeCard images={[img]} slideShadows={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage
