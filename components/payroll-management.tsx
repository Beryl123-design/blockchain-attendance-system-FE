"use client"

import { useState } from "react"
import { Download, Save, Check, Mail, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OTPEmailPreview } from "./otp-email-preview"
import { OTPVerification } from "./otp-verification"
import { PayrollViewer } from "./payroll-viewer"
import { storeOTP } from "@/lib/otp-service"

// Mock payroll data
const payrollData = [
  {
    id: "1",
    name: "John Doe",
    department: "Engineering",
    workingDays: "21/23",
    overtime: 5,
    leave: 2,
    basicSalary: 4000,
    overtimeAmount: 500,
    deductions: 0,
    grossSalary: 4500,
  },
  {
    id: "2",
    name: "Jane Smith",
    department: "Marketing",
    workingDays: "23/23",
    overtime: 2,
    leave: 0,
    basicSalary: 4000,
    overtimeAmount: 200,
    deductions: 0,
    grossSalary: 4200,
  },
  {
    id: "3",
    name: "Robert Johnson",
    department: "HR",
    workingDays: "20/23",
    overtime: 0,
    leave: 3,
    basicSalary: 4000,
    overtimeAmount: 0,
    deductions: 200,
    grossSalary: 3800,
  },
  {
    id: "4",
    name: "Emily Davis",
    department: "Finance",
    workingDays: "22/23",
    overtime: 8,
    leave: 1,
    basicSalary: 4300,
    overtimeAmount: 800,
    deductions: 0,
    grossSalary: 5100,
  },
  {
    id: "5",
    name: "Michael Wilson",
    department: "Engineering",
    workingDays: "19/23",
    overtime: 0,
    leave: 4,
    basicSalary: 4200,
    overtimeAmount: 0,
    deductions: 250,
    grossSalary: 3950,
  },
]

// Mock finance staff for email forwarding
const financeStaff = [
  { id: "1", name: "Thomas Anderson", email: "thomas.anderson@finance.ecggh.com", role: "Finance Manager" },
  { id: "2", name: "Sarah Johnson", email: "sarah.johnson@finance.ecggh.com", role: "Senior Accountant" },
  { id: "3", name: "David Williams", email: "david.williams@finance.ecggh.com", role: "Payroll Specialist" },
  { id: "4", name: "Jennifer Brown", email: "jennifer.brown@finance.ecggh.com", role: "Financial Analyst" },
]

// OTP configuration
const OTP_EXPIRY_MINUTES = 10

