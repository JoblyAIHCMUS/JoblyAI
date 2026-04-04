'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CandidateEducation } from '@/types/candidate';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import ConfirmDelete from '@/components/ui/confirmDelete';
import { EducationSchema, type EducationFormData } from '@/lib/validation';

interface EducationsProps {
  educations: CandidateEducation[];
  handleUpdateEducation?: (education: CandidateEducation) => Promise<void>;
  handleAddEducation?: (education: CandidateEducation) => Promise<void>;
  handleDeleteEducation?: (id: number) => Promise<void>;
}

interface EducationEditFormProps {
  editItem: CandidateEducation;
  loading: boolean;
  onSubmit: (data: EducationFormData) => Promise<void>;
  onCancel: () => void;
  isCurrentlyStudying?: boolean;
  onIsCurrentlyStudyingChange?: (value: boolean) => void;
}

function EducationEditForm({
  editItem,
  loading,
  onSubmit,
  onCancel,
  isCurrentlyStudying = false,
  onIsCurrentlyStudyingChange,
}: EducationEditFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<EducationFormData>({
    resolver: zodResolver(EducationSchema),
    mode: 'onChange',
    defaultValues: {
      school: editItem.school || '',
      degree: editItem.degree || '',
      fieldOfStudy: editItem.fieldOfStudy || '',
      dateRange: {
        from: editItem.startDate ? new Date(editItem.startDate) : undefined,
        to: editItem.endDate ? new Date(editItem.endDate) : undefined,
      },
      grade: editItem.grade || '',
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
      {/* Row 1 - School */}
      <div className="w-full box-border">
        <Controller
          name="school"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="School"
                className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                  errors.school
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                }`}
              />
              {errors.school && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.school.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Row 2 - Degree & Field of Study */}
      <div className="flex items-center gap-2 flex-wrap w-full box-border">
        <div className="flex-1 min-w-[120px]">
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  placeholder="Degree"
                  className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                    errors.degree
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-accent-primary'
                  }`}
                />
                {errors.degree && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.degree.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Controller
            name="fieldOfStudy"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  placeholder="Field of Study"
                  className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                    errors.fieldOfStudy
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-accent-primary'
                  }`}
                />
                {errors.fieldOfStudy && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fieldOfStudy.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Row 3 - Study Period */}
      <div className="w-full">
        <Controller
          name="dateRange"
          control={control}
          render={({ field }) => (
            <DateRangePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Select study period"
              error={
                errors.dateRange?.message ||
                errors.dateRange?.from?.message ||
                errors.dateRange?.to?.message
              }
              label=""
              isCurrentlyWorking={isCurrentlyStudying}
              onIsCurrentlyWorkingChange={onIsCurrentlyStudyingChange}
              checkboxLabel="I am currently studying here"
            />
          )}
        />
      </div>

      {/* Grade */}
      <div className="w-full box-border">
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="Grade (0-4)"
                type="number"
                step="0.01"
                min="0"
                max="5"
                className={`w-full text-tertiary break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                  errors.grade
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                }`}
              />
              {errors.grade && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.grade.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Description */}
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

function EducationView({
  edu,
  onEdit,
  onDelete,
}: {
  edu: CandidateEducation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Helper to format ISO date string to 'MMM yyyy' (en-US)
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  return (
    <>
      {/* Row 1 */}
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words ">
          {edu.school}
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
            className="p-[var(--space-xs)] bg-primary hover:bg-[color:var(--bg-tertiary)] hover:rounded-[var(--radius-md)]"
          >
            <Trash2 size={16} className="text-accent-primary" />
          </button>
        </div>
      </div>
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <div className="text-primary break-words">{edu.degree}</div>
        <div className="text-secondary break-words">{edu.fieldOfStudy}</div>
      </div>
      {/* Row 3 time*/}
      <div className="text-tertiary break-words">
        {edu.startDate ? formatDate(edu.startDate) : 'Start date'}
        {' - '}
        {edu.endDate ? formatDate(edu.endDate) : 'Present'}
      </div>
      {/* Row 4 */}
      <div className="text-tertiary break-words">{edu.description}</div>
    </>
  );
}

const MAX_DISPLAY = 3;

export default function Educations({
  educations,
  handleUpdateEducation,
  handleAddEducation,
  handleDeleteEducation,
}: EducationsProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<CandidateEducation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [displayedEducations, setDisplayedEducations] = useState(
    educations.slice(0, MAX_DISPLAY)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);

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

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIdx(-1);
    setIsCurrentlyStudying(false);
    const createEmptyEducation = (): CandidateEducation => ({
      id: Date.now(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: '',
    });
    setEditItem(createEmptyEducation());
  };

  useEffect(() => {
    setDisplayedEducations(
      showAll ? educations : educations.slice(0, MAX_DISPLAY)
    );
  }, [showAll, educations]);

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditItem({ ...educations[idx] });
    setIsCurrentlyStudying(!educations[idx].endDate);
    setError(null);
  };

  const handleDelete = (idx: number) => {
    setDeleteIdx(idx);
  };

  const handleSaveEdit = async (formData: EducationFormData) => {
    if (!handleUpdateEducation || editingIdx === null || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateEducation({
        ...editItem,
        ...formData,
        startDate: formData.dateRange.from
          ? formData.dateRange.from.toISOString()
          : '',
        endDate: isCurrentlyStudying
          ? ''
          : formData.dateRange.to
          ? formData.dateRange.to.toISOString()
          : '',
      });
      setEditingIdx(null);
      setEditItem(null);
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdd = async (formData: EducationFormData) => {
    if (!handleAddEducation || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleAddEducation({
        ...editItem,
        ...formData,
        startDate: formData.dateRange.from
          ? formData.dateRange.from.toISOString()
          : '',
        endDate: isCurrentlyStudying
          ? ''
          : formData.dateRange.to
          ? formData.dateRange.to.toISOString()
          : '',
      });
      setIsAdding(false);
      setEditItem(null);
    } catch (err) {
      setError('Add education failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setEditItem(null);
    setError(null);
    setIsAdding(false);
    setIsCurrentlyStudying(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteIdx === null || !handleDeleteEducation) return;
    setLoadingDelete(true);
    try {
      await handleDeleteEducation(educations[deleteIdx].id);
      setDeleteIdx(null);
    } catch (err) {
      // Có thể show toast hoặc error
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-lg)] w-full box-border">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Educations
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

      {/* Add new education form (not in list) */}
      {isAdding && editingIdx === -1 && editItem && (
        <div className="flex flex-col gap-[var(--space-md)] px-4 w-full box-border">
          <EducationEditForm
            editItem={editItem}
            loading={loading}
            onSubmit={handleSaveAdd}
            onCancel={handleCancel}
            isCurrentlyStudying={isCurrentlyStudying}
            onIsCurrentlyStudyingChange={setIsCurrentlyStudying}
          />
          {error && <div className="text-danger text-sm mt-2">{error}</div>}
        </div>
      )}

      {displayedEducations.map((edu, idx) => {
        const isEditing = editingIdx === idx && editItem;
        return (
          <div
            key={edu.id}
            className="flex flex-col gap-[var(--space-md)] px-4 w-full box-border"
          >
            {isEditing ? (
              <EducationEditForm
                editItem={editItem}
                loading={loading}
                onSubmit={handleSaveEdit}
                onCancel={handleCancel}
                isCurrentlyStudying={isCurrentlyStudying}
                onIsCurrentlyStudyingChange={setIsCurrentlyStudying}
              />
            ) : (
              <EducationView
                edu={edu}
                onEdit={() => handleEdit(idx)}
                onDelete={() => handleDelete(idx)}
              />
            )}
            {error && isEditing && (
              <div className="text-danger text-sm mt-2">{error}</div>
            )}
            {idx !== displayedEducations.length - 1 && (
              <div className="border-t border-[color:var(--border-primary)] mt-[var(--space-md)]" />
            )}
          </div>
        );
      })}

      {/* Show more */}
      {!showAll && educations.length > MAX_DISPLAY && (
        <div className="flex justify-center">
          <button
            className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words"
            onClick={() => setShowAll(true)}
          >
            Show {educations.length - MAX_DISPLAY} more educations
          </button>
        </div>
      )}

      {showAll && educations.length > MAX_DISPLAY && (
        <div className="flex justify-center">
          <button
            className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        </div>
      )}

      {deleteIdx !== null && (
        <ConfirmDelete
          title="Xác nhận xoá học vấn"
          description="Bạn có chắc chắn muốn xoá học vấn này? Hành động này không thể hoàn tác."
          onCancel={() => setDeleteIdx(null)}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />
      )}
    </div>
  );
}
