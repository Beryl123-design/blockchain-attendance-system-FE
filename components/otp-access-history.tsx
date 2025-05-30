"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Clock, FileText, Search, Shield, User } from "lucide-react"

export function OTPAccessHistory() {
  const [searchTerm, setSearchTerm] = useState("")

  // Get OTP history from localStorage
  const getOtpHistory = () => {
    const history = JSON.parse(localStorage.getItem("sentPayrollOtps") || "[]")
    return history.sort((a: any, b: any) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
  }

  const otpHistory = getOtpHistory()

  // Filter history based on search term
  const filteredHistory = otpHistory.filter((item: any) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.recipient.name.toLowerCase().includes(searchLower) ||
      item.recipient.email.toLowerCase().includes(searchLower) ||
      item.payrollInfo.month.toLowerCase().includes(searchLower) ||
      item.payrollInfo.department.toLowerCase().includes(searchLower)
    )
  })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Check if OTP is expired
  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          OTP Access History
        </CardTitle>
        <CardDescription>Track all one-time password (OTP) access to payroll data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, month, or department..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Payroll Info</TableHead>
                  <TableHead>OTP Sent</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{item.recipient.name}</div>
                            <div className="text-xs text-muted-foreground">{item.recipient.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {item.payrollInfo.month.charAt(0).toUpperCase() + item.payrollInfo.month.slice(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.payrollInfo.department === "all"
                                ? "All Departments"
                                : item.payrollInfo.department.charAt(0).toUpperCase() +
                                  item.payrollInfo.department.slice(1)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(item.sentDate)}</div>
                          <div className="text-xs text-muted-foreground">OTP: {item.otpId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>{formatDate(item.expiresAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpired(item.expiresAt) ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm ? (
                        <div className="text-muted-foreground">No results found for "{searchTerm}"</div>
                      ) : (
                        <div className="text-muted-foreground">No OTP access history found</div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <p className="font-medium">Security Information</p>
            </div>
            <p className="mt-1 text-xs">
              One-Time Passwords (OTPs) provide an additional layer of security for accessing sensitive payroll data.
              Each OTP is valid for a limited time and can only be used once. All OTP access attempts are logged for
              security auditing purposes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
