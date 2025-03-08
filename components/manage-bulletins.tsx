"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock bulletin data (same as in bulletin-board.tsx)
const initialBulletins = [
  {
    id: "1",
    title: "Protect Your Password",
    content:
      "Always use strong passwords with a mix of letters, numbers, and special characters. Never share your passwords with anyone.",
    date: "2024-03-05",
  },
  {
    id: "2",
    title: "Beware of Phishing",
    content: "Be cautious of suspicious emails asking for your credentials. Always verify the sender's address.",
    date: "2024-03-04",
  },
  {
    id: "3",
    title: "Two-Factor Authentication",
    content: "Enable two-factor authentication whenever possible for an extra layer of security.",
    date: "2024-03-03",
  },
]

export function ManageBulletins() {
  const [bulletins, setBulletins] = useState(initialBulletins)
  const [newBulletin, setNewBulletin] = useState({
    title: "",
    content: "",
  })
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bulletin = {
      id: Date.now().toString(),
      title: newBulletin.title,
      content: newBulletin.content,
      date: new Date().toISOString().split("T")[0],
    }
    setBulletins([bulletin, ...bulletins])
    setNewBulletin({ title: "", content: "" })
    setOpen(false)
  }

  const deleteBulletin = (id: string) => {
    setBulletins(bulletins.filter((bulletin) => bulletin.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Bulletins</CardTitle>
        <CardDescription>Create and manage cybersecurity awareness bulletins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Bulletin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Bulletin</DialogTitle>
                  <DialogDescription>Add a new cybersecurity awareness bulletin for employees</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newBulletin.title}
                      onChange={(e) =>
                        setNewBulletin((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter bulletin title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newBulletin.content}
                      onChange={(e) =>
                        setNewBulletin((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Enter bulletin content"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Bulletin</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {bulletins.map((bulletin) => (
              <Card key={bulletin.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bulletin.title}</CardTitle>
                    <Button variant="destructive" size="sm" onClick={() => deleteBulletin(bulletin.id)}>
                      Delete
                    </Button>
                  </div>
                  <CardDescription>Posted on {new Date(bulletin.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{bulletin.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

