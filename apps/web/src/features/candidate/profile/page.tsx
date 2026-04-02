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
  CandidateResume,
} from '@/api-client/candidate/types';

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

  if (loading || !profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
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

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] px-6 py-8 flex flex-col items-center">
      <div className="flex flex-row gap-4 w-full max-w-6xl">
        {/* Main Content (Left) */}
        <div className="flex flex-col gap-6 w-[728px]">
          <ProfileHeader candidate={candidate} />
          <AboutMe about={candidate.about} />
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
          <Experiences experiences={candidate.experiences} />
          <Educations educations={candidate.educations} />
          <Skills skills={candidate.skills} />
          <Portfolios portfolios={candidate.portfolios} />
        </div>
        {/* Sidebar (Right) */}
        <SideBar contact={candidate.contact} socials={candidate.socials} />
      </div>
    </div>
  );
};

export default CandidateProfilePage;
