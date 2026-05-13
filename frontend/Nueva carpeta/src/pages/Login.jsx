import FrameComponent from "../components/FrameComponent";

const Login = () => {
  return (
    <div className="w-full relative shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] bg-[#fff] overflow-hidden flex flex-col items-end pt-[19px] px-[35px] pb-[314px] box-border gap-[120.2px] leading-[normal] tracking-[normal] text-center text-[34.2px] text-[#000] font-[Inter]">
      <div className="self-stretch shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] flex items-start relative isolate max-w-full">
        <img
          className="h-[89px] w-[406px] absolute !!m-[0 important] bottom-[-30.2px] left-[-39px] shrink-0"
          alt=""
          src="/Rectangle-1.svg"
        />
        <div className="flex-1 shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] flex items-start justify-center pt-0 pb-[0.2px] pl-6 pr-5 box-border relative isolate max-w-full z-[2] shrink-0">
          <img
            className="h-[89px] w-[406px] absolute !!m-[0 important] bottom-[-28.2px] left-[-39px] shrink-0"
            alt=""
            src="/Rectangle-1.svg"
          />
          <div className="w-[98.9px] flex items-start shrink-0">
            <div className="flex-1 relative font-semibold shrink-0 z-[1]">
              ZOA
              <br />
            </div>
            <div className="flex-1 relative font-semibold shrink-0 z-[1] ml-[-98.9px]">
              ZOA
              <br />
            </div>
          </div>
        </div>
      </div>
      <FrameComponent />
    </div>
  );
};

export default Login;
