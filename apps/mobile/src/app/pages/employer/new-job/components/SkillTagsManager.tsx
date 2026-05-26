'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Plus, X, ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import { useSearchSkills } from '../../../../../hooks/useSearchSkills';

export type SkillImportance = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';

export interface SkillEntry {
  name: string;
  importance: SkillImportance;
  minYearsExperience?: number;
}

const IMPORTANCE_OPTIONS = [
  { value: 'REQUIRED', label: 'Required' },
  { value: 'PREFERRED', label: 'Preferred' },
  { value: 'OPTIONAL', label: 'Optional' },
] as const;

const IMPORTANCE_LABELS: Record<SkillImportance, string> = {
  REQUIRED: 'Required',
  PREFERRED: 'Preferred',
  OPTIONAL: 'Optional',
};

const IMPORTANCE_ORDER: SkillImportance[] = [
  'REQUIRED',
  'PREFERRED',
  'OPTIONAL',
];

interface SkillTagsManagerProps {
  skills: SkillEntry[];
  onChange: (skills: SkillEntry[]) => void;
}

export const SkillTagsManager: React.FC<SkillTagsManagerProps> = ({
  skills,
  onChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newImportance, setNewImportance] =
    useState<SkillImportance>('REQUIRED');
  const [newMinYears, setNewMinYears] = useState('');
  const [showImportanceModal, setShowImportanceModal] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const {
    results: searchResults,
    search: searchSkillsAPI,
    loading: skillsLoading,
  } = useSearchSkills();

  const filteredSuggestions = searchResults.filter(
    (skill) =>
      !skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())
  );

  const handleAdd = () => {
    const trimmed = newSkillName.trim();
    if (
      trimmed &&
      !skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      const entry: SkillEntry = {
        name: trimmed,
        importance: newImportance,
      };
      const years = parseInt(newMinYears, 10);
      if (!isNaN(years) && years > 0) {
        entry.minYearsExperience = years;
      }
      onChange([...skills, entry]);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewSkillName('');
    setNewMinYears('');
    setNewImportance('REQUIRED');
    setShowSkillSuggestions(false);
  };

  const handleRemove = (skillName: string) => {
    onChange(skills.filter((s) => s.name !== skillName));
  };

  const handleSelectSuggestion = (skillName: string) => {
    setNewSkillName(skillName);
    setShowSkillSuggestions(false);
  };

  const handleSkillInputChange = (text: string) => {
    setNewSkillName(text);
    if (text.trim()) {
      setShowSkillSuggestions(true);
      searchSkillsAPI(text);
    } else {
      setShowSkillSuggestions(false);
    }
  };

  const groupedSkills = IMPORTANCE_ORDER.map((level) => ({
    level,
    label: IMPORTANCE_LABELS[level],
    items: skills.filter((s) => s.importance === level),
  })).filter((group) => group.items.length > 0);

  return (
    <View className="gap-3">
      <Label className="text-base font-medium">
        Required Skills (Optional)
      </Label>

      {!isAdding ? (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          className="flex-row items-center gap-2 px-4 py-3 rounded-lg border-2 border-indigo-600"
        >
          <Plus size={18} color="#4F46E5" />
          <Text className="text-base font-medium text-indigo-600">
            Add Skills
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
          {/* Skill Input with Suggestions */}
          <View>
            <Label className="text-base font-medium mb-1">Skill Name</Label>
            <View className="relative">
              <Input
                placeholder="Enter skill name"
                value={newSkillName}
                onChangeText={handleSkillInputChange}
                autoFocus
                autoComplete="off"
              />

              {/* Skill Suggestions Dropdown */}
              {showSkillSuggestions && filteredSuggestions.length > 0 && (
                <View className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40">
                  <View className="max-h-40 overflow-hidden">
                    {filteredSuggestions.map((item, index) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleSelectSuggestion(item.name)}
                        className={`px-4 py-2 active:bg-slate-50 ${
                          index < filteredSuggestions.length - 1
                            ? 'border-b border-slate-100'
                            : ''
                        }`}
                      >
                        <Text className="text-base text-slate-900">
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Importance Selector */}
          <View>
            <Label className="text-base font-medium mb-1">Importance</Label>
            <TouchableOpacity
              onPress={() => setShowImportanceModal(true)}
              className="flex-row items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white"
            >
              <Text className="text-base font-medium text-slate-900">
                {IMPORTANCE_LABELS[newImportance]}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            <ModalPicker
              open={showImportanceModal}
              onOpenChange={setShowImportanceModal}
              options={IMPORTANCE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              onSelect={(value) => setNewImportance(value as SkillImportance)}
              selectedValue={newImportance}
              title="Select Importance Level"
            />
          </View>

          {/* Min Years */}
          <View>
            <Label className="text-base font-medium mb-1">
              Min Years Experience
            </Label>
            <Input
              placeholder="0"
              keyboardType="number-pad"
              value={newMinYears}
              onChangeText={setNewMinYears}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!newSkillName.trim() || skillsLoading}
              className="flex-1 bg-indigo-600 disabled:bg-indigo-300 px-4 py-2.5 rounded-lg items-center justify-center"
            >
              <Text className="text-white font-medium text-base">
                {skillsLoading ? 'Loading...' : 'Add'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="flex-1 border border-slate-300 px-4 py-2.5 rounded-lg items-center justify-center bg-white"
            >
              <Text className="text-slate-900 font-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Display Skills by Importance */}
      {groupedSkills.length > 0 && (
        <View className="gap-3 mt-2">
          {groupedSkills.map((group) => (
            <View key={group.level} className="gap-2">
              <Text className="text-sm font-medium text-slate-600">
                {group.label}
              </Text>
              <View className="gap-2">
                {group.items.map((skill) => (
                  <View
                    key={skill.name}
                    className="flex-row items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-indigo-900">
                        {skill.name}
                      </Text>
                      {skill.minYearsExperience && (
                        <Text className="text-xs text-indigo-700 mt-0.5">
                          {skill.minYearsExperience} year
                          {skill.minYearsExperience > 1 ? 's' : ''} experience
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemove(skill.name)}
                      className="ml-2 p-1"
                    >
                      <X size={16} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SkillTagsManager;
