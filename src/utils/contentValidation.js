import { getAgeTargetingWarnings } from './ageTargeting';
import { getMediaValidation } from './mediaUpload';
import { buildPlacementPreview, placementSectionKey } from './placement';

export const validationStatusMeta = {
  ready: { id: 'ready', label: 'جاهز للنشر', tone: 'success' },
  review: { id: 'review', label: 'يحتاج مراجعة', tone: 'warning' },
  incomplete: { id: 'incomplete', label: 'ناقص بيانات', tone: 'error' },
};

function isAgeSet(ageTargeting) {
  if (!ageTargeting) return false;
  if (ageTargeting.mode === 'all') return true;
  if (ageTargeting.mode === 'custom') {
    return (
      ageTargeting.customFromMonths <= ageTargeting.customToMonths &&
      ageTargeting.customToMonths > 0
    );
  }
  return (
    (ageTargeting.onboardingSelected?.length ?? 0) > 0 ||
    (ageTargeting.mediaSelected?.length ?? 0) > 0
  );
}

function areConditionsLogical(wizard) {
  if (!wizard.conditions?.length) {
    return { ok: false, message: 'اختر شرط ظهور واحداً على الأقل' };
  }
  if (wizard.conditions.includes('تاريخ بداية ونهاية')) {
    if (!wizard.dateStart || !wizard.dateEnd) {
      return { ok: false, message: 'حدّد تاريخ البداية والنهاية' };
    }
    if (wizard.dateStart > wizard.dateEnd) {
      return { ok: false, message: 'تاريخ البداية بعد تاريخ النهاية' };
    }
  }
  return { ok: true, message: '' };
}

function areLinksComplete(wizard) {
  const media = wizard.mediaUpload ?? {};
  const type = wizard.contentType ?? '';
  const youtubeTypes = ['فيديو', 'تمرين', 'نشاط', 'Playlist'];
  if (youtubeTypes.some((t) => type.includes(t) || type === t)) {
    const hasYoutube = Boolean(media.youtubeVideoId?.trim() || media.playlistId?.trim());
    if (!hasYoutube) {
      return { ok: false, message: 'أضف videoId أو playlistId' };
    }
  }
  return { ok: true, message: '' };
}

function areRequiredFilesPresent(wizard) {
  const issues = getMediaValidation(wizard.contentType, wizard.mediaUpload ?? {});
  if (issues.length > 0) {
    return { ok: false, message: issues[0].message };
  }
  const type = wizard.contentType ?? '';
  const needsCover = ['مقال', 'درس', 'إشعار'].some((t) => type.includes(t));
  const media = wizard.mediaUpload ?? {};
  if (needsCover && !media.coverImage && !media.youtubeVideoId?.trim()) {
    return { ok: false, message: 'يُفضّل إضافة صورة غلاف أو وسائط' };
  }
  return { ok: true, message: '' };
}

export function buildContentValidation(wizard) {
  const placementSection = placementSectionKey(wizard.placementId);
  const conditionsCheck = areConditionsLogical(wizard);
  const linksCheck = areLinksComplete(wizard);
  const filesCheck = areRequiredFilesPresent(wizard);
  const ageWarnings = getAgeTargetingWarnings(wizard.ageTargeting, {
    contentType: wizard.contentType,
    section: placementSection,
  });

  const checks = [
    {
      id: 'title',
      label: 'العنوان موجود',
      ok: (wizard.title?.trim().length ?? 0) >= 3,
      field: 'title',
      hint: 'أدخل عنواناً (3 أحرف على الأقل)',
    },
    {
      id: 'contentType',
      label: 'النوع محدد',
      ok: Boolean(wizard.contentType?.trim()),
      field: 'contentType',
      hint: 'اختر نوع المحتوى من الخطوة 1',
    },
    {
      id: 'age',
      label: 'العمر محدد',
      ok: isAgeSet(wizard.ageTargeting),
      field: 'ageTargeting',
      hint: 'حدّد فئة عمرية أو «كل الأعمار»',
    },
    {
      id: 'placement',
      label: 'مكان الظهور محدد',
      ok: Boolean(wizard.placementId?.trim()),
      field: 'placementId',
      hint: 'اختر قسماً من PlacementPicker',
    },
    {
      id: 'publishStatus',
      label: 'حالة النشر محددة',
      ok: Boolean(wizard.publishStatus?.trim()),
      field: 'publishStatus',
      hint: 'اختر مسودة · مراجعة · أو منشور',
    },
    {
      id: 'files',
      label: 'الملفات المطلوبة موجودة',
      ok: filesCheck.ok,
      field: 'mediaUpload',
      hint: filesCheck.message || 'أكمل الوسائط حسب نوع المحتوى',
    },
    {
      id: 'links',
      label: 'لا توجد روابط ناقصة',
      ok: linksCheck.ok,
      field: 'mediaUpload',
      hint: linksCheck.message || 'تحقق من videoId / playlistId',
    },
    {
      id: 'conditions',
      label: 'شروط الظهور منطقية',
      ok: conditionsCheck.ok && ageWarnings.every((w) => w.id !== 'invalidRange'),
      field: 'conditions',
      hint:
        conditionsCheck.message ||
        ageWarnings.find((w) => w.id === 'invalidRange')?.message ||
        'راجع شروط الظهور والتواريخ',
    },
  ];

  const failed = checks.filter((c) => !c.ok);
  const fieldErrors = {};
  checks.forEach((c) => {
    if (!c.ok && c.field) {
      fieldErrors[c.field] = fieldErrors[c.field] ?? c.hint;
    }
  });
  ageWarnings.forEach((w) => {
    fieldErrors.ageTargeting = fieldErrors.ageTargeting ?? w.message;
  });

  let status = 'ready';
  if (failed.length > 0) {
    status = 'incomplete';
  } else if (
    wizard.publishStatus === 'يحتاج مراجعة' ||
    ageWarnings.length > 0 ||
    !filesCheck.ok
  ) {
    status = 'review';
  }

  return {
    checks,
    status,
    statusMeta: validationStatusMeta[status],
    fieldErrors,
    passedCount: checks.filter((c) => c.ok).length,
    totalCount: checks.length,
    placementPreview: buildPlacementPreview(wizard.placementId),
  };
}

export function getFieldError(fieldErrors, field) {
  return fieldErrors?.[field] ?? null;
}
