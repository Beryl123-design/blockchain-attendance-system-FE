"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Mock data for the attendance graph
const data = [
  {
    name: "Monday",
    present: 130,
    absent: 5,
    late: 7,
  },
  {
    name: "Tuesday",
    present: 132,
    absent: 3,
    late: 7,
  },
  {
    name: "Wednesday",
    present: 128,
    absent: 8,
    late: 6,
  },
  {
    name: "Thursday",
    present: 134,
    absent: 2,
    late: 6,
  },
  {
    name: "Friday",
    present: 125,
    absent: 10,
    late: 7,
  },
  {
    name: "Saturday",
    present: 65,
    absent: 70,
    late: 7,
  },
  {
    name: "Sunday",
    present: 20,
    absent: 115,
    late: 7,
  },
]

export function AttendanceGraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="present" name="Present" fill="#4ade80" />
        <Bar dataKey="absent" name="Absent" fill="#f87171" />
        <Bar dataKey="late" name="Late" fill="#facc15" />
      </BarChart>
    </ResponsiveContainer>
  )
}

