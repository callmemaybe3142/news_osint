/**
 * Settings Page
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const { token } = useAuth();

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                showToast('Password changed successfully!', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const errorData = await response.json();
                showToast(errorData.detail || 'Failed to change password', 'error');
            }
        } catch (error) {
            showToast(`An error occurred. Please try again. ${error}`, 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleThemeToggle = () => {
        toggleTheme();
        showToast(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`, 'success');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-smooth"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Dashboard</span>
                </button>

                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-6 animate-fade-in">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Appearance
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Current: <span className="font-semibold capitalize">{theme}</span> mode
                                </p>
                            </div>

                            <button
                                onClick={handleThemeToggle}
                                className="relative inline-flex items-center h-10 w-20 rounded-full transition-smooth focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                style={{
                                    backgroundColor: theme === 'dark' ? '#4B5563' : '#E5E7EB'
                                }}
                            >
                                <span
                                    className={`flex items-center justify-center h-8 w-8 transform rounded-full bg-white shadow-lg transition-smooth ${theme === 'dark' ? 'translate-x-11' : 'translate-x-1'
                                        }`}
                                >
                                    {theme === 'light' ? (
                                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Change Password
                        </h2>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth"
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isChangingPassword ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Changing Password...
                                    </span>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
