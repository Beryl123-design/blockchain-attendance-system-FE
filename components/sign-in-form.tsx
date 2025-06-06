"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { login, registerUser } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function SignInForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Registration state
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")
  const [regName, setRegName] = useState("")
  const [regRole, setRegRole] = useState("employee")
  const [regDepartment, setRegDepartment] = useState("")
  const [regJobTitle, setRegJobTitle] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  // Clear errors when switching tabs
  useEffect(() => {
    setLoginError(null)
    setRegisterError(null)
  }, [activeTab])

  // Check if user is already logged in
  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const userEmail = localStorage.getItem("userEmail")

    // if (userRole && userEmail) {
    //   // User is already logged in, redirect to dashboard
    //   window.location.href = "/dashboard"
    // }
  }, [])

  const validateLoginForm = () => {
    setLoginError(null)

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const validateRegisterForm = () => {
    setRegisterError(null)

    if (!regEmail || !regEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (regPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return false
    }

    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match",
        variant: "destructive",
      })
      return false
    }

    if (!regName || regName.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Please enter your full name",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateLoginForm()) {
      return
    }

    setIsLoading(true)
    setLoginError(null)

    try {
      // Call the backend API for authentication
      const response = await login(email, password)

      // Store minimal non-sensitive user info in localStorage for UI purposes only
      // Critical auth data is now in HTTP-only cookies
      localStorage.setItem("userName", response.user.name)
      localStorage.setItem("userEmail", response.user.email)

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      })

      // Force a hard navigation instead of client-side routing
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Login error:", error)
      setLoginError(error instanceof Error ? error.message : "An error occurred during login")
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateRegisterForm()) {
      return
    }

    setIsRegistering(true)
    setRegisterError(null)

    try {
      // Call the backend API for registration
      await registerUser({
        email: regEmail,
        password: regPassword,
        name: regName,
        role: regRole,
        department: regDepartment,
        jobTitle: regJobTitle,
      })

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      })

      // Clear registration form and switch to login tab
      setRegEmail("")
      setRegPassword("")
      setRegConfirmPassword("")
      setRegName("")
      setRegRole("employee")
      setRegDepartment("")
      setRegJobTitle("")
      setActiveTab("login")

      // Pre-fill login form with registration email
      setEmail(regEmail)
    } catch (error) {
      console.error("Registration error:", error)
      setRegisterError(error instanceof Error ? error.message : "An error occurred during registration")
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  // Function to handle demo login
  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)

    // Use a more reliable method to submit the form
    const form = document.getElementById("login-form") as HTMLFormElement
    if (form) {
      // Use the FormData API to set the values
      const formData = new FormData(form)
      formData.set("email", demoEmail)
      formData.set("password", demoPassword)

      // Dispatch a submit event
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      })

      form.dispatchEvent(submitEvent)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-steel-blue">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-navy">Welcome</CardTitle>
        <CardDescription>Access your blockchain attendance dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form id="login-form" onSubmit={handleSignIn}>
              <div className="grid gap-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>Please use one of the demo accounts below to log in.</AlertDescription>
                </Alert>

                <Tabs defaultValue="employee" onValueChange={setRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-light-gray">
                    <TabsTrigger
                      value="employee"
                      className="data-[state=active]:bg-steel-blue data-[state=active]:text-white"
                    >
                      Employee
                    </TabsTrigger>
                    <TabsTrigger
                      value="hr"
                      className="data-[state=active]:bg-steel-blue data-[state=active]:text-white"
                    >
                      HR
                    </TabsTrigger>
                    <TabsTrigger
                      value="admin"
                      className="data-[state=active]:bg-steel-blue data-[state=active]:text-white"
                    >
                      Admin
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-navy">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-navy">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <Button type="submit" className="w-full bg-steel-blue hover:bg-steel-blue/90" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Demo credentials */}
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-2">Demo Accounts:</p>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-gray-500">admin@example.com / admin123</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleDemoLogin("admin@example.com", "admin123")}
                      >
                        Use
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Employee</p>
                        <p className="text-xs text-gray-500">employee@example.com / employee123</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleDemoLogin("employee@example.com", "employee123")}
                      >
                        Use
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">HR</p>
                        <p className="text-xs text-gray-500">hr@example.com / hr123</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleDemoLogin("hr@example.com", "hr123")}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <div className="grid gap-4">
                {registerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="reg-name" className="text-navy">
                    Full Name
                  </Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-email" className="text-navy">
                    Email
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="m@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-password" className="text-navy">
                    Password
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-confirm-password" className="text-navy">
                    Confirm Password
                  </Label>
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-role" className="text-navy">
                    Role
                  </Label>
                  <Select value={regRole} onValueChange={setRegRole}>
                    <SelectTrigger className="border-steel-blue/50 focus:ring-steel-blue">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-department" className="text-navy">
                    Department
                  </Label>
                  <Input
                    id="reg-department"
                    type="text"
                    placeholder="Engineering"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-job-title" className="text-navy">
                    Job Title
                  </Label>
                  <Input
                    id="reg-job-title"
                    type="text"
                    placeholder="Software Engineer"
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    className="border-steel-blue/50 focus-visible:ring-steel-blue"
                  />
                </div>
                <Button type="submit" className="w-full bg-steel-blue hover:bg-steel-blue/90" disabled={isRegistering}>
                  {isRegistering ? "Registering..." : "Register"}
                </Button>

                {/* Preview mode notice */}
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="font-medium">Preview Mode Notice:</p>
                  <p>
                    In this preview, registration data is not persisted. In a real deployment, this would connect to
                    your backend API.
                  </p>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-muted-foreground text-center mt-2">
          Blockchain-enabled attendance monitoring system
        </div>
      </CardFooter>
      <Toaster />
    </Card>
  )
}
