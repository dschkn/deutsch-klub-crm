import { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Download,
} from 'lucide-react';
import { getAllPayments, getAllStudents } from '../data/selectors';
import { Payment } from '../types';
import { format } from 'date-fns';

const statusConfig: Record<Payment['status'], { label: string; color: string; bgColor: string }> = {
  paid: { label: 'Оплачено', color: 'text-green-700', bgColor: 'bg-green-100' },
  pending: { label: 'Ожидает', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  overdue: { label: 'Просрочено', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const methodLabels: Record<NonNullable<Payment['method']>, string> = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Банковский перевод',
  online: 'Онлайн',
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const allPayments = useMemo(() => getAllPayments(), []);
  const allStudents = useMemo(() => getAllStudents(), []);

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = allPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Оплаты</h1>
          <p className="text-muted-foreground">Учёт и управление платежами учеников</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить оплату
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить оплату</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Ученик</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выбрать ученика" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStudents.slice(0, 20).map(student => (
                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Сумма</Label>
                    <Input id="amount" type="number" placeholder="10000" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Способ оплаты</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать способ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Наличные</SelectItem>
                        <SelectItem value="card">Карта</SelectItem>
                        <SelectItem value="transfer">Банковский перевод</SelectItem>
                        <SelectItem value="online">Онлайн</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Дата оплаты</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paidDate">Дата платежа</Label>
                    <Input id="paidDate" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input id="description" placeholder="Ежемесячная оплата и т.д." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Отмена</Button>
                <Button>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего собрано</p>
                <p className="text-2xl font-bold text-green-600">€{(totalPaid / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              {allPayments.filter(p => p.status === 'paid').length} платежей
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ожидает</p>
                <p className="text-2xl font-bold text-amber-600">€{(totalPending / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-amber-600">
              {allPayments.filter(p => p.status === 'pending').length} платежей
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-2xl font-bold text-red-600">€{(totalOverdue / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-red-600">
              {allPayments.filter(p => p.status === 'overdue').length} платежей
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Собираемость</p>
                <p className="text-2xl font-bold">
                  {Math.round(totalPaid / (totalPaid + totalPending + totalOverdue) * 100)}%
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск платежей..."
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
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="paid">Оплачено</SelectItem>
            <SelectItem value="pending">Ожидает</SelectItem>
            <SelectItem value="overdue">Просрочено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Список</TabsTrigger>
          <TabsTrigger value="overdue">Только просроченные</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Дата оплаты</TableHead>
                    <TableHead>Оплачено</TableHead>
                    <TableHead>Способ</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.slice(0, 25).map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                              {payment.student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{payment.student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="font-medium">€{payment.amount}</TableCell>
                      <TableCell>{format(payment.dueDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {payment.paidDate ? format(payment.paidDate, 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {payment.method ? (
                          <Badge variant="outline">{methodLabels[payment.method]}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[payment.status].bgColor}>
                          {statusConfig[payment.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Дата оплаты</TableHead>
                    <TableHead>Дней просрочки</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayments.filter(p => p.status === 'overdue').map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.student.name}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="font-medium text-red-600">€{payment.amount}</TableCell>
                      <TableCell>{format(payment.dueDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {Math.floor((Date.now() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))} дн.
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.student.phone}</TableCell>
                      <TableCell>
                        <Button size="sm">Напомнить</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Detail Sheet */}
      {selectedPayment && (
        <Sheet open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Детали платежа</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {selectedPayment.student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPayment.student.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.student.email}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">€{selectedPayment.amount}</p>
                  <Badge className={`mt-2 ${statusConfig[selectedPayment.status].bgColor}`}>
                    {statusConfig[selectedPayment.status].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{selectedPayment.description}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{format(selectedPayment.dueDate, 'MMM d, yyyy')}</span>
                </div>
                {selectedPayment.paidDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid Date</span>
                    <span className="font-medium">{format(selectedPayment.paidDate, 'MMM d, yyyy')}</span>
                  </div>
                )}
                {selectedPayment.method && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{methodLabels[selectedPayment.method]}</span>
                  </div>
                )}
                {selectedPayment.group && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Group</span>
                    <span className="font-medium">{selectedPayment.group.name}</span>
                  </div>
                )}
              </div>

              {selectedPayment.status !== 'paid' && (
                <Button className="w-full">Mark as Paid</Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
