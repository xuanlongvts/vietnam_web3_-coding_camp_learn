import {
    Program,
    web3,
    utils,
    BN,
    Spl,
    AnchorProvider,
    workspace,
    setProvider,
} from "@project-serum/anchor";

import { L6EvotingSystem } from "../target/types/l6_evoting_system";
import { initializeMint, initializeAccount } from "./init";

describe("l6_evoting_system", async () => {
    // Configure the client to use the local cluster.
    const provider = AnchorProvider.env();
    setProvider(provider);

    // Program
    const program = workspace.L6EvotingSystem as Program<L6EvotingSystem>;
    const splProgram = Spl.token();

    // Context
    const candidate = new web3.Keypair();
    let treasurer: web3.PublicKey;

    const mint = new web3.Keypair();
    let candidateTokenAccount: web3.PublicKey;

    let walletTokenAccount: web3.PublicKey;
    let ballot: web3.PublicKey;

    before(async () => {
        await initializeMint(9, mint, provider);
        const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
            [Buffer.from("treasurer"), candidate.publicKey.toBuffer()],
            program.programId
        );
        treasurer = treasurerPublicKey;

        const [ballotPublicKey] = await web3.PublicKey.findProgramAddress(
            [
                Buffer.from("ballot"),
                candidate.publicKey.toBuffer(),
                provider.wallet.publicKey.toBuffer(),
            ],
            program.programId
        );
        ballot = ballotPublicKey;

        // Derive token account
        walletTokenAccount = await utils.token.associatedAddress({
            mint: mint.publicKey,
            owner: provider.wallet.publicKey,
        });

        candidateTokenAccount = await utils.token.associatedAddress({
            mint: mint.publicKey,
            owner: treasurerPublicKey,
        });

        // Create Token account + Mint to token
        await initializeAccount(
            walletTokenAccount,
            mint.publicKey,
            provider.wallet.publicKey,
            provider
        );

        await splProgram.methods
            .mintTo(new BN(1_000_000_000_000))
            .accounts({
                mint: mint.publicKey,
                to: walletTokenAccount,
                authority: provider.wallet.publicKey,
            })
            .rpc();
    });

    it("Initialize candidate!", async () => {
        const now = Math.floor(new Date().getTime() / 1000);
        const startTime = new BN(now);
        const endTime = new BN(now + 7);

        await program.methods
            .initialize(startTime, endTime)
            .accounts({
                authority: provider.wallet.publicKey,
                candidate: candidate.publicKey,
                treasurer,
                mint: mint.publicKey,
                candidateTokenAccount,
                // system
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([candidate])
            .rpc();
    });

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    it("Vote!", async () => {
        await program.methods
            .vote(new BN(1))
            .accounts({
                authority: provider.wallet.publicKey,
                candidate: candidate.publicKey,
                treasurer,
                mint: mint.publicKey,
                candidateTokenAccount,
                ballot,
                voterTokenAccount: walletTokenAccount,

                // system
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();
    });

    it("Close ---> !", async () => {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        await program.methods
            .close()
            .accounts({
                authority: provider.wallet.publicKey,
                candidate: candidate.publicKey,
                treasurer,
                mint: mint.publicKey,
                candidateTokenAccount,
                ballot,
                voterTokenAccount: walletTokenAccount,

                // system
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();
    });
});
