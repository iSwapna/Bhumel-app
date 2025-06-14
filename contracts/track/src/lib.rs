#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, String, Address, Error};

#[contract]
pub struct Certify;

#[contractimpl]
impl Certify {
    pub fn __constructor(
        env: Env,
        admin: Address,
    ) -> Result<(), Error> {
        admin.require_auth();
        env.events().publish((symbol_short!("crumb"),), admin);
        Ok(())
    }

    pub fn certify(env: &Env, user: Address, hash: String, timestamp: u64) -> Result<(), Error> {
        // Require authentication from the user
        user.require_auth();
        
        // Store the hash with timestamp
        let key = symbol_short!("certify");
        let value = (hash.clone(), timestamp);
        env.storage().persistent().set(&key, &value);
        
        // Emit event
        env.events().publish((symbol_short!("certify"),), (user, hash, timestamp));
        
        Ok(())
    }

    pub fn verify(env: &Env, hash: String) -> Option<u64> {
        let key = symbol_short!("cert");
        let stored: (String, u64) = env.storage().persistent().get(&key)?;
        
        if stored.0 == hash {
            Some(stored.1)
        } else {
            None
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_certify_and_verify() {
        let env = Env::default();
        let contract = Certify;
        
        let user = Address::generate(&env);
        let hash = String::from_str(&env, "abc123");
        let timestamp = 1234567890;
        
        // Mock authentication for testing
        env.mock_all_auths();
        
        // Test certification
        contract.certify(&env, user, hash.clone(), timestamp).unwrap();
        
        // Test verification
        let verified_timestamp = contract.verify(&env, hash).unwrap();
        assert_eq!(verified_timestamp, timestamp);
        
        // Test verification with wrong hash
        let wrong_hash = String::from_str(&env, "wrong");
        assert_eq!(contract.verify(&env, wrong_hash), None);
    }
} 