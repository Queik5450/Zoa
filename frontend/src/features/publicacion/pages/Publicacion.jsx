import { useNavigate } from 'react-router-dom';

export default function Publicacion() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[url('/Rectangle-2@2x.png')] bg-center bg-cover bg-no-repeat">
      <div className="pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] rounded-[32px] bg-white/90 p-5 shadow-[0_24px_56px_rgba(0,0,0,0.22)] backdrop-blur-xl mx-4 my-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          aria-label="Cerrar publicación"
        >
          <span className="text-lg font-bold leading-none">×</span>
        </button>

        <div className="relative overflow-hidden rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <img
            className="block h-auto w-full object-cover"
            alt="Publicación"
            src="/Rectangle-2@2x.png"
          />
          <div className="absolute inset-x-0 bottom-0 bg-white/95 px-4 py-4 text-left">
            <h3 className="m-0 text-xl font-bold text-black">Flor de Mayo</h3>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#675a5a]">
              <img
                className="h-3 w-auto"
                loading="lazy"
                alt="Icono de ubicación"
                src="/mapa.svg"
              />
              <span>Plumeria rubra</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <button className="flex min-h-[48px] items-center justify-center rounded-[20px] bg-[radial-gradient(circle_at_top_left,_#c1e734,_#88a41d)] px-5 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition hover:brightness-110">
            Guardar
          </button>
          <button className="flex min-h-[48px] items-center justify-center rounded-[20px] bg-[radial-gradient(circle_at_top_left,_#c1e734,_#89a426)] px-5 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition hover:brightness-110">
            Publicar
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,_rgba(225,225,225,0.57)_8%,rgba(123,123,123,0.49)_99%)] border border-black/10 text-xl font-semibold text-black transition hover:brightness-95">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
