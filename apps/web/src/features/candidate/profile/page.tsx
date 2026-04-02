'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

import ProfileHeader from './components/ProfileHeader';
import AboutMe from './components/AboutMe';
import CV from './components/CV';
import Experiences from './components/Experiences';
import Educations from './components/Educations';
import Skills from './components/Skills';
import Portfolios from './components/Portfolios';
import SideBar from './components/sideBar';
import { useGetCandidateProfile } from '@/api-hook/candidate/useGetCandidateProfile';
import { useUploadFile } from '@/api-hook/s3';
import { useCreateResume } from '@/api-hook/candidate';
import { deleteResume } from '@/api-client/candidate';
import type {
  CandidateProfileResponse,
} from '@/api-client/candidate/types';
import { useUpdateCandidateAbout } from '@/api-hook/candidate/useUpdateCandidateAbout';
import { useUpdateExperience } from '@/api-hook/candidate/useUpdateExperience';
import { useCreateExperience } from '@/api-hook/candidate/useCreateExperience';
import { useUpdateEducation } from '@/api-hook/candidate/useUpdateEducation';
import { useCreateEducation } from '@/api-hook/candidate/useCreateEducation';
import {
  mapUIToApiCreateExperience,
  mapUIToApiUpdateExperience,
  mapUIToApiUpdateEducation,
  mapUIToApiCreateEducation,
  mapDataToCandidate,
} from './mapper';
import { CandidateEducation, CandidateExperience, CandidateResume } from '@/types/profile';

