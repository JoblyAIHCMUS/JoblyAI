'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dot, Edit, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateInput } from '@/components/ui/date-input';
import { CandidateEducation } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';
import { createEducationSchema, DEGREE_OPTIONS, type EducationFormData } from '@/lib/validation';

interface EducationsProps {
  educations: CandidateEducation[];
  handleUpdateEducation?: (education: CandidateEducation) => Promise<void>;
  handleAddEducation?: (education: CandidateEducation) => Promise<void>;
  handleDeleteEducation?: (id: number) => Promise<void>;
}

interface EducationEditFormProps {
  editItem: CandidateEducation;
  loading: boolean;
  isNew: boolean; // true when creating, false when editing
  onSubmit: (data: EducationFormData) => Promise<void>;
  onCancel: () => void;
}

function EducationEditForm({
  editItem,
  loading,
  isNew,
  onSubmit,
  onCancel,
}: EducationEditFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // When creating: isCurrent = true (not checked by default)
  // When editing: isCurrent = true if no endDate, false if has endDate
  const [isCurrent, setIsCurrent] = useState(
    isNew ? true : editItem.endDate ? false : true
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<EducationFormData>({
    resolver: zodResolver(createEducationSchema(isCurrent)),
    mode: 'onChange',
    defaultValues: {
      school: editItem.school || '',
      degree: editItem.degree ?? undefined,
      fieldOfStudy: editItem.fieldOfStudy || '',
      startDate: editItem.startDate ? new Date(editItem.startDate) : undefined,
      endDate: editItem.endDate ? new Date(editItem.endDate) : null,
      grade: editItem.grade || '',
      description: editItem.description || '',
    },
  });

  const descriptionValue = watch('description');

  // Revalidate endDate when isCurrent changes
  useEffect(() => {
    trigger('endDate');
  }, [isCurrent, trigger]);
  const DEGREE_LABELS: Record<string, string> = {
    PHD: 'PhD',
    BACHELOR: "Bachelor's",
    MASTER: "Master's",
    ASSOCIATE: 'Associate',
    DIPLOMA: 'Diploma',
    HIGH_SCHOOL: 'High School',
    OTHER: 'Other',
  };

  const formatDegree = (d?: string) => (d ? DEGREE_LABELS[d] : '');

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
      className="space-y-2 w-full max-w-full"
    >
      {/* Row 1 - School */}
      <div className="w-full box-border">
        <label className="block label-label-1-semi-bold mb-1">
          School <span className="text-red-500">*</span>
        </label>
        <Controller
          name="school"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="School"
                className={`w-full text-primary break-words border rounded p-2 focus:outline-none focus:ring-2 ${errors.school
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-accent-primary'
                  }`}
              />
            </>
          )}
        />
      </div>
      {/* Error message for school */}
      {errors.school && (
        <div className="w-full box-border">
          <p className="text-red-500 text-xs">{errors.school.message}</p>
        </div>
      )}

      {/* Row 2 - Degree & Field of Study */}
      <div className="flex items-center gap-2 flex-wrap w-full box-border">
        <div className="flex-1 min-w-[120px]">
          <label className="block label-label-1-semi-bold mb-1">
              Degree <span className="text-red-500">*</span>
          </label>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <>
                <select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                  className={`w-full break-words border rounded p-2 focus:outline-none focus:ring-2 ${!field.value
                      ? 'text-gray-400' //  color
                      : 'text-primary' // selected value
                    } ${errors.degree
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-accent-primary'
                    }`}
                >
                  <option value="" disabled hidden>
                    Select degree
                  </option>
                  {DEGREE_OPTIONS.map((d) => (
                    <option key={d} value={d} className="text-tertiary">
                      {formatDegree(d)}
                    </option>
                  ))}
                </select>
              </>
            )}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block label-label-1-semi-bold mb-1">Field of Study</label>
          <Controller
            name="fieldOfStudy"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  placeholder="Field of Study"
                  className={`w-full text-primary break-words border rounded p-2 focus:outline-none focus:ring-2 ${errors.fieldOfStudy
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-accent-primary'
                    }`}
                />
              </>
            )}
          />
        </div>
      </div>

      {/* Error messages for degree and field of study */}
      {errors.degree || errors.fieldOfStudy ? (
        <div className="flex items-center gap-2 flex-wrap w-full box-border">
          <div className="flex-1 min-w-[120px]">
            {errors.degree && (
              <p className="text-red-500 text-xs">{errors.degree.message}</p>
            )}
          </div>
          <div className="flex-1 min-w-[120px]">
            {errors.fieldOfStudy && (
              <p className="text-red-500 text-xs">
                {errors.fieldOfStudy.message}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Row 3 - Study Period */}
      <div className="flex items-center gap-2 flex-wrap w-full box-border">
        <div className="flex-1 min-w-[150px]">
          <label className="block label-label-1-semi-bold mb-1">
            Start Date <span className="text-red-500">*</span> 
          </label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label=""
                placeholder="Select start date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex-1 min-w-[150px]">          
          <label className="block label-label-1-semi-bold mb-1">
            End Date {!isCurrent && <span className="text-red-500">*</span>}
          </label>          
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label=""
                placeholder={isCurrent ? 'Present' : 'Select end date'}
                value={field.value}
                onChange={field.onChange}
                disabled={isCurrent}
              />
            )}
          />
        </div>
      </div>
      {errors.startDate || errors.endDate ? (
        <div className="flex items-center gap-2 flex-wrap w-full box-border">
          <div className="flex-1 min-w-[150px]">
            {errors.startDate && (
              <p className="text-red-500 text-xs">{errors.startDate.message}</p>
            )}
          </div>
          <div className="flex-1 min-w-[150px]">
            {errors.endDate && (
              <p className="text-red-500 text-xs">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Currently Studying Checkbox */}
      <div className="w-full box-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => {
              setIsCurrent(e.target.checked);
              // Clear end date when currently studying is checked
              if (e.target.checked) {
                setValue('endDate', null);
              }
            }}
            className="w-4 h-4 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-tertiary">Currently studying here</span>
        </label>
      </div>

      {/* Grade */}
      <div className="w-full box-border">
        <label className="block label-label-1-bold mb-1">Grade (GPA)</label>
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                placeholder="GPA (0.00 – 4.00)"
                inputMode="decimal"
                type="number"
                step="0.01"
                min="0"
                max="4"
                onChange={(e) => {
                  let value = e.target.value;
                  if (/^(?:[0-4](?:\.\d{0,2})?)?$/.test(value)) {
                    field.onChange(value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!value) return;

                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    field.onChange(num.toFixed(2));
                  }
                }}
                className={`w-full text-primary break-words border rounded p-2 focus:outline-none focus:ring-2 ${errors.grade
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
        <label className="block label-label-1-semi-bold mb-1">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                ref={textareaRef}
                placeholder="Description"
                className={`w-full text-primary break-words border rounded p-2 focus:outline-none focus:ring-2 min-h-[60px] ${errors.description
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
        {edu.fieldOfStudy && (
          <>
            <Dot size={16} className="text-primary" />
            <div className="text-secondary break-words">{edu.fieldOfStudy}</div>
          </>
        )}
        {edu.grade && (
          <>
            <Dot size={16} className="text-primary" />
            <div className="text-tertiary break-words">GPA: {edu.grade}</div>
          </>
        )}
      </div>
      {/* Row 3 time*/}
      <div className="text-tertiary break-words">
        {edu.startDate ? formatDate(edu.startDate) : 'Start date'}
        {' - '}
        {edu.endDate ? formatDate(edu.endDate) : 'Present'}
      </div>
      {/* Row 4 */}
      {edu.description && (
        <div className="text-tertiary break-words">{edu.description}</div>
      )}
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
    const createEmptyEducation = (): CandidateEducation => ({
      id: Date.now(),
      school: '',
      degree: undefined,
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
        degree: formData.degree,
        startDate: formData.startDate
          ? formData.startDate.toISOString()
          : '',
        endDate: formData.endDate
          ? formData.endDate.toISOString()
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
        degree: formData.degree,
        startDate: formData.startDate
          ? formData.startDate.toISOString()
          : '',
        endDate: formData.endDate
          ? formData.endDate.toISOString()
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
            isNew={true}
            onSubmit={handleSaveAdd}
            onCancel={handleCancel}
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
                isNew={false}
                onSubmit={handleSaveEdit}
                onCancel={handleCancel}
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

      {/* Empty state */}
      {educations.length === 0 && (
        <div className="text-secondary text-center py-4">
          No educations added yet. Click the + button to add your education
          history.
        </div>
      )}
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
          title="Confirm Deletion"
          description="Are you sure you want to delete this education? This action cannot be undone."
          onCancel={() => setDeleteIdx(null)}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />
      )}
    </div>
  );
}
