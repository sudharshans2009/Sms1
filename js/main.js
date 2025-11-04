// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const userTypeBtns = document.querySelectorAll('.user-type-btn');
const sidebar = document.getElementById('sidebar');
const sidebarMenu = document.getElementById('sidebarMenu');
const menuToggle = document.getElementById('menuToggle');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const floatingActions = document.getElementById('floatingActions');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateTime();
    setInterval(updateTime, 1000);
    initializeTheme();
});

// Initialize Theme
function initializeTheme() {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
enableDarkTheme();
    } else {
enableLightTheme();
    }

    // Add theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);
}

// Toggle Theme
function toggleTheme() {
    if (isDarkTheme) {
enableLightTheme();
    } else {
enableDarkTheme();
    }
}

// Enable Dark Theme
function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    themeIcon.className = 'bi bi-sun-fill';
    isDarkTheme = true;
    localStorage.setItem('theme', 'dark');
}

// Enable Light Theme
function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    themeIcon.className = 'bi bi-moon-fill';
    isDarkTheme = false;
    localStorage.setItem('theme', 'light');
}

// Initialize App
function initializeApp() {
    // Load sample data
    students = [...sampleStudents];
    teachers = [...sampleTeachers];
    classes = [...sampleClasses];
    announcements = [...sampleAnnouncements];
    buses = [...sampleBuses];
    books = [...sampleBooks];

    // Setup event listeners
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // User type selection
    userTypeBtns.forEach(btn => {
btn.addEventListener('click', () => {
    userTypeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
});
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
e.preventDefault();
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const role = document.querySelector('.user-type-btn.active').dataset.role;

// Validate login credentials
if (validateLogin(email, password, role)) {
    login(role, email);
} else {
    showToast('Login Error', 'Invalid email or password', 'error');
}
    });

    // Menu toggle
    menuToggle.addEventListener('click', () => {
sidebar.classList.toggle('active');
    });

    // Bus selection in student form
    document.querySelectorAll('.bus-option').forEach(option => {
option.addEventListener('click', () => {
    document.querySelectorAll('.bus-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    
    const busType = option.dataset.bus;
    const busNumberGroup = document.getElementById('busNumberGroup');
    const busNumberSelect = document.getElementById('busNumber');
    
    if (busType === 'school') {
        busNumberGroup.style.display = 'block';
        busNumberSelect.innerHTML = `
            <option value="">Select Bus Number</option>
            <option value="AV01">AV01</option>
            <option value="AV02">AV02</option>
            <option value="AV03">AV03</option>
            <option value="AV04">AV04</option>
            <option value="AV05">AV05</option>
            <option value="AV06">AV06</option>
            <option value="AV07">AV07</option>
            <option value="AV08">AV08</option>
            <option value="AV09">AV09</option>
            <option value="AV10">AV10</option>
            <option value="AV11">AV11</option>
            <option value="AV12">AV12</option>
        `;
    } else if (busType === 'private') {
        busNumberGroup.style.display = 'block';
        busNumberSelect.innerHTML = `
            <option value="">Select Bus Number</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
        `;
    } else {
        busNumberGroup.style.display = 'none';
    }
});
    });

    // Student class change
    document.getElementById('studentClass').addEventListener('change', (e) => {
const classValue = e.target.value;
const studentContactGroup = document.getElementById('studentContactGroup');
const studentEmailGroup = document.getElementById('studentEmailGroup');
const sectionSelect = document.getElementById('studentSection');

if (classValue === '11' || classValue === '12') {
    studentContactGroup.style.display = 'block';
    studentEmailGroup.style.display = 'block';
    sectionSelect.innerHTML = `
        <option value="">Select Section</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
    `;
} else {
    studentContactGroup.style.display = 'none';
    studentEmailGroup.style.display = 'none';
    sectionSelect.innerHTML = `
        <option value="">Select Section</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
    `;
}
    });

    // Announcement target change
    document.getElementById('announcementTarget').addEventListener('change', (e) => {
const target = e.target.value;
const classGroup = document.getElementById('announcementClassGroup');

if (target === 'class') {
    classGroup.style.display = 'block';
} else {
    classGroup.style.display = 'none';
}
    });

    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    const tabContainer = btn.closest('.tabs-container');
    
    // Remove active class from all tabs and contents in this container
    tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
});
    });

    // Book search
    document.getElementById('bookSearch').addEventListener('input', (e) => {
const searchTerm = e.target.value.toLowerCase();
filterBooks(searchTerm);
    });

    // Book filter buttons
    document.querySelectorAll('.library-filter-btn').forEach(btn => {
btn.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.library-filter-btn').forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Filter books
    const filter = btn.getAttribute('data-filter');
    filterBooksByCategory(filter);
});
    });

    // Add book form submission
    document.getElementById('addBookForm').addEventListener('submit', (e) => {
e.preventDefault();
addBook();
    });

    // Bus selector change
    document.getElementById('busSelector').addEventListener('change', (e) => {
const busId = e.target.value;
if (busId) {
    selectBus(busId);
}
    });

    // View all announcements button
    document.getElementById('viewAllAnnouncementsBtn').addEventListener('click', () => {
// Navigate to announcements page
const announcementsLink = document.querySelector('.sidebar-menu a[data-page="announcements"]');
if (announcementsLink) {
    announcementsLink.click();
}
    });
}

// Validate Login
function validateLogin(email, password, role) {
    // Define valid credentials
    const validCredentials = {
admin: { email: 'admin@123', password: 'admin' },
teacher: { email: 'teacher@123', password: 'teacher' },
student: { email: 'student@123', password: 'student' },
driver: { email: 'driver@123', password: 'driver' }
    };

    // Check if credentials match
    if (validCredentials[role] && 
validCredentials[role].email === email && 
validCredentials[role].password === password) {
return true;
    }
    
    return false;
}

