'use client';

import React, { useState, useEffect } from 'react';
import { Award, Edit, Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateInput } from '@/components/ui/date-input';
import { CandidateCertificate } from '@/types/candidate';
import ConfirmDelete from '@/components/ui/confirmDelete';
import {
  createCertificateSchema,
  type CertificateFormData,
} from '@/lib/validation';
import { cn } from '@/lib/utils';

interface CertificatesProps {
  certificates: CandidateCertificate[];
  handleUpdateCertificate?: (certificate: CandidateCertificate) => Promise<void>;
  handleAddCertificate?: (certificate: CandidateCertificate) => Promise<void>;
  handleDeleteCertificate?: (id: number) => Promise<void>;
}

interface CertificateEditFormProps {
  editItem: CandidateCertificate;
  loading: boolean;
  isNew: boolean;
  onSubmit: (data: CertificateFormData) => Promise<void>;
  onCancel: () => void;
}

function CertificateEditForm({
  editItem,
  loading,
  isNew,
  onSubmit,
  onCancel,
}: CertificateEditFormProps) {
  const initialHasExpiry = !isNew && !!editItem.expiryDate;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<CertificateFormData>({
    resolver: zodResolver(createCertificateSchema()),
    mode: 'onChange',
    defaultValues: {
      name: editItem.name || '',
      issuer: editItem.issuer || '',
      issueDate: editItem.issueDate ? new Date(editItem.issueDate) : undefined,
      hasExpiry: initialHasExpiry,
      expiryDate: editItem.expiryDate ? new Date(editItem.expiryDate) : null,
      credentialId: editItem.credentialId || '',
      url: editItem.url || '',
    },
  });

  const hasExpiry = watch('hasExpiry');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">
            Certificate Name <span className="text-red-500">*</span>
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="e.g. AWS Certified Solutions Architect"
                className={cn(
                  "w-full text-primary border rounded-md p-2 focus:outline-none focus:ring-2 transition-all",
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-accent-primary"
                )}
              />
            )}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">
            Issuing Organization <span className="text-red-500">*</span>
          </label>
          <Controller
            name="issuer"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="e.g. Amazon Web Services"
                className={cn(
                  "w-full text-primary border rounded-md p-2 focus:outline-none focus:ring-2 transition-all",
                  errors.issuer ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-accent-primary"
                )}
              />
            )}
          />
          {errors.issuer && <p className="text-red-500 text-xs mt-1">{errors.issuer.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">
            Issue Date <span className="text-red-500">*</span>
          </label>
          <Controller
            name="issueDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label=""
                placeholder="Select date"
                value={field.value}
                onChange={(date) => {
                  field.onChange(date);
                  trigger(['issueDate', 'expiryDate']);
                }}
              />
            )}
          />
          {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate.message}</p>}
        </div>

        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">
            Expiry Date {hasExpiry && <span className="text-red-500">*</span>}
          </label>
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label=""
                placeholder={hasExpiry ? "Select date" : "Does not expire"}
                value={field.value}
                onChange={(date) => {
                  field.onChange(date);
                  trigger('expiryDate');
                }}
                disabled={!hasExpiry}
              />
            )}
          />
          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Controller
          name="hasExpiry"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              id="hasExpiry"
              checked={field.value}
              onChange={(e) => {
                const checked = e.target.checked;
                field.onChange(checked);
                if (!checked) {
                  setValue('expiryDate', null, { shouldValidate: true });
                } else {
                  trigger('expiryDate');
                }
              }}
              className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary cursor-pointer"
            />
          )}
        />
        <label htmlFor="hasExpiry" className="text-sm text-tertiary cursor-pointer select-none">
          This credential has an expiration date
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">Credential ID</label>
          <Controller
            name="credentialId"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="e.g. AWS-SEC-12345"
                className="w-full text-primary border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
              />
            )}
          />
        </div>

        <div className="w-full">
          <label className="block label-label-1-semi-bold mb-1">Credential URL</label>
          <Controller
            name="url"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="https://..."
                className={cn(
                  "w-full text-primary border rounded-md p-2 focus:outline-none focus:ring-2 transition-all",
                  errors.url ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-accent-primary"
                )}
              />
            )}
          />
          {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading || !isDirty || !isValid}
          className="px-6 py-2 rounded-md bg-accent-solid text-white font-bold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {loading ? 'Saving...' : 'Save Certificate'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 rounded-md border border-gray-300 text-secondary hover:bg-gray-100 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CertificateView({
  cert,
  onEdit,
  onDelete,
}: {
  cert: CandidateCertificate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="group relative flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50/50 transition-colors">
      <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600">
        <Award size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-base font-bold text-primary truncate tracking-tight">{cert.name}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-accent-primary hover:bg-white rounded-md shadow-sm transition-all"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md shadow-sm transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-sm font-semibold text-secondary">{cert.issuer}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-tertiary font-medium">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Issued {formatDate(cert.issueDate)}</span>
          </div>
          {cert.expiryDate && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Expires {formatDate(cert.expiryDate)}</span>
            </div>
          )}
        </div>
        {(cert.credentialId || cert.url) && (
          <div className="flex items-center gap-4 mt-3">
            {cert.credentialId && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                ID: {cert.credentialId}
              </span>
            )}
            {cert.url && (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-accent-primary hover:underline underline-offset-2"
              >
                View Credential <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const MAX_DISPLAY = 3;

export default function Certificates({
  certificates,
  handleUpdateCertificate,
  handleAddCertificate,
  handleDeleteCertificate,
}: CertificatesProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<CandidateCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const displayedCerts = showAll ? certificates : certificates.slice(0, MAX_DISPLAY);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIdx(-1);
    setEditItem({
      id: Date.now(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: '',
    });
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditItem({ ...certificates[idx] });
    setError(null);
  };

  const handleSaveEdit = async (formData: CertificateFormData) => {
    if (!handleUpdateCertificate || editingIdx === null || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleUpdateCertificate({
        ...editItem,
        ...formData,
        issueDate: formData.issueDate.toISOString(),
        expiryDate: formData.hasExpiry && formData.expiryDate ? formData.expiryDate.toISOString() : '',
      });
      setEditingIdx(null);
      setEditItem(null);
    } catch {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdd = async (formData: CertificateFormData) => {
    if (!handleAddCertificate || !editItem) return;
    setLoading(true);
    setError(null);
    try {
      await handleAddCertificate({
        ...editItem,
        ...formData,
        issueDate: formData.issueDate.toISOString(),
        expiryDate: formData.hasExpiry && formData.expiryDate ? formData.expiryDate.toISOString() : '',
      });
      setIsAdding(false);
      setEditItem(null);
    } catch {
      setError('Add certificate failed. Please try again.');
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
    if (deleteIdx === null || !handleDeleteCertificate) return;
    setLoadingDelete(true);
    try {
      await handleDeleteCertificate(certificates[deleteIdx].id);
      setDeleteIdx(null);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="text-accent-primary" size={24} />
          <h3 className="text-xl font-semibold text-primary font-['Lexend_Deca']">
            Certifications & Licenses
          </h3>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all text-sm font-bold"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {isAdding && editingIdx === -1 && editItem && (
        <div className="p-6 border border-dashed border-accent-primary/30 rounded-xl bg-slate-50/50">
          <CertificateEditForm
            editItem={editItem}
            loading={loading}
            isNew={true}
            onSubmit={handleSaveAdd}
            onCancel={handleCancel}
          />
          {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {displayedCerts.map((cert, idx) => (
          <React.Fragment key={cert.id}>
            {editingIdx === idx && editItem ? (
              <div className="p-6 border rounded-xl bg-slate-50/50 mb-4">
                <CertificateEditForm
                  editItem={editItem}
                  loading={loading}
                  isNew={false}
                  onSubmit={handleSaveEdit}
                  onCancel={handleCancel}
                />
                {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}
              </div>
            ) : (
              <CertificateView
                cert={cert}
                onEdit={() => handleEdit(idx)}
                onDelete={() => setDeleteIdx(idx)}
              />
            )}
            {idx !== displayedCerts.length - 1 && (
              <div className="h-px bg-slate-100 mx-4 my-1" />
            )}
          </React.Fragment>
        ))}
      </div>

      {certificates.length === 0 && !isAdding && (
        <div className="text-center py-10 border-2 border-dashed rounded-2xl border-slate-100 bg-slate-50/30">
          <div className="inline-flex p-3 bg-white rounded-full shadow-sm text-slate-300 mb-3">
             <Award size={32} />
          </div>
          <p className="text-slate-500 text-sm font-medium">No certifications added yet.</p>
          <button onClick={handleAdd} className="mt-2 text-accent-primary text-xs font-bold hover:underline">Click here to add your first one</button>
        </div>
      )}

      {certificates.length > MAX_DISPLAY && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-bold text-accent-primary hover:text-accent-hover transition-colors"
          >
            {showAll ? 'Show less' : `Show all ${certificates.length} certifications`}
          </button>
        </div>
      )}

      {deleteIdx !== null && (
        <ConfirmDelete
          title="Delete Certification"
          description="Are you sure you want to remove this certification? This action will permanently delete the record from your profile."
          onCancel={() => setDeleteIdx(null)}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />
      )}
    </div>
  );
}
