import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';
import api from '../../api/axios';

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState([]);
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [overdueVisitors, setOverdueVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const [allVisitors, pending, overdue] = await Promise.all([
        api.get('/api/visitors/'),
        api.get('/api/visitors/pending/'),
        api.get('/api/visitors/overdue/')
      ]);
      
      setVisitors(allVisitors.data.results || allVisitors.data);
      setPendingVisitors(pending.data.results || pending.data);
      setOverdueVisitors(overdue.data.results || overdue.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitorId) => {
    try {
      await api.post(`/api/visitors/${visitorId}/approve/`);
      fetchVisitors();
    } catch (error) {
      console.error('Error approving visitor:', error);
    }
  };

  const handleDeny = async (visitorId, notes = '') => {
    try {
      await api.post(`/api/visitors/${visitorId}/deny/`, { notes });
      fetchVisitors();
    } catch (error) {
      console.error('Error denying visitor:', error);
    }
  };

  const handleAddConfirmation = async () => {
    if (!selectedVisitor || !confirmationType) return;

    try {
      await api.post(`/api/visitors/${selectedVisitor.id}/confirm/`, {
        confirmation_type: confirmationType,
        confirmed_by: 'Guard',
        notes: confirmationNotes
      });
      
      setShowConfirmModal(false);
      setSelectedVisitor(null);
      setConfirmationType('');
      setConfirmationNotes('');
      fetchVisitors();
    } catch (error) {
      console.error('Error adding confirmation:', error);
    }
  };

  const handleSignOut = async (visitorId) => {
    try {
      await api.post(`/api/visitors/${visitorId}/sign-out/`);
      fetchVisitors();
    } catch (error) {
      console.error('Error signing out visitor:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 border-2 border-yellow-600 text-yellow-800 shadow-[2px_2px_0px_0px_rgba(202,138,4,1)]';
      case 'APPROVED':
        return 'bg-green-50 border-2 border-green-600 text-green-800 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]';
      case 'CHECKED_IN':
        return 'bg-blue-50 border-2 border-blue-600 text-blue-800 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]';
      case 'IN_MEETING':
        return 'bg-purple-50 border-2 border-purple-600 text-purple-800 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)]';
      case 'COMPLETED':
        return 'bg-gray-100 border-2 border-gray-600 text-gray-800 shadow-[2px_2px_0px_0px_rgba(75,85,99,1)]';
      case 'DENIED':
        return 'bg-red-50 border-2 border-red-600 text-red-800 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]';
      case 'EXPIRED':
        return 'bg-orange-50 border-2 border-orange-600 text-orange-800 shadow-[2px_2px_0px_0px_rgba(234,88,12,1)]';
      default:
        return 'bg-gray-100 border-2 border-gray-600 text-gray-800 shadow-[2px_2px_0px_0px_rgba(75,85,99,1)]';
    }
  };

  const getPurposeIcon = (category) => {
    switch (category) {
      case 'MEETING':
        return <Users className="w-4 h-4" />;
      case 'INTERVIEW':
        return <MessageSquare className="w-4 h-4" />;
      case 'DELIVERY':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getDisplayData = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingVisitors;
      case 'overdue':
        return overdueVisitors;
      default:
        return visitors;
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center font-sans">
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center">
          <div className="animate-spin h-16 w-16 border-4 border-gray-900 border-t-brand-primary rounded-full mx-auto mb-6"></div>
          <p className="text-xl font-display font-black text-gray-900 uppercase">Loading Visitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b-4 border-gray-900 shadow-[0_4px_0_0_rgba(0,0,0,1)] sticky top-0 z-10">
        <div className="px-6 py-4 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link 
              to="/guard" 
              className="mr-4 p-2 border-2 border-gray-900 bg-white hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 uppercase tracking-tight">Visitor Management</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage approvals and confirmations</p>
            </div>
          </div>
          <Link
            to="/guard/visitor/new"
            className="flex items-center justify-center px-6 py-3 border-2 border-blue-600 bg-blue-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] active:translate-y-[4px] active:shadow-none transition-all"
          >
            Add New Visitor
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-x-auto">
          <div className="flex min-w-full">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 px-6 py-4 text-center border-r-4 border-gray-900 font-bold uppercase tracking-wider whitespace-nowrap ${
                selectedTab === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Visitors ({visitors.length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex-1 px-6 py-4 text-center border-r-4 border-gray-900 font-bold uppercase tracking-wider whitespace-nowrap ${
                selectedTab === 'pending' 
                  ? 'bg-yellow-400 text-gray-900' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Pending ({pendingVisitors.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('overdue')}
              className={`flex-1 px-6 py-4 text-center font-bold uppercase tracking-wider whitespace-nowrap ${
                selectedTab === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2" />
                Overdue ({overdueVisitors.length})
              </div>
            </button>
          </div>
        </div>

        {/* Visitors List */}
        <div className="space-y-6">
          {getDisplayData().map((visitor) => (
            <div key={visitor.id} className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1 w-full">
                  {/* Visitor Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b-4 border-gray-100">
                    <div>
                      <h3 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tight">{visitor.name}</h3>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">ID: {visitor.national_id}</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <span className={`px-4 py-2 text-sm font-bold uppercase tracking-wider inline-block ${getStatusColor(visitor.status)}`}>
                        {visitor.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Visitor Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="border-2 border-gray-200 p-4 shadow-[2px_2px_0_0_rgba(229,231,235,1)]">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center uppercase tracking-wider text-sm">
                        {getPurposeIcon(visitor.purpose_category)}
                        <span className="ml-2">Visit Purpose</span>
                      </h4>
                      <p className="text-base font-black text-gray-900 uppercase">{visitor.purpose_category?.replace('_', ' ')}</p>
                      <p className="text-sm font-medium text-gray-600 mt-2">{visitor.purpose_details}</p>
                    </div>

                    <div className="border-2 border-gray-200 p-4 shadow-[2px_2px_0_0_rgba(229,231,235,1)]">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center uppercase tracking-wider text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Host Information
                      </h4>
                      <p className="text-base font-black text-gray-900 uppercase">{visitor.host_name}</p>
                      {visitor.department && <p className="text-sm font-medium text-gray-600 mt-1">{visitor.department}</p>}
                      {visitor.office_location && <p className="text-sm font-medium text-gray-600 mt-1">{visitor.office_location}</p>}
                    </div>

                    <div className="border-2 border-gray-200 p-4 shadow-[2px_2px_0_0_rgba(229,231,235,1)]">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center uppercase tracking-wider text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Timing
                      </h4>
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Duration: {formatDuration(visitor.expected_duration)}</p>
                      <p className="text-sm font-bold text-gray-600 mb-1">Entry: {new Date(visitor.entry_time).toLocaleString()}</p>
                      {visitor.is_overdue && (
                        <p className="text-sm font-black text-red-600 uppercase mt-2 bg-red-100 inline-block px-2 py-1 border-2 border-red-600 shadow-[2px_2px_0_0_rgba(220,38,38,1)]">
                           Overdue
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(visitor.phone || visitor.email || visitor.organization) && (
                    <div className="bg-gray-50 border-2 border-gray-900 p-4 mb-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm">Contact Information</h4>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                        {visitor.phone && (
                          <div className="flex items-center bg-white px-3 py-2 border-2 border-gray-200">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            {visitor.phone}
                          </div>
                        )}
                        {visitor.email && (
                          <div className="flex items-center bg-white px-3 py-2 border-2 border-gray-200">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            {visitor.email}
                          </div>
                        )}
                        {visitor.organization && (
                          <div className="flex items-center bg-white px-3 py-2 border-2 border-gray-200">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            {visitor.organization}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Confirmations */}
                  {visitor.confirmations && visitor.confirmations.length > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-900 p-4 mb-4 shadow-[2px_2px_0_0_rgba(30,58,138,1)]">
                      <h4 className="font-bold text-blue-900 mb-3 uppercase tracking-wider text-sm">Confirmations</h4>
                      <div className="space-y-2">
                        {visitor.confirmations.map((conf, idx) => (
                          <div key={idx} className="bg-white px-4 py-2 border-2 border-blue-200 text-sm font-medium text-gray-800">
                            <strong className="text-blue-900 uppercase tracking-wide">{conf.confirmation_type.replace('_', ' ')}:</strong> {conf.confirmed_by} 
                            <span className="text-gray-500 ml-2 font-mono">
                              ({new Date(conf.confirmed_at).toLocaleString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full lg:w-auto flex flex-col space-y-3 min-w-[220px]">
                  {visitor.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(visitor.id)}
                        className="flex items-center justify-center px-4 py-3 border-2 border-green-600 bg-green-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(22,101,52,1)] hover:bg-green-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(22,101,52,1)] active:translate-y-[4px] active:shadow-none transition-all"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Visit
                      </button>
                      <button
                        onClick={() => handleDeny(visitor.id, 'Denied by guard')}
                        className="flex items-center justify-center px-4 py-3 border-2 border-red-600 bg-white text-red-600 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:bg-red-50 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] active:translate-y-[4px] active:shadow-none transition-all"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Deny Visit
                      </button>
                    </>
                  )}

                  {visitor.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setSelectedVisitor(visitor);
                        setConfirmationType('ARRIVED');
                        setShowConfirmModal(true);
                      }}
                      className="flex items-center justify-center px-4 py-3 border-2 border-blue-600 bg-blue-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Arrival
                    </button>
                  )}

                  {['CHECKED_IN', 'IN_MEETING', 'APPROVED'].includes(visitor.status) && !visitor.exit_time && (
                    <button
                      onClick={() => handleSignOut(visitor.id)}
                      className="flex items-center justify-center px-4 py-3 border-2 border-gray-900 bg-gray-900 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                      Sign Out
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedVisitor(visitor);
                      setShowConfirmModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-3 border-2 border-purple-600 bg-white text-purple-600 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] hover:bg-purple-50 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          ))}

          {getDisplayData().length === 0 && (
            <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
              <Users className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">No visitors found</h3>
              <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                {selectedTab === 'pending' && 'No visitors pending approval.'}
                {selectedTab === 'overdue' && 'No overdue visitors.'}
                {selectedTab === 'all' && 'No visitors registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border-4 border-gray-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md my-8 relative">
            <button 
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedVisitor(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tight mb-6">Add Confirmation</h3>
            
            <div className="mb-5 border-2 border-gray-200 p-4 shadow-[2px_2px_0_0_rgba(229,231,235,1)]">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Confirmation Type</label>
              <select
                value={confirmationType}
                onChange={(e) => setConfirmationType(e.target.value)}
                className="w-full p-3 border-2 border-gray-900 text-gray-900 font-bold focus:ring-0 focus:border-brand-primary uppercase tracking-wide bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <option value="">Select confirmation type</option>
                <option value="EXPECTED">Host Confirmed Expecting</option>
                <option value="ARRIVED">Visitor Arrived at Office</option>
                <option value="MEETING_START">Meeting Started</option>
                <option value="MEETING_END">Meeting Completed</option>
                <option value="NO_SHOW">Visitor Did Not Show</option>
              </select>
            </div>

            <div className="mb-8 border-2 border-gray-200 p-4 shadow-[2px_2px_0_0_rgba(229,231,235,1)]">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Notes</label>
              <textarea
                value={confirmationNotes}
                onChange={(e) => setConfirmationNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full p-3 border-2 border-gray-900 text-gray-900 font-medium focus:ring-0 focus:border-brand-primary bg-gray-50 resize-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedVisitor(null);
                  setConfirmationType('');
                  setConfirmationNotes('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-900 bg-white text-gray-900 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddConfirmation}
                disabled={!confirmationType}
                className="flex-1 px-4 py-3 border-2 border-blue-600 bg-blue-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorManagement;