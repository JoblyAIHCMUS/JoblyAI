import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Search, Filter, Star, ChevronLeft, ChevronRight } from 'lucide-react-native';

export type ApplicantStatus = 'Inreview' | 'Shortlisted' | 'Declined' | 'Interviewed' | 'Hired';

export interface Applicant {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  status: ApplicantStatus;
}

const MOCK_APPLICANTS: Applicant[] = [
  { id: '1', name: 'Jake Gyll', avatarUrl: 'https://i.pravatar.cc/150?u=jake', rating: 0.0, status: 'Inreview' },
  { id: '2', name: 'Guy Hawkins', avatarUrl: 'https://i.pravatar.cc/150?u=guy', rating: 4.0, status: 'Inreview' },
  { id: '3', name: 'Cyndy Lillibridge', avatarUrl: 'https://i.pravatar.cc/150?u=cyndy', rating: 4.2, status: 'Shortlisted' },
  { id: '4', name: 'Leif Floyd', avatarUrl: 'https://i.pravatar.cc/150?u=leif', rating: 3.0, status: 'Declined' },
  { id: '5', name: 'Jenny Wilson', avatarUrl: 'https://i.pravatar.cc/150?u=jenny', rating: 3.4, status: 'Declined' },
  { id: '6', name: 'Jerome Bell', avatarUrl: 'https://i.pravatar.cc/150?u=jerome', rating: 4.3, status: 'Interviewed' },
  { id: '7', name: 'Eleanor Pena', avatarUrl: 'https://i.pravatar.cc/150?u=eleanor', rating: 4.8, status: 'Hired' },
  { id: '8', name: 'Darrell Steward', avatarUrl: 'https://i.pravatar.cc/150?u=darrell', rating: 4.76, status: 'Hired' },
];

const getStatusColors = (status: ApplicantStatus) => {
  switch (status) {
    case 'Inreview': return { border: 'border-app-orange-1', text: 'text-app-orange-1' };
    case 'Shortlisted': return { border: 'border-app-primary-1', text: 'text-app-primary-1' };
    case 'Declined': return { border: 'border-app-red-1', text: 'text-app-red-1' };
    case 'Interviewed': return { border: 'border-app-secondary-2', text: 'text-app-secondary-2' };
    case 'Hired': return { border: 'border-app-emerald-2', text: 'text-app-emerald-2' };
  }
};

function ApplicantListItem({ applicant }: { applicant: Applicant }) {
  const statusColors = getStatusColors(applicant.status);
  
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-app-border-light">
      <View className="flex-row items-center flex-1">
        <Image 
          source={{ uri: applicant.avatarUrl }} 
          className="w-14 h-14 rounded-full mr-4 bg-app-gray-1"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-app-slate-1 mb-1">{applicant.name}</Text>
          <View className="flex-row items-center border border-app-border-2 rounded-full px-2 py-0.5 self-start">
            <Star size={14} color="#FFB836" fill={applicant.rating > 0 ? "#FFB836" : "transparent"} />
            <Text className="text-sm text-app-text-3 font-medium ml-1">
              {applicant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
      <View className={`border rounded-full px-4 py-1.5 ${statusColors.border}`}>
        <Text className={`text-sm font-semibold ${statusColors.text}`}>
          {applicant.status}
        </Text>
      </View>
    </View>
  );
}

function ApplicantsHeader({ total }: { total: number }) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-app-border-light">
      <Text className="text-xl font-bold text-app-dark-text">Applicants : {total}</Text>
      <View className="flex-row gap-4">
        <TouchableOpacity>
          <Filter size={24} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Search size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ViewToggle() {
  const [active, setActive] = useState<'Pipeline' | 'Table'>('Pipeline');
  
  return (
    <View className="flex-row bg-app-slate-gray rounded-lg p-1 my-4">
      <TouchableOpacity 
        className={`flex-1 py-2 items-center rounded-md ${active === 'Pipeline' ? 'bg-white shadow-sm' : ''}`}
        onPress={() => setActive('Pipeline')}
      >
        <Text className={`font-semibold ${active === 'Pipeline' ? 'text-app-primary-1' : 'text-app-text-3'}`}>Pipeline View</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className={`flex-1 py-2 items-center rounded-md ${active === 'Table' ? 'bg-white shadow-sm' : ''}`}
        onPress={() => setActive('Table')}
      >
        <Text className={`font-semibold ${active === 'Table' ? 'text-app-primary-1' : 'text-app-text-3'}`}>Table View</Text>
      </TouchableOpacity>
    </View>
  );
}

function Pagination() {
  return (
    <View className="py-6 items-center">
      <View className="flex-row items-center justify-center gap-4 mb-4">
        <TouchableOpacity>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View className="w-10 h-10 bg-app-primary-2 rounded-lg items-center justify-center">
          <Text className="text-white font-semibold">1</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Text className="text-app-text-3 font-semibold">2</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <ChevronRight size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ApplicantsTab() {
  return (
    <ScrollView 
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    >
      <ApplicantsHeader total={MOCK_APPLICANTS.length} />
      <ViewToggle />
      <View className="mt-2">
        {MOCK_APPLICANTS.map((applicant) => (
          <ApplicantListItem key={applicant.id} applicant={applicant} />
        ))}
      </View>
      <Pagination />
    </ScrollView>
  );
}
