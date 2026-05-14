import Component3 from "./Component3";
import PropTypes from "prop-types";

const PerfilUsuario = ({ className = "" }) => {
  return (
    <form
      className={`m-0 w-[402px] bg-[#edf7f9] max-w-full overflow-hidden flex flex-col items-start pt-[17px] px-0 pb-[47px] box-border gap-[9px] leading-[normal] tracking-[normal] ${className}`}
    >
      <section className="self-stretch flex flex-col items-end py-0 px-5 box-border gap-[37.2px] max-w-full shrink-0">
        <div className="flex items-end max-w-full shrink-0">
          <div className="shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] flex items-start relative isolate shrink-0 max-w-full">
            <img
              className="h-[89px] w-[406px] absolute !!m-[0 important] bottom-[-30.2px] left-[-39px] shrink-0"
              alt=""
              src="/Rectangle-1.svg"
            />
            <div className="h-[41.8px] w-[331.8px] [filter:drop-shadow(0px_4px_4px_rgba(0,_0,_0,_0.25))] flex items-start relative isolate max-w-full z-[2] shrink-0">
              <div className="w-[426px] !!m-[0 important] absolute bottom-[-223.2px] left-[-48px] flex flex-col items-start p-2.5 box-border z-[0] shrink-0">
                <img
                  className="w-[406px] h-[221px] relative"
                  alt=""
                  src="/Rectangle-20.svg"
                />
              </div>
              <div className="mt-[-11px] ml-[-37px] w-[401px] flex items-start py-0 pl-[155px] pr-0 box-border shrink-0 max-w-[121%]">
                <Component3 />
                <div className="w-[98.9px] flex flex-col items-start pt-[11px] px-0 pb-0 box-border ml-[-245.5px] relative shrink-0">
                  <h1 className="m-0 self-stretch relative text-[34.2px] font-semibold font-[Inter] text-[#000] text-center z-[1]">
                    ZOA
                    <br />
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-end pt-0 px-0 pb-[2.8px] ml-[-61.8px] relative">
            <button
              className="cursor-pointer [border:none] pt-2.5 pb-[5px] pl-1 pr-[3px] bg-[#edf7f9] self-stretch shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[10px] overflow-hidden flex items-start shrink-0 z-[3] hover:bg-[#d4dee0]"
              type="submit"
            >
              <div className="h-[30px] w-[75px] relative rounded-[10px] bg-[#edf7f9] hidden shrink-0" />
              <div className="flex-1 relative text-[11px] font-medium font-['Instrument_Sans'] text-[#000] text-center inline-block min-w-[68px] z-[1] shrink-0">
                Editar Perfil
              </div>
            </button>
          </div>
        </div>
        <div className="mr-[-27px] w-[420px] flex flex-col items-start gap-2.5 max-w-[117%] shrink-0">
          <div className="self-stretch flex items-start py-0 pl-[9px] pr-0 box-border max-w-full">
            <div className="flex-1 flex flex-col items-end gap-[15px] max-w-full">
              <div className="flex items-start justify-end py-0 px-[13px] box-border max-w-full">
                <div className="self-stretch flex-1 flex items-start gap-3 max-w-full">
                  <img
                    className="w-[102px] relative shadow-[0px_4px_3px_rgba(0,_0,_0,_0.25)] rounded-[50px] max-h-full object-cover"
                    loading="lazy"
                    alt=""
                    src="/image-17@2x.png"
                  />
                  <div className="flex flex-col items-start gap-1 min-w-[259px]">
                    <h2 className="m-0 self-stretch h-[31px] relative text-[25px] font-bold font-['Instrument_Sans'] text-[#000] text-left inline-block">
                      Pedro Sánchez
                    </h2>
                    <div className="self-stretch h-[18px] relative text-[15px] font-['Instrument_Sans'] text-[#000] text-left inline-block">
                      @pedrosanchez
                    </div>
                    <div className="w-[202px] h-[38px] relative text-[15px] font-['Instrument_Sans'] text-[#000] text-left inline-block">
                      Entusiasta de la naturaleza | Biologo profesional
                    </div>
                    <div className="w-[209px] h-[18px] flex items-start gap-0.5">
                      <img
                        className="h-[17px] w-[22px] relative object-cover"
                        loading="lazy"
                        alt=""
                        src="/Calendar@2x.png"
                      />
                      <i className="h-[17.3px] w-[185px] relative text-xs inline-block font-['Instrument_Sans'] text-[#000] text-center">
                        Miembro desde 12 de mayo, 2026
                      </i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start gap-[5px] max-w-full">
                <div className="self-stretch h-px relative border-[#000] border-solid border-t-[1px] box-border [transform:_rotate(-0.1deg)]" />
                <div className="self-stretch flex items-start py-0 pl-[7px] pr-2.5 box-border max-w-full">
                  <div className="h-[45px] flex-1 relative max-w-full">
                    <div className="absolute top-[38px] left-[0px] border-[#b8b8b8] border-solid border-t-[1px] box-border w-[394px] h-px" />
                    <div className="absolute top-[0px] left-[3px] flex items-center gap-5 w-full h-full">
                      <div className="h-[45px] flex items-start">
                        <div className="w-[117px] flex flex-col items-center">
                          <div className="self-stretch h-[19px] relative text-[15px] font-['Instrument_Sans'] text-[#fff] text-center inline-block">
                            27
                          </div>
                          <div className="self-stretch h-[26px] relative text-[11px] font-['Instrument_Sans'] text-[#fff] text-center inline-block">
                            Especies registradas
                          </div>
                        </div>
                      </div>
                      <div className="h-[43px] flex flex-col items-start">
                        <div className="flex items-start py-0 px-6">
                          <div className="h-[19px] w-[69px] relative text-[15px] font-['Instrument_Sans'] text-[#fff] text-center inline-block shrink-0">
                            15
                          </div>
                        </div>
                        <div className="h-6 flex items-start pt-0 px-0 pb-0 box-border">
                          <div className="mt-[-2px] h-[26px] w-[117px] relative text-[11px] font-['Instrument_Sans'] text-[#fff] text-center inline-block shrink-0">
                            Fotos tomadas
                          </div>
                        </div>
                      </div>
                      <div className="h-11 flex flex-col items-start">
                        <div className="flex items-start py-0 px-6">
                          <div className="h-[19px] w-[69px] relative text-[15px] font-['Instrument_Sans'] text-[#fff] text-center inline-block shrink-0">
                            12
                          </div>
                        </div>
                        <div className="h-[25px] flex items-start pt-0 px-0 pb-0 box-border">
                          <div className="mt-[-1px] h-[26px] w-[117px] relative text-[11px] font-['Instrument_Sans'] text-[#fff] text-center inline-block shrink-0">
                            Audios grabados
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3 className="m-0 w-[124px] relative text-[22px] font-bold font-['Instrument_Sans'] text-[#000] text-center inline-block">
            Fotos
          </h3>
        </div>
      </section>
      <section className="self-stretch flex flex-col items-end pt-0 px-[153px] pb-[13.5px] box-border gap-3 max-w-full shrink-0">
        <div className="mr-[-172px] w-[440px] flex flex-col items-start max-w-[459%] shrink-0">
          <div className="self-stretch flex items-start [row-gap:20px] mq382:flex-wrap">
            <div className="h-[117px] w-[157px] relative bg-[#d9d9d9]" />
            <img
              className="w-[147px] relative max-h-full object-cover"
              loading="lazy"
              alt=""
              src="/image-21@2x.png"
            />
            <div className="h-[117px] w-[132px] relative bg-[#d9d9d9]" />
          </div>
          <div className="self-stretch flex items-center [row-gap:20px] mq382:flex-wrap">
            <img
              className="h-[114px] w-[156px] relative object-cover"
              loading="lazy"
              alt=""
              src="/image-19@2x.png"
            />
            <div className="h-[114px] w-[148px] relative bg-[#d9d9d9]" />
            <img
              className="h-[114px] w-[136px] relative object-cover"
              loading="lazy"
              alt=""
              src="/image-19@2x.png"
            />
          </div>
        </div>
        <button
          className="cursor-pointer [border:none] pt-[7px] pb-2 pl-[15px] pr-3.5 bg-[#c1e734] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[10px] flex items-start shrink-0 hover:bg-[#8fb500]"
          type="submit"
        >
          <div className="h-[30px] w-[75px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[10px] bg-[#c1e734] hidden shrink-0" />
          <b className="relative text-xs font-['Instrument_Sans'] text-[#000] text-center z-[1] shrink-0">
            Ver más
          </b>
        </button>
      </section>
      <img
        className="ml-[-3px] mb-[5.5px] w-[408px] relative max-h-full max-w-[102%] shrink-0"
        alt=""
        src="/Line-8.svg"
      />
      <h3 className="ml-[-5px] mb-1 m-0 w-[127px] relative text-[22px] font-bold font-['Instrument_Sans'] text-[#000] text-center inline-block shrink-0">
        Audios
      </h3>
      <section className="flex items-start py-0 pl-[26px] pr-[25px] box-border max-w-full shrink-0">
        <div className="flex flex-col items-start gap-[7px] max-w-full">
          <audio
            className="w-[351px] h-[46px] rounded-[10px] bg-[#d9d9d9] flex items-start"
            controls
          >
            <source />
          </audio>
          <audio
            className="w-[351px] h-[46px] rounded-[10px] bg-[#d9d9d9] flex items-start"
            controls
          >
            <source />
          </audio>
          <audio
            className="w-[351px] h-[46px] rounded-[10px] bg-[#d9d9d9] flex items-start"
            controls
          >
            <source />
          </audio>
        </div>
      </section>
    </form>
  );
};

PerfilUsuario.propTypes = {
  className: PropTypes.string,
};

export default PerfilUsuario;
