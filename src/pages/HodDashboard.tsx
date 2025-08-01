import React, { useState, useEffect } from "react";
import { Moon, Sun, Search, Bell, User, Users, X, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { getAuth, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUserLoginMethod } from "../hooks/useUserLoginMethod";
import { db } from "../components/firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

// Staff interface
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subjectNames: string;
  createdAt: any; // Firestore timestamp
  hodId: string;
}

export default function HodDashboard() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showStaffSection, setShowStaffSection] = useState(false);
  const [staffAnimation, setStaffAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');
  const [showAddStaffPopup, setShowAddStaffPopup] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userDetails, loginMethod, isGoogleUser, isManualUser, loading: userLoading } = useUserLoginMethod();

  // Form state for adding staff
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjectNames: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load staff members when staff section is shown
  useEffect(() => {
    if (showStaffSection && user) {
      loadStaffMembers();
    }
  }, [showStaffSection, user]);

  const loadStaffMembers = async () => {
    if (!user) return;
    
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, where('hodId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const staff = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffMember[];
      
      setStaffMembers(staff);
    } catch (error) {
      console.error('Error loading staff members:', error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const handleStaffClick = () => {
    setShowStaffSection(true);
    setStaffAnimation(true);
  };

  const handleCloseStaff = () => {
    setStaffAnimation(false);
    setTimeout(() => {
      setShowStaffSection(false);
      setActiveTab('overview');
    }, 300);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // Add staff member to Firestore
      const staffData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password, // In production, this should be hashed
        subjectNames: formData.subjectNames,
        hodId: user.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'staff'), staffData);
      
      // Reset form and close popup
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        subjectNames: ''
      });
      setShowAddStaffPopup(false);
      
      // Reload staff members
      await loadStaffMembers();
      
    } catch (error) {
      console.error('Error adding staff member:', error);
      alert('Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Show minimal loading only if absolutely necessary
  if (userLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0fa] to-[#d6f5ef] dark:from-[#1a2233] dark:to-[#232946] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#265d4a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0fa] to-[#d6f5ef] dark:from-[#1a2233] dark:to-[#232946] flex">
      {/* Sidebar */}
      <aside
        className="group/sidebar relative h-[calc(100vh-2rem)] m-4 rounded-2xl shadow-xl flex flex-col bg-white/80 dark:bg-[#232946] border-r border-slate-200 dark:border-[#232946] transition-all duration-300 w-20 hover:w-60"
      >
        <div className="flex items-center gap-2 px-4 py-4 mb-4">
          <span className="font-bold text-xl text-[#2d3748] dark:text-white transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">Gradeify</span>
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-3">
          <SidebarNavLink icon={<User />} label="Staff" active={showStaffSection} onClick={handleStaffClick} />
          <SidebarNavLink icon={<Bell />} label="Notifications" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Sun />} label="Analytics" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Search />} label="Wallets" active={false} onClick={() => {}} />
          <SidebarNavLink icon={<Moon />} label="Settings" active={false} onClick={() => {}} />
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-4 py-4 border-t border-slate-200 dark:border-[#232946]">
          <div className="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/men/31.jpg" alt="profile" className="w-8 h-8 rounded-full border-2 border-white" />
            <span className="text-sm text-[#2d3748] dark:text-white font-semibold transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">
              {userDetails?.firstName && userDetails?.lastName
                ? `${userDetails.firstName} ${userDetails.lastName}`
                : user?.displayName || user?.email?.split('@')[0] || 'User'}
            </span>
          </div>
          <button
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors font-medium text-base"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">Logout</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-slate-500 dark:text-slate-300 text-sm font-medium">
              Welcome back, {userDetails?.firstName && userDetails?.lastName 
                ? `${userDetails.firstName} ${userDetails.lastName}` 
                : user?.displayName || user?.email?.split('@')[0] || 'User'} <span className="inline-block">👋</span>
              
            </div>
            <h1 className="text-3xl font-bold text-[#2d3748] dark:text-white tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white dark:bg-[#232946] shadow border border-slate-200 dark:border-[#232946]">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-200" />
            </button>
            <button className="p-2 rounded-full bg-white dark:bg-[#232946] shadow border border-slate-200 dark:border-[#232946]">
              <Bell className="w-5 h-5 text-slate-400 dark:text-slate-200" />
            </button>
            {/* Dark/Light Mode Toggle */}
            <button
              className="p-2 rounded-full bg-white dark:bg-[#232946] shadow border border-slate-200 dark:border-[#232946] focus:outline-none"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
            </button>
            <img src="https://randomuser.me/api/portraits/men/31.jpg" alt="profile" className="w-10 h-10 rounded-full border-2 border-white ml-2" />
            
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {showStaffSection ? (
            <div className="w-full h-full bg-white dark:bg-[#232946] rounded-2xl shadow-xl p-8">
              {/* Staff Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#2d3748] dark:text-white">Staff Management</h2>
                  <p className="text-slate-500 dark:text-slate-400">Manage your staff members and their roles</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'manage'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Manage Staff
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'overview' ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2d3748] dark:text-white mb-2">
                      {staffMembers.length === 0 ? 'No Staff Members Yet' : `${staffMembers.length} Staff Members`}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {staffMembers.length === 0 
                        ? 'Get started by adding your first staff member' 
                        : 'Manage your team from the Manage Staff tab'
                      }
                    </p>
                  </div>
                  
                  {staffMembers.length === 0 && (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveTab('manage')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Staff
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Manage Staff Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-[#2d3748] dark:text-white">
                      Manage Staff ({staffMembers.length})
                    </h3>
                    <button
                      onClick={() => setShowAddStaffPopup(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Staff
                    </button>
                  </div>
                  
                  {/* Staff List */}
                  <div className="flex-1">
                    {staffMembers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h4 className="text-lg font-medium text-[#2d3748] dark:text-white mb-2">No Staff Members</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Add your first staff member to get started</p>
                        <button
                          onClick={() => setShowAddStaffPopup(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Add Staff
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staffMembers.map((staff) => (
                          <div key={staff.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#2d3748] dark:text-white">
                                  {staff.firstName} {staff.lastName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{staff.email}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Subjects:</span>
                                <span className="text-[#2d3748] dark:text-white font-medium">{staff.subjectNames}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Added:</span>
                                <span className="text-[#2d3748] dark:text-white">
                                  {staff.createdAt?.toDate ? staff.createdAt.toDate().toLocaleDateString() : new Date(staff.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-[#2d3748] dark:text-white mb-2">Welcome to Dashboard</h3>
              <p className="text-slate-500 dark:text-slate-400">Click on Staff in the sidebar to manage your team</p>
            </div>
          )}

          {/* Add Staff Popup */}
          {showAddStaffPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#232946] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#2d3748] dark:text-white">Add New Staff</h3>
                  <button
                    onClick={() => setShowAddStaffPopup(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
                
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                      Subject Names
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mathematics, Physics"
                      value={formData.subjectNames}
                      onChange={(e) => setFormData({...formData, subjectNames: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#2d3748] dark:text-white"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffPopup(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-[#2d3748] dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Staff'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ label, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium text-base ${active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200" : "text-[#2d3748] dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/40"}`}>
      <span className="w-2 h-2 rounded-full bg-blue-400/80 dark:bg-blue-300/80" style={{ opacity: active ? 1 : 0 }} />
      <span>{label}</span>
    </div>
  );
} 

function SidebarNavLink({ icon, label, active, onClick = () => {} }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium text-base 
        ${active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200" : "text-[#2d3748] dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/40"}
      `}
    >
      <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      <span className="transition-all duration-300 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0 ml-[-9999px]">{label}</span>
    </div>
  );
} 