import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import cssText from "data-text:~./contents/ConfirmDialog.css"
import { useStorage } from "@plasmohq/storage/hook"
import { useEffect, useState } from "react";

export const config: PlasmoCSConfig = {
    matches: ["https://steamcommunity.com/id/*/inventory*"],
    all_frames: true,
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = () => 
    document.querySelector('body.inventory_page');

export const getShadowHostId = () => "confirm-dialog";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
}


const ConfirmDialog = () => {
    const [items, setItems] = useState([]);
    const [readyForSale, setReadyForSale] = useStorage('readyForSale');
    const [startSale, setStartSale] = useStorage('startSale');

    // listen for conirmation dialog to be opened
    useEffect(() => {
        if (readyForSale) {
            setItems(readyForSale);
        }
        setReadyForSale(null);
    }, [readyForSale]);

    // cancel and dismiss the dialog
    const cancel = () => {
        setItems([]);
        setReadyForSale(null);
    }

    // dismiss the dialog and trigger the sale/listing
    const confirmSale = () => {
        setReadyForSale(null);
        setStartSale(true);
        setItems([]);
    }

    return (
        <div style={{display: items.length === 0 ? 'none' : 'flex'}} className="h-[1610px] w-full bg-black/50">
            <div className="h-screen w-full flex justify-center items-center flex-col">
                <div className="flex w-72 justify-between bg-gray-800 p-4 rounded-t">
                    <a onClick={() => {cancel()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Cancel</a>
                    <a onClick={() => {confirmSale()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Confirm</a>
                </div>
                <div className="flex flex-col gap-2 bg-gray-800 pt-4 pb-4 pl-12 pr-12 max-h-[70%] max-w-72 overflow-y-auto overflow-x-hidden">
                    {
                        items.map((item, index) => (
                            <div key={index} className="border-white border-[1px] relative min-w-48 max-w-48 max-h-48 min-h-48 rounded">
                                <img src={item.image} alt={item.name} className="" />
                                <div className="absolute flex-col flex bottom-0 w-full bg-black/50 rounded text-white gap-2 p-2">
                                <h1 className="text-xl text-ellipsis">{item.name}</h1>
                                <div className="flex gap-8 items-center justify-center pl-2 pr-2">
                                    <p className="text-zinc-400 grow">Recieve: ${item.afterFeesPrice}</p>
                                    <p className="text-zinc-400 grow">List: ${item.currentPrice}</p>
                                </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="flex w-72 justify-between bg-gray-800 p-4 rounded-b">
                    <p className="text-zinc-400">Recieve: ${(items.reduce((total,current) => total + current.afterFeesPrice,0)).toFixed(2)}</p>
                    <p className="text-zinc-400">List: ${(items.reduce((total,current) => total + current.currentPrice,0)).toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog