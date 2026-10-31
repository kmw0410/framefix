import { qualities, type Settings } from '../shared/settings';
type Quality = Settings['quality'];
export function createQualityPicker(onChange: (value: Quality) => void) {
  const trigger = document.querySelector<HTMLButtonElement>('#quality')!;
  const label = document.querySelector<HTMLElement>('#quality-value')!;
  const list = document.querySelector<HTMLElement>('#quality-options')!;
  const wrap = trigger.parentElement!;
  let selected: Quality = '1080';
  let active = 0;
  let open = false;
  let search = '';
  let searchAt = 0;
  const names = qualities.map(value => `${value}p`);
  const options = qualities.map((value, index) => {
    const option = document.createElement('li');
    option.id = `quality-option-${value}`;
    option.setAttribute('role', 'option');
    option.textContent = names[index];
    option.addEventListener('pointerdown', event => event.preventDefault());
    option.addEventListener('click', () => commit(index));
    list.append(option);
    return option;
  });
  function highlight(index: number) {
    active = Math.max(0, Math.min(index, qualities.length - 1));
    options.forEach((option, i) => option.classList.toggle('active', i === active));
    trigger.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({ block: 'nearest' });
  }
  function close() {
    open = false;
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    search = '';
  }
  function show() {
    if (trigger.disabled) return;
    open = true;
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    highlight(qualities.indexOf(selected));
  }
  function commit(index: number) {
    if (trigger.disabled) return;
    close();
    trigger.focus();
    onChange(qualities[index]);
  }
  trigger.addEventListener('click', () => open ? close() : show());
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Tab') { close(); return; }
    if (event.key === 'Escape') {
      if (open) { event.preventDefault(); event.stopPropagation(); close(); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Enter' || event.key === ' ') { if (open) commit(active); else show(); return; }
      const wasOpen = open;
      if (!open) show();
      if (event.key === 'Home') highlight(0);
      else if (event.key === 'End') highlight(qualities.length - 1);
      else if (wasOpen) highlight(active + (event.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (!open) show();
      search = Date.now() - searchAt > 700 ? event.key : search + event.key;
      searchAt = Date.now();
      const index = names.findIndex(name => name.toLowerCase().startsWith(search.toLowerCase()));
      if (index >= 0) highlight(index);
    }
  });
  document.addEventListener('pointerdown', event => { if (!wrap.contains(event.target as Node)) close(); });
  wrap.addEventListener('focusout', event => { if (!wrap.contains(event.relatedTarget as Node)) close(); });
  window.addEventListener('blur', close);
  return {
    update(value: Quality, disabled: boolean) {
      selected = value;
      label.textContent = names[qualities.indexOf(value)];
      trigger.value = value;
      trigger.disabled = disabled;
      options.forEach((option, i) => option.setAttribute('aria-selected', String(qualities[i] === value)));
      if (disabled) close();
    }
  };
}
