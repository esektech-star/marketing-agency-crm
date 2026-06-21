import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Search, Loader2, Users, CheckCircle2, TrendingUp, Receipt, Megaphone, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle: string | null;
  path: string;
}

export function SearchBar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: results, isLoading } = trpc.dashboard.search.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.path);
    setOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Users className="w-4 h-4" />;
      case 'task':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'lead':
        return <TrendingUp className="w-4 h-4" />;
      case 'transaction':
        return <Receipt className="w-4 h-4" />;
      case 'campaign':
        return <Megaphone className="w-4 h-4" />;
      case 'invoice':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const allResults = results ? [
    ...results.clients,
    ...results.tasks,
    ...results.leads,
    ...results.transactions,
    ...results.campaigns,
    ...results.invoices,
  ] : [];

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background transition-all',
          open && 'ring-2 ring-primary'
        )}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder', 'Search...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground"
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded">
          <span className="text-xs">{isRTL ? 'Cmd' : 'Cmd'}</span>K
        </kbd>
      </div>

      {/* Results Dropdown */}
      {open && (
        <div className={cn(
          'absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg z-50',
          isRTL ? 'right-0' : 'left-0'
        )}>
          {isLoading && query && (
            <div className="flex items-center justify-center gap-2 p-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">{t('search.searching', 'Searching...')}</span>
            </div>
          )}

          {query && !isLoading && allResults.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('search.noResults', 'No results found')}
            </div>
          )}

          {!query && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('search.typeToSearch', 'Type to search...')}
            </div>
          )}

          {allResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {allResults.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                >
                  <div className="mt-1 text-muted-foreground flex-shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
