import { useCallback } from "react";
import PropTypes from "prop-types";

const FrameComponent = ({ className = "" }) => {
  const onRegstrateTextClick = useCallback(() => {
    // Please sync "Registro de Usuario" to the project
  }, []);

  return (
    <div
      className={`self-stretch flex items-start justify-end py-0 pl-[7px] pr-0.5 box-border max-w-full text-center text-[27px] text-[#000] font-[Inter] ${className}`}
    >
      <div className="flex-1 flex flex-col items-start gap-[9px] max-w-full">
        <div className="w-[307px] flex items-start py-0 px-[26px] box-border">
          <div className="flex-1 relative">Iniciar Sesión</div>
        </div>
        <div className="self-stretch flex flex-col items-start gap-3 max-w-full text-[15px]">
          <div className="flex items-start py-0 px-5">
            <div className="flex items-start">
              <div className="flex flex-col items-start py-0 px-0">
                <div className="mr-[-11px] w-[163px] relative inline-block shrink-0">
                  ¿No tienes cuenta?
                </div>
              </div>
              <a
                className="[text-decoration:underline] relative inline-block italic text-[#7d8d42] min-w-[82px] shrink-0 cursor-pointer"
                id="registro"
                onClick={onRegstrateTextClick}
              >
                Regístrate
              </a>
            </div>
          </div>
          <div className="self-stretch shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] bg-[#7f962b] overflow-hidden flex flex-col items-end pt-6 pb-[31px] pl-2 pr-[30px] box-border gap-4 max-w-full text-[#fff]">
            <div className="w-[322px] h-[246px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] bg-[#7f962b] hidden max-w-full shrink-0" />
            <div className="self-stretch flex items-start justify-end py-0 pl-0 pr-px shrink-0">
              <div className="flex-1 flex flex-col items-end gap-[3px]">
                <div className="self-stretch flex items-start justify-end py-0 pl-0 pr-3">
                  <div className="flex-1 relative z-[1]">
                    Username o correo electrónico
                  </div>
                </div>
                <input
                  className="[border:none] [outline:none] bg-[#fff] w-[259px] h-[33px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-lg z-[1]"
                  type="text"
                />
              </div>
            </div>
            <div className="self-stretch flex items-start justify-end pt-0 pb-[15px] pl-3 pr-[3px] shrink-0">
              <div className="flex-1 flex flex-col items-start gap-[5px]">
                <div className="w-[108px] relative inline-block z-[1]">
                  Contraseña
                </div>
                <div className="self-stretch flex items-start py-0 pl-2.5 pr-0">
                  <input
                    className="[border:none] [outline:none] w-full bg-[#fff] h-[33px] flex-1 relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-lg z-[1]"
                    type="password"
                  />
                </div>
              </div>
            </div>
            <button
              className="cursor-pointer [border:none] pt-2 px-[91px] pb-[9px] bg-[#c1e734] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-lg flex items-start z-[1] shrink-0 mq260:pl-5 mq260:pr-5 mq260:box-border"
              type="submit"
            >
              <div className="h-8 w-[261px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-lg bg-[#c1e734] hidden shrink-0" />
              <div className="relative text-xs font-semibold font-[Inter] text-[#1e1e1e] text-center z-[1] shrink-0">
                Iniciar Sesión
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

FrameComponent.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent;
