/* ========================================
   SMART STUDENT PRODUCTIVITY PWA
   Production-Ready JavaScript - Complete Enhanced Version
   With Advanced Notification System
   ======================================== */

// ========================================
// STORAGE & DATA MANAGEMENT
// ========================================

/**
 * Storage class: Manages all localStorage operations with error handling
 * Provides abstraction layer for data persistence
 */
class StorageManager {
    constructor() {
        this.prefix = 'smartstudent_';
    }

    /**
     * Save data to localStorage with JSON serialization
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('❌ Storage error:', error);
            showToast('خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    /**
     * Retrieve data from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Retrieved value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('❌ Storage error:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('❌ Storage error:', error);
            return false;
        }
    }

    /**
     * Clear all app data from localStorage
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('❌ Storage error:', error);
        }
    }
}

// ========================================
// TASK MANAGEMENT
// ========================================

/**
 * Task Manager: Handles all task operations (CRUD)
 * Manages task state, filtering, and persistence
 */
class TaskManager {
    constructor(storage) {
        this.storage = storage;
        this.tasks = this.storage.get('tasks', []);
    }

    /**
     * Add new task to the system
     * @param {string} title - Task title
     * @param {string} date - Task date (YYYY-MM-DD)
     * @returns {object} Created task object
     */
    addTask(title, date) {
        const task = {
            id: Date.now(),
            title,
            date,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.save();
        console.log('✅ Task added:', title);
        return task;
    }

    /**
     * Delete task permanently or soft-delete to trash
     * @param {number} id - Task ID
     * @param {boolean} softDelete - Whether to move to trash
     */
    deleteTask(id, softDelete = true) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return false;

        if (softDelete) {
            trash.addItem(task, 'task');
        }

        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        console.log('✅ Task deleted:', task.title);
        return true;
    }

    /**
     * Toggle task completion status
     * @param {number} id - Task ID
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            if (task.completed) {
                showNotification('تم إكمال المهمة ✅', 'تم إكمال: ' + task.title);
                showToast('✅ تم إكمال المهمة بنجاح', 'success');
            }
            return true;
        }
        return false;
    }

    /**
     * Get tasks by filter criteria
     * @param {string} filter - Filter type: 'all', 'pending', 'completed'
     * @returns {array} Filtered tasks array
     */
    getFilteredTasks(filter = 'all') {
        switch (filter) {
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * Get today's tasks
     * @returns {array} Tasks for today
     */
    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.tasks.filter(t => t.date === today && !t.completed);
    }

    /**
     * Get task count
     * @returns {number} Total tasks count
     */
    getCount() {
        return this.tasks.length;
    }

    /**
     * Get completed tasks count
     * @returns {number} Completed tasks count
     */
    getCompletedCount() {
        return this.tasks.filter(t => t.completed).length;
    }

    /**
     * Save tasks to storage
     */
    save() {
        this.storage.set('tasks', this.tasks);
    }
}

// ========================================
// EVENT MANAGEMENT
// ========================================

/**
 * Event Manager: Handles academic events
 * Stores and manages events with categories
 */
class EventManager {
    constructor(storage) {
        this.storage = storage;
        this.events = this.storage.get('events', []);
    }

    /**
     * Add new event
     * @param {string} title - Event title
     * @param {string} date - Event date
     * @param {string} time - Event time
     * @param {string} category - Event category
     * @returns {object} Created event
     */
    addEvent(title, date, time, category) {
        const event = {
            id: Date.now(),
            title,
            date,
            time,
            category,
            createdAt: new Date().toISOString()
        };
        this.events.push(event);
        this.save();
        console.log('✅ Event added:', title);
        return event;
    }

    /**
     * Delete event
     * @param {number} id - Event ID
     * @param {boolean} softDelete - Whether to move to trash
     */
    deleteEvent(id, softDelete = true) {
        const event = this.events.find(e => e.id === id);
        if (!event) return false;

        if (softDelete) {
            trash.addItem(event, 'event');
        }

        this.events = this.events.filter(e => e.id !== id);
        this.save();
        console.log('✅ Event deleted:', event.title);
        return true;
    }

    /**
     * Get events by specific date
     * @param {string} date - Filter date
     * @returns {array} Events on that date
     */
    getEventsByDate(date) {
        return this.events.filter(e => e.date === date);
    }

    /**
     * Get all events
     * @returns {array} All events
     */
    getAllEvents() {
        return this.events.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
        });
    }

    /**
     * Get event count
     * @returns {number} Total events count
     */
    getCount() {
        return this.events.length;
    }

    /**
     * Save events to storage
     */
    save() {
        this.storage.set('events', this.events);
    }
}

// ========================================
// SUBJECT TRACKING
// ========================================

/**
 * Subject Manager: Tracks academic subjects and progress
 * Manages lessons and completion percentage
 */
class SubjectManager {
    constructor(storage) {
        this.storage = storage;
        this.subjects = this.storage.get('subjects', []);
    }

    /**
     * Add new subject
     * @param {string} name - Subject name
     * @param {number} total - Total lessons count
     * @returns {object} Created subject
     */
    addSubject(name, total) {
        const subject = {
            id: Date.now(),
            name,
            total,
            completed: 0,
            lessons: [],
            createdAt: new Date().toISOString()
        };
        this.subjects.push(subject);
        this.save();
        console.log('✅ Subject added:', name);
        return subject;
    }

