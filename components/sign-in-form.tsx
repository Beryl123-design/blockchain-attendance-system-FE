"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { api } from '@/services/api'
import { toast } from '@/components/ui/use-toast'

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Login with email and password
      const userData = await api.login({ 
        email, 
        password,
       // Include role in login request
      })
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userRole', role)
      
      toast({
        title: "Success",
        description: "Successfully signed in",
      })
      
      // Redirect to dashboard based on role
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-steel-blue">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-navy">Welcome</CardTitle>
        <CardDescription>Sign in to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn}>
          <div className="grid gap-4">
            <Tabs defaultValue="employee" onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-light-gray">
                <TabsTrigger
                  value="employee"
                  className="data-[state=active]:bg-steel-blue data-[state=active]:text-white"
                  disabled={isLoading}
                >
                  Employee
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-steel-blue data-[state=active]:text-white"
                  disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                className="border-steel-blue/50 focus-visible:ring-steel-blue"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-steel-blue hover:bg-steel-blue/90"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-muted-foreground text-center mt-2">
          Blockchain-enabled attendance monitoring system
        </div>
      </CardFooter>
    </Card>
  )
}

