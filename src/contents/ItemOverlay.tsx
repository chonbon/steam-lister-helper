import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { Storage } from "@plasmohq/storage"
import { FaCheck } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

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
    const [items, setItems] = useState([]);
    const storage = new Storage();

    // watch for new items
    storage.watch({
        "items": (c) => {
          if (c.newValue) {
            setItems([...c.newValue])
          }
        },
        "removedItem": (c) => {
            if (c.newValue) {
                removeOverlay(c.newValue);
            }
        }
    });

    // remove overlays as they are removed from the array
    const removeOverlay = (item: any) => {
        let itemInPage = document.getElementById(item.id);
        let root = createRoot(itemInPage);
        root.render(
            <>
                <img src={item.image} />
                <a href={`#${item.id}`} className="inventory_item_link"></a>
            </>
        );
    }

    // update overlays as items changes
    useEffect(() => {
        for (let item of items) {
            let itemInPage = document.getElementById(item.id);
            let root = createRoot(itemInPage);
            root.render(
                <>
                    <img src={item.image} />
                    <a href={`#${item.id}`} className="inventory_item_link"></a>
                    <FaCheck style={{position: 'absolute', color:'white', fontWeight:'bold', backgroundColor:'rgb(0 0 0 / 0.5)', borderRadius:'0.25rem', width:'1.5rem', height:'1.5rem', padding: '0.5rem', top: '0', right: '0'}}/>
                </>
            );
        }
    },[items]);

    return (
        <>
        </>
    )
}

export default Overlay