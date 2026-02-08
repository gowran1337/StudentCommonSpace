import Stadordning from '../components/Stadordning';
import Staduppgifter from '../components/Staduppgifter';
import Inkopslista from '../components/Inkopslista';

function TaskBoard() {
  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <h1 className="text-center text-[#333] mb-8 text-4xl">Uppgifter & Städning</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 items-start max-md:grid-cols-1">
        <Stadordning />
        <Staduppgifter />
        <Inkopslista />
      </div>
    </div>
  );
}

export default TaskBoard;
