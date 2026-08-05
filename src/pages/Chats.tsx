import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import {
  MessageSquare,
  Send,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Tag,
  User,
  Plus,
} from 'lucide-react';
import { getAllConversations } from '../data/selectors';
import { ChatConversation, ChatMessage } from '../types';
import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../lib/utils';

const channelConfig: Record<ChatConversation['channel'], { label: string; color: string; bgColor: string; icon: string }> = {
  telegram: { label: 'Telegram', color: 'text-blue-500', bgColor: 'bg-blue-100', icon: 'T' },
  whatsapp: { label: 'WhatsApp', color: 'text-green-500', bgColor: 'bg-green-100', icon: 'W' },
  vk: { label: 'VK', color: 'text-indigo-500', bgColor: 'bg-indigo-100', icon: 'V' },
};

const managers = [
  { id: '1', name: 'Настя' },
  { id: '2', name: 'Сергей' },
  { id: '3', name: 'Екатерина' },
  { id: '4', name: 'Гоша' },
  { id: '5', name: 'Поля' },
  { id: '6', name: 'Дмитрий' },
  { id: '7', name: 'Александра' },
];

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Вчера';
  } else {
    return format(date, 'd MMM', { locale: ru });
  }
}

function getMessageStatusIcon(status: ChatMessage['status']) {
  switch (status) {
    case 'sent':
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case 'read':
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
  }
}

