(function () {
  const esc = window.KOMODO_VIEWS.esc;
  const state = { view: null, reportFilter: 'all', searchQuery: '', authPage: 'login', registerType: 'public' };

  const loginRoot = document.querySelector('#loginRoot');
  const appRoot = document.querySelector('#appRoot');
  const app = document.querySelector('#app');
  const nav = document.querySelector('#nav');
  const toast = document.querySelector('#toast');
  const modal = document.querySelector('#modal');

  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function attachEnglishValidation(root) {
    if (!root) return;
    root.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.dataset.enValidity === '1') return;
      el.dataset.enValidity = '1';
      const clear = () => el.setCustomValidity('');
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
      el.addEventListener('invalid', () => {
        if (el.validity.valueMissing) {
          el.setCustomValidity('Please fill in this field.');
        } else if (el.validity.typeMismatch && el.type === 'email') {
          el.setCustomValidity('Please enter a valid email address.');
        } else if (el.validity.tooShort) {
          el.setCustomValidity(`Please enter at least ${el.minLength} characters.`);
        } else if (el.type === 'date' && el.validity.badInput) {
          el.setCustomValidity('Please enter a valid date.');
        } else {
          el.setCustomValidity('Please check this field.');
        }
      });
    });
  }

  function syncDataRef() {
    window.KOMODO_DATA = window.KOMODO_STORE.db;
  }

  function showModal(title, html) {
    document.querySelector('#modalTitle').textContent = title;
    document.querySelector('#modalBody').innerHTML = html;
    modal.classList.remove('hidden');
  }

  function hideModal() {
    modal.classList.add('hidden');
    document.querySelector('#modalBody').innerHTML = '';
  }

  function bindAuthFooter() {
    const guestBtn = document.querySelector('#guestBrowse');
    if (guestBtn) {
      guestBtn.onclick = () => {
        window.KOMODO_AUTH.loginAsGuest();
        notify('Guest mode: public browse only');
        bootApp();
      };
    }
    const resetBtn = document.querySelector('#resetData');
    if (resetBtn) {
      resetBtn.onclick = () => {
        window.KOMODO_STORE.reset();
        syncDataRef();
        notify('Demo data reset');
      };
    }
  }

  function renderLoginPageHTML() {
    return `
      <div class="login-card auth-page">
        <div class="login-brand"><span class="brand-mark">K</span><div><strong>Komodo Hub</strong><small>Digital conservation platform</small></div></div>
        <h2 class="auth-title">Sign in</h2>
        <p class="login-lead">Sign in to open the student, teacher, public, admin, or community portal.</p>
        <form id="loginForm" class="stack-form">
          <label>Email<input name="email" type="email" required placeholder="Email address" autocomplete="username" /></label>
          <label>Password<input name="password" type="password" required autocomplete="current-password" /></label>
          <button type="submit" class="primary full">Sign in</button>
        </form>
        <div class="auth-actions-row">
          <button type="button" class="ghost full" id="goRegister">Create account</button>
        </div>
        <button type="button" class="text-btn guest-link" id="guestBrowse">Browse species &amp; community without signing in →</button>
        <button type="button" class="text-btn reset-link" id="resetData">Reset demo data</button>
      </div>`;
  }

  function renderRegisterPageHTML() {
    const t = state.registerType;
    return `
      <div class="login-card auth-page auth-page-wide">
        <button type="button" class="auth-back text-btn" id="goLogin">← Back to sign in</button>
        <div class="login-brand"><span class="brand-mark">K</span><div><strong>Create account</strong><small>Register · Komodo Hub</small></div></div>
        <div class="register-tabs" role="tablist">
          <button type="button" class="register-tab ${t === 'public' ? 'active' : ''}" data-register-type="public">Public</button>
          <button type="button" class="register-tab ${t === 'student' ? 'active' : ''}" data-register-type="student">Student</button>
          <button type="button" class="register-tab ${t === 'teacher' ? 'active' : ''}" data-register-type="teacher">Teacher</button>
        </div>
        ${t === 'public' ? `
          <p class="login-lead">Post sightings, comment, save favorites, and join activities.</p>
          <form id="registerForm" class="stack-form">
            <label>Display name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="6" /></label>
            <label>Region (optional)<input name="location" /></label>
            <button type="submit" class="primary full">Register &amp; enter public portal</button>
          </form>
        ` : ''}
        ${t === 'student' ? `
          <p class="login-lead">Enter the <strong>class access code</strong> from your teacher to join a class.</p>
          <form id="registerStudentForm" class="stack-form">
            <label>Class access code (required)<input name="accessCode" required placeholder="From your teacher" autocomplete="off" /></label>
            <label>Student ID<input name="studentId" required /></label>
            <label>Full name<input name="fullName" required /></label>
            <label>Date of birth<input name="dob" type="date" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="6" /></label>
            <label>Gender (optional)<select name="gender"><option value="">—</option><option value="M">Male</option><option value="F">Female</option></select></label>
            <button type="submit" class="primary full">Register as student</button>
          </form>
        ` : ''}
        ${t === 'teacher' ? `
          <p class="login-lead">School details required. An administrator must approve your account before sign-in.</p>
          <form id="registerTeacherForm" class="stack-form">
            <label>Name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="6" /></label>
            <label>School name<input name="schoolName" /></label>
            <label>Grade<input name="grade" required placeholder="e.g. 5" /></label>
            <label>Class<input name="className" required placeholder="e.g. 5A" /></label>
            <button type="submit" class="primary full">Register as teacher</button>
          </form>
        ` : ''}
        <button type="button" class="text-btn reset-link" id="resetData">Reset demo data</button>
      </div>`;
  }

  function bindLoginPage() {
    document.querySelector('#loginForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = window.KOMODO_AUTH.login(fd.get('email'), fd.get('password'));
      if (!res.ok) return notify(res.message);
      notify(`Welcome, ${res.user.name} (${window.KOMODO_AUTH.ROLE_META[res.user.role].label})`);
      bootApp();
    };
    document.querySelector('#goRegister').onclick = () => {
      state.authPage = 'register';
      state.registerType = 'public';
      renderLogin();
    };
    bindAuthFooter();
  }

  function bindRegisterPage() {
    document.querySelector('#goLogin').onclick = () => {
      state.authPage = 'login';
      renderLogin();
    };
    document.querySelectorAll('[data-register-type]').forEach((btn) => {
      btn.onclick = () => {
        state.registerType = btn.dataset.registerType;
        renderLogin();
      };
    });
    const publicForm = document.querySelector('#registerForm');
    if (publicForm) {
      publicForm.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = window.KOMODO_AUTH.register(fd.get('name'), fd.get('email'), fd.get('password'), fd.get('location'));
        if (!res.ok) return notify(res.message);
        notify('Registration complete—entering public portal');
        state.authPage = 'login';
        bootApp();
      };
    }
    const studentForm = document.querySelector('#registerStudentForm');
    if (studentForm) {
      studentForm.onsubmit = (e) => {
        e.preventDefault();
        const res = window.KOMODO_AUTH.registerStudent(Object.fromEntries(new FormData(e.target).entries()));
        notify(res.ok ? res.message : res.message);
        if (res.ok) {
          state.authPage = 'login';
          renderLogin();
        }
      };
    }
    const teacherForm = document.querySelector('#registerTeacherForm');
    if (teacherForm) {
      teacherForm.onsubmit = (e) => {
        e.preventDefault();
        const res = window.KOMODO_AUTH.registerTeacher(Object.fromEntries(new FormData(e.target).entries()));
        notify(res.ok ? res.message : res.message);
        if (res.ok) {
          state.authPage = 'login';
          renderLogin();
        }
      };
    }
    bindAuthFooter();
  }

  function renderLogin() {
    loginRoot.classList.remove('hidden');
    appRoot.classList.add('hidden');
    loginRoot.innerHTML = state.authPage === 'register' ? renderRegisterPageHTML() : renderLoginPageHTML();
    if (state.authPage === 'register') bindRegisterPage();
    else bindLoginPage();
  }

  function buildNav(roleKey) {
    const items = window.KOMODO_AUTH.NAV[roleKey] || [];
    nav.innerHTML = items.map((it) =>
      `<button type="button" class="nav-item" data-view="${esc(it.view)}"><span>${it.icon}</span>${esc(it.label)}</button>`
    ).join('');
  }

  function bootApp() {
    syncDataRef();
    const roleKey = window.KOMODO_AUTH.effectiveRole();
    if (!roleKey) return renderLogin();

    loginRoot.classList.add('hidden');
    appRoot.classList.remove('hidden');

    const meta = window.KOMODO_AUTH.ROLE_META[roleKey];
    const u = window.KOMODO_AUTH.currentUser();
    document.querySelector('#portalLabel').textContent = meta.portal;
    document.querySelector('#roleBadge').textContent = meta.label;
    document.querySelector('#sidebar').className = `sidebar ${meta.theme}`;
    document.querySelector('#userAvatar').textContent = u ? u.name.slice(0, 2).toUpperCase() : 'G';
    document.querySelector('#notifCount').textContent = String(window.KOMODO_VIEWS.metrics().pending);

    state.view = state.view || window.KOMODO_AUTH.DEFAULT_VIEW[roleKey];
    buildNav(roleKey);
    render();
  }

  function render() {
    const roleKey = window.KOMODO_AUTH.effectiveRole();
    if (!roleKey) return renderLogin();

    const allowed = (window.KOMODO_AUTH.NAV[roleKey] || []).map((n) => n.view);
    if (!allowed.includes(state.view)) state.view = window.KOMODO_AUTH.DEFAULT_VIEW[roleKey];

    document.querySelectorAll('.nav-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === state.view);
    });

    document.querySelector('#pageTitle').textContent = window.KOMODO_VIEWS.title(state.view);
    document.querySelector('#pageEyebrow').textContent = `${window.KOMODO_AUTH.ROLE_META[roleKey].label.toUpperCase()} / ${state.view.toUpperCase()}`;

    app.innerHTML = window.KOMODO_VIEWS.render(state.view, {
      reportFilter: state.reportFilter,
      searchQuery: state.searchQuery
    });
    bind();
  }

  function bind() {
    document.querySelectorAll('.nav-item').forEach((b) => {
      b.onclick = () => { state.view = b.dataset.view; render(); };
    });

    document.querySelectorAll('[data-go-view]').forEach((b) => {
      b.onclick = () => { state.view = b.dataset.goView; render(); };
    });

    document.querySelectorAll('[data-report-filter]').forEach((b) => {
      b.onclick = () => { state.reportFilter = b.dataset.reportFilter; render(); };
    });

    document.querySelectorAll('[data-teacher-approve]').forEach((b) => {
      b.onclick = () => {
        showModal('Teacher approval', `<form class="stack-form" id="teacherApproveForm">
          <input type="hidden" name="id" value="${esc(b.dataset.teacherApprove)}" />
          <label>Teaching note (optional)<textarea name="note" placeholder="Excellent observation."></textarea></label>
          <button type="submit" class="primary">Send to admin review</button></form>`);
        document.querySelector('#teacherApproveForm').onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const r = window.KOMODO_STORE.db.reports.find((x) => x.id === fd.get('id'));
          if (r && r.status === 'pending_teacher') {
            r.status = 'pending_admin';
            r.teacherReviewNote = fd.get('note') || '';
            window.KOMODO_STORE.logAudit(window.KOMODO_AUTH.currentUser()?.id, 'report.teacher_approve', r.id, '→ pending_admin');
            window.KOMODO_STORE.save();
            syncDataRef();
            notify(`${r.id} sent to admin review queue`);
          }
          hideModal();
          render();
        };
      };
    });

    document.querySelectorAll('[data-teacher-reject]').forEach((b) => {
      b.onclick = () => {
        showModal('Return to student', `<form class="stack-form" id="teacherRejectForm">
          <input type="hidden" name="id" value="${esc(b.dataset.teacherReject)}" />
          <label>Feedback for student<textarea name="reason" required></textarea></label>
          <button type="submit" class="primary">Return</button></form>`);
        document.querySelector('#teacherRejectForm').onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const r = window.KOMODO_STORE.db.reports.find((x) => x.id === fd.get('id'));
          if (r) {
            r.status = 'rejected';
            r.rejectReason = fd.get('reason');
            window.KOMODO_STORE.logAudit(window.KOMODO_AUTH.currentUser()?.id, 'report.teacher_reject', r.id, r.rejectReason);
            window.KOMODO_STORE.save();
            notify('Returned to student');
          }
          hideModal();
          render();
        };
      };
    });

    document.querySelectorAll('[data-approve]').forEach((b) => {
      b.onclick = () => {
        const r = window.KOMODO_STORE.db.reports.find((x) => x.id === b.dataset.approve);
        if (!r || r.status !== 'pending_admin') return notify('Only reports pending admin review');
        const actor = window.KOMODO_AUTH.currentUser()?.id || 'system';
        r.status = 'approved';
        window.KOMODO_STORE.logAudit(actor, 'report.approve', r.id, `${r.id} → approved`);
        window.KOMODO_STORE.save();
        syncDataRef();
        notify(`${r.id} published to community`);
        render();
      };
    });

    document.querySelectorAll('[data-reject]').forEach((b) => {
      b.onclick = () => {
        showModal('Reject report', `<form class="stack-form" id="rejectForm">
          <input type="hidden" name="id" value="${esc(b.dataset.reject)}" />
          <label>Reason<textarea name="reason" required></textarea></label>
          <button type="submit" class="primary">Confirm reject</button></form>`);
        document.querySelector('#rejectForm').onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const r = window.KOMODO_STORE.db.reports.find((x) => x.id === fd.get('id'));
          if (r) {
            r.status = 'rejected';
            r.rejectReason = fd.get('reason');
            window.KOMODO_STORE.logAudit(window.KOMODO_AUTH.currentUser()?.id, 'report.reject', r.id, r.rejectReason);
            window.KOMODO_STORE.save();
            syncDataRef();
            notify(`${r.id} rejected—not published to community`);
          }
          hideModal();
          render();
        };
      };
    });

    document.querySelectorAll('[data-approve-user]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_STORE.db.users.find((x) => x.id === b.dataset.approveUser);
        if (u) {
          u.accountStatus = 'approved';
          if (u.role === 'student' && u.classId) {
            const cls = window.KOMODO_STORE.db.classes.find((c) => c.id === u.classId);
            if (cls && !cls.studentIds.includes(u.id)) cls.studentIds.push(u.id);
          }
          window.KOMODO_STORE.save();
          notify(`${u.name} account approved`);
          render();
        }
      };
    });

    document.querySelectorAll('[data-complete-lesson]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        if (!window.KOMODO_STORE.db.learningProgress[u.id]) {
          window.KOMODO_STORE.db.learningProgress[u.id] = { completedLessons: [], quizScores: {}, activityPoints: 0 };
        }
        const p = window.KOMODO_STORE.db.learningProgress[u.id];
        if (!p.completedLessons.includes(b.dataset.completeLesson)) p.completedLessons.push(b.dataset.completeLesson);
        p.activityPoints = (p.activityPoints || 0) + 20;
        window.KOMODO_STORE.save();
        notify('Lesson complete');
        render();
      };
    });

    document.querySelectorAll('[data-complete-quiz]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        if (!window.KOMODO_STORE.db.learningProgress[u.id]) {
          window.KOMODO_STORE.db.learningProgress[u.id] = { completedLessons: [], quizScores: {}, activityPoints: 0 };
        }
        const p = window.KOMODO_STORE.db.learningProgress[u.id];
        p.quizScores[b.dataset.completeQuiz] = 85;
        if (!p.completedLessons.includes(b.dataset.completeQuiz)) p.completedLessons.push(b.dataset.completeQuiz);
        window.KOMODO_STORE.save();
        notify('Quiz score 85%');
        render();
      };
    });

    document.querySelectorAll('[data-profile-theme]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        const fd = new FormData(form);
        u.studentProfile = u.studentProfile || {};
        u.studentProfile.themeColor = fd.get('themeColor');
        u.studentProfile.profileBg = fd.get('profileBg');
        window.KOMODO_STORE.save();
        notify('Theme saved');
        render();
      };
    });

    document.querySelectorAll('[data-post-announcement]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        const cls = window.KOMODO_STORE.db.classes.find((c) => c.teacherId === u.id);
        if (!cls) return notify('No class found');
        window.KOMODO_STORE.db.announcements.push({
          id: window.KOMODO_STORE.nextId('ann'),
          classId: cls.id,
          teacherId: u.id,
          text: new FormData(form).get('text'),
          createdAt: new Date().toISOString().slice(0, 10)
        });
        window.KOMODO_STORE.save();
        notify('Announcement posted');
        render();
      };
    });

    document.querySelectorAll('[data-toggle-user]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_STORE.db.users.find((x) => x.id === b.dataset.toggleUser);
        if (u) { u.disabled = !u.disabled; window.KOMODO_STORE.save(); notify(u.disabled ? 'Disabled' : 'Enabled'); render(); }
      };
    });

    document.querySelectorAll('[data-approve-org]').forEach((b) => {
      b.onclick = () => {
        const o = window.KOMODO_STORE.db.organisations.find((x) => x.id === b.dataset.approveOrg);
        if (o) { o.status = 'approved'; window.KOMODO_STORE.save(); notify('Community approved'); render(); }
      };
    });

    document.querySelectorAll('[data-delete-species]').forEach((b) => {
      b.onclick = () => {
        window.KOMODO_STORE.db.species = window.KOMODO_STORE.db.species.filter((s) => s.id !== b.dataset.deleteSpecies);
        window.KOMODO_STORE.save();
        notify('Species removed');
        render();
      };
    });

    document.querySelectorAll('[data-join-activity]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        const a = window.KOMODO_STORE.db.activities.find((x) => x.id === b.dataset.joinActivity);
        if (a && u && !a.signups.includes(u.id)) { a.signups.push(u.id); window.KOMODO_STORE.save(); notify('Signed up successfully'); render(); }
      };
    });

    document.querySelectorAll('[data-approve-activity]').forEach((b) => {
      b.onclick = () => {
        const a = window.KOMODO_STORE.db.activities.find((x) => x.id === b.dataset.approveActivity);
        if (a) { a.status = 'approved'; window.KOMODO_STORE.save(); notify('Activity approved'); render(); }
      };
    });

    document.querySelectorAll('[data-comment-report]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        if (!u) return notify('Please sign in first');
        const fd = new FormData(form);
        window.KOMODO_STORE.db.comments.push({
          id: window.KOMODO_STORE.nextId('cm'),
          reportId: form.dataset.commentReport,
          userId: u.id,
          authorName: u.name,
          text: fd.get('text'),
          createdAt: new Date().toISOString().slice(0, 10)
        });
        window.KOMODO_STORE.save();
        notify('Comment posted');
        render();
      };
    });

    document.querySelectorAll('[data-abuse-report]').forEach((b) => {
      b.onclick = () => {
        const target = b.dataset.abuseTarget || 'admin';
        window.KOMODO_STORE.db.reportsAbuse.push({
          id: window.KOMODO_STORE.nextId('ab'),
          reportId: b.dataset.abuseReport,
          reason: target === 'community' ? 'Public report on post' : 'User report',
          status: 'open',
          target
        });
        window.KOMODO_STORE.save();
        notify(target === 'community' ? 'Sent to community leader' : 'Report submitted');
      };
    });

    document.querySelectorAll('[data-admin-delete-post], [data-community-delete-post]').forEach((b) => {
      b.onclick = () => {
        const r = window.KOMODO_STORE.db.reports.find((x) => x.id === b.dataset.adminDeletePost || x.id === b.dataset.communityDeletePost);
        if (r) {
          r.status = 'removed';
          window.KOMODO_STORE.logAudit(window.KOMODO_AUTH.currentUser()?.id, 'post.remove', r.id, 'removed from community');
          window.KOMODO_STORE.save();
          notify('Post removed from community');
          render();
        }
      };
    });

    document.querySelectorAll('[data-admin-warn-user]').forEach((b) => {
      b.onclick = () => {
        const uid = b.dataset.adminWarnUser;
        if (!uid) return;
        const w = window.KOMODO_STORE.db.userWarnings;
        w[uid] = (w[uid] || 0) + 1;
        window.KOMODO_STORE.save();
        notify('User warned');
      };
    });

    document.querySelectorAll('[data-grade-report]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const r = window.KOMODO_STORE.db.reports.find((x) => x.id === form.dataset.gradeReport);
        if (r) {
          r.reportScore = fd.get('score') === '' ? null : Number(fd.get('score'));
          r.teacherReviewNote = fd.get('note');
          window.KOMODO_STORE.save();
          notify('Score saved');
          render();
        }
      };
    });

    document.querySelectorAll('[data-join-community]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        const org = window.KOMODO_STORE.db.organisations.find((x) => x.id === b.dataset.joinCommunity);
        if (!u || !org) return;
        u.publicProfile = u.publicProfile || {};
        if (!u.publicProfile.joinedOrgIds) u.publicProfile.joinedOrgIds = [];
        if (!u.publicProfile.joinedOrgIds.includes(org.id)) u.publicProfile.joinedOrgIds.push(org.id);
        if (!org.memberIds.includes(u.id)) org.memberIds.push(u.id);
        window.KOMODO_STORE.save();
        notify(`Joined ${org.name}`);
        render();
      };
    });

    document.querySelectorAll('[data-mute-member]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const email = new FormData(form).get('email');
        const u = window.KOMODO_STORE.db.users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
        if (!u) return notify('User not found');
        window.KOMODO_STORE.db.mutedUsers[u.id] = true;
        window.KOMODO_STORE.save();
        notify(`${u.name} muted (demo)`);
        render();
      };
    });

    document.querySelectorAll('[data-profile-student]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        u.studentProfile.gender = new FormData(form).get('gender');
        window.KOMODO_STORE.save();
        notify('Profile saved');
        render();
      };
    });

    document.querySelectorAll('[data-resolve-abuse]').forEach((b) => {
      b.onclick = () => {
        const item = window.KOMODO_STORE.db.reportsAbuse.find((x) => x.id === b.dataset.resolveAbuse);
        if (item) item.status = 'resolved';
        window.KOMODO_STORE.save();
        render();
      };
    });

    document.querySelectorAll('[data-submit-task]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        if (!window.KOMODO_AUTH.studentInClass(u)) {
          return notify('Enter your class access code first');
        }
        const fd = new FormData(form);
        let sub = window.KOMODO_STORE.db.submissions.find((s) => s.taskId === form.dataset.submitTask && s.studentId === u.id);
        if (!sub) {
          sub = { id: window.KOMODO_STORE.nextId('sub'), taskId: form.dataset.submitTask, studentId: u.id, status: 'submitted', content: '', feedbackPrivate: '', feedbackPublic: '' };
          window.KOMODO_STORE.db.submissions.push(sub);
        }
        sub.content = fd.get('content');
        sub.status = 'submitted';
        window.KOMODO_STORE.save();
        notify('Work submitted');
        render();
      };
    });

    document.querySelectorAll('[data-feedback]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const sub = window.KOMODO_STORE.db.submissions.find((s) => s.id === form.dataset.feedback);
        if (sub) {
          const score = fd.get('score');
          sub.score = score === '' || score == null ? sub.score : Number(score);
          sub.feedbackPrivate = fd.get('private');
          sub.feedbackPublic = fd.get('public');
          window.KOMODO_STORE.save();
          notify('Feedback saved (private to student)');
        }
        render();
      };
    });

    document.querySelectorAll('[data-send-message]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        if (u.role === 'student' && !window.KOMODO_AUTH.studentInClass(u)) {
          return notify('Enter your class access code first');
        }
        const fd = new FormData(form);
        window.KOMODO_STORE.db.messages.push({
          id: window.KOMODO_STORE.nextId('msg'),
          fromId: u.id,
          toId: fd.get('toId'),
          text: fd.get('text'),
          createdAt: new Date().toISOString().slice(0, 10)
        });
        window.KOMODO_STORE.save();
        notify('Message sent');
        render();
      };
    });

    document.querySelectorAll('[data-create-class]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const id = window.KOMODO_STORE.nextId('c');
        window.KOMODO_STORE.db.classes.push({
          id,
          name: fd.get('name'),
          teacherId: window.KOMODO_AUTH.currentUser().id,
          studentIds: [],
          accessCode: window.KOMODO_STORE.generateAccessCode()
        });
        const t = window.KOMODO_AUTH.currentUser();
        t.classIds = t.classIds || [];
        t.classIds.push(id);
        window.KOMODO_STORE.save();
        notify('Class created—share the access code from Classroom');
        render();
      };
    });

    document.querySelectorAll('[data-join-class]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const u = window.KOMODO_AUTH.currentUser();
        const code = new FormData(form).get('accessCode');
        const res = window.KOMODO_AUTH.joinClassByAccessCode(u, code);
        notify(res.ok ? res.message : res.message);
        if (res.ok) render();
      };
    });

    document.querySelectorAll('[data-copy-access-code]').forEach((b) => {
      b.onclick = () => {
        const code = b.dataset.copyAccessCode || '';
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(code).then(() => notify('Access code copied')).catch(() => notify(code));
        } else {
          notify(`Access code: ${code}`);
        }
      };
    });

    document.querySelectorAll('[data-regenerate-access-code]').forEach((b) => {
      b.onclick = () => {
        const cls = window.KOMODO_STORE.db.classes.find(
          (c) => c.id === b.dataset.regenerateAccessCode && c.teacherId === window.KOMODO_AUTH.currentUser()?.id
        );
        if (!cls) return notify('Could not update access code');
        cls.accessCode = window.KOMODO_STORE.generateAccessCode();
        window.KOMODO_STORE.save();
        notify(`New access code: ${cls.accessCode}`);
        render();
      };
    });

    document.querySelectorAll('[data-global-search]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        state.searchQuery = new FormData(form).get('q');
        state.view = 'search';
        render();
      };
    });

    document.querySelectorAll('[data-add-fav]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        if (!u) return;
        if (!window.KOMODO_STORE.db.favorites[u.id]) window.KOMODO_STORE.db.favorites[u.id] = [];
        const list = window.KOMODO_STORE.db.favorites[u.id];
        if (!list.includes(b.dataset.addFav)) list.push(b.dataset.addFav);
        window.KOMODO_STORE.save();
        notify('Added to favorites');
        render();
      };
    });

    document.querySelectorAll('[data-unfav]').forEach((b) => {
      b.onclick = () => {
        const u = window.KOMODO_AUTH.currentUser();
        const list = window.KOMODO_STORE.db.favorites[u.id] || [];
        window.KOMODO_STORE.db.favorites[u.id] = list.filter((id) => id !== b.dataset.unfav);
        window.KOMODO_STORE.save();
        render();
      };
    });

    document.querySelectorAll('[data-remove-member]').forEach((b) => {
      b.onclick = () => {
        const org = window.KOMODO_STORE.db.organisations.find((o) => o.id === window.KOMODO_AUTH.currentUser().orgId);
        if (org) org.memberIds = org.memberIds.filter((id) => id !== b.dataset.removeMember);
        window.KOMODO_STORE.save();
        render();
      };
    });

    document.querySelectorAll('[data-add-member]').forEach((form) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const email = new FormData(form).get('email');
        const u = window.KOMODO_STORE.db.users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
        const org = window.KOMODO_STORE.db.organisations.find((o) => o.id === window.KOMODO_AUTH.currentUser().orgId);
        if (!u) return notify('User not found');
        if (!org.memberIds.includes(u.id)) org.memberIds.push(u.id);
        window.KOMODO_STORE.save();
        notify('Member added');
        render();
      };
    });

    document.querySelectorAll('[data-modal]').forEach((b) => {
      b.onclick = () => openModalByType(b.dataset.modal);
    });
  }

  function openModalByType(type) {
    const modals = {
      'report-submit': () => showModal('Submit wildlife observation report', `<form class="stack-form" id="modalForm">
        <label>Species name<input name="species" required /></label>
        <label>Latin name<input name="latin" /></label>
        <label>Location (may be approximate)<input name="place" required /></label>
        <label>Date observed<input name="date" type="date" required /></label>
        <label>Conditions<input name="envCondition" placeholder="Weather, habitat..." /></label>
        <label>Description<textarea name="text" required></textarea></label>
        <label>Icon emoji<input name="image" maxlength="4" value="🦎" /></label>
        <button type="submit" class="primary">Submit for review</button></form>`),
      'course-publish': () => showModal('Publish course material', `<form class="stack-form" id="modalForm">
        <label>Title<input name="title" required /></label>
        <label>Category<input name="category" value="Conservation" /></label>
        <label>Based on lesson<select name="basedOnLessonId">${window.KOMODO_STORE.db.lessons.map((l) => `<option value="${esc(l.id)}">${esc(l.title)}</option>`).join('')}</select></label>
        <label>Custom notes<textarea name="customNote"></textarea></label>
        <label>Difficulty<input name="difficulty" value="medium" /></label>
        <button type="submit" class="primary">Publish to class</button></form>`),
      'species-add': () => showModal('Add species', `<form class="stack-form" id="modalForm">
        <label>Common name<input name="name" required /></label>
        <label>Latin name<input name="latin" required /></label>
        <label>Protection level<input name="level" required /></label>
        <label>Range<input name="region" /></label>
        <label>Summary<textarea name="knowledge"></textarea></label>
        <label>emoji<input name="emoji" value="🐾" /></label>
        <button type="submit" class="primary">Save</button></form>`),
      'activity-official': () => showModal('Create official activity', `<form class="stack-form" id="modalForm">
        <label>Title<input name="title" required /></label>
        <label>Type<input name="type" value="Online learning" /></label>
        <label>Date<input name="date" type="date" required /></label>
        <button type="submit" class="primary">Create</button></form>`),
      'activity-community': () => showModal('Create community activity', `<form class="stack-form" id="modalForm">
        <label>Title<input name="title" required /></label>
        <label>Type<input name="type" value="Community action" /></label>
        <label>Date<input name="date" type="date" required /></label>
        <p class="muted tiny">Goes to admin review queue</p>
        <button type="submit" class="primary">Submit for review</button></form>`),
      'task-publish': () => showModal('Publish learning task', `<form class="stack-form" id="modalForm">
        <label>Task title<input name="title" required /></label>
        <label>Type<input name="type" value="Classroom" /></label>
        <label>Due date<input name="due" type="date" required /></label>
        <label>Description<textarea name="description"></textarea></label>
        <button type="submit" class="primary">Publish to class</button></form>`),
      'library-add': () => showModal('Publish library article', `<form class="stack-form" id="modalForm">
        <label>Title<input name="title" required /></label>
        <label>Body<textarea name="body" required></textarea></label>
        <button type="submit" class="primary">Publish</button></form>`),
      'org-edit': () => {
        const org = window.KOMODO_STORE.db.organisations.find((o) => o.id === window.KOMODO_AUTH.currentUser().orgId);
        showModal('Edit organisation home', `<form class="stack-form" id="modalForm">
          <label>Community name<input name="name" value="${esc(org?.name || '')}" required /></label>
          <label>About<textarea name="bio">${esc(org?.bio || '')}</textarea></label>
          <button type="submit" class="primary">Save</button></form>`);
      },
      'user-role': () => showModal('Assign role', `<form class="stack-form" id="modalForm">
        <label>User email<input name="email" type="email" required /></label>
        <label>New role<select name="role"><option value="admin">admin</option><option value="teacher">teacher</option><option value="student">student</option><option value="public">public</option><option value="community">community</option></select></label>
        <button type="submit" class="primary">Update</button></form>`)
    };
    modals[type]?.();
    const form = document.querySelector('#modalForm');
    if (!form) return;
    form.onsubmit = (e) => {
      e.preventDefault();
      handleModalSubmit(type, new FormData(form));
      hideModal();
      render();
    };
  }

  function handleModalSubmit(type, fd) {
    const u = window.KOMODO_AUTH.currentUser();
    const db = window.KOMODO_STORE.db;

    if (type === 'report-submit') {
      const id = `R-${1000 + db.reports.length}`;
      const isStudent = u.role === 'student';
      if (isStudent && !window.KOMODO_AUTH.studentInClass(u)) {
        notify('Enter your class access code first');
        return;
      }
      db.reports.unshift({
        id,
        speciesId: '',
        species: fd.get('species'),
        latin: fd.get('latin') || '',
        place: fd.get('place'),
        date: fd.get('date'),
        text: fd.get('text'),
        envCondition: fd.get('envCondition') || '',
        image: fd.get('image') || '🦎',
        status: isStudent ? 'pending_teacher' : 'pending_admin',
        submitterId: u.id,
        submitterRole: u.role,
        rejectReason: '',
        teacherReviewNote: ''
      });
      window.KOMODO_STORE.save();
      notify(isStudent ? 'Report submitted—pending teacher review' : 'Report submitted—pending admin review');
      return;
    }

    if (type === 'course-publish') {
      const cls = db.classes.find((c) => c.teacherId === u.id);
      if (!cls) return notify('Create a class first');
      db.courseMaterials.push({
        id: window.KOMODO_STORE.nextId('cm'),
        teacherId: u.id,
        classId: cls.id,
        title: fd.get('title'),
        category: fd.get('category'),
        description: fd.get('customNote') || '',
        basedOnLessonId: fd.get('basedOnLessonId'),
        customNote: fd.get('customNote') || '',
        difficulty: fd.get('difficulty'),
        targetGrade: cls.grade || '5',
        published: true
      });
      window.KOMODO_STORE.save();
      notify('Course material published');
      return;
    }

    if (type === 'species-add') {
      db.species.push({
        id: window.KOMODO_STORE.nextId('sp'),
        name: fd.get('name'),
        latin: fd.get('latin'),
        level: fd.get('level'),
        emoji: fd.get('emoji') || '🐾',
        accent: '#86b9ad',
        region: fd.get('region') || '',
        knowledge: fd.get('knowledge') || ''
      });
      window.KOMODO_STORE.save();
      notify('Species added');
      return;
    }

    if (type === 'activity-official') {
      db.activities.push({
        id: window.KOMODO_STORE.nextId('act'),
        title: fd.get('title'),
        type: fd.get('type'),
        date: fd.get('date'),
        host: 'Komodo Hub Official',
        status: 'approved',
        signups: []
      });
      window.KOMODO_STORE.save();
      notify('Official activity created');
      return;
    }

    if (type === 'activity-community') {
      db.activities.push({
        id: window.KOMODO_STORE.nextId('act'),
        title: fd.get('title'),
        type: fd.get('type'),
        date: fd.get('date'),
        host: window.KOMODO_STORE.db.organisations.find((o) => o.id === u.orgId)?.name || 'Community',
        orgId: u.orgId,
        status: 'pending',
        signups: []
      });
      window.KOMODO_STORE.save();
      notify('Community activity submitted for review');
      return;
    }

    if (type === 'task-publish') {
      const cls = db.classes.find((c) => c.teacherId === u.id);
      if (!cls) return notify('Create a class first');
      db.tasks.push({
        id: window.KOMODO_STORE.nextId('task'),
        classId: cls.id,
        title: fd.get('title'),
        type: fd.get('type'),
        due: fd.get('due'),
        description: fd.get('description') || ''
      });
      window.KOMODO_STORE.save();
      notify('Task published to your class');
      return;
    }

    if (type === 'library-add') {
      db.library.push({
        id: window.KOMODO_STORE.nextId('lib'),
        orgId: u.orgId,
        title: fd.get('title'),
        body: fd.get('body'),
        createdAt: new Date().toISOString().slice(0, 10)
      });
      window.KOMODO_STORE.save();
      notify('Article published to community library');
      return;
    }

    if (type === 'org-edit') {
      const org = db.organisations.find((o) => o.id === u.orgId);
      if (org) {
        org.name = fd.get('name');
        org.bio = fd.get('bio');
        window.KOMODO_STORE.save();
        notify('Organisation home updated');
      }
      return;
    }

    if (type === 'user-role') {
      const target = db.users.find((x) => x.email.toLowerCase() === String(fd.get('email')).trim().toLowerCase());
      if (target) {
        target.role = fd.get('role');
        window.KOMODO_STORE.save();
        notify('Role updated');
      } else notify('User not found');
    }
  }

  document.querySelector('#logoutBtn').onclick = () => {
    window.KOMODO_AUTH.logout();
    state.view = null;
    state.reportFilter = 'all';
    state.searchQuery = '';
    state.authPage = 'login';
    renderLogin();
    notify('Signed out');
  };

  document.querySelector('#modalClose').onclick = hideModal;
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  if (window.KOMODO_AUTH.effectiveRole()) bootApp();
  else renderLogin();
})();
