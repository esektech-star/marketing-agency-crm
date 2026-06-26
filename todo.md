# Marketing Agency CRM - Master TODO

## Phase 1: ניקוי וקונסולידציה של מודולים קיימים
- [x] בדיקת כפילויות בין Dashboard, Reports, Analytics, Performance
- [x] הסרת Reports Module (העברה ל-Dashboard)
- [x] תיקון Finance Module (הכנסות/הוצאות)
- [x] ניקוי שדות מיותרים בכל מודול
- [x] ביקורת הרשאות (Admin/Manager/Employee/Client)
- [x] תיקון תרגומים (עברית + ערבית בלבד)
- [x] ביקורת Audit Log System

## Phase 2: Client Portal מלא
- [x] יצירת Client Portal Layout עצמאי
- [x] צפייה קמפיינים (read-only)
- [x] צפייה משימות משויכות
- [x] צפייה מסמכים
- [x] צפייה חשבוניות
- [x] העלאת קבצים ע״י לקוח
- [x] מערכת הודעות בין לקוח למשרד
- [x] Authentication לפורטל (Token-based)

## Phase 3: Onboarding/Discovery Module
- [x] יצירת טופס אפיון לקוח
- [x] שאלות מובנות (Discovery Questions)
- [x] AI Summary של תשובות
- [x] המלצת חבילה (Package Recommendation)
- [x] יצירת הצעת מחיר (Proposal)
- [x] ייצוא PDF של ההצעה
- [x] שיתוף לינק ללקוח

## Phase 4: Meta Ads Integration
- [x] חיבור ל-Meta Ads API
- [x] ייבוא קמפיינים מ-Meta
- [x] ניתוח ביצועים קמפיינים
- [x] AI Campaign Recommendations
- [x] עדכון סטטוס קמפיין
- [x] ניהול תקציב קמפיין

## Phase 5: WhatsApp Integration
- [x] חיבור ל-WhatsApp Business API
- [x] שליחת הודעות אוטומטיות על לידים חדשים
- [x] שליחת הודעות על משימות חדשות
- [x] שליחת התראות ביצועים
- [x] ניהול תבניות הודעות

## Phase 6: SUMIT API Integration
- [x] חיבור ל-SUMIT API
- [x] יצירה חשבוניות ב-SUMIT
- [x] קבלת סטטוס תשלום
- [x] שמירה חשבוניות בתיק לקוח
- [x] סנכרון חשבוניות

## Phase 7: Performance Alerts System
- [x] יצירת Rules Engine לתראות
- [x] הגדרת כללים לירידות ביצועים
- [x] שליחת תראות ל-Admin בלבד
- [x] ניהול סף התראות
- [x] היסטוריית תראות

## Phase 8: Advanced Reporting & Export
- [x] תיקון ייצוא PDF (RTL)
- [x] ייצוא Excel מתקדם
- [x] ייצוא CSV
- [x] דוחות מותאמים אישית
- [x] שיתוף דוחות עם לקוחות
- [x] שמירת דוחות בהיסטוריה

## Phase 9: AI Layer Integration
- [x] AI Summary של מצב העסק (clientInsights/performanceReport)
- [x] ניתוח קמפיינים (analyzeCampaigns - LLM אמיתי בערבית)
- [x] הצעות שיפור ביצועים (Meta AI recommendations)
- [x] זיהוי מגמות (identifyTrends)
- [x] סיכום אפיון לקוח (generateOnboardingSummary)
- [x] AI Assistant גלובלי צף בדשבורד

## Phase 10: Testing & Optimization
- [ ] בדיקות יחידה (Unit Tests)
- [ ] בדיקות אינטגרציה (Integration Tests)
- [ ] בדיקות ביצועים (Performance Tests)
- [ ] בדיקות אבטחה (Security Tests)
- [ ] בדיקות RTL/LTR
- [ ] בדיקות תרגומים
- [ ] בדיקות הרשאות

## Phase 11: חיבור עמודים ל-Backend אמיתי (תיקון mock data)
- [x] תיקון ניווט: עטיפת Meta/WhatsApp/SUMIT/Reports ב-DashboardLayout
- [x] תיקון נתיב הבית (/) והוספת מודולים לתפריט
- [x] תרגום מסך כניסה + מפתחות תרגום חסרים
- [x] חיבור Alerts.tsx ל-tRPC האמיתי (היה mock)
- [x] חיבור WhatsApp.tsx ל-tRPC (היה mock)
- [x] חיבור SUMIT.tsx ל-tRPC (היה mock)
- [x] חיבור Meta.tsx ל-tRPC (היה mock)
- [x] חיבור Reports.tsx ל-tRPC (היה mock)
- [x] חיבור Onboarding.tsx ל-onboarding router + עמוד ProposalView ציבורי
- [x] כתיבת vitest tests למודולים החדשים (proposals.test.ts, alertRules.test.ts)
- [x] בדיקה מקיפה סופית + checkpoint (42 tests עוברים, TypeScript נקי)
- [x] תרגום PWA install prompt לערבית + RTL
