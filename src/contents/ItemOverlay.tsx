import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { useStorage } from "@plasmohq/storage/hook"
import { FaCheck } from "react-icons/fa6";
import { useEffect } from "react";
import { createRoot} from "react-dom/client";
import React from "react";

export const config: PlasmoCSConfig = {
    matches: ["https://steamcommunity.com/id/*/inventory*"],
    all_frames: true,
}

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
}

const Overlay = () => {
    const [newItem, setNewItem] = useStorage('newItem');
    const [removedItem, setRemovedItem] = useStorage('removedItem');

    // listen to new items and apply overlay
    useEffect(() => {
        if (newItem) {
            addOverlay(newItem);
        }

        setNewItem(null);
    }, [newItem]);

    // listen to removed items and remove overlay
    useEffect(() => {
        if (removedItem) {
            removeOverlay(removedItem);
        }

        setRemovedItem(null);
    }, [removedItem]);

    // remove overlays as they are removed from the array
    const removeOverlay = async (item: any) => {
        let itemInPage = document.getElementById(item.id);
        let root = createRoot(itemInPage);

        root.render(
            <React.StrictMode>
                <img src={item.image} />
                <a href={`#${item.id}`} className="inventory_item_link"></a>
            </React.StrictMode>
        );
    }

    const addOverlay = async (item: any) => {
        let itemInPage = document.getElementById(item.id);
        let root = createRoot(itemInPage);

        root.render(
            <React.StrictMode>
                <img src={item.image} />
                <a href={`#${item.id}`} className="inventory_item_link"></a>
                <FaCheck style={{position: 'absolute', color:'white', fontWeight:'bold', backgroundColor:'rgb(0 0 0 / 0.5)', borderRadius:'0.25rem', width:'1.5rem', height:'1.5rem', padding: '0.5rem', top: '0', right: '0'}}/>
            </React.StrictMode>
        );
    }

    return (
        <>
        </>
    )
}

export default Overlay