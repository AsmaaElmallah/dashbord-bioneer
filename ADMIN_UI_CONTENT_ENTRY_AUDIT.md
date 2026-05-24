# Prompt 31 — اتجاه إدخال المحتوى ومراجعة الفجوات (UI فقط)

**التاريخ:** 2026-05-23  
**المشروع:** `bayanour_admin_ui` (React + Vite)  
**المرجع:** `ADMIN_UI_BUILD_PROMPTS.md` (prototype) → `ADMIN_UI_CONTENT_ENTRY_PROMPTS.md` (توسيع إدخال المحتوى)

---

## Summary

لوحة بيانور الحالية **prototype إداري** يعرض المحتوى والمناهج والتوجيه **للقراءة والمعاينة** أكثر من كونه **معالج إدخال موحّد**.  
أقرب تجربة CMS موجودة في **`/cms`** (نصوص ثابتة + محرر شكلي).  
**`/targeting`** يغطي «أين ومتى ولمن» لكن **منفصل** عن إنشاء المحتوى.  
صفحات المناهج (قرآن، حساب، بصري، عاطفي) **جداول + معاينة** بدون نموذج «إضافة جديد».  
**`/assets`** و **`/library`** و **`/activities`** و **`/assessments`** و **`/notifications`** كل منها جزء من puzzle إدخال المحتوى لكن **بدون مسار واحد من «نوع المحتوى → إدخال → توجيه → مراجعة → نشر»**.

**المرحلة التالية (Prompts 32+):** بناء **Content Entry Hub** أو توسيع الصفحات الحالية بمعالجات mock موحّدة — **UI فقط، local state، snackbar**.

**تأكيد:** هذا الملف **تحليل وتوثيق فقط** — لم يُعدَّل كود الواجهة.

---

## 1. الصفحات الموجودة التي تشبه CMS

| الصفحة | المسار | ما يفعله اليوم | درجة شبيه CMS |
|--------|--------|----------------|---------------|
| **محتوى ثابت** | `/cms` | أقسام sidebar، جدول عناصر، محرر عنوان/نص/وسوم، معاينة، حفظ mock | **عالية** — الأقرب لـ CMS |
| **توجيه المحتوى** | `/targeting` | معالج 4 خطوات: نوع، جمهور، مكان، شروط + معاينة «سيظهر عند/في/لـ» | **متوسطة** — metadata فقط، لا إنشاء محتوى |
| **المكتبة** | `/library` | جدول YouTube (videoId/playlistId)، فلاتر، معاينة thumbnail | **متوسطة** — catalog، لا form إضافة |
| **الملفات والأصول** | `/assets` | جدول manifest/صور/صوت، رفع mock، فلتر أقسام | **متوسطة** — asset browser، لا ربط بدرس |
| **الإشعارات** | `/notifications` | composer عنوان/نص/جمهور + معاينة جوال | **متوسطة** — نوع «إشعار» فقط |
| **القرآن** | `/quran` | جلسات، قرّاء، خطة ختمة — عرض واختيار صف | **منخفضة** — إدارة catalog |
| **الحساب / البصري / العاطفي** | `/math`, `/visual`, `/emotional` | دروس، حزم، شرائح — جداول + معاينة slide | **منخفضة** — لا wizard إضافة درس |
| **الأنشطة والرياضة** | `/activities` | أنشطة/تمارين/فئات عمرية — جداول + معاينة | **منخفضة** — لا form إنشاء |
| **التقييمات** | `/assessments` | أسئلة، نتائج، توصيات — عرض | **منخفضة** — لا builder اختبار |
| **المناهج** | `/curriculum` | hub + روابط لمسارات | **منخفضة** — navigation hub |

**الخلاصة:** CMS حقيقي شكلياً = **`CmsPage`** + أجزاء من **`TargetingPage`** + **`NotificationsPage`**. الباقي **عرض وإدارة mock** وليس **إدخال من الصفر**.

---

## 2. المدخلات الناقصة لإضافة محتوى «كامل» (UI)

### 2.1 مدخلات مشتركة (غير موجودة في مكان واحد)