    /**
     * Delete subject
     * @param {number} id - Subject ID
     * @param {boolean} softDelete - Whether to move to trash
     */
    deleteSubject(id, softDelete = true) {
        const subject = this.subjects.find(s => s.id === id);
        if (!subject) return false;

        if (softDelete) {
            trash.addItem(subject, 'subject');
        }

        this.subjects = this.subjects.filter(s => s.id !== id);
        this.save();
        console.log('✅ Subject deleted:', subject.name);
        return true;
    }

    /**
     * Add lesson to subject
     * @param {number} subjectId - Subject ID
     * @param {string} lessonName - Lesson name
     * @returns {boolean} Success status
     */
    addLesson(subjectId, lessonName) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return false;

        subject.lessons.push({
            id: Date.now(),
            name: lessonName,
            completed: false
        });

        this.save();
        console.log('✅ Lesson added:', lessonName);
        return true;
    }

    /**
     * Toggle lesson completion
     * @param {number} subjectId - Subject ID
     * @param {number} lessonId - Lesson ID
     */
    toggleLesson(subjectId, lessonId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return false;

        const lesson = subject.lessons.find(l => l.id === lessonId);
        if (!lesson) return false;

        lesson.completed = !lesson.completed;
        subject.completed = subject.lessons.filter(l => l.completed).length;
        this.save();
        return true;
    }

    /**
     * Get subject by ID
     * @param {number} id - Subject ID
     * @returns {object} Subject object
     */
    getSubject(id) {
        return this.subjects.find(s => s.id === id);
    }

    /**
     * Get all subjects
     * @returns {array} All subjects
     */
    getAllSubjects() {
        return this.subjects;
    }

    /**
     * Get completion percentage for subject
     * @param {number} id - Subject ID
     * @returns {number} Percentage (0-100)
     */
    getProgress(id) {
        const subject = this.getSubject(id);
        if (!subject || subject.total === 0) return 0;
        return Math.round((subject.completed / subject.total) * 100);
    }

    /**
     * Save subjects to storage
     */
    save() {
        this.storage.set('subjects', this.subjects);
    }
}

// ========================================
// TRASH MANAGEMENT
// ========================================

/**
 * Trash Manager: Handles soft deletes and restoration
 * Keeps track of deleted items for recovery
 */
class TrashManager {
    constructor(storage) {
        this.storage = storage;
        this.items = this.storage.get('trash', []);
    }

    /**
     * Add item to trash
     * @param {object} item - Item to trash
     * @param {string} type - Item type (task, event, subject)
     */
    addItem(item, type) {
        const trashItem = {
            id: Date.now(),
            item,
            type,
            deletedAt: new Date().toISOString()
        };
        this.items.push(trashItem);
        this.save();
        console.log('✅ Item moved to trash:', type);
    }

    /**
     * Restore item from trash
     * @param {number} id - Trash item ID
     */
    restore(id) {
        const trashItem = this.items.find(i => i.id === id);
        if (!trashItem) {
            console.error('❌ Trash item not found:', id);
            return false;
        }

        const { item, type } = trashItem;

        // Restore to appropriate manager
        switch (type) {
            case 'task':
                tasks.tasks.push(item);
                tasks.save();
                break;
            case 'event':
                events.events.push(item);
                events.save();
                break;
            case 'subject':
                subjects.subjects.push(item);
                subjects.save();
                break;
        }

        // Remove from trash
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        showToast('✅ تم استرجاع العنصر بنجاح', 'success');
        console.log('✅ Item restored from trash');
        return true;
    }

    /**
     * Permanently delete from trash
     * @param {number} id - Trash item ID
     */
    permanentDelete(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        console.log('✅ Item permanently deleted');
    }

    /**
     * Get all trash items
     * @returns {array} Trash items
     */
    getAll() {
        return this.items;
    }

    /**
     * Save trash to storage
     */
    save() {
        this.storage.set('trash', this.items);
    }
}

// ========================================
// TIMER/POMODORO MANAGEMENT
// ========================================

/**
 * Timer Manager: Handles Pomodoro timer functionality
 * Manages timer state, progress, and notifications
 */
class TimerManager {
    constructor() {
        this.duration = 25 * 60; // 25 minutes in seconds
        this.timeRemaining = this.duration;
        this.isRunning = false;
        this.interval = null;
    }

    /**
     * Start the timer
     * @param {function} onTick - Callback for each second
     * @param {function} onComplete - Callback when finished
     */
    start(onTick, onComplete) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.interval = setInterval(() => {
            this.timeRemaining--;
            onTick(this.timeRemaining);

            if (this.timeRemaining <= 0) {
                this.stop();
                onComplete();
            }
        }, 1000);
    }

    /**
     * Pause the timer
     */
    pause() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    /**
     * Resume the timer
     * @param {function} onTick - Callback for each second
     * @param {function} onComplete - Callback when finished
     */
    resume(onTick, onComplete) {
        this.start(onTick, onComplete);
    }

    /**
     * Reset timer to initial state
     */
    reset() {
        this.pause();
        this.timeRemaining = this.duration;
    }

    /**
     * Stop timer and cleanup
     */
    stop() {
        this.pause();
    }

    /**
     * Get formatted time string (MM:SS)
     * @returns {string} Formatted time
     */
    getFormattedTime() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Get progress percentage
     * @returns {number} Progress 0-100
     */
    getProgress() {
        return ((this.duration - this.timeRemaining) / this.duration) * 100;
    }

    /**
     * Check if timer is running
     * @returns {boolean} Running status
     */
    getIsRunning() {
        return this.isRunning;
    }
}

// ========================================
// ADVANCED NOTIFICATION SYSTEM
// ========================================

/**
 * Advanced Notification Manager
 * Handles smart notifications for tasks and events
 */
