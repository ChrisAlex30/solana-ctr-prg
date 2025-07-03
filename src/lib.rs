use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    entrypoint,
    program_error::ProgramError,
};

#[derive(BorshDeserialize, BorshSerialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let acc = next_account_info(account_info_iter)?;

    let mut counter_data = Counter::try_from_slice(&acc.data.borrow())?;

    match InstructionType::try_from_slice(instruction_data)? {
        InstructionType::Increment(val) => {
            msg!("Executing Increment by {}", val);
            counter_data.count = counter_data.count
                .checked_add(val)
                .ok_or(ProgramError::InvalidInstructionData)?;
        }
        InstructionType::Decrement(val) => {
            msg!("Executing Decrement by {}", val);
            counter_data.count = counter_data.count
                .checked_sub(val)
                .ok_or(ProgramError::InvalidInstructionData)?;
        }
    }

    counter_data.serialize(&mut *acc.data.borrow_mut())?;

    msg!("Updated Count: {}", counter_data.count);

    Ok(())
}
