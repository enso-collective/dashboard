import { MoonLoader } from 'react-spinners';

export default function GiganticLoader() {
  return (
    <div className="flex flex-row justify-center pt-8">
      <MoonLoader size={100} color="rgba(255,255,255,1)" />
    </div>
  );
}
