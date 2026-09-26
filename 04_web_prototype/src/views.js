(function () {
  function esc(s) {
    return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function db() {
    return window.KOMODO_STORE.db;
  }

  function user() {
    return window.KOMODO_AUTH.currentUser();
  }

  function role() {
    return window.KOMODO_AUTH.effectiveRole();
  }

  function studentNeedsJoin() {
    const u = user();
    return role() === 'student' && !window.KOMODO_AUTH.studentInClass(u);
  }

  function joinClassPanel() {
    return `
      <section class="panel join-class-panel">
        <span class="pill amber">Not in a class</span>
        <h3>Enter the class access code from your teacher</h3>
        <p class="muted">After verification you can receive tasks, announcements, messages, and submit class reports.</p>
        <form class="stack-form" data-join-class style="max-width:360px">
          <label>Class access code<input name="accessCode" required placeholder="From your teacher" autocomplete="off" /></label>
          <button type="submit" class="primary">Verify and join class</button>
        </form>
      </section>`;
  }

  function canSeeSubmitter(report) {
    const r = role();
    const u = user();
    if (!u) return false;
    if (r === 'admin') return true;
    if (r === 'teacher' && report.submitterRole === 'student') {
      const cls = db().classes.find((c) => c.teacherId === u.id);
      return cls && cls.studentIds.includes(report.submitterId);
    }
    if (u.id === report.submitterId) return true;
    return false;
  }

  function publicAuthorLabel(report) {
    if (report.submitterRole === 'student') return 'Student sighting (identity hidden)';
    const su = window.KOMODO_STORE.userById(report.submitterId);
    if (su && report.submitterRole === 'public') return su.name;
    if (report.submitterRole === 'community') return 'Community member';
    if (report.submitterRole === 'teacher') return 'Teacher sighting';
    return 'Platform user';
  }

  function reportAuthorDisplay(report) {
    if (canSeeSubmitter(report)) {
      const su = window.KOMODO_STORE.userById(report.submitterId);
      return su ? `${su.name} (${report.submitterRole})` : report.submitterId;
    }
    return publicAuthorLabel(report);
  }

  function reportStatusLabel(status) {
    return ({
      pending_teacher: 'Pending teacher review',
      pending_admin: 'Pending admin review',
      pending: 'Pending review',
      approved: 'Published',
      rejected: 'Rejected'
    })[status] || status;
  }

  function activityStatusLabel(status) {
    return ({
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected'
    })[status] || status;
  }

  function pendingCount() {
    return db().reports.filter((r) => r.status === 'pending_admin' || r.status === 'pending').length;
  }

  function metrics() {
    const d = db();
    return {
      users: d.users.filter((u) => !u.disabled).length,
      records: d.reports.filter((r) => r.status === 'approved').length,
      activityJoins: d.activities.reduce((n, a) => n + (a.signups?.length || 0), 0),
      abuse: d.reportsAbuse.filter((x) => x.status === 'open').length,
      pending: pendingCount()
    };
  }

  function speciesCard(s, extra) {
    return `<article class="species-card" style="--accent:${esc(s.accent)}">
      <div class="species-art">${s.emoji}</div>
      <div class="species-copy">
        <span>${esc(s.level)}</span>
        <h3>${esc(s.name)}</h3>
        <i>${esc(s.latin)}</i>
        <p class="species-blurb"><strong>Habitat</strong> ${esc(s.habitat)} · <strong>Population</strong> ${esc(s.population)}</p>
        <p class="species-blurb"><strong>Threats</strong> ${esc(s.threats)} · <strong>Protection</strong> ${esc(s.protectionMethods)}</p>
        ${extra || ''}
      </div>
    </article>`;
  }

  function isMuted(uid) {
    return uid && db().mutedUsers[uid];
  }

  function reportCard(r, opts) {
    const showAdminMod = opts?.moderation && role() === 'admin' && r.status === 'pending_admin';
    const showAdminPostMod = opts?.moderation && role() === 'admin' && r.status === 'approved';
    const showTeacherMod = opts?.teacherReview && role() === 'teacher' && r.status === 'pending_teacher';
    const showTeacherGrade = opts?.teacherReview && role() === 'teacher' && r.submitterRole === 'student';
    const author = reportAuthorDisplay(r);
    return `<article class="report-card">
      <div class="report-image">${r.image}<span>${esc(reportStatusLabel(r.status))}</span></div>
      <div class="report-body">
        <div class="report-heading">
          <div><span class="eyebrow">${esc(r.id)}</span><h3>${esc(r.species)}</h3><i>${esc(r.latin)}</i></div>
          <span class="status ${esc(r.status)}">${esc(reportStatusLabel(r.status))}</span>
        </div>
        <p>${esc(r.text)}</p>
        ${r.envCondition ? `<p class="muted tiny">Conditions: ${esc(r.envCondition)}</p>` : ''}
        <div class="report-details">
          <span>⌖ ${esc(r.place)}</span><span>◷ ${esc(r.date)}</span><span>◉ ${esc(author)}</span>
        </div>
        ${r.submitterRole === 'student' && !canSeeSubmitter(r) ? '<div class="privacy-callout">🔒 Public view shows report content only—no student name, class, or identifying details</div>' : ''}
        ${r.teacherReviewNote ? `<div class="privacy-callout">Teacher note: ${esc(r.teacherReviewNote)}</div>` : ''}
        ${r.status === 'rejected' && r.rejectReason ? `<div class="privacy-callout warn">Rejection reason: ${esc(r.rejectReason)}</div>` : ''}
        <div class="card-actions">
          ${showTeacherMod ? `
            <button type="button" class="primary small" data-teacher-approve="${esc(r.id)}">Approve & send to admin</button>
            <button type="button" class="ghost small" data-teacher-reject="${esc(r.id)}">Return to student</button>` : ''}
          ${showAdminMod ? `
            <button type="button" class="primary small" data-approve="${esc(r.id)}">Approve & publish</button>
            <button type="button" class="ghost small" data-reject="${esc(r.id)}">Reject</button>` : ''}
          ${showAdminPostMod ? `
            <button type="button" class="ghost small" data-admin-delete-post="${esc(r.id)}">Remove post</button>
            <button type="button" class="ghost small" data-admin-warn-user="${esc(r.submitterId)}">Warn user</button>` : ''}
          ${showTeacherGrade ? `
            <form class="inline-form" data-grade-report="${esc(r.id)}">
              <input name="score" type="number" min="0" max="100" placeholder="Score" value="${esc(r.reportScore ?? '')}" />
              <input name="note" placeholder="Feedback" value="${esc(r.teacherReviewNote || '')}" />
              <button type="submit" class="primary small">Save score</button>
            </form>` : ''}
          ${opts?.commentLink ? `<button type="button" class="text-btn" data-open-report="${esc(r.id)}">View discussion →</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  function feedCard(r, opts) {
    const comments = db().comments.filter((c) => c.reportId === r.id);
    const isCommMod = opts?.communityMod && role() === 'community';
    const isAdminMod = opts?.adminFeedMod && role() === 'admin';
    return `<article class="feed-card" id="feed-${esc(r.id)}">
      <div class="feed-top">
        <span class="animal-chip">${r.image}</span>
        <div><strong>${esc(r.species)}</strong><small>${esc(r.place)} · ${esc(r.date)}</small></div>
        <span class="verified">✓ Verified</span>
      </div>
      <p>${esc(r.text)}</p>
      <div class="feed-meta"><span>♡ ${comments.length + 12}</span><span>◌ ${comments.length} comments</span></div>
      <div class="comment-block">
        ${comments.map((c) => `<div class="comment-row"><strong>${esc(c.authorName)}</strong><span>${esc(c.createdAt)}</span><p>${esc(c.text)}</p></div>`).join('')}
        ${role() && role() !== 'guest' && !isMuted(user()?.id) ? `<form class="inline-form" data-comment-report="${esc(r.id)}">
          <input name="text" placeholder="Write a comment…" required maxlength="280" />
          <button type="submit" class="primary small">Send</button>
        </form>` : ''}
        ${role() && role() !== 'guest' && isMuted(user()?.id) ? '<p class="muted tiny">You are muted and cannot comment</p>' : ''}
        ${role() === 'guest' ? '<p class="muted tiny">Sign in to join the discussion</p>' : ''}
        ${role() === 'public' ? `<button type="button" class="text-btn" data-abuse-report="${esc(r.id)}" data-abuse-target="community">Report post (community leader)</button>` : ''}
        ${role() && role() !== 'guest' && role() !== 'public' ? `<button type="button" class="text-btn" data-abuse-report="${esc(r.id)}" data-abuse-target="admin">Report</button>` : ''}
        ${isCommMod ? `<div class="card-actions"><button type="button" class="ghost small" data-community-delete-post="${esc(r.id)}">Remove post</button></div>` : ''}
        ${isAdminMod ? `<div class="card-actions"><button type="button" class="ghost small" data-admin-delete-post="${esc(r.id)}">Remove post</button></div>` : ''}
      </div>
    </article>`;
  }

  const TITLES = {
    dashboard: 'Admin dashboard',
    users: 'Users & orgs',
    'community-orgs': 'Community org approval',
    species: 'Species library',
    reports: 'Content moderation',
    communities: 'Join communities',
    'profile-public': 'Profile',
    'guest-activities': 'Public activities',
    activities: 'Conservation activities',
    learning: 'Learning modules',
    'conservation-activities': 'Conservation activities',
    'report-review': 'Student report review',
    courses: 'Course materials',
    home: 'Welcome back',
    tasks: 'Learning tasks',
    community: 'Community feed',
    profile: 'Profile (private)',
    messages: 'Messages',
    classroom: 'Classroom',
    search: 'Search',
    favorites: 'Favorites',
    'org-home': 'Org home',
    members: 'Members',
    library: 'Community library',
    posts: 'Posts & reports',
    browse: 'Public species library'
  };

  window.KOMODO_VIEWS = {
    esc,
    title(view) { return TITLES[view] || 'Komodo Hub'; },
    metrics,
    publicAuthorLabel,
    canSeeSubmitter,

    render(view, ctx) {
      const fn = views[view];
      return fn ? fn(ctx || {}) : '<p>Page not found</p>';
    }
  };

  const views = {
    dashboard() {
      if (role() === 'community') {
        const org = db().organisations.find((o) => o.id === user()?.orgId);
        return `
          <section class="metrics">
            <div class="metric"><small>Community member</small><strong>${org?.memberIds.length || 0}</strong></div>
            <div class="metric"><small>Library articles</small><strong>${db().library.filter((l) => l.orgId === org?.id).length}</strong></div>
            <div class="metric"><small>Pending activities</small><strong>${db().activities.filter((a) => a.orgId === org?.id && a.status === 'pending').length}</strong></div>
            <div class="metric"><small>Open reports</small><strong>${db().reportsAbuse.filter((x) => x.status === 'open').length}</strong></div>
          </section>
          <div class="panel"><h3>${esc(org?.name)}</h3><p>${esc(org?.bio)}</p></div>`;
      }
      const m = metrics();
      const queue = db().reports.filter((r) => r.status === 'pending_admin').slice(0, 3);
      return `
        <section class="metrics">
          <div class="metric"><small>Registered users</small><strong>${m.users}</strong></div>
          <div class="metric"><small>Published records</small><strong>${m.records}</strong></div>
          <div class="metric"><small>Activity sign-ups</small><strong>${m.activityJoins}</strong></div>
          <div class="metric"><small>Open reports</small><strong>${m.abuse}</strong></div>
        </section>
        <section class="split">
          <div class="panel">
            <div class="panel-head"><div><span class="eyebrow">REVIEW QUEUE</span><h3>Pending reviewReports ${m.pending}</h3></div></div>
            ${queue.length ? queue.map((r) => `<div class="queue-row"><span class="animal-chip">${r.image}</span><div><strong>${esc(r.species)}</strong><small>${esc(r.place)}</small></div><span class="row-id">${esc(r.id)}</span></div>`).join('') : '<p class="muted">NonePending review</p>'}
          </div>
          <div class="panel dark"><span class="eyebrow">AUDIT</span><h3>Recent moderation</h3>
            ${db().audit.slice(0, 5).map((a) => `<div class="queue-row dark-row"><div><strong>${esc(a.action)}</strong><small>${esc(a.detail)} · ${esc(a.at.slice(0, 16))}</small></div></div>`).join('') || '<small class="muted">No entries yet</small>'}
          </div>
        </section>`;
    },

    users() {
      return `
        <section class="section-head"><div><span class="pill amber">User management</span><p>Disable accounts, change roles. Approve pending teacher registrations in demo.</p></div>
          <button type="button" class="primary" data-modal="user-role">Assign role</button></section>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th>Actions</th></tr></thead>
          <tbody>${db().users.map((u) => `<tr>
            <td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td>
            <td>${u.accountStatus === 'pending' ? '<span class="status pending">Pending</span>' : u.disabled ? '<span class="status rejected">Disabled</span>' : '<span class="status approved">Active</span>'}</td>
            <td>
              ${u.accountStatus === 'pending' ? `<button type="button" class="primary small" data-approve-user="${esc(u.id)}">Approve account</button>` : ''}
              <button type="button" class="text-btn" data-toggle-user="${esc(u.id)}">${u.disabled ? 'Enable' : 'Disabled'}</button>
            </td>
          </tr>`).join('')}</tbody>
        </table></div>`;
    },

    'community-orgs'() {
      return `
        <section class="section-head"><div><span class="eyebrow">ORG APPROVAL</span><h2>Community organisations</h2><p>Approve new community applications.</p></div></section>
        <div class="activity-list">${db().organisations.map((o) => `<article>
          <div><span class="pill ${o.status === 'approved' ? 'green' : 'amber'}">${esc(o.status)}</span>
          <h3>${esc(o.name)}</h3><p>${esc(o.bio)} · ${o.memberIds.length} members</p></div>
          ${o.status === 'pending' ? `<button type="button" class="primary small" data-approve-org="${esc(o.id)}">Approve org</button>` : ''}
        </article>`).join('')}</div>`;
    },

    species(ctx) {
      const isAdmin = role() === 'admin';
      const q = (ctx.searchQuery || '').trim().toLowerCase();
      let list = db().species;
      if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || s.latin.toLowerCase().includes(q));
      const u = user();
      const fav = u ? (db().favorites[u.id] || []) : [];
      return `
        <section class="section-head"><div><span class="eyebrow">KNOWLEDGE LIBRARY</span><h2>Species library</h2>
          <p>${role() === 'guest' ? 'Browse without signing in.' : 'Public read; admins maintain entries.'}</p></div>
          ${isAdmin ? '<button type="button" class="primary" data-modal="species-add">+ Add species</button>' : ''}
        </section>
        <div class="species-grid">${list.map((s) => {
          let extra = '';
          if (isAdmin) extra = `<button type="button" class="ghost small" data-delete-species="${esc(s.id)}">Delete</button>`;
          else if (u && role() === 'public') {
            extra = fav.includes(s.id)
              ? `<span class="pill green">Saved</span>`
              : `<button type="button" class="text-btn" data-add-fav="${esc(s.id)}">♡ Save</button>`;
          }
          return speciesCard(s, extra);
        }).join('')}</div>`;
    },

    reports(ctx) {
      const r = role();
      const u = user();
      if (r === 'admin') {
        const filter = ctx.reportFilter || 'all';
        let list = db().reports;
        if (filter !== 'all') list = list.filter((x) => x.status === filter);
        return `
          <section class="section-head"><div><span class="pill amber">Content moderation</span><p>Admins do not post sightings; they moderate community content—approve, remove, or warn.</p></div></section>
          <section class="filter-row">
            <button type="button" class="filter ${filter === 'all' ? 'active' : ''}" data-report-filter="all">All</button>
            <button type="button" class="filter ${filter === 'pending_admin' ? 'active' : ''}" data-report-filter="pending_admin">Pending admin</button>
            <button type="button" class="filter ${filter === 'approved' ? 'active' : ''}" data-report-filter="approved">Published</button>
          </section>
          <div class="report-list">${list.map((rep) => reportCard(rep, { moderation: true })).join('')}</div>`;
      }
      const canSubmit = ['student', 'teacher', 'public'].includes(r);
      let mine = db().reports;
      if (r === 'student' || r === 'teacher' || r === 'public') {
        mine = mine.filter((rep) => rep.submitterId === u?.id);
      }
      const studentBlocked = r === 'student' && studentNeedsJoin();
      return `
        <section class="section-head"><div><span class="eyebrow">OBSERVATION</span><h2>Wildlife observation reports</h2>
          <p>Submit for review; when approved, posts appear in the community (student identity hidden).</p></div>
          ${canSubmit && !studentBlocked ? '<button type="button" class="primary" data-modal="report-submit">+ Submit report</button>' : ''}
        </section>
        ${studentBlocked ? joinClassPanel() : ''}
        <div class="report-list">${mine.length ? mine.map((rep) => reportCard(rep, {})).join('') : '<p class="muted">No reports yet</p>'}
        ${canSubmit ? '' : ''}</div>`;
    },

    activities() {
      const r = role();
      const isAdmin = r === 'admin';
      const isCommunity = r === 'community';
      return `
        <section class="section-head"><div><span class="eyebrow">ACTION CALENDAR</span><h2>Conservation activities</h2></div>
          ${isAdmin ? '<button type="button" class="primary" data-modal="activity-official">+ Official activity</button>' : ''}
          ${isCommunity ? '<button type="button" class="primary" data-modal="activity-community">+ Community activity</button>' : ''}
        </section>
        <div class="activity-list">${db().activities.map((a) => {
          const joined = user() && a.signups.includes(user().id);
          return `<article><span class="date">${esc(a.date.slice(8, 10))}<br><small>${esc(a.date.slice(5, 7))}</small></span>
            <div><span class="pill ${a.status === 'approved' ? 'green' : 'amber'}">${esc(a.type)} · ${esc(activityStatusLabel(a.status))}</span>
            <h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p class="muted tiny">${esc(a.startDate)} — ${esc(a.endDate)} · Task: ${esc(a.requiredTask)}</p></div>
            ${a.status === 'approved' && user() && !joined ? `<button type="button" class="primary small" data-join-activity="${esc(a.id)}">Sign up</button>` : ''}
            ${joined ? '<span class="pill green">Signed up</span>' : ''}
            ${isAdmin && a.status === 'pending' ? `<button type="button" class="text-btn" data-approve-activity="${esc(a.id)}">Approve</button>` : ''}
          </article>`;
        }).join('')}</div>`;
    },

    community() {
      const approved = db().reports.filter((x) => x.status === 'approved');
      return `
        <section class="section-head"><div><span class="eyebrow">PUBLIC STREAM</span><h2>Community feed</h2>
          <p>Approved content only; student reports hide personal identity.</p></div>
          ${['student', 'teacher', 'public'].includes(role()) ? '<button type="button" class="primary" data-modal="report-submit">+ Post sighting</button>' : ''}
        </section>
        <div class="feed">${approved.length ? approved.map(feedCard).join('') : '<p class="muted">No public posts yet</p>'}</div>`;
    },

    home() {
      const r = role();
      if (r === 'student') {
        if (studentNeedsJoin()) {
          return `
            <section class="hero student-hero"><div>
              <span class="pill amber">Student</span>
              <h2>Hi, ${esc(user()?.name)}<em> · join your class first</em></h2>
              <p>Ask your teacher for an access code to receive tasks, announcements, and feedback.</p>
            </div></section>
            ${joinClassPanel()}`;
        }
        const tasks = db().tasks.filter((t) => t.classId === user()?.classId);
        const prog = db().learningProgress[user()?.id] || { completedLessons: [], quizScores: {}, activityPoints: 0 };
        const totalLessons = db().lessons.length;
        const cls = db().classes.find((c) => c.id === user()?.classId);
        const anns = db().announcements.filter((a) => a.classId === cls?.id).slice(0, 3);
        return `
          <section class="hero student-hero"><div>
            <span class="pill green">Student</span>
            <h2>Hi, ${esc(user()?.name)}<em> · continue your conservation learning</em></h2>
            <p>Class: ${esc(cls?.name || '—')} · Progress: ${prog.completedLessons.length}/${totalLessons} lessons · points ${prog.activityPoints}</p>
            <p>Profile visible to your teacher only; community posts hide your identity.</p>
            <div class="hero-actions">
              <button type="button" class="primary" data-go-view="tasks">View tasks</button>
              <button type="button" class="text-btn" data-go-view="messages">Messages</button>
            </div>
          </div></section>
          ${anns.length ? `<div class="panel"><span class="eyebrow">Class announcements</span>${anns.map((a) => `<p>${esc(a.text)} <small class="muted">${esc(a.createdAt)}</small></p>`).join('')}</div>` : ''}
          <div class="class-grid">${tasks.map((t) => `<div class="panel"><span class="eyebrow">TASK</span><h3>${esc(t.title)}</h3><p>${esc(t.type)} · due ${esc(t.due)}</p></div>`).join('') || '<p class="muted">No tasks</p>'}</div>`;
      }
      if (r === 'teacher') {
        const cls = db().classes.filter((c) => c.teacherId === user()?.id);
        return `
          <section class="hero"><div><span class="pill blue">Teacher</span>
            <h2>Class teaching & <em>community</em> in parallel</h2>
            <p>In Classroom, view and share the <strong>Class access code</strong>, so students can receive tasks and announcements.</p>
            <button type="button" class="primary" data-go-view="classroom">Open classroom</button>
          </div></section>
          <div class="class-grid">${cls.map((c) => `<div class="panel"><h3>${esc(c.name)}</h3><p>${c.studentIds.length} students · code <code class="inline-code">${esc(c.accessCode || '—')}</code></p></div>`).join('') || '<p class="muted">No class yet</p>'}</div>`;
      }
      return `
        <section class="hero"><div><span class="pill green">Public</span>
          <h2>Explore species, <em>join the conservation community</em></h2>
          <p>Sign up to post reports, comment, save favorites, and join activities.</p>
          <div class="hero-actions">
            <button type="button" class="primary" data-go-view="species">Browse species</button>
            <button type="button" class="text-btn" data-go-view="activities">View activities</button>
          </div>
        </div></section>`;
    },

    tasks() {
      const r = role();
      if (r === 'student') {
        if (studentNeedsJoin()) {
          return `<section class="section-head"><h2>Learning tasks</h2></section>${joinClassPanel()}`;
        }
        const list = db().tasks.filter((t) => t.classId === user()?.classId);
        const subs = db().submissions;
        return `
          <section class="section-head"><div><h2>Tasks from your teacher</h2></div></section>
          <div class="class-grid">${list.map((t) => {
            const sub = subs.find((s) => s.taskId === t.id && s.studentId === user()?.id);
            return `<div class="panel"><span class="eyebrow">${esc(t.type)}</span><h3>${esc(t.title)}</h3>
              <p>${esc(t.description)}</p><p>Due ${esc(t.due)}</p>
              <form class="stack-form" data-submit-task="${esc(t.id)}">
                <textarea name="content" placeholder="Your submission" required>${esc(sub?.content || '')}</textarea>
                <button type="submit" class="primary small">Submit work</button>
              </form>
              ${sub?.score != null ? `<p><strong>Score: ${esc(sub.score)}</strong></p>` : ''}
              ${sub?.feedbackPrivate ? `<div class="privacy-callout">TeacherFeedback：${esc(sub.feedbackPrivate)}</div>` : ''}
            </div>`;
          }).join('')}</div>`;
      }
      if (r === 'teacher') {
        const cls = db().classes.find((c) => c.teacherId === user()?.id);
        const list = db().tasks.filter((t) => t.classId === cls?.id);
        return `
          <section class="section-head"><div><h2>Tasks & feedback</h2></div>
            <button type="button" class="primary" data-modal="task-publish">＋ PublishLearning tasks</button></section>
          <div class="class-grid">${list.map((t) => {
            const subs = db().submissions.filter((s) => s.taskId === t.id);
            return `<div class="panel"><h3>${esc(t.title)}</h3>
              ${subs.map((s) => {
                const st = window.KOMODO_STORE.userById(s.studentId);
                return `<div class="submission-row"><strong>${esc(st?.name)}</strong><p>${esc(s.content)}</p>
                  <form class="inline-form" data-feedback="${esc(s.id)}">
                    <input name="score" type="number" min="0" max="100" placeholder="Score" value="${esc(s.score ?? '')}" />
                    <input name="private" placeholder="Private note (student only)" value="${esc(s.feedbackPrivate || '')}" />
                    <input name="public" placeholder="Optional public comment" value="${esc(s.feedbackPublic || '')}" />
                    <button type="submit" class="primary small">Save feedback</button>
                  </form></div>`;
              }).join('') || '<p class="muted">No submissions</p>'}
            </div>`;
          }).join('')}</div>`;
      }
      return '<p class="muted">No tasks for this role</p>';
    },

    profile() {
      if (role() !== 'student') return '<p class="muted">Students only</p>';
      const u = user();
      return `
        <section class="section-head"><div><span class="pill amber">Private</span><h2>Profile</h2>
          <p>Not public; only your teacher sees full records.</p></div></section>
        <div class="class-grid">
          <div class="panel profile-panel" style="--student-theme:${esc(u.studentProfile?.themeColor || '#3d5a80')}"><h3>${u.studentProfile?.avatarEmoji || '🎒'} ${esc(u.name)}</h3>
            <p>Student ID: ${esc(u.studentProfile?.studentId || '—')} · Class: ${esc(u.studentProfile?.className || '—')} · Grade: ${esc(u.studentProfile?.grade || '—')}</p>
            <p>School: ${esc(db().schools.find((s) => s.id === u.studentProfile?.schoolId)?.name || '—')}</p>
            <p>Date of birth: ${esc(u.studentProfile?.dob || '—')} · Gender: ${esc(u.studentProfile?.gender || '—')}</p>
            <p>Badges: ${(u.badges || []).map(esc).join(', ') || 'None'}</p>
            <form class="stack-form" data-profile-student>
              <label>Gender<select name="gender"><option value="M" ${u.studentProfile?.gender === 'M' ? 'selected' : ''}>Male</option><option value="F" ${u.studentProfile?.gender === 'F' ? 'selected' : ''}>Female</option><option value="" ${!u.studentProfile?.gender ? 'selected' : ''}>Prefer not to say</option></select></label>
              <button type="submit" class="primary small">Save profile</button>
            </form>
            <form class="stack-form" data-profile-theme>
              <label>Theme color<input name="themeColor" type="color" value="${esc(u.studentProfile?.themeColor || '#3d5a80')}" /></label>
              <label>Background<select name="profileBg"><option value="forest" ${u.studentProfile?.profileBg === 'forest' ? 'selected' : ''}>forest</option><option value="ocean" ${u.studentProfile?.profileBg === 'ocean' ? 'selected' : ''}>ocean</option></select></label>
              <button type="submit" class="primary small">Save theme</button>
            </form>
          </div>
          <div class="panel"><span class="eyebrow">Learning log</span>
            ${db().submissions.filter((s) => s.studentId === u.id).map((s) => `<p>${esc(s.content)}</p>`).join('') || '<p class="muted">None</p>'}
          </div>
        </div>`;
    },

    messages() {
      const u = user();
      if (role() === 'student' && studentNeedsJoin()) {
        return `<section class="section-head"><h2>Messages</h2></section>${joinClassPanel()}`;
      }
      const inbox = db().messages.filter((m) => m.toId === u?.id || m.fromId === u?.id);
      let teacherOptions = db().users.filter((x) => x.role === 'teacher');
      if (role() === 'student' && u?.studentProfile?.teacherId) {
        const t = window.KOMODO_STORE.userById(u.studentProfile.teacherId);
        teacherOptions = t ? [t] : teacherOptions;
      }
      const recipientOptions = role() === 'student'
        ? teacherOptions
        : db().users.filter((x) => x.role === 'teacher' || x.role === 'student');
      return `
        <section class="section-head"><div><h2>Messages</h2></div></section>
        <div class="panel">${inbox.map((m) => {
          const other = window.KOMODO_STORE.userById(m.fromId === u.id ? m.toId : m.fromId);
          return `<div class="comment-row"><strong>${esc(other?.name)}</strong><span>${esc(m.createdAt)}</span><p>${esc(m.text)}</p></div>`;
        }).join('') || '<p class="muted">No messages</p>'}
        <form class="stack-form" data-send-message><select name="toId">${recipientOptions.map((x) => `<option value="${esc(x.id)}">${esc(x.name)} (${esc(x.role)})</option>`).join('')}</select>
          <p class="muted tiny">${role() === 'student' ? 'Visible to your class teacher only' : ''}</p>
          <textarea name="text" required placeholder="Your message"></textarea>
          <button type="submit" class="primary small">Send</button>
        </form></div>`;
    },

    classroom() {
      const cls = db().classes.find((c) => c.teacherId === user()?.id);
      if (!cls) {
        return `<p class="muted">Create a class first (an access code is generated automatically)</p>
          <form class="stack-form" data-create-class><input name="name" placeholder="Class name" required /><button type="submit" class="primary">Create class</button></form>`;
      }
      const students = cls.studentIds.map((id) => window.KOMODO_STORE.userById(id)).filter(Boolean);
      const reports = db().reports.filter((r) => students.some((s) => s.id === r.submitterId));
      const code = cls.accessCode || '—';
      return `
        <section class="section-head"><div><h2>${esc(cls.name)}</h2><p>Full progress for students in this class only.</p></div>
          <button type="button" class="primary" data-modal="task-publish">Publish task</button></section>
        <div class="panel access-code-panel">
          <span class="eyebrow">CLASS ACCESS CODE</span>
          <h3>Class access code</h3>
          <p class="access-code-display"><code>${esc(code)}</code></p>
          <p class="muted tiny">Students enter this code when registering or signing in to join the class.</p>
          <div class="card-actions">
            <button type="button" class="primary small" data-copy-access-code="${esc(code)}">Copy code</button>
            <button type="button" class="ghost small" data-regenerate-access-code="${esc(cls.id)}">Regenerate code</button>
          </div>
        </div>
        <div class="panel"><span class="eyebrow">ANNOUNCEMENT</span>
          ${db().announcements.filter((a) => a.classId === cls.id).map((a) => `<p>${esc(a.text)} <small>${esc(a.createdAt)}</small></p>`).join('')}
          <form class="inline-form" data-post-announcement><input name="text" placeholder="Class announcement…" required /><button type="submit" class="primary small">Publish</button></form>
        </div>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Reports</th><th>Work status</th></tr></thead>
          <tbody>${students.map((s) => {
            const rep = reports.filter((r) => r.submitterId === s.id);
            const sub = db().submissions.find((x) => x.studentId === s.id);
            return `<tr><td>${esc(s.name)}</td><td>${rep.map((r) => esc(r.id) + ' (' + r.status + ')').join(', ') || '—'}</td><td>${sub?.status || '—'}</td></tr>`;
          }).join('') || '<tr><td colspan="3" class="muted">No students yet—share your access code</td></tr>'}</tbody></table></div>`;
    },

    search(ctx) {
      const q = (ctx.searchQuery || '').trim().toLowerCase();
      if (!q) {
        return `<section class="section-head"><h2>Search</h2></section>
          <form class="search-hero" data-global-search><input name="q" placeholder="Species, reports, Library articles…" autofocus /><button type="submit" class="primary">Search</button></form>`;
      }
      const species = db().species.filter((s) => s.name.toLowerCase().includes(q) || s.latin.toLowerCase().includes(q));
      const reports = db().reports.filter((r) => r.status === 'approved' && (r.species.includes(q) || r.text.toLowerCase().includes(q)));
      const articles = db().library.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
      return `
        <form class="search-hero" data-global-search><input name="q" value="${esc(ctx.searchQuery)}" /><button type="submit" class="primary">Search</button></form>
        <h3>Species (${species.length})</h3><div class="species-grid">${species.map((s) => speciesCard(s)).join('') || '<p class="muted">None</p>'}</div>
        <h3>CommunityReports (${reports.length})</h3><div class="feed">${reports.map(feedCard).join('') || '<p class="muted">None</p>'}</div>
        <h3>Library (${articles.length})</h3>${articles.map((a) => `<div class="panel"><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p></div>`).join('') || '<p class="muted">None</p>'}`;
    },

    favorites() {
      const u = user();
      const fav = db().favorites[u?.id] || [];
      const species = db().species.filter((s) => fav.includes(s.id));
      const reports = db().reports.filter((r) => fav.includes(r.id) && r.status === 'approved');
      return `
        <section class="section-head"><h2>Favorites</h2></section>
        <h3>Species</h3><div class="species-grid">${species.map((s) => speciesCard(s, `<button type="button" class="text-btn" data-unfav="${esc(s.id)}">Remove</button>`)).join('') || '<p class="muted">None</p>'}</div>
        <h3>Reports</h3><div class="feed">${reports.map(feedCard).join('') || '<p class="muted">None</p>'}</div>`;
    },

    browse() {
      return views.species({});
    },

    'org-home'() {
      const org = db().organisations.find((o) => o.id === user()?.orgId);
      return `
        <section class="section-head"><div><h2>Org home</h2></div>
          <button type="button" class="primary" data-modal="org-edit">Edit public info</button></section>
        <div class="panel"><h3>${esc(org?.name)}</h3><p>${esc(org?.bio)}</p><span class="pill green">${esc(org?.status)}</span></div>`;
    },

    members() {
      const org = db().organisations.find((o) => o.id === user()?.orgId);
      const members = (org?.memberIds || []).map((id) => window.KOMODO_STORE.userById(id));
      return `
        <section class="section-head"><h2>Members</h2></section>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>${members.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td>
            <td>${m.id !== user()?.id ? `<button type="button" class="ghost small" data-remove-member="${esc(m.id)}">Remove</button>` : 'Leader'}</td></tr>`).join('')}</tbody></table></div>
        <form class="inline-form" data-add-member><input name="email" placeholder="Member email" required /><button type="submit" class="primary small">Add member</button></form>`;
    },

    library() {
      const orgId = user()?.orgId;
      const articles = db().library.filter((l) => l.orgId === orgId);
      return `
        <section class="section-head"><div><h2>Community library</h2></div>
          <button type="button" class="primary" data-modal="library-add">Publish article</button></section>
        ${articles.map((a) => `<article class="feed-card"><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><small>${esc(a.createdAt)}</small></article>`).join('') || '<p class="muted">No articles</p>'}`;
    },

    posts() {
      const abuse = db().reportsAbuse.filter((x) => x.status === 'open' && (x.target === 'community' || !x.target));
      const approved = db().reports.filter((x) => x.status === 'approved');
      return `
        <section class="section-head"><div><h2>Post moderation</h2><p>Remove posts and mute members. Public reports appear here.</p></div></section>
        <h3>Open reports</h3>
        ${abuse.length ? abuse.map((a) => `<div class="panel"><p>Post ${esc(a.reportId)} · ${esc(a.reason)}</p>
          <button type="button" class="primary small" data-resolve-abuse="${esc(a.id)}">Mark resolved</button>
          <button type="button" class="ghost small" data-community-delete-post="${esc(a.reportId)}">Remove post</button></div>`).join('') : '<p class="muted">NoneReport</p>'}
        <h3>Community feed (moderation)</h3>
        <div class="feed">${approved.map((r) => feedCard(r, { communityMod: true })).join('')}</div>
        <h3>Mute member</h3>
        <form class="inline-form" data-mute-member><input name="email" placeholder="Member email" required /><button type="submit" class="ghost small">Mute</button></form>`;
    },

    learning() {
      const u = user();
      const prog = db().learningProgress[u?.id] || { completedLessons: [], quizScores: {} };
      return `
        <section class="section-head"><div><h2>Learning modules</h2><p>Articles, video, quizzes; progress is tracked.</p></div></section>
        <div class="class-grid">${db().lessons.map((les) => {
          const sp = db().species.find((s) => s.id === les.speciesId);
          const done = prog.completedLessons.includes(les.id);
          const score = prog.quizScores[les.id];
          return `<div class="panel"><span class="pill ${done ? 'green' : 'amber'}">${esc(les.type)}</span>
            <h3>${esc(les.title)}</h3><p>${sp ? esc(sp.name) : ''} · ${les.durationMin} min</p>
            ${les.type === 'quiz' ? `<p>Quiz score: ${score != null ? score + '%' : '—'}</p>
              <button type="button" class="primary small" data-complete-quiz="${esc(les.id)}">Complete quiz (demo 85%)</button>` : ''}
            ${!done && les.type !== 'quiz' ? `<button type="button" class="primary small" data-complete-lesson="${esc(les.id)}">Mark complete</button>` : ''}
            ${done ? '<span class="pill green">Complete</span>' : ''}
          </div>`;
        }).join('')}</div>`;
    },

    'conservation-activities'() {
      const u = user();
      return `
        <section class="section-head"><div><h2>Conservation activities</h2><p>Browse activities and sign up; submit work as required.</p></div></section>
        <div class="activity-list">${db().activities.filter((a) => a.status === 'approved').map((a) => {
          const joined = u && a.signups.includes(u.id);
          return `<article><div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p>
            <p class="muted tiny">${esc(a.startDate)} — ${esc(a.endDate)} · Submit: ${esc(a.submissionMethod)} · ${esc(a.requiredTask)}</p></div>
            ${!joined ? `<button type="button" class="primary small" data-join-activity="${esc(a.id)}">Sign up</button>` : '<span class="pill green">Signed up</span>'}
          </article>`;
        }).join('')}</div>`;
    },

    'report-review'() {
      const cls = db().classes.find((c) => c.teacherId === user()?.id);
      const studentIds = cls?.studentIds || [];
      const list = db().reports.filter((r) => studentIds.includes(r.submitterId) && r.status !== 'removed');
      return `
        <section class="section-head"><div><span class="pill blue">Teaching</span><h2>Review and score student sighting reports</h2>
          <p>Review and score class reports; an administrator publishes approved posts to the community.</p></div></section>
        <div class="report-list">${list.length ? list.map((rep) => reportCard(rep, { teacherReview: true })).join('') : '<p class="muted">No reports from your class yet</p>'}</div>`;
    },

    communities() {
      const u = user();
      const joined = u?.publicProfile?.joinedOrgIds || [];
      return `
        <section class="section-head"><div><h2>Join communities</h2><p>Join conservation communities and take part in activities and discussions.</p></div></section>
        <div class="activity-list">${db().organisations.filter((o) => o.status === 'approved').map((o) => `
          <article><div><h3>${esc(o.name)}</h3><p>${esc(o.bio)}</p></div>
            ${joined.includes(o.id) ? '<span class="pill green">Joined</span>' : `<button type="button" class="primary small" data-join-community="${esc(o.id)}">Join communities</button>`}
          </article>`).join('')}</div>`;
    },

    'profile-public'() {
      const u = user();
      const joined = (u.publicProfile?.joinedOrgIds || []).map((id) => db().organisations.find((o) => o.id === id)?.name).filter(Boolean);
      return `
        <section class="section-head"><h2>Profile</h2></section>
        <div class="panel"><p>Name: ${esc(u.name)} · Email: ${esc(u.email)}</p>
          <p>Location: ${esc(u.publicProfile?.location || '—')}</p>
          <p>Communities: ${joined.join(', ') || '—'}</p>
          <p>Species of interest: ${(u.publicProfile?.interestSpecies || []).join(', ') || '—'}</p></div>`;
    },

    'guest-activities'() {
      return `
        <section class="section-head"><div><h2>Public activities</h2><p>Guests can browse only; sign up requires an account.</p></div></section>
        <div class="activity-list">${db().activities.filter((a) => a.status === 'approved').map((a) => `
          <article><div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p>
            <p class="muted tiny">${esc(a.startDate)} — ${esc(a.endDate)}</p></div></article>`).join('')}</div>`;
    },

    courses() {
      const cls = db().classes.find((c) => c.teacherId === user()?.id);
      const materials = db().courseMaterials.filter((m) => m.teacherId === user()?.id);
      return `
        <section class="section-head"><div><h2>Course materials</h2><p>Combine platform lessons with your notes and publish to the class.</p></div>
          <button type="button" class="primary" data-modal="course-publish">+ Publish course</button></section>
        <div class="class-grid">${materials.map((m) => {
          const base = db().lessons.find((l) => l.id === m.basedOnLessonId);
          return `<div class="panel"><span class="eyebrow">${esc(m.category)}</span><h3>${esc(m.title)}</h3>
            <p>Based on: ${esc(base?.title || '—')} + notes: ${esc(m.customNote)}</p>
            <p>Difficulty ${esc(m.difficulty)} · grade ${esc(m.targetGrade)} · ${m.published ? 'Published' : 'Draft'}</p></div>`;
        }).join('') || '<p class="muted">No courses</p>'}
        ${cls ? `<p class="muted tiny">Current class: ${esc(cls.name)} · ${cls.studentIds.length} students</p>` : ''}`;
    }
  };
})();
