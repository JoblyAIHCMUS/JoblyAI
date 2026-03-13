'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ApplicantResumeViewer from './applicantResumeViewer';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';

export default function ApplicantDetails({
  applicant,
}: {
  applicant: ApplicantDetail;
}) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs defaultValue="profile">
          <TabsList className="inline-flex flex-wrap justify-start">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="hiring-process">Hiring Process</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <p className="text-sm text-muted-foreground">
              Profile details coming soon.
            </p>
          </TabsContent>

          <TabsContent value="resume" className="mt-6">
            <ApplicantResumeViewer url={applicant.resume} />
          </TabsContent>

          <TabsContent value="cover-letter" className="mt-6">
            <p className="text-sm text-muted-foreground">
              Cover letter details coming soon.
            </p>
          </TabsContent>

          <TabsContent value="hiring-process" className="mt-6">
            <p className="text-sm text-muted-foreground">
              Hiring process details coming soon.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