// Login Function
function login(role, email) {
    currentUserRole = role;
    currentUser = {
email: email,
name: email.split('@')[0],
role: role
    };

    // Update UI based on role
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = role.charAt(0).toUpperCase() + role.slice(1);
    document.getElementById('welcomeName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.substring(0, 2).toUpperCase();

    // Generate sidebar menu based on role
    generateSidebarMenu(role);

    // Show/hide floating action buttons based on role
    if (role === 'admin') {
floatingActions.style.display = 'flex';
    } else {
floatingActions.style.display = 'none';
    }

    // Show/hide admin-only buttons
    updateAdminOnlyButtons(role);

    // Show dashboard
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';

    // Load dashboard content
    loadDashboardContent();

    // Show specific content based on role
    if (role === 'driver') {
showDriverContent();
    }
}

// Update Admin Only Buttons
function updateAdminOnlyButtons(role) {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const addClassBtn = document.getElementById('addClassBtn');
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookTabBtn = document.getElementById('addBookTabBtn');

    if (role === 'admin') {
if (addStudentBtn) addStudentBtn.style.display = 'block';
if (addTeacherBtn) addTeacherBtn.style.display = 'block';
if (addClassBtn) addClassBtn.style.display = 'block';
if (addBookBtn) addBookBtn.style.display = 'block';
if (addBookTabBtn) addBookTabBtn.style.display = 'block';
    } else if (role === 'teacher') {
// Teachers can add students to their class only
if (addStudentBtn) addStudentBtn.style.display = 'block';
if (addTeacherBtn) addTeacherBtn.style.display = 'none';
if (addClassBtn) addClassBtn.style.display = 'none';
if (addBookBtn) addBookBtn.style.display = 'block';
if (addBookTabBtn) addBookTabBtn.style.display = 'block';
    } else {
if (addStudentBtn) addStudentBtn.style.display = 'none';
if (addTeacherBtn) addTeacherBtn.style.display = 'none';
if (addClassBtn) addClassBtn.style.display = 'none';
if (addBookBtn) addBookBtn.style.display = 'none';
if (addBookTabBtn) addBookTabBtn.style.display = 'none';
    }
}

// Generate Sidebar Menu
function generateSidebarMenu(role) {
    let menuItems = [];

    if (role === 'admin') {
menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', page: 'dashboard' },
    { icon: 'bi-people', text: 'Students', page: 'students' },
    { icon: 'bi-person-workspace', text: 'Teachers', page: 'teachers' },
    { icon: 'bi-journal-text', text: 'Classes', page: 'classes' },
    { icon: 'bi-calendar-check', text: 'Attendance', page: 'attendance' },
    { icon: 'bi-calendar-week', text: 'Timetable', page: 'timetable' },
    { icon: 'bi-clipboard-check', text: 'Marks', page: 'marks' },
    { icon: 'bi-file-earmark-bar-graph', text: 'Reports', page: 'reports' },
    { icon: 'bi-bus-front', text: 'Bus Tracking', page: 'busTracking' },
    { icon: 'bi-book', text: 'Library', page: 'library' },
    { icon: 'bi-megaphone', text: 'Announcements', page: 'announcements' },
    { icon: 'bi-chat-dots', text: 'Messages', page: 'messages' },
    { icon: 'bi-cloud-download', text: 'Export Data', page: 'exportData' },
    { icon: 'bi-gear', text: 'Settings', page: 'settings' }
];
    } else if (role === 'teacher') {
menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', page: 'dashboard' },
    { icon: 'bi-people', text: 'Students', page: 'students' },
    { icon: 'bi-calendar-check', text: 'Attendance', page: 'attendance' },
    { icon: 'bi-calendar-week', text: 'Timetable', page: 'timetable' },
    { icon: 'bi-clipboard-check', text: 'Marks', page: 'marks' },
    { icon: 'bi-file-earmark-bar-graph', text: 'Reports', page: 'reports' },
    { icon: 'bi-book', text: 'Library', page: 'library' },
    { icon: 'bi-megaphone', text: 'Announcements', page: 'announcements' },
    { icon: 'bi-chat-dots', text: 'Messages', page: 'messages' }
];
    } else if (role === 'student') {
menuItems = [
    { icon: 'bi-speedometer2', text: 'Dashboard', page: 'dashboard' },
    { icon: 'bi-calendar-check', text: 'Attendance', page: 'attendance' },
    { icon: 'bi-calendar-week', text: 'Timetable', page: 'timetable' },
    { icon: 'bi-clipboard-check', text: 'Marks', page: 'marks' },
    { icon: 'bi-file-earmark-bar-graph', text: 'Reports', page: 'reports' },
    { icon: 'bi-book', text: 'Library', page: 'library' },
    { icon: 'bi-megaphone', text: 'Announcements', page: 'announcements' },
    { icon: 'bi-chat-dots', text: 'Messages', page: 'messages' },
    { icon: 'bi-bus-front', text: 'Bus Tracking', page: 'busTracking' }
];
    } else if (role === 'driver') {
menuItems = [
    { icon: 'bi-bus-front', text: 'Bus Tracking', page: 'busTracking' },
    { icon: 'bi-chat-dots', text: 'Messages', page: 'messages' }
];
    }

    // Generate menu HTML
    sidebarMenu.innerHTML = menuItems.map(item => `
<li><a href="#" data-page="${item.page}" class="${item.page === 'dashboard' ? 'active' : ''}">
    <i class="bi ${item.icon}"></i> ${item.text}
</a></li>
    `).join('');

    // Add click event to menu items
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
link.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
    
    // Add active class to clicked link
    link.classList.add('active');
    
    // Get the page to show
    const page = link.getAttribute('data-page');
    
    // Handle special pages
    if (page === 'exportData') {
        exportData();
        return;
    }
    
    // Hide all content sections
    document.querySelectorAll('[id$="Content"]').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show the appropriate content
    const contentElement = document.getElementById(`${page}Content`);
    if (contentElement) {
        contentElement.style.display = 'block';
        
        // Load content for the page
        if (page === 'students') {
            loadStudentsContent();
        } else if (page === 'teachers') {
            loadTeachersContent();
        } else if (page === 'classes') {
            loadClassesContent();
        } else if (page === 'attendance') {
            loadAttendanceContent();
        } else if (page === 'timetable') {
            loadTimetableContent();
        } else if (page === 'marks') {
            loadMarksContent();
        } else if (page === 'reports') {
            loadReportsContent();
        } else if (page === 'busTracking') {
            loadBusTrackingContent();
        } else if (page === 'library') {
            loadLibraryContent();
        } else if (page === 'messages') {
            loadMessagesContent();
        } else if (page === 'announcements') {
            loadAnnouncementsContent();
        }
    } else {
        document.getElementById('dashboardContent').style.display = 'block';
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
});
    });
}

// Load Dashboard Content
function loadDashboardContent() {
    // Generate stats
    generateStats();
    
    // Generate activities
    generateActivities();
    
    // Generate announcements
    generateAnnouncements();
    
    // Generate features
    generateFeatures();
}

// Generate Stats
function generateStats() {
    const statsGrid = document.getElementById('statsGrid');
    
    const stats = [
{ icon: 'bi-people-fill', label: 'Total Students', value: students.length, change: '+12%', changeType: 'positive', color: 'primary' },
{ icon: 'bi-person-workspace', label: 'Total Teachers', value: teachers.length, change: '+5%', changeType: 'positive', color: 'success' },
{ icon: 'bi-journal-text', label: 'Total Classes', value: classes.length, change: '+2%', changeType: 'positive', color: 'warning' },
{ icon: 'bi-bus-front', label: 'Active Buses', value: buses.length, change: '0%', changeType: 'positive', color: 'danger' }
    ];
    
    statsGrid.innerHTML = stats.map(stat => `
<div class="stat-card animate__animated animate__fadeInUp">
    <div class="stat-icon ${stat.color}">
        <i class="bi ${stat.icon}"></i>
    </div>
    <div class="stat-value">${stat.value}</div>
    <div class="stat-label">${stat.label}</div>
    <div class="stat-change ${stat.changeType}">
        <i class="bi bi-arrow-${stat.changeType === 'positive' ? 'up' : 'down'}"></i> ${stat.change} from last month
    </div>
</div>
    `).join('');
}

// Generate Activities
function generateActivities() {
    const activityList = document.getElementById('activityList');
    
    const activities = [
{ icon: 'bi-person-plus', color: 'primary', title: 'New student registration', time: '2 hours ago' },
{ icon: 'bi-check-circle', color: 'success', title: 'Exam results published', time: '5 hours ago' },
{ icon: 'bi-calendar-event', color: 'warning', title: 'Parent-teacher meeting scheduled', time: 'Yesterday' },
{ icon: 'bi-exclamation-triangle', color: 'danger', title: 'Fee payment reminder sent', time: '2 days ago' }
    ];
    
    activityList.innerHTML = activities.map(activity => `
<li class="activity-item">
    <div class="activity-icon" style="background: rgba(74, 108, 247, 0.1); color: var(--${activity.color}-color);">
        <i class="bi ${activity.icon}"></i>
    </div>
    <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${activity.time}</div>
    </div>
</li>
    `).join('');
}

// Generate Announcements
function generateAnnouncements() {
    const announcementsList = document.getElementById('announcementsList');
    
    announcementsList.innerHTML = announcements.slice(0, 2).map(announcement => `
<div class="announcement-card animate__animated animate__fadeIn">
    <div class="announcement-title">${announcement.title}</div>
    <div class="announcement-content">${announcement.content}</div>
    <div class="announcement-date">${formatDate(announcement.date)}</div>
</div>
    `).join('');
}

