// 错误码跨 HTTP/MCP 保持一致；用户文案由界面按当前语言解析。
export function serviceError(code, message) { return Object.assign(new Error(message), { code }); }
export function errorRecord(error) { return { code: typeof error?.code === 'string' ? error.code : 'operation_failed', message: error?.message || 'Operation failed' }; }
