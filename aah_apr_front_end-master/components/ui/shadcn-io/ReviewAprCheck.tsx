"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const provinces = ["Kabul", "Helmand", "Ghor", "Daikundi", "Badakhshan"]

const AprReview: React.FC<{ title: string }> = ({ title }) => {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"review" | "logs">("review")
  const [masterApr, setMasterApr] = React.useState(false)
  const [provinceChecks, setProvinceChecks] = React.useState<Record<string, boolean>>(
    Object.fromEntries(provinces.map((p) => [p, false]))
  )

  const toggleProvince = (province: string) => {
    setProvinceChecks((prev) => ({ ...prev, [province]: !prev[province] }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{title}</Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{
          maxHeight: "80vh",
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-2 relative">
          <DialogHeader>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 w-1/2">
            <Input placeholder="Search..." className="h-8 w-60" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "review" | "logs")} className="mb-6">
          <TabsList className="border-b border-gray-300 gap-6">
            <TabsTrigger value="review">Review APR</TabsTrigger>
            <TabsTrigger value="logs">APR Logs</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Master APR and Province checkboxes */}
        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={masterApr} onCheckedChange={(v) => setMasterApr(!!v)} />
            <span>Master APR</span>
          </div>

          <span className="font-medium">Province based:</span>
          {provinces.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <Checkbox checked={provinceChecks[p]} onCheckedChange={() => toggleProvince(p)} />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AprReview