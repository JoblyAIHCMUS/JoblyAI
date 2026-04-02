'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Dot, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CandidateExperience } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';

interface ExperiencesProps {
  experiences: CandidateExperience[];
  handleUpdateExperience?: (experience: CandidateExperience) => Promise<void>;
  handleAddExperience?: (experience: CandidateExperience) => Promise<void>;
  handleDeleteExperience?: (id: number) => Promise<void>;
}

interface ExperienceEditFormProps {
  editItem: CandidateExperience;
  loading: boolean;
  handleChange: (field: keyof CandidateExperience, value: string) => void;
  handleDateChange: (field: 'startDate' | 'endDate', date: Date | null) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

function ExperienceEditForm({
  editItem,
  loading,
  handleChange,
  handleDateChange,
  handleSave,
  handleCancel,
}: ExperienceEditFormProps) {
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
        value={editItem.jobTitle}
        onChange={(e) => handleChange('jobTitle', e.target.value)}
        placeholder="Role"
      />
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <input
          className="text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary"
          value={editItem.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          placeholder="Company"
        />
        <Dot size={16} />
        <div className="min-w-[100px] max-w-[120px]">
          <Select
            value={editItem.type}
            onValueChange={(val) => handleChange('type', val)}
          >
            <SelectTrigger className="text-tertiary break-words focus:outline-none focus:ring-2 focus:ring-accent-primary">
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
        </div>
        <Dot size={16} />
        <div className="flex items-center gap-2">
          <DatePicker
            selected={editItem.startDate ? new Date(editItem.startDate) : null}
            onChange={(date: Date | null) =>
              handleDateChange('startDate', date)
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Start date"
            className="text-tertiary break-words border rounded p-1 max-w-[110px] focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
          <span className="mx-1">-</span>
          <DatePicker
            selected={editItem.endDate ? new Date(editItem.endDate) : null}
            onChange={(date: Date | null) => handleDateChange('endDate', date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="End date"
            className="text-tertiary break-words border rounded p-1 max-w-[110px] focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>
      </div>
      {/* Row 3 */}
      <input
        className="text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary"
        value={editItem.location}
        onChange={(e) => handleChange('location', e.target.value)}
        placeholder="Location"
      />
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
            <Trash2 size={16} className="text-danger" />
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
    setEditingIdx(-1); // hoặc null nhưng mình recommend -1
    const createEmptyExperience = (): CandidateExperience => ({
      //id là number
      id: Date.now(), // tạm thời dùng timestamp làm id, sau này backend sẽ trả về id thật
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
  };

  const handleChange = (field: keyof CandidateExperience, value: string) => {
    setEditItem((item) => (item ? { ...item, [field]: value } : item));
  };

  const handleDateChange = (
    field: 'startDate' | 'endDate',
    date: Date | null
  ) => {
    setEditItem((item) =>
      item ? { ...item, [field]: date ? date.toISOString() : '' } : item
    );
  };

  const handleSaveEdit = async () => {
    if (!handleUpdateExperience || editingIdx === null || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateExperience(editItem);
      setEditingIdx(null);
      setEditItem(null);
    } catch (err) {
      console.error(err);
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdd = async () => {
    if (!handleAddExperience || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleAddExperience(editItem);
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
  };

  return (
    <div className="rounded-[var(--radius-lg)] border bg-primary px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Experiences
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

      {/* Add new experience form (not in list) */}
      {isAdding && editingIdx === -1 && editItem && (
        <div className="flex flex-col gap-[var(--space-md)] px-6 flex-1">
          <ExperienceEditForm
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

      {displayedExperiences.map((exp, idx) => {
        // Chỉ item đang edit (theo idx) mới vào edit mode, còn khi isAdding thì không map vào list này
        const isEditing = editingIdx === idx && editItem;
        return (
          <div
            key={exp.id}
            className="flex flex-col gap-[var(--space-md)] px-6 flex-1"
          >
            {isEditing ? (
              <ExperienceEditForm
                editItem={editItem}
                loading={loading}
                handleChange={handleChange}
                handleDateChange={handleDateChange}
                handleSave={handleSaveEdit}
                handleCancel={handleCancel}
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
