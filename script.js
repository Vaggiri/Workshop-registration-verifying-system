document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputToggle = document.getElementById('inputToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const manualInput = document.getElementById('manualInput');
    const cameraFeed = document.getElementById('cameraFeed');
    const verifyBtn = document.getElementById('verifyBtn');
    const rollNumberInput = document.getElementById('rollNumberInput');
    const verificationResult = document.getElementById('verificationResult');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const recentVerifications = document.getElementById('recentVerifications');
    const totalRegistered = document.getElementById('totalRegistered');
    const verifiedToday = document.getElementById('verifiedToday');
    const notRegisteredCount = document.getElementById('notRegistered');
    const grantedList = document.getElementById('grantedList');
    const notRegisteredList = document.getElementById('notRegisteredList');
    const sheetsUrl = document.getElementById('sheetsUrl');
    const apiKey = document.getElementById('apiKey');
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const sheetsStatus = document.getElementById('sheetsStatus');
    const sheetsStatusIcon = document.getElementById('sheetsStatusIcon');
    const sheetsStatusText = document.getElementById('sheetsStatusText');
    const cameraIp = document.getElementById('cameraIp');
    const updateIpBtn = document.getElementById('updateIpBtn');

    // State variables
    let qrScannerInterval;
    let currentCameraIp = '192.168.1.100';

    // Toggle between camera and manual input
    inputToggle.addEventListener('change', function() {
        if (this.checked) {
            toggleLabel.textContent = 'Manual Entry';
            manualInput.classList.remove('hidden');
            cameraFeed.classList.add('hidden');
            stopQRScanner();
            rollNumberInput.focus();
        } else {
            toggleLabel.textContent = 'ESP32-CAM';
            manualInput.classList.add('hidden');
            cameraFeed.classList.remove('hidden');
            startQRScanner();
        }
    });

    // Update camera IP
    updateIpBtn.addEventListener('click', function() {
        currentCameraIp = cameraIp.value.trim() || '192.168.1.100';
        showNotification(`Camera IP updated to ${currentCameraIp}`, 'info');
        if (!inputToggle.checked) {
            stopQRScanner();
            startQRScanner();
        }
    });

    // Verify student (manual entry)
    verifyBtn.addEventListener('click', verifyStudent);
    rollNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyStudent();
        }
    });

    // Fetch data from Google Sheets via Flask backend
    fetchDataBtn.addEventListener('click', fetchSheetData);
// Add this with your other DOM element selectors
const clearEntriesBtn = document.getElementById('clearEntriesBtn');

// Add this event listener in your init() function
clearEntriesBtn.addEventListener('click', clearAllEntries);

