'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building, User, UserCheck } from 'lucide-react';

interface UserSetupProps {
  onUserSetup: (userData: {
    name: string;
    department: string;
    role: string;
  }) => void;
}

const departments = [
  'Operations',
  'Human Resources',
  'Finance',
  'Information Technology',
  'Marketing',
  'Sales',
  'Legal',
  'Strategy',
  'Business Development',
  'Customer Service',
  'Quality Assurance',
  'Other'
];

const roles = [
  'Executive',
  'Director',
  'Manager',
  'Senior Associate',
  'Associate',
  'Analyst',
  'Coordinator',
  'Specialist',
  'Intern',
  'Consultant',
  'Other'
];

export function UserSetup({ onUserSetup }: UserSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUserSetup(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center px-4 md:px-6 pt-4 md:pt-6">
          <div className="executive-gradient w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
            <Building className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
            Welcome to Bukola AI
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-600">
            Please provide your information to begin your session with Miss Bukola Lukan's digital clone
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`pl-10 text-sm md:text-base ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Department Select */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full h-10 px-3 py-2 border rounded-md bg-background text-sm md:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.department ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={`w-full h-10 pl-10 pr-3 py-2 border rounded-md bg-background text-sm md:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.role ? 'border-red-500' : 'border-input'
                  }`}
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="executive" 
              className="w-full mt-4 md:mt-6 text-sm md:text-base py-2 md:py-3"
            >
              Begin Session with Bukola AI
            </Button>
          </form>

          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>About This AI:</strong>
              <ul className="mt-2 space-y-1 text-xs md:text-sm">
                <li>• Speaks with Miss Bukola's executive authority and decision-making style</li>
                <li>• Only provides guidance based on official company documents</li>
                <li>• Can process tasks when Request Mode is enabled</li>
                <li>• All interactions are logged for operational continuity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}