class NotificationManager {
    constructor(storage) {
        this.storage = storage;
        this.notificationCheckInterval = null;
        this.sentNotifications = this.storage.get('sentNotifications', {});
        this.halfHourCheckInterval = null;
    }

    /**
     * Start the notification system
     */
    start() {
        console.log('🔔 Advanced notification system started');
        
        // Check every 30 seconds for new notifications
        this.halfHourCheckInterval = setInterval(() => {
            this.checkAllNotifications();
        }, 30000); // 30 seconds

        // Initial check
        this.checkAllNotifications();
    }

    /**
     * Stop the notification system
     */
    stop() {
        if (this.halfHourCheckInterval) {
            clearInterval(this.halfHourCheckInterval);
            console.log('🔕 Advanced notification system stopped');
        }
    }

    /**
     * Check all notifications needed
     */
    checkAllNotifications() {
        const isEnabled = storage.get('notificationsEnabled', false);
        if (!isEnabled) return;

        // Check tasks notifications
        this.checkDailyTasksNotifications();

        // Check events notifications
        this.checkEventsNotifications();
    }

    /**
     * Check and send daily task notifications
     * Sends notification every 30 minutes for incomplete tasks
     */
    checkDailyTasksNotifications() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.getTodayTasks();

        if (todayTasks.length === 0) return;

        // Create a unique key for today's notification
        const notificationKey = `tasks-${today}`;
        const lastNotificationTime = this.sentNotifications[notificationKey] || 0;
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        // Send notification every 30 minutes
        if (now - lastNotificationTime >= thirtyMinutes) {
            const incompleteTasks = todayTasks.filter(t => !t.completed);
            
            if (incompleteTasks.length > 0) {
                const taskTitle = incompleteTasks[0].title;
                const taskCount = incompleteTasks.length;

                const title = `📝 مهام لهذا اليوم`;
                const body = taskCount === 1 
                    ? `لديك مهمة واحدة: ${taskTitle}`
                    : `لديك ${taskCount} مهام اليوم`;

                this.sendNotification(title, body);
                
                // Update last notification time
                this.sentNotifications[notificationKey] = now;
                this.storage.set('sentNotifications', this.sentNotifications);

                console.log('✅ Daily task notification sent');
            }
        }
    }

    /**
     * Check and send event reminders (5 minutes before)
     */
    checkEventsNotifications() {
        const allEvents = events.getAllEvents();
        const now = new Date();

        allEvents.forEach(event => {
            const eventTime = new Date(`${event.date}T${event.time}`);
            const diffInMs = eventTime - now;
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

            // Send notification 5 minutes before event
            if (diffInMinutes === 5) {
                // Check if we already sent this notification
                const notificationKey = `event-${event.id}`;
                
                if (!this.sentNotifications[notificationKey]) {
                    const title = `⏰ تذكير بحدث قريب`;
                    const body = `بقي 5 دقائق على: ${event.title}`;

                    this.sendNotification(title, body);
                    
                    // Mark as sent
                    this.sentNotifications[notificationKey] = true;
                    this.storage.set('sentNotifications', this.sentNotifications);

                    console.log('✅ Event reminder notification sent');
                }
            }

            // Clear old event notifications (after event time passed)
            if (diffInMinutes < -10) {
                const notificationKey = `event-${event.id}`;
                if (this.sentNotifications[notificationKey]) {
                    delete this.sentNotifications[notificationKey];
                    this.storage.set('sentNotifications', this.sentNotifications);
                }
            }
        });
    }

    /**
     * Send notification via browser or Service Worker
     */
    sendNotification(title, body) {
        // Check if notifications are enabled
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            console.warn('⚠️ Notifications not enabled');
            return;
        }

        // Try Service Worker first
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: './icons/icon-192.png',
                    badge: './icons/icon-192.png',
                    tag: 'smartstudent-notification',
                    requireInteraction: false,
                    vibrate: [200, 100, 200],
                    actions: [
                        {
                            action: 'open',
                            title: 'فتح التطبيق'
                        }
                    ]
                });
            }).catch(error => {
                console.error('❌ Service Worker notification error:', error);
                // Fallback to native notification
                this.sendNativeNotification(title, body);
            });
        } else {
            // Fallback to native notification
            this.sendNativeNotification(title, body);
        }
    }

    /**
     * Send native browser notification (fallback)
     */
    sendNativeNotification(title, body) {
        try {
            new Notification(title, {
                body: body,
                icon: './icons/icon-192.png'
            });
        } catch (error) {
            console.error('❌ Native notification error:', error);
        }
    }

    /**
     * Clear notification history for specific task
     */
    clearTaskNotification(taskDate) {
        const notificationKey = `tasks-${taskDate}`;
        delete this.sentNotifications[notificationKey];
        this.storage.set('sentNotifications', this.sentNotifications);
    }

    /**
     * Clear all old notifications
     */
    clearOldNotifications() {
        const today = new Date().toISOString().split('T')[0];
        const newNotifications = {};

        // Keep only today's notifications and future events
        Object.keys(this.sentNotifications).forEach(key => {
            if (key.startsWith('tasks-')) {
                const date = key.replace('tasks-', '');
                if (date >= today) {
                    newNotifications[key] = this.sentNotifications[key];
                }
            } else if (key.startsWith('event-')) {
                newNotifications[key] = this.sentNotifications[key];
            }
        });

        this.sentNotifications = newNotifications;
        this.storage.set('sentNotifications', this.sentNotifications);
    }
}

// ========================================
// UI RENDERER & DOM MANAGEMENT
// ========================================

