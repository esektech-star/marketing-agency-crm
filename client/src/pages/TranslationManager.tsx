import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TranslationEntry {
  key: string;
  category: string;
  ar: string;
  he: string;
  en: string;
  status: 'active' | 'pending' | 'archived';
}

export default function TranslationManager() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [form, setForm] = useState<TranslationEntry>({
    key: '',
    category: '',
    ar: '',
    he: '',
    en: '',
    status: 'active',
  });

  // Mock data - في الإنتاج ستأتي من tRPC
  const [translations, setTranslations] = useState<TranslationEntry[]>([
    {
      key: 'dashboard.title',
      category: 'dashboard',
      ar: 'لوحة التحكم',
      he: 'לוח בקרה',
      en: 'Dashboard',
      status: 'active',
    },
    {
      key: 'common.save',
      category: 'common',
      ar: 'حفظ',
      he: 'שמור',
      en: 'Save',
      status: 'active',
    },
  ]);

  const categories = Array.from(new Set(translations.map((t) => t.category)));

  const filteredTranslations = translations.filter((trans) => {
    const matchesSearch =
      trans.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.en.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || trans.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!form.key || !form.category || !form.ar || !form.he || !form.en) {
      toast.error(t('common.fillAllFields', 'Please fill all fields'));
      return;
    }

    if (editingKey) {
      setTranslations(translations.map((t) => (t.key === editingKey ? form : t)));
      toast.success(t('common.updated', 'Translation updated'));
    } else {
      setTranslations([...translations, form]);
      toast.success(t('common.created', 'Translation created'));
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (trans: TranslationEntry) => {
    setForm(trans);
    setEditingKey(trans.key);
    setIsOpen(true);
  };

  const handleDelete = (key: string) => {
    setTranslations(translations.filter((t) => t.key !== key));
    toast.success(t('common.deleted', 'Translation deleted'));
  };

  const resetForm = () => {
    setForm({
      key: '',
      category: '',
      ar: '',
      he: '',
      en: '',
      status: 'active',
    });
    setEditingKey(null);
  };

  const handleExport = () => {
    const data = JSON.stringify(translations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success(t('common.exported', 'Translations exported'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('translations.title', 'Translation Manager')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('translations.subtitle', 'Manage translations for all languages')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <Label>{t('common.search', 'Search')}</Label>
          <Input
            placeholder={t('common.searchPlaceholder', 'Search translations...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="min-w-[200px]">
          <Label>{t('common.category', 'Category')}</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t('common.allCategories', 'All Categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.all', 'All')}</SelectItem>
              {categories && categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              {t('translations.addNew', 'Add Translation')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingKey ? t('common.edit', 'Edit') : t('common.add', 'Add')} {t('common.translation', 'Translation')}
              </DialogTitle>
              <DialogDescription>
                {t('translations.enterTranslations', 'Enter translations in all languages')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('common.key', 'Key')}</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="e.g., dashboard.title"
                    disabled={!!editingKey}
                  />
                </div>
                <div>
                  <Label>{t('common.category', 'Category')}</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g., dashboard"
                  />
                </div>
              </div>

              <div>
                <Label>العربية (Arabic)</Label>
                <Textarea
                  value={form.ar}
                  onChange={(e) => setForm({ ...form, ar: e.target.value })}
                  placeholder="Enter Arabic translation"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>עברית (Hebrew)</Label>
                <Textarea
                  value={form.he}
                  onChange={(e) => setForm({ ...form, he: e.target.value })}
                  placeholder="Enter Hebrew translation"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>English</Label>
                <Textarea
                  value={form.en}
                  onChange={(e) => setForm({ ...form, en: e.target.value })}
                  placeholder="Enter English translation"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleSave}>{t('common.save', 'Save')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          {t('common.export', 'Export')}
        </Button>
      </div>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('translations.list', 'Translations List')}</CardTitle>
          <CardDescription>
            {t('common.total', 'Total')}: {filteredTranslations.length} / {translations.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.key', 'Key')}</TableHead>
                  <TableHead>{t('common.category', 'Category')}</TableHead>
                  <TableHead>العربية</TableHead>
                  <TableHead>עברית</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead>{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations.map((trans) => (
                  <TableRow key={trans.key}>
                    <TableCell className="font-mono text-sm">{trans.key}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {trans.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{trans.ar}</TableCell>
                    <TableCell className="text-sm">{trans.he}</TableCell>
                    <TableCell className="text-sm">{trans.en}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          trans.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : trans.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {trans.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(trans)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(trans.key)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
