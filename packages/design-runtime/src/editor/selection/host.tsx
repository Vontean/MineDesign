import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactSelectionHost: Dynamic;
var selectedElementLocations: Dynamic;
var SelectionHostAlias: Dynamic;
var SelectionHostThenValue: Dynamic;
var awaitEditorReady: Dynamic;
var runSelectionAction: Dynamic;
var SelectionHostAlias_2: Dynamic;
var SelectionHostAlias_3: Dynamic;
var SelectionHostSubscribers: Dynamic;
var SelectionHostAdd: Dynamic;
var HostedEditorErrorBoundary: Dynamic;
function setSelectionActionHandler(input?: Dynamic): Dynamic {
  SelectionHostAlias = input;
}
function setEditorReadyPromise(input?: Dynamic): Dynamic {
  SelectionHostThenValue = input.then(
    (input2?: Dynamic): Dynamic => input2 === true,
    (): Dynamic => false,
  );
}
function setSelectionHostFactory(input?: Dynamic): Dynamic {
  SelectionHostAlias_2 = input;
}
function setHostedEditorComponent(input?: Dynamic): Dynamic {
  if (SelectionHostAlias_3 !== input) {
    SelectionHostAlias_3 = input;
    for (let value of [...SelectionHostSubscribers] as Dynamic) value();
  }
}
function HostedEditor({ host: host }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactSelectionHost.useSyncExternalStore)(
    SelectionHostAdd,
    (): Dynamic => SelectionHostAlias_3,
    (): Dynamic => null,
  );
  return value === null ? null : (
    <HostedEditorErrorBoundary>
      {(() => {
        const _Component = value;
        return <_Component host={host()} />;
      })()}
    </HostedEditorErrorBoundary>
  );
}
export {
  awaitEditorReady,
  HostedEditor,
  HostedEditorErrorBoundary,
  reactSelectionHost,
  runSelectionAction,
  selectedElementLocations,
  SelectionHostAdd,
  SelectionHostAlias,
  SelectionHostAlias_2,
  SelectionHostAlias_3,
  SelectionHostSubscribers,
  SelectionHostThenValue,
  setEditorReadyPromise,
  setHostedEditorComponent,
  setSelectionActionHandler,
  setSelectionHostFactory,
};
export function installEditorSelectionHost(): () => void {
  return () => {
    reactSelectionHost = toModuleNamespace(
      load_react(),
      1,
    );
    selectedElementLocations = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic =>
      input.flatMap((input2?: Dynamic): Dynamic => {
        let entry: Dynamic = options.get(input2);
        return entry !== undefined &&
          entry.name !== null &&
          entry.name === context(input2) &&
          entry.tids.length > 0
          ? [
              {
                file: input2,
                tids: [...entry.tids],
              },
            ]
          : [];
      });
    SelectionHostAlias = null;
    SelectionHostThenValue = null;
    awaitEditorReady = (): Dynamic =>
      SelectionHostThenValue ?? Promise.resolve(false);
    runSelectionAction = (input?: Dynamic, options?: Dynamic): Dynamic =>
      SelectionHostAlias === null
        ? Promise.resolve(null)
        : SelectionHostAlias(input, options);
    SelectionHostAlias_2 = null;
    SelectionHostAlias_3 = null;
    SelectionHostSubscribers = new Set();
    SelectionHostAdd = (input?: Dynamic): Dynamic => (
      SelectionHostSubscribers.add(input),
      (): Dynamic => {
        SelectionHostSubscribers.delete(input);
      }
    );
    HostedEditorErrorBoundary = class extends reactSelectionHost.Component {
      declare props: Dynamic;
      state: Dynamic = {
        failed: false,
      };
      static getDerivedStateFromError(): Dynamic {
        return {
          failed: true,
        };
      }
      render(): Dynamic {
        return this.state.failed ? null : this.props.children;
      }
    };
  };
}
