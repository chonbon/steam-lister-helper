import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetRootContainer } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { Storage } from "@plasmohq/storage"
import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";

export const config: PlasmoCSConfig = {
    matches: ["https://steamcommunity.com/id/*/inventory*"],
    all_frames: true,
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector("div.tabitems_ctn");

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
}

const Page = () => {
  const [items, setItems] = useState([]);
  const storage = new Storage();

  storage.watch({
    "newItem": (c) => {
      if (c.newValue) {
        if (items.filter((i) => i.id === c.newValue.id).length === 0) setItems([...items, c.newValue]);
        storage.remove("newItem");
      }
    }
  });

  // remove an item from the list
  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems([...newItems]);
  }

  return (
    <div className="max-w-[926px] w-full min-h-52 bg-black/25 rounded">
      <div className="flex p-2 h-full w-full gap-2 overflow-x-auto overflow-y-hidden">
        {items.map((item, index) => (
          <div key={index} className="border-white border-[1px] relative min-w-48 max-w-48 rounded">
            <FaRegTrashCan className="absolute right-0 top-0 text-white font-bold bg-black/50 rounded w-10 h-10 p-2 hover:text-red-600 cursor-pointer" onClick={() => {removeItem(index)}} />
            <img src={item.image} alt={item.name} className="" />
            <div className="absolute flex-col flex bottom-0 w-full bg-black/50 rounded text-white gap-2 p-2">
              <h1 className="text-xl text-ellipsis">{item.name}</h1>
              <input className="bg-gray-800 p-1 rounded-lg" defaultValue={item.price} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page