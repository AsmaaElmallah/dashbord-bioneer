# Prompt 01 — اكتشاف تطبيق بيانور واتجاه لوحة التحكم

## Summary

تطبيق **بيانور** (Flutter) تعليمي للأمهات والأطفال الرضع/الصغار، عربي **RTL**، بهوية **BeBo Royal**: بنفسجي ملكي، ذهبي، تركواز، خلفية كريمية، بطاقات clay/tactile ناعمة.

لوحة التحكم ستُبنى كمشروع **React + Vite** منفصل: `bayanour_admin_ui` — **UI فقط**، mock data، **بدون تعديل** على `bayanour/`.

## الهوية البصرية (من `lib/core/theme`)

| Token | القيمة | الاستخدام |
|-------|--------|-----------|
| primary | `#6D28D9` | أزرار، عناوين، sidebar نشط |
| secondary | `#D97706` | تمييز، badges ذهبية |
| tertiary | `#0891B2` | معلومات، روابط ثانوية |
| background | `#FAF5FF` | خلفية الصفحات |
| surface | `#FFFFFF` | بطاقات |
| track Quran | `#FFAA00` | مسار القرآن |
| track Math | `#FF7043` | الحساب |
| track Visual | `#9C6FD6` | البصري |
| track Emotional | `#F1758E` | العاطفي |

- خط: **XPNiloofar** (عربي)
- أيقونات: Material Symbols في التطبيق؛ في Admin: `lucide-react` خفيف
- بطاقات: `border-radius` كبير (~16–28px)، ظلال ناعمة clay

## أقسام التطبيق (من Router + Home Menu)

1. **Onboarding:** splash, video intro, login/signup, rules, subscription, onboarding questions (طفل، تغذية، نوم)
2. **Home:** منهج، قرآن، ماث، بصري، عاطفي، مكتبة وسائط، أنشطة، تمارين، مجتمع، تقييمات، دعم
3. **Quran:** 50 ختمة، جلسات نصف حزب، قارئ أحمد خضر
4. **Math:** منهج أيام 1–66+، حزم PPTX/manifest (q_129_132, dot_numeric, beads)
5. **Visual / Emotional:** مناهج شرائح + manifest.json
6. **Library:** موسيقى هادئة، تهويدات، أصوات طبيعة (YouTube embed)
7. **Activities / Exercises:** حسب العمر + YouTube
8. **Community:** نادي الأمهات، FAQ، شكاوى/اقتراحات
9. **Assessment:** اختبارات الأم، تقييمنا
10. **Support:** استشارات، مشاكل شائعة

## قرار البناء

- **المكان:** `stitch_remix_of_baby_learning_splash_screen/bayanour_admin_ui/`
- **السبب:** فصل كامل عن APK، تشغيل `npm run dev` للعرض على العميل، لا يمس build Flutter

## مراحل التنفيذ (Prompts 02–25)

1. Shell + navigation (02)
2. Design system (03)
3. صفحات 04–21 (وظيفية)
4. بحث، responsive، polish، audit (22–25)

## التشغيل

بعد Prompt 02:

```bash
cd bayanour_admin_ui
npm install
npm run dev
```

افتح: `http://localhost:5173`

## حدود

- لا Backend / API / DB
- أزرار الحفظ → snackbar «UI فقط»
