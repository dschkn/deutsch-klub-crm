import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '../ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

interface DropConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  isRecurring: boolean;
  onChangeAll: () => void;
  onChangeOne: () => void;
  onCancel: () => void;
}

export default function DropConfirmDialog({
  open, onOpenChange, itemName, isRecurring,
  onChangeAll, onChangeOne, onCancel,
}: DropConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Перенос занятия
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600">
            Выберите, какие изменения применить для <strong>{itemName}</strong>:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          {isRecurring && (
            <button
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
              onClick={onChangeAll}
            >
              <p className="font-medium text-sm text-slate-900">Изменить всю группу</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Меняются преподаватель, дни занятий, время, кабинет — все будущие занятия
              </p>
            </button>
          )}
          <button
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
            onClick={onChangeOne}
          >
            <p className="font-medium text-sm text-slate-900">Изменить только выбранное занятие</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Меняется только один экземпляр занятия. Остальные остаются без изменений
            </p>
          </button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Отмена</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
