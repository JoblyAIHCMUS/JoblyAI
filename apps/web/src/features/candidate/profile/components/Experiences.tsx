'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Dot, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { CandidateExperience } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';
import { ExperienceSchema, type ExperienceFormData } from '@/lib/validation';

interface ExperiencesProps {
  experiences: CandidateExperience[];
  handleUpdateExperience?: (experience: CandidateExperience) => Promise<void>;
  handleAddExperience?: (experience: CandidateExperience) => Promise<void>;
  handleDeleteExperience?: (id: number) => Promise<void>;
}

interface ExperienceEditFormProps {
  editItem: CandidateExperience;
  loading: boolean;
  onSubmit: (data: ExperienceFormData) => Promise<void>;
  onCancel: () => void;
  isCurrentlyWorking?: boolean;
  onIsCurrentlyWorkingChange?: (value: boolean) => void;
}

function ExperienceEditForm({
  editItem,
  loading,
  onSubmit,
  onCancel,
  isCurrentlyWorking = false,
  onIsCurrentlyWorkingChange,
}: ExperienceEditFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceSchema),
    mode: 'onChange',
    defaultValues: {
      jobTitle: editItem.jobTitle || '',
      companyName: editItem.companyName || '',
      type: editItem.type || '',
      location: editItem.location || '',
      dateRange: {
        from: editItem.startDate ? new Date(editItem.startDate) : undefined,
        to: editItem.endDate ? new Date(editItem.endDate) : undefined,
      },
      description: editItem.description || '',
    },
  });

  const descriptionValue = watch('description');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [descriptionValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 w-full max-w-full"
    >
      {/* Row 1 - Job Title */}
      <div className="w-full box-border">
        <Controller
          name="jobTitle"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="Job Title"
                className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                  errors.jobTitle
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                }`}
              />
              {errors.jobTitle && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.jobTitle.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Row 2 - Company, Type & Dates */}
      <div className="flex flex-col gap-3 w-full box-border">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    {...field}
                    placeholder="Company"
                    className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                      errors.companyName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-accent-primary'
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.companyName.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <Dot size={16} className="flex-shrink-0" />
          <div className="min-w-20 flex-1 max-w-[200px]">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={`text-tertiary break-words focus:outline-none focus:ring-2 w-full ${
                        errors.type
                          ? 'border-red-500 focus:ring-red-500'
                          : 'focus:ring-accent-primary'
                      }`}
                    >
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>
        <div className="w-full">
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DateRangePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Employment Period"
                error={
                  errors.dateRange?.message ||
                  errors.dateRange?.from?.message ||
                  errors.dateRange?.to?.message
                }
                label=""
                isCurrentlyWorking={isCurrentlyWorking}
                onIsCurrentlyWorkingChange={onIsCurrentlyWorkingChange}
              />
            )}
          />
        </div>
      </div>

      {/* Row 3 - Location */}
      <div className="w-full box-border">
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="Location"
                className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                  errors.location
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.location.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Row 4 - Description */}
      <div className="w-full box-border">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                ref={textareaRef}
                placeholder="Description"
                className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 min-h-[60px] ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                }`}
                style={{ maxHeight: '200px', resize: 'vertical' }}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="px-4 py-2 rounded bg-accent-solid text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded border disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ExperienceView({
  exp,
  onEdit,
  onDelete,
  loadingDelete,
}: {
  exp: CandidateExperience;
  onEdit: () => void;
  onDelete: () => void;
  loadingDelete?: boolean;
}) {
  return (
    <>
      {/* Row 1 */}
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words ">
          {exp.jobTitle}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-[var(--space-xs)] bg-primary hover:bg-[color:var(--bg-tertiary)] hover:rounded-[var(--radius-md)]"
          >
            <Edit size={16} className="text-accent-primary" />
          </button>
          <button
            onClick={onDelete}
            className="p-[var(--space-xs)] bg-danger hover:bg-[color:var(--bg-tertiary)] hover:rounded-[var(--radius-md)]"
            disabled={loadingDelete}
            aria-label="Xoá kinh nghiệm"
          >
            <Trash2 size={16} className="text-accent-primary" />
          </button>
        </div>
      </div>
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <div className="text-primary break-words">{exp.companyName}</div>
        <Dot size={16} />
        <div className="text-secondary break-words">{exp.type}</div>
        <Dot size={16} />
        <span className="body-body-1-regular text-secondary break-words">
          {exp.startDate
            ? new Date(exp.startDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : 'Start date'}
          {' - '}
          {exp.endDate
            ? new Date(exp.endDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : 'Present'}
        </span>
      </div>
      {/* Row 3 */}
      <div className="text-tertiary break-words">{exp.location}</div>
      {/* Row 4 */}
      <div className="text-tertiary break-words">{exp.description}</div>
    </>
  );
}

export default function Experiences({
  experiences,
  handleUpdateExperience,
  handleAddExperience,
  handleDeleteExperience,
}: ExperiencesProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<CandidateExperience | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [displayedExperiences, setDisplayedExperiences] = useState(
    experiences.slice(0, 3)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);

  // Lock body scroll when editing or adding
  useEffect(() => {
    if (isAdding || editingIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdding, editingIdx]);

  const handleDelete = (idx: number) => {
    setDeleteIdx(idx);
  };

  const handleConfirmDelete = async () => {
    if (deleteIdx === null || !handleDeleteExperience) return;
    setLoadingDelete(true);
    try {
      await handleDeleteExperience(displayedExperiences[deleteIdx].id);
      setDeleteIdx(null);
    } catch (err) {
      // Có thể show toast hoặc error
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIdx(-1);
    setIsCurrentlyWorking(false);
    const createEmptyExperience = (): CandidateExperience => ({
      id: Date.now(),
      jobTitle: '',
      companyName: '',
      type: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
    });
    setEditItem(createEmptyExperience());
  };

  useEffect(() => {
    setDisplayedExperiences(showAll ? experiences : experiences.slice(0, 3));
  }, [showAll, experiences]);

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditItem({ ...experiences[idx] });
    setError(null);
    // Auto-set isCurrentlyWorking if no endDate
    setIsCurrentlyWorking(!experiences[idx].endDate);
  };

  const handleSaveEdit = async (formData: ExperienceFormData) => {
    if (!handleUpdateExperience || editingIdx === null || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateExperience({
        ...editItem,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        type: formData.type,
        location: formData.location,
        startDate: formData.dateRange.from
          ? formData.dateRange.from.toISOString()
          : '',
        endDate: isCurrentlyWorking
          ? ''
          : formData.dateRange.to
          ? formData.dateRange.to.toISOString()
          : '',
        description: formData.description,
      });
      setEditingIdx(null);
      setEditItem(null);
    } catch (err) {
      console.error(err);
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdd = async (formData: ExperienceFormData) => {
    if (!handleAddExperience || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleAddExperience({
        ...editItem,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        type: formData.type,
        location: formData.location,
        startDate: formData.dateRange.from
          ? formData.dateRange.from.toISOString()
          : '',
        endDate: isCurrentlyWorking
          ? ''
          : formData.dateRange.to
          ? formData.dateRange.to.toISOString()
          : '',
        description: formData.description,
      });
      setIsAdding(false);
      setEditItem(null);
    } catch (err) {
      setError('Add experience failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setEditItem(null);
    setError(null);
    setIsAdding(false);
    setIsCurrentlyWorking(false);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-lg)] w-full box-border">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Experiences
        </div>
        <div className="flex gap-2">
          <button
            className="p-[var(--space-xs)] bg-primary hover:bg-[color:var(--bg-tertiary)] hover:rounded-[var(--radius-md)]"
            onClick={handleAdd}
          >
            <Plus size={16} className="text-accent-primary" />
          </button>
        </div>
      </div>

      {/* Add new experience form (not in list) */}
      {isAdding && editingIdx === -1 && editItem && (
        <div className="flex flex-col gap-[var(--space-sm)] px-4 w-full box-border">
          <ExperienceEditForm
            editItem={editItem}
            loading={loading}
            onSubmit={handleSaveAdd}
            onCancel={handleCancel}
            isCurrentlyWorking={isCurrentlyWorking}
            onIsCurrentlyWorkingChange={setIsCurrentlyWorking}
          />
          {error && <div className="text-danger text-sm mt-2">{error}</div>}
        </div>
      )}

      {displayedExperiences.map((exp, idx) => {
        const isEditing = editingIdx === idx && editItem;
        return (
          <div
            key={exp.id}
            className="flex flex-col gap-[var(--space-sm)] px-4 w-full box-border"
          >
            {isEditing ? (
              <ExperienceEditForm
                editItem={editItem}
                loading={loading}
                onSubmit={handleSaveEdit}
                onCancel={handleCancel}
                isCurrentlyWorking={isCurrentlyWorking}
                onIsCurrentlyWorkingChange={setIsCurrentlyWorking}
              />
            ) : (
              <ExperienceView
                exp={exp}
                onEdit={() => handleEdit(idx)}
                onDelete={() => handleDelete(idx)}
                loadingDelete={loadingDelete && deleteIdx === idx}
              />
            )}
            {/* error */}
            {error && isEditing && (
              <div className="text-danger text-sm mt-2">{error}</div>
            )}
            {/* Divider */}
            {idx !== displayedExperiences.length - 1 && (
              <div className="border-t border-[color:var(--border-primary)] mt-[var(--space-md)]" />
            )}
          </div>
        );
      })}
      {deleteIdx !== null && (
        <ConfirmDelete
          title="Confirm delete"
          description="Are you sure you want to delete this experience? This action cannot be undone."
          onCancel={() => setDeleteIdx(null)}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />
      )}

      {/* Show more */}
      {!showAll && experiences.length > 3 && (
        <div className="flex justify-center">
          <button
            className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words"
            onClick={() => setShowAll(true)}
          >
            Show 3 more experiences
          </button>
        </div>
      )}

      {showAll && experiences.length > 3 && (
        <div className="flex justify-center">
          <button
            className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}
