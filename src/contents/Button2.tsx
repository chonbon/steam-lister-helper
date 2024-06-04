import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import cssText from "data-text:~./popup/index.css"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
    matches: ["https://steamcommunity.com/id/*/inventory*"],
    all_frames: true,
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector("div#iteminfo0_item_market_actions > a");

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
}

const Button2 = () => {
    const storage = new Storage();

    const handleClick = async () => {
        const item = document.querySelector("div#iteminfo0");

        let marketItem = {
            name: '',
            image: '',
            id: '',
            price: 0,
        }

        marketItem.name = item.querySelector("h1.hover_item_name").textContent;
        marketItem.image = item.querySelector("img#iteminfo0_item_icon").getAttribute('src');
        marketItem.id = document.querySelector("div.item.activeInfo").getAttribute('id');

        let rawPriceString = item.querySelector("div.item_market_actions > div > div:nth-child(2)").textContent;
        rawPriceString = rawPriceString.split('Starting at: ')[1];
        rawPriceString = rawPriceString.split('Volume')[0];
        rawPriceString = rawPriceString.replace(/\D/g, '');
        let rawPrice = parseFloat(rawPriceString);
        rawPrice = rawPrice / 100;

        marketItem.price = rawPrice;

        console.log(marketItem);
        await storage.set('newItem', marketItem);
    }

    return (
        <a onClick={() => {handleClick()}} className="absolute left-20 top-[-29px] bg-[url(https://community.akamai.steamstatic.com/public/images/economy/btn_green_small.png)] bg-repeat-x bg-left-bottom text-white h-[24px] pl-2 pr-2 rounded-sm cursor-pointer hover:brightness-75">Queue Listing</a>
    )
}

export default Button2