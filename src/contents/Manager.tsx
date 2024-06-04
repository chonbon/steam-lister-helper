import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetRootContainer } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { Storage } from "@plasmohq/storage"
import { useEffect, useState } from "react";
import { FaRegTrashCan, FaArrowsRotate, FaCheck, FaExclamation } from "react-icons/fa6";


// https://steamcommunity.com/market/sellitem/ POST
// FORM_DATA sessionid=1048812b715eea8140f222a8   &appid=431240   &contextid=2   &assetid=4818362741907987812   &amount=1   &price=1
//
//
//
//

export const config: PlasmoCSConfig = {
    matches: ["https://steamcommunity.com/id/*/inventory*"],
    all_frames: true,
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector("div.inventory_links");

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
}

const Page = () => {
  const [items, setItems] = useState([]);
  const [isListing, setIsListing] = useState(false);
  const [sessionid, setSessionid] = useState('');
  const storage = new Storage();

  const totalPrices = items.reduce((total, item) => total + item.afterFeesPrice, 0);

  // grab session id
  useEffect(() => {
    try {
      let cookies = document.cookie;
      cookies = cookies.split("sessionid=")[1];
      cookies = cookies.split(";")[0];

      setSessionid(cookies);
    } catch (err) {
      console.error('Failed to grab session id');
    }
  },[]);

  useEffect(() => {
    storage.setItem('items', items);

    console.log(items)
  },[items])

  // listen to newItem storage
  storage.watch({
    "newItem": (c) => {
      if (c.newValue) {
        if (items.filter((i) => i.id === c.newValue.id).length === 0) {
          const tempItem = c.newValue;
          tempItem.afterFeesPrice = calculatePriceAfterFees(tempItem.currentPrice);
          tempItem.isListing = false;
          tempItem.isListed = false;
          tempItem.listingError = false;
          setItems([...items, tempItem]);
        }
        storage.remove("newItem");
      }
    },
    "startSale": (c) => {
      if (c.newValue) {
        setIsListing(true);
        let tempItems = [...items];
        tempItems = tempItems.map((item) => {item.isListing = true; return item;})
        setItems([...tempItems]);
        listItems();
        storage.remove("startSale");
      }
    }
  });

  // calculate the price after fees for what the take home and listing price will be
  const calculatePriceAfterFees = (price: number) => {
    let V = Math.round((price/11.5)*1000) / 1000;
    V = Math.round(V * 100) / 100;
    let S = V < 0.01 ? price - 0.01 : price - V;
    let G = Math.round((price/23)*1000) / 1000;
    G = Math.round(G * 100) / 100;
    S = G < 0.01 ? S - 0.01 : S - G;

    S = Math.round(S * 100) / 100;
    return S;
  }

  // remove an item from the list
  const removeItem = (index: number) => {
    if (isListing) return;
    const newItems = [...items];
    storage.setItem('removedItem', newItems[index]);
    newItems.splice(index, 1);
    setItems([...newItems]);
  }

  const clear = async () => {
    if (isListing) return;
    for (const item of items) {
      storage.setItem('removedItem', item);
    }
    setItems([]);
  }

  // update price of an item
  const updatePrice = (index: number, price: number) => {
    if (isListing) return;
    let roundedPrice = Math.round(price * 100) / 100;
    if (roundedPrice < 0.03) return;

    const newItems = [...items];
    newItems[index].currentPrice = roundedPrice;
    newItems[index].afterFeesPrice = calculatePriceAfterFees(roundedPrice);
    setItems([...newItems]);
  }

  // open the dialog to confirm the sale
  const startSale = () => {
    if (items.length === 0) return;
    if (isListing) return;

    storage.setItem('readyForSale', items);
  }

  const listItems = async () => {
    const localItems = [...items];
    for (const item of localItems) {
      const formData = new FormData();
      formData.append("sessionid", sessionid)
      formData.append("appid", item.id.split('_')[0]);
      formData.append("contextid", item.id.split('_')[1]);
      formData.append("assetid", item.id.split('_')[2]);
      formData.append("amount", "1");
      formData.append("price", (item.afterFeesPrice * 100).toFixed(0));

      await fetch("https://steamcommunity.com/market/sellitem/", {
        method: "POST",
        body: formData
      }).then(async (res) => {
        const result = await res.json();

        if (result.success) {
          item.isListed = true;
        } else {
          item.listingError = true;
        }
        
      }).catch((err) => {
        item.listingError = true;
      });

      item.isListing = false;

      setItems([...localItems]);
      await sleep(750);

    }

    setIsListing(false);
  }
  
  const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div className="max-w-[926px] w-full min-h-52 bg-black/25 rounded-t">
      <div className="flex p-2 justify-between">
        <h1 className="text-white">Total: ${totalPrices.toFixed(2)} | {items.length} selected</h1>
        <div className="flex gap-2">
          <a onClick={() => {clear()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Clear</a>
          <a onClick={() => {startSale()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Sell All</a>
        </div>
      </div>
      <div className="flex p-2 max-h-56 w-full gap-2 overflow-x-auto overflow-y-hidden">
        {items.map((item, index) => (
          <div key={index} className="border-white border-[1px] relative min-w-48 max-w-48 max-h-48 min-h-48 rounded">
            <FaRegTrashCan className="absolute right-0 top-0 text-white font-bold bg-black/50 rounded w-10 h-10 p-2 hover:text-red-600 cursor-pointer" onClick={() => {removeItem(index)}} />
            {item.isListing ? 
              <div className="absolute left-0 top-0 bg-black/50 rounded"><FaArrowsRotate className=" text-white font-bold w-10 h-10 p-2 animate-spin" /></div>
              : item.isListed ?
              <FaCheck className="absolute left-0 top-0 text-green-600 font-bold bg-black/50 rounded w-10 h-10 p-2" />
              : item.listingError ?
              <FaExclamation className="absolute left-0 top-0 text-red-600 font-bold bg-black/50 rounded w-10 h-10 p-2" />
              : <></>
            }
            <img src={item.image} alt={item.name} className="" />
            <div className="absolute flex-col flex bottom-0 w-full bg-black/50 rounded text-white gap-2 p-2">
              <h1 className="text-xl text-ellipsis">{item.name}</h1>
              <div className="flex gap-8 items-center justify-center pl-2 pr-2">
                <p className="text-zinc-400 grow">${item.afterFeesPrice}</p>
                <input disabled={isListing} onChange={(e) => {updatePrice(index, parseFloat(e.target.value !== '' ? e.target.value : '0'))}} type="number" className="bg-gray-800 p-1 rounded-lg shrink min-w-0" defaultValue={item.currentPrice} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page