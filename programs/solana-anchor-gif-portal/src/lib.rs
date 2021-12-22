use anchor_lang::prelude::*;

// The Program ID that has Information for Solana on how to load and execute the Program
// The Program ID also indicates the Solana Runtime all the Accounts created by the Program itself
declare_id!("8HDmM8Tr2krtoD25JNrYFv2BogQJ9aK2Q3k9tJnr1TW7");

// Start a Macro for the Program which can be fetched the Front End via a Fetch Request
// Macros attach Code to the Module - like Inheriting a Class
#[program]
// Start a Module which defines a Collection of Functions and Variables - like a Class
pub mod solana_anchor_gif_portal {
    use super::*;
    // Start a Function which takes a Context and outputs a ProgramResult
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        // Get a Reference to the Account
        // `&mut` to get a mutable Reference to `base_account` - this allows to make Changes to `base_account`
        // Without a mutable Reference the Program is working with a local Copy of `base_account`
        let base_account = &mut ctx.accounts.base_account;
        // Initialize total_gifs - Solana Programs are stateless, so they do not hold Data permanently
        // To store and write Data Programs interact with Accounts
        // Accounts are basically Programs that other Programs can read and write to
        base_account.total_gifs = 0;
        // Returning a Result Type
        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
        // Get a Reference to the Account from `base_account` which was passed in to the Function via `Context<AddGif>`
        let base_account = &mut ctx.accounts.base_account;
        // Get a Reference to the User from `user` which was passed in to the Function via `Context<AddGif>`
        let user = &mut ctx.accounts.user;
        // Building a Struct
        let item = ItemStruct {
            gif_link: gif_link.to_string(),
            user_address: *user.to_account_info().key,
        };
        // Adding the Struct to the Vector `gif_list`
        base_account.gif_list.push(item);
        // Increment the Counter `total_gifs`
        base_account.total_gifs += 1;
        Ok(())
    }
}

// Start a Macro for the Program which specifics different Account Constraints
#[derive(Accounts)]
// Attaching certain Variables to the Context of Function `StartStuffOff`
// Specifying how to initialize the Account and what to hold in the Context of Function `StartStuffOff`
pub struct StartStuffOff<'info> {
    // Initializing BaseAccount
    // `init` creates a new Account owned by our current Program
    // `payer = user` defines that the User calling the Function is paying for the Account to be created
    // `space = 9000` allocates 9000 Bytes of Space for the Account - The more Logic is added to the Program, the more Space it will take up
    // Users will pay a Rent (Space) on their Accounts, if they do not pay Rent, validators will clear their Account
    #[account(init, payer = user, space = 9000)]
    // Getting `base_account` from the Context `StartStuffOff` by doing `Context<StartStuffOff>`
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    // Data passing into the Program that proves to the Program that the User calling this Program actually owns their Wallet Account
    pub user: Signer<'info>,
    // Reference to the SystemProgram - SystemProgram is the Program that runs Solana
    // It is responsible to create Accounts on Solana and it is deployed by the creators of Solana
    pub system_program: Program <'info, System>,
}

// Specify what is going to be stored on this Context of Function `AddGif`
#[derive(Accounts)]
pub struct AddGif<'info> {
    // Create a Context named `AddGif` that has Access to a mutable Reference to `base_account`
    // A mutable Reference allows to change the Value of `total_gifs` stored on BaseAccount
    // Without a mutable Reference the changed data will only reflect within the Function but it would not change on the Account
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    // Signer who calls the Function `AddGif`
    #[account(mut)]
    pub user: Signer<'info>,
}

// Define how to serialize/deserialize the Struct
// An Account is basically a File:
// - This File will be serialized into Binary Format before it will be stored
// - When Retrieving this File it has to be before deserialized
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
// Create a custom Struct to work with
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address: Pubkey,
}

// Specify what is going to be stored on this Account, so that a suitable Account can be created
// The Account BaseAccount will hold an Integer named total_gifs
#[account]
pub struct BaseAccount {
    // Attach a Counter of Integer to the Account
    pub total_gifs: u64,
    // Attach a Vector of Type ItemStruct to the Account
    pub gif_list: Vec<ItemStruct>,
}