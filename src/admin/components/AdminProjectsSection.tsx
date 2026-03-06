'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectProjects } from '@/store';
import { saveSiteData } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Project } from '@/types';

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project?: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Project>(
    project || {
      id: Date.now().toString(),
      title: { en: '', tr: '' },
      description: { en: '', tr: '' },
      category: 'web',
      techStack: [],
      githubUrl: '',
      demoUrl: '',
      image: '',
      published: true,
    }
  );
  const [techInput, setTechInput] = useState(
    project?.techStack?.join(', ') || ''
  );

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title (EN)</label>
          <input
            value={form.title.en}
            onChange={(e) =>
              setForm({ ...form, title: { ...form.title, en: e.target.value } })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title (TR)</label>
          <input
            value={form.title.tr}
            onChange={(e) =>
              setForm({ ...form, title: { ...form.title, tr: e.target.value } })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description (EN)</label>
          <textarea
            rows={3}
            value={form.description.en}
            onChange={(e) =>
              setForm({
                ...form,
                description: { ...form.description, en: e.target.value },
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (TR)</label>
          <textarea
            rows={3}
            value={form.description.tr}
            onChange={(e) =>
              setForm({
                ...form,
                description: { ...form.description, tr: e.target.value },
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={Array.isArray(form.category) ? form.category[0] : form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          >
            {['web', 'ai', 'startup', 'opensource', 'desktop', 'mobile', 'practice', 'test'].map(
              (c) => (
                <option key={c} value={c}>{c}</option>
              )
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Demo URL</label>
          <input
            value={form.demoUrl}
            onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tech Stack (comma-separated)</label>
          <input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded"
          />
          Published
        </label>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          {t('admin-cancel')}
        </button>
        <button
          onClick={() => {
            const techStack = techInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            onSave({ ...form, techStack });
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700 transition-colors"
        >
          {t('admin-save')}
        </button>
      </div>
    </div>
  );
}

export function AdminProjectsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const projects = useAppStore(selectProjects);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saveProjects = useCallback(
    async (newProjects: Project[]) => {
      if (!siteData) return;
      const updated = { ...siteData, projects: newProjects };
      try {
        await saveSiteData(updated);
        showToast(t('admin-saved'), 'success');
      } catch {
        showToast('Save failed', 'error');
      }
    },
    [siteData, t]
  );

  const handleSave = (project: Project) => {
    const existing = projects.find((p) => p.id === project.id);
    let newProjects: Project[];
    if (existing) {
      newProjects = projects.map((p) =>
        p.id === project.id ? project : p
      );
    } else {
      newProjects = [...projects, { ...project, order: projects.length }];
    }
    saveProjects(newProjects);
    setEditing(null);
    setAdding(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const newProjects = projects.filter((p) => p.id !== deleteId);
    saveProjects(newProjects);
    setDeleteId(null);
  };

  const togglePublish = (id: string) => {
    const newProjects = projects.map((p) =>
      p.id === id ? { ...p, published: !p.published } : p
    );
    saveProjects(newProjects);
  };

  const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-projects')}</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin-add')}
        </button>
      </div>

      {adding && (
        <ProjectForm onSave={handleSave} onCancel={() => setAdding(false)} />
      )}

      <div className="space-y-3">
        {sorted.map((project) =>
          editing === project.id ? (
            <ProjectForm
              key={project.id}
              project={project}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div
              key={project.id}
              className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-slate-800 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">
                    {project.title.en || project.title.tr}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.published
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {project.techStack.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublish(project.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title={project.published ? t('admin-unpublish') : t('admin-publish')}
                >
                  <span className="material-symbols-outlined text-sm">
                    {project.published ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                <button
                  onClick={() => setEditing(project.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => setDeleteId(project.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t('admin-delete')}
        message={t('admin-confirm-delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
