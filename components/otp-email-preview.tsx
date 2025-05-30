"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Copy, Clock, Shield } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OTPEmailPreviewProps {
  otp: string
  recipientEmail: string
  payrollMeta: {
    month: string
    department: string
  }
  expiryMinutes: number
  onClose: () => void
  onSend: () => void
}

export function OTPEmailPreview({
  otp,
  recipientEmail,
  payrollMeta,
  expiryMinutes,
  onClose,
  onSend,
}: OTPEmailPreviewProps) {
  const handleCopyOTP = () => {
    navigator.clipboard.writeText(otp)
    toast({
      title: "OTP Copied",
      description: "The OTP has been copied to your clipboard.",
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2" />
          OTP Email Preview
        </CardTitle>
        <CardDescription>This is a preview of the email that will be sent to {recipientEmail}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="border-b pb-2 mb-2">
            <div>
              <strong>To:</strong> {recipientEmail}
            </div>
            <div>
              <strong>Subject:</strong> Your One-Time Password for Payroll Access
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <p>Dear Finance Team Member,</p>

            <p>
              You have been granted secure access to the payroll data for{" "}
              {payrollMeta.month.charAt(0).toUpperCase() + payrollMeta.month.slice(1)}
              {payrollMeta.department !== "all" ? ` - ${payrollMeta.department}` : ""}.
            </p>

            <p>To access this data, please use the following One-Time Password (OTP):</p>

            <div className="bg-blue-50 p-4 rounded-md text-center my-4">
              <p className="text-sm text-blue-600 font-medium">Your One-Time Password</p>
              <p className="text-2xl font-bold tracking-wider my-2">{otp}</p>
              <div className="flex items-center justify-center text-xs text-blue-600">
                <Clock className="mr-1 h-3 w-3" />
                <span>Valid for {expiryMinutes} minutes</span>
              </div>
            </div>

            <p>
              This OTP will expire in {expiryMinutes} minutes. For security reasons, please do not share this OTP with
              anyone.
            </p>

            <p>Once you enter this OTP, you will be able to view and download the payroll data securely.</p>

            <p>
              Best regards,
              <br />
              HR Department
            </p>

            <div className="border-t pt-3 mt-4 text-xs text-gray-500">
              <p>
                <strong>Security Notice:</strong> This email contains a one-time password for accessing confidential
                payroll information. If you did not request this OTP, please contact the HR department immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-green-50 p-3 rounded-md text-green-800 text-sm">
          <Shield className="mr-2 h-4 w-4" />
          <div>
            <p className="font-medium">Enhanced Security</p>
            <p className="text-xs mt-1">
              Using OTP authentication provides an additional layer of security for sensitive payroll data.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCopyOTP}>
            <Copy className="mr-2 h-4 w-4" />
            Copy OTP
          </Button>
        </div>
        <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={onSend}>
          <Mail className="mr-2 h-4 w-4" />
          Send OTP Email
        </Button>
      </CardFooter>
    </Card>
  )
}
