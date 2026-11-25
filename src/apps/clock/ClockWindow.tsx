import ClockCanvas from '../../components/ClockCanvas';

/** Date and Time Properties: an analog clock. */
export default function ClockWindow() {


  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] items-center justify-center p-3 select-none font-sans text-xs">
      {/* Date and Time Properties card */}
      <div className="bg-white p-3 rounded-[3px] border border-[#7f9db9] shadow-sm flex flex-col items-center">
        <ClockCanvas />
        <span className="mt-2 text-xp-body text-gray-700 font-medium font-sans">
          Date &amp; Time Properties
        </span>
      </div>
    </div>
  );
}
