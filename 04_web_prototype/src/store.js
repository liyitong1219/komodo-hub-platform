(function () {
  const STORAGE_KEY = 'komodo_hub_v1_4';

  const SPECIES_EN = {
    'sp-1': {
      name: 'Javan Rhinoceros',
      level: 'Critically Endangered (CR)',
      region: 'Western Java',
      knowledge: 'One of the rarest large mammals; core refuge at Ujung Kulon.',
      habitat: 'Lowland rainforest and swamps',
      population: '~80 individuals',
      threats: 'Habitat loss, poaching',
      protectionMethods: 'Protected-area patrols, anti-poaching units'
    },
    'sp-2': {
      name: 'Bali Starling',
      level: 'Critically Endangered (CR)',
      region: 'Bali',
      knowledge: 'Distinctive white plumage and crest.',
      habitat: 'Tropical forest',
      population: 'Fewer than 100 in the wild',
      threats: 'Illegal trapping',
      protectionMethods: 'Captive breeding and release'
    },
    'sp-3': {
      name: 'Sumatran Tiger',
      level: 'Critically Endangered (CR)',
      region: 'Sumatra',
      knowledge: 'Smaller tiger subspecies endemic to Sumatra.',
      habitat: 'Lowland and montane forest',
      population: '~400–600',
      threats: 'Poaching, human–tiger conflict',
      protectionMethods: 'Corridor protection, community co-management'
    },
    'sp-4': {
      name: 'Spectral Tarsier',
      level: 'Vulnerable (VU)',
      region: 'Sulawesi',
      knowledge: 'Nocturnal primate with large eyes.',
      habitat: 'Secondary forest, mangrove edges',
      population: 'Declining trend',
      threats: 'Pet trade, deforestation',
      protectionMethods: 'Night-survey guidelines and education'
    },
    'sp-5': {
      name: 'Javan Hawk-Eagle',
      level: 'Endangered (EN)',
      region: 'Java',
      knowledge: 'Indonesia’s national bird; needs intact forest canopy.',
      habitat: 'Tropical montane forest',
      population: 'Est. 300–500 pairs',
      threats: 'Forest fragmentation',
      protectionMethods: 'Nest guarding, reforestation'
    },
    'sp-6': {
      name: 'Celebes Crested Macaque',
      level: 'Critically Endangered (CR)',
      region: 'North Sulawesi',
      knowledge: 'Black crested macaque; key rainforest seed disperser.',
      habitat: 'Primary and secondary rainforest',
      population: 'Declining sharply',
      threats: 'Hunting, habitat loss',
      protectionMethods: 'Community patrols, responsible ecotourism'
    }
  };

  function patchSpeciesEnglish(data) {
    (data.species || []).forEach((s) => {
      const en = SPECIES_EN[s.id];
      if (en) Object.assign(s, en);
    });
    const nameById = {};
    (data.species || []).forEach((s) => { nameById[s.id] = s.name; });
    (data.reports || []).forEach((r) => {
      if (r.speciesId && nameById[r.speciesId]) r.species = nameById[r.speciesId];
    });
  }

  const SEED = {
    schools: [
      { id: 'sch-1', name: 'Ujung Raya Primary School', code: 'UR-PS-001' }
    ],
    users: [
      { id: 'u-admin', email: 'admin@komodo.id', password: 'demo123', role: 'admin', name: 'Anisa K.', disabled: false, accountStatus: 'approved' },
      {
        id: 'u-student', email: 'student@komodo.id', password: 'demo123', role: 'student', name: 'Rafi M.',
        classId: 'c-1', badges: ['Wildlife Explorer', 'Young Naturalist'], disabled: false, accountStatus: 'approved',
        studentProfile: {
          studentId: 'STU-2026-042', dob: '2014-05-12', gender: 'M', phone: '',
          schoolId: 'sch-1', grade: '5', className: '5A', teacherId: 'u-teacher',
          themeColor: '#3d5a80', profileBg: 'forest', avatarEmoji: '🦎'
        }
      },
      {
        id: 'u-teacher', email: 'teacher@komodo.id', password: 'demo123', role: 'teacher', name: 'Bu Sari',
        classIds: ['c-1'], disabled: false, accountStatus: 'approved',
        teacherProfile: { qualification: 'PGCE Biology', schoolId: 'sch-1', subject: 'Science', gradeResponsible: '5' }
      },
      {
        id: 'u-public', email: 'public@komodo.id', password: 'demo123', role: 'public', name: 'Maya S.',
        disabled: false, accountStatus: 'approved', publicProfile: { location: 'Bali', interestSpecies: ['Bali Starling'], joinedOrgIds: ['org-1'] }
      },
      { id: 'u-community', email: 'community@komodo.id', password: 'demo123', role: 'community', name: 'Dewi L.', orgId: 'org-1', disabled: false, accountStatus: 'approved' }
    ],
    classes: [
      {
        id: 'c-1', name: 'Grade 5 Biology Conservation Class', grade: '5', year: '2025/2026',
        teacherId: 'u-teacher', studentIds: ['u-student'], description: '35 students capacity demo',
        accessCode: 'UJUNG-5A-2026'
      }
    ],
    species: [
      {
        id: 'sp-1', latin: 'Rhinoceros sondaicus', emoji: '🦏', accent: '#d4b46a',
        ...SPECIES_EN['sp-1']
      },
      {
        id: 'sp-2', latin: 'Leucopsar rothschildi', emoji: '🐦', accent: '#86b9ad',
        ...SPECIES_EN['sp-2']
      },
      {
        id: 'sp-3', latin: 'Panthera tigris sumatrae', emoji: '🐅', accent: '#d98955',
        ...SPECIES_EN['sp-3']
      },
      {
        id: 'sp-4', latin: 'Tarsius tarsier', emoji: '🐒', accent: '#a5a8c6',
        ...SPECIES_EN['sp-4']
      },
      {
        id: 'sp-5', latin: 'Nisaetus bartelsi', emoji: '🦅', accent: '#8b7355',
        ...SPECIES_EN['sp-5']
      },
      {
        id: 'sp-6', latin: 'Macaca nigra', emoji: '🐵', accent: '#6b7c8a',
        ...SPECIES_EN['sp-6']
      }
    ],
    lessons: [
      { id: 'les-1', speciesId: 'sp-1', title: 'Javan Rhinoceros — Habitat & Threats', type: 'article', durationMin: 15 },
      { id: 'les-2', speciesId: 'sp-1', title: 'Rhino Knowledge Quiz', type: 'quiz', durationMin: 10, maxScore: 100 },
      { id: 'les-3', speciesId: 'sp-2', title: 'Bali Starling Video', type: 'video', durationMin: 8 }
    ],
    learningProgress: {
      'u-student': { completedLessons: ['les-1'], quizScores: { 'les-2': 85 }, activityPoints: 300 }
    },
    reports: [
      {
        id: 'R-1042', speciesId: 'sp-1', species: 'Javan Rhinoceros', latin: 'Rhinoceros sondaicus',
        place: 'Ujung Kulon, Banten', date: '2026-09-24', text: 'One adult recorded near the reserve edge at dawn, about 400 m from a water source.',
        envCondition: 'Morning mist, high humidity', image: '🦏', status: 'pending_teacher', submitterId: 'u-student', submitterRole: 'student',
        rejectReason: '', teacherReviewNote: '', reportScore: null
      },
      {
        id: 'R-1041', speciesId: 'sp-2', species: 'Bali Starling', latin: 'Leucopsar rothschildi',
        place: 'West Bali National Park', date: '2026-09-23', text: 'Two Bali starlings near mangrove; plumage and habitat photos uploaded.',
        envCondition: 'Clear skies', image: '🐦', status: 'approved', submitterId: 'u-public', submitterRole: 'public',
        rejectReason: '', teacherReviewNote: '', reportScore: null
      },
      {
        id: 'R-1039', speciesId: 'sp-4', species: 'Spectral Tarsier', latin: 'Tarsius tarsier',
        place: 'Tomohon, North Sulawesi', date: '2026-09-21', text: 'Night survey: three tarsiers moving in low shrubs.',
        envCondition: 'Night', image: '🐒', status: 'approved', submitterId: 'u-community', submitterRole: 'community',
        rejectReason: '', teacherReviewNote: ''
      }
    ],
    comments: [
      { id: 'cmt-1', reportId: 'R-1041', userId: 'u-public', authorName: 'Maya S.', text: 'The plumage photos are very clear—thanks for sharing!', createdAt: '2026-09-23' },
      { id: 'cmt-2', reportId: 'R-1041', userId: 'u-teacher', authorName: 'Bu Sari', text: 'Great example for a classroom discussion.', createdAt: '2026-09-24' }
    ],
    activities: [
      {
        id: 'act-1', title: 'Local Wildlife Observation', type: 'Field practice', startDate: '2026-09-26', endDate: '2026-09-30',
        date: '2026-09-26', host: 'Komodo Hub Official', status: 'approved', signups: ['u-student', 'u-public'],
        description: 'Record species near where you live.', requiredTask: 'Upload 3 photos + 200-word notes', submissionMethod: 'image+text'
      },
      {
        id: 'act-2', title: 'Forest Protection Campaign', type: 'Community action', startDate: '2026-10-01', endDate: '2026-10-15',
        date: '2026-10-03', host: '#SaveOurAnimals', orgId: 'org-1', status: 'pending', signups: [],
        description: 'Biodiversity survey along mangrove edges.', requiredTask: 'Group observation log', submissionMethod: 'text'
      },
      {
        id: 'act-3', title: 'Animal Knowledge Quiz', type: 'Online learning', startDate: '2026-09-20', endDate: '2026-12-31',
        date: '2026-09-20', host: 'Komodo Hub Official', status: 'approved', signups: [],
        description: 'Earn points through online quizzes.', requiredTask: 'Quiz score ≥ 60', submissionMethod: 'quiz'
      }
    ],
    organisations: [
      { id: 'org-1', name: '#SaveOurAnimals', status: 'approved', bio: 'Bali community conservation organisation', memberIds: ['u-community', 'u-public'] },
      { id: 'org-2', name: 'Mangrove Guardians', status: 'pending', bio: 'New community pending approval', memberIds: [] }
    ],
    library: [
      { id: 'lib-1', orgId: 'org-1', title: 'How to record wildlife observations safely', body: 'Keep a safe distance, do not disturb animals, and you may blur the location.', createdAt: '2026-09-20' }
    ],
    courseMaterials: [
      {
        id: 'cm-1', teacherId: 'u-teacher', classId: 'c-1', title: 'Observe local animals',
        category: 'Conservation', description: 'Use platform resources and add local examples.', basedOnLessonId: 'les-1',
        customNote: 'Focus on the Ujung Kulon case study', difficulty: 'medium', targetGrade: '5', published: true
      }
    ],
    announcements: [
      { id: 'ann-1', classId: 'c-1', teacherId: 'u-teacher', text: 'Tomorrow we will study Javan Rhino.', createdAt: '2026-09-25' }
    ],
    tasks: [
      {
        id: 'task-1', classId: 'c-1', title: 'Observe local animals', type: 'Field practice', due: '2026-10-30',
        description: 'Upload 3 photos and write 200 words report.', attachment: 'checklist.pdf', maxScore: 100,
        requiredSubmission: 'image+text'
      }
    ],
    submissions: [
      { id: 'sub-1', taskId: 'task-1', studentId: 'u-student', status: 'submitted', content: 'Field notes completed; report R-1042 is pending teacher review.', score: 88, feedbackPrivate: 'Clear observation notes—please add timing details.', feedbackPublic: '' }
    ],
    favorites: { 'u-public': ['sp-2', 'R-1041'] },
    messages: [
      { id: 'msg-1', fromId: 'u-teacher', toId: 'u-student', text: 'Nice report—remember to include observation time details.', createdAt: '2026-09-24' }
    ],
    reportsAbuse: [],
    userWarnings: {},
    mutedUsers: {},
    audit: []
  };

  function cloneSeed() {
    return JSON.parse(JSON.stringify(SEED));
  }

  function migrate(data) {
    if (!data.schools) data.schools = SEED.schools;
    if (!data.lessons) data.lessons = SEED.lessons;
    if (!data.learningProgress) data.learningProgress = SEED.learningProgress;
    if (!data.courseMaterials) data.courseMaterials = SEED.courseMaterials;
    if (!data.announcements) data.announcements = SEED.announcements;
    if (!data.userWarnings) data.userWarnings = {};
    if (!data.mutedUsers) data.mutedUsers = {};
    (data.reports || []).forEach((r) => {
      if (r.reportScore === undefined) r.reportScore = null;
      if (r.status === 'removed') return;
    });
    (data.reports || []).forEach((r) => {
      if (r.status === 'pending') {
        r.status = r.submitterRole === 'student' ? 'pending_teacher' : 'pending_admin';
      }
      if (r.envCondition === undefined) r.envCondition = '';
      if (r.teacherReviewNote === undefined) r.teacherReviewNote = '';
    });
    (data.users || []).forEach((u) => {
      if (!u.accountStatus) u.accountStatus = 'approved';
      if (u.role === 'student' && u.classId) {
        const cls = (data.classes || []).find((c) => c.id === u.classId);
        if (cls && !cls.studentIds.includes(u.id)) cls.studentIds.push(u.id);
      }
    });
    const activityTypeEn = {
      '户外实践': 'Field practice',
      '社区行动': 'Community action',
      '线上学习': 'Online learning',
      '课堂': 'Classroom'
    };
    const seedActivityById = Object.fromEntries(SEED.activities.map((a) => [a.id, a]));
    const activityTextEn = {
      '在居住地附近记录本地物种。': 'Record species near where you live.',
      '红树林边缘生物多样性调查。': 'Biodiversity survey along mangrove edges.',
      '在线测验累计积分。': 'Earn points through online quizzes.',
      '上传 3 张照片 + 200 字说明': 'Upload 3 photos + 200-word notes',
      '小组观察记录': 'Group observation log',
      '完成 Quiz 得分 ≥ 60': 'Quiz score ≥ 60'
    };
    (data.activities || []).forEach((a) => {
      if (!a.startDate) a.startDate = a.date || '2026-09-01';
      if (!a.endDate) a.endDate = a.date || '2026-12-31';
      if (!a.description) a.description = '';
      if (!a.requiredTask) a.requiredTask = '—';
      if (!a.submissionMethod) a.submissionMethod = 'text';
      if (activityTypeEn[a.type]) a.type = activityTypeEn[a.type];
      if (a.host === 'Komodo Hub 官方') a.host = 'Komodo Hub Official';
      if (activityTextEn[a.description]) a.description = activityTextEn[a.description];
      if (activityTextEn[a.requiredTask]) a.requiredTask = activityTextEn[a.requiredTask];
      const seedAct = seedActivityById[a.id];
      if (seedAct) {
        a.description = seedAct.description;
        a.requiredTask = seedAct.requiredTask;
        a.type = seedAct.type;
        a.host = seedAct.host;
      }
    });
    (data.tasks || []).forEach((t) => {
      if (activityTypeEn[t.type]) t.type = activityTypeEn[t.type];
    });
    const orgBioEn = {
      '巴厘社区保护组织': 'Bali community conservation organisation',
      '申请中的新社区': 'New community pending approval'
    };
    (data.organisations || []).forEach((o) => {
      if (orgBioEn[o.bio]) o.bio = orgBioEn[o.bio];
    });
    const seedCommentById = Object.fromEntries(SEED.comments.map((c) => [c.id, c]));
    const commentTextEn = {
      '羽色照片很清晰，感谢分享！': 'The plumage photos are very clear—thanks for sharing!',
      '可作为课堂讨论案例。': 'Great example for a classroom discussion.'
    };
    (data.comments || []).forEach((c) => {
      if (commentTextEn[c.text]) c.text = commentTextEn[c.text];
      const seedC = seedCommentById[c.id];
      if (seedC) c.text = seedC.text;
      if (c.id === 'cm-1' && !seedCommentById[c.id]) c.text = commentTextEn['羽色照片很清晰，感谢分享！'] || c.text;
      if (c.id === 'cm-2' && !seedCommentById[c.id]) c.text = commentTextEn['可作为课堂讨论案例。'] || c.text;
    });
    const seedLibById = Object.fromEntries((SEED.library || []).map((l) => [l.id, l]));
    (data.library || []).forEach((l) => {
      const seedL = seedLibById[l.id];
      if (seedL) {
        l.title = seedL.title;
        l.body = seedL.body;
      }
    });
    const seedMsgById = Object.fromEntries((SEED.messages || []).map((m) => [m.id, m]));
    (data.messages || []).forEach((m) => {
      const seedM = seedMsgById[m.id];
      if (seedM) m.text = seedM.text;
    });
    const seedSubById = Object.fromEntries((SEED.submissions || []).map((s) => [s.id, s]));
    (data.submissions || []).forEach((s) => {
      const seedS = seedSubById[s.id];
      if (seedS) {
        s.content = seedS.content;
        s.feedbackPrivate = seedS.feedbackPrivate;
        s.feedbackPublic = seedS.feedbackPublic;
      }
    });
    const seedCourseById = Object.fromEntries((SEED.courseMaterials || []).map((m) => [m.id, m]));
    (data.courseMaterials || []).forEach((m) => {
      const seedM = seedCourseById[m.id];
      if (seedM) {
        m.description = seedM.description;
        m.customNote = seedM.customNote;
      }
    });
    (data.species || []).forEach((s) => {
      if (!s.habitat) s.habitat = s.region || '—';
      if (!s.population) s.population = '—';
      if (!s.threats) s.threats = '—';
      if (!s.protectionMethods) s.protectionMethods = s.knowledge || '—';
    });
    (data.classes || []).forEach((c) => {
      if (!c.accessCode) c.accessCode = c.id === 'c-1' ? 'UJUNG-5A-2026' : generateAccessCode();
    });
    if (!data.species) data.species = [];
    const haveIds = new Set(data.species.map((s) => s.id));
    SEED.species.forEach((s) => {
      if (!haveIds.has(s.id)) data.species.push(JSON.parse(JSON.stringify(s)));
    });
    patchSpeciesEnglish(data);
    return data;
  }

  function generateAccessCode() {
    const part = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KOMODO-${part}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (_) { /* ignore */ }
    return cloneSeed();
  }

  let db = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function reset() {
    db = cloneSeed();
    save();
  }

  function nextId(prefix) {
    return `${prefix}-${Date.now().toString(36)}`;
  }

  function userById(id) {
    return db.users.find((u) => u.id === id);
  }

  function logAudit(actorId, action, target, detail) {
    db.audit.unshift({
      id: nextId('aud'),
      actorId,
      action,
      target,
      detail,
      at: new Date().toISOString()
    });
    save();
  }

  window.KOMODO_STORE = {
    get db() { return db; },
    save,
    reset,
    nextId,
    userById,
    logAudit,
    generateAccessCode,
    reload() { db = load(); }
  };

  window.KOMODO_DATA = db;
})();
