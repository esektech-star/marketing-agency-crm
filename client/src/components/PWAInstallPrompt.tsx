import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { deferredPrompt, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (deferredPrompt && !isInstalled) {
      setShowPrompt(true);
    }
  }, [deferredPrompt, isInstalled]);

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 max-w-sm bg-white border border-border rounded-lg shadow-lg p-4 z-50" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">تثبيت تطبيق Esek Tech</h3>
          <p className="text-xs text-muted-foreground">
            ثبّت التطبيق للوصول السريع والعمل دون اتصال
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          onClick={() => {
            installApp();
            setShowPrompt(false);
          }}
          className="flex-1"
        >
          <Download className="w-4 h-4 ml-2" />
          تثبيت
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPrompt(false)}
          className="flex-1"
        >
          لاحقًا
        </Button>
      </div>
    </div>
  );
}
