'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectProjects } from '@/store';
import { logActivity } from '@/lib/firebase';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSaveContent } from '@/admin/lib/save-content';
import type { Project } from '@/types';
import { newProject, ProjectForm } from './ProjectForm';

export function AdminProjectsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const projects = useAppStore(selectProjects);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const saveContent = useSaveContent();

  const saveProjects = useCallback(
    async (newProjects: Project[], sessionUploads: string[] = []) => {
      if (!siteData) return false;
      return saveContent({ ...siteData, projects: newProjects }, sessionUploads);
    },
    [siteData, saveContent]
  );

  const handleSave = async (project: Project, sessionUploads: string[]) => {
    const existing = projects.find((p) => p.id === project.id);
    const newProjects = existing
      ? projects.map((p) => (p.id === project.id ? project : p))
      : [...projects, { ...project, order: projects.length }];
    const ok = await saveProjects(newProjects, sessionUploads);
    if (!ok) return false;
    logActivity(existing ? 'edit' : 'add', `${existing ? 'Edited' : 'Added'} project: ${project.title.en || project.title.tr}`);
    setEditing(null);
    setAdding(false);
    setDraft(null);
    return true;
  };

  const toggleFeatured = (id: string) => {
    const maxOrder = Math.max(0, ...projects.filter((p) => p.featured).map((p) => p.featuredOrder ?? 0));
    saveProjects(
      projects.map((p) =>
        p.id === id ? { ...p, featured: !p.featured, featuredOrder: p.featured ? undefined : maxOrder + 1 } : p
      )
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const deleted = projects.find((p) => p.id === deleteId);
    const newProjects = projects.filter((p) => p.id !== deleteId);
    saveProjects(newProjects);
    if (deleted) logActivity('delete', `Deleted project: ${deleted.title.en || deleted.title.tr}`);
    setDeleteId(null);
  };

  const togglePublish = (id: string) => {
    const newProjects = projects.map((p) =>
      p.id === id ? { ...p, published: !p.published } : p
    );
    saveProjects(newProjects);
  };

  const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = sorted.findIndex((p) => p.id === draggedId);
    const targetIndex = sorted.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...sorted];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const reorderedWithOrder = reordered.map((p, i) => ({ ...p, order: i }));

    const updatedProjects = projects.map((p) => {
      const updated = reorderedWithOrder.find((r) => r.id === p.id);
      return updated ?? p;
    });

    saveProjects(updatedProjects);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-projects')}</h2>
        <button
          onClick={() => {
            setDraft(newProject());
            setAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin-add')}
        </button>
      </div>

      {adding && draft && (
        <ProjectForm
          project={draft}
          allProjects={projects}
          onSave={handleSave}
          onCancel={() => {
            setAdding(false);
            setDraft(null);
          }}
        />
      )}

      <div className="space-y-3">
        {sorted.map((project) =>
          editing === project.id ? (
            <ProjectForm
              key={project.id}
              project={project}
              allProjects={projects}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div
              key={project.id}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(project.id)}
              onDragEnd={handleDragEnd}
              className={`bg-white dark:bg-surface-dark rounded-xl p-4 border flex items-center gap-4 transition-all ${
                dragOverId === project.id
                  ? 'border-primary border-2 shadow-lg scale-[1.01]'
                  : 'border-gray-200 dark:border-slate-800'
              } ${
                draggedId === project.id ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div
                draggable="true"
                onDragStart={() => handleDragStart(project.id)}
                className={`flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors select-none ${
                  draggedId === project.id ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <span className="material-symbols-outlined text-lg">drag_indicator</span>
              </div>
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
                    {project.published ? (project.archived ? t('admin-vis-archived') : t('admin-published')) : t('admin-draft')}
                  </span>
                  {project.featured && project.published && !project.archived && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      {t('admin-proj-featured')} {project.featuredOrder ?? ''}
                    </span>
                  )}
                  {(project.media?.length ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {t('admin-media-count', { count: project.media?.length })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {(project.techStack || []).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleFeatured(project.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title={t('admin-proj-featured')}
                  aria-pressed={!!project.featured}
                >
                  <span className={`material-symbols-outlined text-sm ${project.featured ? 'text-amber-500' : ''}`}>
                    {project.featured ? 'star' : 'star_outline'}
                  </span>
                </button>
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
