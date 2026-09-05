import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  FileUp,
  MoreHorizontal,
  Plus,
  Printer,
  Rocket,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import {
  demoAdministrators,
  demoAdminTasks,
  type DemoBoardTask,
  type DemoTaskPriority,
} from "../data/demoAdministrators";
import { importedStudents } from "../data/importedStudents";
import { realGroups, type RealGroup } from "../data/realGroups";
import { cn } from "../lib/utils";
import type { Student } from "../types";

const GROUPS_KEY = "dk-groups-workspace-v2";
const TASKS_KEY = "dk-admin-kanban-v1";
const STARTED_GROUPS_KEY = "dk-started-groups-v1";
const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const taskPresets = [
  "Тык на прод группы",
  "Набирать группу",
  "Письмо о продолжении",
  "Опросник",
];
type StudentState = "Учится" | "Думает" | "Ожидает" | "Закончил" | "Отказался";
type PayMark = "half" | "paid" | "trial" | "studying";
type GroupComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};
type Workspace = {
  rosters: Record<string, string[]>;
  paymentMarks: Record<string, PayMark[]>;
  studentStates: Record<string, StudentState>;
  customStudents: Student[];
  groupDrafts: Record<string, Partial<RealGroup>>;
  groupComments: Record<string, GroupComment[]>;
  customGroups: RealGroup[];
  groupLinks: Record<string, { previousId?: string; nextId?: string }>;
};

