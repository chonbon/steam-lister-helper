import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { useStorage } from "@plasmohq/storage/hook"
import { useEffect, useState } from "react";
import { FaRegTrashCan, FaArrowsRotate, FaCheck, FaExclamation, FaShieldVirus } from "react-icons/fa6";

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
  const [newItem, setNewItem] = useStorage('newItem');
  const [removedItem, setRemovedItem] = useStorage('removedItem');
  const [readyForSale, setReadyForSale] = useStorage('readyForSale');
  const [startSale, setStartSale] = useStorage('startSale');

  const totalPrices = items.reduce((total, item) => total + item.afterFeesPrice, 0);

  // grab session id
  useEffect(() => {
    try {
      let cookies = document.cookie;
      cookies = cookies.split("sessionid=")[1];
      cookies = cookies.split(";")[0];

      setSessionid(cookies);
      console.log('Steam Session ID: ', cookies)
    } catch (err) {
      console.error('Failed to grab session id');
    }
  },[]);

  // monitor new items
  useEffect(() => {
    if (newItem) {
      if (items.filter((i) => i.id === newItem.id).length === 0) {
          const tempItem = newItem;
          tempItem.afterFeesPrice = calculatePriceAfterFees(tempItem.currentPrice);
          tempItem.isListing = false;
          tempItem.isListed = false;
          tempItem.listingError = false;
          setItems([...items, tempItem]);
      }
      setNewItem(null);
    }
  },[newItem]);

  // monitor confirmation dialog
  useEffect(() => {
    if (startSale && !isListing) {
        setIsListing(true);
        let tempItems = [...items];
        tempItems = tempItems.map((item) => {item.isListing = true; return item;})
        setItems(tempItems);
        listItems();
    }
    setStartSale(false);
  }, [startSale])

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
    setRemovedItem(newItems[index]);
    newItems.splice(index, 1);
    setItems(newItems);
  }

  // removes all items from the list
  const clear = async () => {
    if (isListing) return;
    for (const item of items) {
      setRemovedItem(item);
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
    setItems(newItems);
  }

  // open the dialog to confirm the sale
  const openDialog = () => {
    if (items.length === 0) return;
    if (isListing) return;

    setReadyForSale(items);
  }

  // iterate list and send post request
  const listItems = async () => {
    const localItems = [...items];
    for (const item of localItems) {
      console.log('Listing Item: ', item.name);

      const formData = new FormData();
      formData.append("sessionid", sessionid)
      formData.append("appid", item.id.split('_')[0]);
      formData.append("contextid", item.id.split('_')[1]);
      formData.append("assetid", item.id.split('_')[2]);
      formData.append("amount", "1");
      formData.append("price", (item.afterFeesPrice * 100).toFixed(0));

      console.log('Listing Data: ', formData);

      await fetch("https://steamcommunity.com/market/sellitem/", {
        method: "POST",
        body: formData,
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'include',
        referrer: window.location.href,
        referrerPolicy: 'no-referrer-when-downgrade'
      }).then(async (res) => {
        const result = await res.json();

        console.log('Listing Result: ', result)

        if (result.success) {
          if (result.requires_confirmation === 1) {
            item.listingError = true;
          }
          item.isListed = true;
        } else {
          item.listingError = true;
        }

        return;
        
      }).catch((err) => {
        item.listingError = true;

        console.error('LISTING ERROR '+ err);

        return;
      });

      item.isListing = false;
      setItems([...localItems]);
      await sleep(750);
    }

    setIsListing(false);
  }
  
  // sleep function
  const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div className="max-w-[926px] w-full min-h-52 bg-black/25 rounded-t">
      <div className="flex p-2 justify-between">
        <h1 className="text-white">Total: ${totalPrices.toFixed(2)} | {items.length} selected</h1>
        <div className="flex gap-2">
          <a onClick={() => {clear()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Clear</a>
          <a onClick={() => {openDialog()}} style={{cursor:items.length > 0 ?'pointer':'not-allowed'}} className="bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Sell All</a>
        </div>
      </div>
      <div className="flex p-2 max-h-56 w-full gap-2 overflow-x-auto overflow-y-hidden">
        {items.map((item, index) => (
          <div key={item.id} className="border-white border-[1px] relative min-w-48 max-w-48 max-h-48 min-h-48 rounded">
            <FaRegTrashCan className="absolute right-0 top-0 text-white font-bold bg-black/50 rounded w-10 h-10 p-2 hover:text-red-600 cursor-pointer" onClick={() => {removeItem(index)}} />
            {item.isListing ? 
              <div className="absolute left-0 top-0 bg-black/50 rounded"><FaArrowsRotate className=" text-white font-bold w-10 h-10 p-2 animate-spin" /></div>
              : item.isListed && !item.listingError ?
              <FaCheck className="absolute left-0 top-0 text-green-600 font-bold bg-black/50 rounded w-10 h-10 p-2" />
              : item.listingError && item.isListed ?
              <FaShieldVirus className="absolute left-0 top-0 text-yellow-600 font-bold bg-black/50 rounded w-10 h-10 p-2" />
              :
              <FaExclamation className="absolute left-0 top-0 text-red-600 font-bold bg-black/50 rounded w-10 h-10 p-2" />
              
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