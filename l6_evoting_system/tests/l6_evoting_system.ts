import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { L6EvotingSystem } from "../target/types/l6_evoting_system";

describe("l6_evoting_system", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace
        .L6EvotingSystem as Program<L6EvotingSystem>;

    it("Is initialized!", async () => {
        // Add your test here.
        const tx = await program.methods.initialize().rpc();
        console.log("Your transaction signature", tx);
    });
});
