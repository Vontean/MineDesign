// 两个传输适配器共享操作名称与结果封装；协议名称保持兼容。
export const OPERATIONS = Object.freeze({
  open: {http:'open',tool:'minedesign_open_document',field:'document'},
  annotations: {http:'annotations',tool:'minedesign_annotations',field:'annotations'},
  prepareFeedback: {http:'prepare-feedback',tool:'minedesign_prepare_feedback'},
  http: {http:'http',tool:'minedesign_http'},
  events: {http:'events',tool:'minedesign_events'},
});
