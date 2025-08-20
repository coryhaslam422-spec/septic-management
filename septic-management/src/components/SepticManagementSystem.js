import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Plus, Bell, Trash2, Edit3, AlertTriangle, Mail, Settings, Search, X, Upload, Download } from 'lucide-react';

const SepticManagementSystem = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      customerName: "John Smith",
      address: "123 Oak Street, Springfield",
      lat: 39.7817,
      lng: -89.6501,
      lastServiceDate: "2024-03-15",
      serviceInterval: 24,
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      tankSize: "1000 gallons",
      notes: "Grease trap needs attention"
    },
    {
      id: 2,
      customerName: "Mary Johnson",
      address: "456 Pine Avenue, Springfield",
      lat: 39.7850,
      lng: -89.6480,
      lastServiceDate: "2024-06-20",
      serviceInterval: 36,
      phone: "(555) 987-6543",
      email: "mary.johnson@email.com",
      tankSize: "1500 gallons",
      notes: "Easy access, preferred morning appointments"
    },
    {
      id: 3,
      customerName: "Bob Wilson",
      address: "789 Maple Drive, Springfield",
      lat: 39.7890,
      lng: -89.6520,
      lastServiceDate: "2023-12-10",
      serviceInterval: 18,
      phone: "(555) 456-7890",
      email: "bob.wilson@email.com",
      tankSize: "750 gallons",
      notes: "Heavy usage, monitor closely"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    reminderDays: [90, 30, 7],
    fromEmail: 'your-business@septicservice.com',
    companyName: 'ABC Septic Services',
    // Business notification settings
    businessNotifications: {
      enabled: true,
      businessEmail: 'notifications@septicservice.com',
      notifyDays: [14, 7, 1], // Notify business 14, 7, and 1 day before due
      includeOverdue: true,
      weeklyDigest: true,
      digestDay: 'monday', // Monday weekly digest
      digestTime: '08:00' // 8 AM weekly digest
    }
  });
  const [emailHistory, setEmailHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Search functionality
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return job.customerName.toLowerCase().includes(searchLower) ||
           job.address.toLowerCase().includes(searchLower) ||
           job.phone.includes(searchTerm) ||
           job.email.toLowerCase().includes(searchLower) ||
           job.notes.toLowerCase().includes(searchLower);
  });

  // Get search suggestions (top 5 matches)
  const searchSuggestions = searchTerm.length >= 1 ? filteredJobs.slice(0, 5) : [];

  const selectSearchResult = (job) => {
    setSearchTerm(job.customerName);
    setSelectedJob(job);
    setShowSearchDropdown(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSelectedJob(null);
  };

  // Mock address autocomplete
  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    const mockSuggestions = [
      {
        address: `${query} Street, Springfield, IL`,
        lat: 39.7817 + (Math.random() - 0.5) * 0.01,
        lng: -89.6501 + (Math.random() - 0.5) * 0.01
      },
      {
        address: `${query} Avenue, Springfield, IL`,
        lat: 39.7850 + (Math.random() - 0.5) * 0.01,
        lng: -89.6480 + (Math.random() - 0.5) * 0.01
      },
      {
        address: `${query} Drive, Springfield, IL`,
        lat: 39.7890 + (Math.random() - 0.5) * 0.01,
        lng: -89.6520 + (Math.random() - 0.5) * 0.01
      }
    ];
    
    setTimeout(() => {
      setAddressSuggestions(mockSuggestions);
    }, 300);
  };

  // CSV Import functionality
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'text/csv') {
      setImportStatus('Please select a valid CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const requiredHeaders = ['customer_name', 'address', 'phone'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setImportStatus(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        const customers = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const customer = {};
          
          headers.forEach((header, index) => {
            customer[header] = values[index] || '';
          });

          const jobData = {
            id: Date.now() + Math.random(),
            customerName: customer.customer_name || customer.name || '',
            address: customer.address || '',
            lat: parseFloat(customer.lat || customer.latitude) || (39.7817 + (Math.random() - 0.5) * 0.01),
            lng: parseFloat(customer.lng || customer.longitude) || (-89.6501 + (Math.random() - 0.5) * 0.01),
            phone: customer.phone || '',
            email: customer.email || '',
            tankSize: customer.tank_size || customer.tanksize || '1000 gallons',
            lastServiceDate: customer.last_service_date || customer.lastservice || '2024-01-01',
            serviceInterval: parseInt(customer.service_interval || customer.interval) || 24,
            notes: customer.notes || ''
          };

          customers.push(jobData);
        }

        setImportData(customers);
        setImportStatus(`Ready to import ${customers.length} customers`);
      } catch (error) {
        setImportStatus('Error reading CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importData) return;
    
    setIsImporting(true);
    setTimeout(() => {
      setJobs(prevJobs => [...prevJobs, ...importData]);
      setImportStatus(`Successfully imported ${importData.length} customers!`);
      setImportData(null);
      setIsImporting(false);
      
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus('');
      }, 2000);
    }, 1500);
  };

  const downloadTemplate = () => {
    const template = `customer_name,address,lat,lng,phone,email,tank_size,last_service_date,service_interval,notes
John Doe,"123 Main St, Springfield",39.7817,-89.6501,"(555) 123-4567",john@email.com,"1000 gallons",2024-01-15,24,"Access through back gate"
Jane Smith,"456 Oak Ave, Springfield",39.7850,-89.6480,"(555) 987-6543",jane@email.com,"1500 gallons",2024-03-20,36,"Preferred morning appointments"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Email reminder system
  const checkAndSendReminders = () => {
    if (!emailSettings.enabled) return;

    const today = new Date();
    const newEmailsSent = [];

    jobs.forEach(job => {
      const { nextDate, daysUntilService } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);

      // Customer reminders
      emailSettings.reminderDays.forEach(reminderDay => {
        if (daysUntilService === reminderDay) {
          const alreadySent = emailHistory.some(email => 
            email.jobId === job.id && 
            email.reminderDay === reminderDay &&
            email.dateSent === today.toDateString() &&
            email.type === 'customer'
          );

          if (!alreadySent) {
            sendEmailReminder(job, reminderDay);
            newEmailsSent.push({
              id: Date.now() + Math.random(),
              jobId: job.id,
              customerName: job.customerName,
              email: job.email,
              reminderDay: reminderDay,
              dateSent: today.toDateString(),
              status: 'sent',
              type: 'customer'
            });
          }
        }
      });

      // Business notifications
      if (emailSettings.businessNotifications.enabled) {
        emailSettings.businessNotifications.notifyDays.forEach(notifyDay => {
          if (daysUntilService === notifyDay || (daysUntilService < 0 && emailSettings.businessNotifications.includeOverdue)) {
            const alreadySent = emailHistory.some(email => 
              email.jobId === job.id && 
              email.reminderDay === notifyDay &&
              email.dateSent === today.toDateString() &&
              email.type === 'business'
            );

            if (!alreadySent && daysUntilService === notifyDay) {
              sendBusinessNotification(job, notifyDay);
              newEmailsSent.push({
                id: Date.now() + Math.random(),
                jobId: job.id,
                customerName: job.customerName,
                email: emailSettings.businessNotifications.businessEmail,
                reminderDay: notifyDay,
                dateSent: today.toDateString(),
                status: 'sent',
                type: 'business'
              });
            }
          }
        });
      }
    });

    // Weekly business digest
    if (emailSettings.businessNotifications.enabled && emailSettings.businessNotifications.weeklyDigest) {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const weekKey = `${today.getFullYear()}-W${Math.ceil((today.getDate() + today.getDay()) / 7)}`;
      
      const digestSent = emailHistory.some(email => 
        email.type === 'digest' && 
        email.weekKey === weekKey
      );

      if (!digestSent && dayOfWeek === emailSettings.businessNotifications.digestDay) {
        sendWeeklyDigest();
        newEmailsSent.push({
          id: Date.now() + Math.random(),
          jobId: 'digest',
          customerName: 'Weekly Digest',
          email: emailSettings.businessNotifications.businessEmail,
          reminderDay: 0,
          dateSent: today.toDateString(),
          weekKey: weekKey,
          status: 'sent',
          type: 'digest'
        });
      }
    }

    if (newEmailsSent.length > 0) {
      setEmailHistory(prev => [...prev, ...newEmailsSent]);
    }
  };

  const sendBusinessNotification = (job, daysUntil) => {
    const { urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
    const urgencyText = urgency === 'overdue' ? 'OVERDUE' : urgency.toUpperCase();
    
    console.log('Sending business notification:', {
      to: emailSettings.businessNotifications.businessEmail,
      subject: `Service Due: ${job.customerName} - ${urgencyText}`,
      customer: job.customerName,
      address: job.address,
      phone: job.phone,
      daysUntil: daysUntil,
      nextServiceDate: calculateServiceInfo(job.lastServiceDate, job.serviceInterval).nextDate.toLocaleDateString(),
      urgency: urgency
    });
    
    alert(`Business notification sent: ${job.customerName} service due in ${daysUntil} days (${urgencyText})`);
  };

  const sendWeeklyDigest = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const fourWeeksOut = new Date(today);
    fourWeeksOut.setDate(today.getDate() + 28);

    const overdueJobs = jobs.filter(job => {
      const { urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
      return urgency === 'overdue';
    });

    const urgentJobs = jobs.filter(job => {
      const { daysUntilService } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
      return daysUntilService > 0 && daysUntilService <= 7;
    });

    const upcomingJobs = jobs.filter(job => {
      const { daysUntilService } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
      return daysUntilService > 7 && daysUntilService <= 28;
    });

    const recentlyCompleted = jobs.filter(job => {
      const lastService = new Date(job.lastServiceDate);
      const daysSinceService = Math.ceil((today - lastService) / (1000 * 60 * 60 * 24));
      return daysSinceService <= 7;
    });

    console.log('Sending weekly digest:', {
      to: emailSettings.businessNotifications.businessEmail,
      subject: `Weekly Service Summary - ${today.toLocaleDateString()}`,
      summary: {
        overdueCount: overdueJobs.length,
        urgentCount: urgentJobs.length,
        upcomingCount: upcomingJobs.length,
        recentlyCompletedCount: recentlyCompleted.length,
        totalActiveJobs: jobs.length
      },
      overdueJobs: overdueJobs.map(job => ({
        name: job.customerName,
        address: job.address,
        phone: job.phone,
        daysOverdue: Math.abs(calculateServiceInfo(job.lastServiceDate, job.serviceInterval).daysUntilService)
      })),
      urgentJobs: urgentJobs.map(job => ({
        name: job.customerName,
        address: job.address,
        phone: job.phone,
        daysUntil: calculateServiceInfo(job.lastServiceDate, job.serviceInterval).daysUntilService
      })),
      upcomingJobs: upcomingJobs.map(job => ({
        name: job.customerName,
        address: job.address,
        daysUntil: calculateServiceInfo(job.lastServiceDate, job.serviceInterval).daysUntilService
      })),
      recentlyCompleted: recentlyCompleted.map(job => ({
        name: job.customerName,
        serviceDate: job.lastServiceDate
      }))
    });

    const summaryText = `Weekly digest sent: ${overdueJobs.length} overdue, ${urgentJobs.length} urgent (≤7 days), ${upcomingJobs.length} upcoming (8-28 days), ${recentlyCompleted.length} recently completed`;
    alert(summaryText);
  };

  const sendEmailReminder = (job, daysUntil) => {
    console.log('Sending email reminder:', {
      to: job.email,
      customer: job.customerName,
      daysUntil: daysUntil,
      nextServiceDate: calculateServiceInfo(job.lastServiceDate, job.serviceInterval).nextDate.toLocaleDateString()
    });
    
    alert(`Email reminder sent to ${job.customerName} (${job.email}) - ${daysUntil} days until service`);
  };

  useEffect(() => {
    checkAndSendReminders();
  }, [jobs, emailSettings]);

  const calculateServiceInfo = (lastServiceDate, serviceInterval) => {
    const lastDate = new Date(lastServiceDate);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + serviceInterval);
    
    const today = new Date();
    const daysUntilService = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    let urgency = 'normal';
    if (daysUntilService < 0) urgency = 'overdue';
    else if (daysUntilService <= 30) urgency = 'urgent';
    else if (daysUntilService <= 90) urgency = 'upcoming';
    
    return { nextDate, daysUntilService, urgency };
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getUrgencyText = (daysUntilService) => {
    if (daysUntilService < 0) return `${Math.abs(daysUntilService)} days overdue`;
    if (daysUntilService === 0) return 'Due today';
    return `${daysUntilService} days until service`;
  };

  const JobForm = ({ job, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      customerName: job?.customerName || '',
      address: job?.address || '',
      lat: job?.lat || '',
      lng: job?.lng || '',
      lastServiceDate: job?.lastServiceDate || '',
      serviceInterval: job?.serviceInterval || 24,
      phone: job?.phone || '',
      email: job?.email || '',
      tankSize: job?.tankSize || '',
      notes: job?.notes || ''
    });
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [localAddressSuggestions, setLocalAddressSuggestions] = useState([]);

    const handleAddressInput = (e) => {
      const value = e.target.value;
      setFormData({...formData, address: value});
      
      // Generate suggestions locally without async calls
      if (value.length >= 3) {
        const suggestions = [
          {
            address: `${value} Street, Springfield, IL`,
            lat: 39.7817 + (Math.random() - 0.5) * 0.01,
            lng: -89.6501 + (Math.random() - 0.5) * 0.01
          },
          {
            address: `${value} Avenue, Springfield, IL`,
            lat: 39.7850 + (Math.random() - 0.5) * 0.01,
            lng: -89.6480 + (Math.random() - 0.5) * 0.01
          },
          {
            address: `${value} Drive, Springfield, IL`,
            lat: 39.7890 + (Math.random() - 0.5) * 0.01,
            lng: -89.6520 + (Math.random() - 0.5) * 0.01
          }
        ];
        setLocalAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
      } else {
        setLocalAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    };

    const selectAddress = (suggestion) => {
      setFormData({
        ...formData,
        address: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng
      });
      setLocalAddressSuggestions([]);
      setShowAddressSuggestions(false);
    };

    const handleSubmit = () => {
      onSave({
        ...formData,
        id: job?.id || Date.now(),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        serviceInterval: parseInt(formData.serviceInterval)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {job ? 'Edit Job' : 'Add New Job'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="customer@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tank Size</label>
              <input
                type="text"
                value={formData.tankSize}
                onChange={(e) => setFormData({...formData, tankSize: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1000 gallons"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Service Date</label>
              <input
                type="date"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Interval (months)</label>
              <select
                value={formData.serviceInterval}
                onChange={(e) => setFormData({...formData, serviceInterval: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={48}>48 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border rounded-md h-20"
                placeholder="Special instructions, access notes, etc."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmailSettingsModal = () => {
    const [settings, setSettings] = useState(emailSettings);

    const handleSave = () => {
      setEmailSettings(settings);
      setShowEmailSettings(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Email Reminder Settings</h3>
          
          <div className="space-y-6">
            {/* Customer Reminders Section */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-800 mb-3">Customer Reminders</h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span>Enable automatic customer email reminders</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">From Email</label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Send customer reminders (days before service):</label>
                  <div className="space-y-2">
                    {[90, 60, 30, 14, 7, 3].map(days => (
                      <label key={days} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.reminderDays.includes(days)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                reminderDays: [...settings.reminderDays, days].sort((a, b) => b - a)
                              });
                            } else {
                              setSettings({
                                ...settings,
                                reminderDays: settings.reminderDays.filter(d => d !== days)
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span>{days} days before</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Notifications Section */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Business Notifications</h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.businessNotifications.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessNotifications: {
                          ...settings.businessNotifications,
                          enabled: e.target.checked
                        }
                      })}
                      className="w-4 h-4"
                    />
                    <span>Enable business email notifications</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Business Notification Email</label>
                  <input
                    type="email"
                    value={settings.businessNotifications.businessEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      businessNotifications: {
                        ...settings.businessNotifications,
                        businessEmail: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="notifications@yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notify business when jobs are due (days before):</label>
                  <div className="space-y-2">
                    {[30, 14, 7, 3, 1].map(days => (
                      <label key={days} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.businessNotifications.notifyDays.includes(days)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                businessNotifications: {
                                  ...settings.businessNotifications,
                                  notifyDays: [...settings.businessNotifications.notifyDays, days].sort((a, b) => b - a)
                                }
                              });
                            } else {
                              setSettings({
                                ...settings,
                                businessNotifications: {
                                  ...settings.businessNotifications,
                                  notifyDays: settings.businessNotifications.notifyDays.filter(d => d !== days)
                                }
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span>{days} day{days !== 1 ? 's' : ''} before</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.businessNotifications.includeOverdue}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessNotifications: {
                          ...settings.businessNotifications,
                          includeOverdue: e.target.checked
                        }
                      })}
                      className="w-4 h-4"
                    />
                    <span>Include overdue job notifications</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.businessNotifications.weeklyDigest}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessNotifications: {
                          ...settings.businessNotifications,
                          weeklyDigest: e.target.checked
                        }
                      })}
                      className="w-4 h-4"
                    />
                    <span>Send weekly digest email</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Weekly Digest Day</label>
                    <select
                      value={settings.businessNotifications.digestDay}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessNotifications: {
                          ...settings.businessNotifications,
                          digestDay: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Digest Time</label>
                    <input
                      type="time"
                      value={settings.businessNotifications.digestTime}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessNotifications: {
                          ...settings.businessNotifications,
                          digestTime: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Settings
            </button>
            <button
              onClick={() => setShowEmailSettings(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ImportModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Import Customers from CSV</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Upload a CSV file with your customer data. Required columns: customer_name, address, phone
              </p>
              
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm underline mb-3"
              >
                Download CSV Template
              </button>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full p-2 border border-dashed border-gray-300 rounded-md"
              />
            </div>

            {importStatus && (
              <div className={`p-3 rounded-md text-sm ${
                importStatus.includes('Error') || importStatus.includes('Missing') 
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : importStatus.includes('Successfully')
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
              }`}>
                {importStatus}
              </div>
            )}

            {importData && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Preview (first 3 customers):</h4>
                <div className="space-y-1 text-xs">
                  {importData.slice(0, 3).map((customer, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-gray-600">{customer.address}</div>
                      <div className="text-gray-500">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {importData && !isImporting && (
              <button
                onClick={confirmImport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import {importData.length} Customers
              </button>
            )}
            
            {isImporting && (
              <button
                disabled
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Importing...
              </button>
            )}
            
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportData(null);
                setImportStatus('');
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              disabled={isImporting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSaveJob = (jobData) => {
    if (editingJob) {
      setJobs(jobs.map(job => job.id === editingJob.id ? jobData : job));
      setEditingJob(null);
    } else {
      setJobs([...jobs, jobData]);
      setShowAddForm(false);
    }
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
    setSelectedJob(null);
  };

  const urgentJobs = jobs.filter(job => {
    const { urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
    return urgency === 'overdue' || urgency === 'urgent';
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Septic Tank Management</h1>
          <p className="text-gray-600">Track and schedule septic tank cleanings</p>
        </div>
        
        <div className="flex gap-4">
          {urgentJobs.length > 0 && (
            <div className="bg-red-100 border border-red-300 px-4 py-2 rounded-lg flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-600" />
              <span className="text-red-700 font-medium">
                {urgentJobs.length} urgent job{urgentJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(e.target.value.length >= 1);
            }}
            onFocus={() => {
              if (searchTerm.length >= 1) {
                setShowSearchDropdown(true);
              }
            }}
            onBlur={() => {
              // Delay hiding dropdown to allow clicking on suggestions
              setTimeout(() => setShowSearchDropdown(false), 200);
            }}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search customers, addresses, phone, email..."
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Search Dropdown */}
          {showSearchDropdown && searchSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
              {searchSuggestions.map((job) => {
                const { urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
                return (
                  <div
                    key={job.id}
                    onMouseDown={() => selectSearchResult(job)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{job.customerName}</div>
                        <div className="text-xs text-gray-600">{job.address}</div>
                        <div className="text-xs text-gray-500">{job.phone} • {job.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getUrgencyColor(urgency)}`}
                          title={urgency}
                        ></div>
                        <div className="text-xs text-gray-400">
                          {job.serviceInterval}mo
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredJobs.length > 5 && (
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                  Showing 5 of {filteredJobs.length} results. Keep typing to narrow down.
                </div>
              )}
            </div>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''} for "{searchTerm}"
            {selectedJob && (
              <span className="ml-2 text-blue-600">
                • Selected: {selectedJob.customerName}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Job Locations
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 h-96 relative border-2 border-blue-200">
              <div className="text-center text-gray-500 mb-4">Springfield Area Map</div>
              
              {filteredJobs.map(job => {
                const { urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
                const x = ((job.lng + 89.6520) * 2000) % 100;
                const y = ((job.lat - 39.7800) * 2000) % 100;
                
                return (
                  <div
                    key={job.id}
                    className={`absolute w-4 h-4 rounded-full cursor-pointer ${getUrgencyColor(urgency)} 
                              border-2 border-white shadow-md hover:scale-150 transition-transform`}
                    style={{ left: `${20 + x}%`, top: `${20 + y}%` }}
                    onClick={() => setSelectedJob(job)}
                    title={job.customerName}
                  />
                );
              })}
              
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                <h4 className="font-medium text-sm mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Overdue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Urgent (≤30 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Upcoming (≤90 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Normal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Panel */}
        <div className="space-y-6">
          {selectedJob && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3">Job Details</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">{selectedJob.customerName}</h4>
                  <p className="text-sm text-gray-600">{selectedJob.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p>{selectedJob.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p>{selectedJob.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tank Size:</span>
                    <p>{selectedJob.tankSize}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Interval:</span>
                    <p>{selectedJob.serviceInterval} months</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Last Service:</span>
                  <p>{new Date(selectedJob.lastServiceDate).toLocaleDateString()}</p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Next Service:</span>
                  <p>{calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).nextDate.toLocaleDateString()}</p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <p className={`font-medium ${
                    calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).urgency === 'overdue' ? 'text-red-600' :
                    calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).urgency === 'urgent' ? 'text-orange-600' :
                    calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).urgency === 'upcoming' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {getUrgencyText(calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).daysUntilService)}
                  </p>
                </div>

                {selectedJob.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notes:</span>
                    <p className="italic">{selectedJob.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => sendEmailReminder(selectedJob, calculateServiceInfo(selectedJob.lastServiceDate, selectedJob.serviceInterval).daysUntilService)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => setEditingJob(selectedJob)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteJob(selectedJob.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Urgent Jobs List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Urgent Jobs
            </h3>
            
            {urgentJobs.length === 0 ? (
              <p className="text-gray-500 text-sm">No urgent jobs at this time.</p>
            ) : (
              <div className="space-y-2">
                {urgentJobs.filter(job => {
                  if (!searchTerm) return true;
                  const searchLower = searchTerm.toLowerCase();
                  return job.customerName.toLowerCase().includes(searchLower) ||
                         job.address.toLowerCase().includes(searchLower) ||
                         job.phone.includes(searchTerm) ||
                         job.email.toLowerCase().includes(searchLower);
                }).map(job => {
                  const { daysUntilService, urgency } = calculateServiceInfo(job.lastServiceDate, job.serviceInterval);
                  return (
                    <div
                      key={job.id}
                      className="border-l-4 border-red-500 pl-3 py-2 bg-red-50 cursor-pointer hover:bg-red-100"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="font-medium text-sm">{job.customerName}</div>
                      <div className="text-xs text-gray-600">{job.address}</div>
                      <div className={`text-xs font-medium ${urgency === 'overdue' ? 'text-red-600' : 'text-orange-600'}`}>
                        {getUrgencyText(daysUntilService)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email History */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Recent Email Activity
            </h3>
            
            {emailHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No emails sent yet.</p>
            ) : (
              <div className="space-y-2">
                {emailHistory.slice(-8).reverse().map(email => (
                  <div key={email.id} className={`border-l-4 pl-3 py-2 ${
                    email.type === 'business' ? 'border-purple-500 bg-purple-50' :
                    email.type === 'digest' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="font-medium text-sm">
                      {email.type === 'business' ? '🏢 Business Alert' :
                       email.type === 'digest' ? '📊 Weekly Digest' :
                       '👤 Customer Reminder'} - {email.customerName}
                    </div>
                    <div className="text-xs text-gray-600">{email.email}</div>
                    <div className={`text-xs font-medium ${
                      email.type === 'business' ? 'text-purple-600' :
                      email.type === 'digest' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {email.type === 'digest' ? 'Weekly summary sent' :
                       email.reminderDay > 0 ? `${email.reminderDay} day reminder sent` :
                       'Immediate notification sent'} on {email.dateSent}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Settings Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Advanced Settings</h2>
          <p className="text-gray-600 mb-6">System configuration and data management tools</p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Import Customer CSV
            </button>
            
            <button
              onClick={() => setShowEmailSettings(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Email Reminder Settings
            </button>
            
            <button
              onClick={downloadTemplate}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Download CSV Template
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>• Import CSV: Bulk upload customer data from spreadsheet</p>
            <p>• Email Settings: Configure automatic reminder schedules</p>
            <p>• CSV Template: Download properly formatted example file</p>
          </div>
        </div>
      </div>

      {/* Forms */}
      {showAddForm && (
        <JobForm
          onSave={handleSaveJob}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingJob && (
        <JobForm
          job={editingJob}
          onSave={handleSaveJob}
          onCancel={() => setEditingJob(null)}
        />
      )}

      {showEmailSettings && <EmailSettingsModal />}
      
      {showImportModal && <ImportModal />}
    </div>
  );
};

export default SepticManagementSystem;

            <div className="relative">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={handleAddressInput}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type an address..."
                required
              />
              
              {showAddressSuggestions && localAddressSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {localAddressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectAddress(suggestion)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium">{suggestion.address}</div>
                      <div className="text-xs text-gray-500">
                        Lat: {suggestion.lat.toFixed(4)}, Lng: {suggestion.lng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              )}