"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const leaveTypes = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "emergency", label: "Emergency Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
]

export function LeaveForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
  })

  const [errors, setErrors] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const [isFormValid, setIsFormValid] = useState(false)

  // Validate form whenever form data changes
  useEffect(() => {
    const newErrors = {
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
    }

    let valid = true

    if (!formData.type) {
      newErrors.type = "Please select a leave type"
      valid = false
    }

    if (!formData.startDate) {
      newErrors.startDate = "Please select a start date"
      valid = false
    }

    if (!formData.endDate) {
      newErrors.endDate = "Please select an end date"
      valid = false
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date cannot be before start date"
      valid = false
    }

    if (!formData.reason || formData.reason.length < 10) {
      newErrors.reason = "Reason must be at least 10 characters"
      valid = false
    }

    setErrors(newErrors)
    setIsFormValid(valid)
  }, [formData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Calculate number of days
      const days =
        formData.startDate && formData.endDate
          ? Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 0

      console.log("Form submitted successfully:", {
        ...formData,
        days,
      })

      // Show success message
      toast({
        title: "Leave application submitted",
        description: `Your application for ${days} day${days !== 1 ? "s" : ""} has been sent for approval.`,
      })

      // Reset form
      setFormData({
        type: "",
        startDate: undefined,
        endDate: undefined,
        reason: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to submit leave application. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Application</CardTitle>
        <CardDescription>Submit a new leave request for approval</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Select start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Select end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    initialFocus
                    disabled={(date) => (formData.startDate ? date < formData.startDate : false)}
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* Display calculated days if both dates are selected */}
          {formData.startDate && formData.endDate && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                Leave duration:{" "}
                <strong>
                  {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}{" "}
                  day(s)
                </strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              placeholder="Please provide details about your leave request"
              className="min-h-[100px]"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !isFormValid}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
