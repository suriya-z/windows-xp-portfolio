import { useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { appIcon } from '../../os/apps';
import { sound } from '../../os/sound';
import { showAbout, showHelpAndSupport, useShell } from '../../os/shell';
import { newCalculator, press } from './calculator';

/** Calculator, Standard view. */
export default function CalculatorWindow() {
  const shell = useShell();
  const [calc, setCalc] = useState(newCalculator);

  const handleKey = (key: string) => {
    sound.play('click');
    setCalc((c) => press(c, key));
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black p-2 font-sans select-none text-xs">
      {/* Authentic Menu Bar */}
      <MenuBar
        className="xp-menubar mb-2 -mt-1 -mx-1"
        menus={[
          {
            label: 'Edit',
            items: [
              { label: 'Copy', onSelect: () => navigator.clipboard?.writeText(calc.display).catch(() => {}) },
              { label: 'Paste' },
            ],
          },
          // Standard is the view already showing; choosing it again changes nothing, as in Windows.
          { label: 'View', items: [{ label: 'Standard', checked: true, onSelect: () => {} }, { label: 'Scientific' }] },
          {
            label: 'Help',
            items: [
              { label: 'Help Topics', onSelect: () => showHelpAndSupport(shell) },
              'separator',
              { label: 'About Calculator', onSelect: () => showAbout(shell, 'Calculator', appIcon('calc')) },
            ],
          },
        ]}
      />

      {/* Authentic XP White Inset Display */}
      <div className="bg-white border border-[#7f9db9] p-2 text-right text-xl font-sans text-black shadow-inner mb-3 xp-bevel-sunken flex items-center justify-end h-9">
        <span role="status" aria-label="Display" className="truncate">{calc.display}</span>
      </div>

      {/* Clear and Backspace control row */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <button
          onClick={() => handleKey('back')}
          className="xp-btn text-red-700 font-bold py-1 text-xp-body"
        >
          Backspace
        </button>
        <button
          onClick={() => handleKey('CE')}
          className="xp-btn text-red-700 font-bold py-1 text-xp-body"
        >
          CE
        </button>
        <button
          onClick={() => handleKey('C')}
          className="xp-btn text-red-700 font-bold py-1 text-xp-body"
        >
          C
        </button>
      </div>

      {/* Keys matrix */}
      <div className="flex-1 grid grid-cols-4 gap-1.5 text-xs font-bold">
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '+/-', '.', '+'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleKey(btn)}
            className={`xp-btn py-1.5 text-center text-xs font-bold cursor-pointer ${['/', '*', '-', '+'].includes(btn)
              ? 'text-red-700'
              : 'text-blue-900'
              }`}
          >
            {btn}
          </button>
        ))}
        <button
          onClick={() => handleKey('=')}
          className="xp-btn py-1.5 text-center text-xs font-bold text-red-700 col-span-4 cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
}
