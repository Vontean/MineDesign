import { createElement, FolderGit2, UserRound, Mail, ArrowUpRight } from 'lucide';
import { PROJECT_LINKS } from '../../packages/contracts/src/ui-text.ts';

// About 弹窗：品牌与简介、版本与本机更新、界面语言、联系方式。版本与更新状态来自后端 about 操作，更新期间轮询任务进度。
export function createAbout({ $, text, client, openLink, preference, onLanguage, version }) {
  const dialog = $('about');
  let info = null, checking = false, failure = null, poll = null;
  const reason = code => ({ dirty: text().blockedDirty, 'no-upstream': text().blockedNoUpstream })[code] ?? code;

  function action() {
    const t = text(), job = info?.job, status = info?.status;
    if (job?.state === 'running') return { status: t.updateSteps[job.step] ?? t.updating, label: t.updating, disabled: true };
    if (checking) return { status: t.checking, label: t.checking, disabled: true };
    const check = { label: t.checkUpdates, run: check_ };
    if (failure) return { status: t.checkFailed(failure), ...check };
    // 刚完成或失败的更新先于检查结果展示，直到下一次检查
    if (job?.state === 'done' && !status) return { status: job.reconnect ? t.updatedReconnect : t.updated, ...check };
    if (job?.state === 'failed' && !status) return { status: t.updateFailed(reason(job.error)), ...check };
    if (status?.error) return { status: t.checkFailed(status.error), ...check };
    if (status?.blocked) return { status: reason(status.blocked), ...check };
    if (status?.behind > 0) return { status: status.source === 'npm' ? t.releaseAvailable(status.latest) : t.updateAvailable(status.behind, status.latest), label: t.update, primary: true, run: update };
    if (status) return { status: t.upToDate, ...check };
    return { status: '', ...check };
  }

  function linkRow({ icon, label, value, href }) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'about-link';
    a.href = href;
    a.addEventListener('click', event => {
      event.preventDefault();
      openLink(href);
    });
    const name = document.createElement('span');
    name.className = 'about-link-label';
    name.textContent = label;
    const detail = document.createElement('span');
    detail.className = 'about-link-value';
    detail.textContent = value;
    a.append(createElement(icon, { class: 'icon', 'aria-hidden': 'true' }), name, detail, createElement(ArrowUpRight, { class: 'icon about-link-arrow', 'aria-hidden': 'true' }));
    li.append(a);
    return li;
  }

  function render() {
    const t = text(), next = action(), button = $('about-action');
    $('about-version').textContent = info?.version ?? version;
    $('about-status').textContent = next.status;
    button.textContent = next.label;
    button.disabled = !!next.disabled;
    button.className = `btn about-action ${next.primary ? 'btn-solid' : 'btn-outline'}`;
    button.onclick = next.run ?? null;
    for (const option of $('about-language').querySelectorAll('[data-language]')) option.setAttribute('aria-checked', String(option.dataset.language === preference()));
    $('about-links').replaceChildren(
      ...[
        { icon: FolderGit2, label: t.project, value: 'Vontean/MineDesign', href: PROJECT_LINKS.repository },
        { icon: UserRound, label: t.github, value: `@${PROJECT_LINKS.authorName}`, href: PROJECT_LINKS.author },
        { icon: Mail, label: t.email, value: PROJECT_LINKS.email, href: `mailto:${PROJECT_LINKS.email}` },
      ].map(linkRow),
    );
  }

  async function refresh(check = false) {
    clearTimeout(poll);
    try {
      info = await client().about(check);
      failure = null;
    } catch (error) {
      failure = error.message;
    }
    render();
    if (info?.job?.state === 'running') poll = setTimeout(() => refresh(), 1500);
  }
  async function check_() {
    checking = true;
    render();
    await refresh(true);
    checking = false;
    render();
  }
  async function update() {
    try {
      info = await client().update();
      failure = null;
    } catch (error) {
      failure = reason(error.message);
    }
    render();
    if (info?.job?.state === 'running') poll = setTimeout(() => refresh(), 1500);
  }

  for (const option of $('about-language').querySelectorAll('[data-language]'))
    option.addEventListener('click', async () => {
      await onLanguage(option.dataset.language);
      render();
    });
  dialog.addEventListener('close', () => clearTimeout(poll));

  return {
    render,
    open() {
      if (!dialog.open) dialog.showModal();
      render();
      return refresh();
    },
    isOpen: () => dialog.open,
  };
}
