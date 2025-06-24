"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskWithRelations } from '@/lib/api/tasks';
import { TaskCard } from '@/components/task-card';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: TaskWithRelations[];
  onEditTask: (task: TaskWithRelations) => void;
  onDeleteTask: (task: TaskWithRelations) => void;
  onAddTask: () => void;
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const taskIds = tasks.map(task => task.id.toString());

  return (
    <Card className={`${color} ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={onAddTask}
              className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-200 transition-colors"
              title="Add new task"
            >
              <Plus className="h-3 w-3 text-gray-500" />
            </button>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-2 min-h-[200px] px-3 pb-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            No tasks
          </div>
        )}
      </CardContent>
    </Card>
  );
} 