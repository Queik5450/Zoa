import PropTypes from "prop-types";

const Component3 = ({ className = "" }) => {
  return (
    <div
      className={`ml-[-160.5px] h-[89px] w-[406px] flex items-start pt-[17px] pb-[30.4px] pl-[157.5px] pr-[149.6px] box-border relative isolate z-[2] shrink-0 text-center text-[34.2px] text-[#000] font-[Inter] ${className}`}
    >
      <img
        className="h-full w-full absolute !!m-[0 important] top-[0px] right-[0px] bottom-[0px] left-[0px] max-w-full overflow-hidden max-h-full z-[0] shrink-0"
        alt=""
        src="/Rectangle-1.svg"
      />
      <h2 className="m-0 h-[41.6px] w-[98.9px] relative text-[length:inherit] font-semibold font-[inherit] inline-block z-[1] shrink-0">
        ZOA
        <br />
      </h2>
    </div>
  );
};

Component3.propTypes = {
  className: PropTypes.string,
};

export default Component3;
