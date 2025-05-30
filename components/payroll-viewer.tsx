"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Lock, Shield } from "lucide-react"

interface PayrollViewerProps {
  payrollData: any
  payrollMeta: any
  onClose: () => void
}

export function PayrollViewer({ payrollData, payrollMeta, onClose }: PayrollViewerProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Handle export
  const handleExport = () => {
    setIsExporting(true)

    try {
      // Create CSV content
      let csv =
        "Employee,Department,Working Days,Overtime (hrs),Leave Days,Basic Salary (GHS),Overtime (GHS),Deductions (GHS),Gross Salary (GHS)\n"

      payrollData.employees.forEach((employee: any) => {
        csv += `"${employee.name}","${employee.department}","${employee.workingDays}","${employee.overtime}","${employee.leave}","₵${employee.basicSalary.toFixed(2)}","₵${employee.overtimeAmount.toFixed(2)}","₵${employee.deductions.toFixed(2)}","₵${employee.grossSalary.toFixed(2)}"\n`
      })

      // Create a blob and trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `payroll_${payrollMeta.month}_${payrollMeta.department}_${new Date().toISOString().split("T")[0]}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Log this access for audit purposes
      console.log(`Payroll data exported at ${new Date().toISOString()}`)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-steel-blue">
              <FileText className="mr-2" />
              Payroll Data
            </CardTitle>
            <CardDescription>Securely accessed on {new Date().toLocaleString()}</CardDescription>
          </div>
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <Shield className="mr-1 h-4 w-4" />
            Secure Access
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-600 font-medium">Month</p>
            <p className="font-medium">{payrollMeta.month.charAt(0).toUpperCase() + payrollMeta.month.slice(1)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-600 font-medium">Department</p>
            <p className="font-medium">
              {payrollMeta.department === "all"
                ? "All Departments"
                : payrollMeta.department.charAt(0).toUpperCase() + payrollMeta.department.slice(1)}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-600 font-medium">Generated Date</p>
            <p className="font-medium">{formatDate(payrollMeta.generatedDate)}</p>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
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
              {payrollData.employees.map((employee: any) => (
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
                <TableCell className="font-bold">₵{payrollData.summary.totalBasicSalary.toFixed(2)}</TableCell>
                <TableCell className="font-bold">₵{payrollData.summary.totalOvertimeAmount.toFixed(2)}</TableCell>
                <TableCell className="font-bold">₵{payrollData.summary.totalDeductions.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">
                  ₵{payrollData.summary.totalGrossSalary.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
          <div className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            <p className="font-medium">Security Notice</p>
          </div>
          <p className="mt-1">
            This payroll data was securely accessed using one-time password authentication. For security reasons, this
            session will expire when you close this view.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