/**
 * UI Renderer: Handles all DOM rendering and updates
 * Manages pages, lists, modals, and UI interactions
 */
class UIRenderer {
    /**
     * Render task list with current filter
     * @param {string} filter - Filter type
     */
    static renderTasks(filter = 'all') {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) {
            console.error('❌ Tasks list element not found');
            return;
        }

        const filteredTasks = tasks.getFilteredTasks(filter);

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon icon icon-3xl icon-muted">
                        <use href="icons.svg#icon-empty"></use>
                    </svg>
                    <p class="empty-text">لا توجد مهام</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} 
                       data-task-id="${task.id}" onchange="handleTaskToggle(${task.id})">
                <div class="task-content">
                    <p class="task-text">${escapeHtml(task.title)}</p>
                    <p class="task-date">${formatDate(task.date)}</p>
                </div>
                <button class="task-delete" onclick="handleTaskDelete(${task.id})" title="حذف">
                    <svg class="icon icon-md icon-danger">
                        <use href="icons.svg#icon-delete"></use>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    /**
     * Render today's tasks preview on home page
     */
    static renderTodayTasks() {
        const todayList = document.getElementById('todayTasksList');
        if (!todayList) return;

        const todayTasks = tasks.getTodayTasks();

        if (todayTasks.length === 0) {
            todayList.innerHTML = `
                <div class="empty-state">
                    <p class="empty-icon">✨</p>
                    <p class="empty-text">لا توجد مهام لهذا اليوم</p>
                </div>
            `;
            return;
        }

        todayList.innerHTML = todayTasks.slice(0, 3).map(task => `
            <div class="task-preview-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       data-task-id="${task.id}" onchange="handleTaskToggle(${task.id})">
                <span class="task-preview-text">${escapeHtml(task.title)}</span>
            </div>
        `).join('');
    }

    /**
     * Render events list
     */
    static renderEvents(date = null) {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) {
            console.error('❌ Events list element not found');
            return;
        }

        let filteredEvents = date ? events.getEventsByDate(date) : events.getAllEvents();

        if (filteredEvents.length === 0) {
            eventsList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon icon icon-3xl icon-muted">
                        <use href="icons.svg#icon-empty"></use>
                    </svg>
                    <p class="empty-text">لا توجد أحداث</p>
                </div>
            `;
            return;
        }

        eventsList.innerHTML = filteredEvents.map(event => `
            <div class="event-item ${event.category}">
                <div class="event-header">
                    <h4 class="event-title">${escapeHtml(event.title)}</h4>
                    <span class="event-category">${getCategoryLabel(event.category)}</span>
                </div>
                <div class="event-details">
                    <span>📅 ${formatDate(event.date)}</span>
                    <span>🕐 ${event.time}</span>
                </div>
                <button class="event-delete" onclick="handleEventDelete(${event.id})" title="حذف">
                    <svg class="icon icon-md icon-danger">
                        <use href="icons.svg#icon-delete"></use>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    /**
     * Render subjects list
     */
    static renderSubjects() {
        const subjectsList = document.getElementById('subjectsList');
        if (!subjectsList) {
            console.error('❌ Subjects list element not found');
            return;
        }

        const allSubjects = subjects.getAllSubjects();

        if (allSubjects.length === 0) {
            subjectsList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon icon icon-3xl icon-muted">
                        <use href="icons.svg#icon-subjects"></use>
                    </svg>
                    <p class="empty-text">لا توجد مواد</p>
                </div>
            `;
            return;
        }

        subjectsList.innerHTML = allSubjects.map(subject => {
            const progress = subjects.getProgress(subject.id);
            return `
                <div class="subject-item">
                    <div class="subject-header">
                        <h4 class="subject-name">${escapeHtml(subject.name)}</h4>
                        <div class="subject-actions">
                            <button class="subject-btn" onclick="openAddLessonModal(${subject.id})" title="إضافة درس">
                                <svg class="icon icon-md icon-primary">
                                    <use href="icons.svg#icon-add"></use>
                                </svg>
                            </button>
                            <button class="subject-btn" onclick="handleSubjectDelete(${subject.id})" title="حذف">
                                <svg class="icon icon-md icon-danger">
                                    <use href="icons.svg#icon-delete"></use>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>التقدم</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="subject-lessons">
                        ${subject.lessons.map(lesson => `
                            <div class="lesson-item">
                                <input type="checkbox" class="lesson-check" ${lesson.completed ? 'checked' : ''} 
                                       onchange="handleLessonToggle(${subject.id}, ${lesson.id})">
                                <span>${escapeHtml(lesson.name)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update home page statistics
     */
    static updateStats() {
        const tasksCountEl = document.getElementById('tasksCount');
        const eventsCountEl = document.getElementById('eventsCount');
        const completedCountEl = document.getElementById('completedCount');

        if (tasksCountEl) tasksCountEl.textContent = tasks.getCount();
        if (eventsCountEl) eventsCountEl.textContent = events.getCount();
        if (completedCountEl) completedCountEl.textContent = tasks.getCompletedCount();
    }

    /**
     * Update greeting and date
     */
    static updateGreeting() {
        const username = storage.get('username', 'الطالب');
        const today = new Date();
        const arabicDate = formatDateFull(today);

        const userNameDisplay = document.getElementById('userNameDisplay');
        const dateDisplay = document.getElementById('dateDisplay');

        if (userNameDisplay) userNameDisplay.textContent = username;
        if (dateDisplay) dateDisplay.textContent = arabicDate;
    }

    /**
     * Update timer display
     */
    static updateTimer() {
        const formattedTime = timer.getFormattedTime();
        const timerValue = document.getElementById('timerValue');
        if (timerValue) {
            timerValue.textContent = formattedTime;
        }
        this.updateTimerProgress();
    }

    /**
     * Update timer progress circle
     */
    static updateTimerProgress() {
        const progress = timer.getProgress();
        const circumference = 565.5;
        const offset = circumference - (progress / 100) * circumference;
        const progressCircle = document.querySelector('.timer-progress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show toast notification message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Request browser notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Show system notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png'
        });
    }
}

/**
 * Format date to Arabic format
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted Arabic date
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/**
 * Format full date with time to Arabic
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDateFull(date) {
    return new Intl.DateTimeFormat('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get category label in Arabic
 * @param {string} category - Category key
 * @returns {string} Category label
 */
function getCategoryLabel(category) {
    const labels = {
        exam: 'امتحان',
        lecture: 'محاضرة',
        deadline: 'موعد نهائي'
    };
    return labels[category] || category;
}

/**
 * Get item type label in Arabic
 * @param {string} type - Type key
 * @returns {string} Type label
 */
function getTypeLabel(type) {
    const labels = {
        task: 'مهمة',
        event: 'حدث',
        subject: 'مادة'
    };
    return labels[type] || type;
}

// ========================================
// EVENT HANDLERS - NAVIGATION
// ========================================

/**
 * Navigate between pages - Fixed version
 * @param {string} pageId - The page element ID to navigate to
 */
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('❌ Page not found:', pageId);
        return;
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Find and activate the corresponding nav item
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Re-render content based on page
    switch(pageId) {
        case 'tasksPage':
            UIRenderer.renderTasks('all');
            break;
        case 'eventsPage':
            UIRenderer.renderEvents();
            break;
        case 'subjectsPage':
            UIRenderer.renderSubjects();
            break;
        case 'morePage':
            initializeMorePage();
            break;
        case 'homePage':
            UIRenderer.renderTodayTasks();
            UIRenderer.updateStats();
            break;
        case 'focusPage':
            // Focus page doesn't need re-rendering
            break;
    }

    console.log('📄 Navigated to:', pageId);
}

/**
 * Handle task completion toggle
 * @param {number} taskId - Task ID
 */
function handleTaskToggle(taskId) {
    const task = tasks.tasks.find(t => t.id === taskId);
    
    tasks.toggleTask(taskId);
    
    // إذا أكملت المهمة
    if (task && task.completed === false) {
        // تم إكمالها الآن
        const today = new Date().toISOString().split('T')[0];
        
        // امسح إشعارات هذا اليوم
        notificationManager.clearTaskNotification(today);
    }
    
    const activeFilter = document.querySelector('.filter-tab.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';
    UIRenderer.renderTasks(filter);
    UIRenderer.renderTodayTasks();
    UIRenderer.updateStats();
}

/**
 * Handle task deletion
 * @param {number} taskId - Task ID
 */
function handleTaskDelete(taskId) {
    const task = tasks.tasks.find(t => t.id === taskId);
    if (!task) return;

    showConfirmDialog(
        'حذف المهمة',
        `هل تريد حذف المهمة: "${escapeHtml(task.title)}"؟`,
        () => {
            tasks.deleteTask(taskId);
            const activeFilter = document.querySelector('.filter-tab.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            UIRenderer.renderTasks(filter);
            UIRenderer.renderTodayTasks();
            UIRenderer.updateStats();
            showToast('✅ تم حذف المهمة', 'success');
        }
    );
}

/**
 * Handle event deletion
 * @param {number} eventId - Event ID
 */
function handleEventDelete(eventId) {
    const event = events.events.find(e => e.id === eventId);
    if (!event) return;

    showConfirmDialog(
        'حذف الحدث',
        `هل تريد حذف الحدث: "${escapeHtml(event.title)}"؟`,
        () => {
            events.deleteEvent(eventId);
            UIRenderer.renderEvents();
            UIRenderer.updateStats();
            showToast('✅ تم حذف الحدث', 'success');
        }
    );
}

/**
 * Handle subject deletion
 * @param {number} subjectId - Subject ID
 */
function handleSubjectDelete(subjectId) {
    const subject = subjects.getSubject(subjectId);
    if (!subject) return;

    showConfirmDialog(
        'حذف المادة',
        `هل تريد حذف المادة: "${escapeHtml(subject.name)}"؟`,
        () => {
            subjects.deleteSubject(subjectId);
            UIRenderer.renderSubjects();
            showToast('✅ تم حذف المادة', 'success');
        }
    );
}

/**
 * Handle lesson completion toggle
 * @param {number} subjectId - Subject ID
 * @param {number} lessonId - Lesson ID
 */
function handleLessonToggle(subjectId, lessonId) {
    subjects.toggleLesson(subjectId, lessonId);
    UIRenderer.renderSubjects();
}

// ========================================
// MODAL & FORM HANDLERS
// ========================================

/**
 * Show modal dialog
 * @param {string} modalId - Modal element ID
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        console.log('✅ Modal opened:', modalId);
    } else {
        console.error('❌ Modal not found:', modalId);
    }
}

/**
 * Hide modal dialog
 * @param {string} modalId - Modal element ID
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        console.log('✅ Modal closed:', modalId);
    }
}

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback on confirm
 */
function showConfirmDialog(title, message, onConfirm) {
    const dialog = document.getElementById('confirmDialog');
    if (!dialog) {
        console.error('❌ Confirm dialog not found');
        return;
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const confirmBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    if (!confirmBtn || !cancelBtn) {
        console.error('❌ Confirm buttons not found');
        return;
    }

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Add new listeners
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        hideModal('confirmDialog');
    });

    newCancelBtn.addEventListener('click', () => {
        hideModal('confirmDialog');
    });

    showModal('confirmDialog');
}

/**
 * Handle add task form submission
 */
function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const date = document.getElementById('taskDate').value;

    if (!title || !date) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    tasks.addTask(title, date);
    document.getElementById('addTaskForm').reset();
    hideModal('addTaskModal');
    showToast('✅ تم إضافة المهمة بنجاح', 'success');
    
    // ✅ تحديث الإشعارات
    notificationManager.clearOldNotifications();
    notificationManager.checkAllNotifications();
    
    UIRenderer.renderTasks('all');
    UIRenderer.renderTodayTasks();
    UIRenderer.updateStats();
}

/**
 * Handle add event form submission
 */
function handleAddEvent(e) {
    e.preventDefault();
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const category = document.getElementById('eventCategory').value;

    if (!title || !date || !time || !category) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    events.addEvent(title, date, time, category);
    document.getElementById('addEventForm').reset();
    hideModal('addEventModal');
    showToast('✅ تم إضافة الحدث بنجاح', 'success');
    
    // ✅ تحديث الإشعارات
    notificationManager.checkAllNotifications();
    
    UIRenderer.renderEvents();
    UIRenderer.updateStats();
}

/**
 * Handle add subject form submission
 */
function handleAddSubject(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value.trim();
    const total = parseInt(document.getElementById('subjectTotal').value);

    if (!name || !total || total < 1) {
        showToast('الرجاء ملء جميع الحقول بشكل صحيح', 'error');
        return;
    }

    subjects.addSubject(name, total);
    document.getElementById('addSubjectForm').reset();
    hideModal('addSubjectModal');
    showToast('✅ تم إضافة المادة بنجاح', 'success');
    UIRenderer.renderSubjects();
}

/**
 * Open add lesson modal
 * @param {number} subjectId - Subject ID
 */
function openAddLessonModal(subjectId) {
    const lessonName = prompt('أدخل اسم الدرس:');
    if (lessonName && lessonName.trim()) {
        subjects.addLesson(subjectId, lessonName.trim());
        UIRenderer.renderSubjects();
        showToast('✅ تم إضافة الدرس بنجاح', 'success');
    }
}

/**
 * Handle setup form submission (first launch)
 */
function handleSetup(e) {
    e.preventDefault();
    const username = document.getElementById('setupUsername').value.trim();

    if (!username) {
        showToast('الرجاء إدخال اسمك', 'error');
        return;
    }

    storage.set('username', username);
    hideModal('setupModal');
    UIRenderer.updateGreeting();
    showToast('👋 مرحبا بك ' + username, 'success');
}

// ========================================
// TIMER HANDLERS
// ========================================

/**
 * Handle timer start
 */
function handleStartTimer() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');

    if (!startBtn || !pauseBtn) return;

    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timer.start(
        () => {
            UIRenderer.updateTimer();
        },
        () => {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            showNotification('اكتمل وقت التركيز! ✅', 'لقد أكملت جلسة 25 دقيقة بنجاح');
            showToast('✅ اكتمل وقت التركيز! خذ فترة راحة', 'success');
            playTimerSound();
        }
    );
}

/**
 * Handle timer pause
 */
function handlePauseTimer() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');

    if (!startBtn || !pauseBtn) return;

    timer.pause();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

/**
 * Handle timer reset
 */
function handleResetTimer() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');

    if (!startBtn || !pauseBtn) return;

    timer.reset();
    UIRenderer.updateTimer();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

/**
 * Play timer completion sound
 */
function playTimerSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error('❌ Audio error:', error);
    }
}

// ========================================
// FAB & NAVIGATION HANDLERS
// ========================================

/**
 * Toggle FAB menu open/close
 */
function toggleFABMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabMain = document.querySelector('.fab-main');

    if (!fabMenu || !fabMain) return;

    fabMenu.classList.toggle('open');
    fabMain.classList.toggle('open');
}

/**
 * Handle FAB action button clicks
 * @param {string} action - Action type
 */
function handleFABAction(action) {
    toggleFABMenu();

    switch (action) {
        case 'addTask':
            showModal('addTaskModal');
            break;
        case 'addEvent':
            showModal('addEventModal');
            break;
        case 'addSubject':
            showModal('addSubjectModal');
            break;
    }
}

// ========================================
// MORE PAGE FUNCTIONALITY
// ========================================

/**
 * Handle notification toggle
 */
function toggleNotifications() {
    const toggle = document.getElementById('notificationToggle');
    if (!toggle) return;

    const isEnabled = toggle.getAttribute('data-enabled') === 'true';
    
    if (!isEnabled) {
        requestNotificationPermission();
        toggle.setAttribute('data-enabled', 'true');
        storage.set('notificationsEnabled', true);
        
        // Start notification manager
        notificationManager.start();
        
        showToast('✅ تم تفعيل الإشعارات', 'success');
    } else {
        toggle.setAttribute('data-enabled', 'false');
        storage.set('notificationsEnabled', false);
        
        // Stop notification manager
        notificationManager.stop();
        
        showToast('🔕 تم تعطيل الإشعارات', 'info');
    }
}

/**
 * Update trash count in more page
 */
function updateTrashCount() {
    const count = trash.getAll().length;
    const trashCountEl = document.getElementById('trashCount');
    if (trashCountEl) {
        trashCountEl.textContent = count;
    }
}

/**
 * Open trash modal and render items - FIXED VERSION
 */
function openTrashModal() {
    try {
        const modal = document.getElementById('trashModal');
        const content = document.getElementById('trashModalContent');
        
        // تأكد من وجود العناصر
        if (!modal || !content) {
            console.error('❌ Trash modal elements not found');
            showToast('حدث خطأ في فتح النافذة', 'error');
            return;
        }

        // الحصول على جميع العناصر المحذوفة
        const items = trash.getAll();

        // إذا كانت السلة فارغة
        if (items.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon icon icon-3xl icon-muted">
                        <use href="icons.svg#icon-empty"></use>
                    </svg>
                    <p class="empty-text">السلة فارغة</p>
                </div>
            `;
        } else {
            // بناء قائمة العناصر المحذوفة
            let htmlContent = '';
            
            items.forEach(item => {
                const itemTitle = escapeHtml(item.item.title || item.item.name || 'عنصر بدون عنوان');
                const itemType = getTypeLabel(item.type);
                const deletedDate = formatDate(item.deletedAt);
                
                htmlContent += `
                    <div class="trash-item" data-trash-id="${item.id}">
                        <div class="trash-item-header">
                            <h4 class="trash-item-title">${itemTitle}</h4>
                            <span class="trash-item-type">${itemType}</span>
                        </div>
                        <p class="trash-item-date">🗑️ ${deletedDate}</p>
                        <div class="trash-actions">
                            <button class="trash-btn trash-restore" onclick="restoreFromTrashModal(${item.id})">استرجاع</button>
                            <button class="trash-btn trash-delete" onclick="deleteFromTrashPermanentModal(${item.id})">حذف</button>
                        </div>
                    </div>
                `;
            });
            
            content.innerHTML = htmlContent;
        }

        // فتح النافذة
        modal.classList.add('active');
        console.log('✅ Trash modal opened with', items.length, 'items');
    } catch (error) {
        console.error('❌ Error opening trash modal:', error);
        showToast('حدث خطأ في فتح النافذة', 'error');
    }
}

/**
 * Close trash modal
 */
function closeTrashModal() {
    const modal = document.getElementById('trashModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('✅ Trash modal closed');
    }
}

/**
 * Restore item from trash (Modal version)
 */
function restoreFromTrashModal(trashId) {
    try {
        const item = trash.items.find(i => i.id === trashId);
        if (!item) {
            showToast('❌ العنصر غير موجود', 'error');
            return;
        }

        // استرجاع العنصر
        trash.restore(trashId);
        
        // تحديث النافذة
        openTrashModal();
        
        // تحديث العدادات
        updateTrashCount();
        UIRenderer.updateStats();
        
        showToast('✅ تم استرجاع العنصر بنجاح', 'success');
        console.log('✅ Item restored:', item.item.title || item.item.name);
    } catch (error) {
        console.error('❌ Error restoring item:', error);
        showToast('حدث خطأ في استرجاع العنصر', 'error');
    }
}

/**
 * Delete item permanently from trash (Modal version)
 */
function deleteFromTrashPermanentModal(trashId) {
    try {
        const item = trash.items.find(i => i.id === trashId);
        if (!item) {
            showToast('❌ العنصر غير موجود', 'error');
            return;
        }

        // تأكيد الحذف النهائي
        showConfirmDialog(
            'حذف نهائي',
            `هل تريد حذف "${escapeHtml(item.item.title || item.item.name)}" بشكل دائم؟`,
            () => {
                trash.permanentDelete(trashId);
                
                // تحديث النافذة
                openTrashModal();
                
                // تحديث العدادات
                updateTrashCount();
                
                showToast('✅ تم الحذف النهائي', 'success');
                console.log('✅ Item permanently deleted');
            }
        );
    } catch (error) {
        console.error('❌ Error deleting item:', error);
        showToast('حدث خطأ في حذف العنصر', 'error');
    }
}

/**
 * Clear all trash permanently
 */
function clearAllTrash() {
    const trashItems = trash.getAll();
    
    if (!trashItems || trashItems.length === 0) {
        showToast('السلة فارغة بالفعل', 'info');
        return;
    }

    showConfirmDialog(
        'افراغ السلة',
        `سيتم حذف ${trashItems.length} عنصر بشكل نهائي. هل أنت متأكد؟`,
        () => {
            try {
                trash.items = [];
                trash.save();
                
                updateTrashCount();
                openTrashModal(); // تحديث النافذة
                
                showToast('✅ تم افراغ السلة بنجاح', 'success');
                console.log('✅ Trash cleared:', trashItems.length, 'items deleted');
            } catch (error) {
                console.error('❌ Error clearing trash:', error);
                showToast('حدث خطأ في افراغ السلة', 'error');
            }
        }
    );
}

/**
 * Open WhatsApp directly with the app
 */
function openWhatsApp() {
    const phoneNumber = '96181557991';
    const message = 'السلام عليكم ورحمة الله وبركاته ,انا استخدم تطبيق المذهل (الطالب الذكي) واحتاج منك :';
    const encodedMessage = encodeURIComponent(message);
    
    // يفتح تطبيق الواتس أب مباشرة
    window.location.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Initialize more page - ENHANCED VERSION
 */
function initializeMorePage() {
    try {
        // Set current date
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleDateString('ar-SA');
        }

        // Set notification toggle state
        const isNotificationsEnabled = storage.get('notificationsEnabled', false);
        const notificationToggle = document.getElementById('notificationToggle');
        if (notificationToggle) {
            notificationToggle.setAttribute('data-enabled', isNotificationsEnabled);
            // Remove old listener if exists
            const newNotificationToggle = notificationToggle.cloneNode(true);
            notificationToggle.parentNode.replaceChild(newNotificationToggle, notificationToggle);
            // Add new listener
            newNotificationToggle.addEventListener('click', toggleNotifications);
        }

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.getAttribute('data-theme');
                document.documentElement.setAttribute('data-theme', theme);
                storage.set('theme', theme);
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                showToast(`✅ تم تغيير المظهر إلى ${theme === 'dark' ? 'داكن' : 'فاتح'}`, 'success');
            });
        });

        // Set active theme button
        const currentTheme = storage.get('theme', 'dark');
        const activeThemeBtn = document.querySelector(`[data-theme="${currentTheme}"]`);
        if (activeThemeBtn) {
            activeThemeBtn.classList.add('active');
        }

        // Update trash count
        updateTrashCount();

        console.log('✅ More page initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing more page:', error);
    }
}

