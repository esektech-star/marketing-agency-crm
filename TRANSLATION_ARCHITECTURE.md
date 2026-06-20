# نظام الترجمة الشامل - Multi-Language Translation System

## 📋 نظرة عامة

نظام ترجمة احترافي يدعم 3 لغات (عربي، عبري، إنجليزي) مع:
- ✅ 100% تغطية للمحتوى
- ✅ تبديل لغات فوري بدون تحديث
- ✅ دعم RTL/LTR كامل
- ✅ لوحة تحكم إدارة ترجمات
- ✅ نظام caching للأداء

---

## 🏗️ Architecture

### 1. Structure الملفات

```
client/src/i18n/
├── locales/
│   ├── ar.json          # الترجمات العربية
│   ├── he.json          # الترجمات العبرية
│   ├── en.json          # الترجمات الإنجليزية
│   └── index.ts         # تحميل الترجمات
├── config.ts            # إعدادات i18n
├── hooks/
│   ├── useTranslation.ts    # Hook للترجمة
│   └── useLanguage.ts       # Hook لتغيير اللغة
└── utils/
    ├── rtl.ts           # دوال RTL/LTR
    ├── cache.ts         # نظام caching
    └── validation.ts    # التحقق من الترجمات
```

### 2. JSON Structure

```json
{
  "common": {
    "save": {
      "ar": "حفظ",
      "he": "שמור",
      "en": "Save"
    },
    "cancel": {
      "ar": "إلغاء",
      "he": "ביטול",
      "en": "Cancel"
    }
  },
  "dashboard": {
    "title": {
      "ar": "لوحة التحكم",
      "he": "לוח בקרה",
      "en": "Dashboard"
    }
  }
}
```

### 3. Database Schema (للترجمات الديناميكية)

```sql
CREATE TABLE translations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  ar_text TEXT,
  he_text TEXT,
  en_text TEXT,
  status ENUM('active', 'pending', 'archived'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE translation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  translation_id INT,
  language VARCHAR(5),
  old_value TEXT,
  new_value TEXT,
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (translation_id) REFERENCES translations(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

---

## 🔄 Implementation

### 1. Hook للترجمة

```typescript
// client/src/i18n/hooks/useTranslation.ts
export function useTranslation() {
  const { i18n } = useTranslationLib();
  const { language } = useLanguageContext();
  
  const t = (key: string, defaultValue?: string) => {
    const value = i18n.t(key, { defaultValue });
    return value || defaultValue || key;
  };
  
  return { t, language, i18n };
}
```

### 2. Language Context

```typescript
// client/src/contexts/LanguageContext.tsx
interface LanguageContextType {
  language: 'ar' | 'he' | 'en';
  setLanguage: (lang: 'ar' | 'he' | 'en') => void;
  direction: 'rtl' | 'ltr';
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'ar' | 'he' | 'en'>(() => {
    return (localStorage.getItem('language') as any) || 'ar';
  });

  const direction = language === 'en' ? 'ltr' : 'rtl';

  const handleSetLanguage = (lang: 'ar' | 'he' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### 3. Language Switcher Component

```typescript
// client/src/components/LanguageSwitcher.tsx
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 rounded ${language === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('he')}
        className={`px-3 py-1 rounded ${language === 'he' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        עברית
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
    </div>
  );
}
```

### 4. RTL/LTR Support

```typescript
// client/src/i18n/utils/rtl.ts
export const RTL_LANGUAGES = ['ar', 'he'];
export const LTR_LANGUAGES = ['en'];

export function getDirection(language: string): 'rtl' | 'ltr' {
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}

export function getMarginDirection(language: string, side: 'left' | 'right', value: string) {
  const direction = getDirection(language);
  if (direction === 'rtl') {
    return side === 'left' ? { marginRight: value } : { marginLeft: value };
  }
  return side === 'left' ? { marginLeft: value } : { marginRight: value };
}
```

### 5. Caching System

```typescript
// client/src/i18n/utils/cache.ts
class TranslationCache {
  private cache = new Map<string, any>();
  private ttl = 1000 * 60 * 60; // 1 hour

  set(key: string, value: any) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const translationCache = new TranslationCache();
```

---

## 📝 Translation Keys Categories

### Common Keys
```
common.save
common.cancel
common.delete
common.edit
common.add
common.close
common.error
common.success
common.loading
common.noData
```

### Navigation
```
nav.dashboard
nav.clients
nav.campaigns
nav.invoices
nav.team
nav.settings
```

### Forms
```
form.placeholder.*
form.label.*
form.validation.*
form.error.*
```

### Messages
```
message.success.*
message.error.*
message.warning.*
message.info.*
```

---

## 🔍 Validation Checklist

- [ ] جميع النصوص المرئية مترجمة
- [ ] لا توجد نصوص مشفرة (hardcoded)
- [ ] RTL/LTR يعمل بشكل صحيح
- [ ] Language Switcher يعمل بدون تأخير
- [ ] Fallback للإنجليزية يعمل
- [ ] Caching يحسّن الأداء
- [ ] جميع الصفحات تدعم 3 لغات

---

## 🚀 Performance Best Practices

1. **Lazy Loading**: تحميل الترجمات حسب الحاجة
2. **Caching**: تخزين الترجمات المستخدمة بكثرة
3. **Code Splitting**: فصل ملفات الترجمة حسب الصفحات
4. **Compression**: ضغط ملفات JSON
5. **CDN**: توزيع الملفات عبر CDN

---

## 📊 Migration Plan

### Phase 1: Setup
- إنشاء البنية الأساسية
- إعداد Database

### Phase 2: Audit
- البحث عن جميع النصوص المشفرة
- تصنيفها حسب الفئات

### Phase 3: Translation
- ترجمة جميع النصوص
- التحقق من الجودة

### Phase 4: Implementation
- تطبيق الترجمات في الكود
- اختبار شامل

### Phase 5: Optimization
- تحسين الأداء
- إضافة Caching

---

## 📚 Resources

- i18next Documentation: https://www.i18next.com/
- RTL Support: https://rtlstyling.com/
- Translation Best Practices: https://www.w3.org/International/

