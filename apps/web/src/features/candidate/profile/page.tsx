'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/contexts/page-title-context';
import { useCandidateProfileContext } from '@/api-hook/candidate';

import ProfileHeader from './components/ProfileHeader';
import AboutMe from './components/AboutMe';
import CV, { type CVRef } from './components/CV';
import Experiences from './components/Experiences';
import Educations from './components/Educations';
import Skills from './components/Skills';
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
} from '@/api-hook/candidate';
import { useDeleteSkill } from '@/api-hook/candidate/useDeleteSkill';
import { useCreateSkill } from '@/api-hook/candidate/useCreateSkill';
import {
  mapUIToApiCreateExperience,
  mapUIToApiUpdateExperience,
  mapUIToApiUpdateEducation,
  mapUIToApiCreateEducation,
  mapDataToCandidate,
} from './mapper';
import {
  CandidateEducation,
  CandidateExperience,
  CandidateResume,
} from '@/types/candidate';
import { CandidateProfileUI } from './types';
import { formatErrorForDisplay } from '@/lib/errors';

const CandidateProfilePage = () => {
  const { setTitle } = usePageTitle();
  const { toast } = useToast();
  const { data: candidateProfile } = useCandidateProfileContext();
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const cvRef = useRef<CVRef>(null);

  // S3 upload hooks
  const {
    upload: uploadToS3,
    loading: uploading,
    error: uploadError,
  } = useUploadFile();
  const { createResumeRecord, loading: creatingResume } = useCreateResume({
    onSuccess: (resumeData: CandidateResume) => {
      // Update profile state with new resume
      setProfile((prev) => {
        if (!prev) return null;
        const nextResumes = [...(prev.resumes || []), resumeData].map(
          (resume) =>
            resume.id === resumeData.id
              ? { ...resumeData, isDefault: true }
              : { ...resume, isDefault: false }
        );
        return {
          ...prev,
          resumes: nextResumes,
        };
      });
      setSelectedResumeId(resumeData.id);
      // Immediately refresh the CV display with new resume's fileKey
      cvRef.current?.refreshUrl(resumeData.fileKey);
      setUploadErrorMsg(null);
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
  const handleUpdateAbout = async (aboutData: { id: number; bio?: string }) => {
    // If id is 0, create new about, otherwise update existing
    if (aboutData.id === 0) {
      const result = await createAbout({ bio: aboutData.bio });
      setProfile((prev) => (prev ? { ...prev, about: result } : prev));
    } else {
      await updateAbout(aboutData);
      // Update profile state with new about data
      setProfile((prev) => (prev ? { ...prev, about: aboutData } : prev));
    }
  };

  // Hàm xử lý cập nhật experience
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

  // Hàm xử lý thêm experience
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

  // Hàm xử lý delete experience
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

  // Hàm xử lý cập nhật education
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

  // Hàm xử lý thêm education
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

  // hàm xử lý delete education
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

  // hàm xử lý add skill
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

  // Hàm xử lý delete skill
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

  // Contact and Social handlers are not implemented yet
  // Disable related edit UI until endpoints exist
  const handleAddSocial = undefined;
  const handleUpdateSocials = undefined;

  // Initialize profile from context
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

  // Listen for profile updates (from settings or other pages)
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Context will refetch and update candidateProfile automatically
      // which will trigger the useEffect above
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () =>
      window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

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

  const handleDeleteResume = async (resumeId: number) => {
    if (!profile?.resumes?.length) return;
    const resumeToDelete = profile.resumes.find(
      (resume) => resume.id === resumeId
    );
    if (!resumeToDelete) return;

    await deleteResumeRecord(resumeId);
    let nextResumes = profile.resumes.filter(
      (resume) => resume.id !== resumeId
    );

    if (resumeToDelete.isDefault && nextResumes.length) {
      try {
        const updatedDefault = await updateResumeRecord({
          id: nextResumes[0].id,
          isDefault: true,
        });
        nextResumes = nextResumes.map((resume) =>
          resume.id === updatedDefault.id
            ? updatedDefault
            : { ...resume, isDefault: false }
        );
      } catch (error) {
        const errorMessage = formatErrorForDisplay(
          error,
          'Failed to update default CV'
        );
        toast.error(errorMessage);
      }
    }

    const nextSelectedId =
      nextResumes.find((resume) => resume.isDefault)?.id ||
      nextResumes[0]?.id ||
      null;

    setProfile((prev) => (prev ? { ...prev, resumes: nextResumes } : prev));
    setSelectedResumeId(nextSelectedId);
    toast.success('CV deleted successfully.');
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
      {/* ProfileHeader with SideBar */}
      <div className="w-full">
        <ProfileHeader
          candidate={candidate}
          handleAddSocial={handleAddSocial}
          handleUpdateSocials={handleUpdateSocials}
        />
      </div>

      {/* Bottom Section: AboutMe, CV, Experiences, Educations, Skills - Full Width */}
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
          onDeleteResume={handleDeleteResume}
          maxResumes={5}
          isUploading={uploading || creatingResume}
          isUpdating={updatingResume}
          isDeleting={deletingResume}
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
        <Skills
          skills={candidate.skills}
          handleAddSkill={handleAddSkill}
          handleDeleteSkill={handleDeleteSkill}
        />
        {/* <Portfolios portfolios={candidate.portfolios} />/ */}
      </div>
    </div>
  );
};

export default CandidateProfilePage;
