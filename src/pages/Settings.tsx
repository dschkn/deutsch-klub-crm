import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Smartphone,
  Save,
} from 'lucide-react';
import { useCurrentUser } from '../hooks/use-auth';

export default function Settings() {
  const { user: currentUser } = useCurrentUser();
  const [notifications, setNotifications] = useState({
    newLead: true,
    trialLesson: true,
    paymentReceived: true,
    paymentOverdue: true,
    newMessage: true,
    weeklyReport: false,
  });

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Пользователь не найден</CardTitle>
          <CardDescription>Перезагрузите приложение, чтобы восстановить демо-профиль.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">Управление аккаунтом и параметрами приложения</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="school">Школа</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Личная информация
                </CardTitle>
                <CardDescription>Обновите ваши личные данные</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Изменить фото</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, GIF или PNG. Максимум 1 МБ</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Полное имя</Label>
                    <Input id="name" defaultValue={currentUser.fullName} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser.email} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" defaultValue={currentUser.phone} />
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить изменения
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Безопасность
                </CardTitle>
                <CardDescription>Управление безопасностью аккаунта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="outline">Изменить пароль</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Настройки уведомлений
              </CardTitle>
              <CardDescription>Выберите способ получения уведомлений</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Новая заявка</p>
                    <p className="text-sm text-muted-foreground">Уведомление при добавлении новой заявки</p>
                  </div>
                  <Switch
                    checked={notifications.newLead}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newLead: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Напоминание о пробном уроке</p>
                    <p className="text-sm text-muted-foreground">Напоминание о предстоящих пробных уроках</p>
                  </div>
                  <Switch
                    checked={notifications.trialLesson}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, trialLesson: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Платёж получен</p>
                    <p className="text-sm text-muted-foreground">Уведомление при получении платежа</p>
                  </div>
                  <Switch
                    checked={notifications.paymentReceived}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReceived: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Просрочка платежа</p>
                    <p className="text-sm text-muted-foreground">Уведомление о просроченных платежах</p>
                  </div>
                  <Switch
                    checked={notifications.paymentOverdue}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentOverdue: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Новое сообщение</p>
                    <p className="text-sm text-muted-foreground">Уведомление о новых сообщениях в чате</p>
                  </div>
                  <Switch
                    checked={notifications.newMessage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newMessage: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Еженедельный отчёт</p>
                    <p className="text-sm text-muted-foreground">Еженедельная сводка по результатам</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                  />
                </div>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Языки
                </CardTitle>
                <CardDescription>Настройка доступных языков и уровней</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['Немецкий', 'Английский'].map(lang => (
                    <div key={lang} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{lang}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
                <div>
                  <Label className="mb-2 block">Предлагаемые уровни</Label>
                  <div className="flex flex-wrap gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                      <Badge key={level} variant="secondary">{level}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Конфигурация школы
                </CardTitle>
                <CardDescription>Общие настройки школы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">Название школы</Label>
                  <Input id="schoolName" defaultValue="Deutsch-Klub" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input id="address" defaultValue="Berlin, Germany" />
                </div>
                <div className="grid gap-2">
                  <Label>Валюта</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="rub">RUB (₽)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Часовой пояс</Label>
                  <Select defaultValue="europe-berlin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-berlin">Europe/Berlin (GMT+1)</SelectItem>
                      <SelectItem value="europe-moscow">Europe/Moscow (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить конфигурацию
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Каналы сообщений
                </CardTitle>
                <CardDescription>Подключение мессенджеров</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">T</span>
                    </div>
                    <div>
                      <p className="font-medium">Telegram Bot</p>
                      <p className="text-sm text-green-600">Подключён</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Активен</Badge>
                    <Button variant="outline" size="sm">Отключить</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="font-bold text-green-600">W</span>
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Business</p>
                      <p className="text-sm text-green-600">Подключён</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Активен</Badge>
                    <Button variant="outline" size="sm">Отключить</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="font-bold text-indigo-600">V</span>
                    </div>
                    <div>
                      <p className="font-medium">VK Community</p>
                      <p className="text-sm text-muted-foreground">Не подключён</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Подключить</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Платёжные шлюзы
                </CardTitle>
                <CardDescription>Настройка обработки платежей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">YooKassa</p>
                    <p className="text-sm text-green-600">Активен</p>
                  </div>
                  <Badge variant="default">Основной</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="text-muted-foreground">
                    <p className="font-medium">Добавить платёжный шлюз</p>
                    <p className="text-sm">Stripe, PayPal и другие</p>
                  </div>
                  <Button variant="outline" size="sm">Настроить</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
