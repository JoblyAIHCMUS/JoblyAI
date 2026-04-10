'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Dot, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateInput } from '@/components/ui/date-input';
import { CandidateExperience } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';
import {
  createExperienceSchema,
  type ExperienceFormData,
} from '@/lib/validation';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  formatEmploymentType,
} from '@/lib/employment-type-config';

interface ExperiencesProps {
  experiences: CandidateExperience[];
  handleUpdateExperience?: (experience: CandidateExperience) => Promise<void>;
  handleAddExperience?: (experience: CandidateExperience) => Promise<void>;
  handleDeleteExperience?: (id: number) => Promise<void>;
}

interface ExperienceEditFormProps {
  editItem: CandidateExperience;
  loading: boolean;
  isNew: boolean; // true when creating, false when editing
  onSubmit: (data: ExperienceFormData) => Promise<void>;
  onCancel: () => void;
}

function ExperienceEditForm({
  editItem,
  loading,
  isNew,
  onSubmit,
  onCancel,
}: ExperienceEditFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // When creating: start unchecked by default.
  // When editing: infer the initial value from the stored end date.

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(createExperienceSchema()),
    mode: 'onChange',
    defaultValues: {
      jobTitle: editItem.jobTitle || '',
      companyName: editItem.companyName || '',
      type: editItem.type ?? undefined,
      location: editItem.location || '',
      startDate: editItem.startDate ? new Date(editItem.startDate) : undefined,
      endDate: editItem.endDate ? new Date(editItem.endDate) : null,
      isCurrent: !isNew && !editItem.endDate, // If editing and no end date, treat as current job
      description: editItem.description || '',
    },
  });

  const descriptionValue = watch('description');
  const isCurrent = watch('isCurrent');

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
      {/* Row 1 - Job Title */}
      <div className="w-full box-border">
        <label className="block label-label-1-semi-bold mb-1">
          Job Title <span className="text-red-500">*</span>
        </label>
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
            <label className="block label-label-1-semi-bold mb-1">
              Company <span className="text-red-500">*</span>
            </label>
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
            <label className="block label-label-1-semi-bold mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <>
                  <select
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value || undefined)
                    }
                    className={`w-full break-words border rounded p-2 focus:outline-none focus:ring-2 ${
                      !field.value ? 'text-gray-400' : 'text-tertiary'
                    } ${
                      errors.type
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-accent-primary'
                    }`}
                  >
                    <option value="" disabled hidden>
                      Select type
                    </option>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                    onChange={(date) => {
                      field.onChange(date);
                      trigger(['startDate', 'endDate']);
                    }}
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
                    onChange={(date) => {
                      field.onChange(date);
                      trigger('endDate');
                    }}
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
                  <p className="text-red-500 text-xs">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="flex-1 min-w-[150px]">
                {errors.endDate && (
                  <p className="text-red-500 text-xs">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          ) : null}
          {/* Currently Working Checkbox */}
          <div className="w-full box-border mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setValue('isCurrent', checked, { shouldValidate: true });

                  if (checked) {
                    setValue('endDate', null, {
                      shouldValidate: true,
                    });
                  } else {
                    trigger('endDate');
                  }
                }}
                className="w-4 h-4 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-tertiary">I currently work here</span>
            </label>
          </div>
        </div>
      </div>

      {/* Row 3 - Location */}
      <div className="w-full box-border">
        <label className="block label-label-1-semi-bold mb-1">Location</label>
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
        <label className="block label-label-1-semi-bold mb-1">
          Description
        </label>
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
          disabled={loading || !isDirty || !isValid}
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
        {exp.type && (
          <>
            <Dot size={16} className="flex-shrink-0" />
            <div className="text-primary break-words">
              {formatEmploymentType(exp.type)}
            </div>
          </>
        )}
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
    const createEmptyExperience = (): CandidateExperience => ({
      id: Date.now(),
      jobTitle: '',
      companyName: '',
      type: undefined,
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
        startDate: formData.startDate ? formData.startDate.toISOString() : '',
        endDate: formData.isCurrent
          ? ''
          : formData.endDate
          ? formData.endDate.toISOString()
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
        startDate: formData.startDate ? formData.startDate.toISOString() : '',
        endDate: formData.isCurrent
          ? ''
          : formData.endDate
          ? formData.endDate.toISOString()
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
            isNew={true}
            onSubmit={handleSaveAdd}
            onCancel={handleCancel}
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
                isNew={false}
                onSubmit={handleSaveEdit}
                onCancel={handleCancel}
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
