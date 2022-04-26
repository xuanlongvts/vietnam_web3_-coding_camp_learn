use anchor_lang::prelude::*;

#[account]
pub struct Candidate {
    pub mint: Pubkey, // 32 bytes
    pub amount: u64,  // 8 bytes usign
    pub start_date: i64,
    pub end_date: i64,
}

impl Candidate {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 8;
}
