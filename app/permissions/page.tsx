"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RolePermissionsViewer } from "@/components/role-permissions-viewer"
import { ProtectedRoute } from "@/components/protected-route"
import { Permission } from "@/lib/rbac"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Lock } from "lucide-react"

export default function PermissionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/")
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Shield className="mr-2 h-6 w-6" />
          Permissions Management
        </h1>

        <Tabs defaultValue="roles">
          <TabsList className="mb-6">
            <TabsTrigger value="roles" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              About RBAC
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolePermissionsViewer />
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Role-Based Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Role-Based Access Control (RBAC) is a security approach that restricts system access to authorized
                  users based on their role within the organization.
                </p>
                <h3 className="text-lg font-medium">Key Benefits:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Simplified administration and management of permissions</li>
                  <li>Improved security and compliance</li>
                  <li>Reduced risk of unauthorized access</li>
                  <li>Better user experience with appropriate access levels</li>
                </ul>
                <p>
                  In this system, each role has specific permissions that determine what actions users with that role
                  can perform. This ensures that users only have access to the features and data necessary for their job
                  functions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
