import React, { useState, useEffect } from 'react';
import { CheckCircle, Plus, Trash2, Calendar, Bell } from 'lucide-react';

/**
 * TasksManager - Task creation and follow-up reminders
 */
function TasksManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('crm-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, title: 'Follow up on premium package interest', dueDate: '2024-01-25', priority: 'high', status: 'pending', createdAt: '2024-01-20' },
        { id: 2, title: 'Send product documentation', dueDate: '2024-01-22', priority: 'medium', status: 'pending', createdAt: '2024-01-20' },
        { id: 3, title: 'Schedule training session', dueDate: '2024-01-28', priority: 'low', status: 'completed', createdAt: '2024-01-18' },
      ]);
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('crm-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask.title) return alert('Please enter a task title');
    
    setTasks([{
      id: Date.now(),
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }, ...tasks]);
    
    setNewTask({ title: '', dueDate: '', priority: 'medium' });
    setShowForm(false);
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
        : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tasks & Reminders</h3>
          <p className="text-sm text-gray-600">{pendingTasks.length} pending, {completedTasks.length} completed</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 animate-fadeIn">
          <h4 className="font-semibold text-gray-900 mb-3">Create New Task</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tasks yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first task to get started</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white border-2 rounded-lg p-4 transition-all ${
                task.status === 'completed' 
                  ? 'border-green-300 bg-green-50' 
                  : isOverdue(task.dueDate)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 hover:border-indigo-600'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                
                <div className="flex-1">
                  <div className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        Due: {task.dueDate}
                        {isOverdue(task.dueDate) && task.status !== 'completed' && ' (Overdue)'}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksManager;
