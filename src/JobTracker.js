import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, FileText, Building, User, DollarSign, Eye, Upload, Download, Save, Moon, Sun } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker to use local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const JobTracker = () => {
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('jobTrackerData');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    appliedDate: '',
    resumeFile: null,
    resumeFileName: '',
    jobDescriptionFile: null,
    jobDescriptionFileName: '',
    stage: 'Applied',
    offerDetails: ''
  });
  const [viewingFile, setViewingFile] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    localStorage.setItem('jobTrackerData', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const stages = [
    'Applied',
    'Phone Screen',
    'First Interview',
    'Second Interview',
    'Final Interview',
    'Technical Assessment',
    'Offer Received',
    'Rejected',
    'Withdrawn'
  ];

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (fileType === 'resume') {
          setFormData({
            ...formData,
            resumeFile: event.target.result,
            resumeFileName: file.name
          });
        } else if (fileType === 'jobDescription') {
          setFormData({
            ...formData,
            jobDescriptionFile: event.target.result,
            jobDescriptionFileName: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewFile = (fileData, fileName) => {
    setViewingFile({ data: fileData, name: fileName });
    setNumPages(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };


  const exportData = () => {
    try {
      // Create a comprehensive JSON backup that includes all file data
      const fullBackup = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "2.0",
          fileCount: jobs.reduce((count, job) => {
            return count + (job.resumeFile ? 1 : 0) + (job.jobDescriptionFile ? 1 : 0);
          }, 0)
        },
        applications: jobs.map(job => ({
          ...job,
          files: {
            resume: job.resumeFile ? {
              name: job.resumeFileName,
              data: job.resumeFile
            } : null,
            jobDescription: job.jobDescriptionFile ? {
              name: job.jobDescriptionFileName,
              data: job.jobDescriptionFile
            } : null
          }
        }))
      };

      const dataStr = JSON.stringify(fullBackup, null, 2);
      const fileName = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Create and trigger download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr));
      element.setAttribute('download', fileName);
      element.style.display = 'none';

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      alert(`Backup exported successfully! File: ${fileName}\nIncluded ${fullBackup.metadata.fileCount} files.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error creating backup. Please try again.');
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Check if it's the new format with embedded files
        if (importedData.applications && Array.isArray(importedData.applications)) {
          // New format with embedded files
          const confirmImport = window.confirm(
            `This will import ${importedData.applications.length} job applications and replace your current data. Are you sure you want to continue?`
          );

          if (!confirmImport) return;

          // Restore jobs with files
          const restoredJobs = importedData.applications.map(app => ({
            ...app,
            resumeFile: app.files?.resume?.data || null,
            resumeFileName: app.files?.resume?.name || '',
            jobDescriptionFile: app.files?.jobDescription?.data || null,
            jobDescriptionFileName: app.files?.jobDescription?.name || '',
            // Remove the files object as we've extracted the data
            files: undefined
          }));

          setJobs(restoredJobs);
          const fileCount = restoredJobs.reduce((count, job) => {
            return count + (job.resumeFile ? 1 : 0) + (job.jobDescriptionFile ? 1 : 0);
          }, 0);
          alert(`Successfully imported ${restoredJobs.length} job applications with ${fileCount} files!`);

        } else if (importedData.jobs && Array.isArray(importedData.jobs)) {
          // Legacy format without embedded files
          const confirmImport = window.confirm(
            `This will import ${importedData.jobs.length} job applications (legacy format - files not included) and replace your current data. Are you sure you want to continue?`
          );

          if (confirmImport) {
            setJobs(importedData.jobs);
            alert(`Successfully imported ${importedData.jobs.length} job applications! Note: This was a legacy backup without embedded files.`);
          }
        } else {
          throw new Error("Invalid backup file format");
        }

        setShowImportExport(false);

      } catch (error) {
        console.error('Parse error:', error);
        alert(`Error reading backup file: ${error.message}`);
      }
    };

    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const handleSubmit = () => {
    if (!formData.jobTitle || !formData.company || !formData.appliedDate) {
      alert('Please fill in all required fields');
      return;
    }
    if (editingJob) {
      setJobs(jobs.map(job =>
        job.id === editingJob.id ? { ...formData, id: editingJob.id } : job
      ));
      setEditingJob(null);
    } else {
      setJobs([...jobs, { ...formData, id: Date.now() }]);
    }
    setFormData({
      jobTitle: '',
      company: '',
      appliedDate: '',
      resumeFile: null,
      resumeFileName: '',
      jobDescriptionFile: null,
      jobDescriptionFileName: '',
      stage: 'Applied',
      offerDetails: ''
    });
    setShowForm(false);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Phone Screen': 'bg-yellow-100 text-yellow-800',
      'First Interview': 'bg-orange-100 text-orange-800',
      'Second Interview': 'bg-purple-100 text-purple-800',
      'Final Interview': 'bg-indigo-100 text-indigo-800',
      'Technical Assessment': 'bg-cyan-100 text-cyan-800',
      'Offer Received': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Withdrawn': 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Application Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">Keep track of your job applications and their progress</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
        </button>
      </div>

      {/* Add Job and Backup/Import Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Application
        </button>

        {jobs.length > 0 && (
          <>
            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={20} />
              Export Backup
            </button>
            <button
              onClick={() => setShowImportExport(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={20} />
              Import Backup
            </button>
          </>
        )}

        {jobs.length === 0 && (
          <button
            onClick={() => setShowImportExport(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload size={20} />
            Import Backup
          </button>
        )}
      </div>

      {/* Import/Export Modal */}
      {showImportExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Import Data</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Backup File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select a JSON backup file previously exported from this app
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> Importing will replace all your current data. Make sure to export a backup first if you want to keep your current applications.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportExport(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingJob ? 'Edit Application' : 'Add New Application'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Applied *
                </label>
                <input
                  type="date"
                  required
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resume File
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e, 'resume')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.resumeFileName && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText size={14} />
                      <span>Uploaded: {formData.resumeFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Description File
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e, 'jobDescription')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.jobDescriptionFileName && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText size={14} />
                      <span>Uploaded: {formData.jobDescriptionFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Offer Details
                </label>
                <textarea
                  placeholder="Salary, benefits, start date, etc."
                  value={formData.offerDetails}
                  onChange={(e) => setFormData({ ...formData, offerDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] max-h-32 resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md transition-colors font-medium"
                >
                  {editingJob ? 'Update' : 'Add'} Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                    setFormData({
                      jobTitle: '',
                      company: '',
                      appliedDate: '',
                      resumeFile: null,
                      resumeFileName: '',
                      jobDescriptionFile: null,
                      jobDescriptionFileName: '',
                      stage: 'Applied',
                      offerDetails: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-md transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-5/6 mx-4 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{viewingFile.name}</h2>
              <button
                onClick={() => setViewingFile(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {viewingFile.data.startsWith('data:application/pdf') ? (
                <div className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-900">
                  <div className="flex flex-col items-center space-y-4">
                    <Document
                      file={viewingFile.data}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="max-w-full"
                    >
                      {Array.from(new Array(numPages), (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          className="shadow-lg mb-4"
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={Math.min(window.innerWidth * 0.7, 700)}
                        />
                      ))}
                    </Document>
                  </div>
                </div>
              ) : viewingFile.data.startsWith('data:text/') ? (
                <div className="flex-1 p-4 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                    {atob(viewingFile.data.split(',')[1])}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Cannot preview this file type</p>
                    <a
                      href={viewingFile.data}
                      download={viewingFile.name}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Start by adding your first job application!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.jobTitle}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(job.stage)}`}>
                      {job.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                    <Building size={16} />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={16} />
                    <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {job.resumeFileName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FileText size={14} />
                      <span>Resume: {job.resumeFileName}</span>
                    </div>
                    <button
                      onClick={() => handleViewFile(job.resumeFile, job.resumeFileName)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </div>
                )}
                {job.jobDescriptionFileName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FileText size={14} />
                      <span>Job Description: {job.jobDescriptionFileName}</span>
                    </div>
                    <button
                      onClick={() => handleViewFile(job.jobDescriptionFile, job.jobDescriptionFileName)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </div>
                )}
                {job.offerDetails && (
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                    <DollarSign size={14} className="mt-0.5" />
                    <span>{job.offerDetails}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {jobs.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{jobs.length}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Applications</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {jobs.filter(job => job.stage === 'Offer Received').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Offers Received</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {jobs.filter(job => !['Rejected', 'Withdrawn', 'Offer Received'].includes(job.stage)).length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {jobs.filter(job => job.stage === 'Rejected').length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;