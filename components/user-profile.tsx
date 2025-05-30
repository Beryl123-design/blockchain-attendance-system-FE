"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { User, Mail, Briefcase, Building, Calendar, Edit, Save, Upload, Trash2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserProfileProps {
  isEditable?: boolean
}

export function UserProfile({ isEditable = true }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    department: "",
    jobTitle: "",
    joinDate: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    profilePicture: "",
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userName = localStorage.getItem("userName") || ""
    const userEmail = localStorage.getItem("userEmail") || ""
    const userDepartment = localStorage.getItem("userDepartment") || ""
    const userJobTitle = localStorage.getItem("userJobTitle") || ""

    // Try to get additional profile data if it exists
    const savedProfileData = localStorage.getItem("userProfileData")
    let additionalData = {}

    if (savedProfileData) {
      try {
        additionalData = JSON.parse(savedProfileData)
      } catch (error) {
        console.error("Error parsing profile data:", error)
      }
    }

    setProfileData({
      name: userName,
      email: userEmail,
      department: userDepartment,
      jobTitle: userJobTitle,
      joinDate: additionalData?.joinDate || "2023-01-15",
      phoneNumber: additionalData?.phoneNumber || "",
      address: additionalData?.address || "",
      emergencyContact: additionalData?.emergencyContact || "",
      profilePicture: additionalData?.profilePicture || "",
    })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    setIsSaving(true)

    // Save basic user data
    localStorage.setItem("userName", profileData.name)
    localStorage.setItem("userDepartment", profileData.department)
    localStorage.setItem("userJobTitle", profileData.jobTitle)

    // Save additional profile data
    const additionalData = {
      joinDate: profileData.joinDate,
      phoneNumber: profileData.phoneNumber,
      address: profileData.address,
      emergencyContact: profileData.emergencyContact,
      profilePicture: profileData.profilePicture,
    }

    localStorage.setItem("userProfileData", JSON.stringify(additionalData))

    // Update user in the users list if exists
    const userEmail = localStorage.getItem("userEmail")
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = existingUsers.findIndex((user: any) => user.email === userEmail)

    if (userIndex !== -1) {
      existingUsers[userIndex] = {
        ...existingUsers[userIndex],
        name: profileData.name,
        department: profileData.department,
        jobTitle: profileData.jobTitle,
      }

      localStorage.setItem("users", JSON.stringify(existingUsers))
    }

    // Record activity
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type: "Profile Update",
      description: `${profileData.name} updated their profile information.`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("recentActivities", JSON.stringify(activities))

    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    }, 1000)
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!profileData.name) return "U"

    const nameParts = profileData.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Profile picture must be less than 5MB.",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
      })
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      setProfileData((prev) => ({
        ...prev,
        profilePicture: event.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  // Handle profile picture deletion
  const handleDeleteProfilePicture = () => {
    setProfileData((prev) => ({
      ...prev,
      profilePicture: "",
    }))
    setShowDeleteDialog(false)

    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed.",
    })
  }

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-navy">My Profile</CardTitle>
          {isEditable && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-steel-blue text-steel-blue hover:bg-steel-blue/10"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
        <CardDescription>View and manage your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-steel-blue">
                {profileData.profilePicture ? (
                  <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                ) : (
                  <AvatarFallback className="bg-navy text-white text-xl">{getInitials()}</AvatarFallback>
                )}
              </Avatar>

              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-steel-blue text-white">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </DropdownMenuItem>
                      {profileData.profilePicture && (
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Photo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-navy">{profileData.name}</h3>
              <p className="text-sm text-muted-foreground">{profileData.jobTitle}</p>
            </div>
          </div>

          <div className="w-full space-y-4 md:flex-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center text-navy">
                  <User className="mr-2 h-4 w-4 text-steel-blue" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="border-steel-blue/50"
                  />
                ) : (
                  <div className="rounded-md border border-steel-blue/30 p-2">{profileData.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-navy">
                  <Mail className="mr-2 h-4 w-4 text-steel-blue" />
                  Email Address
                </Label>
                <div className="rounded-md border border-steel-blue/30 p-2">{profileData.email}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center text-navy">
                  <Building className="mr-2 h-4 w-4 text-steel-blue" />
                  Department
                </Label>
                {isEditing ? (
                  <Input
                    id="department"
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    className="border-steel-blue/50"
                  />
                ) : (
                  <div className="rounded-md border border-steel-blue/30 p-2">{profileData.department}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center text-navy">
                  <Briefcase className="mr-2 h-4 w-4 text-steel-blue" />
                  Job Title
                </Label>
                {isEditing ? (
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={profileData.jobTitle}
                    onChange={handleInputChange}
                    className="border-steel-blue/50"
                  />
                ) : (
                  <div className="rounded-md border border-steel-blue/30 p-2">{profileData.jobTitle}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinDate" className="flex items-center text-navy">
                  <Calendar className="mr-2 h-4 w-4 text-steel-blue" />
                  Join Date
                </Label>
                {isEditing ? (
                  <Input
                    id="joinDate"
                    name="joinDate"
                    type="date"
                    value={profileData.joinDate}
                    onChange={handleInputChange}
                    className="border-steel-blue/50"
                  />
                ) : (
                  <div className="rounded-md border border-steel-blue/30 p-2">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center text-navy">
                  <span className="mr-2">📱</span>
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="border-steel-blue/50"
                  />
                ) : (
                  <div className="rounded-md border border-steel-blue/30 p-2">
                    {profileData.phoneNumber || "Not provided"}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center text-navy">
                    <span className="mr-2">🏠</span>
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="border-steel-blue/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="flex items-center text-navy">
                    <span className="mr-2">⚠️</span>
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Name and phone number"
                    className="border-steel-blue/50"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {isEditing && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      )}

      {/* Delete Profile Picture Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfilePicture}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </Card>
  )
}
