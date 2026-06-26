import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToCSV, formatTransactionsForExport } from "@/lib/exportUtils";
import { parseRTLNumber, isValidNumber, getMonthAsString, getYearAsString } from "@/lib/numberUtils";

const TYPE_VALUES = ["revenue", "expense"] as const;

export default function Transactions() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const emptyForm = {
    type: "revenue" as const,
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    month: getMonthAsString(new Date()),
    year: getYearAsString(new Date()),
    notes: "",
    relatedClient: "",
  };
  
  const [formData, setFormData] = useState(emptyForm);

  const { data: transactions = [], isLoading, refetch } = trpc.transactions.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.transactions.create.useMutation();
  const updateMutation = trpc.transactions.update.useMutation();
  const deleteMutation = trpc.transactions.delete.useMutation();

  const localizedType = (type: string) => {
    const map: Record<string, string> = {
      "revenue": t("transactions.typeIncome", "revenue"),
      "expense": t("transactions.typeExpense", "expense"),
    };
    return map[type] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate amount
      if (!formData.amount || !formData.amount.trim()) {
        toast.error(t("transactions.amountRequired", "Amount is required"));
        return;
      }
      if (!isValidNumber(formData.amount)) {
        toast.error(t("common.invalidNumber", "Invalid number format"));
        return;
      }
      const amount = parseRTLNumber(formData.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error(t("transactions.amountMustBePositive", "Amount must be positive"));
        return;
      }
      
      // Validate date
      if (!formData.date) {
        toast.error(t("transactions.dateRequired", "Date is required"));
        return;
      }
      const txDate = new Date(formData.date);
      if (!Number.isFinite(txDate.getTime())) {
        toast.error(t("transactions.invalidDate", "Invalid date"));
        return;
      }
      
      // Validate category
      if (!formData.category || !formData.category.trim()) {
        toast.error(t("transactions.categoryRequired", "Category is required"));
        return;
      }
      
      // Calculate month and year from date
      const month = String(txDate.getMonth() + 1).padStart(2, '0');
      const year = txDate.getFullYear();
      
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          type: formData.type as "revenue" | "expense",
          category: formData.category,
          amount: amount,
          description: formData.description,
          date: txDate,
          notes: formData.notes,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
          
        });
        toast.success(t("transactions.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          type: formData.type as "revenue" | "expense",
          category: formData.category,
          amount: amount,
          description: formData.description,
          date: txDate,
          month,
          year,
          notes: formData.notes,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
          
        });
        toast.success(t("transactions.addSuccess"));
      }
      
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t("common.error");
      toast.error(errorMsg);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      category: transaction.category || "",
      amount: transaction.amount?.toString() || "",
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().split('T')[0],
      month: transaction.month,
      year: transaction.year,
      notes: transaction.notes || "",
      relatedClient: transaction.relatedClient?.toString() || "",
      
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("transactions.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("transactions.deleteSuccess"));
        refetch();
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getTypeColor = (type: string) => {
    return type === "revenue" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // تنسيق الأرقام بالإنجليزية دائماً مع رمز الشيقل
  const parseAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') return parseFloat(amount) || 0;
    return 0;
  };
  const fmt = (n: number) => `₪${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: any) => new Date(d).toLocaleDateString("en-GB");

  const totalIncome = transactions
    .filter((t: any) => t.type === "revenue")
    .reduce((sum: number, t: any) => sum + parseAmount(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + parseAmount(t.amount), 0);

  const netProfit = totalIncome - totalExpenses;

  // حساب الشهر الحالي والشهر السابق للمقارنة
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const prevDate = new Date(curYear, curMonth - 1, 1);
  const prevMonth = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();

  const sumBy = (type: string, m: number, y: number) =>
    transactions
      .filter((t: any) => {
        const d = new Date(t.date);
        return t.type === type && d.getMonth() === m && d.getFullYear() === y;
      })
      .reduce((s: number, t: any) => s + parseAmount(t.amount), 0);

  const incomeThisMonth = sumBy("revenue", curMonth, curYear);
  const incomeLastMonth = sumBy("revenue", prevMonth, prevYear);
  const expenseThisMonth = sumBy("expense", curMonth, curYear);
  const expenseLastMonth = sumBy("expense", prevMonth, prevYear);

  const pctChange = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return ((cur - prev) / prev) * 100;
  };
  const incomeChange = pctChange(incomeThisMonth, incomeLastMonth);
  const expenseChange = pctChange(expenseThisMonth, expenseLastMonth);

  const ComparisonBadge = ({ change, positiveIsGood }: { change: number; positiveIsGood: boolean }) => {
    const isUp = change >= 0;
    const good = positiveIsGood ? isUp : !isUp;
    return (
      <p className={`text-xs mt-1 ${good ? "text-green-600" : "text-red-600"}`} dir="ltr">
        {isUp ? "▲" : "▼"} {Math.abs(change).toLocaleString("en-US", { maximumFractionDigits: 1 })}% {t("transactions.vsLastMonth", "vs last month")}
      </p>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("transactions.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("transactions.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatTransactionsForExport(transactions);
              exportToExcel(formatted, `transactions-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportExcel", "Export Excel")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatTransactionsForExport(transactions);
              exportToCSV(formatted, `transactions-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportCSV", "Export CSV")}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                <Plus className="w-4 h-4 ms-2" />
                {t("transactions.addTransaction")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("transactions.editTransaction") : t("transactions.addTransaction")}</DialogTitle>
              <DialogDescription>{editingId ? t("transactions.editDesc") : t("transactions.addDesc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">{t("transactions.transactionType")}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_VALUES.map((t) => (
                      <SelectItem key={t} value={t}>{localizedType(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">{t("transactions.category")}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t("transactions.category")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">{t("transactions.amount")}</Label>
                <Input
                  id="amount"
                  type="text"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  inputMode="decimal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">{t("transactions.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t("transactions.description")}</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("transactions.description")}
                />
              </div>
              <div>
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("common.notes")}
                  className="resize-none"
                />
              </div>
              <div>
                <Label htmlFor="relatedClient">{t("common.client")}</Label>
                <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                  {editingId ? t("common.update") : t("common.add")}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>{t("common.cancel")}</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("transactions.totalIncome")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" dir="ltr">{fmt(totalIncome)}</div>
            <ComparisonBadge change={incomeChange} positiveIsGood={true} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("transactions.totalExpenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" dir="ltr">{fmt(totalExpenses)}</div>
            <ComparisonBadge change={expenseChange} positiveIsGood={false} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("transactions.netProfit")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
              {fmt(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.listTitle")}</CardTitle>
          <CardDescription>{t("transactions.count")}: {transactions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("transactions.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transactions.transactionType")}</TableHead>
                    <TableHead>{t("transactions.category")}</TableHead>
                    <TableHead>{t("transactions.amount")}</TableHead>
                    <TableHead>{t("transactions.date")}</TableHead>
                    <TableHead>{t("transactions.description")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(transaction.type)}`}>
                          {localizedType(transaction.type)}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="font-medium" dir="ltr">{fmt(transaction.amount)}</TableCell>
                      <TableCell dir="ltr">{fmtDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
