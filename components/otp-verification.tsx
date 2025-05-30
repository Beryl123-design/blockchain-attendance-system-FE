"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { verifyOTP, getOTPMetadata } from "@/lib/otp-service"
import { AlertCircle, CheckCircle, Clock, Lock, RefreshCw } from "lucide-react"

interface OTPVerificationProps {
  userId: string
  onVerificationSuccess: (payrollData: any, payrollMeta: any) => void
  onCancel: () => void
}

export function OTPVerification({ userId, onVerificationSuccess, onCancel }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string>("")
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [payrollInfo, setPayrollInfo] = useState<any>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Get OTP metadata on mount
  useEffect(() => {
    const metadata = getOTPMetadata(userId)

    if (metadata.payrollMeta) {
      setPayrollInfo(metadata.payrollMeta)
    }

    if (metadata.expiresAt) {
      const updateTimeRemaining = () => {
        const now = new Date()
        const expiryTime = new Date(metadata.expiresAt as Date).getTime()
        const remaining = Math.max(0, Math.floor((expiryTime - now.getTime()) / 1000))

        setTimeRemaining(remaining)

        if (remaining <= 0) {
          clearInterval(interval)
        }
      }

      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 1000)

      return () => clearInterval(interval)
    }

    if (metadata.lockedUntil) {
      const now = new Date()
      const lockoutTime = new Date(metadata.lockedUntil).getTime()
      if (now.getTime() < lockoutTime) {
        setLockoutMinutes(Math.ceil((lockoutTime - now.getTime()) / (60 * 1000)))
      }
    }
  }, [userId])

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste event
      const pastedValue = value.replace(/[^0-9]/g, "").slice(0, 6) // Ensure only digits
      const otpArray = pastedValue.split("").slice(0, 6)

      // Fill in the inputs
      otpArray.forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = digit
        }
      })

      // Set the OTP value
      setOtp(pastedValue)

      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(otpArray.length, 5)
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex]!.focus()
      }

      return
    }

    // Regular single digit input - only allow digits
    if (/^\d*$/.test(value)) {
      // Create a new array with the updated value
      const newOtp = otp.split("")
      newOtp[index] = value
      setOtp(newOtp.join(""))

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  // Handle key down for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      // Focus previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits of the OTP")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const result = verifyOTP(userId, otp)

      if (result.success) {
        toast({
          title: "Verification Successful",
          description: "You can now access the payroll data.",
        })
        onVerificationSuccess(result.payrollData, result.payrollMeta)
      } else {
        setError(result.message)

        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts)
        }

        if (result.lockoutMinutes !== undefined) {
          setLockoutMinutes(result.lockoutMinutes)
        }
      }
    } catch (error) {
      setError("An error occurred during verification. Please try again.")
      console.error("OTP verification error:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  // If account is locked
  if (lockoutMinutes) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600 flex items-center justify-center">
            <Lock className="mr-2" />
            Account Temporarily Locked
          </CardTitle>
          <CardDescription>Too many failed verification attempts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
            <p className="font-medium">Your account is locked for security reasons</p>
            <p className="text-sm mt-2">
              Please try again after {lockoutMinutes} minute{lockoutMinutes !== 1 ? "s" : ""}.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>For immediate assistance, please contact the HR department.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onCancel}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Verify OTP</CardTitle>
        <CardDescription className="text-center">Enter the 6-digit code sent to your email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {payrollInfo && (
          <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
            <p className="font-medium">Payroll Information:</p>
            <p>Month: {payrollInfo.month.charAt(0).toUpperCase() + payrollInfo.month.slice(1)}</p>
            <p>Department: {payrollInfo.department === "all" ? "All Departments" : payrollInfo.department}</p>
            <p>Generated: {new Date(payrollInfo.generatedDate).toLocaleString()}</p>
          </div>
        )}

        {timeRemaining !== null && (
          <div className="flex items-center justify-center text-amber-600">
            <Clock className="mr-2 h-4 w-4" />
            <span className="text-sm">Code expires in: {formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={index === 0 ? 6 : 1} // Allow paste on first input
                className="w-12 h-12 text-center text-lg"
                value={otp[index] || ""}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
        </div>

        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {remainingAttempts !== null && remainingAttempts > 0 && (
          <div className="text-amber-600 text-sm text-center">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
          </div>
        )}

        <Button
          className="w-full bg-steel-blue hover:bg-steel-blue/90"
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify & Access Payroll
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
