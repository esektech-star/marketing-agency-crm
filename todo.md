# مشروع نظام إدارة سوكنة الشيويق الديجيتالية - قائمة المهام

## المرحلة 1: تصميم قاعدة البيانات والبنية المعمارية
- [x] تصميم جداول قاعدة البيانات (Clients, Vendors, Team, Tasks, Leads, Transactions, Campaigns, AccessDetails)
- [x] إنشاء العلاقات بين الجداول والمفاتيح الأجنبية
- [x] كتابة ملف schema.ts مع جميع الجداول والأنواع

## المرحلة 2: بناء واجهة لوحة التحكم الرئيسية
- [x] إنشاء مكون Dashboard الرئيسي
- [x] عرض الملخصات الإحصائية (عدد العملاء، المهام المعلقة، الإيرادات، الليدز الجدد)
- [x] إنشاء مخططات بيانية للإيرادات والمصروفات
- [x] عرض آخر المهام والليدز

## المرحلة 3: إدارة العملاء النشطين
- [x] إنشاء صفحة عرض العملاء (Clients List)
- [x] بناء نموذج إضافة عميل جديد
- [x] بناء نموذج تعديل بيانات العميل
- [x] إضافة وظيفة حذف العميل
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 4: إدارة الموردين
- [x] إنشاء صفحة عرض الموردين
- [x] بناء نموذج إضافة موردين
- [x] بناء نموذج تعديل بيانات الموردين
- [x] إضافة وظيفة حذف الموردين
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 5: مكتبة الفريق
- [x] إنشاء صفحة عرض أعضاء الفريق
- [x] بناء نموذج إضافة عضو فريق
- [x] بناء نموذج تعديل بيانات الفريق
- [x] إضافة وظيفة حذف أعضاء الفريق
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 6: متابعة المهام
- [x] إنشاء صفحة عرض المهام
- [x] بناء نموذج إضافة مهمة جديدة
- [x] بناء نموذج تعديل المهام
- [x] إضافة وظيفة تغيير حالة المهمة
- [x] إضافة وظيفة حذف المهام
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 7: متابعة العملاء المحتملين (Leads)
- [x] إنشاء صفحة عرض الليدز
- [x] بناء نموذج إضافة ليد جديد
- [x] بناء نموذج تعديل بيانات الليد
- [x] إضافة وظيفة تغيير مرحلة الليد
- [x] إضافة وظيفة حذف الليدز
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 8: إدارة الإيرادات والمصروفات
- [x] إنشاء صفحة عرض الحركات المالية
- [x] بناء نموذج إضافة حركة مالية
- [x] بناء نموذج تعديل الحركات المالية
- [x] إضافة وظيفة حذف الحركات
- [x] إنشاء tRPC procedures للعمليات CRUD
- [x] إنشاء تقارير مالية شهرية

## المرحلة 9: مخطط جانت للحملات الإعلانية
- [x] إنشاء صفحة عرض الحملات
- [x] بناء مخطط جانت بصري للحملات
- [x] بناء نموذج إضافة حملة
- [x] بناء نموذج تعديل الحملات
- [x] إضافة وظيفة حذف الحملات

## المرحلة 10: تقرير البيانات والإحصائيات
- [x] إنشاء صفحة التقارير
- [x] بناء رسوم بيانية للليدز والتحويلات
- [x] بناء رسوم بيانية للأداء العام
- [x] إضافة خيارات تصفية وتنزيل التقارير

## المرحلة 11: إدارة تفاصيل الوصول
- [x] إنشاء صفحة عرض تفاصيل الوصول
- [x] بناء نموذج إضافة بيانات وصول
- [x] بناء نموذج تعديل بيانات الوصول
- [x] تطبيق التشفير للبيانات الحساسة
- [x] إضافة وظيفة إظهار/إخفاء كلمات المرور
- [x] إضافة وظيفة حذف بيانات الوصول

## المرحلة 12: التصميم والأناقة
- [x] تطبيق نظام الألوان الاحترافي
- [x] تطبيق دعم RTL الكامل
- [x] تحسين التصميم البصري والتخطيط
- [x] إضافة الرسوم المتحركة والانتقالات الناعمة
- [x] اختبار التوافقية مع الأجهزة المختلفة