// Generate Features
function generateFeatures() {
    const featuresGrid = document.getElementById('featuresGrid');
    
    let features = [];
    
    if (currentUserRole === 'admin') {
features = [
    { icon: 'bi-people', title: 'Students', description: 'Manage student information and records' },
    { icon: 'bi-person-workspace', title: 'Teachers', description: 'Manage teacher information and assignments' },
    { icon: 'bi-journal-text', title: 'Classes', description: 'Manage class sections and schedules' },
    { icon: 'bi-calendar-check', title: 'Attendance', description: 'Track student and staff attendance' },
    { icon: 'bi-calendar-week', title: 'Timetable', description: 'Manage class schedules and timetables' },
    { icon: 'bi-clipboard-check', title: 'Marks', description: 'Manage student marks and grades' },
    { icon: 'bi-file-earmark-bar-graph', title: 'Reports', description: 'Generate and manage reports' },
    { icon: 'bi-bus-front', title: 'Bus Tracking', description: 'Track school buses in real-time' },
    { icon: 'bi-book', title: 'Library', description: 'Manage library books and circulation' },
    { icon: 'bi-megaphone', title: 'Announcements', description: 'Create and manage announcements' },
    { icon: 'bi-chat-dots', title: 'Messages', description: 'Communicate with staff and parents' },
    { icon: 'bi-cloud-download', title: 'Export Data', description: 'Export data as CSV files' }
];
    } else if (currentUserRole === 'teacher') {
features = [
    { icon: 'bi-people', title: 'Students', description: 'View student information' },
    { icon: 'bi-calendar-check', title: 'Attendance', description: 'Mark student attendance' },
    { icon: 'bi-calendar-week', title: 'Timetable', description: 'View class timetable' },
    { icon: 'bi-clipboard-check', title: 'Marks', description: 'Enter student marks' },
    { icon: 'bi-file-earmark-bar-graph', title: 'Reports', description: 'Generate student reports' },
    { icon: 'bi-book', title: 'Library', description: 'Manage library books' },
    { icon: 'bi-megaphone', title: 'Announcements', description: 'View announcements' },
    { icon: 'bi-chat-dots', title: 'Messages', description: 'Communicate with parents' }
];
    } else if (currentUserRole === 'student') {
features = [
    { icon: 'bi-calendar-check', title: 'Attendance', description: 'View attendance records' },
    { icon: 'bi-calendar-week', title: 'Timetable', description: 'View class timetable' },
    { icon: 'bi-clipboard-check', title: 'Marks', description: 'View marks and grades' },
    { icon: 'bi-file-earmark-bar-graph', title: 'Reports', description: 'View progress reports' },
    { icon: 'bi-book', title: 'Library', description: 'Browse and borrow books' },
    { icon: 'bi-megaphone', title: 'Announcements', description: 'View school announcements' },
    { icon: 'bi-chat-dots', title: 'Messages', description: 'Communicate with teachers' },
    { icon: 'bi-bus-front', title: 'Bus Tracking', description: 'Track your school bus' }
];
    }
    
    featuresGrid.innerHTML = features.map((feature, index) => `
<div class="feature-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s" onclick="handleFeatureClick('${feature.title}')">
    <div class="feature-icon" style="background: rgba(255, 107, 53, 0.1); color: var(--amrita-orange);">
        <i class="bi ${feature.icon}"></i>
    </div>
    <h4 class="feature-title">${feature.title}</h4>
    <p class="feature-description">${feature.description}</p>
</div>
    `).join('');
}

// Handle Feature Click
function handleFeatureClick(featureTitle) {
    // Find the corresponding menu item and click it
    const menuItem = Array.from(document.querySelectorAll('.sidebar-menu a')).find(
item => item.textContent.trim() === featureTitle
    );
    
    if (menuItem) {
menuItem.click();
    }
}

// Show Driver Content
function showDriverContent() {
    // Hide all content sections
    document.querySelectorAll('[id$="Content"]').forEach(content => {
content.style.display = 'none';
    });
    
    // Show driver content
    document.getElementById('driverContent').style.display = 'block';
    
    // Initialize driver bus map
    initializeDriverBusMap();
}

