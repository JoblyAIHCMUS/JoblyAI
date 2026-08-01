'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/contexts/page-title-context';
import { useCandidateProfileContext } from '@/api-hook/candidate';

import ProfileHeader from './components/ProfileHeader';
import AboutMe from './components/AboutMe';
import CV, { type CVRef } from './components/CV';
import Experiences from './components/Experiences';
import Educations from './components/Educations';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
// import Portfolios from './components/Portfolios';
import { useUploadFile } from '@/api-hook/gcs';
import { useCreateResume } from '@/api-hook/candidate';
import { useUpdateResume } from '@/api-hook/candidate/useUpdateResume';
import { useDeleteResume } from '@/api-hook/candidate/useDeleteResume';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';
import { useUpdateCandidateAbout } from '@/api-hook/candidate/useUpdateCandidateAbout';
import {
  useUpdateExperience,
  useCreateExperience,
  useDeleteExperience,
  useUpdateEducation,
  useCreateEducation,
  useDeleteEducation,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  useCreateSocial,
  useUpdateSocial,
  useDeleteSocial,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from '@/api-hook/candidate';
import { useDeleteSkill } from '@/api-hook/candidate/useDeleteSkill';
import { useCreateSkill } from '@/api-hook/candidate/useCreateSkill';
import { useUpdateSkill } from '@/api-hook/candidate/useUpdateSkill';
import {
  mapUIToApiCreateExperience,
  mapUIToApiUpdateExperience,
  mapUIToApiUpdateEducation,
  mapUIToApiCreateEducation,
  mapUIToApiCreateCertificate,
  mapUIToApiUpdateCertificate,
  mapUIToApiCreateSocial,
  mapUIToApiUpdateSocial,
  mapUIToApiCreateContact,
  mapUIToApiUpdateContact,
  mapDataToCandidate,
} from './mapper';
import {
  CandidateEducation,
  CandidateExperience,
  CandidateResume,
  CandidateCertificate,
  CandidateSocial,
  CandidateContact,
} from '@/types/candidate';
import { CandidateProfileUI } from './types';
import { formatErrorForDisplay } from '@/lib/errors';
import { CvSyncCompareModal } from './components/CvSyncCompareModal';
import { CvDeleteImpactModal } from './components/CvDeleteImpactModal';
import { AiFeedbackModal } from './components/AiFeedbackModal';
import { ProfilePdfTemplate } from './components/ProfilePdfTemplate';
import { exportElementToPdf } from './utils/exportPdf';
import { OverleafCvExportModal } from './components/OverleafCvExportModal';
import {
  commitResumeMerge,
  triggerAiParse,
  triggerAiScore,
} from '@/api-client/ai';

const CandidateProfilePage = () => {
  const { setTitle } = usePageTitle();
  const { data: candidateProfile, fetchCandidateProfile } =
    useCandidateProfileContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [deleteImpactModalOpen, setDeleteImpactModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [processingTasks, setProcessingTasks] = useState<
    Record<
      number,
      {
        parsing: boolean;
        scoring: boolean;
        parsingStartTime?: number;
        scoringStartTime?: number;
      }
    >
  >(() => {
    // Lazy initialization from sessionStorage to persist across tab switches
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('jobly_ai_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert string keys back to numbers if they were serialized as strings
          const rehydrated: Record<
            number,
            {
              parsing: boolean;
              scoring: boolean;
              parsingStartTime?: number;
              scoringStartTime?: number;
            }
          > = {};
          Object.keys(parsed).forEach((key) => {
            rehydrated[Number(key)] = parsed[key];
          });
          return rehydrated;
        } catch (e) {
          console.error(
            '[CandidateProfilePage] Failed to parse saved AI tasks:',
            e
          );
        }
      }
    }
    return {};
  });

  // Persist processing tasks to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('jobly_ai_tasks', JSON.stringify(processingTasks));
  }, [processingTasks]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const cvRef = useRef<CVRef>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const modalPdfRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    if (!pdfContainerRef.current) return;
    setIsExportingPdf(true);
    const toastId = toast.loading('Exporting profile to PDF (LaTeX style)...');
    try {
      const candidateName = profile?.name || candidate?.name || 'Candidate';
      const fileName = `${candidateName.replace(/\s+/g, '_')}_LaTeX_Profile.pdf`;
      await exportElementToPdf(pdfContainerRef.current, {
        fileName,
      });
      toast.success('LaTeX-style PDF exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF. Please try again.', { id: toastId });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle opening modals via URL parameters (for redirection from other pages)
  useEffect(() => {
    const openSyncModal = searchParams.get('openSyncModal');
    const openFeedbackModal = searchParams.get('openFeedbackModal');

    if (openSyncModal) {
      setActiveResumeId(parseInt(openSyncModal));
      setSyncModalOpen(true);
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('openSyncModal');
      router.replace(`/candidate/profile?${params.toString()}`, {
        scroll: false,
      });
    }

    if (openFeedbackModal) {
      setActiveResumeId(parseInt(openFeedbackModal));
      setFeedbackModalOpen(true);
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('openFeedbackModal');
      router.replace(`/candidate/profile?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [searchParams, router]);

  // Warning when leaving page during AI processing
  useEffect(() => {
    const hasAnyTask = Object.values(processingTasks).some(
      (t) => t.parsing || t.scoring
    );
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyTask || isSyncing) {
        e.preventDefault();
        e.returnValue =
          'Operation in progress. Leaving now will stop the feature. Are you sure?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [processingTasks, isSyncing]);

  // Reconcile processingTasks with actual profile data
  // This is a safety net in case we missed a socket event while on another tab
  useEffect(() => {
    // If we have no profile yet, or it's loading, don't clear anything yet
    // But if we have an empty resumes list, we should check if tasks are stale
    const resumes = profile?.resumes || [];
    const resumeIds = new Set(resumes.map((r) => r.id));

    let hasChanges = false;
    const nextTasks = { ...processingTasks };
    const now = Date.now();
    const GRACE_PERIOD = 30000; // 30 seconds for data to reflect after event
    const TIMEOUT_PERIOD = 300000; // 5 minutes absolute timeout for any task

    // Check all current tasks
    Object.keys(nextTasks).forEach((idStr) => {
      const id = parseInt(idStr);
      const task = nextTasks[id] as
        | {
            parsing?: boolean;
            scoring?: boolean;
            parsingStartTime?: number;
            scoringStartTime?: number;
          }
        | undefined;
      if (!task) return;

      const resume = resumes.find((r) => r.id === id);

      // Scenario 1: Resume no longer exists (deleted)
      // ONLY check this if profile data has actually been loaded
      if (profile && !resumeIds.has(id)) {
        // If it's a very new task, maybe the resume list hasn't updated yet
        const startTime = Math.min(
          task.parsingStartTime || now,
          task.scoringStartTime || now
        );
        if (now - startTime > 15000) {
          // Increased to 15 seconds grace
          console.log(
            `[CandidateProfilePage] 🧹 Clearing task for non-existent resume ${id}`
          );
          delete nextTasks[id];
          hasChanges = true;
          return;
        }
      }

      // Scenario 2: Data already reflects completion
      if (resume) {
        // If resume already has parsedText, it's no longer parsing
        if (
          resume.parsedText &&
          task.parsing &&
          (!task.parsingStartTime || now - task.parsingStartTime > GRACE_PERIOD)
        ) {
          console.log(
            `[CandidateProfilePage] 🧹 Task completed: parsing for ${id}`
          );
          task.parsing = false;
          hasChanges = true;
        }

        // If resume already has aiScore, it's no longer scoring
        if (
          resume.aiScore !== null &&
          task.scoring &&
          (!task.scoringStartTime || now - task.scoringStartTime > GRACE_PERIOD)
        ) {
          console.log(
            `[CandidateProfilePage] 🧹 Task completed: scoring for ${id}`
          );
          task.scoring = false;
          hasChanges = true;
        }
      }

      // Scenario 3: Absolute timeout (backend/socket failure)
      const startTime = Math.min(
        task.parsingStartTime || now,
        task.scoringStartTime || now
      );
      if (now - startTime > TIMEOUT_PERIOD) {
        console.warn(
          `[CandidateProfilePage] ⚠️ Task for resume ${id} timed out after 5 mins`
        );
        delete nextTasks[id];
        hasChanges = true;
        return;
      }

      // Clean up empty tasks
      if (!task.parsing && !task.scoring) {
        delete nextTasks[id];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log('[CandidateProfilePage] 🔄 Reconciled AI tasks updated');
      setProcessingTasks(nextTasks);
    }
  }, [profile?.resumes, processingTasks]);

  useEffect(() => {
    const handleOpenSyncModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log(
        '[CandidateProfilePage] Opening sync modal for resume:',
        customEvent.detail.resumeId
      );
      setActiveResumeId(customEvent.detail.resumeId);
      setSyncModalOpen(true);
    };

    const handleOpenFeedbackModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log(
        '[CandidateProfilePage] Opening feedback modal for resume:',
        customEvent.detail.resumeId
      );
      setActiveResumeId(customEvent.detail.resumeId);
      setFeedbackModalOpen(true);
    };

    const handleTriggerAiParse = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const resumeId = customEvent.detail.resumeId;

      console.log(
        '[CandidateProfilePage] Triggering AI parse for resume:',
        resumeId
      );
      setProcessingTasks((prev) => ({
        ...prev,
        [resumeId]: {
          ...(prev[resumeId] || { scoring: false }),
          parsing: true,
          parsingStartTime: Date.now(),
        },
      }));

      // Locally clear parsedText to avoid reconciliation logic prematurely turning off the spinner
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          resumes: prev.resumes?.map((r) =>
            r.id === resumeId
              ? { ...r, parsedText: null, isSyncedToProfile: false }
              : r
          ),
        };
      });

      toast.info('AI is extracting data from your resume...', {
        id: `ai-parsing-${resumeId}`,
        description:
          'This usually takes 10-20 seconds. We will notify you when it is done.',
        duration: Infinity,
      });

      try {
        await triggerAiParse(resumeId);
      } catch (error) {
        console.error(
          '[CandidateProfilePage] Failed to trigger AI parse:',
          error
        );
        setProcessingTasks((prev) => ({
          ...prev,
          [resumeId]: {
            ...(prev[resumeId] || { scoring: false }),
            parsing: false,
          },
        }));
        toast.dismiss(`ai-parsing-${resumeId}`);
        toast.error('Failed to start data extraction');
      }
    };

    const handleTriggerAiScore = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const resumeId = customEvent.detail.resumeId;

      console.log(
        '[CandidateProfilePage] Triggering AI score for resume:',
        resumeId
      );
      setProcessingTasks((prev) => ({
        ...prev,
        [resumeId]: {
          ...(prev[resumeId] || { parsing: false }),
          scoring: true,
          scoringStartTime: Date.now(),
        },
      }));

      // Locally clear score to avoid reconciliation logic prematurely turning off the spinner
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          resumes: prev.resumes?.map((r) =>
            r.id === resumeId ? { ...r, aiScore: null, aiFeedback: null } : r
          ),
        };
      });

      toast.info('AI is scoring your resume...', {
        id: `ai-scoring-${resumeId}`,
        description: 'This usually takes 10-15 seconds.',
        duration: Infinity,
      });

      try {
        await triggerAiScore(resumeId);
      } catch (error) {
        console.error(
          '[CandidateProfilePage] Failed to trigger AI score:',
          error
        );
        setProcessingTasks((prev) => ({
          ...prev,
          [resumeId]: {
            ...(prev[resumeId] || { parsing: false }),
            scoring: false,
          },
        }));
        toast.dismiss(`ai-scoring-${resumeId}`);
        toast.error('Failed to start AI scoring');
      }
    };

    const handleAiFinished = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { resumeId } = customEvent.detail;
      const type = e.type;
      const rid = Number(resumeId);

      console.log(
        `[CandidateProfilePage] 🏁 AI processing finished event received: ${type} for resume ${rid}`
      );

      setProcessingTasks((prev) => {
        const next = { ...prev };
        const current = next[rid] || { parsing: false, scoring: false };

        if (type === 'ai-parsed-success') {
          next[rid] = { ...current, parsing: false };
        } else if (type === 'ai-scored-success') {
          next[rid] = { ...current, scoring: false };
        }

        // Nếu cả hai tác vụ đã xong, hoặc tác vụ cụ thể vừa xong không còn cái nào khác đang chạy
        const updated = next[rid];
        if (updated && !updated.parsing && !updated.scoring) {
          console.log(
            `[CandidateProfilePage] Task complete for resume ${rid}, dismissing toasts`
          );
          toast.dismiss(`ai-parsing-${rid}`);
          toast.dismiss(`ai-scoring-${rid}`);
          delete next[rid];
        }

        return next;
      });

      // Dismiss the toast corresponding to the event that just finished, after a short delay to ensure UI transition
      if (type === 'ai-parsed-success') {
        setTimeout(() => toast.dismiss(`ai-parsing-${rid}`), 500);
      } else if (type === 'ai-scored-success') {
        setTimeout(() => toast.dismiss(`ai-scoring-${rid}`), 500);
      }

      console.log('[CandidateProfilePage] Refreshing profile data...');
      fetchCandidateProfile({ forceRefresh: true });
    };

    window.addEventListener('OPEN_CV_SYNC_MODAL', handleOpenSyncModal);
    window.addEventListener('OPEN_AI_FEEDBACK_MODAL', handleOpenFeedbackModal);
    window.addEventListener('TRIGGER_AI_PARSE', handleTriggerAiParse);
    window.addEventListener('TRIGGER_AI_SCORE', handleTriggerAiScore);
    window.addEventListener('ai-parsed-success', handleAiFinished);
    window.addEventListener('ai-scored-success', handleAiFinished);

    return () => {
      window.removeEventListener('OPEN_CV_SYNC_MODAL', handleOpenSyncModal);
      window.removeEventListener(
        'OPEN_AI_FEEDBACK_MODAL',
        handleOpenFeedbackModal
      );
      window.removeEventListener('TRIGGER_AI_PARSE', handleTriggerAiParse);
      window.removeEventListener('TRIGGER_AI_SCORE', handleTriggerAiScore);
      window.removeEventListener('ai-parsed-success', handleAiFinished);
      window.removeEventListener('ai-scored-success', handleAiFinished);
    };
  }, [fetchCandidateProfile]);

  const handleSyncResume = async (
    modifiedDraftData?: Record<string, unknown>
  ) => {
    if (!activeResumeId || !profile) return;

    const resume = profile.resumes?.find((r) => r.id === activeResumeId);
    if (!resume || !resume.parsedText) {
      console.warn(
        '[CandidateProfilePage] Cannot sync: Resume or parsedText missing',
        { activeResumeId, resume }
      );
      return;
    }

    console.log(
      '[CandidateProfilePage] 🔄 Starting sync for resume:',
      activeResumeId
    );
    setIsSyncing(true);
    try {
      // Use modifiedDraftData if provided, otherwise fallback to original parsedText
      const dataToSync =
        modifiedDraftData ||
        (typeof resume.parsedText === 'string'
          ? JSON.parse(resume.parsedText)
          : resume.parsedText);

      await commitResumeMerge(activeResumeId, dataToSync);
      console.log('[CandidateProfilePage] ✅ Sync API call successful');

      // CRITICAL: Force refresh data BEFORE closing modal
      const updatedProfile = await fetchCandidateProfile({
        forceRefresh: true,
      });

      if (updatedProfile) {
        console.log('[CandidateProfilePage] 📥 Profile refreshed after sync');
        setProfile({ ...updatedProfile });
      }

      toast.success('Profile synced with resume data!');
      setSyncModalOpen(false);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (error) {
      console.error('[CandidateProfilePage] ❌ Failed to sync profile:', error);
      toast.error('Failed to sync profile');
    } finally {
      console.log(
        '[CandidateProfilePage] 🏁 Sync process finished, setting isSyncing=false'
      );
      setIsSyncing(false);
    }
  };

  const handleConfirmDeleteResume = async (keepData = false) => {
    if (!activeResumeId || !profile) return;

    const resumeId = activeResumeId;
    const resumeToDelete = profile.resumes?.find((r) => r.id === resumeId);
    if (!resumeToDelete) return;

    setDeletingResumeId(resumeId);
    try {
      console.log(
        '[CandidateProfilePage] Deleting resume:',
        resumeId,
        'keepData:',
        keepData
      );
      await deleteResumeRecord(resumeId, keepData);

      // CRITICAL: Force refresh data while modal is still open (showing loading state)
      // This ensures the backend cleanup (async until now) is reflected in the new profile
      const updatedProfile = await fetchCandidateProfile({
        forceRefresh: true,
      });
      if (updatedProfile) {
        setProfile({ ...updatedProfile });

        const nextSelectedId =
          updatedProfile.resumes?.find((resume) => resume.isDefault)?.id ||
          updatedProfile.resumes?.[0]?.id ||
          null;
        setSelectedResumeId(nextSelectedId);
      }

      toast.success('CV deleted successfully.');
      setDeleteImpactModalOpen(false);
    } catch (error) {
      console.error('Failed to delete CV:', error);
      toast.error('Failed to delete CV');
    } finally {
      setDeletingResumeId(null);
      setActiveResumeId(null);
    }
  };

  const {
    upload: uploadToS3,
    loading: uploading,
    error: uploadError,
  } = useUploadFile();
  const { createResumeRecord, loading: creatingResume } = useCreateResume({
    onSuccess: (resumeData: CandidateResume) => {
      console.log(
        '[CandidateProfilePage] Resume record created:',
        resumeData.id
      );

      const newResume = {
        ...resumeData,
        parsedText: null,
        aiScore: null,
        aiFeedback: null,
        isSyncedToProfile: false,
        isDefault: true,
      };

      setProfile((prev) => {
        if (!prev) return null;
        const nextResumes = (prev.resumes || []).map((r) => ({
          ...r,
          isDefault: false,
        }));
        return {
          ...prev,
          resumes: [...nextResumes, newResume],
        };
      });
      setSelectedResumeId(resumeData.id);
      cvRef.current?.refreshUrl(resumeData.fileKey);
      setUploadErrorMsg(null);

      // CRITICAL: Force refresh context so other tabs/pages see the new resume immediately
      fetchCandidateProfile({ forceRefresh: true });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save resume';
      setUploadErrorMsg(errorMsg);
    },
  });

  const { updateResumeRecord, loading: updatingResume } = useUpdateResume();
  const { deleteResumeRecord, loading: deletingResume } = useDeleteResume();

  const { updateAbout, createAbout } = useUpdateCandidateAbout();
  const handleUpdateAbout = async (aboutData: {
    id: number;
    bio?: string;
    title?: string;
  }) => {
    if (aboutData.id === 0) {
      const result = await createAbout({
        bio: aboutData.bio,
        title: aboutData.title,
      });
      setProfile((prev) => (prev ? { ...prev, about: result } : prev));
    } else {
      await updateAbout(aboutData);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          about: prev.about ? { ...prev.about, ...aboutData } : aboutData,
        };
      });
    }
  };

  const { updateExperienceRecord } = useUpdateExperience();
  const handleUpdateExperience = async (experiences: CandidateExperience) => {
    const apiExperience = mapUIToApiUpdateExperience(experiences);
    await updateExperienceRecord(apiExperience);
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedExperiences = prev.experiences?.map((exp) =>
        exp.id === experiences.id ? experiences : exp
      );
      return { ...prev, experiences: updatedExperiences };
    });
  };

  const { createExperienceRecord } = useCreateExperience();
  const handleAddExperience = async (experience: CandidateExperience) => {
    const apiExperience = mapUIToApiCreateExperience(experience);
    const created = await createExperienceRecord(apiExperience);
    if (!created) return;
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experiences: [...(prev.experiences || []), created],
      };
    });
  };

  const { deleteExperienceRecord } = useDeleteExperience();
  const handleDeleteExperience = async (id: number) => {
    await deleteExperienceRecord(id);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experiences: prev.experiences?.filter((exp) => exp.id !== id),
      };
    });
  };

  const { updateEducationRecord } = useUpdateEducation();
  const handleUpdateEducation = async (education: CandidateEducation) => {
    const apiEducation = mapUIToApiUpdateEducation(education);
    const updated = await updateEducationRecord(apiEducation);
    if (!updated) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedEducations = prev.educations?.map((edu) =>
        edu.id === updated.id ? updated : edu
      );
      return { ...prev, educations: updatedEducations };
    });
  };

  const { createEducationRecord } = useCreateEducation();
  const handleAddEducation = async (education: CandidateEducation) => {
    const apiEducation = mapUIToApiCreateEducation(education);
    const newEducation = await createEducationRecord(apiEducation);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        educations: [...(prev.educations || []), newEducation],
      };
    });
  };

  const { deleteEducationRecord } = useDeleteEducation();
  const handleDeleteEducation = async (id: number) => {
    await deleteEducationRecord(id);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        educations: prev.educations?.filter((edu) => edu.id !== id),
      };
    });
  };

  const { updateCertificateRecord } = useUpdateCertificate();
  const handleUpdateCertificate = async (cert: CandidateCertificate) => {
    const apiPayload = mapUIToApiUpdateCertificate(cert);
    await updateCertificateRecord(apiPayload);
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = prev.certificates?.map((c) =>
        c.id === cert.id ? cert : c
      );
      return { ...prev, certificates: updated };
    });
  };

  const { createCertificateRecord } = useCreateCertificate();
  const handleAddCertificate = async (cert: CandidateCertificate) => {
    const apiPayload = mapUIToApiCreateCertificate(cert);
    const created = await createCertificateRecord(apiPayload);
    if (!created) return;
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        certificates: [...(prev.certificates || []), created],
      };
    });
  };

  const { deleteCertificateRecord } = useDeleteCertificate();
  const handleDeleteCertificate = async (id: number) => {
    await deleteCertificateRecord(id);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        certificates: prev.certificates?.filter((c) => c.id !== id),
      };
    });
  };

  // Social link handlers
  const { createSocialRecord } = useCreateSocial();
  const handleAddSocial = async (social: CandidateSocial) => {
    const apiPayload = mapUIToApiCreateSocial(social);
    const created = await createSocialRecord(apiPayload);
    if (!created) return;
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        socials: [...(prev.socials || []), created],
      };
    });
  };

  const { updateSocialRecord } = useUpdateSocial();
  const handleUpdateSocials = async (socials: CandidateSocial[]) => {
    try {
      for (const s of socials) {
        if (s.id) {
          await updateSocialRecord(mapUIToApiUpdateSocial(s));
        }
      }
      const updatedProfile = await fetchCandidateProfile();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      toast.success('Social links updated');
    } catch {
      toast.error('Failed to update social links');
    }
  };

  const { deleteSocialRecord } = useDeleteSocial();
  const handleDeleteSocial = async (id: number) => {
    await deleteSocialRecord(id);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        socials: prev.socials?.filter((s) => s.id !== id),
      };
    });
  };

  // Contact link handlers
  const { createContactRecord } = useCreateContact();
  const handleAddContact = async (contact: CandidateContact) => {
    const apiPayload = mapUIToApiCreateContact(contact);
    const created = await createContactRecord(apiPayload);
    if (!created) return;
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contacts: [...(prev.contacts || []), created],
      };
    });
  };

  const { updateContactRecord } = useUpdateContact();
  const handleUpdateContacts = async (contacts: CandidateContact[]) => {
    try {
      for (const c of contacts) {
        if (c.id) {
          await updateContactRecord(mapUIToApiUpdateContact(c));
        }
      }
      const updatedProfile = await fetchCandidateProfile();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      toast.success('Contact info updated');
    } catch {
      toast.error('Failed to update contact info');
    }
  };

  const { deleteContactRecord } = useDeleteContact();
  const handleDeleteContact = async (id: number) => {
    await deleteContactRecord(id);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contacts: prev.contacts?.filter((c) => c.id !== id),
      };
    });
  };

  const { createSkillRecord } = useCreateSkill();
  const handleAddSkill = async (data: {
    title: string;
    level?: string;
    years?: number;
  }) => {
    const normalizedTitle = data.title.trim().toLowerCase();
    const alreadyExists = profile?.skills?.some(
      (existingSkill) =>
        existingSkill.title.trim().toLowerCase() === normalizedTitle
    );

    if (alreadyExists) {
      const duplicateSkillMessage = 'This skill is already in your profile.';
      toast.error(duplicateSkillMessage);
      throw new Error(duplicateSkillMessage);
    }

    try {
      const createdSkill = await createSkillRecord(data);
      setProfile((prev) => {
        if (!prev) return prev;
        return { ...prev, skills: [...(prev.skills || []), createdSkill] };
      });
    } catch (error) {
      const errorMessage = formatErrorForDisplay(error, 'Failed to add skill');
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const { updateSkillRecord } = useUpdateSkill();
  const handleUpdateSkill = async (
    id: number,
    data: { level?: string; years?: number }
  ) => {
    try {
      const updatedSkill = await updateSkillRecord(id, data);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          skills: prev.skills?.map((s) =>
            s.id === id ? { ...s, ...updatedSkill } : s
          ),
        };
      });
    } catch (error) {
      const errorMessage = formatErrorForDisplay(
        error,
        'Failed to update skill'
      );
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const { deleteSkillRecord } = useDeleteSkill();
  const handleDeleteSkill = async (skillId: number) => {
    await deleteSkillRecord(skillId);
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skills: prev.skills?.filter((skill) => skill.id !== skillId),
      };
    });
  };

  useEffect(() => {
    setTitle('Profile');
    // Ensure we have fresh data on mount to avoid stale context issues
    fetchCandidateProfile({ forceRefresh: true });
  }, [setTitle, fetchCandidateProfile]);

  useEffect(() => {
    setProfile(candidateProfile || null);
  }, [candidateProfile]);

  useEffect(() => {
    const defaultResumeId =
      profile?.resumes?.find((resume) => resume.isDefault)?.id ||
      profile?.resumes?.[0]?.id ||
      null;
    setSelectedResumeId(defaultResumeId);
  }, [profile?.resumes]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchCandidateProfile();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () =>
      window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [fetchCandidateProfile]);

  const handleCVUpload = async (file: File) => {
    setUploadErrorMsg(null);
    try {
      const currentResumeCount = profile?.resumes?.length || 0;
      if (currentResumeCount >= 5) {
        const errorMsg = 'You can store up to 5 resumes.';
        setUploadErrorMsg(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const uploadResult = await uploadToS3(file, 'resumes');

      await createResumeRecord({
        fileKey: uploadResult.fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isDefault: true,
      });
      toast.success(`CV "${file.name}" uploaded successfully!`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setUploadErrorMsg(errorMsg);
      toast.error(`Failed to upload CV: ${errorMsg}`);
      throw err;
    }
  };

  const handleSelectResume = async (resumeId: number) => {
    setSelectedResumeId(resumeId);
    const selectedResume = profile?.resumes?.find(
      (resume) => resume.id === resumeId
    );
    if (!selectedResume || selectedResume.isDefault) return;

    try {
      const updated = await updateResumeRecord({
        id: resumeId,
        isDefault: true,
      });
      setProfile((prev) => {
        if (!prev) return prev;
        const nextResumes = (prev.resumes || []).map((resume) =>
          resume.id === updated.id ? updated : { ...resume, isDefault: false }
        );
        return { ...prev, resumes: nextResumes };
      });
    } catch (error) {
      const errorMessage = formatErrorForDisplay(
        error,
        'Failed to update default CV'
      );
      toast.error(errorMessage);
    }
  };

  const handleOpenDeleteModal = async (resumeId: number) => {
    setActiveResumeId(resumeId);
    setDeleteImpactModalOpen(true);
  };

  if (!profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const candidate: CandidateProfileUI = mapDataToCandidate(profile);

  return (
    <div
      className="w-full min-h-screen bg-[color:var(--slate-50)] px-[var(--space-xl)] py-[var(--space-xl)] flex flex-col items-start gap-[var(--space-lg)] overflow-x-hidden"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="w-full">
        <ProfileHeader
          candidate={candidate}
          handleAddSocial={handleAddSocial}
          handleUpdateSocials={handleUpdateSocials}
          handleDeleteSocial={handleDeleteSocial}
          handleAddContact={handleAddContact}
          handleUpdateContacts={handleUpdateContacts}
          handleDeleteContact={handleDeleteContact}
          handleUpdateAbout={handleUpdateAbout}
          descriptionId={profile?.about?.id}
          onExportPdf={handleExportPdf}
          onOpenExportModal={() => setExportModalOpen(true)}
          isExportingPdf={isExportingPdf}
        />
      </div>

      <div className="w-full flex flex-col gap-[var(--space-xl)]">
        <AboutMe
          about={profile?.about || { id: 0, bio: '' }}
          handleUpdateAbout={handleUpdateAbout}
        />
        <CV
          ref={cvRef}
          resumes={profile.resumes || []}
          selectedResumeId={selectedResumeId}
          onCVChange={handleCVUpload}
          onSelectResume={handleSelectResume}
          onDeleteResume={handleOpenDeleteModal}
          maxResumes={5}
          isUploading={uploading || creatingResume}
          isUpdating={updatingResume || isSyncing}
          isDeleting={deletingResume}
          processingTasks={processingTasks}
          deletingResumeId={deletingResumeId}
          uploadError={
            uploadErrorMsg ||
            (uploadError
              ? uploadError instanceof Error
                ? uploadError.message
                : String(uploadError)
              : null)
          }
        />
        <Experiences
          experiences={candidate.experiences}
          handleUpdateExperience={handleUpdateExperience}
          handleAddExperience={handleAddExperience}
          handleDeleteExperience={handleDeleteExperience}
        />
        <Educations
          educations={candidate.educations}
          handleAddEducation={handleAddEducation}
          handleUpdateEducation={handleUpdateEducation}
          handleDeleteEducation={handleDeleteEducation}
        />
        <Certificates
          certificates={candidate.certificates}
          handleAddCertificate={handleAddCertificate}
          handleUpdateCertificate={handleUpdateCertificate}
          handleDeleteCertificate={handleDeleteCertificate}
        />
        <Skills
          skills={candidate.skills}
          handleAddSkill={handleAddSkill}
          handleUpdateSkill={handleUpdateSkill}
          handleDeleteSkill={handleDeleteSkill}
        />
      </div>

      <CvSyncCompareModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        currentData={candidate}
        newData={
          activeResumeId
            ? (() => {
                const res = profile?.resumes?.find(
                  (r) => r.id === activeResumeId
                );
                try {
                  return res?.parsedText
                    ? typeof res.parsedText === 'string'
                      ? JSON.parse(res.parsedText)
                      : res.parsedText
                    : null;
                } catch {
                  return null;
                }
              })()
            : null
        }
        onSync={handleSyncResume}
        onExtract={() => {
          if (activeResumeId) {
            window.dispatchEvent(
              new CustomEvent('TRIGGER_AI_PARSE', {
                detail: { resumeId: activeResumeId },
              })
            );
            setSyncModalOpen(false);
          }
        }}
        isLoading={isSyncing}
        isSynced={
          !!(activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)
                ?.isSyncedToProfile
            : false)
        }
      />
      <CvDeleteImpactModal
        isOpen={deleteImpactModalOpen}
        onClose={() => setDeleteImpactModalOpen(false)}
        onConfirm={handleConfirmDeleteResume}
        isLoading={!!deletingResumeId}
        resumeName={
          activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)
                ?.fileName || 'Selected CV'
            : ''
        }
        resumeId={activeResumeId || 0}
        currentData={profile}
        experiences={candidate.experiences || []}
        educations={candidate.educations || []}
        skills={candidate.skills || []}
        certificates={candidate.certificates || []}
        contacts={candidate.contacts || []}
        socials={candidate.socials || []}
      />
      <AiFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        isReScoring={processingTasks[activeResumeId ?? -1]?.scoring ?? false}
        onReAnalyze={() => {
          if (!activeResumeId) return;
          window.dispatchEvent(
            new CustomEvent('TRIGGER_AI_SCORE', {
              detail: { resumeId: activeResumeId },
            })
          );
          setFeedbackModalOpen(false);
        }}
        score={
          activeResumeId
            ? profile?.resumes?.find((r) => r.id === activeResumeId)?.aiScore ||
              null
            : null
        }
        feedback={
          activeResumeId
            ? (() => {
                const res = profile?.resumes?.find(
                  (r) => r.id === activeResumeId
                );
                try {
                  return res?.aiFeedback
                    ? typeof res.aiFeedback === 'string'
                      ? JSON.parse(res.aiFeedback)
                      : res.aiFeedback
                    : null;
                } catch {
                  return null;
                }
              })()
            : null
        }
      />

      <OverleafCvExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        candidate={candidate}
        aboutText={profile?.about?.bio}
        pdfRef={modalPdfRef}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      {/* Dedicated off-screen container for direct PDF file export */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0', width: '794px', zIndex: -9999, pointerEvents: 'none' }}>
        <ProfilePdfTemplate
          ref={pdfContainerRef}
          candidate={candidate}
          aboutText={profile?.about?.bio}
        />
      </div>
    </div>
  );
};

export default CandidateProfilePage;
