"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Mail, Phone, User, MapPin, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserDetailsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the user details from localStorage
    const storedData = localStorage.getItem("viewUserDetails")
    if (storedData) {
      try {
        const user = JSON.parse(storedData)
        setUserData(user)

        // Get attendance data for this user
        const attendanceHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
        const userAttendance = attendanceHistory
          .filter((record: any) => record.employeeEmail === user.email)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setAttendanceData(userAttendance)
      } catch (error) {
        console.error("Error parsing user details:", error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold text-navy">Loading...</div>
          <p className="text-muted-foreground">Please wait while we fetch the user details.</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold text-navy">No Data Found</div>
          <p className="text-muted-foreground">No user details were found. Please go back and try again.</p>
          <Button className="mt-4 bg-steel-blue hover:bg-steel-blue/90" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">User Profile</h1>
          <p className="text-muted-foreground">Viewing details for {userData.name}</p>
        </div>
        <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="border-steel-blue">
            <CardHeader>
              <CardTitle className="text-navy">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold">
                    {userData.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <Badge className="absolute -bottom-2 right-0 bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-steel-blue" />
                  <span className="font-medium">{userData.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-steel-blue" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-steel-blue" />
                  <span>{userData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-steel-blue" />
                  <span>{userData.jobTitle || "Employee"}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-steel-blue" />
                  <span>{userData.department}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="leave" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Leave History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4">
              <Card className="border-steel-blue">
                <CardHeader>
                  <CardTitle className="text-navy">Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceData.length > 0 ? (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "-"}
                              </TableCell>
                              <TableCell>
                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    record.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No attendance records found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leave" className="mt-4">
              <Card className="border-steel-blue">
                <CardHeader>
                  <CardTitle className="text-navy">Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">No leave records found</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
