import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Shield, Save, RotateCcw } from 'lucide-react';
import { permissions, rolePermissions } from '../data/sampleData';
import { DataStore } from '../data/store';
import { toast } from 'sonner';

const roleLabels: Record<string, { label: string; color: string }> = {
  director: { label: 'Director', color: 'bg-purple-100 text-purple-800' },
  deputy_director: { label: 'Deputy Director', color: 'bg-blue-100 text-blue-800' },
  manager: { label: 'Manager', color: 'bg-green-100 text-green-800' },
  teacher: { label: 'Teacher', color: 'bg-amber-100 text-amber-800' },
  administrator: { label: 'Administrator', color: 'bg-muted text-slate-800' },
};

export default function Permissions() {
  const [localPermissions, setLocalPermissions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    rolePermissions.forEach(rp => {
      initial[rp.role] = rp.permissions;
    });
    return initial;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (role: string, permissionName: string, checked: boolean) => {
    setLocalPermissions(prev => {
      const current = prev[role] || [];
      return {
        ...prev,
        [role]: checked
          ? [...current, permissionName]
          : current.filter(p => p !== permissionName),
      };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    const store = DataStore.getInstance();
    const rolePerms = Object.entries(localPermissions).map(([role, perms]) => ({
      role,
      permissionIds: perms,
    }));
    store.setRolePermissions(rolePerms);
    setHasChanges(false);
    toast.success('Разрешения сохранены');
  };

  const handleReset = () => {
    const initial: Record<string, string[]> = {};
    rolePermissions.forEach(rp => {
      initial[rp.role] = rp.permissions;
    });
    setLocalPermissions(initial);
    setHasChanges(false);
  };

  const modules = [...new Set(permissions.map(p => p.module))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permissions</h1>
          <p className="text-muted-foreground">Manage role-based access control</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(roleLabels).map(([role, config]) => (
          <Card key={role}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={config.color}>{config.label}</Badge>
                  <p className="mt-2 text-2xl font-bold">{localPermissions[role]?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">permissions</p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground/70" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <CardDescription>
            Check the permissions you want to grant to each role
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                <TableHead className="text-center">Director</TableHead>
                <TableHead className="text-center">Deputy</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">Teacher</TableHead>
                <TableHead className="text-center">Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map(module => (
                <>
                  <TableRow key={module} className="bg-muted">
                    <TableCell colSpan={6} className="font-semibold text-foreground">
                      {module}
                    </TableCell>
                  </TableRow>
                  {permissions.filter(p => p.module === module).map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </TableCell>
                      {Object.keys(roleLabels).map((role) => (
                        <TableCell key={role} className="text-center">
                          <Checkbox
                            checked={localPermissions[role]?.includes(permission.name)}
                            onCheckedChange={(checked) => handleToggle(role, permission.name, checked as boolean)}
                            disabled={role === 'director'}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Director role has all permissions and cannot be modified</span>
      </div>
    </div>
  );
}
