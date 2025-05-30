import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/rbac"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock, Check, AlertTriangle } from "lucide-react"

interface PermissionIndicatorProps {
  permission: Permission
  showLabel?: boolean
}

export function PermissionIndicator({ permission, showLabel = false }: PermissionIndicatorProps) {
  const { can } = usePermissions()
  const hasPermission = can(permission)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={hasPermission ? "default" : "outline"}
            className={`${hasPermission ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"} cursor-help`}
          >
            {hasPermission ? <Check className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
            {showLabel && permission}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasPermission ? `You have permission: ${permission}` : `You don't have permission: ${permission}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PermissionAlert({ permission, message }: { permission: Permission; message: string }) {
  const { can } = usePermissions()
  const hasPermission = can(permission)

  if (hasPermission) return null

  return (
    <div className="rounded-md bg-yellow-50 p-3 mb-4 flex items-center">
      <AlertTriangle className="h-4 w-4 text-yellow-800 mr-2" />
      <p className="text-sm text-yellow-800">{message}</p>
    </div>
  )
}
