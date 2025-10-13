'use client';

import { useState } from 'react';
import { usePWA } from '@/lib/pwa';
import { Button } from './Button';
import { Modal } from './Modal';
import { Download, Smartphone, Monitor, X } from 'lucide-react';

export function InstallPrompt() {
  const { canInstall, isInstalled, updateAvailable, install, update } = usePWA();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(updateAvailable);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallModal(false);
    }
  };

  const handleUpdate = async () => {
    await update();
    setShowUpdateModal(false);
  };

  // Don't show anything if app is installed and no updates
  if (isInstalled && !updateAvailable) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      {canInstall && !showInstallModal && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Install TB Screening PWA
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get the full app experience with offline access
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInstallModal(true)}
                >
                  Learn More
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                >
                  Install
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">
                  Update Available
                </h3>
                <p className="text-xs opacity-90 mt-1">
                  A new version is ready to install
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpdate}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Modal */}
      <Modal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        title="Install TB Screening PWA"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Get the Full App Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Install TB Screening PWA for faster access, offline functionality, and a native app experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Works Offline
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Access your data even without internet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Download className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Fast Loading
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Instant startup and smooth performance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Native Feel
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  App-like experience on any device
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Push Notifications
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Stay updated with important alerts
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInstallModal(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1"
            >
              Install Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Available"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              A new version of TB Screening PWA is available with improvements and bug fixes.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUpdateModal(false)}
              className="flex-1"
            >
              Later
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1"
            >
              Update Now
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}