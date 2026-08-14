import { CreditCard } from 'lucide-react';

export default function Payments() {
  return (
    <section className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf6f7] text-slate-900 shadow-sm">
          <CreditCard className="h-7 w-7" strokeWidth={1.6} />
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Оплаты</p>
        <h1 className="text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl">
          будет реализован позже
        </h1>
      </div>
    </section>
  );
}
