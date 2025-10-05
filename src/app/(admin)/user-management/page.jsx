"use client";

import useAuthContext from '@/hooks/useAuthContext';
import { updateProfile } from 'firebase/auth';
import { CheckCircle, Download, Edit2, Eye, EyeOff, Search, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const AdminRegister = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUserType, setFilterUserType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        usertype: ''
    });
    const { createUser } = useAuthContext();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/userEntries');
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch users',
                confirmButtonColor: '#000000'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterUserType !== 'all') {
            filtered = filtered.filter(user => user.usertype === filterUserType);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }

        setFilteredUsers(filtered);
    }, [searchTerm, filterUserType, filterStatus, users]);

    const handleRegisterSubmit = async () => {
        setRegisterLoading(true);

        const { name, email, password, confirmPassword, usertype } = registerForm;

        if (!name || !email || !password || !confirmPassword || !usertype) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all fields',
                confirmButtonColor: '#000000'
            });
            setRegisterLoading(false);
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Password must be at least 6 characters long',
                confirmButtonColor: '#000000'
            });
            setRegisterLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Passwords do not match',
                confirmButtonColor: '#000000'
            });
            setRegisterLoading(false);
            return;
        }

        try {
            // Create user with Firebase
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // Update user profile with name
            await updateProfile(user, {
                displayName: name
            });

            // Store user name in cookies
            document.cookie = `userName=${encodeURIComponent(name)}; path=/`;

            // Save user info in database
            const response = await fetch("/api/userEntries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    usertype,
                    status: "active",
                }),
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Registration Complete',
                    text: 'User account has been created successfully!',
                    confirmButtonColor: '#000000'
                });

                setRegisterForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    usertype: ''
                });
                setShowRegisterModal(false);
                fetchUsers();
            } else {
                throw new Error('Failed to save user to database');
            }

        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = 'An error occurred during registration';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already registered. Please try logging in instead.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                    break;
                default:
                    errorMessage = error.message || 'Registration failed. Please try again.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: errorMessage,
                confirmButtonColor: '#000000'
            });
        } finally {
            setRegisterLoading(false);
        }
    };

    const toggleUserStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        
        try {
            const response = await fetch('/api/userEntries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user._id,
                    status: newStatus
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`,
                    confirmButtonColor: '#000000',
                    timer: 1500
                });
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update user status',
                confirmButtonColor: '#000000'
            });
        }
    };

    const updateUserType = async (user, newUserType) => {
        try {
            const response = await fetch('/api/userEntries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user._id,
                    usertype: newUserType
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User type updated successfully',
                    confirmButtonColor: '#000000',
                    timer: 1500
                });
                fetchUsers();
                setEditingUser(null);
            }
        } catch (error) {
            console.error('Error updating user type:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update user type',
                confirmButtonColor: '#000000'
            });
        }
    };

    const deleteUser = async (userId) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/userEntries', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'User has been deleted',
                        confirmButtonColor: '#000000',
                        timer: 1500
                    });
                    fetchUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete user',
                    confirmButtonColor: '#000000'
                });
            }
        }
    };

    const exportToCSV = () => {
        const dataToExport = filteredUsers;
        
        if (dataToExport.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Data',
                text: 'No users to export',
                confirmButtonColor: '#000000'
            });
            return;
        }

        const headers = ['Name', 'Email', 'User Type', 'Status', 'Created At'];
        const csvData = dataToExport.map(user => [
            user.name || '',
            user.email || '',
            user.usertype || '',
            user.status || '',
            user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: 'success',
            title: 'Exported!',
            text: `${dataToExport.length} users exported successfully`,
            confirmButtonColor: '#000000',
            timer: 1500
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                        <p className="text-gray-600">Manage and monitor all user accounts</p>
                    </div>
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        + Register New User
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filterUserType}
                            onChange={(e) => setFilterUserType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                            <option value="all">All User Types</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="staff">Staff</option>
                            <option value="customer">Customer</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>

                        <button
                            onClick={exportToCSV}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-900">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-600">Blocked</p>
                            <p className="text-2xl font-bold text-red-900">
                                {users.filter(u => u.status === 'blocked').length}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600">Filtered</p>
                            <p className="text-2xl font-bold text-blue-900">{filteredUsers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingUser === user._id ? (
                                                    <select
                                                        value={user.usertype}
                                                        onChange={(e) => updateUserType(user, e.target.value)}
                                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-black"
                                                        autoFocus
                                                        onBlur={() => setEditingUser(null)}
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="moderator">Moderator</option>
                                                        <option value="staff">Staff</option>
                                                         <option value="customer">Customer</option>
                                                    </select>
                                                ) : (
                                                    <span
                                                        onClick={() => setEditingUser(user._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                                    >
                                                        {user.usertype}
                                                        <Edit2 className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleUserStatus(user)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                        user.status === 'active'
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Blocked
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showRegisterModal && (
                <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Register New User</h2>
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={registerForm.name}
                                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="Enter full name"
                                        disabled={registerLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={registerForm.email}
                                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="Enter email address"
                                        disabled={registerLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={registerForm.password}
                                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="Enter password (min 6 characters)"
                                            disabled={registerLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={registerForm.confirmPassword}
                                            onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="Confirm password"
                                            disabled={registerLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Type *
                                    </label>
                                    <select
                                        value={registerForm.usertype}
                                        onChange={(e) => setRegisterForm({...registerForm, usertype: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        disabled={registerLoading}
                                    >
                                        <option value="">Select user type</option>
                                        <option value="admin">Admin</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>

                                <div className="text-xs text-gray-500">
                                    Password must be at least 6 characters long
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        disabled={registerLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRegisterSubmit}
                                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        disabled={registerLoading}
                                    >
                                        {registerLoading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            'Register User'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRegister;