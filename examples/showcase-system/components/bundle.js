/* @ds-bundle: {"format":4,"namespace":"Pine","components":[{"name":"Button"},{"name":"Icon"},{"name":"Avatar"},{"name":"Badge"},{"name":"TextField"},{"name":"Checkbox"},{"name":"Switch"},{"name":"Tabs"},{"name":"Card"},{"name":"Dialog"},{"name":"Alert"},{"name":"Progress"},{"name":"EmptyState"},{"name":"Skeleton"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;

  // 图标取自 Lucide（24 网格，描边由 --pn-icon-stroke 控制）
  var ICONS = {"plus":[["path",{"d":"M5 12h14"}],["path",{"d":"M12 5v14"}]],"check":[["path",{"d":"M20 6 9 17l-5-5"}]],"x":[["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],"search":[["path",{"d":"m21 21-4.34-4.34"}],["circle",{"cx":"11","cy":"11","r":"8"}]],"bell":[["path",{"d":"M10.268 21a2 2 0 0 0 3.464 0"}],["path",{"d":"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"}]],"settings":[["path",{"d":"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"}],["circle",{"cx":"12","cy":"12","r":"3"}]],"calendar":[["path",{"d":"M8 2v3"}],["path",{"d":"M16 2v3"}],["rect",{"x":"3","y":"3","width":"18","height":"18","rx":"2"}],["path",{"d":"M3 9h18"}]],"user":[["path",{"d":"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"}],["circle",{"cx":"12","cy":"7","r":"4"}]],"users":[["path",{"d":"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["path",{"d":"M16 3.128a4 4 0 0 1 0 7.744"}],["path",{"d":"M22 21v-2a4 4 0 0 0-3-3.87"}],["circle",{"cx":"9","cy":"7","r":"4"}]],"folder":[["path",{"d":"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"}]],"more":[["circle",{"cx":"12","cy":"12","r":"1"}],["circle",{"cx":"19","cy":"12","r":"1"}],["circle",{"cx":"5","cy":"12","r":"1"}]],"chevron-down":[["path",{"d":"m6 9 6 6 6-6"}]],"chevron-right":[["path",{"d":"m9 18 6-6-6-6"}]],"chevron-left":[["path",{"d":"m15 18-6-6 6-6"}]],"alert":[["path",{"d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{"d":"M12 9v4"}],["path",{"d":"M12 17h.01"}]],"info":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 16v-4"}],["path",{"d":"M12 8h.01"}]],"check-circle":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m16 9-5.5 5.5L8 12"}]],"x-circle":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m15 9-6 6"}],["path",{"d":"m9 9 6 6"}]],"loader":[["path",{"d":"M21 12a9 9 0 1 1-6.219-8.56"}]],"trash":[["path",{"d":"M10 11v6"}],["path",{"d":"M14 11v6"}],["path",{"d":"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{"d":"M3 6h18"}],["path",{"d":"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]],"inbox":[["polyline",{"points":"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{"d":"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]],"filter":[["path",{"d":"M2 5h20"}],["path",{"d":"M6 12h12"}],["path",{"d":"M9 19h6"}]],"message":[["path",{"d":"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"}]],"paperclip":[["path",{"d":"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"}]],"star":[["path",{"d":"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]],"clock":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 6v6l4 2"}]],"arrow":[["path",{"d":"M5 12h14"}],["path",{"d":"m12 5 7 7-7 7"}]],"logout":[["path",{"d":"m16 17 5-5-5-5"}],["path",{"d":"M21 12H9"}],["path",{"d":"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}]],"home":[["path",{"d":"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"}],["path",{"d":"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}]],"grid":[["rect",{"width":"7","height":"7","x":"3","y":"3","rx":"1"}],["rect",{"width":"7","height":"7","x":"14","y":"3","rx":"1"}],["rect",{"width":"7","height":"7","x":"14","y":"14","rx":"1"}],["rect",{"width":"7","height":"7","x":"3","y":"14","rx":"1"}]],"list":[["path",{"d":"M3 5h.01"}],["path",{"d":"M3 12h.01"}],["path",{"d":"M3 19h.01"}],["path",{"d":"M8 5h13"}],["path",{"d":"M8 12h13"}],["path",{"d":"M8 19h13"}]],"flag":[["path",{"d":"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"}]],"lock":[["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4"}]],"mail":[["path",{"d":"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"}],["rect",{"x":"2","y":"4","width":"20","height":"16","rx":"2"}]],"eye":[["path",{"d":"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"}],["circle",{"cx":"12","cy":"12","r":"3"}]],"sun":[["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 2v2"}],["path",{"d":"M12 20v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"m17.66 17.66 1.41 1.41"}],["path",{"d":"M2 12h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"m6.34 17.66-1.41 1.41"}],["path",{"d":"m19.07 4.93-1.41 1.41"}]],"moon":[["path",{"d":"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"}]],"sparkles":[["path",{"d":"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}],["path",{"d":"M20 2v4"}],["path",{"d":"M22 4h-4"}],["circle",{"cx":"4","cy":"20","r":"2"}]],"chart":[["path",{"d":"M3 3v16a2 2 0 0 0 2 2h16"}],["path",{"d":"M18 17V9"}],["path",{"d":"M13 17V5"}],["path",{"d":"M8 17v-3"}]],"link":[["path",{"d":"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{"d":"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],"upload":[["path",{"d":"M12 3v12"}],["path",{"d":"m17 8-5-5-5 5"}],["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}]],"edit":[["path",{"d":"M13 21h8"}],["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}]],"tag":[["path",{"d":"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{"cx":"7.5","cy":"7.5","r":".5","fill":"currentColor"}]],"target":[["circle",{"cx":"12","cy":"12","r":"10"}],["circle",{"cx":"12","cy":"12","r":"6"}],["circle",{"cx":"12","cy":"12","r":"2"}]]};

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }

  function Icon(props) {
    var node = ICONS[props.name];
    if (!node) return null;
    var size = props.size || 16;
    return h('svg', {
      className: cx('pn-icon', props.spin && 'pn-spin', props.className),
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': props['aria-label'] ? undefined : true,
      role: props['aria-label'] ? 'img' : undefined, 'aria-label': props['aria-label'], style: props.style
    }, node.map(function (part, i) { return h(part[0], Object.assign({ key: i }, part[1])); }));
  }

  function Button(props) {
    var variant = props.variant || 'secondary';
    var size = props.size || 'md';
    var rest = Object.assign({}, props);
    ['variant', 'size', 'icon', 'iconOnly', 'loading', 'children', 'className', 'trailingIcon'].forEach(function (k) { delete rest[k]; });
    var iconSize = size === 'sm' ? 14 : 16;
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('pn-btn', 'pn-btn-' + variant, 'pn-btn-' + size, props.iconOnly && 'pn-btn-icon', props.loading && 'pn-btn-loading', props.className),
      disabled: props.disabled || props.loading,
      'aria-busy': props.loading || undefined
    }),
      props.loading ? h(Icon, { name: 'loader', size: iconSize, spin: true }) : props.icon ? h(Icon, { name: props.icon, size: iconSize }) : null,
      props.iconOnly ? null : props.children,
      props.trailingIcon && !props.iconOnly ? h(Icon, { name: props.trailingIcon, size: iconSize }) : null);
  }

  var AVATAR_TINTS = ['#2f6f4f', '#2563eb', '#b45309', '#7c3aed', '#be185d', '#0e7490'];
  function Avatar(props) {
    var name = props.name || '';
    var size = props.size || 32;
    var code = 0;
    for (var i = 0; i < name.length; i++) code += name.charCodeAt(i);
    var initials = /[一-鿿]/.test(name) ? name.slice(-2) : name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    return h('span', {
      className: cx('pn-avatar', props.className), title: name, role: 'img', 'aria-label': name,
      style: Object.assign({ width: size, height: size, fontSize: Math.round(size * 0.38), background: AVATAR_TINTS[code % AVATAR_TINTS.length] }, props.style)
    }, initials, props.status ? h('span', { className: 'pn-avatar-status pn-avatar-' + props.status }) : null);
  }

  function Badge(props) {
    return h('span', { className: cx('pn-badge', 'pn-badge-' + (props.tone || 'neutral'), props.className) },
      props.dot ? h('span', { className: 'pn-badge-dot' }) : null, props.children);
  }

  function TextField(props) {
    var state = useState(props.defaultValue || '');
    var id = React.useId ? React.useId() : 'pn-field';
    var error = props.error;
    return h('label', { className: cx('pn-field', error && 'pn-field-error', props.disabled && 'pn-field-disabled', props.className), htmlFor: id, style: props.style },
      props.label ? h('span', { className: 'pn-field-label' }, props.label) : null,
      h('span', { className: 'pn-field-control' },
        props.icon ? h(Icon, { name: props.icon }) : null,
        h(props.multiline ? 'textarea' : 'input', {
          id: id, type: props.type || 'text', value: state[0], placeholder: props.placeholder, disabled: props.disabled,
          rows: props.multiline ? (props.rows || 3) : undefined, 'aria-invalid': error ? true : undefined,
          onChange: function (e) { state[1](e.target.value); if (props.onChange) props.onChange(e.target.value); }
        })),
      error ? h('span', { className: 'pn-field-message' }, h(Icon, { name: 'x-circle', size: 14 }), error)
        : props.hint ? h('span', { className: 'pn-field-hint' }, props.hint) : null);
  }

  function Checkbox(props) {
    var state = useState(!!props.defaultChecked);
    var checked = props.checked !== undefined ? props.checked : state[0];
    return h('label', { className: cx('pn-check', props.disabled && 'pn-disabled', props.className) },
      h('input', { type: 'checkbox', checked: checked, disabled: props.disabled, onChange: function (e) { state[1](e.target.checked); if (props.onChange) props.onChange(e.target.checked); } }),
      h('span', { className: 'pn-check-box' }, h(Icon, { name: 'check', size: 12 })),
      props.label ? h('span', { className: cx('pn-check-label', props.strike && checked && 'pn-strike') }, props.label) : null);
  }

  function Switch(props) {
    var state = useState(!!props.defaultChecked);
    var on = props.checked !== undefined ? props.checked : state[0];
    return h('label', { className: cx('pn-switch', props.disabled && 'pn-disabled', props.className) },
      props.label ? h('span', { className: 'pn-switch-text' }, h('span', { className: 'pn-switch-label' }, props.label), props.description ? h('span', { className: 'pn-switch-desc' }, props.description) : null) : null,
      h('button', {
        type: 'button', role: 'switch', 'aria-checked': on, disabled: props.disabled, className: 'pn-switch-track',
        onClick: function () { state[1](!on); if (props.onChange) props.onChange(!on); }
      }, h('span', { className: 'pn-switch-thumb' })));
  }

  function Tabs(props) {
    var items = props.items || [];
    var state = useState(props.defaultValue || (items[0] && items[0].value));
    var current = props.value !== undefined ? props.value : state[0];
    return h('div', { className: cx('pn-tabs', 'pn-tabs-' + (props.variant || 'line'), props.className), role: 'tablist', style: props.style },
      items.map(function (item) {
        var selected = item.value === current;
        return h('button', {
          key: item.value, type: 'button', role: 'tab', 'aria-selected': selected, className: 'pn-tab',
          onClick: function () { state[1](item.value); if (props.onChange) props.onChange(item.value); }
        }, item.icon ? h(Icon, { name: item.icon, size: 14 }) : null, item.label,
          item.count !== undefined ? h('span', { className: 'pn-tab-count' }, item.count) : null);
      }));
  }

  function Card(props) {
    return h('section', { className: cx('pn-card', props.interactive && 'pn-card-interactive', props.className), style: props.style },
      props.title || props.action ? h('header', { className: 'pn-card-head' },
        h('div', null, props.title ? h('h3', { className: 'pn-card-title' }, props.title) : null,
          props.description ? h('p', { className: 'pn-card-desc' }, props.description) : null),
        props.action || null) : null,
      props.children ? h('div', { className: 'pn-card-body' }, props.children) : null,
      props.footer ? h('footer', { className: 'pn-card-foot' }, props.footer) : null);
  }

  function Dialog(props) {
    var state = useState(props.open !== false);
    if (!state[0]) return null;
    var close = function () { state[1](false); if (props.onClose) props.onClose(); };
    return h('div', { className: cx('pn-dialog-backdrop', props.inline && 'pn-dialog-inline'), onClick: function (e) { if (e.target === e.currentTarget) close(); } },
      h('div', { className: 'pn-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': props.title, style: props.width ? { width: props.width } : null },
        h('header', { className: 'pn-dialog-head' },
          h('div', null, h('h2', { className: 'pn-dialog-title' }, props.title),
            props.description ? h('p', { className: 'pn-dialog-desc' }, props.description) : null),
          h(Button, { variant: 'ghost', size: 'sm', icon: 'x', iconOnly: true, 'aria-label': '关闭', onClick: close })),
        props.children ? h('div', { className: 'pn-dialog-body' }, props.children) : null,
        props.footer ? h('footer', { className: 'pn-dialog-foot' }, props.footer) : null));
  }

  var ALERT_ICONS = { info: 'info', success: 'check-circle', warning: 'alert', danger: 'x-circle' };
  function Alert(props) {
    var tone = props.tone || 'info';
    var state = useState(true);
    if (!state[0]) return null;
    return h('div', { className: cx('pn-alert', 'pn-alert-' + tone, props.className), role: tone === 'danger' ? 'alert' : 'status', style: props.style },
      h(Icon, { name: ALERT_ICONS[tone], size: 18 }),
      h('div', { className: 'pn-alert-text' }, props.title ? h('strong', null, props.title) : null, props.children ? h('span', null, props.children) : null),
      props.action || null,
      props.dismissible ? h(Button, { variant: 'ghost', size: 'sm', icon: 'x', iconOnly: true, 'aria-label': '关闭提示', onClick: function () { state[1](false); } }) : null);
  }

  function Progress(props) {
    var value = Math.max(0, Math.min(100, props.value || 0));
    return h('div', { className: cx('pn-progress', props.className), style: props.style },
      props.label ? h('div', { className: 'pn-progress-head' }, h('span', null, props.label), h('span', null, value + '%')) : null,
      h('div', { className: 'pn-progress-track', role: 'progressbar', 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': 100 },
        h('div', { className: 'pn-progress-bar pn-progress-' + (props.tone || 'accent'), style: { width: value + '%' } })));
  }

  function EmptyState(props) {
    return h('div', { className: cx('pn-empty', props.className), style: props.style },
      h('span', { className: 'pn-empty-icon' }, h(Icon, { name: props.icon || 'inbox', size: 22 })),
      h('h3', { className: 'pn-empty-title' }, props.title),
      props.description ? h('p', { className: 'pn-empty-desc' }, props.description) : null,
      props.action || null);
  }

  function Skeleton(props) {
    return h('span', { className: cx('pn-skeleton', props.circle && 'pn-skeleton-circle', props.className), style: { width: props.width || '100%', height: props.height || 12 } });
  }

  window.Pine = {
    Button: Button, Icon: Icon, Avatar: Avatar, Badge: Badge, TextField: TextField, Checkbox: Checkbox,
    Switch: Switch, Tabs: Tabs, Card: Card, Dialog: Dialog, Alert: Alert, Progress: Progress,
    EmptyState: EmptyState, Skeleton: Skeleton
  };
})();