| المدخل | الحالة الحالية | المطلوب UI لاحقاً |
|--------|----------------|-------------------|
| **اختيار نوع المحتوى** | موزّع (targeting types vs cms types) | شاشة/خطوة 1 موحّدة لكل الأنواع |
| **العنوان + الوصف** | CMS فقط (نص) | كل الأنواع |
| **اللغة** | CMS (حقل language) | توسيع لباقي الأنواع |
| **الفئة العمرية** | Targeting (جمهور) | ربط صريح بخطوة إدخال المحتوى |
| **مكان الظهور في التطبيق** | Targeting (placement) | نفس المعالج بعد الإدخال |
| **شروط الظهور** | Targeting (conditions) | نفس المعالج |
| **حالة النشر** (مسودة/مراجعة/منشور) | CMS status + targeting publishStatus | موحّد في كل النماذج |
| **معاينة قبل النشر** | CMS preview + targeting preview | preview حسب النوع (فيديو/شريحة/سؤال…) |
| **ربط ملفات** (صورة/صوت/فيديو) | Assets (جدول) + Library (YouTube IDs) | picker mock من Assets أو URL |
| **«إضافة جديد»** | لا يوجد زر/معالج موحّد | Content Entry Hub (Prompt لاحق) |

### 2.2 حسب نوع المحتوى

| النوع | موجود جزئياً في | ناقص UI |
|-------|------------------|---------|
| مقال / نص ثابت | `/cms` | rich text mock، صورة غلاف، SEO |
| فيديو YouTube | `/library` | form إضافة (videoId، mood، فئة) |
| Playlist YouTube | `/library` | form playlistId + عناصر |
| صورة | `/assets` | ربط بشريحة/درس، alt text |
| صوت | `/assets`, `/quran` | رفع mock + ربط جلسة/شريحة |
| شريحة درس | `/math`, `/visual`, `/emotional` | form: رقم عالمي، صورة، صوت، نص |
| درس كامل | مسارات المناهج | form: عدد شرائح، أيام، تكرار |
| نشاط | `/activities` | form: عمر، YouTube، وصف |
| تمرين | `/activities` | form: مجموعة عضلية، مدة |
| سؤال تقييم | `/assessments` | form: نص، خيارات، مسار |
| اختبار كامل | `/assessments` | builder: ترتيب أسئلة، عمر |
| إشعار | `/notifications` | موجود composer — ربط targeting |
| جلسة قرآن | `/quran` | form: سورة/آيات، mp3، ترتيب |

---

## 3. أنواع المحتوى — دعم UI مطلوب (Prompt 31)

يجب أن تدعمها **واجهات mock** في Prompts 32+ (بدون Backend):

1. مقال / نص ثابت  
2. فيديو YouTube  
3. Playlist YouTube  
4. صورة  
5. صوت  
6. شريحة درس  
7. درس كامل  
8. نشاط  
9. تمرين  
10. سؤال تقييم  
11. اختبار كامل  
12. إشعار  
13. جلسة قرآن  

**مصدر التوافق:** `targetingContentTypes` في `mockData.js` يغطي معظمها؛ ينقص **Playlist** و **جلسة قرآن** و **صورة** كأنواع صريحة — يُضاف في prompts لاحقة.

---

## 4. الربط الشكلي: إدخال المحتوى ↔ توجيه المحتوى

```
┌─────────────────────────────────────────────────────────────┐
│  (مستقبل) Content Entry Hub  —  «إضافة محتوى جديد»         │
│  الخطوة 1: نوع المحتوى (13 نوع)                             │
│  الخطوة 2: حقول الإدخال حسب الن type (نص/رابط/ملف mock)     │
│  الخطوة 3: Assets picker (اختياري) ← /assets                 │
│  الخطوة 4: التوجيه ← نفس منطق /targeting                    │
│         · الجمهور (BabyAgeRange)                             │
│         · مكان الظهور (home_menu / مسار)                     │
│         · شروط (دائم، يوم منهج، بعد اختبار…)                │
│  الخطوة 5: معاينة «سيظهر عند مين وفين» + preview المحتوى    │
│  الخطوة 6: حفظ/نشر mock → snackbar UI فقط                   │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   mockData.js (محلي)          TargetingPage rules table
   + صفحة التخصص              (قواعد الظهور mock)
   (library/quran/math…)
```

