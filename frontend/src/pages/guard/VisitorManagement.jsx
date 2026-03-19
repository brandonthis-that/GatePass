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
      
      setVisitors(allVisitors.data);
      setPendingVisitors(pending.data);
      setOverdueVisitors(overdue.data);
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
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_MEETING':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'DENIED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/guard" 
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
                <p className="text-gray-600">Manage visitor approvals and confirmations</p>
              </div>
            </div>
            <Link
              to="/guard/visitor/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Visitor
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 px-6 py-4 text-center border-b-2 font-medium ${
                selectedTab === 'all' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Visitors ({visitors.length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex-1 px-6 py-4 text-center border-b-2 font-medium ${
                selectedTab === 'pending' 
                  ? 'border-yellow-500 text-yellow-600 bg-yellow-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pending ({pendingVisitors.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('overdue')}
              className={`flex-1 px-6 py-4 text-center border-b-2 font-medium ${
                selectedTab === 'overdue' 
                  ? 'border-red-500 text-red-600 bg-red-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                Overdue ({overdueVisitors.length})
              </div>
            </button>
          </div>
        </div>

        {/* Visitors List */}
        <div className="space-y-4">
          {getDisplayData().map((visitor) => (
            <div key={visitor.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Visitor Header */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{visitor.name}</h3>
                      <p className="text-sm text-gray-500">ID: {visitor.national_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(visitor.status)}`}>
                      {visitor.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visitor Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        {getPurposeIcon(visitor.purpose_category)}
                        <span className="ml-2">Visit Purpose</span>
                      </h4>
                      <p className="text-sm text-gray-600">{visitor.purpose_category?.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500 mt-1">{visitor.purpose_details}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Host Information
                      </h4>
                      <p className="text-sm text-gray-600">{visitor.host_name}</p>
                      {visitor.department && <p className="text-sm text-gray-500">{visitor.department}</p>}
                      {visitor.office_location && <p className="text-sm text-gray-500">{visitor.office_location}</p>}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Timing
                      </h4>
                      <p className="text-sm text-gray-600">Duration: {formatDuration(visitor.expected_duration)}</p>
                      <p className="text-sm text-gray-500">Entry: {new Date(visitor.entry_time).toLocaleString()}</p>
                      {visitor.is_overdue && (
                        <p className="text-sm text-red-600 font-medium">⚠️ Overdue</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(visitor.phone || visitor.email || visitor.organization) && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {visitor.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {visitor.phone}
                          </div>
                        )}
                        {visitor.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {visitor.email}
                          </div>
                        )}
                        {visitor.organization && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {visitor.organization}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Confirmations */}
                  {visitor.confirmations && visitor.confirmations.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Confirmations</h4>
                      <div className="space-y-1">
                        {visitor.confirmations.map((conf, idx) => (
                          <p key={idx} className="text-sm text-blue-800">
                            <strong>{conf.confirmation_type.replace('_', ' ')}:</strong> {conf.confirmed_by} 
                            <span className="text-blue-600 ml-2">
                              ({new Date(conf.confirmed_at).toLocaleString()})
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col space-y-2 min-w-[200px]">
                  {visitor.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(visitor.id)}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Visit
                      </button>
                      <button
                        onClick={() => handleDeny(visitor.id, 'Denied by guard')}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
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
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Confirm Arrival
                    </button>
                  )}

                  {['CHECKED_IN', 'IN_MEETING', 'APPROVED'].includes(visitor.status) && !visitor.exit_time && (
                    <button
                      onClick={() => handleSignOut(visitor.id)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedVisitor(visitor);
                      setShowConfirmModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          ))}

          {getDisplayData().length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No visitors found</h3>
              <p className="mt-1 text-sm text-gray-500">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Confirmation</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Type</label>
              <select
                value={confirmationType}
                onChange={(e) => setConfirmationType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select confirmation type</option>
                <option value="EXPECTED">Host Confirmed Expecting Visitor</option>
                <option value="ARRIVED">Visitor Arrived at Host Office</option>
                <option value="MEETING_START">Meeting Started</option>
                <option value="MEETING_END">Meeting Completed</option>
                <option value="NO_SHOW">Visitor Did Not Show</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={confirmationNotes}
                onChange={(e) => setConfirmationNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedVisitor(null);
                  setConfirmationType('');
                  setConfirmationNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddConfirmation}
                disabled={!confirmationType}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorManagement;