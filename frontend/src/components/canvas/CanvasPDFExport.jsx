import CanvasGrid from './CanvasGrid';

// An off-screen, non-interactive clone of the canvas used as the html2canvas
// target. Hidden via `visibility:hidden` + off-screen position so it renders
// with real dimensions (unlike `display:none`, which produces a 0×0 snapshot).
const CanvasPDFExport = ({ sections, teamName }) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      left: '-99999px',
      top: 0,
      width: '1400px',
      height: '900px',
      visibility: 'hidden',
      pointerEvents: 'none'
    }}
  >
    <div id="canvas-pdf-target" className="bg-white p-4" style={{ width: '1400px', height: '900px' }}>
      <div className="mb-3">
        <h2 className="text-2xl font-black text-amber-900">Business Model Canvas</h2>
        <p className="text-sm text-stone-600">Team: {teamName}</p>
      </div>
      <div style={{ height: 'calc(100% - 60px)' }}>
        <CanvasGrid sections={sections} readOnly />
      </div>
    </div>
  </div>
);

export default CanvasPDFExport;
