/**
 * Access Denied Component
 * Reusable warning box for role-based access control
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AccessDeniedProps {
    requiredRole: number;
    resourceName?: string;
    returnPath?: string;
}

export const AccessDenied = ({
    requiredRole,
    resourceName = 'this resource',
    returnPath = '/dashboard'
}: AccessDeniedProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getRoleName = (role: number): string => {
        const roleNames: Record<number, string> = {
            0: 'Basic User',
            1: 'Advanced User',
            2: 'Office Staff',
            3: 'Super Admin'
        };
        return roleNames[role] || `Role ${role}`;
    };

    return (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-lg animate-fade-in">
            <div className="flex items-start space-x-4">
                {/* Warning Icon */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                {/* Warning Content */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-3">
                        Access Denied
                    </h2>
                    <p className="text-red-800 dark:text-red-300 mb-4 text-lg">
                        You do not have permission to access {resourceName}.
                    </p>

                    {/* Role Information Box */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-700">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            <span className="font-semibold">Your current role:</span>{' '}
                            {user?.role ?? 0} ({getRoleName(user?.role ?? 0)})
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Required role:</span>{' '}
                            {requiredRole} or higher ({getRoleName(requiredRole)})
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="flex items-start space-x-2 text-red-700 dark:text-red-300">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">
                            Please contact your system administrator to request access.
                            {getRoleName(requiredRole)} access or higher is required to view this content.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => navigate(returnPath)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-smooth flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Return to Dashboard</span>
                </button>
            </div>
        </div>
    );
};
