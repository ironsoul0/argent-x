import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
  AddTransactionResponse,
  Args,
  Calldata,
  CompiledContract,
  Contract,
  KeyPair,
  compileCalldata,
  defaultProvider,
  ec,
  encode,
  hash,
  json,
  number,
  stark,
} from "starknet"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  signer: KeyPair
  deployTransaction?: string
  contract: Contract

  constructor(address: string, signer: KeyPair, deployTransaction?: string) {
    this.address = address
    this.signer = signer
    this.deployTransaction = deployTransaction
    this.contract = new Contract(ArgentCompiledContractJson.abi, address)

    if (deployTransaction) {
      localStorage.setItem(`walletTx:${address}`, deployTransaction)
    } else if (localStorage.getItem(`walletTx:${address}`)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.deployTransaction = localStorage.getItem(`walletTx:${address}`)!
    }
  }

  public completeDeployTx(): void {
    localStorage.removeItem(`walletTx:${this.address}`)
    this.deployTransaction = undefined
  }

  public async getCurrentNonce(): Promise<string> {
    const { nonce } = await this.contract.call("get_nonce")
    return nonce.toString()
  }

  public async invoke(
    address: string,
    method: BigNumberish,
    args?: Args | Calldata,
  ): Promise<AddTransactionResponse> {
    let methodHex = ""
    try {
      if (typeof method === "string" && !number.isHex(method))
        throw Error("only hex strings allowed")
      methodHex = BigNumber.from(method).toHexString()
    } catch {}

    const selector = methodHex || stark.getSelectorFromName(method as string)
    const calldata = Array.isArray(args) ? args : compileCalldata(args || {})
    const nonce = await this.getCurrentNonce()
    const messageHash = encode.addHexPrefix(
      hash.hashMessage(this.address, address, selector, calldata, nonce),
    )
    const { r, s } = ec.sign(this.signer, messageHash)

    return this.contract.invoke(
      "execute",
      {
        to: address,
        selector,
        calldata,
        nonce,
      },
      [r, s],
    )
  }

  public static async fromDeploy(
    seedOrKeyPair: string | KeyPair,
    l1Address = "0",
    overwriteSeed?: string,
  ): Promise<Wallet> {
    const starkKeyPair =
      typeof seedOrKeyPair === "string"
        ? ec.getKeyPair(seedOrKeyPair)
        : seedOrKeyPair
    const starkPub = ec.getStarkKey(starkKeyPair)

    const seed = overwriteSeed ?? ec.getStarkKey(ec.genKeyPair())

    const deployTransaction = await defaultProvider.deployContract(
      ArgentCompiledContract,
      compileCalldata({
        signer: starkPub,
        guardian: "0",
        L1_address: stark.makeAddress(l1Address),
      }),
      seed,
    )

    if (deployTransaction.code !== "TRANSACTION_RECEIVED") {
      throw new Error("Deploy transaction failed")
    }

    return new Wallet(
      deployTransaction.address!,
      starkKeyPair,
      deployTransaction.transaction_hash,
    )
  }
}
