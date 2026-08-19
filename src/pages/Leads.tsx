import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  User,
  Building,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { getAllLeads } from '../data/selectors';
import { Lead } from '../types';

const statusConfig: Record<Lead['status'], { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  contacted: { label: 'Contacted', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  trial_lesson: { label: 'Trial Lesson', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  interested: { label: 'Interested', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  student: { label: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  lost: { label: 'Lost', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-200' },
};

const sourceLabels: Record<Lead['source'], string> = {
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  referral: 'Referral',
  google: 'Google',
  walk_in: 'Walk-in',
  vk: 'VK',
};

export default function Leads() {
  const [leads] = useState(() => getAllLeads());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const leadsByStatus = {
    new: filteredLeads.filter(l => l.status === 'new'),
    contacted: filteredLeads.filter(l => l.status === 'contacted'),
    trial_lesson: filteredLeads.filter(l => l.status === 'trial_lesson'),
    interested: filteredLeads.filter(l => l.status === 'interested'),
    student: filteredLeads.filter(l => l.status === 'student'),
    lost: filteredLeads.filter(l => l.status === 'lost'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and convert leads to students</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Enter the details for the new lead</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+7 999 123-45-67" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="vk">VK</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(sourceLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Pipeline Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(leadsByStatus).map(([status, statusLeads]) => (
              <div key={status} className="flex-shrink-0 w-72">
                <div className={`rounded-lg border ${statusConfig[status as Lead['status']].bgColor} p-3`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`font-semibold ${statusConfig[status as Lead['status']].color}`}>
                      {statusConfig[status as Lead['status']].label}
                    </h3>
                    <Badge variant="secondary">{statusLeads.length}</Badge>
                  </div>
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <div className="space-y-2 pr-2">
                      {statusLeads.map((lead) => (
                        <Card
                          key={lead.id}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{lead.name}</p>
                                <p className="text-xs text-muted-foreground">{lead.language}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {sourceLabels[lead.source]}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={lead.assignedManager.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {lead.assignedManager.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {statusLeads.length === 0 && (
                        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                          No leads
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.slice(0, 20).map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.language}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sourceLabels[lead.source]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[lead.status].bgColor}>
                          {statusConfig[lead.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.assignedManager.avatar} />
                            <AvatarFallback className="text-xs">
                              {lead.assignedManager.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{lead.assignedManager.name.split(' ')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                            <DropdownMenuItem>Convert to Student</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                  <Badge className={statusConfig[selectedLead.status].bgColor}>
                    {statusConfig[selectedLead.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Language: {selectedLead.language}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Source: {sourceLabels[selectedLead.source]}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium text-foreground">Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedLead.notes || 'No notes'}</p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-medium text-foreground">Activity History</h4>
                <div className="space-y-3">
                  {selectedLead.activityHistory.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <div className="rounded-full bg-muted p-1.5">
                        {activity.type === 'call' && <Phone className="h-3 w-3 text-muted-foreground" />}
                        {activity.type === 'email' && <Mail className="h-3 w-3 text-muted-foreground" />}
                        {activity.type === 'meeting' && <Calendar className="h-3 w-3 text-muted-foreground" />}
                        {activity.type === 'note' && <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user.name} • {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedLead.assignedManager.avatar} />
                    <AvatarFallback>
                      {selectedLead.assignedManager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedLead.assignedManager.name}</p>
                    <p className="text-xs text-muted-foreground">Assigned Manager</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Created {new Date(selectedLead.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Convert to Student</Button>
                <Button variant="outline" className="flex-1">Schedule Call</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
