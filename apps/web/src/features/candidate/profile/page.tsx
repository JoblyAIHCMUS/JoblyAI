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
import { useUploadFile } from '@/api-hook/s3';
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
    Record<number, { parsing: boolean; scoring: boolean }>
  >({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null);
  const cvRef = useRef<CVRef>(null);

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
        },
      }));

      toast.info('AI is extracting data from your resume...', {
        id: `ai-processing-${resumeId}`,
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
        toast.dismiss(`ai-processing-${resumeId}`);
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
        },
      }));

      toast.info('AI is scoring your resume...', {
        id: `ai-processing-${resumeId}`,
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
        toast.dismiss(`ai-processing-${resumeId}`);
        toast.error('Failed to start AI scoring');
      }
    };

    const handleAiFinished = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { resumeId } = customEvent.detail;
      const type = e.type;

      console.log(
        `[CandidateProfilePage] AI processing finished: ${type} for resume ${resumeId}`
      );

      setProcessingTasks((prev) => {
        const current = prev[resumeId] || { parsing: false, scoring: false };
        const next = { ...current };
        if (type === 'ai-parsed-success') next.parsing = false;
        if (type === 'ai-scored-success') next.scoring = false;

        // If all tasks for this resume are done, dismiss the processing toast
        if (!next.parsing && !next.scoring) {
          toast.dismiss(`ai-processing-${resumeId}`);
        }

        return { ...prev, [resumeId]: next };
      });

      fetchCandidateProfile();
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

  const handleSyncResume = async (modifiedDraftData?: any) => {
    if (!activeResumeId || !profile) return;

    const resume = profile.resumes?.find((r) => r.id === activeResumeId);
    if (!resume || !resume.parsedText) return;

    setIsSyncing(true);
    try {
      console.log(
        '[CandidateProfilePage] Committing resume merge for:',
        activeResumeId
      );

      // Use modifiedDraftData if provided, otherwise fallback to original parsedText
      const dataToSync =
        modifiedDraftData ||
        (typeof resume.parsedText === 'string'
          ? JSON.parse(resume.parsedText)
          : resume.parsedText);

      await commitResumeMerge(activeResumeId, dataToSync);

      // CRITICAL: Force refresh data BEFORE closing modal
      const updatedProfile = await fetchCandidateProfile({
        forceRefresh: true,
      });
      if (updatedProfile) {
        setProfile({ ...updatedProfile });
      }

      toast.success('Profile synced with resume data!');
      setSyncModalOpen(false);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (error) {
      console.error('[CandidateProfilePage] Failed to sync profile:', error);
      toast.error('Failed to sync profile');
    } finally {
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

      // Replace generic processing toast with resume-specific one
      toast.info('AI is extracting and scoring your resume...', {
        id: `ai-processing-${resumeData.id}`,
        description:
          'This usually takes 10-20 seconds. We will notify you when it is done.',
        duration: Infinity,
      });
      toast.dismiss('ai-processing-upload');

      setProcessingTasks((prev) => ({
        ...prev,
        [resumeData.id]: { parsing: true, scoring: true },
      }));

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
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save resume';
      setUploadErrorMsg(errorMsg);
      toast.dismiss('ai-processing-upload');
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
    } catch (error) {
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
    } catch (error) {
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
  const handleAddSkill = async (skill: string) => {
    const normalizedSkill = skill.trim().toLowerCase();
    const alreadyExists = profile?.skills?.some(
      (existingSkill) =>
        existingSkill.title.trim().toLowerCase() === normalizedSkill
    );

    if (alreadyExists) {
      const duplicateSkillMessage = 'This skill is already in your profile.';
      toast.error(duplicateSkillMessage);
      throw new Error(duplicateSkillMessage);
    }

    try {
      const createdSkill = await createSkillRecord(skill);
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
  }, [setTitle]);

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
      toast.info('AI is analyzing your resume...', {
        id: 'ai-processing-upload',
        description:
          'This usually takes 10-20 seconds. We will notify you when it is done.',
        duration: Infinity,
      });

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
                } catch (e) {
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
                } catch (e) {
                  return null;
                }
              })()
            : null
        }
      />
    </div>
  );
};

export default CandidateProfilePage;
