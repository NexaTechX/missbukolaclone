import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export function generateUserId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export function formatTaskPriority(priority: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return {
        label: 'Urgent',
        color: 'text-red-700',
        bgColor: 'bg-red-100'
      };
    case 'high':
      return {
        label: 'High',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100'
      };
    case 'medium':
      return {
        label: 'Medium',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100'
      };
    case 'low':
      return {
        label: 'Low',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    default:
      return {
        label: 'Standard',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100'
      };
  }
}