// Initialize Driver Bus Map
function initializeDriverBusMap() {
    const driverBusMap = document.getElementById('driverBusMap');
    
    // Initialize map
    driverMap = L.map('driverBusMap').setView([10.9027, 76.9015], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(driverMap);
    
    // Create a custom icon for the bus
    const busIcon = L.divIcon({
html: '<i class="bi bi-bus-front" style="color: var(--amrita-orange); font-size: 24px;"></i>',
iconSize: [30, 30],
className: 'bus-marker-icon'
    });
    
    // Add initial marker
    driverMarker = L.marker([10.9027, 76.9015], { icon: busIcon }).addTo(driverMap);
    driverMarker.bindPopup('Your Bus Location').openPopup();
}

// Toggle Location Sharing
function toggleLocationSharing() {
    const shareLocationBtn = document.getElementById('shareLocationBtn');
    const driverStatus = document.getElementById('driverStatus');
    
    if (locationSharingInterval) {
// Stop location sharing
clearInterval(locationSharingInterval);
locationSharingInterval = null;
shareLocationBtn.textContent = 'Share Location';
shareLocationBtn.classList.remove('btn-danger');
shareLocationBtn.classList.add('btn-primary');
driverStatus.textContent = 'Inactive';
driverStatus.className = 'bus-status-indicator inactive';

// Remove marker
if (driverMarker) {
    driverMap.removeLayer(driverMarker);
}

showToast('Location Sharing', 'Location sharing has been stopped', 'success');
    } else {
// Start location sharing
shareLocationBtn.textContent = 'Stop Sharing';
shareLocationBtn.classList.remove('btn-primary');
shareLocationBtn.classList.add('btn-danger');
driverStatus.textContent = 'Active';
driverStatus.className = 'bus-status-indicator active';

// Update map with live location
updateDriverLocation();
locationSharingInterval = setInterval(updateDriverLocation, 5000);

showToast('Location Sharing', 'Location sharing has been started', 'success');
    }
}

// Update Driver Location
function updateDriverLocation() {
    if (!driverMap || !driverMarker) return;
    
    // Simulate location update
    const locations = [
{ lat: 10.9027, lng: 76.9015, name: 'Ettimadai' },
{ lat: 10.9127, lng: 76.9115, name: 'Ettimadai Main Road' },
{ lat: 10.9227, lng: 76.9215, name: 'Palakkad Road' },
{ lat: 10.9327, lng: 76.9315, name: 'Coimbatore Bypass' },
{ lat: 10.9427, lng: 76.9415, name: 'Coimbatore City' }
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const speed = Math.floor(Math.random() * 20) + 30; // Random speed between 30-50 km/h
    
    // Update marker position
    driverMarker.setLatLng([randomLocation.lat, randomLocation.lng]);
    driverMarker.setPopupContent(`Current Location: ${randomLocation.name}<br>Speed: ${speed} km/h<br>Last updated: ${new Date().toLocaleTimeString()}`).openPopup();
    
    // Update UI elements
    document.getElementById('driverSpeed').textContent = `${speed} km/h`;
    document.getElementById('driverLastUpdate').textContent = new Date().toLocaleTimeString();
    
    // Update students on board
    const studentsOnBoard = document.getElementById('studentsOnBoard');
    if (studentsOnBoard) {
studentsOnBoard.value = Math.floor(Math.random() * 30) + 10;
    }
    
    // Add to location history
    addToDriverLocationHistory(randomLocation.name, speed);
}

// Add to Driver Location History
function addToDriverLocationHistory(locationName, speed) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    driverLocationHistory.unshift({
location: locationName,
speed: speed,
time: timeString
    });
    
    // Keep only the last 5 entries
    if (driverLocationHistory.length > 5) {
driverLocationHistory.pop();
    }
    
    // Update UI
    updateDriverLocationHistoryUI();
}

// Update Driver Location History UI
function updateDriverLocationHistoryUI() {
    const historyContent = document.getElementById('driverLocationHistoryContent');
    
    if (historyContent) {
historyContent.innerHTML = driverLocationHistory.map(entry => `
    <div class="location-history-item">
        <span class="location-name">${entry.location}</span>
        <span class="location-time">${entry.time} (${entry.speed} km/h)</span>
    </div>
`).join('');
    }
}

// Load Bus Tracking Content
function loadBusTrackingContent() {
    const busMapElement = document.getElementById('busMap');
    const busTableBody = document.getElementById('busTableBody');
    const busSelector = document.getElementById('busSelector');
    
    // Initialize map if not already initialized
    if (!busMapElement) return;
    
    if (!busMap || !busMapElement._leaflet_id) {
// Initialize map
busMap = L.map('busMap').setView([10.9027, 76.9015], 12);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(busMap);

// Create a custom icon for the bus
const busIcon = L.divIcon({
    html: '<i class="bi bi-bus-front" style="color: var(--amrita-orange); font-size: 24px;"></i>',
    iconSize: [30, 30],
    className: 'bus-marker-icon'
});

// Add markers for each bus
buses.forEach(bus => {
    const marker = L.marker([bus.currentLocation.lat, bus.currentLocation.lng], { icon: busIcon }).addTo(busMap);
    marker.bindPopup(`
        <strong>Bus ${bus.id}</strong><br>
        Driver: ${bus.driverName}<br>
        Route: ${bus.route}<br>
        Status: ${bus.status}<br>
        Students: ${bus.students}<br>
        Speed: ${bus.speed} km/h
    `);
    
    // Add click event to update info panel
    marker.on('click', () => {
        selectBus(bus.id);
    });
    
    busMarkers.push(marker);
});
    }
    
    // Populate bus selector
    if (busSelector) {
busSelector.innerHTML = '<option value="">Select a bus to view details</option>' + 
    buses.map(bus => `<option value="${bus.id}">Bus ${bus.id} - ${bus.driverName}</option>`).join('');
    }
    
    // Populate bus table
    busTableBody.innerHTML = buses.map(bus => `
<tr>
    <td>${bus.id}</td>
    <td>${bus.driverName}</td>
    <td>${bus.route}</td>
    <td>${bus.status}</td>
    <td>${bus.students}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="selectBus('${bus.id}')">
                <i class="bi bi-eye"></i>
            </button>
            <button class="action-btn message" onclick="messageDriver('${bus.id}')">
                <i class="bi bi-chat-dots"></i>
            </button>
        </div>
    </td>
</tr>
    `).join('');
}

// Select Bus
function selectBus(busId) {
    selectedBusId = busId;
    const bus = buses.find(b => b.id === busId);
    
    if (bus) {
// Update bus details panel
document.getElementById('selectedBusNumber').textContent = bus.id;
document.getElementById('selectedBusDriver').textContent = bus.driverName;
document.getElementById('selectedBusRoute').textContent = bus.route;
document.getElementById('selectedBusStatus').textContent = bus.status;
document.getElementById('selectedBusStatus').className = `bus-status-indicator ${bus.status.toLowerCase()}`;
document.getElementById('selectedBusStudents').textContent = bus.students;
document.getElementById('selectedBusSpeed').textContent = `${bus.speed} km/h`;
document.getElementById('selectedBusLastUpdate').textContent = 'Just now';

// Show students list
const busStudentsList = document.getElementById('busStudentsList');
if (busStudentsList) {
    busStudentsList.style.display = 'block';
    
    // Generate sample students for this bus
    const busStudents = students.filter(s => s.bus === bus.id).slice(0, 5);
    const studentsListContent = document.getElementById('busStudentsListContent');
    
    if (studentsListContent) {
        studentsListContent.innerHTML = busStudents.map(student => `
            <div class="bus-student-item">
                <div class="bus-student-avatar">${student.name.substring(0, 2).toUpperCase()}</div>
                <div>${student.name} (${student.id})</div>
            </div>
        `).join('');
    }
}

// Show location history
const busLocationHistory = document.getElementById('busLocationHistory');
if (busLocationHistory) {
    busLocationHistory.style.display = 'block';
    
    // Generate sample location history
    const locationHistoryContent = document.getElementById('locationHistoryContent');
    if (locationHistoryContent) {
        locationHistoryContent.innerHTML = `
            <div class="location-history-item">
                <span class="location-name">Ettimadai</span>
                <span class="location-time">10:30 AM (40 km/h)</span>
            </div>
            <div class="location-history-item">
                <span class="location-name">Ettimadai Main Road</span>
                <span class="location-time">10:35 AM (45 km/h)</span>
            </div>
            <div class="location-history-item">
                <span class="location-name">Palakkad Road</span>
                <span class="location-time">10:40 AM (35 km/h)</span>
            </div>
        `;
    }
}

// Center map on selected bus
if (busMap && bus.currentLocation) {
    busMap.setView([bus.currentLocation.lat, bus.currentLocation.lng], 14);
}

// Highlight selected bus in table
document.querySelectorAll('#busTableBody tr').forEach(row => {
    row.style.backgroundColor = '';
});

const selectedRow = document.querySelector(`#busTableBody tr:has(td:contains("${busId}"))`);
if (selectedRow) {
    selectedRow.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
}
    }
}

// Track Selected Bus
function trackSelectedBus() {
    if (!selectedBusId) {
showToast('Error', 'Please select a bus to track', 'error');
return;
    }
    
    const bus = buses.find(b => b.id === selectedBusId);
    if (bus && busMap) {
// Center map on bus
busMap.setView([bus.currentLocation.lat, bus.currentLocation.lng], 15);

// Open popup for the bus marker
const marker = busMarkers.find(m => {
    // This is a simplified check - in a real app, you'd have a better way to find the marker
    return true;
});

if (marker) {
    marker.openPopup();
}

showToast('Bus Tracking', `Now tracking Bus ${bus.id}`, 'success');
    }
}

// Message Driver
function messageDriver(busId) {
    const bus = buses.find(b => b.id === busId || b === busId);
    if (bus) {
showToast('Message Driver', `Opening message interface for ${typeof bus === 'object' ? bus.driverName : 'driver'}`, 'success');
// Open message modal here if needed
showComposeMessageModal();
    }
}

// Refresh Bus Locations
function refreshBusLocations() {
    // Simulate location updates
    buses.forEach(bus => {
// Randomly update location slightly
bus.currentLocation.lat += (Math.random() - 0.5) * 0.01;
bus.currentLocation.lng += (Math.random() - 0.5) * 0.01;
bus.speed = Math.floor(Math.random() * 20) + 30; // Random speed between 30-50 km/h
    });
    
    // Update map markers
    busMarkers.forEach((marker, index) => {
if (buses[index]) {
    marker.setLatLng([buses[index].currentLocation.lat, buses[index].currentLocation.lng]);
    
    // Update popup content
    marker.setPopupContent(`
        <strong>Bus ${buses[index].id}</strong><br>
        Driver: ${buses[index].driverName}<br>
        Route: ${buses[index].route}<br>
        Status: ${buses[index].status}<br>
        Students: ${buses[index].students}<br>
        Speed: ${buses[index].speed} km/h
    `);
}
    });
    
    // Update table
    loadBusTrackingContent();
    
    // Update selected bus details if one is selected
    if (selectedBusId) {
selectBus(selectedBusId);
    }
    
    showToast('Bus Locations', 'Bus locations refreshed', 'success');
}

// Load Library Content
function loadLibraryContent() {
    // Check if user has permission to modify library
    const canModifyLibrary = currentUserRole === 'admin' || currentUserRole === 'teacher';
    
    // Update library stats
    document.getElementById('totalBooks').textContent = books.length;
    document.getElementById('availableBooks').textContent = books.filter(b => b.available > 0).length;
    document.getElementById('issuedBooks').textContent = books.filter(b => b.available < b.quantity).length;
    document.getElementById('overdueBooks').textContent = Math.floor(Math.random() * 10) + 5;
    
    // Load books grid
    loadAllBooks();
    
    // Load issued books table
    loadIssuedBooks();
    
    // Load overdue books table
    loadOverdueBooks();
    
    // Show/hide add book button based on permissions
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookTabBtn = document.getElementById('addBookTabBtn');
    
    if (addBookBtn) {
addBookBtn.style.display = canModifyLibrary ? 'block' : 'none';
    }
    
    if (addBookTabBtn) {
addBookTabBtn.style.display = canModifyLibrary ? 'block' : 'none';
    }
    
    // Disable form inputs if user can't modify
    const bookInputs = document.querySelectorAll('#addBookForm input, #addBookForm select, #addBookForm textarea');
    bookInputs.forEach(input => {
input.disabled = !canModifyLibrary;
    });
}

// Load All Books
function loadAllBooks() {
    const allBooksGrid = document.getElementById('allBooksGrid');
    
    allBooksGrid.innerHTML = books.map(book => `
<div class="book-card animate__animated animate__fadeInUp" onclick="viewBook('${book.id}')">
    <div class="book-actions">
        ${book.available > 0 ? 
            `<button class="book-action-btn issue" onclick="event.stopPropagation(); issueBook('${book.id}')" title="Issue Book">
                <i class="bi bi-book"></i>
            </button>` : 
            `<button class="book-action-btn return" onclick="event.stopPropagation(); returnBook('${book.id}')" title="Return Book">
                <i class="bi bi-arrow-return-left"></i>
            </button>`
        }
        ${currentUserRole === 'admin' || currentUserRole === 'teacher' ? 
            `<button class="book-action-btn edit" onclick="event.stopPropagation(); editBook('${book.id}')" title="Edit Book">
                <i class="bi bi-pencil"></i>
            </button>` : ''
        }
    </div>
    <div class="book-cover">
        <i class="bi bi-book"></i>
    </div>
    <div class="book-details">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
        <div class="book-status ${book.available > 0 ? 'available' : 'issued'}">
            ${book.available > 0 ? `Available (${book.available})` : 'Issued'}
        </div>
    </div>
</div>
    `).join('');
}

// Load Issued Books
function loadIssuedBooks() {
    const issuedBooksTableBody = document.getElementById('issuedBooksTableBody');
    
    // Sample issued books data
    const issuedBooks = [
{ bookId: 'B001', title: 'Mathematics for Class 5', author: 'R.D. Sharma', issuedTo: 'Alice Smith (AV001)', issueDate: '2024-10-15', dueDate: '2024-11-15' },
{ bookId: 'B003', title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', issuedTo: 'Bob Johnson (AV002)', issueDate: '2024-10-20', dueDate: '2024-11-20' }
    ];
    
    issuedBooksTableBody.innerHTML = issuedBooks.map(book => `
<tr>
    <td>${book.bookId}</td>
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.issuedTo}</td>
    <td>${formatDate(book.issueDate)}</td>
    <td>${formatDate(book.dueDate)}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewIssuedBook('${book.bookId}')">
                <i class="bi bi-eye"></i>
            </button>
            <button class="action-btn edit" onclick="returnBook('${book.bookId}')" ${currentUserRole !== 'admin' && currentUserRole !== 'teacher' ? 'disabled' : ''}>
                <i class="bi bi-arrow-return-left"></i>
            </button>
        </div>
    </td>
</tr>
    `).join('');
}

// Load Overdue Books
function loadOverdueBooks() {
    const overdueBooksTableBody = document.getElementById('overdueBooksTableBody');
    
    // Sample overdue books data
    const overdueBooks = [
{ bookId: 'B002', title: 'Science for Class 5', author: 'Lakhmir Singh', issuedTo: 'Carol Williams (AV003)', issueDate: '2024-09-15', dueDate: '2024-10-15', fine: 50 }
    ];
    
    overdueBooksTableBody.innerHTML = overdueBooks.map(book => `
<tr>
    <td>${book.bookId}</td>
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.issuedTo}</td>
    <td>${formatDate(book.issueDate)}</td>
    <td>${formatDate(book.dueDate)}</td>
    <td>₹${book.fine}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewOverdueBook('${book.bookId}')">
                <i class="bi bi-eye"></i>
            </button>
            <button class="action-btn edit" onclick="returnBook('${book.bookId}')" ${currentUserRole !== 'admin' && currentUserRole !== 'teacher' ? 'disabled' : ''}>
                <i class="bi bi-arrow-return-left"></i>
            </button>
        </div>
    </td>
</tr>
    `).join('');
}

// Filter Books
function filterBooks(searchTerm) {
    const filteredBooks = books.filter(book => 
book.title.toLowerCase().includes(searchTerm) ||
book.author.toLowerCase().includes(searchTerm) ||
book.isbn.includes(searchTerm)
    );
    
    const allBooksGrid = document.getElementById('allBooksGrid');
    
    if (filteredBooks.length === 0) {
allBooksGrid.innerHTML = '<div class="text-center p-4">No books found matching your search.</div>';
    } else {
allBooksGrid.innerHTML = filteredBooks.map(book => `
    <div class="book-card animate__animated animate__fadeInUp" onclick="viewBook('${book.id}')">
        <div class="book-actions">
            ${book.available > 0 ? 
                `<button class="book-action-btn issue" onclick="event.stopPropagation(); issueBook('${book.id}')" title="Issue Book">
                    <i class="bi bi-book"></i>
                </button>` : 
                `<button class="book-action-btn return" onclick="event.stopPropagation(); returnBook('${book.id}')" title="Return Book">
                    <i class="bi bi-arrow-return-left"></i>
                </button>`
            }
            ${currentUserRole === 'admin' || currentUserRole === 'teacher' ? 
                `<button class="book-action-btn edit" onclick="event.stopPropagation(); editBook('${book.id}')" title="Edit Book">
                    <i class="bi bi-pencil"></i>
                </button>` : ''
            }
        </div>
        <div class="book-cover">
            <i class="bi bi-book"></i>
        </div>
        <div class="book-details">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-status ${book.available > 0 ? 'available' : 'issued'}">
                ${book.available > 0 ? `Available (${book.available})` : 'Issued'}
            </div>
        </div>
    </div>
`).join('');
    }
}

// Filter Books By Category
function filterBooksByCategory(category) {
    let filteredBooks = books;
    
    if (category !== 'all') {
filteredBooks = books.filter(book => book.category === category);
    }
    
    const allBooksGrid = document.getElementById('allBooksGrid');
    
    if (filteredBooks.length === 0) {
allBooksGrid.innerHTML = '<div class="text-center p-4">No books found in this category.</div>';
    } else {
allBooksGrid.innerHTML = filteredBooks.map(book => `
    <div class="book-card animate__animated animate__fadeInUp" onclick="viewBook('${book.id}')">
        <div class="book-actions">
            ${book.available > 0 ? 
                `<button class="book-action-btn issue" onclick="event.stopPropagation(); issueBook('${book.id}')" title="Issue Book">
                    <i class="bi bi-book"></i>
                </button>` : 
                `<button class="book-action-btn return" onclick="event.stopPropagation(); returnBook('${book.id}')" title="Return Book">
                    <i class="bi bi-arrow-return-left"></i>
                </button>`
            }
            ${currentUserRole === 'admin' || currentUserRole === 'teacher' ? 
                `<button class="book-action-btn edit" onclick="event.stopPropagation(); editBook('${book.id}')" title="Edit Book">
                    <i class="bi bi-pencil"></i>
                </button>` : ''
            }
        </div>
        <div class="book-cover">
            <i class="bi bi-book"></i>
        </div>
        <div class="book-details">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-status ${book.available > 0 ? 'available' : 'issued'}">
                ${book.available > 0 ? `Available (${book.available})` : 'Issued'}
            </div>
        </div>
    </div>
`).join('');
    }
}

// Issue Book
function issueBook(bookId) {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to issue books', 'error');
return;
    }
    
    const book = books.find(b => b.id === bookId);
    if (book && book.available > 0) {
book.available--;
loadAllBooks();
showToast('Success', 'Book issued successfully', 'success');
    } else {
showToast('Error', 'Book is not available', 'error');
    }
}

// Edit Book
function editBook(bookId) {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to edit books', 'error');
return;
    }
    
    const book = books.find(b => b.id === bookId);
    if (book) {
// Pre-fill the form with book details
document.getElementById('bookTitle').value = book.title;
document.getElementById('bookAuthor').value = book.author;
document.getElementById('bookISBN').value = book.isbn;
document.getElementById('bookCategory').value = book.category;
document.getElementById('bookPublisher').value = book.publisher;
document.getElementById('bookYear').value = book.year;
document.getElementById('bookQuantity').value = book.quantity;
document.getElementById('bookLocation').value = book.location;
document.getElementById('bookDescription').value = book.description;

// Show the modal
showAddBookModal();

// Change the modal title and button text
document.querySelector('#addBookModal .modal-title').textContent = 'Edit Book';
document.querySelector('#addBookModal .modal-footer .btn-primary').textContent = 'Update Book';

// Change the form submission function
document.getElementById('addBookForm').onsubmit = function(e) {
    e.preventDefault();
    updateBook(bookId);
};
    }
}

