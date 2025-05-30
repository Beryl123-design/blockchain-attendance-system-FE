"use client"

import { useState, useEffect } from "react"
import { Save, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define HR settings interface
interface HRSettings {
  notificationPreferences: {
    email: boolean
    inApp: boolean
    leaveRequests: boolean
    newEmployees: boolean
    attendanceIssues: boolean
  }
  leaveApprovalSettings: {
    autoApproveUnder: number
    requireSecondaryApproval: boolean
    defaultLeaveStatus: string
  }
  reportSettings: {
    defaultReportFormat: string
    includePersonalData: boolean
    autoGenerateMonthly: boolean
  }
  accessControl: {
    canViewSalaries: boolean
    canEditEmployeeRecords: boolean
    canApproveLeave: boolean
    canGenerateReports: boolean
  }
}

// Default HR settings
const defaultHRSettings: HRSettings = {
  notificationPreferences: {
    email: true,
    inApp: true,
    leaveRequests: true,
    newEmployees: true,
    attendanceIssues: true,
  },
  leaveApprovalSettings: {
    autoApproveUnder: 2,
    requireSecondaryApproval: false,
    defaultLeaveStatus: "pending",
  },
  reportSettings: {
    defaultReportFormat: "pdf",
    includePersonalData: false,
    autoGenerateMonthly: true,
  },
  accessControl: {
    canViewSalaries: true,
    canEditEmployeeRecords: true,
    canApproveLeave: true,
    canGenerateReports: true,
  },
}

export function HRSettings() {
  const [settings, setSettings] = useState<HRSettings>(defaultHRSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsChanged, setSettingsChanged] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("hrSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Handle toggle changes
  const handleToggleChange = (section: keyof HRSettings, setting: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: checked,
      },
    }))
  }

  // Handle input changes
  const handleInputChange = (section: keyof HRSettings, setting: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value,
      },
    }))
  }

  // Save settings
  const handleSaveSettings = () => {
    setIsSaving(true)

    // Save to localStorage
    localStorage.setItem("hrSettings", JSON.stringify(settings))

    setTimeout(() => {
      setIsSaving(false)
      setSettingsChanged(true)

      toast({
        title: "Settings Saved",
        description: "Your HR settings have been saved successfully.",
      })

      // Reset the success message after 3 seconds
      setTimeout(() => {
        setSettingsChanged(false)
      }, 3000)
    }, 1000)
  }

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <CardTitle className="text-navy">HR Settings</CardTitle>
        <CardDescription>Configure your HR management preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Preferences */}
        <div>
          <h3 className="text-lg font-medium text-navy mb-2">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email notifications</Label>
              <Switch
                id="email-notif"
                checked={settings.notificationPreferences.email}
                onCheckedChange={(checked) => handleToggleChange("notificationPreferences", "email", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="app-notif">In-app notifications</Label>
              <Switch
                id="app-notif"
                checked={settings.notificationPreferences.inApp}
                onCheckedChange={(checked) => handleToggleChange("notificationPreferences", "inApp", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-notif">Leave request notifications</Label>
              <Switch
                id="leave-notif"
                checked={settings.notificationPreferences.leaveRequests}
                onCheckedChange={(checked) => handleToggleChange("notificationPreferences", "leaveRequests", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="employee-notif">New employee notifications</Label>
              <Switch
                id="employee-notif"
                checked={settings.notificationPreferences.newEmployees}
                onCheckedChange={(checked) => handleToggleChange("notificationPreferences", "newEmployees", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="attendance-notif">Attendance issue notifications</Label>
              <Switch
                id="attendance-notif"
                checked={settings.notificationPreferences.attendanceIssues}
                onCheckedChange={(checked) =>
                  handleToggleChange("notificationPreferences", "attendanceIssues", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Leave Approval Settings */}
        <div>
          <h3 className="text-lg font-medium text-navy mb-2">Leave Approval Settings</h3>
          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="auto-approve">Auto-approve leave requests under (days)</Label>
              <Input
                id="auto-approve"
                type="number"
                min="0"
                max="10"
                value={settings.leaveApprovalSettings.autoApproveUnder}
                onChange={(e) =>
                  handleInputChange("leaveApprovalSettings", "autoApproveUnder", Number.parseInt(e.target.value))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="secondary-approval">Require secondary approval for long leaves</Label>
              <Switch
                id="secondary-approval"
                checked={settings.leaveApprovalSettings.requireSecondaryApproval}
                onCheckedChange={(checked) =>
                  handleToggleChange("leaveApprovalSettings", "requireSecondaryApproval", checked)
                }
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="default-status">Default leave request status</Label>
              <Select
                value={settings.leaveApprovalSettings.defaultLeaveStatus}
                onValueChange={(value) => handleInputChange("leaveApprovalSettings", "defaultLeaveStatus", value)}
              >
                <SelectTrigger id="default-status">
                  <SelectValue placeholder="Select default status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Report Settings */}
        <div>
          <h3 className="text-lg font-medium text-navy mb-2">Report Settings</h3>
          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="report-format">Default report format</Label>
              <Select
                value={settings.reportSettings.defaultReportFormat}
                onValueChange={(value) => handleInputChange("reportSettings", "defaultReportFormat", value)}
              >
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="personal-data">Include personal data in reports</Label>
              <Switch
                id="personal-data"
                checked={settings.reportSettings.includePersonalData}
                onCheckedChange={(checked) => handleToggleChange("reportSettings", "includePersonalData", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-generate">Auto-generate monthly reports</Label>
              <Switch
                id="auto-generate"
                checked={settings.reportSettings.autoGenerateMonthly}
                onCheckedChange={(checked) => handleToggleChange("reportSettings", "autoGenerateMonthly", checked)}
              />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div>
          <h3 className="text-lg font-medium text-navy mb-2">Access Control</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor="view-salaries">View employee salaries</Label>
                <Lock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              <Switch
                id="view-salaries"
                checked={settings.accessControl.canViewSalaries}
                onCheckedChange={(checked) => handleToggleChange("accessControl", "canViewSalaries", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor="edit-records">Edit employee records</Label>
                <Lock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              <Switch
                id="edit-records"
                checked={settings.accessControl.canEditEmployeeRecords}
                onCheckedChange={(checked) => handleToggleChange("accessControl", "canEditEmployeeRecords", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="approve-leave">Approve leave requests</Label>
              <Switch
                id="approve-leave"
                checked={settings.accessControl.canApproveLeave}
                onCheckedChange={(checked) => handleToggleChange("accessControl", "canApproveLeave", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="generate-reports">Generate reports</Label>
              <Switch
                id="generate-reports"
                checked={settings.accessControl.canGenerateReports}
                onCheckedChange={(checked) => handleToggleChange("accessControl", "canGenerateReports", checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full">
          <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardFooter>

      {settingsChanged && (
        <div className="mx-6 mb-6 rounded-md bg-green-100 p-3 text-green-800">Settings saved successfully!</div>
      )}

      <Toaster />
    </Card>
  )
}