const emptyWorkspace: Workspace = {
  rosters: Object.fromEntries(
    realGroups.map((group) => [group.id, group.studentIds]),
  ),
  paymentMarks: {},
  studentStates: {},
  customStudents: [],
  groupDrafts: {},
  groupComments: Object.fromEntries(
    realGroups.map((group) => [
      group.id,
      [
        {
          id: `${group.id}-comment-1`,
          text: "Курс идёт по плану. Следующая проверка набора — в конце недели.",
          author: "Администратор",
          createdAt: new Date().toISOString(),
        },
        {
          id: `${group.id}-comment-2`,
          text: "Проверить оплаты перед подтверждением старта.",
          author: "Демо-директор",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    ]),
  ),
  customGroups: [],
  groupLinks: {},
};

function loadWorkspace(): Workspace {
  try {
    return {
      ...emptyWorkspace,
      ...JSON.parse(localStorage.getItem(GROUPS_KEY) || "{}"),
    };
  } catch {
    return emptyWorkspace;
  }
}

function loadBoard(): DemoBoardTask[] {
  try {
    const value = JSON.parse(localStorage.getItem(TASKS_KEY) || "null");
    return Array.isArray(value) ? value : demoAdminTasks;
  } catch {
    return demoAdminTasks;
  }
}

function paymentBadges(marks: PayMark[]) {
  const config: Record<PayMark, [string, string]> = {
    studying: ["Учится", "bg-lime-500 text-white"],
    half: ["1/2 оплачено", "bg-fuchsia-500 text-white"],
    paid: ["Оплачено", "bg-yellow-300 text-yellow-950"],
    trial: ["Пробное занятие", "bg-orange-400 text-white"],
  };
  if (!marks.length) {
    return (
      <>
        <Badge className="border-0 bg-lime-200 text-[10px] text-lime-900">Не учится</Badge>
        <Badge className="border-0 bg-red-500 text-[10px] text-white">Не оплачено</Badge>
      </>
    );
  }
  return marks.map((mark) => (
    <Badge
      key={mark}
      className={cn("border-0 text-[10px] hover:opacity-90", config[mark][1])}
    >
      {config[mark][0]}
    </Badge>
  ));
}

const courseTypeLabels: Record<string, string> = {
  mini: "МИНИ",
  intensive: "ИНТЕНСИВ",
  club: "КЛУБ",
  grammar: "ГРАММАТИКА",
  phonetics: "PHONETIK",
};

function groupFormat(group: Pick<RealGroup, "schedule">) {
  const schedule = group.schedule || [];
  const hasOnline = schedule.some((item) => Boolean(item.zoomRoom));
  const hasOffline = schedule.some((item) => Boolean(item.classroom));
  if (hasOnline && hasOffline) return "ОН/ОФ";
  return hasOnline ? "ОН" : "ОФ";
}

function groupTitle(group: RealGroup, paid: number, total: number) {
  const language = group.language === "German" ? "Нем" : "Анг";
  const courseType = courseTypeLabels[group.courseType];
  const dateRange = `${format(new Date(group.startDate), "dd.MM")}-${format(new Date(group.endDate), "dd.MM")}`;
  const days = group.schedule
    .map((item) => dayNames[item.dayOfWeek].toUpperCase())
    .join("/");
  const code = group.code.replace("26-", "");
  const originalMiddle =
    group.name.match(/[ABC]\d(?:\.[\d.]+)?\s+(.+?)\s+\d{2}\.\d{2}/i)?.[1] || "";
  return [language, courseType, group.level, originalMiddle, dateRange, days, code, groupFormat(group)]
    .filter(Boolean)
    .join(" ") + ` | ${paid}/${total}`;
}

function nextCourseLevel(level: string) {
  const parts = level.split(".");
  const last = Number(parts[parts.length - 1]);
  if (parts.length > 1 && Number.isFinite(last)) {
    parts[parts.length - 1] = String(last + 1);
    return parts.join(".");
  }
  const match = level.match(/^([ABC])(\d)$/i);
  if (!match) return level;
  const step = Number(match[2]);
  return step < 2
    ? `${match[1].toUpperCase()}${step + 1}`
    : `${String.fromCharCode(match[1].toUpperCase().charCodeAt(0) + 1)}1`;
}

function continuationRange(group: RealGroup) {
  const schedule = group.schedule.length
    ? group.schedule
    : [{ dayOfWeek: new Date(group.endDate).getDay(), startTime: "19:00", endTime: "20:30" }];
  const cursor = new Date(group.endDate);
  cursor.setHours(12, 0, 0, 0);
  let accumulatedHours = 0;
  let startDate: Date | null = null;
  let endDate = new Date(cursor);
  for (let offset = 1; offset <= 370 && accumulatedHours < group.hours; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + offset);
    const lessons = schedule.filter((item) => item.dayOfWeek === date.getDay());
    lessons.forEach((lesson) => {
      if (!startDate) startDate = new Date(date);
      const [startHour, startMinute] = lesson.startTime.split(":").map(Number);
      const [endHour, endMinute] = lesson.endTime.split(":").map(Number);
      accumulatedHours += ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 45;
      endDate = new Date(date);
    });
  }
  return { startDate: startDate || new Date(cursor), endDate };
}

export default function Groups() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<RealGroup["status"]>("active");
  const [selectedId, setSelectedId] = useState(
    realGroups.find((group) => group.status === "active")?.id ||
      realGroups[0]?.id,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editTab, setEditTab] = useState("data");
  const [editDraft, setEditDraft] = useState<Partial<RealGroup>>({});
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "medium" as DemoTaskPriority,
    assigneeId: "unassigned",
  });
  const [studentOpen, setStudentOpen] = useState(false);
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);
  const [startGroupOpen, setStartGroupOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [startGroupForm, setStartGroupForm] = useState({
    teacherMessage: "",
    teacherEmail: "",
  });
  const [startEmailError, setStartEmailError] = useState("");
  const [startSummary, setStartSummary] = useState<{
    startedGroup: string;
    continuationGroup: string;
    teacher: string;
    email: string;
    students: string[];
  } | null>(null);
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    email: "",
    address: "",
    birthDate: "",
    profession: "",
    activity: "",
    leadStatus: "waiting",
    source: "",
    language: "German",
    level: "A1",
    loyal: false,
    isStudent: false,
    friend: false,
    social: false,
    comment: "",
    parent: "",
    organization: "",
    preferredDays: [] as string[],
    preferredTime: "",
  });

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    setCommentDraft("");
    setEditingCommentId(null);
  }, [selectedId]);
  const students = useMemo(
    () => [...importedStudents, ...workspace.customStudents],
    [workspace.customStudents],
  );
  const studentMap = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students],
  );
  const groups = useMemo(
    () =>
      [...realGroups, ...(workspace.customGroups || [])].map((group) => ({
        ...group,
        ...workspace.groupDrafts[group.id],
        studentIds: workspace.rosters[group.id] ?? group.studentIds,
      })),
    [workspace],
  );
  const selected = groups.find((group) => group.id === selectedId) || null;
  const visibleGroups = groups.filter(
    (group) =>
      group.status === statusTab &&
      `${group.name} ${group.teacherName} ${group.code}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const roster = selected
    ? (selected.studentIds
        .map((id) => studentMap.get(id))
        .filter(Boolean) as Student[])
    : [];

  const getPaymentCount = (group: RealGroup) =>
    group.studentIds.reduce((count, studentId) => {
      const marks = workspace.paymentMarks[`${group.id}:${studentId}`];
      const student = studentMap.get(studentId);
      return count + (marks ? Number(marks.includes("paid")) : Number(student?.paymentStatus === "paid"));
    }, 0);

  const getGroupTitle = (group: RealGroup) =>
    groupTitle(group, getPaymentCount(group), group.studentIds.length);

  const selectedComments = selected
    ? workspace.groupComments[selected.id] || []
    : [];

  const submitComment = () => {
    if (!selected || !commentDraft.trim()) return;
    const text = commentDraft.trim();
    setWorkspace((current) => {
      const comments = current.groupComments[selected.id] || [];
      return {
        ...current,
        groupComments: {
          ...current.groupComments,
          [selected.id]: editingCommentId
            ? comments.map((comment) =>
                comment.id === editingCommentId
                  ? { ...comment, text }
                  : comment,
              )
            : [
                {
                  id: `group-comment-${Date.now()}`,
                  text,
                  author: "Пользователь",
                  createdAt: new Date().toISOString(),
                },
                ...comments,
              ],
        },
      };
    });
    toast.success(editingCommentId ? "Комментарий обновлён" : "Комментарий добавлен");
    setCommentDraft("");
    setEditingCommentId(null);
  };

  const editComment = (comment: GroupComment) => {
    setEditingCommentId(comment.id);
    setCommentDraft(comment.text);
  };

  const openStartGroup = () => {
    if (!selected) return;
    const schedule = selected.schedule
      .map(
        (item) =>
          `${dayNames[item.dayOfWeek]} ${item.startTime}-${item.endTime}`,
      )
      .join(", ");
    setStartGroupForm({
      teacherMessage: `Здравствуйте!\n\nГруппа ${getGroupTitle(selected)} стартует ${format(new Date(selected.startDate), "dd.MM.yyyy")}.\nУровень: ${selected.level}.\nРасписание: ${schedule}.\nКоличество человек: ${selected.studentIds.length}.\n\nПожалуйста, подтвердите получение информации.`,
      teacherEmail: "",
    });
    setStartEmailError("");
    setStartGroupOpen(true);
  };

  const startGroup = () => {
    if (!selected) return;
    if (!startGroupForm.teacherEmail.includes("@")) {
      setStartEmailError("Укажите корректный e-mail: адрес должен содержать @");
      return;
    }

    const existingNextId = workspace.groupLinks[selected.id]?.nextId;
    const existingContinuation = existingNextId
      ? groups.find((group) => group.id === existingNextId)
      : undefined;
    const nextLevel = nextCourseLevel(selected.level);
    const { startDate, endDate } = continuationRange(selected);
    const newCode = String(7000 + (Date.now() % 2000));
    const continuationId = existingContinuation?.id || `continuation-${Date.now()}`;
    const originalMiddle =
      selected.name.match(/[ABC]\d(?:\.[\d.]+)?\s+(.+?)\s+\d{2}\.\d{2}/i)?.[1] || "";
    const continuation: RealGroup = existingContinuation || {
      ...selected,
      id: continuationId,
      code: newCode,
      name: `${selected.language === "German" ? "Нем" : "Анг"} ${courseTypeLabels[selected.courseType] || ""} ${nextLevel} ${originalMiddle} ${format(startDate, "dd.MM")}-${format(endDate, "dd.MM")}`.replace(/\s+/g, " ").trim(),
      level: nextLevel,
      startDate,
      endDate,
      studentIds: [...selected.studentIds],
      status: "planned",
    };

    setWorkspace((current) => {
      const emptyContinuationMarks = Object.fromEntries(
        selected.studentIds.map((studentId) => [
          `${continuationId}:${studentId}`,
          [] as PayMark[],
        ]),
      );
      return {
        ...current,
        customGroups: existingContinuation
          ? current.customGroups
          : [...(current.customGroups || []), continuation],
        groupDrafts: {
          ...current.groupDrafts,
          [selected.id]: { ...current.groupDrafts[selected.id], status: "active" },
        },
        rosters: {
          ...current.rosters,
          [continuationId]: [...selected.studentIds],
        },
        paymentMarks: {
          ...current.paymentMarks,
          ...emptyContinuationMarks,
        },
        groupLinks: {
          ...current.groupLinks,
          [selected.id]: {
            ...current.groupLinks[selected.id],
            nextId: continuationId,
          },
          [continuationId]: {
            ...current.groupLinks[continuationId],
            previousId: selected.id,
          },
        },
      };
    });

    const startedGroups = JSON.parse(localStorage.getItem(STARTED_GROUPS_KEY) || "{}");
    localStorage.setItem(
      STARTED_GROUPS_KEY,
      JSON.stringify({
        ...startedGroups,
        [selected.id]: {
          startedAt: new Date().toISOString(),
          firstLessonDate: format(new Date(selected.startDate), "yyyy-MM-dd"),
          format: groupFormat(selected) === "ОН" ? "online" : "offline",
        },
      }),
    );

    const outbox = JSON.parse(localStorage.getItem("dk-teacher-mail-outbox-v1") || "[]");
    localStorage.setItem(
      "dk-teacher-mail-outbox-v1",
      JSON.stringify([
        {
          id: `teacher-mail-${Date.now()}`,
          groupId: selected.id,
          to: startGroupForm.teacherEmail,
          message: startGroupForm.teacherMessage,
          attachment: "group-students-and-lessons.pdf",
          status: "prepared",
          createdAt: new Date().toISOString(),
        },
        ...outbox,
      ]),
    );

    setStartGroupOpen(false);
    setStartSummary({
      startedGroup: getGroupTitle(selected),
      continuationGroup: groupTitle(continuation, 0, continuation.studentIds.length),
      teacher: selected.teacherName,
      email: startGroupForm.teacherEmail,
      students: roster.map((student) => student.name),
    });
  };

  const openEdit = () => {
    if (!selected) return;
    setEditDraft({ ...selected });
    setEditTab("data");
    setEditOpen(true);
  };
  const saveGroup = () => {
    if (!selected) return;
    setWorkspace((current) => ({
      ...current,
      groupDrafts: { ...current.groupDrafts, [selected.id]: editDraft },
    }));
    setEditOpen(false);
    toast.success("Группа обновлена", {
      description: "Изменения доступны во всех представлениях группы.",
    });
  };
  const openTask = (preset = "", student?: Student) => {
    const title =
      preset || (student ? `Задача по студенту: ${student.name}` : "");
    setTaskDraft({
      title,
      description: `${selected ? `Группа ${selected.name} (#${selected.code})` : ""}${student ? `\nСтудент: ${student.name}` : ""}`,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      priority: "medium",
      assigneeId: "unassigned",
    });
    setTaskOpen(true);
  };
  const saveTask = () => {
    if (!taskDraft.title.trim()) return;
    const tasks = loadBoard();
    const task: DemoBoardTask = {
      id: `group-task-${Date.now()}`,
      title: taskDraft.title.trim(),
      description: taskDraft.description.trim(),
      assigneeId:
        taskDraft.assigneeId === "unassigned" ? null : taskDraft.assigneeId,
      dueDate: taskDraft.dueDate,
      priority: taskDraft.priority,
      status: taskDraft.assigneeId === "unassigned" ? "new" : "in_progress",
      tags: selected ? [`Группа #${selected.code}`] : [],
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TASKS_KEY, JSON.stringify([task, ...tasks]));
    setTaskOpen(false);
    toast.success("Задача добавлена", {
      description: task.assigneeId
        ? "Она появилась в колонке администратора."
        : "Она появилась в «Неразобранном».",
    });
  };
  const addStudent = () => {
    if (
      !selected ||
      !studentForm.firstName.trim() ||
      !studentForm.lastName.trim()
    )
      return;
    const id = `student-custom-${Date.now()}`;
    const student: Student = {
      id,
      name: `${studentForm.lastName.trim()} ${studentForm.firstName.trim()}`,
      phone: studentForm.phone,
      email: studentForm.email,
      currentLevel: studentForm.level as Student["currentLevel"],
      language: studentForm.language as Student["language"],
      status: "active",
      paymentStatus: "pending",
      joinDate: new Date(),
      balance: 0,
      notes: studentForm.comment,
      profession: studentForm.profession,
      howDidYouKnow: studentForm.source,
      discounts: [
        studentForm.loyal && "Лояльный клиент",
        studentForm.isStudent && "Студент",
        studentForm.friend && "Приведи друга",
        studentForm.social && "Социальная скидка",
      ]
        .filter(Boolean)
        .join(", "),
      days: [],
      times: [],
      format: "online",
      isFriendForFriend: studentForm.friend,
      germanLevel:
        studentForm.language === "German"
          ? (studentForm.level as Student["currentLevel"])
          : undefined,
      englishLevel:
        studentForm.language === "English"
          ? (studentForm.level as Student["currentLevel"])
          : undefined,
      communications: [],
    };
    setWorkspace((current) => ({
      ...current,
      customStudents: [...current.customStudents, student],
      rosters: {
        ...current.rosters,
        [selected.id]: [...(current.rosters[selected.id] || []), id],
      },
      paymentMarks: {
        ...current.paymentMarks,
        [`${selected.id}:${id}`]: ["studying"],
      },
    }));
    setStudentOpen(false);
    toast.success("Студент добавлен в группу");
  };
  const removeStudent = (studentId: string) => {
    if (!selected) return;
    setWorkspace((current) => ({
      ...current,
      rosters: {
        ...current.rosters,
        [selected.id]: (current.rosters[selected.id] || []).filter(
          (id) => id !== studentId,
        ),
      },
    }));
    toast.success("Студент удалён из группы", {
      description:
        "Его профиль сохранён и остаётся доступен через общий поиск.",
    });
  };
  const toggleMark = (studentId: string, mark: PayMark) => {
    if (!selected) return;
    const key = `${selected.id}:${studentId}`;
    setWorkspace((current) => {
      const marks = current.paymentMarks[key] || ["studying"];
      return {
        ...current,
        paymentMarks: {
          ...current.paymentMarks,
          [key]: marks.includes(mark)
            ? marks.filter((item) => item !== mark)
            : [...marks, mark],
        },
      };
    });
    toast.success("Статус студента обновлён");
  };

  const printGroup = (documentType: "attendance" | "list") => {
    if (!selected) return;
    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const lessonDates = Array.from({ length: 5 }, (_, index) => {
      const date = new Date(selected.startDate);
      date.setDate(date.getDate() + index * 7);
      return format(date, "dd.MM");
    });
    const title = `💡${escapeHtml(getGroupTitle(selected))}`;
    const studentRows = roster
      .map(
        (student, index) =>
          `<tr><td>${index + 1}</td><td>${escapeHtml(student.name)}</td>${
            documentType === "attendance"
              ? `<td>${escapeHtml(student.email)}</td>${lessonDates.map(() => "<td></td>").join("")}${Array.from({ length: 7 }, () => "<td></td>").join("")}`
              : "<td></td><td></td><td></td><td></td>"
          }</tr>`,
      )
      .join("");
    const headers =
      documentType === "attendance"
        ? `<tr><th rowspan="2">#</th><th rowspan="2">Фамилия Имя</th><th rowspan="2">Email</th>${lessonDates.map((_, index) => `<th>${index + 1}</th>`).join("")}<th colspan="7"></th></tr><tr>${lessonDates.map((date) => `<th>${date}</th>`).join("")}${Array.from({ length: 7 }, (_, index) => `<th>${index + 1}</th>`).join("")}</tr>`
        : '<tr><th>#</th><th>Фамилия Имя</th><th>Договор №</th><th>ООО / ИП</th><th>Наш экземпляр сдан</th><th>Данные в базе</th></tr>';
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Браузер заблокировал окно печати");
      return;
    }
    printWindow.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:${documentType === "attendance" ? "A4 landscape" : "A4 portrait"};margin:15mm 12mm 12mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#252a2f}h1{margin:0 0 5mm;text-align:center;font-size:18px;line-height:26px}table{width:100%;border-collapse:collapse;font-size:14px;break-inside:auto}tr{break-inside:avoid}th,td{height:30px;border:1px solid #d5d5d5;padding:4px 6px;text-align:left}th{font-weight:700;text-align:center}${documentType === "attendance" ? "th:nth-child(n+4),td:nth-child(n+4){width:5%;text-align:center}" : ""}</style></head><body><h1>${title}</h1><table><thead>${headers}</thead><tbody>${studentRows}</tbody></table><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="h-[calc(100vh-4.5rem)]">
      <Tabs
        value={statusTab}
        onValueChange={(value) => setStatusTab(value as RealGroup["status"])}
        className="flex h-full flex-col"
      >
        <div className="flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="active">Текущие</TabsTrigger>
            <TabsTrigger value="planned">Грядущие</TabsTrigger>
            <TabsTrigger value="completed">Архивные</TabsTrigger>
          </TabsList>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск группы…"
              className="h-9 pl-9"
            />
          </div>
          <Button size="sm" className="ml-auto h-8 gap-1.5 px-3 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Добавить группу
          </Button>
        </div>
        <TabsContent value={statusTab} className="mt-3 min-h-0 flex-1">
          <div className="flex h-full gap-4">
            <Card className="w-80 shrink-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {visibleGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedId(group.id)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition",
                        selectedId === group.id
                          ? "border-teal-200 bg-teal-50"
                          : "border-transparent hover:bg-muted",
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {getGroupTitle(group)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{group.code.replace("26-", "")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.language === "German" ? "DE" : "EN"} ·{" "}
                        {group.level} · {group.teacherName}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {getPaymentCount(group)}/{group.studentIds.length}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
            <Card className="min-w-0 flex-1 overflow-hidden">
              {selected ? (
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-5">
                    <div className="border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold">
                            {getGroupTitle(selected)}
                          </h2>
                          <Badge variant="outline">
                            #{selected.code.replace("26-", "")}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selected.language === "German"
                            ? "Немецкий"
                            : "Английский"}{" "}
                          · {selected.level} · {selected.teacherName}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 bg-[#df7b6c] px-3 text-xs hover:bg-[#ce695a]"
                          onClick={openStartGroup}
                        >
                          <Rocket className="h-3.5 w-3.5" />
                          Стартовать группу
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
                              <Plus className="h-3.5 w-3.5" />
                              Добавить задачу
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openTask()}>
                              Частная задача…
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {taskPresets.map((item) => (
                              <DropdownMenuItem
                                key={item}
                                onSelect={() => openTask(item)}
                              >
                                {item}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 px-3 text-xs"
                          onClick={() => setStudentOpen(true)}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Добавить студента
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 px-3 text-xs"
                          onClick={openEdit}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Редактирование группы
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-xs">
                              <Printer className="h-3.5 w-3.5" />
                              Печать
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => printGroup("attendance")}>
                              Журнал посещений
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => printGroup("list")}>
                              Список группы
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="grid gap-5 pb-4 lg:grid-cols-2">
                      <dl className="grid grid-cols-[130px_minmax(0,1fr)] content-start gap-x-5 gap-y-2 text-sm">
                        {[
                          ["Номер группы", selected.code],
                          ["Язык", selected.language === "German" ? "Немецкий" : "Английский"],
                          ["Уровень", selected.level],
                          ["Тип курса", selected.courseType],
                          ["Объём курса", `${selected.hours} ак. ч.`],
                          ["Стоимость", `${selected.price.toLocaleString()} ₽`],
                          ["Учитель", selected.teacherName],
                          ["Учебник", selected.textbook || "—"],
                          ["Дата начала", format(new Date(selected.startDate), "dd.MM.yyyy")],
                          ["Дата окончания", format(new Date(selected.endDate), "dd.MM.yyyy")],
                          ["Дни занятий", selected.schedule.map((item) => dayNames[item.dayOfWeek]).join(", ") || "—"],
                          ["Время", selected.schedule.map((item) => `${item.startTime}–${item.endTime}`).join(", ") || "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="contents">
                            <dt className="text-right font-semibold text-muted-foreground">{label}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <section className="flex min-h-[265px] flex-col border-l pl-5">
                        <h3 className="mb-3 font-semibold">Комментарии группы</h3>
                        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto border-y py-2 text-sm">
                          {selectedComments.map((comment) => (
                            <button
                              key={comment.id}
                              type="button"
                              onClick={() => editComment(comment)}
                              className={cn(
                                "w-full border-b px-1 py-2 text-left transition-colors last:border-0 hover:bg-muted/60",
                                editingCommentId === comment.id &&
                                  "bg-teal-50 ring-1 ring-inset ring-teal-200",
                              )}
                            >
                              <p>{comment.text}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {comment.author} · {format(new Date(comment.createdAt), "dd.MM.yyyy HH:mm")}
                              </p>
                            </button>
                          ))}
                        </div>
                        <Textarea
                          className="mt-3 min-h-20"
                          placeholder="Новый комментарий…"
                          value={commentDraft}
                          onChange={(event) => setCommentDraft(event.target.value)}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="sm" onClick={submitComment}>
                            {editingCommentId ? "Обновить" : "Отправить"}
                          </Button>
                          {editingCommentId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCommentId(null);
                                setCommentDraft("");
                              }}
                            >
                              Отмена
                            </Button>
                          )}
                        </div>
                      </section>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!workspace.groupLinks[selected.id]?.previousId}
                        onClick={() => {
                          const previousId = workspace.groupLinks[selected.id]?.previousId;
                          if (previousId) setSelectedId(previousId);
                        }}
                        className="gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Предыдущая группа
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!workspace.groupLinks[selected.id]?.nextId}
                        onClick={() => {
                          const nextId = workspace.groupLinks[selected.id]?.nextId;
                          if (nextId) setSelectedId(nextId);
                        }}
                        className="gap-1.5"
                      >
                        Группа продолжения
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">
                          Студенты группы ({roster.length})
                        </h3>
                        <Badge variant="outline">
                          Мест:{" "}
                          {Math.max(0, selected.maxStudents - roster.length)}
                        </Badge>
                      </div>
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Студент</TableHead>
                              <TableHead>Контакты</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead className="w-28 text-right">
                                Действия
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {roster.length ? (
                              roster.map((student) => {
                                const marks = workspace.paymentMarks[
                                  `${selected.id}:${student.id}`
                                ] || ["studying"];
                                return (
                                  <TableRow key={student.id}>
                                    <TableCell>
                                      <button
                                        onClick={() =>
                                          setStudentProfileId(student.id)
                                        }
                                        className="text-left font-medium text-teal-700 hover:underline"
                                      >
                                        {student.name}
                                      </button>
                                      <p className="text-xs text-muted-foreground">
                                        {student.currentLevel}
                                      </p>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <p>{student.phone}</p>
                                      <p className="text-muted-foreground">
                                        {student.email}
                                      </p>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {paymentBadges(marks)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-end gap-1">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              size="icon"
                                              variant="outline"
                                              className="h-8 w-8"
                                            >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            {(
                                              [
                                                ["half", "1/2 оплачен"],
                                                ["paid", "Оплачен"],
                                                ["trial", "Пробное занятие"],
                                                ["studying", "Учится"],
                                              ] as [PayMark, string][]
                                            ).map(([mark, label]) => (
                                              <DropdownMenuCheckboxItem
                                                key={mark}
                                                checked={marks.includes(mark)}
                                                onCheckedChange={() =>
                                                  toggleMark(student.id, mark)
                                                }
                                              >
                                                {label}
                                              </DropdownMenuCheckboxItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8 text-red-600"
                                          onClick={() =>
                                            removeStudent(student.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="py-10 text-center text-muted-foreground"
                                >
                                  В группе пока нет студентов
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Выберите группу
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={startGroupOpen} onOpenChange={setStartGroupOpen}>
        <DialogContent className="flex h-[78vh] max-w-5xl flex-col gap-0 p-0">
          <DialogHeader className="border-b px-8 py-7">
            <DialogTitle className="text-center text-xl">
              Старт группы {selected ? getGroupTitle(selected) : ""}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Сообщение и контактные данные преподавателя перед стартом группы
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-0 px-8 py-4">
              <div className="mb-4 max-w-xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader><TableRow><TableHead>Студент</TableHead><TableHead>Статус</TableHead><TableHead>Контакты</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {roster.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-teal-700">{student.name}</TableCell>
                        <TableCell><div className="flex gap-1">{paymentBadges(workspace.paymentMarks[`${selected?.id}:${student.id}`] || ["studying"])}</div></TableCell>
                        <TableCell className="text-xs"><p>{student.phone}</p><p className="text-muted-foreground">{student.email}</p></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-b py-4">
                <Label className="pt-2 text-sm font-semibold text-muted-foreground">
                  Сообщение преподавателю
                </Label>
                <Textarea
                  className="min-h-[145px] resize-y"
                  value={startGroupForm.teacherMessage}
                  onChange={(event) =>
                    setStartGroupForm((current) => ({
                      ...current,
                      teacherMessage: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-b py-6">
                <Label className="pt-2 text-sm font-semibold text-muted-foreground">
                  E-mail преподавателя
                </Label>
                <Input
                  type="email"
                  aria-invalid={Boolean(startEmailError)}
                  className={cn(startEmailError && "border-red-500 focus-visible:ring-red-500")}
                  value={startGroupForm.teacherEmail}
                  onChange={(event) => {
                    setStartEmailError("");
                    setStartGroupForm((current) => ({
                      ...current,
                      teacherEmail: event.target.value,
                    }));
                  }}
                />
                {startEmailError && (
                  <p className="col-start-2 text-xs text-red-600">{startEmailError}</p>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <Button variant="outline" onClick={() => setStartGroupOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-[#df7b6c] hover:bg-[#ce695a]"
              onClick={startGroup}
            >
              Стартовать группу!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(startSummary)} onOpenChange={(open) => !open && setStartSummary(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Группа стартована</DialogTitle>
            <DialogDescription>
              Операция завершена, связанные данные подготовлены.
            </DialogDescription>
          </DialogHeader>
          {startSummary && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/30 p-4">
                <dl className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-2">
                  <dt className="text-muted-foreground">Стартовала группа</dt><dd className="font-medium">{startSummary.startedGroup}</dd>
                  <dt className="text-muted-foreground">Создано продолжение</dt><dd className="font-medium">{startSummary.continuationGroup}</dd>
                  <dt className="text-muted-foreground">Преподаватель</dt><dd>{startSummary.teacher}</dd>
                  <dt className="text-muted-foreground">E-mail</dt><dd>{startSummary.email}</dd>
                  <dt className="text-muted-foreground">Письмо и PDF</dt><dd>Подготовлены к отправке</dd>
                  <dt className="text-muted-foreground">Расписание</dt><dd>Занятия проверены и статусы обновлены</dd>
                </dl>
              </div>
              <div>
                <p className="mb-2 font-semibold">Студенты ({startSummary.students.length})</p>
                <p className="text-muted-foreground">{startSummary.students.join(", ") || "В группе нет студентов"}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setStartSummary(null)}>ОК</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex max-h-[94vh] max-w-6xl flex-col p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">
              Редактирование группы
            </DialogTitle>
            <DialogDescription className="sr-only">
              Редактирование данных и занятий группы
            </DialogDescription>
          </DialogHeader>
          <Tabs
            value={editTab}
            onValueChange={setEditTab}
            className="min-h-0 flex-1"
          >
            <TabsList className="mx-6 grid w-[520px] grid-cols-3">
              <TabsTrigger value="data">Данные группы</TabsTrigger>
              <TabsTrigger value="days">Дни занятий</TabsTrigger>
              <TabsTrigger value="lessons">Занятия</TabsTrigger>
            </TabsList>
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] border-t">
              <ScrollArea className="h-[70vh] border-r">
                <div className="p-6">
                  <TabsContent value="data" className="m-0 space-y-0">
                    <ReferenceField label="Номер группы">
                      <Input
                        value={String(editDraft.code || "").replace("26-", "")}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            code: e.target.value,
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Дата начала">
                      <Input
                        type="date"
                        value={
                          editDraft.startDate
                            ? format(
                                new Date(editDraft.startDate),
                                "yyyy-MM-dd",
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            startDate: new Date(`${e.target.value}T12:00:00`),
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Дата окончания">
                      <Input
                        type="date"
                        value={
                          editDraft.endDate
                            ? format(new Date(editDraft.endDate), "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            endDate: new Date(`${e.target.value}T12:00:00`),
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Объём курса">
                      <Input
                        type="number"
                        value={editDraft.hours || 0}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            hours: Number(e.target.value),
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Стоимость">
                      <Input
                        type="number"
                        value={editDraft.price || 0}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            price: Number(e.target.value),
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Язык">
                      <Select
                        value={editDraft.language}
                        onValueChange={(value) =>
                          setEditDraft((current) => ({
                            ...current,
                            language: value as RealGroup["language"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="German">Немецкий</SelectItem>
                          <SelectItem value="English">Английский</SelectItem>
                        </SelectContent>
                      </Select>
                    </ReferenceField>
                    <ReferenceField label="Тип курса">
                      <Select
                        value={editDraft.courseType}
                        onValueChange={(value) =>
                          setEditDraft((current) => ({
                            ...current,
                            courseType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "group",
                            "intensive",
                            "mini",
                            "club",
                            "grammar",
                            "phonetics",
                          ].map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ReferenceField>
                    <ReferenceField label="Уровень">
                      <Input
                        value={editDraft.level || ""}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            level: e.target.value,
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Учитель">
                      <Input
                        value={editDraft.teacherName || ""}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            teacherName: e.target.value,
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Учебник">
                      <Input
                        value={editDraft.textbook || ""}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            textbook: e.target.value,
                          }))
                        }
                      />
                    </ReferenceField>
                    <ReferenceField label="Формат">
                      <Select
                        value={groupFormat(editDraft as RealGroup)}
                        onValueChange={(value) =>
                          setEditDraft((current) => ({
                            ...current,
                            schedule: (current.schedule || []).map((item) =>
                              value === "ОН"
                                ? {
                                    ...item,
                                    classroom: undefined,
                                    zoomRoom: item.zoomRoom || "Онлайн",
                                  }
                                : {
                                    ...item,
                                    zoomRoom: undefined,
                                    classroom: item.classroom || "Офлайн",
                                  },
                            ),
                          }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ОФ">Офлайн</SelectItem>
                          <SelectItem value="ОН">Онлайн</SelectItem>
                        </SelectContent>
                      </Select>
                    </ReferenceField>
                    <ReferenceField label="Максимум студентов">
                      <Input
                        type="number"
                        value={editDraft.maxStudents || 0}
                        onChange={(e) =>
                          setEditDraft((current) => ({
                            ...current,
                            maxStudents: Number(e.target.value),
                          }))
                        }
                      />
                    </ReferenceField>
                  </TabsContent>
                  <TabsContent value="days" className="m-0 space-y-0">
                    <h3 className="pb-3 text-base font-semibold">
                      Выберите дни занятий группы
                    </h3>
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                      const item = (editDraft.schedule || []).find(
                        (entry) => entry.dayOfWeek === day,
                      );
                      return (
                        <div key={day} className="border-b py-4 last:border-0">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={Boolean(item)}
                              onCheckedChange={(checked) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  schedule: checked
                                    ? [
                                        ...(current.schedule || []),
                                        {
                                          dayOfWeek: day,
                                          startTime: "19:00",
                                          endTime: "20:30",
                                          classroom: "Офлайн",
                                        },
                                      ].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                                    : (current.schedule || []).filter(
                                        (entry) => entry.dayOfWeek !== day,
                                      ),
                                }))
                              }
                            />
                            <span className="font-medium">
                              {
                                [
                                  "Воскресенье",
                                  "Понедельник",
                                  "Вторник",
                                  "Среда",
                                  "Четверг",
                                  "Пятница",
                                  "Суббота",
                                ][day]
                              }
                            </span>
                          </div>
                          {item && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                              <Input
                                type="time"
                                value={item.startTime}
                                onChange={(e) =>
                                  setEditDraft((current) => ({
                                    ...current,
                                    schedule: (current.schedule || []).map((entry) =>
                                      entry.dayOfWeek === day
                                        ? { ...entry, startTime: e.target.value }
                                        : entry,
                                    ),
                                  }))
                                }
                              />
                              <Select defaultValue="3">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2 ак. ч.</SelectItem>
                                  <SelectItem value="3">3 ак. ч.</SelectItem>
                                  <SelectItem value="4">4 ак. ч.</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="time"
                                value={item.endTime}
                                onChange={(e) =>
                                  setEditDraft((current) => ({
                                    ...current,
                                    schedule: (current.schedule || []).map((entry) =>
                                      entry.dayOfWeek === day
                                        ? { ...entry, endTime: e.target.value }
                                        : entry,
                                    ),
                                  }))
                                }
                              />
                              <Input
                                value={
                                  item.classroom || item.zoomRoom || "Аудитория"
                                }
                                readOnly
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>
                  <TabsContent value="lessons" className="m-0 space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <p key={i} className="text-sm font-medium">
                        {i + 1}:{" "}
                        {format(
                          new Date(
                            new Date(
                              editDraft.startDate || new Date(),
                            ).getTime() +
                              i * 3 * 86400000,
                          ),
                          "dd.MM.yyyy",
                        )}{" "}
                        {editDraft.schedule?.[
                          i % Math.max(editDraft.schedule?.length || 1, 1)
                        ]?.startTime || "19:00"}
                        -
                        {editDraft.schedule?.[
                          i % Math.max(editDraft.schedule?.length || 1, 1)
                        ]?.endTime || "20:30"}
                      </p>
                    ))}
                  </TabsContent>
                </div>
              </ScrollArea>
              <GroupEditPreview group={editDraft} />
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveGroup}>
                Обновить группу и переформатировать занятия
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавление задачи</DialogTitle>
            <DialogDescription>
              Без исполнителя задача попадёт в «Неразобранное».
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-0 py-2">
            <ReferenceField label="Название задачи">
              <Input
                value={taskDraft.title}
                onChange={(e) =>
                  setTaskDraft((current) => ({
                    ...current,
                    title: e.target.value,
                  }))
                }
              />
            </ReferenceField>
            <ReferenceField label="Текст задачи">
              <Textarea
                value={taskDraft.description}
                onChange={(e) =>
                  setTaskDraft((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
              />
            </ReferenceField>
            <ReferenceField label="Дедлайн">
              <Input
                type="date"
                value={taskDraft.dueDate}
                onChange={(e) =>
                  setTaskDraft((current) => ({
                    ...current,
                    dueDate: e.target.value,
                  }))
                }
              />
            </ReferenceField>
            <ReferenceField label="Статус">
              <Select defaultValue="new">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Создана</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="waiting">Ожидание</SelectItem>
                  <SelectItem value="completed">Завершена</SelectItem>
                </SelectContent>
              </Select>
            </ReferenceField>
            <ReferenceField label="Приоритет">
              <Select
                value={taskDraft.priority}
                onValueChange={(value) =>
                  setTaskDraft((current) => ({
                    ...current,
                    priority: value as DemoTaskPriority,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Обычный</SelectItem>
                  <SelectItem value="high">Важный</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </ReferenceField>
            <ReferenceField label="Ответственные">
              <Select
                value={taskDraft.assigneeId}
                onValueChange={(value) =>
                  setTaskDraft((current) => ({ ...current, assigneeId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Не назначен</SelectItem>
                  {demoAdministrators.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ReferenceField>
            <ReferenceField label="Связанные студенты">
              <Input placeholder="Поиск студента по имени и фамилии" />
            </ReferenceField>
            <ReferenceField label="Связанные группы">
              <Input
                value={selected ? `${selected.name} (#${selected.code})` : ""}
                readOnly
              />
            </ReferenceField>
            <ReferenceField label="Родительская задача">
              <Input placeholder="Поиск задачи по названию" />
            </ReferenceField>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setTaskOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveTask}>Добавить задачу</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
        <DialogContent className="flex max-h-[94vh] max-w-6xl flex-col p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6 text-center text-2xl">
              Добавление студента
            </DialogTitle>
            <DialogDescription>
              Студент будет сразу зачислен в группу «{selected?.name}».
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="main" className="min-h-0">
            <TabsList className="grid w-[540px] grid-cols-3 rounded-none bg-transparent px-4">
              <TabsTrigger value="main">Основная информация</TabsTrigger>
              <TabsTrigger value="languages">Языки</TabsTrigger>
              <TabsTrigger value="extra">Дополнительная информация</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[66vh] border-y px-6">
              <TabsContent value="main" className="m-0 space-y-0">
                <ReferenceField label="Фамилия">
                  <Input
                    value={studentForm.lastName}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Имя">
                  <Input
                    value={studentForm.firstName}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Отчество">
                  <Input
                    value={studentForm.middleName}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        middleName: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Номер телефона">
                  <Input
                    value={studentForm.phone}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        phone: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="E-mail">
                  <Input
                    value={studentForm.email}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Адрес">
                  <Input
                    value={studentForm.address}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        address: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Дата рождения">
                  <Input
                    type="date"
                    value={studentForm.birthDate}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        birthDate: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Комментарий">
                  <Textarea
                    value={studentForm.comment}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        comment: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Откуда узнали">
                  <Select
                    value={studentForm.source}
                    onValueChange={(value) =>
                      setStudentForm((current) => ({
                        ...current,
                        source: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите источник" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Сайт",
                        "Рекомендация",
                        "VK",
                        "Instagram",
                        "Яндекс",
                      ].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Профессия">
                  <Input
                    value={studentForm.profession}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        profession: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Деятельность">
                  <Input
                    value={studentForm.activity}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        activity: e.target.value,
                      }))
                    }
                  />
                </ReferenceField>
                <ReferenceField label="Статус">
                  <Select
                    value={studentForm.leadStatus}
                    onValueChange={(value) =>
                      setStudentForm((current) => ({
                        ...current,
                        leadStatus: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiting">Ожидает</SelectItem>
                      <SelectItem value="studying">Учится</SelectItem>
                      <SelectItem value="thinking">Думает</SelectItem>
                    </SelectContent>
                  </Select>
                </ReferenceField>
              </TabsContent>
              <TabsContent value="languages" className="m-0 space-y-0">
                <h3 className="py-5 text-base font-semibold">Немецкий</h3>
                <ReferenceField label="Текущий уровень">
                  <Select
                    value={studentForm.language}
                    onValueChange={(value) =>
                      setStudentForm((current) => ({
                        ...current,
                        language: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="German">Немецкий</SelectItem>
                      <SelectItem value="English">Английский</SelectItem>
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Ожидает уровень">
                  <Select
                    value={studentForm.level}
                    onValueChange={(value) =>
                      setStudentForm((current) => ({
                        ...current,
                        level: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Ожидает спецкурс">
                  <Checkbox />
                </ReferenceField>
                <ReferenceField label="Тип спецкурса">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Тип не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grammar">Грамматика</SelectItem>
                      <SelectItem value="phonetics">Фонетика</SelectItem>
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Уровень спецкурса">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Уровень не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A1", "A2", "B1", "B2", "C1"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <h3 className="py-5 text-base font-semibold">Английский</h3>
                <ReferenceField label="Текущий уровень">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Уровень не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A1", "A2", "B1", "B2", "C1"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Ожидает уровень">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Уровень не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A1", "A2", "B1", "B2", "C1"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Ожидает спецкурс">
                  <Checkbox />
                </ReferenceField>
                <ReferenceField label="Тип спецкурса">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Тип не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grammar">Грамматика</SelectItem>
                      <SelectItem value="conversation">
                        Разговорный курс
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ReferenceField>
                <ReferenceField label="Уровень спецкурса">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Уровень не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A1", "A2", "B1", "B2", "C1"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ReferenceField>
              </TabsContent>
              <TabsContent value="extra" className="m-0 space-y-3 py-2">
                {(
                  [
                    ["loyal", "Лояльный клиент", "Скидка постоянного клиента"],
                    ["isStudent", "Студент", "Скидка по студенческому"],
                    ["friend", "Приведи друга", "Скидка по рекомендации"],
                    ["social", "Социальная скидка", "Льготная категория"],
                  ] as const
                ).map(([key, title, description]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 border-b px-[270px] py-5"
                  >
                    <Checkbox
                      checked={studentForm[key]}
                      onCheckedChange={(checked) =>
                        setStudentForm((current) => ({
                          ...current,
                          [key]: Boolean(checked),
                        }))
                      }
                    />
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
                <ReferenceField label="Родитель">
                  <Input
                    value={studentForm.parent}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        parent: e.target.value,
                      }))
                    }
                    placeholder="Поиск родителя по имени и фамилии"
                  />
                </ReferenceField>
                <ReferenceField label="Организация">
                  <Input
                    value={studentForm.organization}
                    onChange={(e) =>
                      setStudentForm((current) => ({
                        ...current,
                        organization: e.target.value,
                      }))
                    }
                    placeholder="Поиск организации по названию и ИНН"
                  />
                </ReferenceField>
                <ReferenceField label="Предпочитаемые дни занятий">
                  <div className="space-y-2">
                    {[
                      "Понедельник",
                      "Вторник",
                      "Среда",
                      "Четверг",
                      "Пятница",
                      "Суббота",
                      "Воскресенье",
                    ].map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox />
                        {day}
                      </label>
                    ))}
                  </div>
                </ReferenceField>
                <ReferenceField label="Предпочитаемое время занятий">
                  <Input placeholder="Выберите предпочитаемое время занятий" />
                </ReferenceField>
              </TabsContent>
            </ScrollArea>
            <div className="flex items-center justify-end gap-2 px-6 py-3">
              <span className="mr-2 text-xs text-muted-foreground">
                После добавления студент будет сразу добавлен в группу
              </span>
              <Button variant="outline" onClick={() => setStudentOpen(false)}>
                Отмена
              </Button>
              <Button onClick={addStudent}>Добавить студента</Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <StudentProfile
        student={
          studentProfileId ? studentMap.get(studentProfileId) || null : null
        }
        state={
          studentProfileId
            ? workspace.studentStates[studentProfileId] || "Учится"
            : "Учится"
        }
        groups={groups.filter(
          (group) =>
            studentProfileId && group.studentIds.includes(studentProfileId),
        )}
        onClose={() => setStudentProfileId(null)}
        onState={(value) =>
          studentProfileId &&
          setWorkspace((current) => ({
            ...current,
            studentStates: {
              ...current.studentStates,
              [studentProfileId]: value,
            },
          }))
        }
        onTask={(student) => openTask("", student)}
      />
    </div>
  );
}

function ReferenceField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[170px_minmax(0,1fr)] items-start gap-4 border-b py-4 last:border-0">
      <Label className="pt-2 text-xs text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function GroupEditPreview({ group }: { group: Partial<RealGroup> }) {
  return (
    <aside className="bg-muted/20 p-5">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
        {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {Array.from({ length: 35 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "rounded py-2",
              index > 15 && index < 31 ? "bg-sky-100" : "",
              [19, 21, 26, 28].includes(index) && "bg-teal-500 text-white",
            )}
          >
            {(index % 31) + 1}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <p className="font-semibold">💡{group.name || "Учебная группа"}</p>
        <p className="text-muted-foreground">
          Дата начала:{" "}
          <strong className="text-foreground">
            {group.startDate
              ? format(new Date(group.startDate), "dd.MM.yyyy")
              : "—"}
          </strong>
        </p>
        <p className="text-muted-foreground">
          Дата окончания:{" "}
          <strong className="text-foreground">
            {group.endDate
              ? format(new Date(group.endDate), "dd.MM.yyyy")
              : "—"}
          </strong>
        </p>
        <p className="text-muted-foreground">
          Количество занятий: <strong className="text-foreground">12</strong>
        </p>
      </div>
    </aside>
  );
}

function StudentProfile({
  student,
  state,
  groups,
  onClose,
  onState,
  onTask,
}: {
  student: Student | null;
  state: StudentState;
  groups: RealGroup[];
  onClose: () => void;
  onState: (value: StudentState) => void;
  onTask: (student: Student) => void;
}) {
  return (
    <Dialog open={Boolean(student)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[88vh] w-[calc(100vw-3rem)] max-w-[1500px] overflow-hidden p-0">
        {student && (
          <>
            <DialogHeader className="border-b px-7 py-6 text-center sm:text-center">
              <DialogTitle className="text-2xl">{student.name}</DialogTitle>
              <DialogDescription className="sr-only">Профиль студента</DialogDescription>
            </DialogHeader>
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(330px,1fr)]">
              <ScrollArea className="h-full border-r">
                <div className="p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">Статус:</span>
                    <Select value={state} onValueChange={(value) => onState(value as StudentState)}>
                      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Учится", "Думает", "Ожидает", "Закончил", "Отказался"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => toast.info("Загрузка файлов будет подключена на следующем этапе")}><FileUp className="h-4 w-4" />Файл</Button>
                    <Button className="gap-2" onClick={() => onTask(student)}><Plus className="h-4 w-4" />Задача</Button>
                    <Button variant="outline" className="gap-2"><Edit3 className="h-4 w-4" />Редактировать</Button>
                  </div>
                </div>
                <section>
                  <dl className="grid grid-cols-[145px_minmax(0,1fr)_150px_minmax(0,1fr)] gap-x-5 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Телефон</dt>
                    <dd>{student.phone || "—"}</dd>
                    <dt className="text-muted-foreground">Адрес</dt><dd>—</dd>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{student.email || "—"}</dd>
                    <dt className="text-muted-foreground">Паспорт</dt><dd>—</dd>
                    <dt className="text-muted-foreground">Дата рождения</dt>
                    <dd>
                      {student.birthDate
                        ? format(new Date(student.birthDate), "dd.MM.yyyy")
                        : "—"}
                    </dd>
                    <dt className="text-muted-foreground">Серия и номер</dt><dd>—</dd>
                    <dt className="text-muted-foreground">Профессия</dt>
                    <dd>{student.profession || "—"}</dd>
                    <dt className="text-muted-foreground">Кем выдан и когда</dt><dd>—</dd>
                    <dt className="text-muted-foreground">Источник</dt>
                    <dd>{student.howDidYouKnow || "—"}</dd>
                    <dt className="text-muted-foreground">Комментарий</dt><dd>{student.notes || "—"}</dd>
                    <dt className="text-muted-foreground">Скидки</dt>
                    <dd>{student.discounts || "—"}</dd>
                    <dt className="text-muted-foreground"></dt><dd></dd>
                    <dt className="font-semibold">Немецкий</dt><dd></dd><dt className="font-semibold">Английский</dt><dd></dd>
                    <dt className="text-muted-foreground">Уровень</dt><dd>{student.germanLevel || (student.language === "German" ? student.currentLevel : "Не выбран")}</dd>
                    <dt className="text-muted-foreground">Уровень</dt><dd>{student.englishLevel || (student.language === "English" ? student.currentLevel : "Не выбран")}</dd>
                  </dl>
                </section>
                <section className="mt-7 border-t pt-4">
                  <Tabs defaultValue="groups">
                    <TabsList className="bg-transparent"><TabsTrigger value="groups">Группы</TabsTrigger><TabsTrigger value="tasks">Задачи</TabsTrigger><TabsTrigger value="files">Файлы</TabsTrigger><TabsTrigger value="payments">Оплаты</TabsTrigger></TabsList>
                    <TabsContent value="groups" className="overflow-hidden rounded-md border">
                    <Table><TableHeader><TableRow><TableHead>Статус</TableHead><TableHead>Название</TableHead><TableHead>Начало</TableHead><TableHead>Конец</TableHead></TableRow></TableHeader><TableBody>
                    {groups.length ? (
                      groups.map((group) => (
                        <TableRow key={group.id}><TableCell><Badge className="bg-lime-500">Учится</Badge></TableCell><TableCell className="font-medium text-teal-700">{group.name}</TableCell><TableCell>{format(new Date(group.startDate), "dd.MM.yyyy")}</TableCell><TableCell>{format(new Date(group.endDate), "dd.MM.yyyy")}</TableCell></TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Сейчас не зачислен ни в одну группу</TableCell></TableRow>
                    )}
                    </TableBody></Table>
                    </TabsContent>
                  </Tabs>
                </section>
                </div>
              </ScrollArea>
              <section className="flex min-h-0 flex-col p-6">
                <h3 className="mb-3 font-semibold">Заметки и история</h3>
                <ScrollArea className="min-h-0 flex-1 border-y pr-3"><div className="space-y-3 py-3">
                  {student.notes && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      {student.notes}
                    </div>
                  )}
                  {student.communications
                    ?.filter((item) => item.type === "note")
                    .map((item) => (
                      <div key={item.id} className="rounded-lg border p-3">
                        <p className="text-sm">{item.content}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "dd.MM.yyyy HH:mm")}
                        </p>
                      </div>
                    ))}
                </div></ScrollArea>
                <Textarea
                  className="mt-4 min-h-28"
                  placeholder="Добавить внутренний комментарий…"
                />
                <Button size="sm" className="mt-2">
                  Сохранить комментарий
                </Button>
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
