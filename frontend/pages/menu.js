import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { mintNFTAddress, NFTNameCardsAddress } from "../../contracts";
import mintNFT from "../contracts/mintNFT.json";
import NFTNameCards from "../contracts/NFTNameCards.json";
import { useRouter } from 'next/router'


export default function Menu() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(false);
  const [typeBalance, setTypeBalance] = useState(0);
  const [web3TypeBalance, setWeb3TypeBalance] = useState(0);
  const [nftOwner, setNftOwner] = useState(false);
  const [items, setItems] = useState([]);

  const astarId = "0x250";
  const shibuyaId = "0x51";
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const router = useRouter()

//　サイトアクセス時のデータ取得
useEffect(() => {

  const account = JSON.parse(sessionStorage.getItem('account'));
  if(account){setAccount(account)};
  console.log(`setAccount: ${account}`);

  const chainId = JSON.parse(sessionStorage.getItem('chainId'));
  if(chainId){setChainId(chainId)};
  console.log(`setChainId: ${chainId}`);

  const typeBalance = JSON.parse(sessionStorage.getItem('typeBalance'));
  if(typeBalance){setTypeBalance(typeBalance)};
  console.log(`setTypeBalance: ${typeBalance}`);

  const web3TypeBalance = JSON.parse(sessionStorage.getItem('web3TypeBalance'));
  if(web3TypeBalance){setWeb3TypeBalance(web3TypeBalance)};
  console.log(`setWeb3TypeBalance: ${web3TypeBalance}`);

  const nftOwner = JSON.parse(sessionStorage.getItem('nftOwner'));
  if(nftOwner){setNftOwner(nftOwner)};
  console.log(`setNftOwner: ${nftOwner}`);

  const items = JSON.parse(sessionStorage.getItem('items'));
  if(items){setItems(items)};
  console.log(`setItems: ${items}`);

}, []);



// 条件に応じたNFTをmint
const mintEachNFT = async () => {

  const { ethereum } = window;
  if (ethereum) {
    const chain = await ethereum.request({
      method: "eth_chainId",
    });
    console.log(`chain: ${chain}`);

    if (chain != shibuyaId) {
      alert("\"Shibuya Testnet\" に接続してください");
      setChainId(false);
      return;
    } else {
      setChainId(true);

      const provider = new ethers.providers.JsonRpcProvider("https://evm.shibuya.astar.network");
      const { ethereum } = window;
      const wallet = new ethers.providers.Web3Provider(ethereum);
      const signer = wallet.getSigner();
      const mintNFTContract = new ethers.Contract(
        mintNFTAddress,
        mintNFT.abi,
        signer
      );
      console.log(`typeBalance: ${typeBalance}`);
      console.log(`web3TypeBalance: ${web3TypeBalance}`);
      console.log(`account: ${account}`);
     // mintは一回限りとしたい
      if (typeBalance+web3TypeBalance >= 1 && typeBalance+web3TypeBalance < 3) {
        mintNFTContract.nftMint(account, "ipfs://bafybeidi3n6kjl2br6azoutbz2bc3zdoxmr2enbdfpqslouck3tmqyndpu/beginner.json");
        alert("beginner lank!!")
      } else if (typeBalance+web3TypeBalance>= 3 && typeBalance+web3TypeBalance < 5) {
        mintNFTContract.nftMint(account, "ipfs://bafybeidi3n6kjl2br6azoutbz2bc3zdoxmr2enbdfpqslouck3tmqyndpu/trophy_bronze.json");
        alert("bronze lank!!")
      } else if (typeBalance+web3TypeBalance >= 5 && typeBalance+web3TypeBalance < 7) {
        mintNFTContract.nftMint(account, "ipfs://bafybeidi3n6kjl2br6azoutbz2bc3zdoxmr2enbdfpqslouck3tmqyndpu/trophy_silver.json");
        alert("silver lank!!")
      } else if (typeBalance+web3TypeBalance >= 7 && typeBalance+web3TypeBalance < 9) {
        mintNFTContract.nftMint(account, "ipfs://bafybeidi3n6kjl2br6azoutbz2bc3zdoxmr2enbdfpqslouck3tmqyndpu/trophy_gold.json");
        alert("gold lank!!")
      } else if (web3TypeBalance >= 9) {
        mintNFTContract.nftMint(account, "ipfs://bafybeidi3n6kjl2br6azoutbz2bc3zdoxmr2enbdfpqslouck3tmqyndpu/trophy_golden-ticket.json");
        alert("web3 dept complete!!")
      } else {
        alert("NFT名刺を所有していません！");
      }
    }
  }
};
  


  // ページ表示
  return (
    <div className={"flex flex-col items-center justify-center bg-slate-100 text-blue-900 min-h-screen"}>
      <Head>
        <title>Token DApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h2 className={"text-6xl font-bold my-12 mt-8"}>
        Menu
      </h2>
      <div>
        <p className="flex flex-col justify-center items-center mx-2 mb-5 font-bold text-2xl gap-y-3">名刺を集めてNFTをGetしよう！</p>
        <p>・ 名刺 1 種 → ビギナー</p>
        <p>・ 名刺 3 種 → ブロンズ</p>
        <p>・ 名刺 5 種 → シルバー</p>
        <p>・ 名刺 7 種 → ゴールド</p>
        <p>・ Web3部 コンプリート（全 9 種） → ? ? ?</p>
      </div>
      <div className={"flex items-center justify-center mt-10 mb-10"}>
        <button
          className={
            "flex items-center justify-center bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded hover:border-transparent hover:text-white hover:bg-blue-500 hover:cursor-pointer"
          }
          onClick={mintEachNFT}
        >
          トロフィーをGET!
        </button>
      </div>

      <div className={"flex mt-1 flex flex-col items-center justify-center"}>
        {account === "" ? (
        <div></div>

        ) : chainId ? (
          <div>

            {nftOwner ? (
              <>   
            <span className="flex flex-col items-center font-semibold">
              ＜獲得済NFT一覧＞
            </span>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-center px-8 py-2 mb-1">
                    <div className="flex flex-col flex-row max-w-xl md:flex-row md:max-w-xl rounded-lg bg-white shadow-lg">
                      <img
                        className=" w-full h-24 md:h-auto object-contain md:w-32 rounded-t-lg md:rounded-none md:rounded-l-lg mt-2"
                        src={item.imageURI}
                        alt=""
                      />
                      <div className="p-2 flex flex-col justify-start">
                        <h5 className="text-gray-900 text-xl font-medium">
                          {item.name}
                        </h5>
                        {/* <p className="text-gray-700 text-base mb-4">
                          {item.description}
                        </p> */}
                        {/* <p className="text-gray-600 text-xs">
                          所有NFT# {item.tokenId.toNumber()}
                        </p> */}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3">
            <div>"Shibuya Testnet"に接続してください</div>
          </div>
        )}
      </div>

      <div className={"flex items-center justify-center mt-10 mb-10"}>
        <button
          className={
            "flex items-center justify-center bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded hover:border-transparent hover:text-white hover:bg-blue-500 hover:cursor-pointer"
          }
          onClick={() => router.push('/')}
        >
          戻る
        </button>
      </div>

    </div>
  );
}