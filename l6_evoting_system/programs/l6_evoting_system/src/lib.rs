declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod errors;
pub use errors::*;

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

#[program]
pub mod l6_evoting_system {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCandidate>, start_date: i64, end_date: i64) -> Result<()> {
        initialize_candidate::exec(ctx, start_date, end_date)
    }

    pub fn vote(ctx: Context<Vote>, amount: u64) -> Result<()> {
        vote::exec(ctx, amount)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        close::exec(ctx)
    }
}