// Update Book
function updateBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
// Update book details
book.title = document.getElementById('bookTitle').value;
book.author = document.getElementById('bookAuthor').value;
book.isbn = document.getElementById('bookISBN').value;
book.category = document.getElementById('bookCategory').value;
book.publisher = document.getElementById('bookPublisher').value;
book.year = document.getElementById('bookYear').value;
book.quantity = parseInt(document.getElementById('bookQuantity').value);
book.location = document.getElementById('bookLocation').value;
book.description = document.getElementById('bookDescription').value;

// Refresh books grid
loadAllBooks();

// Close modal
closeModal('addBookModal');

// Reset modal title and button
document.querySelector('#addBookModal .modal-title').textContent = 'Add New Book';
document.querySelector('#addBookModal .modal-footer .btn-primary').textContent = 'Add Book';

// Reset form submission function
document.getElementById('addBookForm').onsubmit = function(e) {
    e.preventDefault();
    addBook();
};

// Show success message
showToast('Success', 'Book updated successfully', 'success');
    }
}

// Add Book
function addBook() {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to add books', 'error');
return;
    }
    
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const isbn = document.getElementById('bookISBN').value;
    const category = document.getElementById('bookCategory').value;
    const publisher = document.getElementById('bookPublisher').value;
    const year = document.getElementById('bookYear').value;
    const quantity = document.getElementById('bookQuantity').value;
    const location = document.getElementById('bookLocation').value;
    const description = document.getElementById('bookDescription').value;
    
    // Validate required fields
    if (!title || !author || !quantity) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // Generate book ID
    const bookId = 'B' + String(books.length + 1).padStart(3, '0');
    
    // Create new book object
    const newBook = {
id: bookId,
title: title,
author: author,
isbn: isbn,
category: category,
publisher: publisher,
year: year,
quantity: parseInt(quantity),
available: parseInt(quantity),
location: location,
description: description
    };
    
    // Add to books array
    books.push(newBook);
    
    // Refresh books grid
    loadAllBooks();
    
    // Update library stats
    loadLibraryContent();
    
    // Close modal
    closeModal('addBookModal');
    
    // Show success message
    showToast('Success', 'Book added successfully', 'success');
}

