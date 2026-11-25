import React, { useEffect, useRef, useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { appIcon } from '../../os/apps';
import { downloadFile } from '../../os/download';
import { sound } from '../../os/sound';
import { showAbout, showHelpAndSupport, useShell, type AppProps } from '../../os/shell';
import { floodFill } from './floodFill';

type Tool = 'pencil' | 'brush' | 'eraser' | 'bucket';

/** 16px pixel-art toolbox icons in the style of XP Paint, drawn on whole pixels so they stay crisp. */
const TOOL_PIXELS: Record<Tool, [string, string][]> = {
  pencil: [
    ['#f4c430', 'M4 12h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2z'],
    ['#000', 'M2 14h2v-2h1v2h-1v1h-2z'],
    ['#e88', 'M12 3h1v1h1v1h-1v-1h-1z'],
  ],
  brush: [
    ['#8b5a2b', 'M9 2h1v1h1v1h1v1h1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h1z'],
    ['#c0c0c0', 'M7 6h1v1h1v1h-1v1h-1v-1h-1v-1h1z'],
    ['#000', 'M3 10h3v1h1v2h-1v1h-3v-1h-1v-2h1z'],
  ],
  bucket: [
    ['#808080', 'M5 4h1v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h1v-1h1v-1h1z'],
    ['#2060e0', 'M10 9h1v1h1v1h1v2h-3z'],
    ['#000', 'M4 3h1v1h-1z'],
  ],
  eraser: [
    ['#f0a0b0', 'M8 3h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h1z'],
    ['#ffffff', 'M5 7h1v1h1v1h1v1h1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-2z'],
    ['#000', 'M3 13h10v1h-10z'],
  ],
};

const ToolIcon = ({ tool }: { tool: Tool }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    {TOOL_PIXELS[tool].map(([fill, d]) => (
      <path key={d} fill={fill} d={d} />
    ))}
  </svg>
);

/** Paint: pencil, brush, eraser and paint bucket on a white canvas. */
export default function PaintWindow({ id }: AppProps) {
  const shell = useShell();
  const [paintColor, setPaintColor] = useState('#000000');
  const [paintTool, setPaintTool] = useState<Tool>('pencil');
  const [paintSize, setPaintSize] = useState(4);
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  // Start on opaque white: a transparent canvas reads as black to the bucket and saves see-through.
  useEffect(() => {
    const canvas = paintCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /** The pointer in canvas pixels, which differ from CSS pixels when the canvas is shrunk to fit. */
  const pointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const drawTo = (x: number, y: number) => {
    const ctx = paintCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    const colour = paintTool === 'eraser' ? '#ffffff' : paintColor;
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;
    ctx.lineWidth = paintTool === 'pencil' ? 2 : paintSize;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastRef.current = { x, y };
  };

  const handlePaintMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const { x, y } = pointer(e);
    lastRef.current = { x, y };
    if (paintTool === 'bucket') {
      const ctx = paintCanvasRef.current?.getContext('2d');
      if (!ctx) return;
      sound.beep(440, 100, 'sawtooth');
      const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (floodFill(image, Math.floor(x), Math.floor(y), paintColor)) ctx.putImageData(image, 0, 0);
      return;
    }
    isDrawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawTo(x, y);
  };

  const handlePaintMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const { x, y } = pointer(e);
    drawTo(x, y);
  };

  const handlePaintMouseUp = () => {
    isDrawingRef.current = false;
  };

  const clearPaintCanvas = () => {
    const canvas = paintCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    sound.beep(200, 100, 'sawtooth');
  };

  const savePicture = () => {
    paintCanvasRef.current?.toBlob((png) => png && downloadFile('untitled.png', png), 'image/png');
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black select-none font-sans text-xs">
      {/* Authentic Windows XP Menu Bar */}
      <MenuBar
        menus={[
          {
            label: 'File',
            items: [
              { label: 'New', onSelect: clearPaintCanvas },
              { label: 'Save As...', onSelect: savePicture },
              'separator',
              { label: 'Print...' },
              'separator',
              { label: 'Exit', onSelect: () => shell.close(id) },
            ],
          },
          { label: 'Edit', items: [{ label: 'Undo' }, 'separator', { label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }] },
          { label: 'View', items: [{ label: 'Zoom' }] },
          { label: 'Image', items: [{ label: 'Flip/Rotate...' }, 'separator', { label: 'Clear Image', onSelect: clearPaintCanvas }] },
          { label: 'Colors', items: [{ label: 'Edit Colors...' }] },
          {
            label: 'Help',
            items: [
              { label: 'Help Topics', onSelect: () => showHelpAndSupport(shell) },
              'separator',
              { label: 'About Paint', onSelect: () => showAbout(shell, 'Paint', appIcon('paint')) },
            ],
          },
        ]}
      />

      {/* Top tool bars */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#ece9d8] border-b border-[#dedede] text-xs">
        <div className="flex items-center space-x-1.5">
          {[
            { id: 'pencil', label: 'Pencil' },
            { id: 'brush', label: 'Brush' },
            { id: 'bucket', label: 'Fill' },
            { id: 'eraser', label: 'Eraser' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setPaintTool(tool.id as any);
                sound.play('click');
              }}
              className={`px-2 py-0.5 rounded-[2px] flex items-center space-x-1 cursor-pointer text-xp-body font-sans ${paintTool === tool.id
                ? 'bg-[#f6f4ea] xp-bevel-sunken font-bold text-[#003399]'
                : 'bg-[#ece9d8] xp-bevel-raised hover:bg-[#f6f6ef]'
                }`}
            >
              <ToolIcon tool={tool.id as Tool} />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Brush thickness select */}
        {paintTool === 'brush' && (
          <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-[#f0ede0] rounded xp-bevel-inset">
            <span className="text-xp-caption text-gray-700">Size:</span>
            {[4, 8, 12].map((sz) => (
              <button
                key={sz}
                onClick={() => {
                  setPaintSize(sz);
                  sound.play('click');
                }}
                className={`w-4 h-4 rounded-[1px] flex items-center justify-center text-xp-micro cursor-pointer ${paintSize === sz ? 'bg-[#316ac5] text-white font-bold' : 'bg-white hover:bg-neutral-100'}`}
              >
                {sz === 4 ? 'S' : sz === 8 ? 'M' : 'L'}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={clearPaintCanvas}
          className="xp-btn"
        >
          Clear
        </button>
      </div>

      {/* MS Paint Dark Gray Workspace and Canvas */}
      <div className="flex-1 bg-[#808080] flex items-center justify-center p-2 relative overflow-hidden" style={{ minHeight: 0 }}>
        <canvas
          ref={paintCanvasRef}
          width={440}
          height={300}
          onPointerDown={handlePaintMouseDown}
          onPointerMove={handlePaintMouseMove}
          onPointerUp={handlePaintMouseUp}
          onPointerCancel={handlePaintMouseUp}
          style={{ touchAction: 'none' }}
          className="bg-white border border-[#404040] shadow-[2px_2px_0_#ffffff] cursor-crosshair"
        />
      </div>

      {/* Windows XP 28-Color Palette Bar */}
      <div className="px-2 py-1.5 bg-[#ece9d8] border-t border-[#dedede] flex items-center space-x-2 select-none">
        {/* Current Primary Color indicator box */}
        <div className="w-8 h-8 bg-white xp-bevel-sunken p-1 flex items-center justify-center relative flex-shrink-0">
          <div
            className="w-5 h-5 border border-black shadow-inner"
            style={{ backgroundColor: paintColor }}
            title={`Current Color: ${paintColor}`}
          />
        </div>

        {/* 2-Row Swatch Grid */}
        <div className="grid grid-rows-2 grid-flow-col gap-0.5">
          {[
            '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
            '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
          ].map((hex) => (
            <button
              key={hex}
              onClick={() => {
                setPaintColor(hex);
                sound.play('click');
              }}
              className="w-4 h-4 cursor-pointer xp-bevel-sunken"
              style={{
                backgroundColor: hex,
                outline: paintColor === hex ? '1px solid #000' : 'none'
              }}
              title={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
