import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode } from 'react';

interface AuthTabsProps {
  defaultValue: string;
  jobSeekerContent: ReactNode;
  companyContent: ReactNode;
}

export function AuthTabs({ defaultValue, jobSeekerContent, companyContent }: AuthTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="mb-8 w-full">
      <TabsList className="grid w-full grid-cols-2 bg-transparent">
        <TabsTrigger
          value="job-seeker"
          className="border-b-2 border-transparent data-[state=active]:border-[color:var(--bg-accent-solid)] data-[state=active]:bg-transparent"
        >
          Job Seeker
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="border-b-2 border-transparent data-[state=active]:border-[color:var(--bg-accent-solid)] data-[state=active]:bg-transparent"
        >
          Company
        </TabsTrigger>
      </TabsList>

      <TabsContent value="job-seeker">
        {jobSeekerContent}
      </TabsContent>

      <TabsContent value="company">
        {companyContent}
      </TabsContent>
    </Tabs>
  );
}
