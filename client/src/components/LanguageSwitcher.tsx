import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { applyDirection } from '@/i18n/config';

const languages = [
  { code: 'ar', name: 'العربية', flag: 'ع' },
  { code: 'he', name: 'עברית', flag: 'ע' },
  { code: 'en', name: 'English', flag: 'EN' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    applyDirection(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white/60">
          <Globe className="w-4 h-4" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground w-6 text-center">{lang.flag}</span>
              {lang.name}
            </span>
            {i18n.language === lang.code && <Check className="w-4 h-4 text-[#f59e0b]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