// View Book
function viewBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
showToast('Book Details', `Viewing details for ${book.title}`, 'success');
    }
}

// View Issued Book
function viewIssuedBook(bookId) {
    showToast('Issued Book Details', `Viewing details for book ${bookId}`, 'success');
}

// View Overdue Book
function viewOverdueBook(bookId) {
    showToast('Overdue Book Details', `Viewing details for book ${bookId}`, 'success');
}

// Return Book
function returnBook(bookId) {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to return books', 'error');
return;
    }
    
    const book = books.find(b => b.id === bookId);
    if (book) {
book.available++;
loadAllBooks();
loadIssuedBooks();
loadOverdueBooks();
showToast('Success', 'Book returned successfully', 'success');
    }
}

// Export Data
function exportData() {
    // Create a simple CSV export for demonstration
    const csvContent = "data:text/csv;charset=utf-8," 
+ "ID,Name,Class,Section,Parent Phone,Parent Email,Bus\n"
+ students.map(s => `${s.id},${s.name},${s.class},${s.section},${s.parentPhone},${s.parentEmail},${s.bus}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Export Successful', 'Student data exported to CSV', 'success');
}

// Load Students Content
function loadStudentsContent() {
    const studentsTableBody = document.getElementById('studentsTableBody');
    const lkg10TableBody = document.getElementById('lkg10TableBody');
    const class11_12TableBody = document.getElementById('class11_12TableBody');
    
    // Filter students based on user role
    let filteredStudents = students;
    
    if (currentUserRole === 'teacher') {
// Get teacher's assigned class
const teacher = teachers.find(t => t.email === currentUser.email);
if (teacher && teacher.classTeacher) {
    const [teacherClass, teacherSection] = teacher.classTeacher.split('-');
    
    // If teacher is a class head, show all students in the class
    if (teacher.isClassHead) {
        filteredStudents = students.filter(s => s.class === teacherClass);
    } else {
        // Otherwise, show only students in the teacher's section
        filteredStudents = students.filter(s => s.class === teacherClass && s.section === teacherSection);
    }
}
    }
    
    // All students
    studentsTableBody.innerHTML = filteredStudents.map(student => `
<tr>
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.class}</td>
    <td>${student.section}</td>
    <td>${student.parentPhone}</td>
    <td>${student.bus}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewStudent('${student.id}')">
                <i class="bi bi-eye"></i>
            </button>
            ${currentUserRole === 'admin' || (currentUserRole === 'teacher' && canEditStudent(student)) ? 
                `<button class="action-btn edit" onclick="editStudent('${student.id}')">
                    <i class="bi bi-pencil"></i>
                </button>` : ''
            }
            ${currentUserRole === 'admin' ? 
                `<button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                    <i class="bi bi-trash"></i>
                </button>` : ''
            }
        </div>
    </td>
</tr>
    `).join('');
    
    // LKG-10 students
    const lkg10Students = filteredStudents.filter(s => parseInt(s.class) <= 10);
    lkg10TableBody.innerHTML = lkg10Students.map(student => `
<tr>
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.class}</td>
    <td>${student.section}</td>
    <td>${student.parentPhone}</td>
    <td>${student.bus}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewStudent('${student.id}')">
                <i class="bi bi-eye"></i>
            </button>
            ${currentUserRole === 'admin' || (currentUserRole === 'teacher' && canEditStudent(student)) ? 
                `<button class="action-btn edit" onclick="editStudent('${student.id}')">
                    <i class="bi bi-pencil"></i>
                </button>` : ''
            }
            ${currentUserRole === 'admin' ? 
                `<button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                    <i class="bi bi-trash"></i>
                </button>` : ''
            }
        </div>
    </td>
</tr>
    `).join('');
    
    // Class 11-12 students
    const class11_12Students = filteredStudents.filter(s => parseInt(s.class) >= 11);
    class11_12TableBody.innerHTML = class11_12Students.map(student => `
<tr>
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.class}</td>
    <td>${student.section}</td>
    <td>${student.studentPhone || '-'}</td>
    <td>${student.parentPhone}</td>
    <td>${student.bus}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewStudent('${student.id}')">
                <i class="bi bi-eye"></i>
            </button>
            ${currentUserRole === 'admin' || (currentUserRole === 'teacher' && canEditStudent(student)) ? 
                `<button class="action-btn edit" onclick="editStudent('${student.id}')">
                    <i class="bi bi-pencil"></i>
                </button>` : ''
            }
            ${currentUserRole === 'admin' ? 
                `<button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                    <i class="bi bi-trash"></i>
                </button>` : ''
            }
        </div>
    </td>