// Add this function to your JavaScript
function clearAllEntries() {
    if (confirm('Are you sure you want to clear all verification entries? This cannot be undone.')) {
        fetch('http://127.0.0.1:5000/clear_entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                fetchStats(); // Refresh the display
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
    }
}	
	
	
	
	

    // Start QR scanner simulation
    function startQRScanner() {
        // In a real implementation, this would connect to the ESP32-CAM
        console.log(`Starting QR scanner at ${currentCameraIp}`);
        
        // Simulate periodic QR code scans
        qrScannerInterval = setInterval(() => {
            // This would actually fetch from ESP32-CAM IP
            // For demo, we'll simulate occasional scans
            if (Math.random() > 0.7) {
                const demoRollNos = ['2023001', '2023002', '2023003', '2023004', '2023005', '2023999'];
                const randomRollNo = demoRollNos[Math.floor(Math.random() * demoRollNos.length)];
                
                // Simulate receiving QR code data
                
            }
        }, 3000);
    }

    // Stop QR scanner simulation
    function stopQRScanner() {
        clearInterval(qrScannerInterval);
        console.log('QR scanner stopped');
    }

    // Process received QR code
    function receiveQRCode(rollNo) {
        fetch('http://127.0.0.1:5000/receive_qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rollNo: rollNo,
                ipAddress: currentCameraIp
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUIAfterVerification(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to verify QR code', 'error');
        });
    }

    // Verify student via Flask backend
    function verifyStudent() {
        const rollNo = rollNumberInput.value.trim();
        if (!rollNo) {
            showNotification('Please enter a roll number', 'error');
            return;
        }

        fetch('http://127.0.0.1:5000/verify_student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rollNo: rollNo
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUIAfterVerification(data);
                rollNumberInput.value = '';
            } else {
                showNotification(data.message || 'Verification failed', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to verify student', 'error');
        });
    }

    // Update UI after verification
    function updateUIAfterVerification(data) {
        if (data.registered) {
            showVerificationResult(true, data.message, data.student);
        } else {
            showVerificationResult(false, data.message, data.student);
        }
        
        // Refresh all data from backend
        fetchStats();
    }

    // Show verification result
    function showVerificationResult(success, message, student) {
        // Set icon and colors
        if (success) {
            resultIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            `;
            verificationResult.className = 'p-4 rounded-lg mb-6 bg-green-50 border border-green-200 animate__animated animate__fadeIn bounce-in';
        } else {
            resultIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            `;
            verificationResult.className = 'p-4 rounded-lg mb-6 bg-red-50 border border-red-200 animate__animated animate__fadeIn bounce-in';
        }
        
        // Set text
        resultTitle.textContent = success ? 'Verified Successfully' : 'Not Registered';
        resultMessage.textContent = message;
        
        // Show the result panel
        verificationResult.classList.remove('hidden');
        
        // Hide after 5 seconds
        setTimeout(() => {
            verificationResult.classList.add('animate__fadeOut');
            setTimeout(() => {
                verificationResult.classList.add('hidden');
                verificationResult.classList.remove('animate__fadeOut');
            }, 500);
        }, 5000);
    }

    // Fetch stats from backend
    function fetchStats() {
        fetch('http://127.0.0.1:5000/get_stats')
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
        });
    }

    // Update dashboard with data from backend
    function updateDashboard(data) {
        // Update counters
        totalRegistered.textContent = data.totalRegistered;
        verifiedToday.textContent = data.verifiedToday;
        notRegisteredCount.textContent = data.notRegistered;
        
        // Update recent verifications
        if (data.recentActivities.length === 0) {
            recentVerifications.innerHTML = '<div class="text-center py-4 text-gray-500">No verifications yet</div>';
        } else {
            recentVerifications.innerHTML = data.recentActivities.map(activity => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg smooth-transition hover:bg-gray-100">
                    <div>
                        <div class="font-medium text-gray-800">${activity.rollNo}</div>
                        <div class="text-sm text-gray-600">${activity.name}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">${activity.timestamp}</div>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            activity.status === 'verified' ? 
                            'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                        }">
                            ${activity.status === 'verified' ? 'Verified' : 'Not Registered'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
        
        // Update granted access list
        if (data.grantedList.length === 0) {
            grantedList.innerHTML = '<p class="text-sm text-gray-500 text-center py-2">No verified students yet</p>';
        } else {
            grantedList.innerHTML = data.grantedList.map(student => `
                <div class="flex items-center justify-between py-2 px-1 border-b border-gray-100 last:border-0">
                    <div>
                        <div class="text-sm font-medium text-gray-800">${student.rollNo}</div>
                        <div class="text-xs text-gray-600">${student.name} - ${student.department}</div>
                    </div>
                    <span class="text-xs text-green-600">✓ Granted</span>
                </div>
            `).join('');
        }
        
        // Update not registered list
        if (data.notRegisteredList.length === 0) {
            notRegisteredList.innerHTML = '<p class="text-sm text-gray-500 text-center py-2">All scanned students are registered</p>';
        } else {
            notRegisteredList.innerHTML = data.notRegisteredList.map(student => `
                <div class="flex items-center justify-between py-2 px-1 border-b border-gray-100 last:border-0">
                    <div class="text-sm font-medium text-gray-800">${student.rollNo}</div>
                    <span class="text-xs text-red-600">✗ Not Registered</span>
                </div>
            `).join('');
        }
    }

    // Fetch data from Google Sheets via Flask backend
    function fetchSheetData() {
        const url = sheetsUrl.value.trim();
        
        if (!url) {
            showNotification('Please enter Google Sheets URL', 'error');
            return;
        }
        
        // Show loading state
        sheetsStatus.className = 'mt-3 text-sm';
        sheetsStatusIcon.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
        sheetsStatusText.textContent = 'Fetching data from Google Sheets...';
        
        fetch('http://127.0.0.1:5000/fetch_sheet_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheet_url: url,
                api_key: apiKey.value.trim()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sheetsStatusIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                `;
                sheetsStatusText.textContent = `Success: ${data.message}`;
                sheetsStatus.className = 'mt-3 text-sm';
                
                showNotification(data.message, 'success');
                
                // Refresh stats after loading data
                fetchStats();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            sheetsStatusIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            `;
            sheetsStatusText.textContent = `Error: ${error.message}`;
            sheetsStatus.className = 'mt-3 text-sm';
            
            showNotification(error.message, 'error');
        });
    }

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate__animated animate__fadeInUp ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 'bg-indigo-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate__fadeOutDown');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Initialize the app
    function init() {
        // Set default Google Sheets URL (for demo)
        sheetsUrl.value = 'https://docs.google.com/spreadsheets/d/your-sheet-id/edit';
        
        // Start with manual input off (camera mode)
        inputToggle.checked = false;
        toggleLabel.textContent = 'ESP32-CAM';
        manualInput.classList.add('hidden');
        cameraFeed.classList.remove('hidden');
        
        // Start QR scanner simulation
        startQRScanner();
        
        // Fetch initial stats
        fetchStats();
    }

    init();
});