export function PayrollManagement() {
  const [month, setMonth] = useState("march")
  const [department, setDepartment] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [payrollStatus, setPayrollStatus] = useState("draft") // draft, finalized
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  // OTP related states
  const [showOtpPreview, setShowOtpPreview] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [showPayrollViewer, setShowPayrollViewer] = useState(false)
  const [currentOtp, setCurrentOtp] = useState("")
  const [currentRecipient, setCurrentRecipient] = useState<any>(null)
  const [decryptedPayrollData, setDecryptedPayrollData] = useState<any>(null)
  const [payrollMetadata, setPayrollMetadata] = useState<any>(null)

  // Filter data based on department
  const filteredData =
    department === "all"
      ? payrollData
      : payrollData.filter((item) => item.department.toLowerCase() === department.toLowerCase())

  // Calculate totals
  const totalBasicSalary = filteredData.reduce((sum, item) => sum + item.basicSalary, 0)
  const totalOvertimeAmount = filteredData.reduce((sum, item) => sum + item.overtimeAmount, 0)
  const totalDeductions = filteredData.reduce((sum, item) => sum + item.deductions, 0)
  const totalGrossSalary = filteredData.reduce((sum, item) => sum + item.grossSalary, 0)

  // Handle export payroll
  const handleExportPayroll = () => {
    setIsExporting(true)

    // Create CSV content
    let csv =
      "Employee,Department,Working Days,Overtime (hrs),Leave Days,Basic Salary (GHS),Overtime (GHS),Deductions (GHS),Gross Salary (GHS)\n"

    filteredData.forEach((employee) => {
      csv += `"${employee.name}","${employee.department}","${employee.workingDays}","${employee.overtime}","${employee.leave}","₵${employee.basicSalary.toFixed(2)}","₵${employee.overtimeAmount.toFixed(2)}","₵${employee.deductions.toFixed(2)}","₵${employee.grossSalary.toFixed(2)}"\n`
    })

    // Create a blob and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payroll_${month}_${department}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Save to localStorage for record keeping
    const payrollExports = JSON.parse(localStorage.getItem("payrollExports") || "[]")
    payrollExports.push({
      date: new Date().toISOString(),
      month,
      department,
      totalAmount: totalGrossSalary,
      employeeCount: filteredData.length,
    })
    localStorage.setItem("payrollExports", JSON.stringify(payrollExports))

    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Export Complete",
        description: `Payroll data for ${month} has been exported successfully.`,
      })
    }, 1000)
  }

  // Handle save draft
  const handleSaveDraft = () => {
    setIsSaving(true)

    // Save current payroll data to localStorage
    const payrollDrafts = JSON.parse(localStorage.getItem("payrollDrafts") || "{}")
    payrollDrafts[`${month}_${department}`] = {
      month,
      department,
      data: filteredData,
      lastModified: new Date().toISOString(),
      status: "draft",
    }
    localStorage.setItem("payrollDrafts", JSON.stringify(payrollDrafts))

    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Draft Saved",
        description: `Payroll draft for ${month} has been saved successfully.`,
      })
    }, 1000)
  }

  // Handle finalize payroll
  const handleFinalizePayroll = () => {
    setIsFinalizing(true)

    // Save finalized payroll data to localStorage
    const finalizedPayrolls = JSON.parse(localStorage.getItem("finalizedPayrolls") || "{}")
    finalizedPayrolls[`${month}_${department}`] = {
      month,
      department,
      data: filteredData,
      finalizedDate: new Date().toISOString(),
      totalAmount: totalGrossSalary,
    }
    localStorage.setItem("finalizedPayrolls", JSON.stringify(finalizedPayrolls))

    // Update status
    setPayrollStatus("finalized")

    setTimeout(() => {
      setIsFinalizing(false)
      toast({
        title: "Payroll Finalized",
        description: `Payroll for ${month} has been finalized successfully.`,
      })
    }, 1500)
  }

  // Handle process payroll
  const handleProcessPayroll = () => {
    toast({
      title: "Processing Payroll",
      description: "Payroll is being processed. This may take a few moments.",
    })

    setTimeout(() => {
      toast({
        title: "Payroll Processed",
        description: "Payroll has been processed successfully and is ready for review.",
      })
    }, 2000)
  }

  // Handle email forwarding
  const handleEmailForward = () => {
    setShowEmailDialog(true)

    // Set default email subject and message
    if (!emailSubject) {
      setEmailSubject(
        `Payroll Report for ${month.charAt(0).toUpperCase() + month.slice(1)} - ${department === "all" ? "All Departments" : department}`,
      )
    }

    if (!emailMessage) {
      setEmailMessage(`Dear Finance Team,

Please find attached the payroll report for ${month.charAt(0).toUpperCase() + month.slice(1)}${department !== "all" ? ` - ${department}` : ""}.

To access this data, you will receive a separate email with a one-time password (OTP). This OTP will be valid for ${OTP_EXPIRY_MINUTES} minutes.

Total Employees: ${filteredData.length}
Total Gross Salary: ₵${totalGrossSalary.toFixed(2)}

Best regards,
HR Department`)
    }
  }

  // Toggle recipient selection
  const toggleRecipient = (id: string) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter((recipientId) => recipientId !== id))
    } else {
      setSelectedRecipients([...selectedRecipients, id])
    }
  }

  // Handle sending OTP
  const handleSendOTP = (recipientId: string) => {
    const recipient = financeStaff.find((staff) => staff.id === recipientId)

    if (!recipient) {
      toast({
        title: "Error",
        description: "Recipient not found.",
        variant: "destructive",
      })
      return
    }

    // Create payroll data for encryption
    const payrollDataForEmail = {
      month,
      department,
      generatedDate: new Date().toISOString(),
      employees: filteredData,
      summary: {
        totalEmployees: filteredData.length,
        totalBasicSalary,
        totalOvertimeAmount,
        totalDeductions,
        totalGrossSalary,
      },
    }

    // Generate OTP and store it
    const otp = storeOTP(recipient.id, payrollDataForEmail, {
      month,
      department,
      generatedDate: new Date().toISOString(),
      recipientEmail: recipient.email,
    })

    // Set current OTP and recipient for preview
    setCurrentOtp(otp)
    setCurrentRecipient(recipient)

    // Show OTP preview
    setShowEmailDialog(false)
    setShowOtpPreview(true)
  }

  // Handle sending OTP email
  const handleSendOTPEmail = () => {
    // In a real app, this would send an API request to your email service
    // For this demo, we'll simulate sending and store in localStorage

    const sentEmails = JSON.parse(localStorage.getItem("sentPayrollOtps") || "[]")

    const newEmail = {
      id: Date.now().toString(),
      recipient: {
        id: currentRecipient.id,
        name: currentRecipient.name,
        email: currentRecipient.email,
      },
      otpSent: true,
      otpId: currentOtp.substring(0, 2) + "****", // Store a masked version of the OTP
      sentDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString(),
      payrollInfo: {
        month,
        department,
      },
    }

    sentEmails.push(newEmail)
    localStorage.setItem("sentPayrollOtps", JSON.stringify(sentEmails))

    // Record this activity
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type: "Payroll",
      description: `OTP for payroll access sent to ${currentRecipient.name} (${currentRecipient.email}).`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("recentActivities", JSON.stringify(activities))

    // Close dialog and show success message
    setShowOtpPreview(false)

    toast({
      title: "OTP Email Sent",
      description: `An OTP has been sent to ${currentRecipient.email} for secure payroll access.`,
    })

    // For demo purposes, immediately show the OTP verification screen
    // In a real app, the recipient would receive the email and enter the OTP
    setShowOtpVerification(true)
  }

  // Handle OTP verification success
  const handleVerificationSuccess = (payrollData: any, payrollMeta: any) => {
    setDecryptedPayrollData(payrollData)
    setPayrollMetadata(payrollMeta)
    setShowOtpVerification(false)
    setShowPayrollViewer(true)

    // Record this activity
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type: "Payroll",
      description: `Payroll data for ${month} was successfully accessed using OTP verification.`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("recentActivities", JSON.stringify(activities))
  }

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <CardTitle className="text-navy">Payroll Management</CardTitle>
        <CardDescription>Manage employee payroll based on attendance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div>
                <label className="text-sm font-medium mb-1 block">Month</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="february">February 2024</SelectItem>
                    <SelectItem value="march">March 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPayroll} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
              <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleProcessPayroll}>
                <span className="mr-2">₵</span>
                Process Payroll
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Overtime (hrs)</TableHead>
                  <TableHead>Leave Days</TableHead>
                  <TableHead>Basic Salary (GHS)</TableHead>
                  <TableHead>Overtime (GHS)</TableHead>
                  <TableHead>Deductions (GHS)</TableHead>
                  <TableHead className="text-right">Gross Salary (GHS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.workingDays}</TableCell>
                    <TableCell>{employee.overtime}</TableCell>
                    <TableCell>{employee.leave}</TableCell>
                    <TableCell>₵{employee.basicSalary.toFixed(2)}</TableCell>
                    <TableCell>₵{employee.overtimeAmount.toFixed(2)}</TableCell>
                    <TableCell>₵{employee.deductions.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₵{employee.grossSalary.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableBody className="bg-muted/50">
                <TableRow>
                  <TableCell colSpan={5} className="font-bold text-right">
                    Totals:
                  </TableCell>
                  <TableCell className="font-bold">₵{totalBasicSalary.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">₵{totalOvertimeAmount.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">₵{totalDeductions.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold">₵{totalGrossSalary.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 rounded-md bg-muted p-4">
            <h3 className="text-sm font-medium mb-2">Payroll Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-lg font-bold">{filteredData.length}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">Total Basic Salary</p>
                <p className="text-lg font-bold">₵{totalBasicSalary.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">Total Overtime</p>
                <p className="text-lg font-bold">₵{totalOvertimeAmount.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">Total Gross Salary</p>
                <p className="text-lg font-bold">₵{totalGrossSalary.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || payrollStatus === "finalized"}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
            <Button
              className="bg-steel-blue hover:bg-steel-blue/90"
              onClick={handleFinalizePayroll}
              disabled={isFinalizing || payrollStatus === "finalized"}
            >
              {isFinalizing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Finalizing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Finalize Payroll
                </>
              )}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleEmailForward}
              disabled={payrollStatus !== "finalized" && filteredData.length === 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              Share with Finance
            </Button>
          </div>

          {payrollStatus === "finalized" && (
            <div className="mt-4 rounded-md bg-green-100 p-3 text-green-800">
              <p className="text-sm font-medium">Payroll has been finalized for {month}.</p>
              <p className="text-xs mt-1">
                Finalized on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Email Forwarding Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Share Payroll with Finance Team</DialogTitle>
            <DialogDescription>
              Select recipients to share the payroll data with. Each recipient will receive an OTP for secure access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
              <Shield className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Enhanced Security with OTP</p>
                <p className="text-xs mt-1">
                  Recipients will receive a one-time password (OTP) that expires after {OTP_EXPIRY_MINUTES} minutes.
                  This OTP is required to access the payroll data.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <div className="mt-2 rounded-md border p-4 max-h-[200px] overflow-y-auto">
                {financeStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id={`recipient-${staff.id}`}
                      checked={selectedRecipients.includes(staff.id)}
                      onChange={() => toggleRecipient(staff.id)}
                      className="rounded"
                    />
                    <label htmlFor={`recipient-${staff.id}`} className="flex-1">
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {staff.email} - {staff.role}
                      </div>
                    </label>
                    {selectedRecipients.includes(staff.id) && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleSendOTP(staff.id)}>
                        <FileText className="mr-1 h-3 w-3" />
                        Send OTP
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Email Message</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Email message"
                className="mt-1 min-h-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-steel-blue hover:bg-steel-blue/90"
              disabled={selectedRecipients.length === 0}
              onClick={() => {
                if (selectedRecipients.length > 0) {
                  // In a real app, this would send the initial email
                  toast({
                    title: "Email Sent",
                    description: `Payroll notification sent to ${selectedRecipients.length} recipient(s).`,
                  })
                  setShowEmailDialog(false)
                }
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Notification Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Email Preview Dialog */}
      <Dialog open={showOtpPreview} onOpenChange={setShowOtpPreview}>
        <DialogContent className="max-w-3xl p-0">
          {currentRecipient && (
            <OTPEmailPreview
              otp={currentOtp}
              recipientEmail={currentRecipient.email}
              payrollMeta={{ month, department }}
              expiryMinutes={OTP_EXPIRY_MINUTES}
              onClose={() => setShowOtpPreview(false)}
              onSend={handleSendOTPEmail}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpVerification} onOpenChange={setShowOtpVerification}>
        <DialogContent className="max-w-3xl p-0">
          {currentRecipient && (
            <OTPVerification
              userId={currentRecipient.id}
              onVerificationSuccess={handleVerificationSuccess}
              onCancel={() => setShowOtpVerification(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payroll Viewer Dialog */}
      <Dialog open={showPayrollViewer} onOpenChange={setShowPayrollViewer}>
        <DialogContent className="max-w-5xl p-0">
          {decryptedPayrollData && payrollMetadata && (
            <PayrollViewer
              payrollData={decryptedPayrollData}
              payrollMeta={payrollMetadata}
              onClose={() => setShowPayrollViewer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </Card>
  )
}