</tr>
    `).join('');
}

// Check if teacher can edit student
function canEditStudent(student) {
    if (currentUserRole !== 'teacher') return false;
    
    const teacher = teachers.find(t => t.email === currentUser.email);
    if (!teacher || !teacher.classTeacher) return false;
    
    const [teacherClass, teacherSection] = teacher.classTeacher.split('-');
    
    // If teacher is a class head, can edit all students in the class
    if (teacher.isClassHead) {
return student.class === teacherClass;
    } else {
// Otherwise, can only edit students in the teacher's section
return student.class === teacherClass && student.section === teacherSection;
    }
}

// Load Teachers Content
function loadTeachersContent() {
    const teachersTableBody = document.getElementById('teachersTableBody');
    
    teachersTableBody.innerHTML = teachers.map(teacher => `
<tr>
    <td>${teacher.id}</td>
    <td>${teacher.name}</td>
    <td>${teacher.subject}</td>
    <td>${teacher.classTeacher}</td>
    <td>${teacher.phone}</td>
    <td>${teacher.email}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewTeacher('${teacher.id}')">
                <i class="bi bi-eye"></i>
            </button>
            ${currentUserRole === 'admin' ? 
                `<button class="action-btn edit" onclick="editTeacher('${teacher.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTeacher('${teacher.id}')">
                    <i class="bi bi-trash"></i>
                </button>` : ''
            }
        </div>
    </td>
</tr>
    `).join('');
}

// Load Classes Content
function loadClassesContent() {
    const classesTableBody = document.getElementById('classesTableBody');
    
    classesTableBody.innerHTML = classes.map(cls => `
<tr>
    <td>${cls.class}</td>
    <td>${cls.section}</td>
    <td>${cls.classTeacher}</td>
    <td>${cls.studentsCount}</td>
    <td>${cls.classHead}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn view" onclick="viewClass('${cls.class}-${cls.section}')">
                <i class="bi bi-eye"></i>
            </button>
            ${currentUserRole === 'admin' ? 
                `<button class="action-btn edit" onclick="editClass('${cls.class}-${cls.section}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete" onclick="deleteClass('${cls.class}-${cls.section}')">
                    <i class="bi bi-trash"></i>
                </button>` : ''
            }
        </div>
    </td>
