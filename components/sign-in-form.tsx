"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, we would authenticate with a backend service
    // and store the user's role and token in localStorage or a secure cookie

    // For demo purposes, we'll just store the role in localStorage
    localStorage.setItem("userRole", role)

    // Redirect to the appropriate dashboard
    router.push("/dashboard")
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
                >
                  Employee
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
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
            <Button type="submit" className="w-full bg-steel-blue hover:bg-steel-blue/90">
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

