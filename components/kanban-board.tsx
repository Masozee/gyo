"use client";

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskWithRelations } from '@/lib/api/tasks';
import { KanbanColumn } from '@/components/kanban-column';
import { TaskCard } from '@/components/task-card';

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
  onStatusChange: (taskId: number, newStatus: string) => void;
  onEditTask: (task: TaskWithRelations) => void;
  onDeleteTask: (task: TaskWithRelations) => void;
  onAddTask: () => void;
}

const statusColumns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-50 border-gray-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'DONE', title: 'Done', color: 'bg-green-50 border-green-200' },
  { id: 'CANCELLED', title: 'Cancelled', color: 'bg-red-50 border-red-200' },
];

export function KanbanBoard({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    // If dropped outside a valid drop zone, do nothing (task stays in original position)
    if (!over) {
      return;
    }

    const taskId = parseInt(active.id.toString());
    const newStatus = over.id.toString();
    
    // Find the task being moved
    const task = tasks.find(t => t.id === taskId);
    
    // Validate that we have a task and the status is valid
    if (!task) {
      console.warn('Task not found for drag operation:', taskId);
      return;
    }
    
    // Check if it's a valid status column
    const isValidStatus = statusColumns.some(col => col.id === newStatus);
    if (!isValidStatus) {
      console.warn('Invalid status for drag operation:', newStatus);
      return;
    }
    
    // Only update if the status actually changed
    if (task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-w-fit">
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasksByStatus[column.id] || []}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 