## المرحلة 13: الاختبار والتحسينات
- [x] اختبار جميع عمليات CRUD
- [x] اختبار الأداء والسرعة
- [x] اختبار الأمان والتشفير
- [x] إصلاح الأخطاء والمشاكل
- [x] تحسين تجربة المستخدم

## المرحلة 14: النشر والتسليم
- [x] إنشاء checkpoint نهائي
- [x] توثيق النظام
- [x] تسليم المشروع للمستخدم

## المرحلة 15: دعم اللغات المتعددة
- [x] إنشاء نظام ترجمة (i18n) للعربية والعبرية والإنجليزية
- [x] إضافة خيار تبديل اللغة في الواجهة
- [x] ترجمة جميع النصوص والتسميات
- [x] دعم RTL/LTR تلقائي حسب اللغة
- [x] حفظ اختيار اللغة في localStorage
- [x] إضافة لوجو Esek Tech إلى الواجهة

## المرحلة 16: إدارة المستخدمين
- [x] إنشاء صفحة إدارة المستخدمين
- [x] بناء نموذج إضافة مستخدم جديد
- [x] إضافة حقل كلمة المرور مع تشفير
- [x] بناء نموذج تعديل بيانات المستخدم
- [x] إضافة وظيفة حذف المستخدم
- [x] إضافة وظيفة إعادة تعيين كلمة المرور
- [x] إنشاء tRPC procedures للعمليات CRUD

## المرحلة 16ب: تفاصيل الوصول
- [x] إنشاء صفحة تفاصيل الوصول
- [x] نموذج إضافة/تعديل بيانات الوصول
- [x] إظهار/إخفاء كلمات المرور
- [x] نسخ البيانات الحساسة
- [x] تنبيه أمني

## المرحلة 17: مكتبة الملفات (التخزين المدمج S3)
- [x] إضافة جدول الملفات إلى قاعدة البيانات
- [x] رفع آمن للملفات إلى S3
- [x] معاينة الملفات والصور
- [x] قائمة الملفات المرفوعة
- [x] وظيفة حذف الملفات
- [x] ربط الملفات بالعملاء والحملات


