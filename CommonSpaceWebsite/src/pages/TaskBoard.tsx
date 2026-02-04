import { useState } from 'react';
import Stadordning from '../components/Stadordning';
import Staduppgifter from '../components/Staduppgifter';
import Inkopslista from '../components/Inkopslista';

function TaskBoard() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error! This error was triggered to test the Error Boundary.');
  }

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <h1 className="text-center text-[#333] mb-8 text-4xl">Studentens Anslagstavla</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 items-start max-md:grid-cols-1">
        <Stadordning />
        <Staduppgifter />
        <Inkopslista />
      </div>

      <button
        onClick={() => setShouldError(true)}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Test Error Boundary
      </button>
    </div>
  );
}

export default TaskBoard;
