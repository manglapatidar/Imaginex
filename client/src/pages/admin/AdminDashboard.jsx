import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Image as ImageIcon, Flag, UserCheck, Eye, Trash2, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import UserAvatar from '../../components/UserAvatar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllPosts, getAllReports, getAllUsers, dismissReport, removePost } from '../../features/admin/adminSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const {users, posts, reports, adminLoading, adminSuccess, adminError, adminErrorMessage} = useSelector(state => state.admin)
  const dispatch = useDispatch()



  // Placeholders for data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    activeUsers: 0
  });

  const statCards = [
    { label: 'Total Users', value: users?.length, icon: Users, color: 'text-violet-500', border: 'border-b-violet-500/50' },
    { label: 'Total Posts', value: posts?.length, icon: ImageIcon, color: 'text-fuchsia-500', border: 'border-b-fuchsia-500/50' },
    { label: 'Total Reports', value: reports?.length, icon: Flag, color: 'text-rose-500', border: 'border-b-rose-500/50' },
    { label: 'Active Users', value: users?.filter(user => user.isActive).length, icon: UserCheck, color: 'text-green-500', border: 'border-b-green-500/50' },
  ];

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllPosts());
    dispatch(getAllReports());
  }, [dispatch]);

  useEffect(() => {
    if (adminError && adminErrorMessage) {
      toast.error(adminErrorMessage, { position: "top-center" });
    }
  }, [adminError, adminErrorMessage]);

  if(adminLoading){
    return(
      <Loader/>
    )
  }

  return (

    <>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">

          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-syne text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.name || "Admin"}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statCards.map((stat, idx) => (
                <div key={idx} className={`glass-card p-6 flex flex-col items-start relative overflow-hidden border-b-2 ${stat.border}`}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-gray-400 font-medium">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Users Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-syne text-xl font-bold text-white">Recent Users</h2>
                  <Link to="/admin/users" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    View All
                  </Link>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-sm">
                          <th className="py-3 px-4 font-medium">User</th>
                          <th className="py-3 px-4 font-medium">Email</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                          <th className="py-3 px-4 font-medium">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.slice(0, 5).map((u) => (
                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <UserAvatar size="sm" />
                                  <span className="text-white font-medium">{u.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-400">{u.email}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {u.isActive ? 'Active' : 'Banned'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{u.credits}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-gray-500">
                              No recent users
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-syne text-xl font-bold text-white">Recent Reports</h2>
                  <Link to="/admin/reports" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {reports.length > 0 ? (
                    reports.slice(0, 3).map((report) => (
                      <div key={report._id} className="glass-card p-4 hover:bg-white/5 transition-colors flex gap-4">
                        {/* Thumbnail */}
                        <div className="shrink-0">
                          {report.post?.imageLink ? (
                            <img src={report.post.imageLink} alt="Thumb" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1 mb-1">"{report.text}"</p>
                          <div className="flex flex-col text-[10px] text-gray-500">
                            <span>By @{report.user?.name}</span>
                            <span>Post: {report.post?._id?.slice(-6) || 'N/A'}</span>
                          </div>
                   
                          <div className="flex items-center gap-2 mt-3">
                            <Link 
                              title="View Post"
                              className='p-1.5 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors' 
                              to={`/auth/post/${report.post?._id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button 
                              title="Dismiss Report"
                              onClick={() => dispatch(dismissReport(report._id))}
                              className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            <button 
                              title="Delete Post"
                              onClick={() => {
                                if(window.confirm("Are you sure you want to delete this post?")) {
                                  dispatch(removePost(report.post?._id))
                                }
                              }}
                              className="p-1.5 bg-rose-600/20 text-rose-400 rounded-lg hover:bg-rose-600/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-card p-8 text-center flex flex-col items-center justify-center text-gray-500 h-48">
                      <Flag className="w-8 h-8 mb-2 opacity-50" />
                      <p>No new reports</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>

  );
};

export default AdminDashboard;