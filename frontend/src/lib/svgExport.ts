/* Lightweight SVG/PNG export helpers for charts */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSvg(elementId: string, filename = 'chart.svg') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg as Node);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportPng(elementId: string, filename = 'chart.png', fitToContainer = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
  if (!svg) return;

  // Ensure SVG has explicit width/height attributes
  const svgElement = svg as SVGSVGElement;
  const bbox = svgElement.getBBox();
  const width = svgElement.width.baseVal.value || bbox.width || 800;
  const height = svgElement.height.baseVal.value || bbox.height || 400;

  // Set explicit attributes if missing
  if (!svgElement.hasAttribute('width')) {
    svgElement.setAttribute('width', width.toString());
  }
  if (!svgElement.hasAttribute('height')) {
    svgElement.setAttribute('height', height.toString());
  }

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg as Node);
  const img = new Image();
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');

    if (fitToContainer) {
      // Fit to container dimensions
      const container = el.closest('.bg-white') || el.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width || width;
        canvas.height = rect.height || height;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale image to fit canvas if needed
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
      URL.revokeObjectURL(url);
    });
  };

  img.src = url;
}

export function exportBoth(elementId: string, name: string, fitToContainer = false) {
  exportSvg(elementId, `${name}.svg`);
  exportPng(elementId, `${name}.png`, fitToContainer);
}
