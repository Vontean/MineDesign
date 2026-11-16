// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { blurCanvasActiveElement, focusCanvasDocument, temporaryFocusSink } from './focus';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<input id="a">';
});
afterEach(() => vi.useRealTimers());

it('失焦时会让当前输入框失焦', () => {
  const input = document.getElementById('a') as HTMLInputElement;
  input.focus();
  blurCanvasActiveElement();
  expect(document.activeElement).toBe(document.body);
});

it('默认保留 iframe 的焦点，要求时才清掉', () => {
  const frame = document.createElement('div');
  Object.defineProperty(frame, 'tagName', { value: 'IFRAME' });
  frame.tabIndex = 0;
  document.body.appendChild(frame);
  frame.focus();
  blurCanvasActiveElement();
  expect(document.activeElement).toBe(frame);
  blurCanvasActiveElement(true);
  expect(document.activeElement).toBe(document.body);
});

it('临时节点抢到焦点，超过 1 秒没等到窗口焦点就移除', () => {
  temporaryFocusSink();
  expect(document.body.children).toHaveLength(2);
  vi.advanceTimersByTime(999);
  expect(document.body.children).toHaveLength(2);
  vi.advanceTimersByTime(1);
  expect(document.body.children).toHaveLength(1);
});

it('窗口拿到焦点后，临时节点再保留 100 毫秒', () => {
  temporaryFocusSink();
  vi.advanceTimersByTime(500);
  window.dispatchEvent(new Event('focus'));
  vi.advanceTimersByTime(99);
  expect(document.body.children).toHaveLength(2);
  vi.advanceTimersByTime(1);
  expect(document.body.children).toHaveLength(1);
});

it('文档没有焦点时请求窗口焦点，有焦点时不放临时节点', () => {
  const winFocus = vi.spyOn(window, 'focus').mockImplementation(() => {});
  document.hasFocus = () => false;
  focusCanvasDocument();
  expect(winFocus).toHaveBeenCalledTimes(1);
  expect(document.body.children).toHaveLength(2);
  document.hasFocus = () => true;
  document.body.innerHTML = '';
  focusCanvasDocument();
  expect(winFocus).toHaveBeenCalledTimes(1);
  expect(document.body.children).toHaveLength(0);
});