**اليوم:**

- **`CmsPage`:** إدخال نص → `showsWhen` نصي → **لا** يربط تلقائياً بـ Targeting wizard.
- **`TargetingPage`:** يفترض المحتوى **موجود** (`contentType` + `placement`) — **لا** ينشئ body/videoId.
- **`LibraryPage` / track pages:** catalog من Flutter constants — **لا** flow «جديد».

**التوصية لـ Prompts 32–40:**

1. **Hub واحد** `/content/new` أو توسيع Overview بـ «إضافة محتوى» يفتح معالج mock.  
2. **إعادة استخدام** مكونات: `cms-field`, `wizard-steps`, `targeting-preview`, `MockActionButton`.  
3. **Deep link:** من Hub بعد اختيار «فيديو» → pre-fill `/library` filters؛ «مقال» → `/cms`؛ «شريحة» → `/math` مع lesson picker.  
4. **حقل مشترك `showsWhen`** في mock (موجود في cms + library items) يُعرض في Targeting preview.

---

## 5. خريطة سريعة: صفحة → دور في إدخال المحتوى

| الهدف | الصفحة الحالية | بعد التوسيع (مقترح) |
|-------|----------------|---------------------|
| نصوص ثابتة | `/cms` | + زر «مقال جديد» + draft local |
| وسائط YouTube | `/library` | + form إضافة |
| أصول | `/assets` | + picker في Hub |
| مناهج | `/curriculum` → tracks | + «درس/شريحة جديدة» per track |
| قرآن | `/quran` | + «جلسة جديدة» mock |
| أنشطة | `/activities` | + form نشاط/تمرين |
| تقييم | `/assessments` | + form سؤال/اختبار |
| إشعار | `/notifications` | + ربط targeting من composer |
| توجيه | `/targeting` | + «بعد إنشاء المحتوى» step من Hub |
| نشر | snackbar everywhere | بدون تغيير |

---

## 6. ما لم يُلمس (حسب Prompt 31)

- ❌ لا Backend / API / DB  
- ❌ لا تعديل `bayanour/` (Flutter)  
- ❌ لا تعديل JSX/CSS للوحة (هذا الملف توثيق فقط)

---

## الملفات التي قُرئت

| ملف | الغرض |
|-----|--------|
| `ADMIN_UI_BUILD_PROMPTS.md` | سياق prototype 01–30 |
| `ADMIN_UI_CONTENT_ENTRY_PROMPTS.md` | قواعد Content Entry |
| `src/App.jsx` | المسارات |
| `src/config/navigation.js` | sidebar |
| `src/data/mockData.js` | mock + targeting + cms |
| `src/pages/CmsPage.jsx` | CMS الحالي |
| `src/pages/TargetingPage.jsx` | توجيه المحتوى |
| `src/pages/AssetsPage.jsx` | الأصول |
| `src/pages/LibraryPage.jsx` | المكتبة |
| `src/pages/ActivitiesPage.jsx` | أنشطة/تمارين |
| `src/pages/MathPage.jsx` | حساب |
| `src/pages/VisualPage.jsx` | بصري |
| `src/pages/EmotionalPage.jsx` | عاطفي |
| `src/pages/QuranPage.jsx` | قرآن |

---

## الملف المُضاف

- **`ADMIN_UI_CONTENT_ENTRY_AUDIT.md`** (هذا الملف)

---

## طريقة مشاهدة النتيجة

افتح الملف في المحرر أو على GitHub بعد push:

`bayanour_admin_ui/ADMIN_UI_CONTENT_ENTRY_AUDIT.md`

لا يتطلب `npm run dev` — **توثيق فقط**.

---

## تأكيد

**مرحلة تحليل UI فقط** — لا حفظ حقيقي، لا Backend، لا تغيير في الواجهة في Prompt 31.

**Prompt 32+** يبدأ بناء واجهات إدخال المحتوى وفق هذا الـ audit.