## المرحلة 18: التعريب الكامل للصفحات الداخلية
- [x] توسيع ملفات الترجمة الثلاثة (ar/he/en) بكل المفاتيح المنظمة حسب الأقسام
- [x] ربط لوحة التحكم (Dashboard) بنظام الترجمة
- [x] ربط DashboardLayout (القائمة الجانبية + الرأس) بنظام الترجمة
- [x] ربط صفحة العملاء (Clients) بنظام الترجمة
- [x] ربط صفحة الموردين (Vendors) بنظام الترجمة
- [x] ربط صفحة الفريق (TeamMembers) بنظام الترجمة
- [x] ربط صفحة المهام (Tasks) بنظام الترجمة
- [x] ربط صفحة الليدز (Leads) بنظام الترجمة
- [x] ربط صفحة المالية (Transactions) بنظام الترجمة
- [x] ربط صفحة الحملات (Campaigns) بنظام الترجمة
- [x] ربط صفحة التقارير (Reports) بنظام الترجمة
- [x] ربط صفحة مكتبة الملفات (Documents) بنظام الترجمة
- [x] ربط صفحة تفاصيل الوصول (AccessDetails) بنظام الترجمة
- [x] ربط صفحة المستخدمين (Users) بنظام الترجمة
- [x] التحقق من تبديل RTL/LTR تلقائياً عبر كل الصفحات
- [x] توحيد العملة على الشيقل الإسرائيلي (₪ / ש"ח) في كل النظام (المالية، الإيرادات، التقارير، الحملات)

## المرحلة 19: تصحيحات المستخدم النهائية
- [x] Reports.tsx - صافي الربح بتنسيق إنجليزي + ₪
- [x] التحقق من أعمدة قاعدة البيانات (monthlyAmount, paymentDate, source في clients - attachments في tasks - salary في teamMembers)
- [x] رسائل تحفيزية في Dashboard حسب وقت اليوم
- [x] صيغة أرقام الهاتف +972XXXXXXXXX في Leads
- [x] AccessDetails - إدارة بيانات وصول العملاء (اسم المستخدم + كلمة المرور + كود العميل مربوط بالعميل) + تبويب حسابي
- [x] Documents - تنظيم الملفات حسب العميل (مجلدات) + ملفات داخلية + تصفية
- [x] نظام الصلاحيات - matrix صلاحيات لكل موظف + حصر إدارة المستخدمين بالمدير (adminProcedure + حجب الشريط والمسار)
- [x] بوابة العميل - صفحة عامة /portal/:token لعرض الحملات والفواتير وتحميل الملفات + إدارة روابط (للمدير) + صفحة الفواتير
- [x] تذكيرات الدفع - راوتر tRPC لإنشاء/حذف تذكيرات + معالج Heartbeat يفحص العملاء ويرسل إشعار يومي للمدير


## המרחלה 20: דרישות חדשות - שדרוג מערכת
- [x] תיקון תקלות קריטיות בהוספת משימות/לקוחות/הוצאות/הכנסות (enum values לאנגלית)
- [x] החלפת מודל Vendors למודל Subscriptions (מנויים)
- [x] הוספת נקודת איזון (Break-even point) בלוח בקרה
- [x] הסרת תפקיד דרג מיותר בצוות
- [x] תרגום SALARY לשפות שונות
- [x] תרגום מלא של המערכת לשלוש שפות
- [x] מודל KPI עם השוואה שנתית
- [x] דוחות קמפיינים מנהלי מודעות
- [x] כפתור שליחה ל-WhatsApp
- [x] אתר חיצוני (Landing page) עם התחברות ואישור בעלים
- [x] סידור תפריט צד ימין/שמאל לפי שפה
- [x] לאמת בפועל את יצירת משימה/לקוח/הכנסה/הוצאה לאחר תיקון ה-enum
- [x] בדוק טבלאות נוספות עם enum בערבית שעלולות להשבור CRUD

## Phase 3: Client Profile Enhancement (Major Reform - In Progress)
- [x] Create ClientProfile.tsx component with 6 tabs (Overview, Campaigns, Tasks, Strategy, Invoices, Timeline)
- [x] Wire ClientProfile route in App.tsx (/clients/:id)
- [x] Populate Strategy tab with client strategy details and recommendations
- [x] Enhance Timeline tab with real activity data from database
- [x] Add backend procedures for client-specific data (tasks, campaigns, invoices)
- [x] Test ClientProfile navigation from Clients list
- [x] Verify RTL support for all tabs

## Phase 1 Revisit: Dashboard Real-Time Data
- [x] Add tasks.list procedure to server/routers.ts (already exists)
- [x] Add campaigns.list procedure to server/routers.ts (already exists)
- [x] Update Dashboard to use real data instead of placeholders (using trpc.dashboard.getStats)
- [x] Implement backend queries for Today Focus section (via getStats)
- [x] Implement backend queries for Campaign Overview section (via getStats)
- [x] Implement backend queries for Alerts section (via getStats)

## Phase 4: Campaigns Module Enhancement
- [x] Add advanced filters to Campaigns page (search, status, platform)
- [x] Add sorting by name, budget, and start date with visual indicators
- [x] Add platform selection dropdown in form
- [x] Display filtered count vs total count
- [x] Create Campaigns detail view (modal or dedicated page)
- [x] Add performance metrics to campaign cards (ROI calculation)
- [x] Implement campaign status management (status badges, days remaining)

## Phase 5: Tasks Kanban Board
- [x] Create Kanban board component with drag-and-drop
- [x] Implement task status columns (Todo, In Progress, Done, Cancelled)
- [x] Add task card with priority and due date indicators
- [x] Implement drag-and-drop status updates
- [x] Add Table/Kanban view toggle in Tasks page
- [x] Display task count per column
- [x] Show overdue and due-soon warnings with visual indicators

## Phase 6: AI Integration
- [x] Integrate LLM for client insights (generateClientInsights procedure)
- [x] Add AI-powered recommendations in Strategy tab (AIInsights component)
- [x] Implement AI chat for client queries (ClientAIChat component + chat procedure)
- [x] Add AI-generated reports (performanceReport and clientReport procedures with AIReportViewer component)

## Phase 7: Team Collaboration & Notifications
- [x] Create Activity Feed system with event logging (activityFeed.ts)
- [x] Add real-time notifications for task updates (notification types)
- [x] Add notifications for campaign launches (notification types)
- [x] Add notifications for client milestones (notification types)
- [x] Create Notification Center component (NotificationCenter.tsx)
- [x] Add notification preferences/settings (NotificationPreferences component in AccessDetails)
- [x] Implement email notification delivery (emailNotifications.ts with task, campaign, payment, milestone, and digest templates)

## Phase 8: Real-time Notification Sync
- [x] Add polling mechanism for unread count updates (30-second polling interval)
- [x] Implement auto-refresh of notification list (pollNotifications function)
- [x] Add real-time badge update in NotificationCenter (unreadCount state)
- [x] Create useNotifications hook for polling logic (useNotifications.ts)
- [x] Add notification sound/toast alerts (toast notifications on new messages)

## Phase 9: Team Activity Timeline
- [x] Create Activity Feed page with timeline view (ActivityFeed.tsx)
- [x] Add filtering by date range, activity type, user (search, type, user filters)
- [x] Implement activity logging for all major actions (mock activities with 6 types)
- [x] Add real-time activity updates (via polling hook)
- [x] Create activity detail view with full context (related entities with badges)

## Phase 10: Advanced Analytics Dashboard
- [x] Create Analytics page with comprehensive metrics (Analytics.tsx)
- [x] Add ROI tracking and visualization (ROI bar chart)
- [x] Implement conversion rate analysis (conversion rate line chart)
- [x] Add campaign performance comparison charts (revenue vs spent, budget allocation)
- [x] Create custom date range filtering for analytics (date range inputs)

## Phase 11: Team Collaboration Comments
- [x] Create Comments component for tasks and campaigns (CommentsSection.tsx)
- [x] Add @mentions support with user suggestions (mention detection and dropdown)
- [x] Implement comment threads with nested replies (recursive reply rendering)
- [x] Add real-time comment notifications (toast on new comments)
- [x] Create comment editing and deletion functionality (edit/delete buttons)

## Phase 12: Performance Alerts System
- [x] Create Alerts configuration page (Alerts.tsx)
- [x] Implement ROI threshold alerts (roi_decline type)
- [x] Add conversion rate decline alerts (conversion_drop type)
- [x] Create budget overspend alerts (budget_overspend type)
- [x] Add email notification delivery for alerts (notifyEmail toggle)

## Phase 13: Client Portal Dashboard Enhancement
- [x] Enhance ClientPortal with campaign progress tracking (progress bars)
- [x] Add real-time performance metrics display (4 metric cards: active campaigns, ROI, conversion rate, completed)
- [x] Create deliverables checklist view (campaign cards with metrics)
- [x] Implement secure client access control (token-based access)
- [x] Add client notification preferences (existing in AccessDetails)

## Phase 14: Automated Weekly Reports
- [x] Create report scheduling configuration page (ReportScheduling.tsx)
- [x] Implement weekly report generation logic (frequency: weekly, biweekly, monthly)
- [x] Add email delivery for scheduled reports (recipients configuration)
- [x] Create customizable report templates (include metrics, recommendations, insights toggles)
- [x] Add report delivery tracking and logs (lastSent, nextSend timestamps)

## Phase 15: Team Collaboration Workflows
- [x] Create approval chain system for campaigns (WorkflowApprovals component)
- [x] Implement task assignment workflows (approver timeline with status tracking)
- [x] Add handoff notifications between team members (toast notifications on approve/reject)
- [x] Create workflow status tracking (overall status, progress bar, approver status)
- [x] Add workflow history and audit logs (comments, timestamps, approver details)

## Phase 16: Client Feedback Portal
- [x] Create feedback submission form (ClientFeedback component with dialog)
- [x] Implement request tracking system (feedback list with status tracking)
- [x] Add status update notifications (toast notifications on submit/response)
- [x] Create feedback dashboard for clients (ClientFeedbackPage)
- [x] Add feedback response management (response threads with timestamps)

## Phase 17: Bulk Campaign Actions
- [x] Add multi-select checkboxes to campaign cards (checkbox in each row + header select-all)
- [x] Create batch action toolbar (blue toolbar with action buttons)
- [x] Implement bulk approve/reject operations (bulk approve to active status)
- [x] Add bulk archive functionality (bulk archive to completed status)
- [x] Create confirmation dialogs for bulk actions (AlertDialog for each action)

## Phase 18: Export & Sharing
- [x] Add PDF export for reports (ExportShare component with PDF format)
- [x] Add Excel export for analytics data (CSV export format)
- [x] Create secure sharing links with expiration (7/30/90 day options)
- [x] Implement download tracking (toast notifications)
- [x] Add email sharing functionality (email input with send button)
