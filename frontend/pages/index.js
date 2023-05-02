import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { mintNFTAddress, tokenBankAddress, NFTNameCardsAddress, Web3NFTNameCardsAddress } from "../../contracts";
import mintNFT from "../contracts/mintNFT.json";
import TokenBank from "../contracts/TokenBank.json";
import NFTNameCards from "../contracts/NFTNameCards.json";
import { useRouter } from "next/router";
import * as Loader from "react-loader-spinner";


export default function Home() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(false);
  const [typeBalance, setTypeBalance] = useState(0);
  const [web3TypeBalance, setWeb3TypeBalance] = useState(0);
  const [nftOwner, setNftOwner] = useState(false);
  const [cards, setCards] = useState([]);
  const [items, setItems] = useState([]);
  const [inputData, setInputData] = useState({transferAddress: "",});

  const [ isLoading, setIsLoading ] = useState(false);
  const [ resData, setResData ] = useState(null);

  //const astarId = "0x250";
  const shibuyaId = "0x51"
  const zeroAddress = "0x0000000000000000000000000000000000000000";

//　サイトアクセス時のデータ取得
  useEffect(() => {
    checkMetaMaskInstalled();

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

    const cards = JSON.parse(sessionStorage.getItem('cards'));
    if(cards){setCards(cards)};
    console.log(`setCards: ${cards}`);

    const items = JSON.parse(sessionStorage.getItem('items'));
    if(items){setItems(items)};
    console.log(`setItems: ${items}`);

  }, []);


  // メタマスクインストールチェック
  const checkMetaMaskInstalled = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("MetaMaskをインストールしてください！");
    }
  };

  // メタマスク接続
  const connectMetamask = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const chain = await ethereum.request({
        method: "eth_chainId",
      });
      
      if (chain == shibuyaId) {
        setAccount(accounts[0]);
        setChainId(true);
        setIsLoading(true);

        console.log(`account: ${accounts[0]}`);
        console.log(`chainId: ${chain}`);

        checkNftCards(accounts[0]);
        checkNftShibuya(accounts[0]);

      } else {
        alert("\"Shibuya Testnet\" に接続してください");
        setChainId(false);
        console.log(`account: ${chain}`);
        return;
      }

      ethereum.on("accountsChanged", checkAccountChanged);
      ethereum.on("chainChanged", checkChainId);
    } catch (err) {
      console.log(err);
    }
  };

    // wallet接続（メタマスク以外）
    const connectWallet = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      if (zeroAddress != inputData.transferAddress) {
        try {
          setAccount(inputData.transferAddress);
          setChainId(true);
          console.log(`account: ${inputData.transferAddress}`);
  
          checkNftCards(inputData.transferAddress);
          checkNftShibuya(inputData.transferAddress);

        } catch (err) {
          console.log(err);
        }
      } else {
        alert("ゼロアドレス宛は指定できません")
      }
    };

  // 接続ネットワークチェック（ネットワーク切り替え時）
  const checkChainId = async () => {
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
      }
    }
  };

  
    // 接続ネットワークチェック（メニュー遷移時）
    const checkChainIdTestnet = async () => {
      const { ethereum } = window;
      //checkNftShibuya(account);

      // ブラウザストレージ保存
      sessionStorage.setItem('account', JSON.stringify(account));
      sessionStorage.setItem('chainId', JSON.stringify(chainId));
      sessionStorage.setItem('typeBalance', JSON.stringify(typeBalance));
      sessionStorage.setItem('web3TypeBalance', JSON.stringify(web3TypeBalance));
      sessionStorage.setItem('nftOwner', JSON.stringify(nftOwner));
      sessionStorage.setItem('cards', JSON.stringify(cards));
      sessionStorage.setItem('items', JSON.stringify(items));

      if (ethereum) {
        const chain = await ethereum.request({
          method: "eth_chainId",
        });
        console.log(`chain: ${chain}`);
  
        if (chain != shibuyaId) {
          alert("\"Shibuya Testnet\" に接続してください");
          return;
        } else {
          router.push('/menu')
        }
      }
    };

  const checkAccountChanged = () => {
    setAccount("");
    setNftOwner(false);
    setCards([]);
    setItems([]);
    setInputData({transferAddress: "",});
  };



  // 所有NFT名刺情報取得
  const checkNftCards = async (addr) => {
    const { ethereum } = window;
    const provider = new ethers.providers.JsonRpcProvider("https://evm.astar.network");
    //const provider = new ethers.providers.JsonRpcProvider("https://astar-mainnet.g.alchemy.com/v2/5orW7XuKiDWLHpMH7zV7sao4e7X3rSmS");
    let typeBalance = 0;
    let web3TypeBalance = 0;

    for (let i = 0; i < NFTNameCardsAddress.length; i++) {
      const NFTNameCardsContract = new ethers.Contract(
        NFTNameCardsAddress[i],
        NFTNameCards.abi,
        provider
      );
      const balance = await NFTNameCardsContract.balanceOf(addr);
      
      if(balance > 0) typeBalance ++;

      if (balance.toNumber() > 0) {
        setNftOwner(true);
        for (let j = 0; j < balance.toNumber(); j++) {
          const tokenId = await NFTNameCardsContract.tokenOfOwnerByIndex(addr, j);
          let tokenURI = await NFTNameCardsContract.tokenURI(tokenId);
          tokenURI = tokenURI.replace("ar://", "https://arweave.net/");
          const meta = await axios.get(tokenURI);
          const name = meta.data.name;
          const description = meta.data.description;
          const imageURI = meta.data.image.replace("ar://", "https://arweave.net/");
          const network = "Astar"
          const collection = "Common"
          const item = {
            tokenId,
            name,
            description,
            tokenURI,
            imageURI,
            network,
            collection,
          };
          setCards((cards) => [...cards, item]);
        }
      } else {
        ("");
      }  
    }
    setTypeBalance(typeBalance);
    console.log(`typeBalance(Astar): ${typeBalance}`);
    
    for (let i = 0; i < Web3NFTNameCardsAddress.length; i++) {
      const NFTNameCardsContract = new ethers.Contract(
        Web3NFTNameCardsAddress[i],
        NFTNameCards.abi,
        provider
      );
      const balance = await NFTNameCardsContract.balanceOf(addr);
      
      if(balance > 0) web3TypeBalance ++;

      if (balance.toNumber() > 0) {
        setNftOwner(true);
        for (let j = 0; j < balance.toNumber(); j++) {
          const tokenId = await NFTNameCardsContract.tokenOfOwnerByIndex(addr, j);
          let tokenURI = await NFTNameCardsContract.tokenURI(tokenId);
          tokenURI = tokenURI.replace("ar://", "https://arweave.net/");
          const meta = await axios.get(tokenURI);
          const name = meta.data.name;
          const description = meta.data.description;
          const imageURI = meta.data.image.replace("ar://", "https://arweave.net/");
          const network = "Astar"
          const collection = "web3 Dept"
          const item = {
            tokenId,
            name,
            description,
            tokenURI,
            imageURI,
            network,
            collection,
          };
          setCards((cards) => [...cards, item]);
        }
      } else {
        ("");
      }  
    }
    setWeb3TypeBalance(web3TypeBalance);
    console.log(`web3TypeBalance(Astar): ${web3TypeBalance}`);
    setIsLoading(false);
  };


  const checkNftShibuya = async (addr) => {
    const provider = new ethers.providers.JsonRpcProvider("https://evm.shibuya.astar.network");
    const mintNFTContract = new ethers.Contract(
      mintNFTAddress,
      mintNFT.abi,
      provider
    );
    const balance = await mintNFTContract.balanceOf(addr);
    console.log(`nftBalance(Shibuya): ${balance.toNumber()}`);
 
   if (balance.toNumber() > 0) {
     setNftOwner(true);
     for (let i = 0; i < balance.toNumber(); i++) {
       const tokenId = await mintNFTContract.tokenOfOwnerByIndex(addr, i);      
       let tokenURI = await mintNFTContract.tokenURI(tokenId);
       tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
       const meta = await axios.get(tokenURI);
       const name = meta.data.name;
       const description = meta.data.description;
       const imageURI = meta.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
       const network = "Shibuya"
 
       const item = {
         tokenId,
         name,
         description,
         tokenURI,
         imageURI,
         network,
       };
       setItems((items) => [...items, item]);
     }
   } else {
     ("");
   }
 };



  const handler = (e) => {
    setInputData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const router = useRouter()

  // ログアウト
  const logout = async () => {
    sessionStorage.clear();
    location.reload();
  };


  // ページ表示
  return (
    <div className={"flex flex-col items-center bg-slate-100 text-blue-900 min-h-screen"}>
      <Head>
        <title>Token DApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={"flex mt-1"}>
        {account === "" ? (
          <div className={"flex flex-col items-center justify-center"}>
            <h2 className={"text-6xl font-bold my-12 mt-8"}>
              ログイン
            </h2>
            <button
              className={
                "bg-transparent text-blue-700 font-semibold py-2 px-3 border border-blue-500 rounded hover:border-transparent hover:text-white hover:bg-blue-500 hover:cursor-pointer"
              }
              onClick={connectMetamask}
            >
              MetaMaskを接続（"Shibuya Testnet"）
            </button>

            <p className={"flex justify-center text-2xl font-bold my-8 mt-8"}>または</p>

            <form className="flex py-1 bg-white border border-gray-400">
                  <input
                    type="text"
                    className="flex mx-4 px-1 text-left border border-gray-400"
                    name="transferAddress"
                    placeholder={`ウォレットアドレスを入力`}
                    onChange={handler}
                    value={inputData.transferAddress}
                  />
                  <button
                    className="mr-4 bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
                    onClick={connectWallet}
                  >
                    submit
                  </button>
                </form>

          </div>
          
        ): isLoading ? (
          <div className={"flex flex-col items-center bg-slate-100 text-blue-900 min-h-screen"}>
            <p className={"flex justify-center text-2xl font-bold my-8 mt-8"}>
              ブロックチェーンからデータ取得中...
            </p>
            <Loader.MagnifyingGlass
              visible={true}
              height="150"
              width="150"
              ariaLabel="MagnifyingGlass-loading"
              wrapperStyle={{}}
              wrapperClass="MagnifyingGlass-wrapper"
              glassColor = '#c0efff'
              color = '#e15b64'
            />
          </div>

        ): chainId ? (
          <div className={"flex flex-col items-left justify-center"}>
            <h2 className={"text-6xl font-bold my-12 mt-8"}>
              ようこそ！
            </h2>
            <div className="px-2 py-2 mx-2 mb-10 bg-white border border-gray-400">
              <span className="flex flex-col items-left font-semibold">
                アドレス：{account}
              </span>
            </div>
            {nftOwner ? (
              <>
              <span className="flex flex-col items-center font-semibold">
                ＜保有名刺一覧＞
              </span>
                {cards.map((item, i) => (
                  <div key={i} className="flex justify-left pl-1 py-2 mb-1">
                    <div className="flex flex-col md:flex-row md:max-w-xl rounded-lg bg-white shadow-lg">

                        <img
                          className=" w-full h-48 md:h-auto object-cover md:w-48 rounded-t-lg md:rounded-none md:rounded-l-lg"
                          src={item.imageURI}
                          alt=""
                        />

                      <div className="p-6 flex flex-col justify-start">
                        <h5 className="text-gray-900 text-xl font-medium mb-2">
                          {item.name}
                        </h5>
                        <p className="text-gray-700 text-base mb-4">
                          {item.description}
                        </p>
                        {/* <p className="text-gray-600 text-xs">
                          所有NFT# {item.tokenId.toNumber()}
                        </p> */}
                        <p className="text-gray-600 text-xs">
                          Network : {item.network}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Collection : {item.collection}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
              </>
            ) : (
              <></>
            )}
            <div className={"flex items-center justify-center mt-10 mb-10"}>
                <button
                  className={
                    "flex items-center justify-center bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded hover:border-transparent hover:text-white hover:bg-blue-500 hover:cursor-pointer mr-5"
                  }
                  onClick={checkChainIdTestnet}
                >
                  メニュー
                </button>
                <button
                  className={
                    "flex items-center justify-center bg-transparent text-red-700 font-semibold py-2 px-4 border border-red-500 rounded hover:border-transparent hover:text-white hover:bg-red-500 hover:cursor-pointer ml-5"
                  }
                  onClick={logout}
                >
                  ログアウト
                </button>
            </div>
          </div>

        ) : (
          <div className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3">
            <div>"Shibuya Testnet" に接続してください</div>
          </div>
        )}
      </div>
    </div>
  );
}
