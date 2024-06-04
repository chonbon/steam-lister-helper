import { useEffect, useState } from "react"
import pjson from "../../package.json";
import "./index.css"

function IndexPopup() {
  const [showCopy, setShowCopy] = useState(false)

  // write text to clipboard
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopy(true);
  };

  // hide copy message after 2 seconds
  useEffect(() => {
    if (showCopy) {
      setTimeout(() => {
        setShowCopy(false);
      }, 2000);
    }
  }, [showCopy]);

  return (
    <div className="border-zinc-400 border-[1px] bg-black/80 p-4 text-white min-w-[30rem] font-mono relative">
        <p className="absolute top-0" hidden={!showCopy}>copied text!</p>

        <h3>If my extension was helpful, consider donating to my solana wallet:</h3>

        <h3>
          <span className="cursor-pointer font-bold text-cyan-600" onClick={() => {copyText('ch0n.sol')}}>
            ch0n.sol</span> or <span className="cursor-pointer font-bold text-cyan-600" onClick={() => {copyText('chontko2HyMRLW9xHjVHzoMEXwTrFVGXz342gYCwreJ')}}>
            chontko2HyMRLW9xHjVHzoMEXwTrFVGXz342gYCwreJ</span>
        </h3>

        <h1 className="text-zinc-400 mt-2">Built by chon | v{pjson.version}</h1>
    </div>
  );
}

export default IndexPopup