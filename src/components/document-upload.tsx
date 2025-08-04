'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface DocumentUploadProps {
  currentUser: {
    id: string;
    name: string;
    department: string;
    role: string;
  };
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

interface UploadFormData {
  title: string;
  type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report';
  department: string;
  author: string;
  accessLevel: 'public' | 'management' | 'executive';
}

export function DocumentUpload({ currentUser, onUploadSuccess, onClose }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    type: 'policy',
    department: currentUser.department,
    author: currentUser.name,
    accessLevel: 'public',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrorMessage('File size too large. Maximum size is 10MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setErrorMessage('');
      
      // Auto-fill title if not already set
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        }));
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a document title.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('type', formData.type);
      uploadFormData.append('department', formData.department);
      uploadFormData.append('author', formData.author.trim());
      uploadFormData.append('accessLevel', formData.accessLevel);
      uploadFormData.append('userId', currentUser.id);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus('success');
        setSelectedFile(null);
        setFormData({
          title: '',
          type: 'policy',
          department: currentUser.department,
          author: currentUser.name,
          accessLevel: 'public',
        });
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Auto-close after success
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrorMessage(data.error || 'Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Document
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Document uploaded successfully! The AI will now have access to this information.
              </span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Choose File
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'PDF, DOC, DOCX, or TXT files only (max 10MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                disabled={isUploading}
                required
              />
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="guideline">Guideline</SelectItem>
                  <SelectItem value="memo">Memo</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
                disabled={isUploading}
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Enter author name"
                disabled={isUploading}
                required
              />
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Level</label>
              <Select
                value={formData.accessLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, accessLevel: value as any }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isUploading || !selectedFile || !formData.title.trim()}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 