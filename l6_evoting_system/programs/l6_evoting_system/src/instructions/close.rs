use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

use crate::errors::errors::ErrorCode;
use crate::schema::*;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one = mint)]
    pub candidate: Account<'info, Candidate>,
    pub mint: Box<Account<'info, token::Mint>>,

	#[account(seeds = [b"treasurer", &candidate.key().to_bytes()], bump)]
	/// CHECK: Just a pure account
	pub treasurer: AccountInfo<'info>,

    #[account(mut, associated_token::mint = mint, associated_token::authority = authority)]
    pub candidate_token_account: Account<'info, token::TokenAccount>,

	#[account(mut, close = authority, seeds = [b"ballot".as_ref(), &candidate.key().as_ref(), &authority.key().as_ref()], bump)]
	pub ballot: Account<'info, Ballot>,

	#[account(mut, associated_token::mint = mint, associated_token::authority = authority)]
	pub voter_token_account: Account<'info, token::TokenAccount>,

	// System Program Address
	pub system_program: Program<'info, System>,
	pub token_program: Program<'info, token::Token>,
	pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
	pub rent: Sysvar<'info, Rent>
}

pub fn exec(ctx: Context<Close>) -> Result<()> {
	let candidate = &mut ctx.accounts.candidate;
	let ballot = &mut ctx.accounts.ballot;

	let now = Clock::get().unwrap().unix_timestamp;
	if now < candidate.end_date {
		return err!(ErrorCode::EndedCandidate); // still vote campain, so cann't close 
	}

	let seeds: &[&[&[u8]]] = &[&[
		"treasurer".as_ref(),
		&candidate.key().to_bytes(),
		&[*ctx.bumps.get("treasurer").unwrap()],
	]];

	// Program sign on Contract 
	let transfer_ctx = CpiContext::new_with_signer(
		ctx.accounts.token_program.to_account_info(),
		token::Transfer {
			from: ctx.accounts.voter_token_account.to_account_info(),
			to: ctx.accounts.voter_token_account.to_account_info(),
			authority: ctx.accounts.authority.to_account_info(),
		},
		seeds
	);
	token::transfer(transfer_ctx, ballot.amount)?;

	ballot.amount = 0;

	Ok(())
}