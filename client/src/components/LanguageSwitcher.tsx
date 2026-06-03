import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
    { code: 'en', name: 'English', dir: 'ltr' },
  ];

  const handleLanguageChange = (code: string, dir: string) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = dir;
    localStorage.setItem('language', code);
    localStorage.setItem('direction', dir);
  };

  const currentLang = languages.find(lang => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="w-4 h-4" />
          <span className="sr-only">تبديل اللغة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code, lang.dir)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
