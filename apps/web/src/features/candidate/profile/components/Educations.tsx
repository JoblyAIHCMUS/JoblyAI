'use client';

import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Edit, Plus, Trash2 } from 'lucide-react';

import { CandidateEducation } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';

interface EducationsProps {
  educations: CandidateEducation[];
  handleUpdateEducation?: (education: CandidateEducation) => Promise<void>;
  handleAddEducation?: (education: CandidateEducation) => Promise<void>;
  handleDeleteEducation?: (id: number) => Promise<void>;
}

interface EducationEditFormProps {
  editItem: CandidateEducation;
  loading: boolean;
  handleChange: (field: keyof CandidateEducation, value: string) => void;
  handleDateChange?: (
    field: 'startDate' | 'endDate',
    date: Date | null
  ) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

function EducationEditForm({
  editItem,
  loading,
  handleChange,
  handleDateChange,
  handleSave,
  handleCancel,
}: EducationEditFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [editItem.description]);
  return (
    <>
      {/* Row 1 */}
      <input
        className="text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary"
        value={editItem.school}
        onChange={(e) => handleChange('school', e.target.value)}
        placeholder="School"
      />
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <input
          className="text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary"
          value={editItem.degree}
          onChange={(e) => handleChange('degree', e.target.value)}
          placeholder="Degree"
        />
        <input
          className="text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary"
          value={editItem.fieldOfStudy}
          onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
          placeholder="Field of Study"
        />
      </div>
      {/* Row 3 */}
      <div className="flex items-center gap-2">
        <DatePicker
          selected={editItem.startDate ? new Date(editItem.startDate) : null}
          onChange={(date: Date | null) =>
            handleDateChange && handleDateChange('startDate', date)
          }
          dateFormat="yyyy-MM-dd"
          placeholderText="Start date"
          className="text-tertiary break-words border rounded p-1 max-w-[110px] focus:outline-none focus:ring-2 focus:ring-accent-primary"
        />
        <span className="text-tertiary">-</span>
        <DatePicker
          selected={editItem.endDate ? new Date(editItem.endDate) : null}
          onChange={(date: Date | null) =>
            handleDateChange && handleDateChange('endDate', date)
          }
          dateFormat="yyyy-MM-dd"
          placeholderText="End date"
          className="text-tertiary break-words border rounded p-1 max-w-[110px] focus:outline-none focus:ring-2 focus:ring-accent-primary"
        />
      </div>
      {/* Row 4 */}
      <textarea
        ref={textareaRef}
        className="text-tertiary break-words border rounded p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-[60px]"
        style={{ maxHeight: '200px', overflowY: 'auto' }}
        value={editItem.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Description"
      />
      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 rounded bg-accent-solid text-white hover:bg-accent-hover"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          className="px-4 py-2 rounded border"
          onClick={handleCancel}
          disabled={loading}
        >
          Hủy
        </button>
      </div>
    </>
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

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIdx(-1);
    const createEmptyEducation = (): CandidateEducation => ({
      id: Date.now(),
      // logo: '',
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
    setError(null);
  };

  const handleDelete = (idx: number) => {
    setDeleteIdx(idx);
  };

  const handleChange = (field: keyof CandidateEducation, value: string) => {
    setEditItem((item) => (item ? { ...item, [field]: value } : item));
  };

  const handleDateChange = (
    field: 'startDate' | 'endDate',
    date: Date | null
  ) => {
    setEditItem((item) =>
      item
        ? {
            ...item,
            [field]: date ? date.toISOString() : '',
          }
        : item
    );
  };

  const handleSaveEdit = async () => {
    if (!handleUpdateEducation || editingIdx === null || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateEducation(editItem);
      setEditingIdx(null);
      setEditItem(null);
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdd = async () => {
    if (!handleAddEducation || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleAddEducation(editItem);
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
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Educations
        </div>
        <div className="flex gap-2">
          <button 
            className="p-[var(--space-xs)] bg-primary hover:bg-[color:var(--bg-tertiary)] hover:rounded-[var(--radius-md)]"
            onClick={handleAdd}
          >
            <Plus
              size={16}
              className="text-accent-primary"
            />
          </button>
        </div>
      </div>

      {/* Add new education form (not in list) */}
      {isAdding && editingIdx === -1 && editItem && (
        <div className="flex flex-col gap-[var(--space-md)] px-6 flex-1">
          <EducationEditForm
            editItem={editItem}
            loading={loading}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
            handleSave={handleSaveAdd}
            handleCancel={handleCancel}
          />
          {error && <div className="text-danger text-sm mt-2">{error}</div>}
        </div>
      )}

      {displayedEducations.map((edu, idx) => {
        const isEditing = editingIdx === idx && editItem;
        return (
          <div
            key={edu.id}
            className="flex flex-col gap-[var(--space-md)] px-4 flex-1"
          >
            {isEditing ? (
              <EducationEditForm
                editItem={editItem}
                loading={loading}
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSave={handleSaveEdit}
                handleCancel={handleCancel}
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
