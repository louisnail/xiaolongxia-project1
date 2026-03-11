// todo-list Skill - 待办事项管理示例
// 这是一个实用的中级 Skill，展示数据持久化和 CRUD 操作

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TODO_FILE = join(process.cwd(), 'todo-list.json');

/**
 * 待办事项接口
 */
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * 加载待办事项列表
 */
function loadTodos(): TodoItem[] {
  if (!existsSync(TODO_FILE)) {
    return [];
  }
  
  try {
    const data = readFileSync(TODO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[TodoList] 加载失败:', error);
    return [];
  }
}

/**
 * 保存待办事项列表
 */
function saveTodos(todos: TodoItem[]): void {
  try {
    writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2), 'utf-8');
  } catch (error) {
    console.error('[TodoList] 保存失败:', error);
    throw new Error('保存待办事项失败');
  }
}

/**
 * 添加待办事项
 * @param text - 任务内容
 * @param priority - 优先级（可选）
 */
export async function addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
  const todos = loadTodos();
  
  const newTodo: TodoItem = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    priority
  };
  
  todos.push(newTodo);
  saveTodos(todos);
  
  return `✅ 已添加任务：${text}\n优先级：${priority === 'high' ? '🔴 高' : priority === 'medium' ? '🟡 中' : '🟢 低'}`;
}

/**
 * 删除待办事项
 * @param id - 任务 ID
 */
export async function removeTodo(id: number): Promise<string> {
  const todos = loadTodos();
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return `❌ 未找到 ID 为 ${id} 的任务`;
  }
  
  const removed = todos.splice(index, 1)[0];
  saveTodos(todos);
  
  return `✅ 已删除任务：${removed.text}`;
}

/**
 * 列出所有待办事项
 * @param filter - 过滤器（all/active/completed）
 */
export async function listTodos(filter: 'all' | 'active' | 'completed' = 'all'): Promise<string> {
  const todos = loadTodos();
  
  if (todos.length === 0) {
    return '📝 暂无待办事项，添加一个吧！';
  }
  
  let filtered = todos;
  if (filter === 'active') {
    filtered = todos.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filtered = todos.filter(t => t.completed);
  }
  
  if (filtered.length === 0) {
    return filter === 'active' ? '✅ 所有任务已完成！' : '📝 暂无已完成的任务';
  }
  
  const lines = filtered.map((todo, index) => {
    const icon = todo.completed ? '✅' : '⬜';
    const priorityIcon = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢';
    const date = new Date(todo.createdAt).toLocaleDateString('zh-CN');
    return `${index + 1}. ${icon} ${priorityIcon} [ID:${todo.id}] ${todo.text} (${date})`;
  });
  
  const header = filter === 'all' ? '📋 待办事项列表' : filter === 'active' ? '🔥 进行中的任务' : '✅ 已完成的任务';
  
  return `${header}\n\n${lines.join('\n')}\n\n共 ${filtered.length} 项任务`;
}

/**
 * 完成待办事项
 * @param id - 任务 ID
 */
export async function completeTodo(id: number): Promise<string> {
  const todos = loadTodos();
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return `❌ 未找到 ID 为 ${id} 的任务`;
  }
  
  todo.completed = true;
  saveTodos(todos);
  
  return `🎉 恭喜完成：${todo.text}`;
}

/**
 * 清空已完成的任务
 */
export async function clearCompleted(): Promise<string> {
  const todos = loadTodos();
  const completed = todos.filter(t => t.completed);
  const remaining = todos.filter(t => !t.completed);
  
  if (completed.length === 0) {
    return '✨ 没有已完成的任务需要清理';
  }
  
  saveTodos(remaining);
  
  return `🧹 已清理 ${completed.length} 项已完成的任务`;
}

/**
 * 搜索任务
 * @param query - 搜索关键词
 */
export async function searchTodos(query: string): Promise<string> {
  const todos = loadTodos();
  const results = todos.filter(t => t.text.toLowerCase().includes(query.toLowerCase()));
  
  if (results.length === 0) {
    return `🔍 未找到包含"${query}"的任务`;
  }
  
  const lines = results.map((todo, index) => {
    const icon = todo.completed ? '✅' : '⬜';
    return `${index + 1}. ${icon} [ID:${todo.id}] ${todo.text}`;
  });
  
  return `🔍 找到 ${results.length} 个相关任务：\n\n${lines.join('\n')}`;
}

/**
 * 获取统计信息
 */
export async function getStats(): Promise<string> {
  const todos = loadTodos();
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return `📊 待办事项统计\n\n` +
         `总任务数：${total}\n` +
         `进行中：${active}\n` +
         `已完成：${completed}\n` +
         `高优先级（进行中）：${highPriority}\n` +
         `完成率：${completionRate}%\n` +
         `📈 ${completionRate >= 80 ? '太棒了！' : completionRate >= 50 ? '继续加油！' : '需要努力哦！'}`;
}

// 导出所有函数
export { loadTodos, saveTodos };
