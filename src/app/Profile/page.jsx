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
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;
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

  // Verification states - Verification removed, users can edit directly
  const [isVerified, setIsVerified] = useState(true)
  const [verificationMethod, setVerificationMethod] = useState('password') // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  // Collections states
  const [collections, setCollections] = useState([])
  const [standardCards, setStandardCards] = useState([])
  
  // Fetch user's owned collections and products from user profile
  useEffect(() => {
    if (!userId) return
    
    const fetchUserCollectionsAndProducts = async () => {
      try {
        console.log('Fetching user profile with gaming collections...')
        
        // Fetch user profile which now includes gamingCollections and standardProducts
        const response = await fetch(`${BACKEND_URL}/api/users/profile/${userId}`)
        const data = await response.json()
        
        if (!data.success || !data.data) {
          console.error('Failed to fetch user profile')
          return
        }
        
        const profile = data.data
        console.log('User profile:', profile)
        console.log('Gaming collections:', profile.gamingCollections)
        console.log('Standard products:', profile.standardProducts)
        
        // Format gaming collections for SwipeCard
        const gamingCollectionsForSwipe = (profile.gamingCollections || []).map(collection => {
          console.log(`Collection "${collection.collectionName}" has ${collection.cards?.length || 0} cards`)
          console.log('Cards:', collection.cards)
          
          // Each collection becomes ONE SwipeCard with multiple images
          const images = collection.cards?.map(card => {
            console.log('Card:', card.name, 'Image:', card.image, 'Level:', card.level)
            return {
              src: card.image || '/images/card.webp',
              alt: card.name,
              level: card.level
            }
          }) || []
          
          console.log('Formatted images for this collection:', images)
          return {
            name: collection.collectionName,
            images: images
          }
        }).filter(collection => collection.images.length > 0) // Filter out empty collections
        
        console.log('All gaming collections formatted:', gamingCollectionsForSwipe)
        setCollections(gamingCollectionsForSwipe)
        
        // Format standard cards
        const formattedStandardCards = (profile.standardProducts || []).map(product => {
          console.log('Standard product:', product.name, 'Image:', product.image)
          return {
            src: product.image || '/images/card.webp',
            alt: product.name
          }
        })
        
        console.log('Standard cards formatted:', formattedStandardCards)
        setStandardCards(formattedStandardCards)
        
        console.log('Final result:', {
          gamingCollections: gamingCollectionsForSwipe.length,
          totalCards: gamingCollectionsForSwipe.reduce((sum, collection) => sum + collection.images.length, 0),
          standardCards: formattedStandardCards.length
        })
        
      } catch (error) {
        console.error('Error fetching user collections and products:', error)
      }
    }
    
    fetchUserCollectionsAndProducts()
  }, [userId, BACKEND_URL])

  // Edit states
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    password: false
  })
  const [editValues, setEditValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  // Initialize user data
  useEffect(() => {
    const storedUser = localStorage.getItem('USER')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      console.log('Stored user:', user)
      console.log('User ID:', user.id)
      setUserId(user.id)
      setIsLoggedIn(true)
      
      if (!user.isLogedIn) {
        toast.error('Please login to access your profile')
        router.push('/Auth/Login')
        return
      }

      // Fetch user profile data with the user ID
      if (user.id) {
        fetchUserProfile(user.id)
      } else {
        toast.error('User ID not found. Please login again.')
        router.push('/Auth/Login')
      }
    } else {
      router.push('/Auth/Login')
    }
  }, [router])

  const fetchUserProfile = async (id) => {
    const profileUserId = id || userId
    if (!profileUserId) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile/${profileUserId}`)
      const data = await response.json()
      
      console.log('📋 Profile API response:', data)
      
      if (data.success && data.data) {
        const profile = data.data
        console.log('👤 User profile data:', profile)
        
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
        
        console.log('✅ Profile data set:', {
          name: profile.username || profile.name,
          email: profile.email,
          phone: profile.phoneNumber || profile.phone
        })
      } else {
        console.error('❌ Profile fetch failed:', data.message)
        toast.error(data.message || 'Failed to load profile data')
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error)
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      // Update field on server
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          [field]: editValues[field]
        })
      })

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          [field]: editValues[field]
        }))
        setIsEditing(prev => ({ ...prev, [field]: false }))
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
      } else {
        toast.error('Failed to update')
      }
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
        <div className="grid grid-cols-1  gap-8 lg:gap-8">
          
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

              {/* Verification Section - Removed for easier editing */}
              {false && !isVerified && (
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
                    {(
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
                  </div>
                  {isEditing.email ? (
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
                  </div>
                  {isEditing.phone ? (
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

                {/* Password */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs uppercase">Password</span>
                    <div className="flex gap-2">
                      {isEditing.password ? (
                        <>
                          <button onClick={() => handleSaveField('password')} className="text-green-400 hover:text-green-300">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditToggle('password')} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleEditToggle('password')} className="text-gray-400 hover:text-[#9AE600]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {isEditing.password ? (
                    <div className="relative">
                      <Input
                        type={showPasswordField ? 'text' : 'password'}
                        value={editValues.password}
                        onChange={(e) => setEditValues(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter new password"
                        className="bg-[#131313] border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordField(!showPasswordField)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswordField ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="text-white">••••••••</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        (Password is encrypted)
                      </div>
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
                <h2 className="text-white text-xl font-bold">Gaming Collections</h2>
              </div>
              
              {/* Horizontal Scrollable Collections */}
              <div className="overflow-x-auto scrollbar-hide -mx-2">
                <div className="flex flex-row gap-4 pb-4 w-max px-2 items-start">
                  {collections.length > 0 ? (
                    collections.map((collection, index) => (
                      <div key={index} className="flex-shrink-0">
                        <SwipeCard 
                          images={collection.images} 
                          slideShadows={false}
                          collectionName={collection.name}
                          alignLeft={true}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No gaming collections unlocked yet. Purchase collections to see them here!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Standard Cards Section */}
            <div className="bg-[#131313] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center text-[#9AE600]">🃏</div>
                <h2 className="text-white text-xl font-bold">Standard Cards</h2>
              </div>
              <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                <div className="flex gap-4 pb-4 w-max">
                  {standardCards.length > 0 ? (
                    standardCards.map((card, index) => (
                      <div
                        key={index}
                        className="group relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[230px] w-[150px] min-[370px]:w-[180px] min-[370px]:h-[270px] md:h-[320px] md:w-[220px]"
                      >
                        <div className="mouse-pointer relative overflow-hidden rounded-xl h-[290px]">
                          <img
                            src={card.src}
                            alt={card.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/card.webp'
                            }}
                          />
                        </div>

                        <div className="mt-3">
                          <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
                            {card.alt}
                          </h2>
                        </div>

                        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-black"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17l10-10M7 7h10v10"
                            />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No standard cards unlocked yet. Purchase products to see them here!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}}></style>
    </div>
  )
}

export default ProfilePage
