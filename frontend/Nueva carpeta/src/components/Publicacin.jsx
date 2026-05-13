import PropTypes from "prop-types";

const Publicacin = ({ className = "" }) => {
  return (
    <div
      className={`max-w-full overflow-hidden flex flex-col items-start pt-[15px] px-[19px] pb-[27px] box-border relative isolate gap-28 bg-[url('/public/Publicaci-n@3x.png')] bg-cover bg-no-repeat bg-[top] leading-[normal] tracking-[normal] ${className}`}
    >
      <img
        className="w-full h-[886px] absolute !!m-[0 important] top-[-12px] right-[0px] left-[0px] max-w-full overflow-hidden shrink-0 object-cover"
        alt=""
        src="/Rectangle-3@2x.png"
      />
      <button className="cursor-pointer [border:none] pt-[9.3px] px-[11px] pb-[8.9px] bg-[rgba(0,0,0,0.41)] rounded-[50px] overflow-hidden flex items-start z-[1] shrink-0 hover:bg-[rgba(51,51,51,0.41)]">
        <div className="h-[37px] w-[37px] relative rounded-[50px] bg-[rgba(0,0,0,0.41)] hidden shrink-0" />
        <h1 className="m-0 h-[19px] relative text-[25px] font-medium font-['Instrument_Sans'] text-[#fff] text-center inline-block z-[1] shrink-0">
          x
        </h1>
      </button>
      <section className="flex items-start py-0 px-2 box-border max-w-full shrink-0 text-center text-[15px] text-[#fff] font-['Instrument_Sans']">
        <div className="flex flex-col items-start gap-[60px] max-w-full mq348:gap-[30px]">
          <div className="w-[335px] flex items-start py-0 px-[5px] box-border max-w-full">
            <div className="h-[582px] flex-1 relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden max-w-full z-[2]">
              <div className="absolute top-[70px] left-[0px] w-[342px] flex items-start justify-between gap-5 shrink-0">
                <div className="w-[69px] relative inline-block shrink-0 z-[1]">
                  27
                </div>
                <div className="w-[69px] flex flex-col items-start pt-px px-0 pb-0 box-border">
                  <div className="self-stretch relative z-[1]">15</div>
                </div>
                <div className="w-[69px] relative inline-block shrink-0 z-[1]">
                  12
                </div>
              </div>
              <img
                className="absolute top-[0px] left-[0px] rounded-2xl w-full h-full object-cover shrink-0"
                alt=""
                src="/Rectangle-2@2x.png"
              />
              <div className="absolute top-[501px] left-[0px] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] bg-[#fff] w-full overflow-hidden flex flex-col items-start pt-1 px-3 pb-[30px] box-border gap-0.5 max-w-full z-[1] shrink-0 text-left text-2xl text-[#000] font-[Inter]">
                <img
                  className="w-[325px] h-[81px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] hidden max-w-full shrink-0"
                  alt=""
                  src="/Rectangle-4.svg"
                />
                <img className="w-0 h-0 relative hidden shrink-0" alt="" />
                <h3 className="m-0 relative text-[length:inherit] font-bold font-[inherit] z-[1] shrink-0">
                  Flor de Mayo
                </h3>
                <div className="flex items-start gap-1.5 shrink-0 text-xs text-[#675a5a]">
                  <div className="flex flex-col items-start pt-px px-0 pb-0">
                    <img
                      className="w-3 h-[13px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] z-[1]"
                      loading="lazy"
                      alt=""
                      src="/mapa.svg"
                    />
                  </div>
                  <div className="relative font-semibold z-[1]">
                    Plumeria rubra
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch h-[41px] flex items-center gap-[13px] z-[1] text-[25px] text-[#000] mq385:flex-wrap">
            <div className="flex items-center gap-3.5">
              <button className="cursor-pointer [border:none] py-3 px-[42px] bg-[transparent] h-[41px] w-[140px] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] [background:radial-gradient(50%_50%_at_50%_50%,_#c1e734,_#88a41d)] flex items-start box-border">
                <div className="h-[41px] w-[140px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] [background:radial-gradient(50%_50%_at_50%_50%,_#c1e734,_#88a41d)] hidden shrink-0" />
                <div className="h-[17px] w-[54px] relative text-sm font-semibold font-['Instrument_Sans'] text-[#000] text-center inline-block z-[1] shrink-0">
                  Guardar
                </div>
              </button>
              <button className="cursor-pointer [border:none] py-3 pl-[45px] pr-10 bg-[transparent] h-[41px] w-[140px] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] [background:radial-gradient(50%_50%_at_50%_50%,_#c1e734,_#89a426)] flex items-start box-border">
                <div className="h-[41px] w-[140px] relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-[20px] [background:radial-gradient(50%_50%_at_50%_50%,_#c1e734,_#89a426)] hidden shrink-0" />
                <div className="h-[17px] w-[55px] relative text-sm font-semibold font-['Instrument_Sans'] text-[#000] text-center inline-block z-[1] shrink-0">
                  Publicar
                </div>
              </button>
            </div>
            <div className="h-[41px] w-[41px] rounded-[50px] [background:radial-gradient(50%_50%_at_50%_50%,_rgba(225,_225,_225,_0.57)_8.18%,_rgba(123,_123,_123,_0.49)_99.04%)] border-[#000] border-solid border-[0.1px] box-border flex items-start py-1 pl-2 pr-[7px]">
              <div className="h-[41px] w-[41px] relative rounded-[50px] [background:radial-gradient(50%_50%_at_50%_50%,_rgba(225,_225,_225,_0.57)_8.18%,_rgba(123,_123,_123,_0.49)_99.04%)] border-[#000] border-solid border-[0.1px] box-border hidden shrink-0" />
              <h2 className="m-0 h-[31px] w-[25px] relative text-[length:inherit] font-semibold font-[inherit] inline-block z-[1] shrink-0">
                →
              </h2>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

Publicacin.propTypes = {
  className: PropTypes.string,
};

export default Publicacin;