const CandidateProfilePage = () => {
  const { toast } = useToast();
  const { fetchCandidateProfile, loading, error } = useGetCandidateProfile();
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  // S3 upload hooks
  const {
    upload: uploadToS3,
    loading: uploading,
    error: uploadError,
  } = useUploadFile();
  const { createResumeRecord, loading: creatingResume } = useCreateResume({
    onSuccess: (resumeData: CandidateResume) => {
      // CV component will handle generating presigned URL
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          resumes: [...(prev.resumes || []), resumeData],
        };
      });
      setUploadErrorMsg(null);
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save resume';
      setUploadErrorMsg(errorMsg);
    },
  });
  // State quản lý section đang chỉnh sửa
  const [editSection, setEditSection] = useState<string | null>(null);

  // Hàm xử lý khi nhấn edit
  const handleEdit = (section: string) => setEditSection(section);
  // Hàm xử lý khi nhấn hủy
  const handleCancel = () => setEditSection(null);

  const handleUpdateAbout = async (about: string[]) => {
    const { updateAbout } = useUpdateCandidateAbout();
    await updateAbout(about);
    setProfile((prev) => (prev ? { ...prev, about } : prev));
  };

  // Hàm xử lý cập nhật experience
  const { updateExperienceRecord } = useUpdateExperience();
  const handleUpdateExperience = async (experiences: CandidateExperience) => {
    const apiExperience = mapUIToApiUpdateExperience(experiences);
    await updateExperienceRecord(apiExperience);
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedExperiences = prev.experiences.map((exp) =>
        exp.id === experiences.id ? experiences : exp
      );
      return { ...prev, experiences: updatedExperiences };
    });
  };

  // Hàm xử lý thêm experience
  const { createExperienceRecord } = useCreateExperience();
  const handleAddExperience = async (experience: CandidateExperience) => {
    const apiExperience = mapUIToApiCreateExperience(experience);
    await createExperienceRecord(apiExperience);
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, experiences: [...prev.experiences, experience] };
    });
  };

  // Hàm xử lý delete experience
  const { deleteExperienceRecord } = useDeleteExperience(); 
  const handleDeleteExperience = async (id: number) => {
    await deleteExperienceRecord(id);
    setCandidate((prev) => {
      if (!prev) return prev;
      return { ...prev, experiences: prev.experiences.filter((exp) => exp.id !== id) };
    });
  };

  // Hàm xử lý cập nhật education
  const { updateEducationRecord } = useUpdateEducation();
  const handleUpdateEducation = async (education: CandidateEducation) => {
    const apiEducation = mapUIToApiUpdateEducation(education);

    await updateEducationRecord(apiEducation);
  };

  // Hàm xử lý thêm education
  const { createEducationRecord } = useCreateEducation();
  const handleAddEducation = async (education: CandidateEducation) => {
    const apiEducation = mapUIToApiCreateEducation(education);

    const newEducation = await createEducationRecord(apiEducation);
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, educations: [...prev.educations, newEducation] };
    });
  };

  
  // hàm xử lý delete education 
  const { deleteEducationRecord } = useDeleteEducation();
  const handleDeleteEducation = async (id: number) => {
    await deleteEducationRecord(id);
    setCandidate((prev) => {
      if (!prev) return prev;
      return { ...prev, educations: prev.educations.filter((edu) => edu.id !== id) };
    });
  }
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchCandidateProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to fetch candidate profile', { error: err });
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (data) {
      setCandidate(mapDataToCandidate(data));
    }
  }, [data]);

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-red-500">
        Error loading profile.
      </div>
    );
  }

  const handleCVUpload = async (file: File) => {
    setUploadErrorMsg(null);
    try {
      const uploadResult = await uploadToS3(file, 'resumes');
      await createResumeRecord({
        fileKey: uploadResult.fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isDefault: true,
      });
      toast.success(`CV "${file.name}" uploaded successfully!`);

      // Delete old CV in background (don't block the upload)
      if (profile?.resumes && profile.resumes.length > 0) {
        const oldResume =
          profile.resumes.find((r) => r.isDefault) || profile.resumes[0];
        if (oldResume?.id) {
          try {
            await deleteResume(oldResume.id);
            setProfile((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                resumes:
                  prev.resumes?.filter((r) => r.id !== oldResume.id) || [],
              };
            });
          } catch (err) {
            console.error('Failed to delete old CV:', err);
            // Don't show error toast for background deletion
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setUploadErrorMsg(errorMsg);
      toast.error(`Failed to upload CV: ${errorMsg}`);
      throw err;
    }
  };

  // Get the current CV file key and name
  const getCVFileKey = () => {
    if (!profile?.resumes || !profile.resumes.length) return undefined;
    const defaultResume =
      profile.resumes.find((r) => r.isDefault) || profile.resumes[0];
    return defaultResume.fileKey;
  };

  const getCVFileName = () => {
    if (!profile?.resumes || !profile.resumes.length) return 'Resume.pdf';
    const defaultResume =
      profile.resumes.find((r) => r.isDefault) || profile.resumes[0];
    return defaultResume.fileName;
  };

  const candidate = {
    name: profile?.name || '',
    title: profile?.role || '',
    location: '',
    avatar: profile?.image || '',
    banner: '#4640DE',
    openForOpportunities: true,
    about: [profile?.email || ''],
    experiences: (profile?.experiences || []).map((exp) => ({
      company: exp.companyName || '',
      logo: 'https://placehold.co/80x80',
      role: exp.jobTitle || '',
      type: 'Full-Time',
      time: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
      location: exp.location || '',
      desc: exp.description || '',
    })),
    educations: (profile?.educations || []).map((edu) => ({
      school: edu.school || '',
      logo: 'https://placehold.co/80x80',
      degree: edu.degree || '',
      time: `${edu.startDate || ''} - ${edu.endDate || ''}`,
      desc: edu.description || '',
    })),
    skills: [],
    portfolios: [],
    contact: {
      email: profile?.email || '',
      phone: '',
    },
    socials: [],
  };


  if (loading || !candidate) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-[color:var(--slate-50)] px-[var(--space-xl)] py-[var(--space-xl)] flex flex-col items-start gap-[var(--space-lg)]"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex flex-row w-full max-w-6xl gap-[var(--space-base)] items-start">
        {/* Main Content (Left) */}
        <div className="flex flex-col w-[728px] gap-[var(--space-xl)]">
          <ProfileHeader candidate={candidate} />
          <AboutMe
            about={candidate.about}
            handleUpdateAbout={handleUpdateAbout}
          />
          <CV
            cvFileKey={getCVFileKey()}
            cvFileName={getCVFileName()}
            onCVChange={handleCVUpload}
            isUploading={uploading || creatingResume}
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
            onEdit={() => handleEdit('skills')}
            isEditing={editSection === 'skills'}
            onCancel={handleCancel}
          />
          <Portfolios portfolios={candidate.portfolios} />
        </div>
        {/* Sidebar (Right) */}
        <SideBar
          contact={candidate.contact}
          socials={candidate.socials}
          onEdit={() => handleEdit('sidebar')}
          isEditing={editSection === 'sidebar'}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CandidateProfilePage;
