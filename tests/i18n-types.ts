import { uiMessage } from '../packages/contracts/src/ui-messages.ts';
uiMessage('inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith', { value1: 'Document' });
// @ts-expect-error 不允许不存在的词条
uiMessage('inspector.nonexistent');
// @ts-expect-error 动态消息必须提供参数
uiMessage('inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith');
// @ts-expect-error 参数名必须与词典匹配
uiMessage('inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith', { wrong: 'Document' });
uiMessage('inspector.attributeValidation.keyframesMustBeAJSONArrayOfObjects');
