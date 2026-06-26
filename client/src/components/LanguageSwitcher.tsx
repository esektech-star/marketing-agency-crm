import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { applyDirection } from '@/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'ar', name: 'العربية', flag: 'ع' },
  { code: 'he', name: 'עברית', flag: 'ע' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code as any);
    applyDirection(code);
    
    // Dispatch event for other listeners
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: code } }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white/60">
          <Globe className="w-4 h-4" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuCheckboxItem
            key={lang.code}
            checked={language === lang.code}
            onCheckedChange={() => handleLanguageChange(lang.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-xs font-bold text-muted-foreground w-6 text-center">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
