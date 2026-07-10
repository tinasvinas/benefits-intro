/* ======================================================
 * 初发 Trufar Demo · 共享 JS
 * 角色切换、租户切换、Toast、Modal、导航高亮
 * ====================================================== */

// 当前角色
const ROLES = {
  'sys-admin':    { name:'系统管理员', tenant:'system', color:'#ef4444' },
  'school-admin': { name:'学校管理员', tenant:'school', color:'#2563eb' },
  'ops':          { name:'运营管理员', tenant:'school', color:'#0ea5e9' },
  'teacher':      { name:'教师',       tenant:'school', color:'#10b981' },
  'student':      { name:'学生',       tenant:'school', color:'#f59e0b' },
};

// 当前用户信息（演示用）
const CURRENT_USER = {
  name:'白小乐',
  schoolName:'北京邮电大学',
  schoolShort:'BUPT',
  role:'school-admin',
  tenant:'school',
  loginName:'buptzsj',
  studentId:'2024001',
};

// 持久化角色到 sessionStorage（简单演示）
function getRole(){ return sessionStorage.getItem('demo_role') || CURRENT_USER.role }
function setRole(r){ sessionStorage.setItem('demo_role', r); applyRole(); }
function getTenant(){ return sessionStorage.getItem('demo_tenant') || ROLES[getRole()].tenant }
function setTenant(t){ sessionStorage.setItem('demo_tenant', t); applyRole(); }

function applyRole(){
  const r = getRole();
  const role = ROLES[r];
  // 顶栏角色显示
  document.querySelectorAll('[data-role-name]').forEach(el => el.textContent = role.name);
  document.querySelectorAll('[data-role-select]').forEach(el => el.value = r);
  // 头像首字母
  document.querySelectorAll('.avatar[data-current-user]').forEach(el => {
    el.textContent = (CURRENT_USER.name || '?').slice(0,1);
  });
  // 租户切换高亮
  const t = getTenant();
  document.querySelectorAll('[data-tenant-select]').forEach(el => el.value = t);
  // 派发自定义事件，给具体页面响应
  document.dispatchEvent(new CustomEvent('roleChanged', { detail:{ role:r, tenant:t } }));
}

// ========== Toast ==========
function ensureToastWrap(){
  let w = document.getElementById('toast-wrap');
  if(!w){ w=document.createElement('div'); w.id='toast-wrap'; document.body.appendChild(w); }
  return w;
}
function toast(msg, type='info', dur=2400){
  const w = ensureToastWrap();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, dur);
}

