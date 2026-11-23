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
var hostFactory: Dynamic;
var hostedEditorComponent: Dynamic;
var SelectionHostSubscribers: Dynamic;
var SelectionHostAdd: Dynamic;
var HostedEditorErrorBoundary: Dynamic;
function setSelectionActionHandler(handler?: Dynamic): Dynamic {
  SelectionHostAlias = handler;
}
function setEditorReadyPromise(readyPromise?: Dynamic): Dynamic {
  SelectionHostThenValue = readyPromise.then(
    (isReady?: Dynamic): Dynamic => isReady === true,
    (): Dynamic => false,
  );
}
function setSelectionHostFactory(factory?: Dynamic): Dynamic {
  hostFactory = factory;
}
function setHostedEditorComponent(component?: Dynamic): Dynamic {
  if (hostedEditorComponent !== component) {
    hostedEditorComponent = component;
    for (let notifySubscriber of [...SelectionHostSubscribers] as Dynamic) notifySubscriber();
  }
}
function HostedEditor({ host: host }: Dynamic): Dynamic {
  useUiLocale();
  let HostedEditorComponent: Dynamic = (0, reactSelectionHost.useSyncExternalStore)(
    SelectionHostAdd,
    (): Dynamic => hostedEditorComponent,
    (): Dynamic => null,
  );
  return HostedEditorComponent === null ? null : (
    <HostedEditorErrorBoundary>
      {(() => {
        const _Component = HostedEditorComponent;
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
  hostFactory,
  hostedEditorComponent,
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
      files?: Dynamic,
      locationMap?: Dynamic,
      currentNameOf?: Dynamic,
    ): Dynamic =>
      files.flatMap((file?: Dynamic): Dynamic => {
        let entry: Dynamic = locationMap.get(file);
        return entry !== undefined &&
          entry.name !== null &&
          entry.name === currentNameOf(file) &&
          entry.tids.length > 0
          ? [
              {
                file: file,
                tids: [...entry.tids],
              },
            ]
          : [];
      });
    SelectionHostAlias = null;
    SelectionHostThenValue = null;
    awaitEditorReady = (): Dynamic =>
      SelectionHostThenValue ?? Promise.resolve(false);
    runSelectionAction = (action?: Dynamic, payload?: Dynamic): Dynamic =>
      SelectionHostAlias === null
        ? Promise.resolve(null)
        : SelectionHostAlias(action, payload);
    hostFactory = null;
    hostedEditorComponent = null;
    SelectionHostSubscribers = new Set();
    SelectionHostAdd = (subscriber?: Dynamic): Dynamic => (
      SelectionHostSubscribers.add(subscriber),
      (): Dynamic => {
        SelectionHostSubscribers.delete(subscriber);
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
