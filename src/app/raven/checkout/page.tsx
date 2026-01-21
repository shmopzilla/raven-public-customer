"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { useCartStore } from "@/lib/stores/cart-store"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const getCartTotal = useCartStore((state) => state.getCartTotal)

  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: ""
  })

  const total = getCartTotal()
  const itemCount = items.length
  const totalHours = items.reduce((sum, item) => sum + item.totalHours, 0)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !showSuccess) {
      router.push('/raven/cart')
    }
  }, [items.length, showSuccess, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // TODO: Implement actual booking creation
      // This should:
      // 1. Create customer record if needed
      // 2. Process payment via Stripe
      // 3. Create booking records in Supabase
      // 4. Create booking_items for each slot
      // 5. Send confirmation email

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Booking details:', {
        customer: formData,
        bookings: items,
        total,
        totalHours
      })

      // Show success state
      setShowSuccess(true)

      // Clear cart after successful booking
      clearCart()

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        router.push('/raven/search')
      }, 3000)

    } catch (error) {
      console.error('Booking error:', error)
      alert('There was an error processing your booking. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a1f] to-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-['PP_Editorial_New'] text-3xl text-white mb-4">
            Booking Confirmed!
          </h2>
          <p className="font-['Archivo'] text-base text-[#d5d5d6] mb-6">
            Your ski instructor sessions have been booked successfully. You&apos;ll receive a confirmation email shortly.
          </p>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
            Redirecting you back to search...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a1f] to-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1a1a1f]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-['PP_Editorial_New'] text-3xl sm:text-4xl text-white">
            Checkout
          </h1>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6] mt-2">
            Complete your booking
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
            >
              <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Any special requirements or questions for your instructor..."
                />
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h2 className="font-['PP_Editorial_New'] text-2xl text-white mb-4">
                Your Bookings
              </h2>

              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                  {/* Instructor Avatar */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                    {item.instructorAvatar ? (
                      <Image
                        src={item.instructorAvatar}
                        alt={item.instructorName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-xl font-bold">
                        {item.instructorName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <h3 className="font-['Archivo'] font-semibold text-white">
                      {item.instructorName}
                    </h3>
                    <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
                      {item.location} • {item.discipline}
                    </p>
                    <p className="font-['Archivo'] text-sm text-[#d5d5d6] mt-1">
                      {item.totalHours} hours • {item.selectedSlots.length} slots
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-['Archivo'] font-bold text-white">
                      €{item.totalPrice}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
            >
              <h3 className="font-['PP_Editorial_New'] text-2xl text-white">
                Order Summary
              </h3>

              <div className="space-y-3 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                    Bookings
                  </span>
                  <span className="font-['Archivo'] text-sm text-white">
                    {itemCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                    Total Hours
                  </span>
                  <span className="font-['Archivo'] text-sm text-white">
                    {totalHours}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                    Subtotal
                  </span>
                  <span className="font-['Archivo'] text-sm text-white">
                    €{total}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg">
                <span className="font-['Archivo'] font-semibold text-white">
                  Total
                </span>
                <span className="font-['Archivo'] text-2xl font-bold text-white">
                  €{total}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={cn(
                  "w-full py-4 rounded-xl font-['Archivo'] font-semibold transition-all",
                  isProcessing
                    ? "bg-blue-400/50 text-white/50 cursor-not-allowed"
                    : "bg-blue-400 text-white hover:bg-blue-500"
                )}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Complete Booking'
                )}
              </button>

              <div className="pt-6 border-t border-white/10">
                <p className="font-['Archivo'] text-xs text-[#d5d5d6] text-center">
                  🔒 Secure booking • Instant confirmation
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}