// ========== Modal ==========
function openModal(id){
  const m = document.getElementById(id);
  if(m){ m.classList.add('open'); }
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m){ m.classList.remove('open'); }
}
function bindModal(){
  document.querySelectorAll('.modal-overlay').forEach(o=>{
    o.addEventListener('click', e => { if(e.target === o) o.classList.remove('open'); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(b=>{
    b.addEventListener('click', () => {
      const m = b.closest('.modal-overlay');
      if(m) m.classList.remove('open');
    });
  });
}

// ========== 二次确认 ==========
function confirmAction(msg, cb){
  if(window.confirm(msg)) cb && cb();
}

// ========== 导航高亮 ==========
function setActiveNav(key){
  document.querySelectorAll('#sidebar nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === key);
  });
}

// ========== 角色 dropdown 渲染 ==========
function renderRoleSwitch(container){
  if(!container) return;
  const r = getRole();
  container.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></svg>
    <select data-role-select onchange="setRole(this.value)">
      <option value="sys-admin"    ${r==='sys-admin'?'selected':''}>系统管理员</option>
      <option value="school-admin" ${r==='school-admin'?'selected':''}>学校管理员</option>
      <option value="ops"          ${r==='ops'?'selected':''}>运营管理员</option>
      <option value="teacher"      ${r==='teacher'?'selected':''}>教师</option>
      <option value="student"      ${r==='student'?'selected':''}>学生</option>
    </select>
  `;
}

// ========== 顶栏渲染 ==========
function renderTopbar(target, opts={}){
  const { title='', breadcrumb=[], breadcrumbLinks=[] } = opts;
  const t = getTenant();
  const r = getRole();
  const breadcrumbHtml = breadcrumb.map((b,i)=>{
    const sep = i>0 ? '<span class="sep">/</span>' : '';
    const isLast = i === breadcrumb.length - 1;
    if(!isLast && breadcrumbLinks[i]){
      return `${sep}<a href="${resolveHref(breadcrumbLinks[i])}" class="breadcrumb-link">${b}</a>`;
    }
    return `${sep}<span${isLast?' class="breadcrumb-current"':''}>${b}</span>`;
  }).join('');

  target.innerHTML = `
    <div class="topbar-left">
      <span id="page-title">${title}</span>
      <span class="breadcrumb">${breadcrumbHtml}</span>
    </div>
    <div class="topbar-right">
      <select class="tenant-switch" data-tenant-select onchange="setTenant(this.value)">
        <option value="system" ${t==='system'?'selected':''}>系统租户</option>
        <option value="school" ${t==='school'?'selected':''}>学校租户·BUPT</option>
      </select>
      <span class="role-switch" id="role-switch-box"></span>
      <span class="topbar-icon" title="使用帮助" onclick="window.open('https://docs.trufar.cn', '_blank')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </span>
      <span class="topbar-icon" title="消息通知" onclick="showNotifications()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="badge-dot"></span>
      </span>
      <span class="avatar" data-current-user>Z</span>
      <span class="topbar-user">${CURRENT_USER.name}</span>
    </div>
  `;
  renderRoleSwitch(document.getElementById('role-switch-box'));
}

// ========== 侧边栏：统一菜单结构 ==========
const NAV_GROUPS = [
  { label:'智能体', items:[
    { key:'market',     name:'智能体市场',  href:'index.html',                  icon:'home' },
    { key:'training',   name:'实训课程',    href:'pages/training.html',         icon:'book' },
    { key:'agent-dev',  name:'智能体开发',  icon:'cube', children:[
      { key:'agent-dev-create', name:'创建智能体', href:'pages/agent-dev.html',   icon:'cube' },
      { key:'agent-dev-my',     name:'我的智能体', href:'pages/agent-dev.html',   icon:'user' },
      { key:'agent-dev-db',     name:'数据库',     href:'pages/agent-data.html',  icon:'database' },
    ]},
    { key:'agent-use',  name:'智能体使用',  href:'pages/agent-use.html',        icon:'chat' },
    { key:'forum',      name:'学习论坛',    href:'pages/forum.html',            icon:'forum' },
  ]},
  { label:'教学管理', items:[
    { key:'workbench',  name:'工作台',     href:'pages/teaching-workbench.html',  icon:'dashboard' },
    { key:'unjoined',   name:'未入班',     href:'pages/unjoined.html',            icon:'users' },
    { key:'course',     name:'课程管理',   href:'pages/course.html',              icon:'list' },
    { key:'classmgr',   name:'班级管理',   href:'pages/teaching-classmgr.html',  icon:'group' },
    { key:'myclass',    name:'我的班级',   href:'pages/teaching-myclass.html',   icon:'chart' },
    { key:'students',   name:'学生列表',   href:'pages/teaching-students.html',  icon:'people' },
    { key:'archive',    name:'学习档案',   href:'pages/archive.html',             icon:'profile' },
    { key:'semester',   name:'学期管理',   href:'pages/semester.html',            icon:'calendar' },
  ]},
  { label:'系统管理', items:[
    { key:'school',     name:'学校管理',   href:'pages/system-school.html',  icon:'building' },
    { key:'account',    name:'账户管理',   href:'pages/system-account.html', icon:'user' },
    { key:'org',        name:'组织管理',   href:'pages/system-org.html',     icon:'tree' },
    { key:'model',      name:'模型管理',   href:'pages/system-model.html',   icon:'cpu' },
    { key:'tool',       name:'工具管理',   href:'pages/tool.html',           icon:'wrench' },
  ]},
  { label:'权益与运营', items:[
    { key:'benefits',   name:'我的权益',   href:'pages/benefits.html', icon:'crown' },
    { key:'cockpit',    name:'全局驾驶舱', href:'pages/cockpit.html',  icon:'screen' },
  ]},
];

const ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z"/><path d="M4 16h16"/></svg>',
  cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8L12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  forum:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h2a2 2 0 0 1 2 2v8l-4-4H7a2 2 0 0 1-2-2V8"/><path d="M3 4h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7l-4 4z"/></svg>',
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  group:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  profile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="6" x2="9.01" y2="6"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="9" y1="14" x2="9.01" y2="14"/><line x1="15" y1="6" x2="15.01" y2="6"/><line x1="15" y1="10" x2="15.01" y2="10"/><line x1="15" y1="14" x2="15.01" y2="14"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  tree:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h6v6H3z"/><path d="M15 13h6v6h-6z"/><path d="M3 13h6v6H3z"/><path d="M15 5h6v6h-6z"/></svg>',
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></svg>',
  wrench:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17h20l-2-9-5 4-3-7-3 7-5-4z"/></svg>',
  screen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  database:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
};

function resolveHref(href){
  // 当前页是否在 /pages/ 子目录下
  const inPages = /\/pages\//i.test(location.pathname) || /\\pages\\/i.test(location.pathname);
  if(!inPages) return href;
  // 在 /pages/ 子目录中：把 pages/xxx 去掉前缀；index.html 加 ../
  if(href.startsWith('pages/')) return href.replace(/^pages\//, '');
  if(href.startsWith('index.html')) return '../' + href;
  return href;
}

function renderSidebar(activeKey){
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  const navHtml = NAV_GROUPS.map(g => `
    <div class="nav-group-label">${g.label}</div>
    ${g.items.map(it => {
      if(it.todo){
        return `
        <a href="javascript:void(0)" data-nav="${it.key}" data-todo="1" class="nav-todo">
          ${ICONS[it.icon] || ''}<span>${it.name}</span><span class="todo-tag">规划中</span>
        </a>`;
      }
      if(it.children){
        const childActive = it.children.some(c => c.key === activeKey);
        const open = childActive ? 'open' : '';
        return `
        <div class="nav-submenu ${open}" data-submenu="${it.key}">
          <a href="javascript:void(0)" class="nav-submenu-toggle ${childActive?'active':''}" data-nav="${it.key}">
            ${ICONS[it.icon] || ''}<span>${it.name}</span><span class="nav-chevron">${ICONS.chevron}</span>
          </a>
          <div class="nav-submenu-list">
            ${it.children.map(c => `
              <a href="${resolveHref(c.href)}" data-nav="${c.key}" class="${c.key===activeKey?'active':''}">
                ${ICONS[c.icon] || ''}<span>${c.name}</span>
              </a>
            `).join('')}
          </div>
        </div>`;
      }
      return `
      <a href="${resolveHref(it.href)}" data-nav="${it.key}" class="${it.key===activeKey?'active':''}">
        ${ICONS[it.icon] || ''}<span>${it.name}</span>
      </a>`;
    }).join('')}
  `).join('');

  sb.innerHTML = `
    <div class="logo">
      <span class="logo-mark">初</span>
      <span class="logo-text">初发 Trufar<small>CodeChat · v5.2</small></span>
    </div>
    <nav>${navHtml}</nav>
    <div class="sidebar-footer">© 2026 大数据平台部</div>
  `;

  // 拦截规划中菜单的点击
  sb.querySelectorAll('a[data-todo]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const name = a.querySelector('span').textContent;
      toast(`「${name}」功能规划中，本期 Demo 暂未实现`, 'info');
    });
  });

  // 二级菜单展开/收起
  sb.querySelectorAll('.nav-submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = toggle.closest('.nav-submenu');
      if(submenu) submenu.classList.toggle('open');
    });
  });
}

// ========== 消息通知 ==========
function showNotifications(){
  toast('消息列表页面功能开发中...', 'info');
  // 实际应用中应该跳转到消息列表页面或弹出消息面板
  // window.location.href = resolveHref('pages/messages.html');
}

// ========== 初始化 ==========
function bootShell(opts={}){
  renderSidebar(opts.activeNav);
  const tb = document.getElementById('topbar');
  if(tb) renderTopbar(tb, opts);
  applyRole();
  bindModal();
}

document.addEventListener('DOMContentLoaded', () => {
  if(typeof PAGE_CONFIG !== 'undefined') bootShell(PAGE_CONFIG);
});
