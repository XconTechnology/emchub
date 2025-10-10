import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, User, FileText, Package, Calendar } from "lucide-react";
import type { ActivityLog } from "@shared/schema";

export default function AdminActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.entityTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.actionType === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionBadge = (actionType: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-500 hover:bg-green-600",
      update: "bg-blue-500 hover:bg-blue-600",
      delete: "bg-red-500 hover:bg-red-600",
      approve: "bg-emerald-500 hover:bg-emerald-600",
      reject: "bg-orange-500 hover:bg-orange-600",
    };
    return (
      <Badge className={colors[actionType] || "bg-gray-500"}>
        {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
      </Badge>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, any> = {
      listing: FileText,
      product: Package,
      service: Package,
      event: Calendar,
      coupon: FileText,
      staff_help_request: User,
      user: User,
    };
    const Icon = icons[entityType] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.actionType)));
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entityType)));

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <p className="text-gray-600">Monitor all user actions and system events</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(log => log.userId)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => {
                const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return logDate > dayAgo;
              }).length}
            </div>
            <p className="text-xs text-gray-500">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by user, action, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-logs"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-action-filter">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-entity-filter">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {uniqueEntities.map(entity => (
              <SelectItem key={entity} value={entity}>
                {entity.replace(/_/g, ' ').charAt(0).toUpperCase() + entity.slice(1).replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No activity logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <Card key={log.id} data-testid={`card-log-${log.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    {getEntityIcon(log.entityType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.actionType)}
                      <Badge variant="outline" className="text-xs">
                        {log.entityType.replace(/_/g, ' ')}
                      </Badge>
                      {log.entityTitle && (
                        <span className="text-sm font-medium text-gray-900">
                          {log.entityTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{log.userName}</span>
                      </div>
                      {log.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 ? (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          View metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(log.metadata as Record<string, unknown>, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredLogs.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing {filteredLogs.length} of {logs.length} total logs
        </p>
      )}
    </div>
  );
}
