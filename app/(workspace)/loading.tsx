export default function WorkspaceLoading() {
  return (
    <div className="workspace-route-loading" role="status" aria-live="polite">
      <div className="workspace-loading-status">
        <span aria-hidden="true" />
        <strong>Opening your workspace</strong>
      </div>
      <div className="workspace-loading-heading" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="workspace-loading-grid" aria-hidden="true">
        <section><i /><i /><i /></section>
        <section><i /><i /><i /></section>
        <section><i /><i /><i /></section>
      </div>
    </div>
  );
}