export default function Chats() {
  const allConversations = useMemo(() => getAllConversations(), []);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(allConversations[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [dialogFilter, setDialogFilter] = useState<'all' | 'unanswered' | 'open' | 'mine'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = allConversations.filter(c => {
    if (dialogFilter === 'unanswered') return c.unread > 0;
    if (dialogFilter === 'open') return true;
    if (dialogFilter === 'mine') return c.unread > 0;
    return true;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      content: messageInput,
      sentAt: new Date(),
      isFromUs: true,
      status: 'sent',
    };

    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: messageInput,
        lastMessageTime: new Date(),
      };
    });

    setMessageInput('');
  };

  const totalUnread = allConversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Чаты</h1>
          <p className="text-muted-foreground mt-0.5">Единый центр коммуникаций</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            {totalUnread} непрочитанных
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Sidebar */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Диалоги */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardContent className="p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Диалоги</h3>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'Все', count: allConversations.length },
                  { id: 'unanswered', label: 'Неотвеченные', count: allConversations.filter(c => c.unread > 0).length },
                  { id: 'open', label: 'Открытые', count: allConversations.length },
                  { id: 'mine', label: 'Назначенные мне', count: 3 },
                ].map((filter) => (
                  <Button
                    key={filter.id}
                    variant={dialogFilter === filter.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setDialogFilter(filter.id as typeof dialogFilter)}
                  >
                    <span className="text-sm">{filter.label}</span>
                    <Badge variant="outline" className="text-xs">{filter.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Каналы */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardContent className="p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Каналы</h3>
              <div className="space-y-1">
                {[
                  { id: 'telegram', label: 'Новый Telegram', channel: 'telegram' as const },
                  { id: 'vk', label: 'ВК DK', channel: 'vk' as const },
                  { id: 'site', label: 'Чат на сайте', channel: 'telegram' as const },
                  { id: 'whatsapp', label: 'Новый WhatsApp', channel: 'whatsapp' as const },
                ].map((ch) => (
                  <Button
                    key={ch.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <span className={cn('w-5 h-5 rounded flex items-center justify-center text-xs font-bold', channelConfig[ch.channel].bgColor, channelConfig[ch.channel].color)}>
                      {channelConfig[ch.channel].icon}
                    </span>
                    <span className="text-sm truncate">{ch.label}</span>
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 gap-1">
                <Plus className="h-3 w-3" />
                Добавить канал
              </Button>
            </CardContent>
          </Card>

          {/* Сотрудники */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 flex-1">
            <CardContent className="p-3 h-full flex flex-col">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Сотрудники</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {managers.map((manager) => (
                    <Button
                      key={manager.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[8px]">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{manager.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" size="sm" className="w-full mt-2 gap-1">
                <Plus className="h-3 w-3" />
                Добавить сотрудника
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="col-span-3">
          <Card className="h-full bg-card/80 backdrop-blur-sm border-border/60">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-3 border-b border-border">
                <Input placeholder="Поиск диалогов..." className="h-8" />
              </div>
              <ScrollArea className="flex-1">
                <div className="divide-y divide-slate-100">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors',
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      )}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn('bg-gradient-to-br text-white',
                            conversation.channel === 'telegram' ? 'from-blue-500 to-blue-600' :
                            conversation.channel === 'whatsapp' ? 'from-green-500 to-green-600' :
                            'from-indigo-500 to-indigo-600'
                          )}>
                            {conversation.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn('absolute -bottom-1 -right-1 rounded-full p-0.5', channelConfig[conversation.channel].bgColor)}>
                          <span className={cn('text-[10px] font-bold', channelConfig[conversation.channel].color)}>
                            {channelConfig[conversation.channel].icon}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">{conversation.contactName}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="col-span-7 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Card className="mb-0 rounded-b-none bg-card/80 backdrop-blur-sm border-border/60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn('bg-gradient-to-br text-white',
                          selectedConversation.channel === 'telegram' ? 'from-blue-500 to-blue-600' :
                          selectedConversation.channel === 'whatsapp' ? 'from-green-500 to-green-600' :
                          'from-indigo-500 to-indigo-600'
                        )}>
                          {selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedConversation.contactName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.contactPhone} · {channelConfig[selectedConversation.channel].label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Данные контакта</SheetTitle>
                          </SheetHeader>
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-16 w-16">
                                <AvatarFallback className={cn('bg-gradient-to-br text-white text-xl',
                                  selectedConversation.channel === 'telegram' ? 'from-blue-500 to-blue-600' :
                                  selectedConversation.channel === 'whatsapp' ? 'from-green-500 to-green-600' :
                                  'from-indigo-500 to-indigo-600'
                                )}>
                                  {selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lg">{selectedConversation.contactName}</p>
                                <p className="text-sm text-muted-foreground">{selectedConversation.contactPhone}</p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium text-sm mb-2">Теги</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedConversation.tags.length > 0 ? (
                                  selectedConversation.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">Нет тегов</p>
                                )}
                                <Button variant="outline" size="sm">
                                  <Tag className="h-3 w-3 mr-1" />
                                  Добавить тег
                                </Button>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium text-sm mb-2">Внутренние заметки</h4>
                              <p className="text-sm text-muted-foreground">{selectedConversation.notes || 'Нет заметок'}</p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium text-sm mb-2">Связанный клиент</h4>
                              {selectedConversation.relatedStudent ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {selectedConversation.relatedStudent.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{selectedConversation.relatedStudent.name}</span>
                                </div>
                              ) : (
                                <Button variant="outline" size="sm">Привязать к клиенту</Button>
                              )}
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="flex-1 rounded-none mb-0 overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn('flex', message.isFromUs ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn(
                          'max-w-[70%] px-4 py-2',
                          message.isFromUs
                            ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm'
                            : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
                        )}>
                          <p className="text-sm">{message.content}</p>
                          <div className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            message.isFromUs ? 'text-blue-200' : 'text-muted-foreground'
                          )}>
                            <span className="text-xs">{format(message.sentAt, 'HH:mm')}</span>
                            {message.isFromUs && getMessageStatusIcon(message.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </Card>

              {/* Message Input */}
              <Card className="rounded-t-none bg-card/80 backdrop-blur-sm border-border/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Введите сообщение..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center bg-card/80 backdrop-blur-sm border-border/60">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Выберите диалог для начала общения</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