// ========================================
// ICON SYSTEM INITIALIZATION
// ========================================

/**
 * Initialize SVG icons system
 */
function initializeIconSystem() {
    // Preload SVG icons
    const iconLink = document.createElement('link');
    iconLink.rel = 'preload';
    iconLink.as = 'image';
    iconLink.href = 'icons.svg';
    document.head.appendChild(iconLink);

    console.log('✅ Icon system initialized');
}

// ========================================
// INITIALIZATION
// ========================================

// Global instances
const storage = new StorageManager();
const tasks = new TaskManager(storage);
const events = new EventManager(storage);
const subjects = new SubjectManager(storage);
const trash = new TrashManager(storage);
const timer = new TimerManager();
const notificationManager = new NotificationManager(storage);

/**
 * Initialize the application
 * Called on page load
 */
function initializeApp() {
    try {
        console.log('🚀 Initializing app...');

        // Initialize icon system first
        initializeIconSystem();

        // Clean up old notifications
        notificationManager.clearOldNotifications();

        // Check for first time user
        const isFirstTime = !storage.get('username');
        if (isFirstTime) {
            showModal('setupModal');
        }

        // Setup theme
        const savedTheme = storage.get('theme', 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Update greeting and stats
        UIRenderer.updateGreeting();
        UIRenderer.updateStats();
        UIRenderer.renderTodayTasks();

        // Setup event listeners
        setupEventListeners();

        // Request notification permission
        requestNotificationPermission();

        // Start notification manager if enabled
        const isNotificationsEnabled = storage.get('notificationsEnabled', false);
        if (isNotificationsEnabled) {
            notificationManager.start();
        }

        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ App initialization error:', error);
        showToast('حدث خطأ في تحميل التطبيق', 'error');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    try {
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                const pageId = this.getAttribute('data-page');
                if (pageId) {
                    navigateTo(pageId);
                    if (pageId === 'morePage') {
                        initializeMorePage();
                    }
                }
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                storage.set('theme', newTheme);
                updateThemeIcon();
                showToast(`✅ تم تغيير المظهر إلى ${newTheme === 'dark' ? 'داكن' : 'فاتح'}`, 'success');
            });
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                UIRenderer.renderTasks(tab.dataset.filter);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                hideModal(btn.dataset.modal);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Forms
        const setupForm = document.getElementById('setupForm');
        if (setupForm) setupForm.addEventListener('submit', handleSetup);

        const addTaskForm = document.getElementById('addTaskForm');
        if (addTaskForm) addTaskForm.addEventListener('submit', handleAddTask);

        const addEventForm = document.getElementById('addEventForm');
        if (addEventForm) addEventForm.addEventListener('submit', handleAddEvent);

        const addSubjectForm = document.getElementById('addSubjectForm');
        if (addSubjectForm) addSubjectForm.addEventListener('submit', handleAddSubject);

        // Date filter for events
        const eventDateFilter = document.getElementById('eventDateFilter');
        if (eventDateFilter) {
            eventDateFilter.addEventListener('change', (e) => {
                UIRenderer.renderEvents(e.target.value || null);
            });
        }

        // FAB menu
        const fabMain = document.getElementById('fabMain');
        if (fabMain) {
            fabMain.addEventListener('click', toggleFABMenu);
        }

        document.querySelectorAll('.fab-option').forEach(option => {
            option.addEventListener('click', (e) => {
                handleFABAction(option.dataset.action);
            });
        });

        // Timer controls
        const startTimer = document.getElementById('startTimer');
        const pauseTimer = document.getElementById('pauseTimer');
        const resetTimer = document.getElementById('resetTimer');

        if (startTimer) startTimer.addEventListener('click', handleStartTimer);
        if (pauseTimer) pauseTimer.addEventListener('click', handlePauseTimer);
        if (resetTimer) resetTimer.addEventListener('click', handleResetTimer);

        // Action buttons on home page
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const action = this.getAttribute('data-action');
                if (action) {
                    navigateTo(action + 'Page');
                }
            });
        });

        // Close FAB when clicking outside
        document.addEventListener('click', (e) => {
            const fabMenu = document.getElementById('fabMenu');
            if (fabMenu && !fabMenu.contains(e.target) && fabMenu.classList.contains('open')) {
                toggleFABMenu();
            }
        });

        console.log('✅ Event listeners setup complete');
    } catch (error) {
        console.error('❌ Event listeners setup error:', error);
    }
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    
    if (sunIcon && moonIcon) {
        if (currentTheme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('✅ Notifications enabled');
        }
    });
}

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================

/**
 * Register Service Worker
 * Enables offline functionality and PWA features
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New Service Worker activated');
        showToast('تحديث جديد متاح', 'info');
    });
}