import ScanForm from "./components/scanForm";

const ScanPage = () => {
  return (
    <div className="contentLayout">
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="text-3xl font-bold">New Entry</div>
        <ScanForm />
      </div>
    </div>
  );
};

export default ScanPage;
