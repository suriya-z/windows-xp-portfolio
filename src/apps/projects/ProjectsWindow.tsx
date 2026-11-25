import { useEffect, useRef, useState } from 'react';
import type { AppProps } from '../../os/shell';
import { SafeIcon } from '../../components/SafeIcon';
import { profile } from '../../os/profile';
import { sound } from '../../os/sound';

const SIMULATION_LOG = [
  `[SYS] Initializing SURIYA-85 Deep Learning Core...`,
  `[SYS] Scanning available co-processors... Co-processor Intel 80287 Active.`,
  `[SYS] Allocating matrix tensor segments inside base memory...`,
  `[DATA] Loading training vectors from storage array... Done. (64,000 samples)`,
  `[CORE] Layer 0: Conv2D (16 channels, kernel=3x3) -> OK`,
  `[CORE] Layer 1: Quantized Dense Output (Softmax) -> OK`,
  `[TRAIN] Epoch 1/3: Training started...`,
  `[TRAIN] Epoch 1: Loss 0.8924 | Validation Acc: 68.2%`,
  `[TRAIN] Epoch 2/3: Training optimization in progress...`,
  `[TRAIN] Epoch 2: Loss 0.3541 | Validation Acc: 89.4%`,
  `[TRAIN] Epoch 3/3: Final optimization run...`,
  `[TRAIN] Epoch 3: Loss 0.0821 | Validation Acc: 98.4%`,
  `[SYS] Saving model layer weights to binary file 'C:\\MODELS\\WEIGHTS.BIN'...`,
  `[SUCCESS] Simulation accomplished successfully! Test accuracy: 98.4%`,
];

/** My Projects: the profile's projects, with a simulated training run. */
export default function ProjectsWindow({ launch }: AppProps) {
  const projects = profile.projects;
  const [activeProjId, setActiveProjId] = useState(launch?.project ?? projects[0]?.id);

  // Opened again on another project (from its folder in My Documents): show that one.
  useEffect(() => {
    if (launch?.project) setActiveProjId(launch.project);
  }, [launch?.seq]);
  const [projLogs, setProjLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Closing the window stops a simulation that is still running.
  useEffect(() => () => {
    if (simulationRef.current) clearInterval(simulationRef.current);
  }, []);

  const runProjectSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);
    setProjLogs([]);
    sound.beep(440, 150, 'sawtooth');

    let logIndex = 0;
    simulationRef.current = setInterval(() => {
      if (logIndex < SIMULATION_LOG.length) {
        const line = SIMULATION_LOG[logIndex];
        setProjLogs((p) => [...p, line]);
        setSimProgress(Math.floor(((logIndex + 1) / SIMULATION_LOG.length) * 100));
        sound.beep(800 + logIndex * 30, 20, 'square');
        logIndex++;
      } else {
        clearInterval(simulationRef.current!);
        simulationRef.current = null;
        setIsSimulating(false);
        sound.tune([
          { freq: 880, ms: 80, wave: 'sine', at: 0 },
          { freq: 1100, ms: 150, wave: 'sine', at: 90 },
        ]);
      }
    }, 350);
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-neutral-50 text-black select-none font-sans text-xp-body">
      {/* Project selector side list */}
      <div className="flex-1 flex h-full overflow-hidden" style={{ minHeight: 0 }}>
        {/* Sidebar list */}
        <div className="w-1/3 border-r overflow-y-auto bg-white win1-scrollbar border-[#aca899]">
          <div className="p-1.5 border-b text-xp-caption font-bold bg-[#ece9d8] border-[#aca899] text-black">
            Projects
          </div>
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                setActiveProjId(proj.id);
                sound.play('click');
              }}
              className={`p-2 border-b border-neutral-200 cursor-pointer text-xp-body ${activeProjId === proj.id ? 'bg-[#316ac5] text-white' : 'hover:bg-neutral-50'}`}
            >
              {proj.name}
            </div>
          ))}
        </div>

        {/* Project details workspace */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col bg-white justify-between select-text">
          {(() => {
            const proj = projects.find(p => p.id === activeProjId);
            if (!proj) return null;
            return (
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold border-b pb-1 border-[#aca899] text-[#003399]">{proj.name}</h2>
                  <p className="text-xp-caption text-neutral-500 italic mt-0.5">{proj.summary}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xp-caption font-bold uppercase text-blue-700">Tech Stack:</span>
                  <p className="p-1.5 bg-neutral-100 border border-neutral-300 font-bold text-xp-body text-neutral-800">{proj.stack}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xp-caption font-bold uppercase text-blue-700">Description:</span>
                  <p className="text-xp-body leading-relaxed text-neutral-700">{proj.description}</p>
                </div>
              </div>
            );
          })()}

          {/* Trigger interactive compilation simulation log scroll */}
          <div className="mt-4 pt-3 border-t border-dashed border-neutral-300">
            <button
              onClick={runProjectSimulation}
              disabled={isSimulating}
              className="xp-btn disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <SafeIcon src="/assets/xp-icons/Run.png" className="w-4 h-4 object-contain" size={16} alt="" />
              <span>Run neural simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom live terminal simulation overlay window if simulating */}
      {projLogs.length > 0 && (
        <div className="h-1/2 border-t-2 border-black flex flex-col bg-black text-[#33ff33] p-2 overflow-hidden relative">
          <div className="flex justify-between items-center border-b border-[#33ff33]/20 pb-1 mb-1 text-xp-caption font-bold">
            <span>SURIYA-NEURAL-CORE.SYS</span>
            <span>PROGRESS: {simProgress}%</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 text-xp-caption font-mono win1-scrollbar">
            {projLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {isSimulating && (
              <div className="w-2 h-3.5 bg-[#33ff33] inline-block blink-caret"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