</tr>
    `).join('');
}

// Load Attendance Content
function loadAttendanceContent() {
    const attendanceClassSelect = document.getElementById('attendanceClassSelect');
    const reportClassSelect = document.getElementById('reportClassSelect');
    
    // Populate class selects
    const classOptions = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    
    attendanceClassSelect.innerHTML = '<option value="">Select Class</option>' + 
classOptions.map(cls => `<option value="${cls}">${cls === 'LKG' || cls === 'UKG' ? cls : 'Class ' + cls}</option>`).join('');
    
    reportClassSelect.innerHTML = '<option value="">Select Class</option>' + 
classOptions.map(cls => `<option value="${cls}">${cls === 'LKG' || cls === 'UKG' ? cls : 'Class ' + cls}</option>`).join('');
}

// Load Timetable Content
function loadTimetableContent() {
    const timetableClassSelect = document.getElementById('timetableClassSelect');
    
    // Populate class select
    const classOptions = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    
    timetableClassSelect.innerHTML = '<option value="">Select Class</option>' + 
classOptions.map(cls => `<option value="${cls}">${cls === 'LKG' || cls === 'UKG' ? cls : 'Class ' + cls}</option>`).join('');
}

// Load Marks Content
function loadMarksContent() {
    const marksClassSelect = document.getElementById('marksClassSelect');
    
    // Populate class select
    const classOptions = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    
    marksClassSelect.innerHTML = '<option value="">Select Class</option>' + 
classOptions.map(cls => `<option value="${cls}">${cls === 'LKG' || cls === 'UKG' ? cls : 'Class ' + cls}</option>`).join('');
}

// Load Reports Content
function loadReportsContent() {
    const reportClassSelect = document.getElementById('reportClassSelect');
    
    // Populate class select
    const classOptions = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    
    reportClassSelect.innerHTML = '<option value="">Select Class</option>' + 
classOptions.map(cls => `<option value="${cls}">${cls === 'LKG' || cls === 'UKG' ? cls : 'Class ' + cls}</option>`).join('');
}

// Load Messages Content
function loadMessagesContent() {
    // Messages content is already in HTML
}

// Load Announcements Content
function loadAnnouncementsContent() {
    // This would load the full announcements page
    // For now, we'll just show a message
    showToast('Announcements', 'Full announcements page would be loaded here', 'success');
}

// Show Add Student Modal
function showAddStudentModal() {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to add students', 'error');
return;
    }
    
    // If teacher, pre-select their class
    if (currentUserRole === 'teacher') {
const teacher = teachers.find(t => t.email === currentUser.email);
if (teacher && teacher.classTeacher) {
    const [teacherClass, teacherSection] = teacher.classTeacher.split('-');
    document.getElementById('studentClass').value = teacherClass;
    document.getElementById('studentSection').value = teacherSection;
    
    // Trigger change event to update form
    document.getElementById('studentClass').dispatchEvent(new Event('change'));
}
    }
    
    document.getElementById('addStudentModal').classList.add('active');
}

// Show Add Teacher Modal
function showAddTeacherModal() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add teachers', 'error');
return;
    }
    
    document.getElementById('addTeacherModal').classList.add('active');
}

// Show Add Class Modal
function showAddClassModal() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add classes', 'error');
return;
    }
    
    document.getElementById('addClassModal').classList.add('active');
}

// Show Add Announcement Modal
function showAddAnnouncementModal() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add announcements', 'error');
return;
    }
    
    document.getElementById('addAnnouncementModal').classList.add('active');
}

// Show Compose Message Modal
function showComposeMessageModal() {
    document.getElementById('composeMessageModal').classList.add('active');
}

// Show Add Book Modal
function showAddBookModal() {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to add books', 'error');
return;
    }
    
    document.getElementById('addBookModal').classList.add('active');
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Add Student
function addStudent() {
    // Check if user has permission
    if (currentUserRole !== 'admin' && currentUserRole !== 'teacher') {
showToast('Permission Denied', 'You do not have permission to add students', 'error');
return;
    }
    
    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    const studentSection = document.getElementById('studentSection').value;
    const studentDOB = document.getElementById('studentDOB').value;
    const studentGender = document.getElementById('studentGender').value;
    const parentName = document.getElementById('parentName').value;
    const parentPhone = document.getElementById('parentPhone').value;
    const parentEmail = document.getElementById('parentEmail').value;
    const studentPhone = document.getElementById('studentPhone').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const studentAddress = document.getElementById('studentAddress').value;
    
    // Get selected bus
    const selectedBusOption = document.querySelector('.bus-option.selected');
    let bus = 'Local';
    
    if (selectedBusOption) {
const busType = selectedBusOption.dataset.bus;
if (busType !== 'local') {
    bus = document.getElementById('busNumber').value || 'Not Assigned';
}
    }
    
    // Validate required fields
    if (!studentName || !studentClass || !studentSection || !parentName || !parentPhone || !parentEmail) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // If teacher, check if they can add to this class
    if (currentUserRole === 'teacher') {
const teacher = teachers.find(t => t.email === currentUser.email);
if (teacher && teacher.classTeacher) {
    const [teacherClass, teacherSection] = teacher.classTeacher.split('-');
    
    // If teacher is a class head, can add to any section in the class
    if (!teacher.isClassHead && (studentClass !== teacherClass || studentSection !== teacherSection)) {
        showToast('Permission Denied', 'You can only add students to your assigned class section', 'error');
        return;
    }
    
    // If teacher is not a class head, can only add to their specific section
    if (!teacher.isClassHead && (studentClass !== teacherClass || studentSection !== teacherSection)) {
        showToast('Permission Denied', 'You can only add students to your assigned class section', 'error');
        return;
    }
}
    }
    
    // Generate student ID
    const studentId = 'AV' + String(students.length + 1).padStart(3, '0');
    
    // Create new student object
    const newStudent = {
id: studentId,
name: studentName,
class: studentClass,
section: studentSection,
dob: studentDOB,
gender: studentGender,
parentName: parentName,
parentPhone: parentPhone,
parentEmail: parentEmail,
studentPhone: studentPhone,
studentEmail: studentEmail,
address: studentAddress,
bus: bus
    };
    
    // Add to students array
    students.push(newStudent);
    
    // Refresh students table
    loadStudentsContent();
    
    // Close modal
    closeModal('addStudentModal');
    
    // Show success message
    showToast('Success', 'Student added successfully', 'success');
}

// Add Teacher
function addTeacher() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add teachers', 'error');
return;
    }
    
    const teacherName = document.getElementById('teacherName').value;
    const teacherSubject = document.getElementById('teacherSubject').value;
    const classTeacher = document.getElementById('classTeacher').value;
    const teacherPhone = document.getElementById('teacherPhone').value;
    const teacherEmail = document.getElementById('teacherEmail').value;
    const teacherAddress = document.getElementById('teacherAddress').value;
    
    // Validate required fields
    if (!teacherName || !teacherSubject || !teacherPhone || !teacherEmail) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // Generate teacher ID
    const teacherId = 'T' + String(teachers.length + 1).padStart(3, '0');
    
    // Create new teacher object
    const newTeacher = {
id: teacherId,
name: teacherName,
subject: teacherSubject,
classTeacher: classTeacher,
phone: teacherPhone,
email: teacherEmail,
address: teacherAddress,
isClassHead: false
    };
    
    // Add to teachers array
    teachers.push(newTeacher);
    
    // Refresh teachers table
    loadTeachersContent();
    
    // Close modal
    closeModal('addTeacherModal');
    
    // Show success message
    showToast('Success', 'Teacher added successfully', 'success');
}

// Add Class
function addClass() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add classes', 'error');
return;
    }
    
    const newClass = document.getElementById('newClass').value;
    const newSection = document.getElementById('newSection').value;
    const classHead = document.getElementById('classHead').value;
    const newClassTeacher = document.getElementById('newClassTeacher').value;
    const roomNumber = document.getElementById('roomNumber').value;
    
    // Validate required fields
    if (!newClass || !newSection || !classHead) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // Create new class object
    const newClassObj = {
class: newClass,
section: newSection,
classTeacher: newClassTeacher,
studentsCount: 0,
classHead: classHead,
roomNumber: roomNumber
    };
    
    // Add to classes array
    classes.push(newClassObj);
    
    // Refresh classes table
    loadClassesContent();
    
    // Close modal
    closeModal('addClassModal');
    
    // Show success message
    showToast('Success', 'Class added successfully', 'success');
}

// Add Announcement
function addAnnouncement() {
    // Check if user has permission
    if (currentUserRole !== 'admin') {
showToast('Permission Denied', 'You do not have permission to add announcements', 'error');
return;
    }
    
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const target = document.getElementById('announcementTarget').value;
    const announcementClass = document.getElementById('announcementClass').value;
    const priority = document.getElementById('announcementPriority').value;
    
    // Validate required fields
    if (!title || !content) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // Create new announcement object
    const newAnnouncement = {
id: announcements.length + 1,
title: title,
content: content,
date: new Date().toISOString().split('T')[0],
target: target,
class: announcementClass,
priority: priority
    };
    
    // Add to announcements array
    announcements.push(newAnnouncement);
    
    // Refresh announcements
    generateAnnouncements();
    
    // Close modal
    closeModal('addAnnouncementModal');
    
    // Show success message
    showToast('Success', 'Announcement added successfully', 'success');
}

// Send Message
function sendMessage() {
    const to = document.getElementById('messageTo').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    const sendSMS = document.getElementById('sendSMS').checked;
    const sendEmail = document.getElementById('sendEmail').checked;
    const sendWhatsApp = document.getElementById('sendWhatsApp').checked;
    
    // Validate required fields
    if (!to || !subject || !content) {
showToast('Error', 'Please fill all required fields', 'error');
return;
    }
    
    // Validate at least one send method is selected
    if (!sendSMS && !sendEmail && !sendWhatsApp) {
showToast('Error', 'Please select at least one send method', 'error');
return;
    }
    
    // Create message object
    const newMessage = {
id: messages.length + 1,
from: currentUser.name,
to: to,
subject: subject,
content: content,
date: new Date(),
sendSMS: sendSMS,
sendEmail: sendEmail,
sendWhatsApp: sendWhatsApp
    };
    
    // Add to messages array
    messages.push(newMessage);
    
    // In a real application, this would send the message
    console.log('Sending message:', newMessage);
    
    // Close modal
    closeModal('composeMessageModal');
    
    // Show success message
    showToast('Success', 'Message sent successfully', 'success');
}

// View Student
function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
showToast('Student Details', `Viewing details for ${student.name}`, 'success');
    }
}

// Edit Student
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
showToast('Edit Student', `Editing details for ${student.name}`, 'success');
    }
}

// Delete Student
function deleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
if (confirm(`Are you sure you want to delete ${student.name}?`)) {
    students = students.filter(s => s.id !== studentId);
    loadStudentsContent();
    showToast('Success', 'Student deleted successfully', 'success');
}
    }
}

// View Teacher
function viewTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
showToast('Teacher Details', `Viewing details for ${teacher.name}`, 'success');
    }
}

// Edit Teacher
function editTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
showToast('Edit Teacher', `Editing details for ${teacher.name}`, 'success');
    }
}

// Delete Teacher
function deleteTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
if (confirm(`Are you sure you want to delete ${teacher.name}?`)) {
    teachers = teachers.filter(t => t.id !== teacherId);
    loadTeachersContent();
    showToast('Success', 'Teacher deleted successfully', 'success');
}
    }
}

// View Class
function viewClass(classId) {
    showToast('Class Details', `Viewing details for ${classId}`, 'success');
}

// Edit Class
function editClass(classId) {
    showToast('Edit Class', `Editing details for ${classId}`, 'success');
}

// Delete Class
function deleteClass(classId) {
    if (confirm(`Are you sure you want to delete ${classId}?`)) {
classes = classes.filter(c => `${c.class}-${c.section}` !== classId);
loadClassesContent();
showToast('Success', 'Class deleted successfully', 'success');
    }
}

// View Bus
function viewBus(busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
showToast('Bus Details', `Viewing details for bus ${busId}`, 'success');
    }
}

// Update Time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
hour: '2-digit', 
minute: '2-digit',
hour12: true 
    });
    
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
currentTimeElement.textContent = timeString;
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
year: 'numeric', 
month: 'short', 
day: 'numeric' 
    });
}

// Show Toast
function showToast(title, message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastIcon = toastElement.querySelector('.toast-icon');
    const toastTitle = toastElement.querySelector('.toast-title');
    const toastMessage = toastElement.querySelector('.toast-message');
    
    // Update toast content
    toastIcon.className = `toast-icon ${type}`;
    toastIcon.innerHTML = type === 'success' ? '<i class="bi bi-check-lg"></i>' : '<i class="bi bi-x-lg"></i>';
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Show toast
    toastElement.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
hideToast();
    }, 3000);
}

// Hide Toast
function hideToast() {
    document.getElementById('toast').classList.remove('show');
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    showToast('Error', 'An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('Error', 'An unexpected error occurred', 'error');
});
