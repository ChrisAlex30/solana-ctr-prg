import * as borsh from 'borsh';
import {expect,test} from 'bun:test';
import {Connection,Keypair,LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction} from '@solana/web3.js'
import {COUNTER_SIZE,schema} from './types'

let adminAcc=Keypair.generate()
let dataAcc=Keypair.generate()

const PROGRAM_ID=new PublicKey('HEqibKRDz2pRrVDi734gAQ9Kuy3eV1P6QsCB3R3uZ3db');
const conn=new Connection('http://127.0.0.1:8899');

test("Acc is initialized",async()=>{
    const txn=await conn.requestAirdrop(adminAcc.publicKey,1*1000_000_000);
    await conn.confirmTransaction(txn);

    const lamps=await conn.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const ix=SystemProgram.createAccount({
        fromPubkey:adminAcc.publicKey,
        lamports:lamps,
        space:COUNTER_SIZE,
        programId:PROGRAM_ID,
        newAccountPubkey:dataAcc.publicKey
    })

    const createAccTxn=new Transaction();
    createAccTxn.add(ix);

    const sig=await conn.sendTransaction(createAccTxn,[adminAcc,dataAcc]);

    await conn.confirmTransaction(sig);
    console.log(dataAcc.publicKey.toBase58());

    const dataAccInfo=await conn.getAccountInfo(dataAcc.publicKey);
    console.log(dataAccInfo?.data);
    //const counter=borsh.deserialize(schema,dataAccInfo?.data);
    
    

})