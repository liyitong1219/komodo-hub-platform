(function () {
  const SESSION_KEY = 'komodo_hub_session';

  const ROLE_META = {
    admin: { label: 'Admin', portal: 'Foundation / Admin', theme: 'theme-admin' },
    student: { label: 'Student', portal: 'School pupils', theme: 'theme-student' },
    teacher: { label: 'Teacher', portal: 'School teachers', theme: 'theme-teacher' },
    public: { label: 'Public', portal: 'Citizens & enthusiasts', theme: 'theme-public' },
    community: { label: 'Community', portal: 'Org leaders', theme: 'theme-community' },
    guest: { label: 'Guest', portal: 'Public browse', theme: 'theme-guest' }
  };

  const NAV = {
    admin: [
      { view: 'dashboard', icon: '◒', label: 'Dashboard' },
      { view: 'users', icon: '◎', label: 'Users' },
      { view: 'community-orgs', icon: '⌁', label: 'Org approval' },
      { view: 'species', icon: '✦', label: 'Species library' },
      { view: 'reports', icon: '◌', label: 'Moderation' },
      { view: 'activities', icon: '↗', label: 'Activities' }
    ],
    student: [
      { view: 'home', icon: '◒', label: 'Home' },
      { view: 'learning', icon: '📖', label: 'Learning' },
      { view: 'species', icon: '✦', label: 'Species' },
      { view: 'conservation-activities', icon: '↗', label: 'Activities' },
      { view: 'tasks', icon: '▣', label: 'Tasks' },
      { view: 'reports', icon: '◌', label: 'My reports' },
      { view: 'community', icon: '⌁', label: 'Community' },
      { view: 'profile', icon: '◉', label: 'Profile' },
      { view: 'messages', icon: '✉', label: 'Messages' }
    ],
    teacher: [
      { view: 'home', icon: '◒', label: 'Home' },
      { view: 'classroom', icon: '▣', label: 'Classroom' },
      { view: 'report-review', icon: '✓', label: 'Report review' },
      { view: 'courses', icon: '◰', label: 'Courses' },
      { view: 'tasks', icon: '◫', label: 'Tasks & feedback' },
      { view: 'species', icon: '✦', label: 'Species' },
      { view: 'community', icon: '⌁', label: 'Community' },
      { view: 'reports', icon: '◌', label: 'Submit sighting' }
    ],
    public: [
      { view: 'home', icon: '◒', label: 'Home' },
      { view: 'species', icon: '✦', label: 'Species' },
      { view: 'search', icon: '⌕', label: 'Search' },
      { view: 'community', icon: '⌁', label: 'Community' },
      { view: 'favorites', icon: '♡', label: 'Favorites' },
      { view: 'reports', icon: '◌', label: 'Reports' },
      { view: 'activities', icon: '↗', label: 'Activities' },
      { view: 'communities', icon: '⌁', label: 'Join orgs' },
      { view: 'profile-public', icon: '◉', label: 'My profile' }
    ],
    community: [
      { view: 'dashboard', icon: '◒', label: 'Overview' },
      { view: 'org-home', icon: '⌂', label: 'Org home' },
      { view: 'members', icon: '◎', label: 'Members' },
      { view: 'library', icon: '📚', label: 'Library' },
      { view: 'activities', icon: '↗', label: 'Activities' },
      { view: 'posts', icon: '◌', label: 'Posts' }
    ],
    guest: [
      { view: 'browse', icon: '✦', label: 'Species' },
      { view: 'guest-activities', icon: '↗', label: 'Public activities' },
      { view: 'community', icon: '⌁', label: 'Community feed' }
    ]
  };

  const DEFAULT_VIEW = {
    admin: 'dashboard',
    student: 'home',
    teacher: 'home',
    public: 'home',
    community: 'dashboard',
    guest: 'browse'
  };

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setSession(user) {
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      userId: user.id,
      role: user.role,
      name: user.name
    }));
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return window.KOMODO_STORE.userById(s.userId);
  }

  function login(email, password) {
    const u = window.KOMODO_STORE.db.users.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password
    );
    if (!u) return { ok: false, message: 'Incorrect email or password' };
    if (u.disabled) return { ok: false, message: 'Account disabled. Contact an administrator.' };
    if (u.accountStatus === 'pending') return { ok: false, message: 'Account pending approval. Try again later.' };
    setSession(u);
    return { ok: true, user: u };
  }

  function register(name, email, password, location) {
    const db = window.KOMODO_STORE.db;
    if (db.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, message: 'Email already registered' };
    }
    const user = {
      id: window.KOMODO_STORE.nextId('u'),
      email: email.trim(),
      password,
      role: 'public',
      name: name.trim() || 'New user',
      disabled: false,
      accountStatus: 'approved',
      publicProfile: { location: (location || '').trim(), interestSpecies: [], joinedOrgIds: [] }
    };
    db.users.push(user);
    if (!db.favorites[user.id]) db.favorites[user.id] = [];
    window.KOMODO_STORE.save();
    setSession(user);
    return { ok: true, user };
  }

  function normalizeAccessCode(code) {
    return String(code || '').trim().toUpperCase();
  }

  function findClassByAccessCode(code) {
    const key = normalizeAccessCode(code);
    if (!key) return null;
    return window.KOMODO_STORE.db.classes.find(
      (c) => normalizeAccessCode(c.accessCode) === key
    ) || null;
  }

  function studentInClass(u) {
    if (!u || u.role !== 'student' || !u.classId) return false;
    const cls = window.KOMODO_STORE.db.classes.find((c) => c.id === u.classId);
    return Boolean(cls && cls.studentIds.includes(u.id));
  }

  function enrollStudentInClass(studentUser, cls) {
    const teacher = window.KOMODO_STORE.userById(cls.teacherId);
    studentUser.classId = cls.id;
    studentUser.studentProfile = studentUser.studentProfile || {};
    studentUser.studentProfile.teacherId = cls.teacherId;
    studentUser.studentProfile.schoolId = teacher?.teacherProfile?.schoolId || studentUser.studentProfile.schoolId;
    studentUser.studentProfile.grade = cls.grade || '';
    studentUser.studentProfile.className = cls.name;
    if (!cls.studentIds.includes(studentUser.id)) cls.studentIds.push(studentUser.id);
    if (!window.KOMODO_STORE.db.learningProgress[studentUser.id]) {
      window.KOMODO_STORE.db.learningProgress[studentUser.id] = {
        completedLessons: [],
        quizScores: {},
        activityPoints: 0
      };
    }
  }

  function registerStudent(payload) {
    const db = window.KOMODO_STORE.db;
    if (db.users.some((x) => x.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      return { ok: false, message: 'Email already registered' };
    }
    const cls = findClassByAccessCode(payload.accessCode);
    if (!cls) {
      return { ok: false, message: 'Invalid class access code. Ask your teacher for the correct code.' };
    }
    const teacher = window.KOMODO_STORE.userById(cls.teacherId);
    const user = {
      id: window.KOMODO_STORE.nextId('u'),
      email: payload.email.trim(),
      password: payload.password,
      role: 'student',
      name: payload.fullName.trim(),
      classId: cls.id,
      badges: [],
      disabled: false,
      accountStatus: 'approved',
      studentProfile: {
        studentId: payload.studentId,
        dob: payload.dob,
        gender: payload.gender || '',
        phone: payload.phone || '',
        schoolId: teacher?.teacherProfile?.schoolId || 'sch-1',
        grade: cls.grade || '',
        className: cls.name,
        teacherId: cls.teacherId,
        themeColor: '#3d5a80',
        profileBg: 'forest',
        avatarEmoji: payload.avatar || '🎒'
      }
    };
    db.users.push(user);
    enrollStudentInClass(user, cls);
    window.KOMODO_STORE.save();
    return { ok: true, message: `Registration successful. Joined class "${cls.name}". Return to sign in.` };
  }

  function joinClassByAccessCode(studentUser, accessCode) {
    if (!studentUser || studentUser.role !== 'student') {
      return { ok: false, message: 'Only student accounts can join a class' };
    }
    const cls = findClassByAccessCode(accessCode);
    if (!cls) return { ok: false, message: 'Invalid access code. Check and try again.' };
    if (studentUser.classId && studentUser.classId !== cls.id) {
      return { ok: false, message: 'You are already in another class. Contact your teacher or admin.' };
    }
    enrollStudentInClass(studentUser, cls);
    window.KOMODO_STORE.save();
    return { ok: true, message: `Joined class: ${cls.name}` };
  }

  function registerTeacher(payload) {
    const db = window.KOMODO_STORE.db;
    if (db.users.some((x) => x.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      return { ok: false, message: 'Email already registered' };
    }
    const grade = String(payload.grade || '').trim();
    const className = String(payload.className || '').trim();
    if (!grade || !className) {
      return { ok: false, message: 'Grade and class are required' };
    }
    const userId = window.KOMODO_STORE.nextId('u');
    const classId = window.KOMODO_STORE.nextId('c');
    const user = {
      id: userId,
      email: payload.email.trim(),
      password: payload.password,
      role: 'teacher',
      name: payload.name.trim(),
      classIds: [classId],
      disabled: false,
      accountStatus: 'pending',
      teacherProfile: {
        qualification: '',
        schoolId: payload.schoolId || 'sch-1',
        schoolName: payload.schoolName,
        subject: '',
        gradeResponsible: grade,
        className,
        phone: payload.phone || ''
      }
    };
    const year = new Date().getFullYear();
    db.classes.push({
      id: classId,
      name: className,
      grade,
      year: `${year}/${year + 1}`,
      teacherId: userId,
      studentIds: [],
      accessCode: window.KOMODO_STORE.generateAccessCode(),
      description: ''
    });
    db.users.push(user);
    window.KOMODO_STORE.save();
    return { ok: true, message: 'Teacher registration submitted. After admin approval, sign in and share your class access code.' };
  }

  function loginAsGuest() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: null, role: 'guest', name: 'Guest' }));
    return { ok: true, role: 'guest' };
  }

  function logout() {
    setSession(null);
  }

  function effectiveRole() {
    const s = getSession();
    if (!s) return null;
    return s.role;
  }

  window.KOMODO_AUTH = {
    ROLE_META,
    NAV,
    DEFAULT_VIEW,
    getSession,
    currentUser,
    login,
    register,
    registerStudent,
    registerTeacher,
    joinClassByAccessCode,
    studentInClass,
    findClassByAccessCode,
    loginAsGuest,
    logout,
    effectiveRole
  };
})();
